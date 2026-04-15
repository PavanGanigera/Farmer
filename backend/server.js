import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();

// ── ES Module __dirname fix ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // Allow all origins for the college project demo to prevent asset blocking
  credentials: true,
}));

app.use(express.json());

// ── MongoDB Atlas Connection ──────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI ||
  'mongodb+srv://dmjaiton_db_user:iHqrxoKfRztNie6e@cluster0.wbpmbc1.mongodb.net/FarmersDB?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (smartfarmer db)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/data', apiRoutes);

// ── Serve React Frontend (Production) ────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));

// Catch-all: send index.html for any unknown route (React Router support)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Smart Farmer Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
