import { Cryptocurrency, CoinGeckoResponse } from "@/types/crypto";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export async function fetchTopCryptos(limit: number = 50): Promise<Cryptocurrency[]> {
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

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: Cryptocurrency[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
}

export async function fetchCryptoPrices(coinIds: string[]): Promise<CoinGeckoResponse> {
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

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
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
