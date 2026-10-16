const express = require('express');
const router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

// Proxy channel registration to FastAPI recommendation/ingestion engine
router.post('/register', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(`${AI_ENGINE_URL}/api/channels/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error proxying channel registration:', err.message);
    return res.status(502).json({
      success: false,
      message: `Channel registration engine unavailable: ${err.message}`
    });
  }
});

// Proxy my-registration status check to FastAPI
router.get('/my-registration', async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(`${AI_ENGINE_URL}/api/channels/my-registration`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error fetching channel registration status:', err.message);
    return res.status(502).json({
      success: false,
      message: `Channel status engine unavailable: ${err.message}`
    });
  }
});

// Proxy retry ingestion to FastAPI
router.post('/retry-ingestion', async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const channelId = req.query.channel_id || req.body.channel_id;
    const response = await fetch(`${AI_ENGINE_URL}/api/channels/retry-ingestion?channel_id=${encodeURIComponent(channelId)}`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error retrying channel ingestion:', err.message);
    return res.status(502).json({
      success: false,
      message: `Channel retry engine unavailable: ${err.message}`
    });
  }
});

// Proxy channel preview (auto-fetch YouTube details & thumbnail)
router.get('/preview', async (req, res) => {
  try {
    const input = req.query.input || req.query.channel || '';
    if (!input) {
      return res.status(400).json({ success: false, message: 'Channel input is required' });
    }

    const response = await fetch(`${AI_ENGINE_URL}/api/channels/preview?input=${encodeURIComponent(input)}`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error fetching channel preview:', err.message);
    return res.status(502).json({
      success: false,
      message: `Channel preview unavailable: ${err.message}`
    });
  }
});

module.exports = router;
