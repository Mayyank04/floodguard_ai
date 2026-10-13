import { NextRequest, NextResponse } from "next/server";
import { HISTORICAL_EVENT, HISTORICAL_FLOOD_GEOJSON } from "@/lib/data/historicalDemoData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      satellite_source = "Sentinel-1",
      sensitivity_threshold_db = -14.5,
      filter_speckle = true
    } = body;

    return NextResponse.json({
      status: "success",
      event_id: HISTORICAL_EVENT.id,
      satellite_source,
      sensitivity_threshold_db,
      filter_speckle,
      analysis_pipeline: "Precomputed ESA Copernicus Sentinel-1 C-SAR IW GRDH Change Detection",
      flooded_area_sq_km: 412.8,
      baseline_date: "2022-05-28",
      peak_date: "2022-06-20",
      confidence_score: 0.94,
      mask_geojson: HISTORICAL_FLOOD_GEOJSON,
      processing_note: "Heavy raster speckle reduction (Lee 5x5) and dual-polarization change detection precomputed from certified Copernicus Level-1 GRDH granules."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
