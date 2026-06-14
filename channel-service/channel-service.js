import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${BACKEND_URL}/api/webhook/receipt`;

class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(msg, delayMs = 0) {
    const executeAt = Date.now() + delayMs;
    this.queue.push({ ...msg, executeAt, attempts: msg.attempts || 0 });
    // Sort so the earliest executeAt is at index 0
    this.queue.sort((a, b) => a.executeAt - b.executeAt);
    
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const nextItem = this.queue[0];

      if (nextItem.executeAt <= now) {
        // Time to process
        const item = this.queue.shift();
        await this.handleMessage(item);
      } else {
        // Wait until it's time for the next item, or check again in 1s
        const waitTime = Math.min(nextItem.executeAt - now, 1000);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }

    this.processing = false;
  }

  async handleMessage(msg) {
    const statuses = ['Delivered', 'Failed', 'Clicked'];
    // Weighted probabilities: 40% Delivered, 42% Clicked (60% * 70%), 18% Failed
    const randomStatus = Math.random() < 0.4 ? 'Delivered' : (Math.random() < 0.7 ? 'Clicked' : 'Failed');

    try {
      await axios.post(WEBHOOK_URL, {
        log_id: msg._id,
        status: randomStatus
      });
      console.log(`[Success] Webhook sent for msg ${msg._id} -> ${randomStatus}`);
    } catch (err) {
      msg.attempts++;
      console.error(`[Error] Webhook failed for msg ${msg._id} (Attempt ${msg.attempts}): ${err.message}`);
      
      if (msg.attempts < 5) {
        // Exponential backoff: 2s, 4s, 8s, 16s
        const backoff = Math.pow(2, msg.attempts) * 1000;
        console.log(`[Retry] Queuing msg ${msg._id} to retry in ${backoff}ms`);
        this.enqueue(msg, backoff);
      } else {
        console.error(`[Dropped] Max retries reached for msg ${msg._id}. Dropping from queue.`);
      }
    }
  }
}

const queue = new MessageQueue();

app.post('/send', (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Acknowledge receipt of the batch immediately
  res.json({ success: true, count: messages.length });

  // Queue each message with a simulated random delivery delay (1 to 5 seconds)
  messages.forEach(msg => {
    const initialDelay = Math.floor(Math.random() * 4000) + 1000;
    queue.enqueue(msg, initialDelay);
  });
});

app.listen(PORT, () => console.log(`Robust Channel Service (with Queue) listening on port ${PORT}`));
