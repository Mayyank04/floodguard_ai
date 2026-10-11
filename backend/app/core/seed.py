import logging
from app.core.database import SessionLocal, init_db
from app.models.models import (
    DisasterEvent, Region, SatelliteScene, FloodMask,
    Settlement, InfrastructureAsset, RoadSegment, RescueBase,
    PriorityAssessment, AuditLog
)
from app.data.assam_flood_dataset import (
    ASSAM_EVENT_DATA, ASSAM_SATELLITE_SCENES, ASSAM_SETTLEMENTS,
    ASSAM_RESCUE_BASES, ASSAM_INFRASTRUCTURE, ASSAM_ROADS,
    get_historical_flood_geojson
)
from app.services.satellite_engine import satellite_engine
from app.services.infrastructure_service import infrastructure_service
from app.services.isolation_service import isolation_engine
from app.services.priority_service import priority_engine
from shapely.geometry import shape

logger = logging.getLogger(__name__)

def seed_database():
    """
    Seeds database with authentic Assam historical flood event and ground-truth GIS data.
    """
    init_db()
    db = SessionLocal()
    try:
        # Check if event already exists
        existing_event = db.query(DisasterEvent).first()
        if existing_event:
            logger.info("Database already seeded with disaster event: %s", existing_event.title)
            return existing_event.id

        logger.info("Seeding database with authentic Assam 2022 flood dataset...")

        # 1. Create Disaster Event
        event = DisasterEvent(**ASSAM_EVENT_DATA)
        db.add(event)
        db.flush()

        # 2. Create Region
        region = Region(
            name="Barpeta & Lower Assam Basin",
            code="IN-AS-BARPETA",
            state="Assam",
            country="India",
            center_lat=26.3211,
            center_lon=91.0065,
            zoom_level=11,
            bounds_geojson={
                "type": "Polygon",
                "coordinates": [[
                    [90.75, 26.05],
                    [91.35, 26.05],
                    [91.35, 26.55],
                    [90.75, 26.55],
                    [90.75, 26.05]
                ]]
            }
        )
        db.add(region)

        # 3. Satellite Scenes
        scene_ids = []
        for s in ASSAM_SATELLITE_SCENES:
            scene = SatelliteScene(event_id=event.id, **s)
            db.add(scene)
            db.flush()
            scene_ids.append(scene.id)

        # 4. Flood Mask (Sentinel-1 SAR)
        flood_geojson = get_historical_flood_geojson()
        flood_geom = shape(flood_geojson["features"][0]["geometry"])
        flooded_area = satellite_engine.calculate_polygon_area_sq_km(flood_geom)

        flood_mask = FloodMask(
            event_id=event.id,
            scene_id=scene_ids[1] if len(scene_ids) > 1 else None,
            algorithm="SAR_BACKSCATTER_THRESHOLD (-14.5 dB)",
            flooded_area_sq_km=flooded_area,
            confidence_score=0.94,
            geojson_data=flood_geojson,
            raster_bounds=[90.75, 26.05, 91.35, 26.55],
            metadata_json={
                "sensor": "Sentinel-1 C-SAR IW GRDH",
                "polarization": "VV+VH",
                "acquisition_dates": ["2022-05-28", "2022-06-20"],
                "speckle_filter": "Lee Sigma 5x5",
                "methodology": "Dual-date radar backscatter change detection"
            }
        )
        db.add(flood_mask)

        # 5. Rescue Bases
        base_entities = []
        for b in ASSAM_RESCUE_BASES:
            base = RescueBase(event_id=event.id, **b)
            db.add(base)
            db.flush()
            base_entities.append(base)

        # 6. Infrastructure Assets
        analyzed_assets = infrastructure_service.analyze_asset_exposure(ASSAM_INFRASTRUCTURE, flood_geom)
        for a in analyzed_assets:
            infra = InfrastructureAsset(
                event_id=event.id,
                name=a["name"],
                asset_type=a["asset_type"],
                latitude=a["latitude"],
                longitude=a["longitude"],
                flood_intersection=a["flood_intersection"],
                exposure_status=a["exposure_status"],
                distance_to_flood_meters=a["distance_to_flood_meters"],
                capacity=a["capacity"],
                contact_info=a.get("contact_info", "Disaster Helpline")
            )
            db.add(infra)

        # 7. Road Segments
        analyzed_roads = infrastructure_service.analyze_road_exposure(ASSAM_ROADS, flood_geom)
        for r in analyzed_roads:
            road = RoadSegment(
                event_id=event.id,
                name=r["name"],
                road_type=r["road_type"],
                length_km=r["length_km"],
                coordinates_geojson={"type": "LineString", "coordinates": r["coordinates"]},
                flood_intersection=r["flood_intersection"],
                potentially_exposed_length_km=r["potentially_exposed_length_km"],
                accessibility_status=r["accessibility_status"]
            )
            db.add(road)

        # 8. Settlements & Isolation Analysis
        base_dicts = [
            {"id": b.id, "name": b.name, "latitude": b.latitude, "longitude": b.longitude}
            for b in base_entities
        ]
        isolated_settlements = isolation_engine.analyze_isolation(
            ASSAM_SETTLEMENTS, base_dicts, analyzed_roads
        )

        # Priority calculation
        priorities = priority_engine.calculate_priorities(
            isolated_settlements, analyzed_assets
        )
        prio_map = {p["settlement_name"]: p for p in priorities}

        settlement_entities = []
        for s in isolated_settlements:
            prio_info = prio_map.get(s["name"], {})
            settlement = Settlement(
                event_id=event.id,
                name=s["name"],
                district=s["district"],
                latitude=s["latitude"],
                longitude=s["longitude"],
                estimated_population=s["estimated_population"],
                connectivity_status=s["connectivity_status"],
                flood_exposure_level=s["flood_exposure_level"],
                flood_distance_meters=s["flood_distance_meters"],
                nearest_rescue_base_id=base_entities[0].id if base_entities else None,
                priority_score=prio_info.get("score", s.get("priority_score", 50.0)),
                priority_rank=prio_info.get("rank", s.get("priority_rank", 1)),
                notes=s.get("notes", "")
            )
            db.add(settlement)
            db.flush()
            settlement_entities.append(settlement)

            # Store Priority Assessment
            p_record = PriorityAssessment(
                event_id=event.id,
                settlement_id=settlement.id,
                score=prio_info.get("score", 50.0),
                rank=prio_info.get("rank", 1),
                population_factor=prio_info.get("population_factor", 0.5),
                isolation_factor=prio_info.get("isolation_factor", 0.5),
                flood_factor=prio_info.get("flood_factor", 0.5),
                infra_factor=prio_info.get("infra_factor", 0.5),
                uncertainty_factor=prio_info.get("uncertainty_factor", 0.1),
                weights_json=prio_info.get("weights_used", {}),
                explanation=prio_info.get("explanation", "Standard priority assessment.")
            )
            db.add(p_record)

        # 9. Audit Log
        db.add(AuditLog(
            event_id=event.id,
            action="INITIAL_HISTORICAL_EVENT_INGESTION",
            actor="SYSTEM_SETUP",
            details_json={
                "event_title": event.title,
                "settlements_loaded": len(isolated_settlements),
                "infrastructure_loaded": len(analyzed_assets),
                "roads_loaded": len(analyzed_roads),
                "flooded_area_sq_km": flooded_area
            }
        ))

        db.commit()
        logger.info("Successfully seeded database with event id: %s", event.id)
        return event.id

    except Exception as e:
        db.rollback()
        logger.error("Failed to seed database: %s", e)
        raise e
    finally:
        db.close()
