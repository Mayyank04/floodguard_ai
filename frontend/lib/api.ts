import {
  DisasterEvent, Settlement, InfrastructureAsset, RoadSegment,
  RescueBase, FloodMask, MapLayersResponse, RouteAssessment,
  PriorityScore, CopilotMessage, FieldObservation, DataSourcesCatalog
} from "@/types";

import {
  HISTORICAL_EVENT,
  HISTORICAL_SETTLEMENTS,
  HISTORICAL_RESCUE_BASES,
  HISTORICAL_INFRASTRUCTURE,
  HISTORICAL_ROADS,
  HISTORICAL_FLOOD_GEOJSON,
  INITIAL_FIELD_OBSERVATIONS,
  DATA_SOURCES_CATALOG
} from "./data/historicalDemoData";

import {
  analyzeIsolation,
  analyzeRoute as calculateRouteAnalysis,
  calculatePriorities
} from "./services/gisEngine";

import {
  generateHtmlReport,
  generateCsvReport,
  generateGeoJsonReport
} from "./services/reportEngine";

// Default to relative "/api" on same origin (Vercel deployment) unless an explicit external API is configured
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "") : "/api";
const API_BASE = RAW_API_BASE.endsWith("/api") ? RAW_API_BASE : `${RAW_API_BASE}/api`;

let cachedEventId: string | null = HISTORICAL_EVENT.id;

export async function getPrimaryEventId(): Promise<string> {
  if (cachedEventId) return cachedEventId;
  try {
    const events = await fetchEvents();
    if (events && events.length > 0) {
      cachedEventId = events[0].id;
      return events[0].id;
    }
  } catch (err) {
    console.warn("Could not fetch primary event, using fallback:", err);
  }
  return HISTORICAL_EVENT.id;
}

export async function fetchEvents(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch events");
    return await res.json();
  } catch (err) {
    console.warn("Using historical demo event fallback:", err);
    return [HISTORICAL_EVENT as any];
  }
}

