import { z } from 'zod';

/**
 * URL Scanner Tool Configuration
 * This tool checks if a URL is safe or malicious using threat intelligence APIs
 */
export const urlScannerToolConfig = {
  id: 'url-scanner-tool',
  description: 'Scans a URL to check if it is safe or potentially malicious. Returns safety status, threat information, and recommendations.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to scan for threats'),
  }),
  outputSchema: z.object({
    url: z.string(),
    isSafe: z.boolean(),
    threatLevel: z.enum(['safe', 'suspicious', 'malicious', 'unknown']),
    scanSource: z.enum(['cache', 'virustotal', 'heuristic']),
    details: z.string(),
    positives: z.number().optional(),
    total: z.number().optional(),
    scanDate: z.string(),
  }),
};

export type UrlScanResult = z.infer<typeof urlScannerToolConfig.outputSchema>;
