import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_RESCUE_BASES,
  HISTORICAL_ROADS
} from "@/lib/data/historicalDemoData";
import { analyzeIsolation } from "@/lib/services/gisEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = analyzeIsolation(
    HISTORICAL_SETTLEMENTS,
    HISTORICAL_RESCUE_BASES,
    HISTORICAL_ROADS
  );

  return NextResponse.json(result);
}
