from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class RegionBase(BaseModel):
    name: str
    code: str
    state: str
    country: str
    center_lat: float
    center_lon: float
    zoom_level: int = 11
    bounds_geojson: Optional[Dict[str, Any]] = None

class RegionResponse(RegionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class SatelliteSceneResponse(BaseModel):
    id: str
    event_id: str
    platform: str
    sensor: str
    acquisition_date: str
    scene_type: str
    cloud_cover_percent: float
    resolution_meters: float
    polarization: Optional[str] = "VV+VH"
    thumbnail_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

class DisasterEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    country: str = "India"
    state: str = "Assam"
    district: str = "Barpeta & Morigaon"
    bounding_box: Optional[List[float]] = None
    start_date: str
    peak_date: str
    status: str = "active"
    is_historical: bool = True
    is_demo: bool = True

class DisasterEventCreate(DisasterEventBase):
    pass

class DisasterEventResponse(DisasterEventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FloodDetectionRequest(BaseModel):
    event_id: str
    algorithm: str = "SAR_BACKSCATTER_THRESHOLD" # SAR_BACKSCATTER_THRESHOLD, OPTICAL_NDWI, HYBRID_FUSION
    pre_flood_date: Optional[str] = "2022-05-28"
    peak_flood_date: Optional[str] = "2022-06-20"
    satellite_source: str = "Sentinel-1"
    sensitivity_threshold_db: float = -14.5
    filter_speckle: bool = True

class FloodMaskResponse(BaseModel):
    id: str
    event_id: str
    algorithm: str
    flooded_area_sq_km: float
    confidence_score: float
    geojson_data: Dict[str, Any]
    raster_bounds: Optional[List[float]] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SettlementResponse(BaseModel):
    id: str
    event_id: str
    name: str
    district: Optional[str] = None
    latitude: float
    longitude: float
    estimated_population: int
    connectivity_status: str
    flood_exposure_level: str
    flood_distance_meters: float
    nearest_rescue_base_id: Optional[str] = None
    priority_score: float
    priority_rank: int
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class InfrastructureAssetResponse(BaseModel):
    id: str
    event_id: str
    name: str
    asset_type: str
    latitude: float
    longitude: float
    flood_intersection: bool
    exposure_status: str
    distance_to_flood_meters: float
    capacity: int
    contact_info: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RoadSegmentResponse(BaseModel):
    id: str
    event_id: str
    name: Optional[str] = None
    road_type: str
    length_km: float
    coordinates_geojson: Dict[str, Any]
    flood_intersection: bool
    potentially_exposed_length_km: float
    accessibility_status: str
    model_config = ConfigDict(from_attributes=True)

class RescueBaseResponse(BaseModel):
    id: str
    event_id: str
    name: str
    base_type: str
    latitude: float
    longitude: float
    operational_status: str
    personnel_count: int
    boats_count: int
    vehicles_count: int
    model_config = ConfigDict(from_attributes=True)

class RouteAnalysisRequest(BaseModel):
    event_id: str
    base_id: str
    settlement_id: str
    algorithm: str = "dijkstra" # dijkstra, a_star

class RouteAssessmentResponse(BaseModel):
    id: str
    event_id: str
    base_id: str
    settlement_id: str
    route_classification: str
    distance_km: float
    estimated_time_minutes: float
    waypoints_geojson: Dict[str, Any]
    flood_exposure_summary: str
    verification_status: str
    model_config = ConfigDict(from_attributes=True)

class PriorityWeightSettings(BaseModel):
    population_weight: float = 0.30
    isolation_weight: float = 0.30
    flood_severity_weight: float = 0.20
    infrastructure_weight: float = 0.15
    uncertainty_weight: float = 0.05

class PriorityAssessmentResponse(BaseModel):
    id: str
    settlement_id: str
    settlement_name: str
    score: float
    rank: int
    population_factor: float
    isolation_factor: float
    flood_factor: float
    infra_factor: float
    uncertainty_factor: float
    weights_json: Dict[str, float]
    explanation: str

class CopilotChatRequest(BaseModel):
    event_id: Optional[str] = None
    session_id: Optional[str] = "default"
    message: str

class CopilotChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    references: Optional[List[Dict[str, Any]]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ReportGenerateRequest(BaseModel):
    event_id: str
    format: str = "PDF" # PDF, CSV, GEOJSON
    title: Optional[str] = None
    author: Optional[str] = "FloodGuard Command Operations"

class FieldObservationCreate(BaseModel):
    event_id: str
    observer_name: str = "NDRF Field Scout"
    observation_type: str
    latitude: float
    longitude: float
    description: str
    water_depth_meters: float = 0.0
    image_url: Optional[str] = None
