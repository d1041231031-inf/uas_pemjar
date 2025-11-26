import { NextResponse } from "next/server";
import { fetchCryptoPrices } from "@/lib/coingecko";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Missing coin IDs" },
        { status: 400 }
      );
    }

    const coinIds = ids.split(',');
    const prices = await fetchCryptoPrices(coinIds);
    
    return NextResponse.json(prices);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency prices" },
      { status: 500 }
    );
  }
}