export async function fetchMapLayers(eventId: string): Promise<MapLayersResponse> {
  try {
    const res = await fetch(`${API_BASE}/map/layers/${eventId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch map layers");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback map layers:", err);
    return {
      event_id: eventId || HISTORICAL_EVENT.id,
      event_title: HISTORICAL_EVENT.title,
      bounding_box: HISTORICAL_EVENT.bounding_box,
      layers: {
        flood_inundation: HISTORICAL_FLOOD_GEOJSON as any,
        roads: {
          type: "FeatureCollection",
          features: HISTORICAL_ROADS.map(r => ({
            type: "Feature",
            id: r.id,
            properties: { ...r },
            geometry: { type: "LineString", coordinates: r.coordinates }
          }))
        } as any,
        settlements: {
          type: "FeatureCollection",
          features: HISTORICAL_SETTLEMENTS.map(s => ({
            type: "Feature",
            id: s.id,
            properties: { ...s },
            geometry: { type: "Point", coordinates: [s.longitude, s.latitude] }
          }))
        } as any,
        infrastructure: {
          type: "FeatureCollection",
          features: HISTORICAL_INFRASTRUCTURE.map(i => ({
            type: "Feature",
            id: i.id,
            properties: { ...i },
            geometry: { type: "Point", coordinates: [i.longitude, i.latitude] }
          }))
        } as any,
        rescue_bases: {
          type: "FeatureCollection",
          features: HISTORICAL_RESCUE_BASES.map(b => ({
            type: "Feature",
            id: b.id,
            properties: { ...b },
            geometry: { type: "Point", coordinates: [b.longitude, b.latitude] }
          }))
        } as any,
        field_observations: {
          type: "FeatureCollection",
          features: INITIAL_FIELD_OBSERVATIONS.map(o => ({
            type: "Feature",
            id: o.id,
            properties: { ...o },
            geometry: { type: "Point", coordinates: [o.longitude, o.latitude] }
          }))
        } as any
      }
    };
  }
}

export async function fetchSettlements(eventId: string): Promise<Settlement[]> {
  try {
    const res = await fetch(`${API_BASE}/settlements/${eventId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settlements");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback settlements:", err);
    return HISTORICAL_SETTLEMENTS as any[];
  }
}

export async function fetchInfrastructure(eventId: string): Promise<{
  total_assets: number;
  exposed_assets_count: number;
  total_road_km: number;
  exposed_road_km: number;
  assets: InfrastructureAsset[];
  roads: RoadSegment[];
}> {
  try {
    const res = await fetch(`${API_BASE}/infrastructure/${eventId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch infrastructure");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback infrastructure:", err);
    const exposedAssets = HISTORICAL_INFRASTRUCTURE.filter(a => a.flood_intersection);
    const totalRoadKm = HISTORICAL_ROADS.reduce((acc, r) => acc + r.length_km, 0);
    const exposedRoadKm = HISTORICAL_ROADS
      .filter(r => r.flood_intersection)
      .reduce((acc, r) => acc + r.potentially_exposed_length_km, 0);

    return {
      total_assets: HISTORICAL_INFRASTRUCTURE.length,
      exposed_assets_count: exposedAssets.length,
      total_road_km: Math.round(totalRoadKm * 10) / 10,
      exposed_road_km: Math.round(exposedRoadKm * 10) / 10,
      assets: HISTORICAL_INFRASTRUCTURE as any[],
      roads: HISTORICAL_ROADS as any[]
    };
  }
}

export async function fetchIsolationAnalysis(eventId: string): Promise<{
  total_settlements: number;
  isolated_settlements_count: number;
  potentially_isolated_population: number;
  rescue_bases_active: number;
  isolated_settlements: Settlement[];
  all_settlements: Settlement[];
  rescue_bases: RescueBase[];
  network_assumptions: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/isolation/${eventId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch isolation analysis");
    return await res.json();
  } catch (err) {
    console.warn("Recalculating isolation analysis locally with Graph Engine:", err);
    return analyzeIsolation(
      HISTORICAL_SETTLEMENTS as any[],
      HISTORICAL_RESCUE_BASES as any[],
      HISTORICAL_ROADS as any[]
    ) as any;
  }
}

export async function fetchPriorities(
  eventId: string,
  weights?: { pop: number; iso: number; flood: number; infra: number; unc: number }
): Promise<{ event_id: string; weights: any; priorities: PriorityScore[] }> {
  try {
    let url = `${API_BASE}/priorities/${eventId}`;
    if (weights) {
      url += `?pop_w=${weights.pop}&iso_w=${weights.iso}&flood_w=${weights.flood}&infra_w=${weights.infra}&unc_w=${weights.unc}`;
    }
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch priorities");
    return await res.json();
  } catch (err) {
    console.warn("Calculating priorities locally with Priority Engine:", err);
    const prioritized = calculatePriorities(
      HISTORICAL_SETTLEMENTS as any[],
      HISTORICAL_INFRASTRUCTURE as any[],
      weights
    );
    return {
      event_id: eventId || HISTORICAL_EVENT.id,
      weights: weights || { pop: 0.3, iso: 0.3, flood: 0.2, infra: 0.15, unc: 0.05 },
      priorities: prioritized as any[]
    };
  }
}

export async function analyzeRoute(params: {
  event_id: string;
  base_id: string;
  settlement_id: string;
  algorithm?: string;
}): Promise<RouteAssessment> {
  try {
    const res = await fetch(`${API_BASE}/routes/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to analyze route");
    return await res.json();
  } catch (err) {
    console.warn("Calculating route locally with Dijkstra / A* Graph Engine:", err);
    const base = HISTORICAL_RESCUE_BASES.find(b => b.id === params.base_id) || HISTORICAL_RESCUE_BASES[0];
    const settlement = HISTORICAL_SETTLEMENTS.find(s => s.id === params.settlement_id) || HISTORICAL_SETTLEMENTS[0];

    return calculateRouteAnalysis({
      base: base as any,
      settlement: settlement as any,
      roads: HISTORICAL_ROADS as any,
      algorithm: params.algorithm || "dijkstra"
    }) as any;
  }
}

export async function sendCopilotChat(message: string, eventId?: string): Promise<CopilotMessage> {
  const res = await fetch(`${API_BASE}/copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, event_id: eventId }),
    cache: "no-store"
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    if (errData && errData.content) {
      return {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: errData.content,
        tool_calls: errData.tool_calls || [],
        references: errData.references || [],
        timestamp: errData.timestamp || new Date().toISOString()
      };
    }
    throw new Error(`Copilot request failed: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: data.content,
    tool_calls: data.tool_calls || [],
    references: data.references || [],
    timestamp: data.timestamp || new Date().toISOString()
  };
}

export async function triggerFloodDetection(payload: {
  event_id: string;
  satellite_source: string;
  sensitivity_threshold_db?: number;
  filter_speckle?: boolean;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/analysis/flood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to trigger flood detection");
    return await res.json();
  } catch (err) {
    console.warn("Using precomputed flood detection results:", err);
    return {
      status: "success",
      event_id: payload.event_id || HISTORICAL_EVENT.id,
      satellite_source: payload.satellite_source,
      sensitivity_threshold_db: payload.sensitivity_threshold_db || -14.5,
      filter_speckle: payload.filter_speckle ?? true,
      flooded_area_sq_km: 412.8,
      baseline_date: "2022-05-28",
      peak_date: "2022-06-20",
      confidence_score: 0.94,
      mask_geojson: HISTORICAL_FLOOD_GEOJSON
    };
  }
}

export async function generateDisasterReport(payload: {
  event_id: string;
  format: "PDF" | "CSV" | "GEOJSON";
  title?: string;
}): Promise<{ report_id: string; format: string; content: string; media_type: string }> {
  try {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to generate report");
    return await res.json();
  } catch (err) {
    console.warn("Generating report client-side:", err);
    const format = payload.format.toUpperCase();
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

    return {
      report_id: `rep-${Date.now()}`,
      format,
      content,
      media_type: mediaType
    };
  }
}

export async function fetchFieldObservations(eventId: string): Promise<FieldObservation[]> {
  try {
    const res = await fetch(`${API_BASE}/observations`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch field observations");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback field observations:", err);
    return INITIAL_FIELD_OBSERVATIONS as any[];
  }
}

export async function createFieldObservation(payload: {
  event_id: string;
  observer_name: string;
  observation_type: string;
  latitude: number;
  longitude: number;
  description: string;
  water_depth_meters: number;
  image_url?: string;
  nearest_feature_name?: string;
}): Promise<FieldObservation> {
  try {
    const res = await fetch(`${API_BASE}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to submit field observation");
    return await res.json();
  } catch (err) {
    return {
      id: `obs-${Date.now()}`,
      event_id: payload.event_id,
      observer_name: payload.observer_name,
      observation_type: payload.observation_type as any,
      latitude: payload.latitude,
      longitude: payload.longitude,
      description: payload.description,
      water_depth_meters: payload.water_depth_meters,
      nearest_feature_name: payload.nearest_feature_name,
      verified: false,
      verification_status: "pending",
      created_at: new Date().toISOString()
    };
  }
}

export async function verifyFieldObservation(id: string, payload: {
  status: "verified" | "rejected";
  reviewer_name: string;
  review_notes?: string;
}): Promise<FieldObservation> {
  try {
    const res = await fetch(`${API_BASE}/observations/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to verify field observation");
    return await res.json();
  } catch (err) {
    return {
      id,
      event_id: HISTORICAL_EVENT.id,
      observer_name: "NDRF Field Personnel",
      observation_type: "flood_depth",
      latitude: 26.178,
      longitude: 90.965,
      description: "Observation",
      water_depth_meters: 1.2,
      verified: payload.status === "verified",
      verification_status: payload.status,
      reviewed_by: payload.reviewer_name,
      reviewed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
  }
}

export async function updateRoadStatus(id: string, payload: {
  verification_status: string;
  reporter: string;
  evidence_notes?: string;
}): Promise<RoadSegment> {
  try {
    const res = await fetch(`${API_BASE}/roads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to update road status");
    return await res.json();
  } catch (err) {
    const road = HISTORICAL_ROADS.find(r => r.id === id) || HISTORICAL_ROADS[0];
    return {
      ...road,
      verification_status: payload.verification_status,
      updated_at: new Date().toISOString()
    } as any;
  }
}

export async function fetchDataSourcesCatalog(): Promise<DataSourcesCatalog> {
  try {
    const res = await fetch(`${API_BASE}/data-sources`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch data sources catalog");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback catalog:", err);
    return DATA_SOURCES_CATALOG as any;
  }
}
