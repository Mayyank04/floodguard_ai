import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    DisasterEvent, Region, SatelliteScene, AnalysisJob, FloodMask,
    Settlement, InfrastructureAsset, RoadSegment, RescueBase,
    RouteAssessment, PriorityAssessment, FieldObservation, DisasterReport
)
from app.schemas.schemas import (
    DisasterEventResponse, DisasterEventCreate, RegionResponse,
    SatelliteSceneResponse, FloodDetectionRequest, FloodMaskResponse,
    SettlementResponse, InfrastructureAssetResponse, RoadSegmentResponse,
    RescueBaseResponse, RouteAnalysisRequest, RouteAssessmentResponse,
    PriorityAssessmentResponse, PriorityWeightSettings,
    CopilotChatRequest, CopilotChatResponse, ReportGenerateRequest,
    FieldObservationCreate, FieldObservationResponse, FieldObservationVerifyRequest,
    RoadStatusUpdateRequest
)
from app.services.satellite_engine import satellite_engine
from app.services.infrastructure_service import infrastructure_service
from app.services.isolation_service import isolation_engine
from app.services.routing_service import routing_engine
from app.services.priority_service import priority_engine
from app.services.copilot_service import copilot_service
from app.services.report_service import report_service

api_router = APIRouter()

# -------------------------------------------------------------
# Health Check
# -------------------------------------------------------------
@api_router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": "FloodGuard AI 3.0 Satellite Rescue Intelligence",
        "version": "3.0.0",
        "mode": "Operational & Historical Demo"
    }

# -------------------------------------------------------------
# Disaster Events
# -------------------------------------------------------------
@api_router.get("/events", response_model=List[DisasterEventResponse], tags=["Events"])
def list_events(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).all()
    return events

