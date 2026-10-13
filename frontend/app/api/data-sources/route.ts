import { NextResponse } from "next/server";
import { DATA_SOURCES_CATALOG } from "@/lib/data/historicalDemoData";

export async function GET() {
  return NextResponse.json(DATA_SOURCES_CATALOG);
}
