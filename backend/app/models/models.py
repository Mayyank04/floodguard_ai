import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), default="responder") # responder, commander, analyst, admin
    created_at = Column(DateTime, default=datetime.utcnow)

class DisasterEvent(Base):
    __tablename__ = "disaster_events"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    country = Column(String(100), default="India")
    state = Column(String(100), default="Assam")
    district = Column(String(100), default="Barpeta & Morigaon")
    bounding_box = Column(JSON) # [min_lon, min_lat, max_lon, max_lat]
    start_date = Column(String(50))
    peak_date = Column(String(50))
    status = Column(String(50), default="active") # active, closed, historical_demo
    is_historical = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scenes = relationship("SatelliteScene", back_populates="event", cascade="all, delete-orphan")
    flood_masks = relationship("FloodMask", back_populates="event", cascade="all, delete-orphan")
    settlements = relationship("Settlement", back_populates="event", cascade="all, delete-orphan")
    infrastructure = relationship("InfrastructureAsset", back_populates="event", cascade="all, delete-orphan")
    roads = relationship("RoadSegment", back_populates="event", cascade="all, delete-orphan")
    rescue_bases = relationship("RescueBase", back_populates="event", cascade="all, delete-orphan")
    reports = relationship("DisasterReport", back_populates="event", cascade="all, delete-orphan")
    field_observations = relationship("FieldObservation", back_populates="event", cascade="all, delete-orphan")

class Region(Base):
    __tablename__ = "regions"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True)
    state = Column(String(100))
    country = Column(String(100))
    center_lat = Column(Float)
    center_lon = Column(Float)
    zoom_level = Column(Integer, default=11)
    bounds_geojson = Column(JSON)

class SatelliteScene(Base):
    __tablename__ = "satellite_scenes"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    platform = Column(String(50)) # Sentinel-1, Sentinel-2
    sensor = Column(String(50)) # C-SAR, MSI
    acquisition_date = Column(String(50))
    scene_type = Column(String(50)) # pre_flood, peak_flood, post_flood
    cloud_cover_percent = Column(Float, default=0.0)
    resolution_meters = Column(Float, default=10.0)
    polarization = Column(String(20), default="VV+VH")
    thumbnail_url = Column(String(500))
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("DisasterEvent", back_populates="scenes")

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    job_type = Column(String(50)) # flood_detection, road_connectivity, priority_ranking
    status = Column(String(50), default="completed") # pending, processing, completed, failed
    progress_percent = Column(Integer, default=100)
    parameters_json = Column(JSON)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)

class FloodMask(Base):
    __tablename__ = "flood_masks"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    scene_id = Column(String(36), ForeignKey("satellite_scenes.id"), nullable=True)
    algorithm = Column(String(100), default="SAR_BACKSCATTER_THRESHOLD") # SAR_BACKSCATTER_THRESHOLD, OPTICAL_NDWI, HYBRID_FUSION
    flooded_area_sq_km = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.92) # 0.0 - 1.0
    geojson_data = Column(JSON) # MultiPolygon GeoJSON of inundation
    raster_bounds = Column(JSON)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("DisasterEvent", back_populates="flood_masks")

class Settlement(Base):
    __tablename__ = "settlements"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    name = Column(String(150), nullable=False)
    district = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    estimated_population = Column(Integer, default=0)
    connectivity_status = Column(String(50), default="potentially_isolated") # connected, potentially_isolated, critical_isolated, unverified
    flood_exposure_level = Column(String(50), default="severe") # severe, moderate, low, unaffected
    flood_distance_meters = Column(Float, default=0.0)
    nearest_rescue_base_id = Column(String(36), nullable=True)
    priority_score = Column(Float, default=0.0) # 0.0 - 100.0
    priority_rank = Column(Integer, default=0)
    notes = Column(Text)

    event = relationship("DisasterEvent", back_populates="settlements")

