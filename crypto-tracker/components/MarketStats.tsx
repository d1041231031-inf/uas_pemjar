"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";

interface MarketStats {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  activeCoins: number;
}

export default function MarketStats() {
  const [stats, setStats] = useState<MarketStats>({
    totalMarketCap: 0,
    total24hVolume: 0,
    btcDominance: 0,
    activeCoins: 0,
  });

  useEffect(() => {
    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 120000); // Update setiap 2 menit (increased from 1)
    return () => clearInterval(interval);
  }, []);

  async function fetchMarketStats() {
    try {
      const response = await fetch("/api/crypto?limit=100");
      
      if (!response.ok) {
        console.warn("Failed to fetch market stats, will retry later");
        return; // Don't update stats on error, keep previous values
      }
      
      const data = await response.json();

      if (data && data.length > 0) {
        const totalMcap = data.reduce((sum: number, coin: any) => sum + coin.market_cap, 0);
        const totalVol = data.reduce((sum: number, coin: any) => sum + coin.total_volume, 0);
        const btc = data.find((coin: any) => coin.id === "bitcoin");
        const btcDom = btc ? (btc.market_cap / totalMcap) * 100 : 0;

        setStats({
          totalMarketCap: totalMcap,
          total24hVolume: totalVol,
          btcDominance: btcDom,
          activeCoins: data.length,
        });
      }
    } catch (error) {
      console.error("Error fetching market stats:", error);
    }
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatLargeNumber(stats.totalMarketCap)}
          </div>
          <p className="text-xs text-muted-foreground">
            Global cryptocurrency market capitalization
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatLargeNumber(stats.total24hVolume)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total trading volume in 24 hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.btcDominance.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Bitcoin market cap dominance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Coins</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCoins}</div>
          <p className="text-xs text-muted-foreground">
            Top cryptocurrencies tracked
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
