import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_INFRASTRUCTURE,
  HISTORICAL_ROADS
} from "@/lib/data/historicalDemoData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const exposedAssets = HISTORICAL_INFRASTRUCTURE.filter(a => a.flood_intersection);
  const totalRoadKm = HISTORICAL_ROADS.reduce((acc, r) => acc + r.length_km, 0);
  const exposedRoadKm = HISTORICAL_ROADS
    .filter(r => r.flood_intersection)
    .reduce((acc, r) => acc + r.potentially_exposed_length_km, 0);

  return NextResponse.json({
    total_assets: HISTORICAL_INFRASTRUCTURE.length,
    exposed_assets_count: exposedAssets.length,
    total_road_km: Math.round(totalRoadKm * 10) / 10,
    exposed_road_km: Math.round(exposedRoadKm * 10) / 10,
    assets: HISTORICAL_INFRASTRUCTURE,
    roads: HISTORICAL_ROADS
  });
}
