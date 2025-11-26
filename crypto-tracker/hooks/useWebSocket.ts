"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { CoinGeckoResponse } from "@/types/crypto";

let socket: Socket | null = null;

export function useWebSocket() {
  const [prices, setPrices] = useState<CoinGeckoResponse>({});
  const [isConnected, setIsConnected] = useState(false);

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

  const subscribe = (coinIds: string[]) => {
    if (socket && isConnected) {
      socket.emit("subscribe", coinIds);
    }
  };

  const unsubscribe = () => {
    if (socket && isConnected) {
      socket.emit("unsubscribe");
    }
  };

  return { prices, isConnected, subscribe, unsubscribe };
}
