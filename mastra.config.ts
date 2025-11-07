import { createConfig } from '@mastra/core';
import { mastra } from './src/mastra';

export default createConfig({
  name: 'url-safety-scanner',
  agents: mastra.agents,
});
