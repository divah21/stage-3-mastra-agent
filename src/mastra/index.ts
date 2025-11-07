import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core';
import { createOpenAI } from '@ai-sdk/openai';

// Define the agent inline to avoid import issues
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'https://stage-3-mastra-agent-production.up.railway.app',
    'X-Title': 'URL Safety Scanner Agent',
  },
});

const urlScannerAgent = new Agent({
  name: 'urlScannerAgent',
  instructions: `You are a cybersecurity assistant specialized in URL safety analysis. Analyze URLs for security threats and provide clear safety recommendations.`,
  model: openrouter('openai/gpt-4o-mini'),
  tools: {},
});

export const mastra = new Mastra({
  agents: {
    urlScanner: urlScannerAgent,
  },
});

export default mastra;
