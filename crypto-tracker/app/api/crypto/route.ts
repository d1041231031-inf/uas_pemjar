import { NextResponse } from "next/server";
import { fetchTopCryptos } from "@/lib/coingecko";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const cryptos = await fetchTopCryptos(limit);
    
    return NextResponse.json(cryptos);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency data" },
      { status: 500 }
    );
  }
}
