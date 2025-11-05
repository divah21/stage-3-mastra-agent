import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing agent
dotenv.config();

import { urlScannerAgent } from './agent';
import { urlScanCache } from './utils/cache';
import { scanUrl } from './utils/scanner';

// Helper: extract first URL from a text string and ensure it has a protocol
function extractUrl(text: string): string | null {
  // First try to match full URLs with protocol
  let match = text.match(/https?:\/\/[^\s)]+/i);
  if (match) return match[0];
  
  // If no protocol found, try to match domain-like patterns
  // Matches: domain.com, sub.domain.com, domain.co.uk, etc.
  match = text.match(/\b([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})\b/i);
  if (match) {
    // Add https:// protocol by default
    return `https://${match[0]}`;
  }
  
  return null;
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

    const { messages, message, text, content, resourceId } = req.body;

    // Handle multiple input formats for better compatibility
    let userMessage: string | undefined;
    
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Standard A2A format with messages array
      const lastMessage = messages[messages.length - 1];
      userMessage = lastMessage?.content || lastMessage?.text;
    } else if (message) {
      // Simple message field
      userMessage = message;
    } else if (text) {
      // Text field
      userMessage = text;
    } else if (content) {
      // Content field
      userMessage = content;
    }

    if (!userMessage) {
      return res.status(400).json({
        error: 'No message content provided. Expected messages array or message/text/content field.',
      });
    }

    // For Telex, use direct scanning for speed and reliability
    // Extract URL and scan directly (avoids LLM latency/timeout issues)
    const url = extractUrl(String(userMessage));
    let contentText: string;
    
    if (url) {
      const result = await scanUrl(url);
      
      // Format response based on threat level
      if (result.threatLevel === 'malicious') {
        contentText = `🚨 DANGER: ${result.url}\n\n` +
          `This URL is MALICIOUS and should NOT be visited!\n\n` +
          `Threat Level: ${result.threatLevel.toUpperCase()}\n` +
          `Source: ${result.scanSource}\n` +
          `Details: ${result.details}\n\n` +
          `⚠️ Do not click this link or enter any personal information.`;
      } else if (result.threatLevel === 'suspicious') {
        contentText = `⚠️ WARNING: ${result.url}\n\n` +
          `This URL appears SUSPICIOUS. Proceed with extreme caution.\n\n` +
          `Threat Level: ${result.threatLevel.toUpperCase()}\n` +
          `Source: ${result.scanSource}\n` +
          `Details: ${result.details}\n\n` +
          `💡 Consider avoiding this link or verifying it through other means.`;
      } else if (result.threatLevel === 'safe') {
        contentText = `✅ SAFE: ${result.url}\n\n` +
          `This URL appears safe to visit.\n\n` +
          `Threat Level: ${result.threatLevel.toUpperCase()}\n` +
          `Source: ${result.scanSource}\n` +
          `Details: ${result.details}`;
      } else {
        contentText = `❓ UNKNOWN: ${result.url}\n\n` +
          `Could not determine safety status.\n\n` +
          `Source: ${result.scanSource}\n` +
          `Details: ${result.details}\n\n` +
          `⚠️ Proceed with caution when visiting unknown URLs.`;
      }
    } else {
      contentText = 'Please provide a valid URL to scan (e.g., https://example.com or google.com).';
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

    // Add timeout to prevent hanging
    let messageText: string | undefined;
    try {
      const response = await Promise.race([
        urlScannerAgent.generate(message),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Agent timeout')), 3000)
        )
      ]);
      messageText = response.text;
    } catch (genErr) {
      console.warn('Agent generation timed out, using direct scan:', genErr instanceof Error ? genErr.message : genErr);
    }

    // Extract text or fallback to direct scan

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
        inputTokens: 0,
        outputTokens: 0,
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
