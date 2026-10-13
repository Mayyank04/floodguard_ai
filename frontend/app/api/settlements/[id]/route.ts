import { NextRequest, NextResponse } from "next/server";
import { HISTORICAL_SETTLEMENTS } from "@/lib/data/historicalDemoData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(HISTORICAL_SETTLEMENTS);
}
