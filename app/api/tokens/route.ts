import { NextResponse } from "next/server";
import { fetchPonsTokens } from "@/lib/pons-data";
import type { DataResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { tokens, health } = await fetchPonsTokens();

    const response: DataResponse = {
      tokens,
      health,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
