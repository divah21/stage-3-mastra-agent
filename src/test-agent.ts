/**
 * Test script for URL Scanner Agent
 * Run with: npm run test-agent
 */
import { urlScannerAgent } from './agent';

async function testAgent() {
  console.log('🧪 Testing URL Scanner Agent...\n');

  const testUrls = [
    'https://www.google.com',
    'https://github.com',
    'http://192.168.1.1',
    'https://bit.ly/test123'
  ];

  for (const url of testUrls) {
    console.log(`\n📝 Testing: ${url}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await urlScannerAgent.generate(
        `Can you check if this URL is safe? ${url}`
      );
      
      console.log('✅ Response:', response.text);
      console.log('📊 Usage:', {
        input: response.usage?.inputTokens,
        output: response.usage?.outputTokens,
      });
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
}

// Run tests
testAgent().catch(console.error);
