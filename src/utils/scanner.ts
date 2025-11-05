import { urlScanCache } from './cache';
import { UrlScanResult } from '../tools/url-scanner-tool';

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout: number;
      };
      last_analysis_date: number;
    };
  };
}

/**
 * Scan a URL using VirusTotal API
 */
async function scanWithVirusTotal(url: string): Promise<UrlScanResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }

  try {
    // URL encode the target URL
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
    
    const response = await fetch(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      {
        headers: {
          'x-apikey': apiKey,
        },
      }
    );

    if (!response.ok) {
      // If URL not found, submit it for scanning
      if (response.status === 404) {
        return submitUrlToVirusTotal(url, apiKey);
      }
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data = await response.json() as VirusTotalResponse;
    const stats = data.data.attributes.last_analysis_stats;
    const totalScans = stats.harmless + stats.malicious + stats.suspicious + stats.undetected;
    const positives = stats.malicious + stats.suspicious;

    let threatLevel: UrlScanResult['threatLevel'] = 'safe';
    let isSafe = true;

    if (stats.malicious > 0) {
      threatLevel = 'malicious';
      isSafe = false;
    } else if (stats.suspicious > 0) {
      threatLevel = 'suspicious';
      isSafe = false;
    }

    return {
      url,
      isSafe,
      threatLevel,
      scanSource: 'virustotal',
      details: `VirusTotal scan: ${stats.malicious} malicious, ${stats.suspicious} suspicious, ${stats.harmless} harmless out of ${totalScans} engines`,
      positives,
      total: totalScans,
      scanDate: new Date(data.data.attributes.last_analysis_date * 1000).toISOString(),
    };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    throw error;
  }
}

/**
 * Submit a new URL to VirusTotal for scanning
 */
async function submitUrlToVirusTotal(url: string, apiKey: string): Promise<UrlScanResult> {
  const formData = new URLSearchParams();
  formData.append('url', url);

  const response = await fetch('https://www.virustotal.com/api/v3/urls', {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to submit URL: ${response.status}`);
  }

  // Return pending status since scan takes time
  return {
    url,
    isSafe: true,
    threatLevel: 'unknown',
    scanSource: 'virustotal',
    details: 'URL submitted to VirusTotal for scanning. Results will be available shortly.',
    scanDate: new Date().toISOString(),
  };
}

/**
 * Perform basic heuristic checks on URL
 */
function heuristicScan(url: string): UrlScanResult {
  const urlObj = new URL(url);
  const suspiciousPatterns = [
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address instead of domain
    /[a-z0-9]{20,}/, // Very long random strings
    /-pay/, /-login/, /-verify/, /-secure/, /-account/, // Common phishing terms
    /bit\.ly|tinyurl|short/, // URL shorteners
  ];

  let isSuspicious = false;
  const warnings: string[] = [];

  // Helper to compute Levenshtein distance (small strings, O(m*n) is fine here)
  const lev = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return dp[m][n];
  };

  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      isSuspicious = true;
      warnings.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }

  // Check if HTTPS
  if (urlObj.protocol !== 'https:') {
    warnings.push('Not using HTTPS protocol');
    isSuspicious = true;
  }

  // Check for common safe domains
  const safeDomains = ['google.com', 'github.com', 'microsoft.com', 'amazon.com', 'wikipedia.org'];
  const hostname = urlObj.hostname.toLowerCase();
  const isSafeDomain = safeDomains.some(domain => hostname.endsWith(domain));

  // Typosquatting detection against popular brands
  // Compare second-level label (sld) with known brand slds
  const getSld = (host: string) => {
    const parts = host.split('.');
    if (parts.length < 2) return host;
    return parts[parts.length - 2];
  };
  const sld = getSld(hostname);
  const brandSlds = safeDomains.map(getSld); // ['google','github','microsoft','amazon','wikipedia']
  for (const brand of brandSlds) {
    const distance = lev(sld, brand);
    if (distance === 1 && !isSafeDomain) {
      isSuspicious = true;
      warnings.push(`Possible typosquatting: domain '${sld}' is very similar to '${brand}'`);
      break;
    }
  }

  let threatLevel: UrlScanResult['threatLevel'] = 'safe';
  if (isSuspicious && !isSafeDomain) {
    threatLevel = 'suspicious';
  } else if (isSafeDomain) {
    threatLevel = 'safe';
  }

  return {
    url,
    isSafe: !isSuspicious || isSafeDomain,
    threatLevel,
    scanSource: 'heuristic',
    details: warnings.length > 0 
      ? `Heuristic analysis: ${warnings.join('; ')}` 
      : 'Basic heuristic checks passed. No obvious red flags detected.',
    scanDate: new Date().toISOString(),
  };
}

/**
 * Main URL scanner function with caching
 */
export async function scanUrl(url: string): Promise<UrlScanResult> {
  try {
    // Validate URL format
    new URL(url); // Throws if invalid

    // Check cache first
    const cached = urlScanCache.get(url);
    if (cached) {
      console.log(`Cache hit for URL: ${url}`);
      return cached;
    }

    console.log(`Scanning URL: ${url}`);

    let result: UrlScanResult;

    // Try VirusTotal if API key is available
    if (process.env.VIRUSTOTAL_API_KEY) {
      try {
        result = await scanWithVirusTotal(url);
      } catch (error) {
        console.error('VirusTotal scan failed, falling back to heuristic:', error);
        result = heuristicScan(url);
      }
    } else {
      // Fallback to heuristic scan
      console.log('VirusTotal API key not configured, using heuristic scan');
      result = heuristicScan(url);
    }

    // Cache the result
    urlScanCache.set(url, result);

    return result;
  } catch (error) {
    console.error('Error scanning URL:', error);
    
    return {
      url,
      isSafe: false,
      threatLevel: 'unknown',
      scanSource: 'heuristic',
      details: `Error scanning URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      scanDate: new Date().toISOString(),
    };
  }
}
