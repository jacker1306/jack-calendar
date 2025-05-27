const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

let db, slotsCollection;

// Kết nối MongoDB khi server khởi động
MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db('calendar');
    slotsCollection = db.collection('slots');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));

// GET /api/slots?date=YYYY-MM-DD
app.get('/api/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date' });
  let doc = await slotsCollection.findOne({ date });
  if (!doc) {
    // Tạo mặc định nếu chưa có
    const defaultSlots = {};
    for (let i = 0; i < 32; i++) {
      const hour = Math.floor(i / 4) + 10;
      const minute = (i % 4) * 15;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      defaultSlots[time] = true;
    }
    await slotsCollection.insertOne({ date, slots: defaultSlots });
    return res.json(defaultSlots);
  }
  res.json(doc.slots);
});

// POST /api/slots { date, time, available }
app.post('/api/slots', async (req, res) => {
  const { date, time, available } = req.body;
  if (!date || !time || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }
  await slotsCollection.updateOne(
    { date },
    { $set: { [`slots.${time}`]: available } },
    { upsert: true }
  );
  const updated = await slotsCollection.findOne({ date });
  res.json({ success: true, slots: updated.slots });
}); 