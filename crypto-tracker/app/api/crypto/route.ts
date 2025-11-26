import { NextResponse } from "next/server";
import { fetchTopCryptos } from "@/lib/coingecko";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const cryptos = await fetchTopCryptos(limit);
    
    // If empty array due to rate limiting, return 503
    if (cryptos.length === 0) {
      return NextResponse.json(
        { 
          error: "Service temporarily unavailable due to API rate limiting. Please try again in a moment.",
          cached: false 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(cryptos);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency data. Please try again later." },
      { status: 500 }
    );
  }
}