class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    name = Column(String(150), nullable=False)
    asset_type = Column(String(50)) # hospital, school, bridge, shelter, water_plant, power_station
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    flood_intersection = Column(Boolean, default=False)
    exposure_status = Column(String(50), default="potentially_affected") # flood_exposed, potentially_affected, clear, unverified
    distance_to_flood_meters = Column(Float, default=0.0)
    capacity = Column(Integer, default=0)
    contact_info = Column(String(100), default="District Control Room")

    event = relationship("DisasterEvent", back_populates="infrastructure")

class RoadSegment(Base):
    __tablename__ = "road_segments"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    name = Column(String(150))
    road_type = Column(String(50)) # national_highway, state_highway, major_district_road, rural_road
    length_km = Column(Float, default=0.0)
    coordinates_geojson = Column(JSON) # LineString GeoJSON
    flood_intersection = Column(Boolean, default=False)
    potentially_exposed_length_km = Column(Float, default=0.0)
    accessibility_status = Column(String(50), default="unverified") # accessible, potentially_inundated, impassable_suspected, unverified
    verification_status = Column(String(50), default="unverified") # unverified, reported_open, reported_blocked, unknown
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(String(50), nullable=True)
    verification_notes = Column(Text, nullable=True)

    event = relationship("DisasterEvent", back_populates="roads")

class RescueBase(Base):
    __tablename__ = "rescue_bases"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    name = Column(String(150), nullable=False)
    base_type = Column(String(50)) # NDRF_Battalion, SDRF_Station, District_EOC, Air_Force_Helipad
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    operational_status = Column(String(50), default="operational")
    personnel_count = Column(Integer, default=45)
    boats_count = Column(Integer, default=8)
    vehicles_count = Column(Integer, default=6)

    event = relationship("DisasterEvent", back_populates="rescue_bases")

class RouteAssessment(Base):
    __tablename__ = "route_assessments"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    base_id = Column(String(36), ForeignKey("rescue_bases.id"))
    settlement_id = Column(String(36), ForeignKey("settlements.id"))
    route_classification = Column(String(50)) # unexposed_candidate_route, flood_exposed_candidate_route, no_mapped_route
    distance_km = Column(Float, default=0.0)
    estimated_time_minutes = Column(Float, default=0.0)
    waypoints_geojson = Column(JSON) # LineString
    flood_exposure_summary = Column(Text)
    verification_status = Column(String(50), default="preliminary_planning_aid_unverified")
    created_at = Column(DateTime, default=datetime.utcnow)

class PriorityAssessment(Base):
    __tablename__ = "priority_assessments"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    settlement_id = Column(String(36), ForeignKey("settlements.id"), nullable=False)
    score = Column(Float, default=0.0) # 0 - 100
    rank = Column(Integer, default=1)
    population_factor = Column(Float, default=0.0)
    isolation_factor = Column(Float, default=0.0)
    flood_factor = Column(Float, default=0.0)
    infra_factor = Column(Float, default=0.0)
    uncertainty_factor = Column(Float, default=0.0)
    weights_json = Column(JSON)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class FieldObservation(Base):
    __tablename__ = "field_observations"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    observer_name = Column(String(100), default="Field Volunteer / NDRF Officer")
    observation_type = Column(String(50)) # flood_depth, bridge_submerged, embankment_breach, shelter_status, road_blocked
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text)
    water_depth_meters = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)
    verification_status = Column(String(50), default="pending") # pending, verified, rejected
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(String(50), nullable=True)
    ai_interpretation = Column(Text, nullable=True)
    nearest_feature_name = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("DisasterEvent", back_populates="field_observations")

class CopilotMessage(Base):
    __tablename__ = "copilot_conversations"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=True)
    session_id = Column(String(100), default="default_session")
    role = Column(String(20)) # user, assistant, system
    content = Column(Text, nullable=False)
    tool_calls_json = Column(JSON, nullable=True)
    references_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DisasterReport(Base):
    __tablename__ = "disaster_reports"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=False)
    report_title = Column(String(255), nullable=False)
    summary = Column(Text)
    stats_json = Column(JSON)
    generated_by = Column(String(100), default="FloodGuard Intelligence System")
    file_format = Column(String(20), default="PDF") # PDF, CSV, GEOJSON
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("DisasterEvent", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=True)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), default="system")
    details_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
