import { Cryptocurrency, CoinGeckoResponse } from "@/types/crypto";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 seconds (increased from 30)

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchTopCryptos(limit: number = 50): Promise<Cryptocurrency[]> {
  const cacheKey = `top-cryptos-${limit}`;
  
  // Check cache first
  const cached = getCachedData<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache untuk 60 detik
      }
    );

    if (response.status === 429) {
      console.warn("Rate limited by CoinGecko API, using cached data if available");
      // Return cached data even if expired, or empty array
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        return expiredCache.data as Cryptocurrency[];
      }
      // Return empty array instead of throwing
      return [];
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: Cryptocurrency[] = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    // Return cached data if available, even if expired
    const expiredCache = cache.get(cacheKey);
    if (expiredCache) {
      return expiredCache.data as Cryptocurrency[];
    }
    throw error;
  }
}

export async function fetchCryptoPrices(coinIds: string[]): Promise<CoinGeckoResponse> {
  const cacheKey = `prices-${coinIds.join(',')}`;
  
  // Check cache first
  const cached = getCachedData<CoinGeckoResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (response.status === 429) {
      console.warn("Rate limited by CoinGecko API, using cached data if available");
      // Return cached data even if expired, or empty object
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        return expiredCache.data as CoinGeckoResponse;
      }
      // Return empty object instead of throwing
      return {};
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    // Return cached data if available, even if expired
    const expiredCache = cache.get(cacheKey);
    if (expiredCache) {
      return expiredCache.data as CoinGeckoResponse;
    }
    throw error;
  }
}

export async function fetchCoinDetails(coinId: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache untuk 5 menit
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching coin details:", error);
    throw error;
  }
}
