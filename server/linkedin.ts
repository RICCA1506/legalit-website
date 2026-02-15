import { storage } from "./storage";

const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/legalit---avvocati-associati/";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const DEFAULT_FOLLOWERS = "788";

let cachedFollowers: string | null = null;
let lastFetchTime = 0;

async function scrapeFollowerCount(): Promise<string | null> {
  try {
    const response = await fetch(LINKEDIN_COMPANY_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      console.log("[LinkedIn] Failed to fetch page:", response.status);
      return null;
    }

    const html = await response.text();

    const followerPatterns = [
      /(\d[\d,.]+)\s*followers/i,
      /"followerCount"\s*:\s*(\d+)/,
      /followerCount.*?(\d+)/,
      /(\d[\d,.]+)\s*follower/i,
    ];

    for (const pattern of followerPatterns) {
      const match = html.match(pattern);
      if (match) {
        const count = match[1].replace(/,/g, "");
        const num = parseInt(count);
        if (num > 0 && num < 10000000) {
          console.log("[LinkedIn] Scraped follower count:", num);
          return num.toString();
        }
      }
    }

    console.log("[LinkedIn] Could not extract follower count from page");
    return null;
  } catch (error) {
    console.log("[LinkedIn] Scrape error:", (error as Error).message);
    return null;
  }
}

export async function getLinkedInFollowers(): Promise<string> {
  const now = Date.now();
  if (cachedFollowers && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedFollowers;
  }

  const dbValue = await storage.getSetting("linkedin_followers");

  const scraped = await scrapeFollowerCount();
  if (scraped) {
    cachedFollowers = scraped;
    lastFetchTime = now;
    await storage.setSetting("linkedin_followers", scraped);
    return scraped;
  }

  cachedFollowers = dbValue || DEFAULT_FOLLOWERS;
  lastFetchTime = now;
  return cachedFollowers;
}

export async function updateLinkedInFollowers(count: string): Promise<void> {
  await storage.setSetting("linkedin_followers", count);
  cachedFollowers = count;
  lastFetchTime = Date.now();
}

export function startFollowerSync(): void {
  getLinkedInFollowers().catch(() => {});
  setInterval(() => {
    getLinkedInFollowers().catch(() => {});
  }, CACHE_DURATION_MS);
}
