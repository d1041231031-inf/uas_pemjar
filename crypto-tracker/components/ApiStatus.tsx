"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ApiStatusProps {
  className?: string;
}

export default function ApiStatus({ className = "" }: ApiStatusProps) {
  const [status, setStatus] = useState<"healthy" | "cached" | "error">(
    "healthy"
  );
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Monitor console for rate limit warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.join(" ");
      if (message.includes("Rate limited")) {
        setStatus("cached");
        setLastUpdate(new Date());

        // Reset to healthy after 2 minutes
        setTimeout(() => {
          setStatus("healthy");
        }, 120000);
      }
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  if (status === "healthy") {
    return null; // Don't show anything when healthy
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {status === "cached" && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>Using cached data due to API rate limiting</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-1.5 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>Unable to fetch live data</span>
        </div>
      )}
    </div>
  );
}
