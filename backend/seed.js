import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer, CommunicationLog } from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const seedCustomers = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '98765-00101', total_spent: 1500, last_purchase_date: new Date('2023-10-01') },
  { name: 'Diya Patel', email: 'diya.patel@example.com', phone: '98765-00102', total_spent: 300, last_purchase_date: new Date('2023-11-15') },
  { name: 'Vihaan Singh', email: 'vihaan.singh@example.com', phone: '98765-00103', total_spent: 4500, last_purchase_date: new Date('2023-12-05') },
  { name: 'Ananya Gupta', email: 'ananya.gupta@example.com', phone: '98765-00104', total_spent: 200, last_purchase_date: new Date('2024-01-10') },
  { name: 'Rohan Desai', email: 'rohan.desai@example.com', phone: '98765-00105', total_spent: 800, last_purchase_date: new Date('2024-02-20') },
  // Adding more realistic retail customers
];

// Generate 45 more random customers
const firstNames = ['Arjun', 'Ravi', 'Karan', 'Vikram', 'Raj', 'Siddharth', 'Aditya', 'Amit', 'Neha', 'Pooja', 'Sneha', 'Kavya', 'Priya', 'Shruti', 'Swati', 'Meera', 'Riya', 'Ishaan', 'Kabir', 'Ayaan', 'Kriti'];
const lastNames = ['Sharma', 'Verma', 'Singh', 'Patel', 'Kumar', 'Gupta', 'Reddy', 'Joshi', 'Chopra', 'Malhotra', 'Bansal', 'Agarwal', 'Iyer', 'Menon', 'Nair', 'Das', 'Sen', 'Mukherjee', 'Rao', 'Bhat'];

for (let i = 0; i < 45; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
  const phone = `+91 98765${Math.floor(10000 + Math.random() * 90000)}`;
  const total_spent = Math.floor(Math.random() * 5000);
  const last_purchase_date = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
  seedCustomers.push({ name: `${firstName} ${lastName}`, email, phone, total_spent, last_purchase_date });
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Customer.deleteMany({});
    await CommunicationLog.deleteMany({});

    console.log('Inserting sample data...');
    await Customer.insertMany(seedCustomers);
    console.log('Successfully seeded database with 50 customers.');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
