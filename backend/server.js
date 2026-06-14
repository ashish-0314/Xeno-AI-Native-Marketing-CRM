import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Mistral } from '@mistralai/mistralai';
import { Customer, CommunicationLog, Order } from './models.js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:4000/send';

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// POST /api/customers
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, total_spent } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const newCustomer = new Customer({ name, email, phone, total_spent });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/customers/:id
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, email, phone, total_spent } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, total_spent },
      { new: true }
    );
    if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/customers/:id
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/segment
app.post('/api/ai/segment', async (req, res) => {
  try {
    const { prompt, channel } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const selectedChannel = channel || 'Email';

    const systemPrompt = `You are a helpful CRM assistant. The user wants to segment customers based on a text description and draft marketing messages for an A/B test.
    The communication channel is: ${selectedChannel}.
    The customer schema is: { name: String, email: String, phone: String, total_spent: Number, last_purchase_date: Date }.
    
    CRITICAL INSTRUCTION: All monetary values in the messages MUST be in Indian Rupees (₹) (e.g., "₹500"). Do NOT use dollars ($).
    
    You must return a strictly valid JSON object with exactly three keys:
    1. "mongo_query": A valid MongoDB query object (or aggregation pipeline array) to filter the Customer schema. This will be parsed with JSON.parse(). Keys MUST be double-quoted. DO NOT use JavaScript syntax like \`new Date()\`. Use standard string values for dates if needed. If the user asks for "top 10" or "most", you MAY return an array with $sort and $limit operators (e.g. [{"$sort": {"total_spent": -1}}, {"$limit": 10}]).
    2. "draft_message_A": The first variation of the marketing message. Tailor it specifically for ${selectedChannel}.
    3. "draft_message_B": The second variation of the marketing message (A/B testing variant). Try a different tone or offer, but keep it suited for ${selectedChannel}.
    `;

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    let aiResultStr = chatResponse.choices[0].message.content;
    const firstBrace = aiResultStr.indexOf('{');
    const lastBrace = aiResultStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiResultStr = aiResultStr.substring(firstBrace, lastBrace + 1);
    }
    const aiResult = JSON.parse(aiResultStr);
    const { draft_message_A, draft_message_B } = aiResult;
    let mongo_query = aiResult.mongo_query || {};
    
    // Sanitize mongo_query to extract $sort and $limit so Mongoose doesn't crash
    let filter = {};
    let sortParams = null;
    let limitParams = null;

    if (Array.isArray(mongo_query)) {
      mongo_query.forEach(stage => {
        if (stage.$match) filter = { ...filter, ...stage.$match };
        if (stage.$sort) sortParams = stage.$sort;
        if (stage.$limit) limitParams = stage.$limit;
      });
    } else {
      filter = { ...mongo_query };
      sortParams = filter.$sort;
      limitParams = filter.$limit;
      delete filter.$sort;
      delete filter.$limit;
      delete filter.$match;
    }
    
    let customers = [];
    try {
      let query = Customer.find(filter);
      if (sortParams) query = query.sort(sortParams);
      if (limitParams) query = query.limit(limitParams);
      customers = await query;
    } catch (dbError) {
      console.error("Invalid mongo query generated:", dbError);
      return res.status(400).json({ error: 'AI generated an invalid database query.', details: aiResult });
    }

    res.json({ customers, draft_message_A, draft_message_B, mongo_query: filter, channel: selectedChannel });
  } catch (error) {
    console.error('AI Segment Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/rewrite
app.post('/api/ai/rewrite', async (req, res) => {
  try {
    const { prompt, channel } = req.body;
    
    const systemPrompt = `You are a helpful CRM assistant. The user wants to rewrite a marketing message for an A/B test based on this initial segment description: "${prompt}".
    The communication channel is: ${channel}.
    
    CRITICAL INSTRUCTION: All monetary values MUST be in Indian Rupees (₹).
    
    Return a strictly valid JSON object with exactly one key:
    1. "draft_message": The newly rewritten marketing message.
    `;

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: 'json_object' }
    });

    let aiResultStr = chatResponse.choices[0].message.content;
    const firstBrace = aiResultStr.indexOf('{');
    const lastBrace = aiResultStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiResultStr = aiResultStr.substring(firstBrace, lastBrace + 1);
    }

    res.json(JSON.parse(aiResultStr));
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/campaign/send
app.post('/api/campaign/send', async (req, res) => {
  try {
    const { customerIds, messageA, messageB, channel, prompt } = req.body;
    const selectedChannel = channel || 'Email';
    
    // Fetch all customers to get their names for personalization
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const customerMap = customers.reduce((acc, c) => {
      acc[c._id.toString()] = c.name;
      return acc;
    }, {});

    // Create a single campaign_id for this batch
    const campaign_id = new mongoose.Types.ObjectId().toString();

    const logs = [];
    for (let i = 0; i < customerIds.length; i++) {
      const customerId = customerIds[i];
      const variant = i % 2 === 0 ? 'A' : 'B';
      const baseMessage = variant === 'A' ? messageA : messageB;
      
      const customerName = customerMap[customerId.toString()] || 'Valued Customer';
      
      // Replace {name}, [name], etc. with actual customer name
      const personalizedMessage = baseMessage.replace(/\{name\}|\[name\]|\{first_name\}/gi, customerName.split(' ')[0]);

      const log = new CommunicationLog({ 
        customer_id: customerId, 
        message: personalizedMessage, 
        campaign_id,
        prompt: prompt || 'Custom Campaign',
        variant,
        channel: selectedChannel,
        status: 'Pending' 
      });
      await log.save();
      logs.push(log);
    }

    try {
      await axios.post(CHANNEL_SERVICE_URL, {
        messages: logs
      });
      res.json({ message: 'Campaign dispatched to channel service', logs });
    } catch (err) {
      console.error('Failed to communicate with channel service:', err.message);
      res.status(503).json({ error: 'Channel service unavailable' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/webhook/receipt
app.post('/api/webhook/receipt', async (req, res) => {
  try {
    const { log_id, status } = req.body;
    if (!log_id || !status) return res.status(400).json({ error: 'log_id and status are required' });

    const log = await CommunicationLog.findByIdAndUpdate(log_id, { status }, { new: true });
    
    // Simulate Order Attribution on Click
    if (status === 'Clicked' && log) {
      // 40% chance of placing an order when clicked (reduced to halve overall conversion rate)
      if (Math.random() < 0.4) {
        const orderAmount = Math.floor(Math.random() * 4000) + 500; // Random amount between 500 and 4500
        const newOrder = new Order({
          customer_id: log.customer_id,
          campaign_id: log.campaign_id,
          amount: orderAmount,
          item_name: 'Special Offer Purchase'
        });
        await newOrder.save();

        // Update customer's total spent
        await Customer.findByIdAndUpdate(log.customer_id, {
          $inc: { total_spent: orderAmount }
        });
        console.log(`[Attribution] Order created for customer ${log.customer_id} via campaign ${log.campaign_id} for ₹${orderAmount}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalPending = await CommunicationLog.countDocuments({ status: 'Pending' });
    const totalDelivered = await CommunicationLog.countDocuments({ status: 'Delivered' });
    const totalFailed = await CommunicationLog.countDocuments({ status: 'Failed' });
    const totalClicked = await CommunicationLog.countDocuments({ status: 'Clicked' });

    res.json({
      Pending: totalPending,
      Delivered: totalDelivered,
      Failed: totalFailed,
      Clicked: totalClicked
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CommunicationLog.find()
      .populate('customer_id', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(200);
      
    const orders = await Order.find();
    
    res.json({ logs, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Main Backend listening on port ${PORT}`));
