const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory slot storage: { 'YYYY-MM-DD': { 'HH:mm': true/false } }
const slots = {};

// Helper: generate all Sunday slots (default available)
function generateDefaultSlots() {
  const result = {};
  for (let i = 0; i < 32; i++) {
    const hour = Math.floor(i / 4) + 10;
    const minute = (i % 4) * 15;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    result[time] = true; // true = available
  }
  return result;
}

// GET /api/slots?date=YYYY-MM-DD
app.get('/api/slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date' });
  if (!slots[date]) {
    slots[date] = generateDefaultSlots();
  }
  res.json(slots[date]);
});

// POST /api/slots { date, time, available }
app.post('/api/slots', (req, res) => {
  const { date, time, available } = req.body;
  if (!date || !time || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }
  if (!slots[date]) {
    slots[date] = generateDefaultSlots();
  }
  slots[date][time] = available;
  res.json({ success: true, slots: slots[date] });
});

// Serve React build static files
app.use(express.static(path.join(__dirname, 'calendar-app', 'build')));

// Handle all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'calendar-app', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Slot backend running on http://localhost:${PORT}`);
}); 