import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing agent
dotenv.config();

import { urlScannerAgent } from './agent';
import { urlScanCache } from './utils/cache';
import { scanUrl } from './utils/scanner';

// Helper: extract first URL from a text string
function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const stats = urlScanCache.getStats();
  res.json({
    status: 'healthy',
    service: 'URL Safety Scanner Agent',
    cache: {
      hits: stats.hits,
      misses: stats.misses,
      keys: stats.keys,
    },
    timestamp: new Date().toISOString(),
  });
});

// A2A endpoint for Telex.im integration
app.post('/a2a/agent/urlScanner', async (req: Request, res: Response) => {
  try {
    console.log('Received A2A request:', JSON.stringify(req.body, null, 2));

    const { messages, resourceId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request format. Expected messages array.',
      });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content) {
      return res.status(400).json({
        error: 'No message content provided.',
      });
    }

    // Generate response using Mastra agent (with graceful fallback)
    let contentText: string | undefined;
    try {
      const response = await urlScannerAgent.generate(lastMessage.content, { resourceId });
      contentText = response.text;
    } catch (genErr) {
      console.warn('Agent generation failed, falling back to direct scan:', genErr instanceof Error ? genErr.message : genErr);
    }

    // Fallback: if model didn't return text, try direct scan
    if (!contentText) {
      const url = extractUrl(String(lastMessage.content));
      if (url) {
        const result = await scanUrl(url);
        contentText = `Scan result for ${result.url}: ${result.threatLevel.toUpperCase()}\n` +
          `- Safe: ${result.isSafe ? 'Yes' : 'No'}\n` +
          `- Source: ${result.scanSource}\n` +
          `- Details: ${result.details}`;
      } else {
        contentText = 'Please provide a URL to scan (e.g., https://example.com).';
      }
    }

    // Format response according to A2A protocol
    const a2aResponse = {
      messages: [
        {
          role: 'assistant',
          content: contentText,
        },
      ],
    };

    console.log('Sending A2A response:', JSON.stringify(a2aResponse, null, 2));

    res.json(a2aResponse);
  } catch (error) {
    console.error('Error processing A2A request:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// Test endpoint for local development
app.post('/test', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    const response = await urlScannerAgent.generate(message);

    // Extract text or fallback to direct scan
    let messageText = response.text;

    if (!messageText) {
      const url = extractUrl(String(message));
      if (url) {
        const result = await scanUrl(url);
        messageText = `Scan result for ${result.url}: ${result.threatLevel.toUpperCase()}\n` +
          `- Safe: ${result.isSafe ? 'Yes' : 'No'}\n` +
          `- Source: ${result.scanSource}\n` +
          `- Details: ${result.details}`;
      } else {
        messageText = 'Please provide a URL to scan (e.g., https://example.com).';
      }
    }

    res.json({
      message: messageText,
      usage: {
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
      },
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Safety Scanner Agent running on port ${PORT}`);
  console.log(`📍 A2A endpoint: http://localhost:${PORT}/a2a/agent/urlScanner`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  
  // Check for required environment variables
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY not set. Agent will not work properly.');
  }
  if (!process.env.VIRUSTOTAL_API_KEY) {
    console.warn('ℹ️  INFO: VIRUSTOTAL_API_KEY not set. Using heuristic scanning only.');
  }
});

export default app;
