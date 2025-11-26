"use client";

import { useMemo } from "react";

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export default function MiniChart({ 
  data, 
  width = 100, 
  height = 40 
}: MiniChartProps) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return "";

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-xs text-muted-foreground">
        N/A
      </div>
    );
  }

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg 
      width={width} 
      height={height} 
      className="inline-block"
      style={{ verticalAlign: 'middle' }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
