import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  total_spent: { type: Number, default: 0 },
  last_purchase_date: { type: Date }
}, { timestamps: true });

const communicationLogSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  campaign_id: { type: String, required: true },
  prompt: { type: String },
  message: { type: String, required: true },
  variant: { type: String, enum: ['A', 'B'], required: true },
  channel: { type: String, enum: ['Email', 'SMS', 'WhatsApp'], default: 'Email' },
  status: { type: String, enum: ['Pending', 'Delivered', 'Failed', 'Clicked'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  campaign_id: { type: String }, // Optional: If the order was driven by a specific campaign
  amount: { type: Number, required: true },
  item_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Customer = mongoose.model('Customer', customerSchema);
export const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);
export const Order = mongoose.model('Order', orderSchema);
