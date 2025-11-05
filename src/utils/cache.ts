import NodeCache from 'node-cache';
import crypto from 'crypto';

interface CachedScanResult {
  url: string;
  isSafe: boolean;
  threatLevel: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  scanSource: 'cache' | 'virustotal' | 'heuristic';
  details: string;
  positives?: number;
  total?: number;
  scanDate: string;
}

/**
 * Simple in-memory cache for URL scan results
 * Uses URL hash as key to store results efficiently
 */
export class UrlScanCache {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 3600) {
    // Initialize cache with TTL (time-to-live)
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  /**
   * Generate a hash for the URL to use as cache key
   */
  private getUrlHash(url: string): string {
    return crypto.createHash('sha256').update(url.toLowerCase().trim()).digest('hex');
  }

  /**
   * Get cached scan result for a URL
   */
  get(url: string): CachedScanResult | undefined {
    const hash = this.getUrlHash(url);
    return this.cache.get<CachedScanResult>(hash);
  }

  /**
   * Store scan result in cache
   */
  set(url: string, result: CachedScanResult): boolean {
    const hash = this.getUrlHash(url);
    return this.cache.set(hash, result);
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const urlScanCache = new UrlScanCache(
  parseInt(process.env.CACHE_TTL || '3600')
);
