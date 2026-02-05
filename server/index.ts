
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiController } from './controllers/aiController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'CareBridge Hub API is online', timestamp: new Date().toISOString() });
});

// AI Routes
app.post('/api/care-plans/generate', aiController.generatePlan);
app.post('/api/staff/verify', aiController.verifyStaff);

// Staff Routes (Stubs)
app.get('/api/staff', (req, res) => {
  res.json({ message: 'Staff list endpoint' });
});

app.post('/api/staff/onboard', (req, res) => {
  // Logic for onboarding
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 CareBridge Hub API running on http://localhost:${PORT}`);
});
