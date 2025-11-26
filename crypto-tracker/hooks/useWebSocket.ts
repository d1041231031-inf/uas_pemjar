"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { CoinGeckoResponse } from "@/types/crypto";

let socket: Socket | null = null;

export function useWebSocket() {
  const [prices, setPrices] = useState<CoinGeckoResponse>({});
  const [isConnected, setIsConnected] = useState(false);
  const subscribedRef = useRef<string[]>([]);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      });

      socket.on("priceUpdate", (data: CoinGeckoResponse) => {
        setPrices(data);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("priceUpdate");
      }
    };
  }, []);

  const subscribe = useCallback((coinIds: string[]) => {
    // Prevent duplicate subscriptions
    const coinIdsStr = JSON.stringify(coinIds.sort());
    const subscribedStr = JSON.stringify(subscribedRef.current.sort());
    
    if (coinIdsStr === subscribedStr) {
      console.log("Already subscribed to these coins, skipping...");
      return;
    }
    
    if (socket && socket.connected) {
      console.log("Subscribing to", coinIds.length, "coins");
      socket.emit("subscribe", coinIds);
      subscribedRef.current = coinIds;
    } else {
      console.log("Socket not connected yet, waiting...");
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit("unsubscribe");
      subscribedRef.current = [];
    }
  }, []);

  return { prices, isConnected, subscribe, unsubscribe };
}
