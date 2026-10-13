import { NextRequest, NextResponse } from "next/server";
import { INITIAL_FIELD_OBSERVATIONS } from "@/lib/data/historicalDemoData";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const obs = INITIAL_FIELD_OBSERVATIONS.find(o => o.id === id) || {
      id,
      event_id: "6d5354bb-015e-4fb3-b050-d78fb1302910",
      observer_name: "NDRF Field Personnel",
      observation_type: "flood_depth",
      latitude: 26.178,
      longitude: 90.965,
      description: "Field observation verified",
      water_depth_meters: 1.2,
      created_at: new Date().toISOString()
    };

    const updated = {
      ...obs,
      status: body.status || "verified",
      reviewer_name: body.reviewer_name || "Reviewer",
      review_notes: body.review_notes || "Verified by ground team",
      reviewed_at: new Date().toISOString()
    };

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