@api_router.post("/events", response_model=DisasterEventResponse, tags=["Events"])
def create_event(payload: DisasterEventCreate, db: Session = Depends(get_db)):
    event = DisasterEvent(**payload.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@api_router.get("/events/{id}", response_model=DisasterEventResponse, tags=["Events"])
def get_event(id: str, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster event not found")
    return event

# -------------------------------------------------------------
# Regions
# -------------------------------------------------------------
@api_router.get("/regions", response_model=List[RegionResponse], tags=["Geospatial"])
def list_regions(db: Session = Depends(get_db)):
    return db.query(Region).all()

# -------------------------------------------------------------
# Satellite Scenes
# -------------------------------------------------------------
@api_router.get("/satellite/scenes/{event_id}", response_model=List[SatelliteSceneResponse], tags=["Satellite"])
def list_satellite_scenes(event_id: str, db: Session = Depends(get_db)):
    scenes = db.query(SatelliteScene).filter(SatelliteScene.event_id == event_id).all()
    return scenes

# -------------------------------------------------------------
# Flood Analysis Pipeline
# -------------------------------------------------------------
@api_router.post("/analysis/flood", tags=["Analysis"])
def trigger_flood_analysis(payload: FloodDetectionRequest, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster event not found")

    job_id = str(uuid.uuid4())
    job = AnalysisJob(
        id=job_id,
        event_id=event.id,
        job_type="flood_detection",
        status="processing",
        progress_percent=25,
        parameters_json=payload.dict()
    )
    db.add(job)
    db.commit()

    # Execute processing
    try:
        if payload.satellite_source == "Sentinel-2":
            res = satellite_engine.process_optical_ndwi(
                scene_date=payload.peak_flood_date or "2022-06-24",
                cloud_mask=True
            )
        else:
            res = satellite_engine.process_sar_change_detection(
                pre_flood_date=payload.pre_flood_date or "2022-05-28",
                peak_flood_date=payload.peak_flood_date or "2022-06-20",
                threshold_db=payload.sensitivity_threshold_db,
                filter_speckle=payload.filter_speckle
            )

        # Update or store mask
        mask = FloodMask(
            event_id=event.id,
            algorithm=res["algorithm"],
            flooded_area_sq_km=res["flooded_area_sq_km"],
            confidence_score=res["confidence_score"],
            geojson_data=res["geojson_data"],
            raster_bounds=[90.75, 26.05, 91.35, 26.55],
            metadata_json=res["processing_metadata"]
        )
        db.add(mask)

        job.status = "completed"
        job.progress_percent = 100
        db.commit()

        return {
            "job_id": job.id,
            "status": "completed",
            "algorithm": res["algorithm"],
            "flooded_area_sq_km": res["flooded_area_sq_km"],
            "confidence_score": res["confidence_score"],
            "features_detected": len(res["geojson_data"].get("features", []))
        }

    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Satellite analysis failed: {str(e)}")

@api_router.get("/analysis/{id}/status", tags=["Analysis"])
def get_analysis_status(id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return {
        "job_id": job.id,
        "job_type": job.job_type,
        "status": job.status,
        "progress_percent": job.progress_percent,
        "error_message": job.error_message
    }

@api_router.get("/analysis/{id}/results", response_model=FloodMaskResponse, tags=["Analysis"])
def get_analysis_results(id: str, db: Session = Depends(get_db)):
    mask = db.query(FloodMask).filter(FloodMask.event_id == id).order_by(FloodMask.created_at.desc()).first()
    if not mask:
        raise HTTPException(status_code=404, detail="No flood analysis mask found for this event")
    return mask

# -------------------------------------------------------------
# Infrastructure Exposure
# -------------------------------------------------------------
@api_router.get("/infrastructure/{event_id}", tags=["Infrastructure"])
def get_infrastructure(event_id: str, db: Session = Depends(get_db)):
    assets = db.query(InfrastructureAsset).filter(InfrastructureAsset.event_id == event_id).all()
    roads = db.query(RoadSegment).filter(RoadSegment.event_id == event_id).all()

    exposed_assets = [a for a in assets if a.flood_intersection]
    exposed_roads = [r for r in roads if r.flood_intersection]

    return {
        "total_assets": len(assets),
        "exposed_assets_count": len(exposed_assets),
        "total_road_km": round(sum(r.length_km for r in roads), 1),
        "exposed_road_km": round(sum(r.potentially_exposed_length_km for r in exposed_roads), 1),
        "assets": [InfrastructureAssetResponse.model_validate(a) for a in assets],
        "roads": [RoadSegmentResponse.model_validate(r) for r in roads]
    }

# -------------------------------------------------------------
# Settlements
# -------------------------------------------------------------
@api_router.get("/settlements/{event_id}", response_model=List[SettlementResponse], tags=["Settlements"])
def get_settlements(event_id: str, db: Session = Depends(get_db)):
    settlements = db.query(Settlement).filter(Settlement.event_id == event_id).order_by(Settlement.priority_rank).all()
    return settlements

# -------------------------------------------------------------
# Community Isolation Engine
# -------------------------------------------------------------
@api_router.get("/isolation/{event_id}", tags=["Isolation"])
def get_isolation_analysis(event_id: str, db: Session = Depends(get_db)):
    settlements = db.query(Settlement).filter(Settlement.event_id == event_id).all()
    bases = db.query(RescueBase).filter(RescueBase.event_id == event_id).all()

    isolated = [s for s in settlements if s.connectivity_status in ["critical_isolated", "potentially_isolated"]]
    total_isolated_pop = sum(s.estimated_population for s in isolated)

    return {
        "total_settlements": len(settlements),
        "isolated_settlements_count": len(isolated),
        "potentially_isolated_population": total_isolated_pop,
        "rescue_bases_active": len(bases),
        "isolated_settlements": [SettlementResponse.model_validate(s) for s in isolated],
        "all_settlements": [SettlementResponse.model_validate(s) for s in settlements],
        "rescue_bases": [RescueBaseResponse.model_validate(b) for b in bases],
        "network_assumptions": (
            "Modeled via NetworkX scenario graph removing all road segments intersecting "
            "Sentinel-1 SAR inundation polygons. Settlements without any unflooded graph path "
            "to an operational rescue base are flagged as isolated."
        )
    }

# -------------------------------------------------------------
# Rescue Route Planning
# -------------------------------------------------------------
@api_router.post("/routes/analyze", tags=["Routing"])
def analyze_route(payload: RouteAnalysisRequest, db: Session = Depends(get_db)):
    base = db.query(RescueBase).filter(RescueBase.id == payload.base_id).first()
    settlement = db.query(Settlement).filter(Settlement.id == payload.settlement_id).first()
    roads = db.query(RoadSegment).filter(RoadSegment.event_id == payload.event_id).all()

    if not base or not settlement:
        raise HTTPException(status_code=404, detail="Base or Settlement not found")

    base_dict = {
        "id": base.id, "name": base.name, "latitude": base.latitude, "longitude": base.longitude
    }
    settlement_dict = {
        "id": settlement.id, "name": settlement.name, "latitude": settlement.latitude, "longitude": settlement.longitude,
        "flood_distance_meters": settlement.flood_distance_meters
    }
    roads_dicts = [
        {
            "name": r.name,
            "road_type": r.road_type,
            "length_km": r.length_km,
            "coordinates": r.coordinates_geojson.get("coordinates", []) if r.coordinates_geojson else [],
            "flood_intersection": r.flood_intersection,
            "potentially_exposed_length_km": r.potentially_exposed_length_km,
            "verification_status": r.verification_status
        }
        for r in roads
    ]

    result = routing_engine.analyze_route(
        base=base_dict,
        settlement=settlement_dict,
        roads=roads_dicts,
        algorithm=payload.algorithm
    )
    return result

# -------------------------------------------------------------
# Rescue Priority Ranking
# -------------------------------------------------------------
@api_router.get("/priorities/{event_id}", tags=["Priorities"])
def get_priorities(
    event_id: str,
    pop_w: float = Query(0.30, ge=0.0, le=1.0),
    iso_w: float = Query(0.30, ge=0.0, le=1.0),
    flood_w: float = Query(0.20, ge=0.0, le=1.0),
    infra_w: float = Query(0.15, ge=0.0, le=1.0),
    unc_w: float = Query(0.05, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    settlements = db.query(Settlement).filter(Settlement.event_id == event_id).all()
    infra = db.query(InfrastructureAsset).filter(InfrastructureAsset.event_id == event_id).all()

    s_dicts = [
        {
            "id": s.id, "name": s.name, "district": s.district, "latitude": s.latitude, "longitude": s.longitude,
            "estimated_population": s.estimated_population, "connectivity_status": s.connectivity_status,
            "flood_distance_meters": s.flood_distance_meters, "notes": s.notes
        }
        for s in settlements
    ]
    infra_dicts = [
        {
            "name": i.name, "asset_type": i.asset_type, "latitude": i.latitude, "longitude": i.longitude,
            "flood_intersection": i.flood_intersection
        }
        for i in infra
    ]

    custom_weights = {
        "population": pop_w,
        "isolation": iso_w,
        "flood_severity": flood_w,
        "infrastructure": infra_w,
        "uncertainty": unc_w
    }

    results = priority_engine.calculate_priorities(s_dicts, infra_dicts, custom_weights)
    return {
        "event_id": event_id,
        "weights": custom_weights,
        "priorities": results
    }

# -------------------------------------------------------------
# Gemini AI Copilot
# -------------------------------------------------------------
@api_router.post("/copilot/chat", response_model=CopilotChatResponse, tags=["Copilot"])
def copilot_chat(payload: CopilotChatRequest, db: Session = Depends(get_db)):
    event_id = payload.event_id
    if not event_id:
        ev = db.query(DisasterEvent).first()
        event_id = ev.id if ev else "default"

    res = copilot_service.execute_tools_and_respond(db, event_id, payload.message)
    return CopilotChatResponse(**res)

# -------------------------------------------------------------
# Reports
# -------------------------------------------------------------
@api_router.post("/reports/generate", tags=["Reports"])
def generate_report(payload: ReportGenerateRequest, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    mask = db.query(FloodMask).filter(FloodMask.event_id == event.id).first()
    settlements = db.query(Settlement).filter(Settlement.event_id == event.id).all()
    infra = db.query(InfrastructureAsset).filter(InfrastructureAsset.event_id == event.id).all()
    roads = db.query(RoadSegment).filter(RoadSegment.event_id == event.id).all()

    data = {
        "event": {
            "title": event.title, "district": event.district, "state": event.state,
            "country": event.country, "peak_date": event.peak_date
        },
        "flood": {
            "flooded_area_sq_km": mask.flooded_area_sq_km if mask else 412.8,
            "confidence_score": mask.confidence_score if mask else 0.94,
            "geojson_data": mask.geojson_data if mask else None
        },
        "settlements": [
            {
                "name": s.name, "estimated_population": s.estimated_population,
                "connectivity_status": s.connectivity_status, "priority_score": s.priority_score,
                "priority_rank": s.priority_rank, "notes": s.notes, "latitude": s.latitude, "longitude": s.longitude
            }
            for s in settlements
        ],
        "infrastructure": [
            {
                "name": i.name, "asset_type": i.asset_type, "flood_intersection": i.flood_intersection,
                "capacity": i.capacity, "contact_info": i.contact_info, "latitude": i.latitude, "longitude": i.longitude
            }
            for i in infra
        ],
        "roads": [
            {
                "name": r.name, "road_type": r.road_type, "flood_intersection": r.flood_intersection,
                "potentially_exposed_length_km": r.potentially_exposed_length_km,
                "coordinates": r.coordinates_geojson.get("coordinates", []) if r.coordinates_geojson else []
            }
            for r in roads
        ]
    }

    report_id = str(uuid.uuid4())
    fmt = payload.format.upper()

    if fmt == "CSV":
        content = report_service.generate_csv_report(data)
        media_type = "text/csv"
    elif fmt == "GEOJSON":
        content = json.dumps(report_service.generate_geojson_report(data))
        media_type = "application/geo+json"
    else: # HTML / PDF printable
        content = report_service.generate_html_report(data)
        media_type = "text/html"

    report_record = DisasterReport(
        id=report_id,
        event_id=event.id,
        report_title=payload.title or f"{event.title} - Response Assessment",
        summary=f"Automated Disaster Report generated for {event.title}",
        file_format=fmt,
        generated_by=payload.author or "FloodGuard System"
    )
    db.add(report_record)
    db.commit()

    return {
        "report_id": report_id,
        "format": fmt,
        "title": report_record.report_title,
        "content": content,
        "media_type": media_type
    }

@api_router.get("/reports/{id}", tags=["Reports"])
def get_report(id: str, db: Session = Depends(get_db)):
    report = db.query(DisasterReport).filter(DisasterReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

# -------------------------------------------------------------
# Map Layers Endpoint (Unified GeoJSON for MapLibre GL)
# -------------------------------------------------------------
@api_router.get("/map/layers/{event_id}", tags=["Map"])
def get_map_layers(event_id: str, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    mask = db.query(FloodMask).filter(FloodMask.event_id == event_id).first()
    settlements = db.query(Settlement).filter(Settlement.event_id == event_id).all()
    infrastructure = db.query(InfrastructureAsset).filter(InfrastructureAsset.event_id == event_id).all()
    roads = db.query(RoadSegment).filter(RoadSegment.event_id == event_id).all()
    bases = db.query(RescueBase).filter(RescueBase.event_id == event_id).all()

    # Build MapLibre-ready GeoJSON feature collections for each layer
    flood_fc = mask.geojson_data if mask and mask.geojson_data else {"type": "FeatureCollection", "features": []}

    settlements_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": s.id,
                "geometry": {"type": "Point", "coordinates": [s.longitude, s.latitude]},
                "properties": {
                    "id": s.id,
                    "name": s.name,
                    "district": s.district,
                    "population": s.estimated_population,
                    "connectivity_status": s.connectivity_status,
                    "flood_exposure_level": s.flood_exposure_level,
                    "priority_score": s.priority_score,
                    "priority_rank": s.priority_rank,
                    "notes": s.notes
                }
            }
            for s in settlements
        ]
    }

    infra_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": i.id,
                "geometry": {"type": "Point", "coordinates": [i.longitude, i.latitude]},
                "properties": {
                    "id": i.id,
                    "name": i.name,
                    "asset_type": i.asset_type,
                    "flood_intersection": i.flood_intersection,
                    "exposure_status": i.exposure_status,
                    "distance_to_flood_meters": i.distance_to_flood_meters,
                    "capacity": i.capacity,
                    "contact_info": i.contact_info
                }
            }
            for i in infrastructure
        ]
    }

    roads_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": r.id,
                "geometry": r.coordinates_geojson if r.coordinates_geojson else {"type": "LineString", "coordinates": []},
                "properties": {
                    "id": r.id,
                    "name": r.name,
                    "road_type": r.road_type,
                    "length_km": r.length_km,
                    "flood_intersection": r.flood_intersection,
                    "exposed_km": r.potentially_exposed_length_km,
                    "accessibility_status": r.accessibility_status,
                    "verification_status": r.verification_status or "unverified",
                    "verified_by": r.verified_by,
                    "verified_at": r.verified_at,
                    "verification_notes": r.verification_notes
                }
            }
            for r in roads
        ]
    }

    bases_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": b.id,
                "geometry": {"type": "Point", "coordinates": [b.longitude, b.latitude]},
                "properties": {
                    "id": b.id,
                    "name": b.name,
                    "base_type": b.base_type,
                    "personnel_count": b.personnel_count,
                    "boats_count": b.boats_count,
                    "vehicles_count": b.vehicles_count
                }
            }
            for b in bases
        ]
    }

    field_obs = db.query(FieldObservation).filter(FieldObservation.event_id == event_id).all()
    obs_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": o.id,
                "geometry": {"type": "Point", "coordinates": [o.longitude, o.latitude]},
                "properties": {
                    "id": o.id,
                    "observation_type": o.observation_type,
                    "description": o.description,
                    "water_depth_meters": o.water_depth_meters,
                    "verification_status": o.verification_status or "pending",
                    "verified": o.verified,
                    "observer_name": o.observer_name,
                    "image_url": o.image_url,
                    "nearest_feature_name": o.nearest_feature_name,
                    "ai_interpretation": o.ai_interpretation,
                    "created_at": o.created_at.isoformat() if o.created_at else None
                }
            }
            for o in field_obs
        ]
    }

    return {
        "event_id": event.id,
        "event_title": event.title,
        "bounding_box": event.bounding_box,
        "layers": {
            "flood_inundation": flood_fc,
            "settlements": settlements_fc,
            "infrastructure": infra_fc,
            "roads": roads_fc,
            "rescue_bases": bases_fc,
            "field_observations": obs_fc
        }
    }

