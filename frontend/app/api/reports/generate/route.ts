import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_EVENT,
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_INFRASTRUCTURE,
  HISTORICAL_ROADS,
  HISTORICAL_FLOOD_GEOJSON
} from "@/lib/data/historicalDemoData";
import {
  generateHtmlReport,
  generateCsvReport,
  generateGeoJsonReport
} from "@/lib/services/reportEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format = (body.format || "PDF").toUpperCase();

    const reportData = {
      event: HISTORICAL_EVENT,
      flood: { area_sq_km: 412.8, peak_date: HISTORICAL_EVENT.peak_date },
      floodGeoJson: HISTORICAL_FLOOD_GEOJSON,
      settlements: HISTORICAL_SETTLEMENTS,
      infrastructure: HISTORICAL_INFRASTRUCTURE,
      roads: HISTORICAL_ROADS
    };

    let content = "";
    let mediaType = "text/html";

    if (format === "CSV") {
      content = generateCsvReport(reportData);
      mediaType = "text/csv";
    } else if (format === "GEOJSON") {
      content = generateGeoJsonReport(reportData);
      mediaType = "application/geo+json";
    } else {
      content = generateHtmlReport(reportData);
      mediaType = "text/html";
    }

    return NextResponse.json({
      report_id: `rep-${Date.now()}`,
      format,
      content,
      media_type: mediaType
    });
  } catch (err: any) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
