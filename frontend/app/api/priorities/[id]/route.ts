import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_INFRASTRUCTURE,
  HISTORICAL_EVENT
} from "@/lib/data/historicalDemoData";
import { calculatePriorities } from "@/lib/services/gisEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;

  const popW = parseFloat(searchParams.get("pop_w") || "0.30");
  const isoW = parseFloat(searchParams.get("iso_w") || "0.30");
  const floodW = parseFloat(searchParams.get("flood_w") || "0.20");
  const infraW = parseFloat(searchParams.get("infra_w") || "0.15");
  const uncW = parseFloat(searchParams.get("unc_w") || "0.05");

  const weights = {
    pop: isNaN(popW) ? 0.30 : popW,
    iso: isNaN(isoW) ? 0.30 : isoW,
    flood: isNaN(floodW) ? 0.20 : floodW,
    infra: isNaN(infraW) ? 0.15 : infraW,
    unc: isNaN(uncW) ? 0.05 : uncW
  };

  const prioritized = calculatePriorities(
    HISTORICAL_SETTLEMENTS,
    HISTORICAL_INFRASTRUCTURE,
    weights
  );

  return NextResponse.json({
    event_id: id || HISTORICAL_EVENT.id,
    weights,
    priorities: prioritized
  });
}
