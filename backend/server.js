// ======================
// 🌟 HARMONYHEAL BACKEND
// ======================
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ========== CONFIG ==========
const ML_URL = process.env.ML_URL || 'http://127.0.0.1:5001/recommend';
const YT_API_KEY = process.env.YT_API_KEY || '';
const HISTORY_FILE = path.join(__dirname, 'history.txt'); // File to store logs

// ========== MUSIC RECOMMENDATION ==========
app.post('/api/music', async (req, res) => {
  try {
    const mood = req.body.mood || 'relax';

    // 1️⃣ Call ML service
    const mlResp = await axios.post(ML_URL, { mood });
    const rec = mlResp.data;

    // 2️⃣ Use YouTube search API
    const query = `${rec.track_name} ${rec.frequency}hz healing frequency`;
    const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoEmbeddable: true,
        key: YT_API_KEY,
        maxResults: 6
      }
    });

    // 3️⃣ Log history into text file
    const logEntry = `[${new Date().toLocaleString()}] Mood: ${rec.mood}, Frequency: ${rec.frequency}Hz, Track: ${rec.track_name}\n`;
    fs.appendFileSync(HISTORY_FILE, logEntry, 'utf8');

    // 4️⃣ Return response to frontend
    res.json({
      recommendation: rec,
      videos: ytRes.data.items
    });

  } catch (err) {
    console.error('❌ Error in /api/music:', err.response?.data || err.message || err);
    res.status(500).json({
      message: 'Server error',
      error: err.message || String(err)
    });
  }
});

// ========== ROUTE TO VIEW HISTORY ==========
app.get('/api/history', (req, res) => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return res.send('No history yet.');
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    res.type('text/plain').send(data);
  } catch (err) {
    res.status(500).send('Error reading history file.');
  }
});

// ========== ROOT TEST ==========
app.get('/', (req, res) => {
  res.send('🎵 HarmonyHeal backend running with history logging');
});

// ========== START SERVER ==========
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server listening on port ${port}`));
