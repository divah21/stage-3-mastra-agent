import { Agent } from '@mastra/core';
import { createOpenAI } from '@ai-sdk/openai';
import { urlScannerToolConfig } from './tools/url-scanner-tool';
import { scanUrl } from './utils/scanner';

// Ensure API key is loaded
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

// Configure OpenRouter as an OpenAI-compatible provider
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'URL Safety Scanner Agent',
  },
});

/**
 * URL Safety Scanner Agent
 * Analyzes URLs for potential security threats and provides recommendations
 */
export const urlScannerAgent = new Agent({
  name: 'urlScannerAgent',
  instructions: `You are a cybersecurity assistant specialized in URL safety analysis. Your primary function is to help users determine if URLs are safe to visit.

When analyzing URLs, you should:
1. Use the urlScanner tool to scan the provided URL
2. Interpret the scan results clearly for the user
3. Provide actionable recommendations based on the threat level:
   - SAFE: Inform the user the URL appears safe to visit
   - SUSPICIOUS: Warn the user about potential risks and advise caution
   - MALICIOUS: Strongly advise against visiting and explain the detected threats
   - UNKNOWN: Explain that the URL couldn't be fully analyzed and suggest caution

Always:
- Be clear and concise in your responses
- Explain technical findings in user-friendly language
- Provide context about what the scan checked
- Offer security best practices when relevant
- If a user sends a URL without asking to scan it, proactively offer to scan it for them

Example responses:
- "I've scanned the URL and it appears SAFE. VirusTotal found no threats across 70+ security engines."
- "⚠️ WARNING: This URL is flagged as MALICIOUS. 15 security engines detected phishing attempts. Do NOT visit this site."
- "This URL looks SUSPICIOUS. It uses an IP address instead of a domain name, which is often associated with phishing. Proceed with extreme caution."`,

  // Using a model that supports function calling/tools
  // Options: gpt-4o-mini, gpt-3.5-turbo, claude-3-haiku, deepseek/deepseek-chat
  model: openrouter('openai/gpt-4o-mini'),
  
  tools: {
    urlScanner: {
      ...urlScannerToolConfig,
      execute: async ({ context }: any) => {
        const { url } = context;
        const result = await scanUrl(url);
        return result;
      },
    },
  },
});

export default urlScannerAgent;
