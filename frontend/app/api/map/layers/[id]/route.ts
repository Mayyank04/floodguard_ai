import { NextRequest, NextResponse } from "next/server";
import {
  HISTORICAL_EVENT,
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_RESCUE_BASES,
  HISTORICAL_INFRASTRUCTURE,
  HISTORICAL_ROADS,
  HISTORICAL_FLOOD_GEOJSON,
  INITIAL_FIELD_OBSERVATIONS
} from "@/lib/data/historicalDemoData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const roadsGeoJson = {
    type: "FeatureCollection",
    features: HISTORICAL_ROADS.map(r => ({
      type: "Feature",
      id: r.id,
      properties: {
        id: r.id,
        name: r.name,
        road_type: r.road_type,
        length_km: r.length_km,
        flood_intersection: r.flood_intersection,
        potentially_exposed_length_km: r.potentially_exposed_length_km,
        accessibility_status: r.accessibility_status,
        verification_status: r.verification_status
      },
      geometry: {
        type: "LineString",
        coordinates: r.coordinates
      }
    }))
  };

  const settlementsGeoJson = {
    type: "FeatureCollection",
    features: HISTORICAL_SETTLEMENTS.map(s => ({
      type: "Feature",
      id: s.id,
      properties: { ...s },
      geometry: {
        type: "Point",
        coordinates: [s.longitude, s.latitude]
      }
    }))
  };

  const infraGeoJson = {
    type: "FeatureCollection",
    features: HISTORICAL_INFRASTRUCTURE.map(i => ({
      type: "Feature",
      id: i.id,
      properties: { ...i },
      geometry: {
        type: "Point",
        coordinates: [i.longitude, i.latitude]
      }
    }))
  };

  const basesGeoJson = {
    type: "FeatureCollection",
    features: HISTORICAL_RESCUE_BASES.map(b => ({
      type: "Feature",
      id: b.id,
      properties: { ...b },
      geometry: {
        type: "Point",
        coordinates: [b.longitude, b.latitude]
      }
    }))
  };

  const observationsGeoJson = {
    type: "FeatureCollection",
    features: INITIAL_FIELD_OBSERVATIONS.map(o => ({
      type: "Feature",
      id: o.id,
      properties: { ...o },
      geometry: {
        type: "Point",
        coordinates: [o.longitude, o.latitude]
      }
    }))
  };

  return NextResponse.json({
    event_id: id || HISTORICAL_EVENT.id,
    layers: {
      flood_inundation: HISTORICAL_FLOOD_GEOJSON,
      roads: roadsGeoJson,
      settlements: settlementsGeoJson,
      infrastructure: infraGeoJson,
      rescue_bases: basesGeoJson,
      field_observations: observationsGeoJson
    }
  });
}