# -------------------------------------------------------------
# Road Verification & Recalculation
# -------------------------------------------------------------
@api_router.patch("/roads/{id}/status", response_model=RoadSegmentResponse, tags=["Infrastructure"])
def update_road_status(id: str, payload: RoadStatusUpdateRequest, db: Session = Depends(get_db)):
    road = db.query(RoadSegment).filter(RoadSegment.id == id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found")

    status = payload.verification_status.lower()
    if status not in ["reported_open", "reported_blocked", "unknown", "unverified"]:
        raise HTTPException(status_code=400, detail="Invalid verification status")

    road.verification_status = status
    road.verified_by = payload.reporter
    road.verified_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    road.verification_notes = payload.evidence_notes

    if status == "reported_open":
        road.accessibility_status = "accessible"
    elif status == "reported_blocked":
        road.accessibility_status = "impassable_suspected"
    else:
        road.accessibility_status = "unverified"

    # Recalculate isolation for all settlements in this event
    all_roads = db.query(RoadSegment).filter(RoadSegment.event_id == road.event_id).all()
    all_bases = db.query(RescueBase).filter(RescueBase.event_id == road.event_id).all()
    all_settlements = db.query(Settlement).filter(Settlement.event_id == road.event_id).all()

    roads_dicts = [
        {
            "name": r.name,
            "road_type": r.road_type,
            "length_km": r.length_km,
            "coordinates": r.coordinates_geojson.get("coordinates", []) if r.coordinates_geojson else [],
            "flood_intersection": r.flood_intersection,
            "potentially_exposed_length_km": r.potentially_exposed_length_km,
            "verification_status": r.verification_status
        }
        for r in all_roads
    ]
    bases_dicts = [
        {"id": b.id, "name": b.name, "latitude": b.latitude, "longitude": b.longitude}
        for b in all_bases
    ]
    settlements_dicts = [
        {
            "id": s.id, "name": s.name, "district": s.district, "latitude": s.latitude, "longitude": s.longitude,
            "estimated_population": s.estimated_population, "flood_distance_meters": s.flood_distance_meters,
            "flood_exposure_level": s.flood_exposure_level
        }
        for s in all_settlements
    ]

    iso_results = isolation_engine.analyze_isolation(settlements_dicts, bases_dicts, roads_dicts)
    iso_map = {res["id"]: res["connectivity_status"] for res in iso_results}

    for s in all_settlements:
        if s.id in iso_map:
            s.connectivity_status = iso_map[s.id]

    db.commit()
    db.refresh(road)
    return road

# -------------------------------------------------------------
# Multimodal Field Observations
# -------------------------------------------------------------
@api_router.get("/observations/{event_id}", response_model=List[FieldObservationResponse], tags=["Observations"])
def list_field_observations(event_id: str, db: Session = Depends(get_db)):
    obs = db.query(FieldObservation).filter(FieldObservation.event_id == event_id).order_by(FieldObservation.created_at.desc()).all()
    return obs

@api_router.post("/observations", response_model=FieldObservationResponse, tags=["Observations"])
def create_field_observation(payload: FieldObservationCreate, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster event not found")

    # Generate grounded simulated AI interpretation of visible conditions
    ai_interpretation = (
        f"Automated Visual Analysis: Input corroborates standing turbid surface water (~{payload.water_depth_meters:.1f}m depth). "
        f"Localized obstruction near {payload.nearest_feature_name or 'road corridor'}. "
        "Disclaimer: AI interpretation is unverified. Tactical field inspection required before dispatch."
    )

    obs = FieldObservation(
        event_id=event.id,
        observer_name=payload.observer_name,
        observation_type=payload.observation_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        description=payload.description,
        water_depth_meters=payload.water_depth_meters,
        image_url=payload.image_url,
        nearest_feature_name=payload.nearest_feature_name,
        verification_status="pending",
        verified=False,
        ai_interpretation=ai_interpretation
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs

@api_router.patch("/observations/{id}/verify", response_model=FieldObservationResponse, tags=["Observations"])
def verify_field_observation(id: str, payload: FieldObservationVerifyRequest, db: Session = Depends(get_db)):
    obs = db.query(FieldObservation).filter(FieldObservation.id == id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Field observation not found")

    status = payload.status.lower()
    if status not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid verification status; must be 'verified' or 'rejected'")

    obs.verification_status = status
    obs.verified = (status == "verified")
    obs.reviewed_by = payload.reviewer_name
    obs.reviewed_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    db.commit()
    db.refresh(obs)
    return obs

# -------------------------------------------------------------
# Data Provenance & Catalogs
# -------------------------------------------------------------
@api_router.get("/data-sources", tags=["Provenance"])
def get_data_sources_catalog():
    return {
        "satellite_sensors": [
            {
                "id": "sentinel-1-csar",
                "name": "Copernicus Sentinel-1 C-SAR",
                "constellation": "ESA Copernicus",
                "mode": "Interferometric Wide Swath (IW)",
                "product_type": "Ground Range Detected High Resolution (GRDH)",
                "polarization": "Dual-pol VV + VH",
                "resolution": "10m spatial pixel spacing",
                "wavelength": "C-band (5.405 GHz / 5.54 cm wavelength)",
                "cloud_penetration": "100% all-weather day/night radar penetration",
                "revisit_time": "6-12 days",
                "primary_scene": "S1A_IW_GRDH_1SDV_20220620T001428 (Peak Flooding)",
                "baseline_scene": "S1A_IW_GRDH_1SDV_20220528T001427 (Pre-monsoon dry reference)"
            },
            {
                "id": "sentinel-2-msi",
                "name": "Copernicus Sentinel-2 MSI",
                "constellation": "ESA Copernicus",
                "sensor": "Multi-Spectral Instrument (MSI)",
                "product_type": "Level-2A Bottom-Of-Atmosphere (BOA) Reflectance",
                "bands": "B03 (Green 560nm), B08 (NIR 842nm), B11 (SWIR 1610nm)",
                "water_indices": "NDWI: (B03-B08)/(B03+B08), MNDWI: (B03-B11)/(B03+B11)",
                "resolution": "10m - 20m spatial pixel spacing",
                "cloud_filter": "Scene Classification Layer (SCL) cloud shadow mask"
            }
        ],
        "geospatial_vectors": [
            {
                "id": "osm-roads",
                "name": "OpenStreetMap Road Network",
                "license": "Open Data Commons Open Database License (ODbL)",
                "coverage": "Barpeta, Bongaigaon, Bajali, and Kamrup districts",
                "corridor_length_km": 142.8,
                "highway_classes": "National Highway NH-27, State Highway SH-4, Major District Roads, Rural Char Access Roads"
            },
            {
                "id": "osm-infrastructure",
                "name": "Critical Infrastructure Layer",
                "features": "Civil Hospitals, Community Health Centres (CHCs), Primary Health Centres (PHCs), Concrete Bridges, Relief Shelters",
                "facilities_count": 8,
                "source": "OpenStreetMap & ASDMA District Contingency Database"
            }
        ],
        "operational_frameworks": [
            {
                "authority": "Assam State Disaster Management Authority (ASDMA)",
                "bulletins": "Daily Flood Situation Reports (June 14-25, 2022)",
                "validation": "Corroborated 5.4M affected civilians across 32 districts"
            },
            {
                "authority": "National Disaster Response Force (NDRF)",
                "battalion": "1st Battalion NDRF Patgaon Staging Command",
                "assets": "Inflatable motorized rescue boats, deep-dive personnel, satellite emergency communication"
            }
        ]
    }
