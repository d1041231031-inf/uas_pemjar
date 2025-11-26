"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Cryptocurrency } from "@/types/crypto";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Activity, Info, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import MarketStats from "./MarketStats";
import ApiStatus from "./ApiStatus";
import MiniChart from "./MiniChart";

type SortField = 'name' | 'price' | 'change' | 'marketCap' | 'volume';
type SortDirection = 'asc' | 'desc' | null;

export default function CryptoTable() {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const { prices, isConnected, subscribe } = useWebSocket();
  const hasSubscribedRef = useRef(false);

  // Update current time every second untuk refresh display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCryptos();
  }, []);

  useEffect(() => {
    if (cryptos.length > 0 && !hasSubscribedRef.current) {
      const coinIds = cryptos.map((c) => c.id);
      subscribe(coinIds);
      hasSubscribedRef.current = true;
    }
  }, [cryptos, subscribe]);

  useEffect(() => {
    // Update prices from WebSocket
    if (Object.keys(prices).length > 0) {
      setLastUpdateTime(new Date());
      setCryptos((prevCryptos) =>
        prevCryptos.map((crypto) => {
          if (prices[crypto.id]) {
            return {
              ...crypto,
              current_price: prices[crypto.id].usd,
              price_change_percentage_24h: prices[crypto.id].usd_24h_change,
            };
          }
          return crypto;
        })
      );
    }
  }, [prices]);

  useEffect(() => {
    const filtered = cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCryptos(filtered);
  }, [searchTerm, cryptos]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or reset
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedCryptos = () => {
    if (!sortDirection || !sortField) return filteredCryptos;

    return [...filteredCryptos].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'price':
          aValue = a.current_price;
          bValue = b.current_price;
          break;
        case 'change':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        case 'marketCap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'volume':
          aValue = a.total_volume;
          bValue = b.total_volume;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const sortedCryptos = getSortedCryptos();

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
  };

  async function fetchCryptos() {
    try {
      setLoading(true);
      const response = await fetch("/api/crypto?limit=50");
      
      if (!response.ok) {
        console.warn("Failed to fetch cryptos, will use cached data");
        // Keep previous data on error
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data && !data.error) {
        setCryptos(data);
        setFilteredCryptos(data);
      }
    } catch (error) {
      console.error("Error fetching cryptos:", error);
      // Keep previous data on error
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 100) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleTimeString();
  };

  // Memoize time display untuk menghindari unnecessary re-renders
  const timeAgoDisplay = useMemo(
    () => getTimeAgo(lastUpdateTime),
    [currentTime, lastUpdateTime]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <MarketStats />
      
      <ApiStatus />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Cryptocurrency Prices
            </CardTitle>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                      <Info className="h-3 w-3" />
                      Updated: {timeAgoDisplay}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Prices update every 60 seconds via WebSocket</p>
                    <p className="text-xs text-muted-foreground">Uses cached data when API is rate limited</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last update: {lastUpdateTime.toLocaleTimeString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {isConnected ? "Live" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Coin
                      <SortIcon field="name" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center ml-auto hover:text-foreground transition-colors"
                    >
                      Price
                      <SortIcon field="price" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('change')}
                      className="flex items-center ml-auto hover:text-foreground transition-colors"
                    >
                      24h Change
                      <SortIcon field="change" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('marketCap')}
                      className="flex items-center ml-auto hover:text-foreground transition-colors"
                    >
                      Market Cap
                      <SortIcon field="marketCap" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('volume')}
                      className="flex items-center ml-auto hover:text-foreground transition-colors"
                    >
                      Volume (24h)
                      <SortIcon field="volume" />
                    </button>
                  </TableHead>
                  <TableHead className="text-center">Last 7 Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCryptos.map((crypto) => (
                  <TableRow key={crypto.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {crypto.market_cap_rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{crypto.name}</div>
                          <div className="text-sm text-muted-foreground uppercase">
                            {crypto.symbol}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(crypto.current_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          crypto.price_change_percentage_24h >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(crypto.market_cap)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(crypto.total_volume)}
                    </TableCell>
                    <TableCell className="text-center">
                      <MiniChart 
                        data={crypto.sparkline_in_7d?.price || []} 
                        width={100} 
                        height={40}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedCryptos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No cryptocurrencies found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
