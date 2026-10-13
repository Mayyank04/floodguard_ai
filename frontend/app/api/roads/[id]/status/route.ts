import { NextRequest, NextResponse } from "next/server";
import { HISTORICAL_ROADS } from "@/lib/data/historicalDemoData";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const road = HISTORICAL_ROADS.find(r => r.id === id) || HISTORICAL_ROADS[0];

    const updated = {
      ...road,
      verification_status: body.verification_status || "reported_open",
      evidence_notes: body.evidence_notes || `Status updated by ${body.reporter || "Tactical Scout"}`,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
