import {
  DisasterEvent, Settlement, InfrastructureAsset, RoadSegment,
  RescueBase, FloodMask, MapLayersResponse, RouteAssessment,
  PriorityScore, CopilotMessage
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchEvents(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback event data:", err);
    return [{
      id: "6d5354bb-015e-4fb3-b050-d78fb1302910",
      title: "Assam Brahmaputra Basin Severe Flood (June 2022)",
      description: "Catastrophic monsoon deluge and Brahmaputra river overflow affecting 5.4M people across Assam. This dataset captures the critical Barpeta-Mandia-Chenga corridor.",
      country: "India",
      state: "Assam",
      district: "Barpeta & Morigaon Corridor",
      bounding_box: [90.75, 26.05, 91.35, 26.55],
      start_date: "2022-06-14",
      peak_date: "2022-06-20",
      status: "historical_demo",
      is_historical: true,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  }
}

export async function fetchMapLayers(eventId: string): Promise<MapLayersResponse> {
  const res = await fetch(`${API_BASE}/map/layers/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch map layers");
  return await res.json();
}

export async function fetchSettlements(eventId: string): Promise<Settlement[]> {
  const res = await fetch(`${API_BASE}/settlements/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch settlements");
  return await res.json();
}

export async function fetchInfrastructure(eventId: string): Promise<{
  total_assets: number;
  exposed_assets_count: number;
  total_road_km: number;
  exposed_road_km: number;
  assets: InfrastructureAsset[];
  roads: RoadSegment[];
}> {
  const res = await fetch(`${API_BASE}/infrastructure/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch infrastructure");
  return await res.json();
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
  const res = await fetch(`${API_BASE}/isolation/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch isolation analysis");
  return await res.json();
}

export async function fetchPriorities(
  eventId: string,
  weights?: { pop: number; iso: number; flood: number; infra: number; unc: number }
): Promise<{ event_id: string; weights: any; priorities: PriorityScore[] }> {
  let url = `${API_BASE}/priorities/${eventId}`;
  if (weights) {
    url += `?pop_w=${weights.pop}&iso_w=${weights.iso}&flood_w=${weights.flood}&infra_w=${weights.infra}&unc_w=${weights.unc}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch priorities");
  return await res.json();
}

export async function analyzeRoute(params: {
  event_id: string;
  base_id: string;
  settlement_id: string;
  algorithm?: string;
}): Promise<RouteAssessment> {
  const res = await fetch(`${API_BASE}/routes/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error("Failed to analyze route");
  return await res.json();
}

export async function sendCopilotChat(message: string, eventId?: string): Promise<CopilotMessage> {
  const res = await fetch(`${API_BASE}/copilot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, event_id: eventId })
  });
  if (!res.ok) throw new Error("Failed to chat with Copilot");
  return await res.json();
}

export async function triggerFloodDetection(payload: {
  event_id: string;
  satellite_source: string;
  sensitivity_threshold_db?: number;
  filter_speckle?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/analysis/flood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to trigger flood detection");
  return await res.json();
}

export async function generateDisasterReport(payload: {
  event_id: string;
  format: "PDF" | "CSV" | "GEOJSON";
  title?: string;
}): Promise<{ report_id: string; format: string; content: string; media_type: string }> {
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to generate report");
  return await res.json();
}
