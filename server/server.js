import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;



app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve built frontend
app.use(express.static(path.join(__dirname, 'client-dist')));

// ----- ⬇ API ROUTES BEGIN ⬇ -----
const router = express.Router();

router.get('/', (req, res) => {
  res.send('🎨 Online Gallery API is running!');
});

router.get('/paintings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM paintings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch paintings' });
  }
});

router.get('/paintings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM paintings WHERE painting_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch painting' });
  }
});

router.put('/paintings/:id', async (req, res) => {
  const { id } = req.params;
  const { title, artist, price, image_url, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE paintings SET title=$1, artist=$2, price=$3, image_url=$4, status=$5 WHERE painting_id=$6 RETURNING *`,
      [title, artist, price, image_url, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update painting' });
  }
});

router.post('/paintings', async (req, res) => {
  const { title, artist, price, image_url, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO paintings (title, artist, price, image_url, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [title, artist, price, image_url, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create painting' });
  }
});

router.delete('/paintings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM paintings WHERE painting_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }
    res.json({ message: 'Painting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete painting' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { user_id, painting_ids } = req.body;
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, status, created_at) VALUES ($1, $2, now()) RETURNING order_id`,
      [user_id, 'processing']
    );
    const order_id = orderResult.rows[0].order_id;

    for (const painting_id of painting_ids) {
      await pool.query(
        `INSERT INTO order_items (order_id, painting_id, quantity) VALUES ($1, $2, 1)`,
        [order_id, painting_id]
      );
      await pool.query(
        `UPDATE paintings SET status = $1 WHERE painting_id = $2`,
        ['sold', painting_id]
      );
    }

    res.status(201).json({ message: 'Order placed successfully', order_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/orders/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const orders = await pool.query(
      `SELECT o.order_id, o.status, o.created_at, json_agg(json_build_object('title', p.title, 'artist', p.artist, 'price', p.price, 'status', p.status)) AS items
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN paintings p ON oi.painting_id = p.painting_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.created_at DESC`,
      [user_id]
    );
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const query = `
      SELECT o.order_id, o.status, o.created_at, u.full_name AS customer_name, u.email,
      json_agg(json_build_object('title', p.title, 'artist', p.artist, 'price', p.price, 'image_url', p.image_url, 'quantity', oi.quantity)) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN paintings p ON oi.painting_id = p.painting_id
      GROUP BY o.order_id, u.full_name, u.email, o.status, o.created_at
      ORDER BY o.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// Mount all API routes under /api
app.use('/api', router);

// Fallback for React Router (after all routes!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-dist', 'index.html'));
});

// Start the server (important for Azure!)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
