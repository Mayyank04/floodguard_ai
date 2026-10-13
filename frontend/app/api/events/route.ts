import { NextResponse } from "next/server";
import { HISTORICAL_EVENT } from "@/lib/data/historicalDemoData";

export async function GET() {
  return NextResponse.json([HISTORICAL_EVENT]);
}
