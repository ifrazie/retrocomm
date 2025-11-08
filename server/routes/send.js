import express from 'express';
import { retryWithBackoff } from '../utils/retry.js';

const router = express.Router();

/**
 * POST /api/send
 * Forwards messages to external webhook URLs with retry logic
 */
router.post('/send', async (req, res) => {
  const { webhookUrl, message, sender, metadata } = req.body;

  // Validate required fields
  if (!webhookUrl || !message) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: ['webhookUrl and message are required']
    });
  }

  // Validate webhook URL format
  try {
    new URL(webhookUrl);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: ['webhookUrl must be a valid URL']
    });
  }

  // Prepare payload
  const payload = {
    message,
    sender: sender || undefined,
    timestamp: Date.now(),
    metadata: metadata || undefined
  };

  // Function to send webhook
  const sendWebhook = async () => {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return response;
  };

  // Attempt to send with retry logic
  try {
    console.log(`Sending message to ${webhookUrl}`);
    await retryWithBackoff(sendWebhook, 3, 1000);
    
    console.log(`Successfully sent message to ${webhookUrl}`);
    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error(`Failed to send message to ${webhookUrl} after 3 attempts:`, error.message);
    res.status(500).json({
      error: 'Failed to deliver message',
      details: error.message
    });
  }
});

export default router;
