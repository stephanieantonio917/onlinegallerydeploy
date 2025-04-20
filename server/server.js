import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🧪 Startup trace
console.log("🚀 Starting server.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧩 Serve React frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'client-dist')));

// 🧪 Health check route
app.get('/', (req, res) => {
  console.log("🌐 Root route hit");
  res.send('🎨 Online Gallery API is running without DB!');
});

// ❌ Temporarily comment out all DB routes to test clean boot
// import pool from './db.js';
// app.get('/paintings', async (req, res) => { ... });
// app.post('/orders', async (req, res) => { ... });

app.get('*', (req, res) => {
  console.log("🧭 Fallback route hit");
  res.sendFile(path.join(__dirname, 'client-dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
