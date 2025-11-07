import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { urlScannerAgent } from './agent';
import { urlScanCache } from './utils/cache';
import { scanUrl } from './utils/scanner';

function extractUrl(text: string): string | null {
  // First try to match full URLs with protocol
  let match = text.match(/https?:\/\/[^\s)]+/i);
  if (match) return match[0];
  
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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

// A2A endpoint for Telex.im integration (JSON-RPC 2.0 compliant)
app.post('/a2a/agent/urlScanner', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    console.log('[A2A] Request received at:', new Date().toISOString());
    console.log('[A2A] Request body:', JSON.stringify(req.body, null, 2));

    // Parse JSON-RPC 2.0 request
    const { jsonrpc, id: requestId, method, params } = req.body;

    // Validate JSON-RPC 2.0 format
    if (jsonrpc !== '2.0' || !requestId) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: requestId || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
        }
      });
    }

    // Extract message from params
    const { message, contextId, taskId } = params || {};
    
    let userMessage = '';
    let messageId = '';
    let userTaskId = taskId || `task-${Date.now()}`;
    
    // Handle A2A message format
    if (message && message.parts) {
      userMessage = message.parts.map((part: any) => {
        if (part.kind === 'text') return part.text;
        if (part.kind === 'data') return JSON.stringify(part.data);
        return '';
      }).join('\n');
      messageId = message.messageId || `msg-${Date.now()}`;
      userTaskId = message.taskId || userTaskId;
    }

    if (!userMessage) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32602,
          message: 'No message content provided'
        }
      });
    }

    const url = extractUrl(userMessage);
    let responseText: string;
    
    if (url) {
      const result = await scanUrl(url);
      
      // Format concise response
      if (result.threatLevel === 'malicious') {
        responseText = `🚨 DANGER: ${result.url} is MALICIOUS! Do not visit this site. ${result.details}`;
      } else if (result.threatLevel === 'suspicious') {
        responseText = `⚠️ WARNING: ${result.url} appears SUSPICIOUS. ${result.details}`;
      } else if (result.threatLevel === 'safe') {
        responseText = `✅ SAFE: ${result.url} appears safe to visit.`;
      } else {
        responseText = `❓ UNKNOWN: Could not determine safety of ${result.url}. Proceed with caution.`;
      }
    } else {
      responseText = 'Please provide a valid URL to scan (e.g., https://example.com or google.com).';
    }

    const responseMessageId = `msg-${Date.now()}`;
    const responseTaskId = userTaskId;
    const responseContextId = contextId || `ctx-${Date.now()}`;

    // Build A2A-compliant response (JSON-RPC 2.0)
    const a2aResponse = {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        id: responseTaskId,
        contextId: responseContextId,
        status: {
          state: 'completed',
          timestamp: new Date().toISOString(),
          message: {
            messageId: responseMessageId,
            role: 'agent',
            parts: [
              {
                kind: 'text',
                text: responseText
              }
            ],
            kind: 'message'
          }
        },
        artifacts: [
          {
            artifactId: `artifact-${Date.now()}`,
            name: 'urlScannerResponse',
            parts: [
              {
                kind: 'text',
                text: responseText
              }
            ]
          }
        ],
        history: [
          {
            kind: 'message',
            role: 'user',
            parts: [
              {
                kind: 'text',
                text: userMessage
              }
            ],
            messageId: messageId,
            taskId: responseTaskId
          },
          {
            kind: 'message',
            role: 'agent',
            parts: [
              {
                kind: 'text',
                text: responseText
              }
            ],
            messageId: responseMessageId,
            taskId: responseTaskId
          }
        ],
        kind: 'task'
      }
    };

    const duration = Date.now() - startTime;

    return res.status(200).json(a2aResponse);
  } catch (error) {
    console.error('[A2A] Error:', error);
    
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: { details: error instanceof Error ? error.message : 'Unknown error' }
      }
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
 

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY not set. Agent will not work properly.');
  }
  if (!process.env.VIRUSTOTAL_API_KEY) {
    console.warn('ℹ️  INFO: VIRUSTOTAL_API_KEY not set. Using heuristic scanning only.');
  }
});

export default app;
