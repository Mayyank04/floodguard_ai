export interface DisasterEvent {
  id: string;
  title: string;
  description?: string;
  country: string;
  state: string;
  district: string;
  bounding_box: number[];
  start_date: string;
  peak_date: string;
  status: string;
  is_historical: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: string;
  event_id: string;
  name: string;
  district?: string;
  latitude: number;
  longitude: number;
  estimated_population: number;
  connectivity_status: "connected" | "potentially_isolated" | "critical_isolated" | "insufficient_network_data";
  flood_exposure_level: "severe" | "moderate" | "low" | "unaffected";
  flood_distance_meters: number;
  nearest_rescue_base_id?: string;
  priority_score: number;
  priority_rank: number;
  notes?: string;
}

export interface InfrastructureAsset {
  id: string;
  event_id: string;
  name: string;
  asset_type: "hospital" | "school" | "bridge" | "shelter" | "water_plant" | "power_station";
  latitude: number;
  longitude: number;
  flood_intersection: boolean;
  exposure_status: "flood_exposed" | "potentially_affected" | "clear";
  distance_to_flood_meters: number;
  capacity: number;
  contact_info?: string;
}

export interface RoadSegment {
  id: string;
  event_id: string;
  name?: string;
  road_type: string;
  length_km: number;
  coordinates_geojson: {
    type: "LineString";
    coordinates: number[][];
  };
  flood_intersection: boolean;
  potentially_exposed_length_km: number;
  accessibility_status: "accessible" | "potentially_inundated" | "impassable_suspected" | "unverified";
}

export interface RescueBase {
  id: string;
  event_id: string;
  name: string;
  base_type: string;
  latitude: number;
  longitude: number;
  operational_status: string;
  personnel_count: number;
  boats_count: number;
  vehicles_count: number;
}

export interface FloodMask {
  id: string;
  event_id: string;
  algorithm: string;
  flooded_area_sq_km: number;
  confidence_score: number;
  geojson_data: {
    type: "FeatureCollection";
    features: any[];
  };
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface MapLayersResponse {
  event_id: string;
  event_title: string;
  bounding_box: number[];
  layers: {
    flood_inundation: {
      type: "FeatureCollection";
      features: any[];
    };
    settlements: {
      type: "FeatureCollection";
      features: any[];
    };
    infrastructure: {
      type: "FeatureCollection";
      features: any[];
    };
    roads: {
      type: "FeatureCollection";
      features: any[];
    };
    rescue_bases: {
      type: "FeatureCollection";
      features: any[];
    };
  };
}

export interface RouteAssessment {
  base_id: string;
  base_name: string;
  settlement_id: string;
  settlement_name: string;
  route_classification: "unexposed_candidate_route" | "flood_exposed_candidate_route" | "no_mapped_route";
  algorithm_used?: string;
  distance_km: number;
  estimated_time_minutes: number;
  waypoints_geojson: {
    type: "LineString";
    coordinates: number[][];
  };
  flood_exposure_summary: string;
  verification_status: string;
  safety_disclaimer: string;
}

export interface PriorityScore {
  settlement_id: string;
  settlement_name: string;
  district: string;
  latitude: number;
  longitude: number;
  estimated_population: number;
  connectivity_status: string;
  score: number;
  rank: number;
  population_factor: number;
  isolation_factor: number;
  flood_factor: number;
  infra_factor: number;
  uncertainty_factor: number;
  weights_used: Record<string, number>;
  explanation: string;
  data_confidence: string;
}

export interface CopilotMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: { tool: string; result?: any }[];
  references?: { source: string; date?: string; id?: string }[];
  timestamp?: string;
}
