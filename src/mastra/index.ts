import { Mastra } from '@mastra/core';
import { urlScannerAgent } from '../agent';

/**
 * Mastra configuration for deployment
 * This file is required by Mastra's deployment system
 */
export const mastra = new Mastra({
  agents: {
    urlScanner: urlScannerAgent,
  },
});

export default mastra;
