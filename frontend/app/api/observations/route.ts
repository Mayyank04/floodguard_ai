import { NextRequest, NextResponse } from "next/server";
import { INITIAL_FIELD_OBSERVATIONS, HISTORICAL_EVENT } from "@/lib/data/historicalDemoData";
import { FieldObservation } from "@/types";

let observationsStore: FieldObservation[] = [...INITIAL_FIELD_OBSERVATIONS];

export async function GET(req: NextRequest) {
  return NextResponse.json(observationsStore);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newObs: FieldObservation = {
      id: `obs-${Date.now()}`,
      event_id: body.event_id || HISTORICAL_EVENT.id,
      observer_name: body.observer_name || "Tactical Scout",
      observation_type: (body.observation_type || "flood_depth") as any,
      latitude: Number(body.latitude) || 26.178,
      longitude: Number(body.longitude) || 90.965,
      description: body.description || "Field observation submitted",
      water_depth_meters: Number(body.water_depth_meters) || 0.0,
      image_url: body.image_url || "/satellite/peak_flood_s1_20220620.png",
      nearest_feature_name: body.nearest_feature_name || "Barpeta Basin",
      verified: false,
      verification_status: "pending",
      created_at: new Date().toISOString()
    };

    observationsStore.unshift(newObs);
    return NextResponse.json(newObs, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
