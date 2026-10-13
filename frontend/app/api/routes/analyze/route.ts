import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_RESCUE_BASES,
  HISTORICAL_ROADS
} from "@/lib/data/historicalDemoData";
import { analyzeRoute } from "@/lib/services/gisEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base_id, settlement_id, algorithm = "dijkstra" } = body;

    const base = HISTORICAL_RESCUE_BASES.find(b => b.id === base_id) || HISTORICAL_RESCUE_BASES[0];
    const settlement = HISTORICAL_SETTLEMENTS.find(s => s.id === settlement_id) || HISTORICAL_SETTLEMENTS[0];

    const result = analyzeRoute({
      base,
      settlement,
      roads: HISTORICAL_ROADS,
      algorithm
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Route analysis error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze candidate route." },
      { status: 500 }
    );
  }
}
