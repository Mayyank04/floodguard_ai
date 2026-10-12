import pytest
from fastapi.testclient import TestClient
from shapely.geometry import Polygon, Point, LineString
from app.main import app
from app.core.database import SessionLocal
from app.models.models import DisasterEvent, Settlement, InfrastructureAsset, FloodMask, RoadSegment, FieldObservation
from app.services.satellite_engine import satellite_engine
from app.services.infrastructure_service import infrastructure_service
from app.services.isolation_service import isolation_engine
from app.services.priority_service import priority_engine
from app.services.routing_service import routing_engine
from app.services.report_service import report_service
from app.services.copilot_service import copilot_service
from app.data.assam_flood_dataset import get_historical_flood_geojson

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Flood mask calculation & validity
def test_flood_mask_calculation():
    raw_geojson = get_historical_flood_geojson()
    assert raw_geojson["type"] == "FeatureCollection"
    assert len(raw_geojson["features"]) > 0
    props = raw_geojson["features"][0]["properties"]
    assert "Sentinel-1" in props["source"]
    assert props["confidence_score"] >= 0.90

# 2. Flood area calculation
def test_flood_area_calculation():
    # 0.1 deg x 0.1 deg box ~= 110.8 km x 99.77 km * 0.01 = 110.5 sq km
    poly = Polygon([[91.0, 26.0], [91.1, 26.0], [91.1, 26.1], [91.0, 26.1], [91.0, 26.0]])
    area = satellite_engine.calculate_polygon_area_sq_km(poly)
    assert 100.0 < area < 120.0
    # Zero area test
    assert satellite_engine.calculate_polygon_area_sq_km(None) == 0.0

# 3. Geospatial intersections
def test_geospatial_intersections():
    poly = Polygon([[91.0, 26.0], [91.2, 26.0], [91.2, 26.2], [91.0, 26.2], [91.0, 26.0]])
    assets = [
        {"name": "Inside Hospital", "asset_type": "hospital", "latitude": 26.1, "longitude": 91.1},
        {"name": "Outside School", "asset_type": "school", "latitude": 26.5, "longitude": 91.5}
    ]
    results = infrastructure_service.analyze_asset_exposure(assets, poly)
    assert results[0]["flood_intersection"] is True
    assert results[0]["exposure_status"] == "flood_exposed"
    assert results[1]["flood_intersection"] is False
    assert results[1]["exposure_status"] == "clear"

# 4. Road network connectivity analysis
def test_road_connectivity_analysis():
    roads = [
        {
            "name": "Dry Highway",
            "coordinates": [[91.0, 26.0], [91.1, 26.1]],
            "length_km": 15.0,
            "flood_intersection": False,
            "potentially_exposed_length_km": 0.0
        },
        {
            "name": "Flooded Road",
            "coordinates": [[91.1, 26.1], [91.2, 26.2]],
            "length_km": 10.0,
            "flood_intersection": True,
            "potentially_exposed_length_km": 10.0
        }
    ]
    bases = [{"id": "b1", "name": "Base Alpha", "latitude": 26.0, "longitude": 91.0}]
    settlements = [
        {"id": "s1", "name": "Connected Village", "latitude": 26.1, "longitude": 91.1, "estimated_population": 5000, "flood_distance_meters": 500},
        {"id": "s2", "name": "Isolated Village", "latitude": 26.2, "longitude": 91.2, "estimated_population": 8000, "flood_distance_meters": 0}
    ]

    iso_results = isolation_engine.analyze_isolation(settlements, bases, roads)
    assert len(iso_results) == 2
    s1_res = next(s for s in iso_results if s["id"] == "s1")
    s2_res = next(s for s in iso_results if s["id"] == "s2")
    assert s1_res["connectivity_status"] == "connected"
    assert s2_res["connectivity_status"] in ["critical_isolated", "potentially_isolated"]

# 5. Priority score calculations
def test_priority_score_calculations():
    settlements = [
        {
            "id": "s1", "name": "High Risk Village", "latitude": 26.1, "longitude": 91.0,
            "estimated_population": 40000, "connectivity_status": "critical_isolated",
            "flood_distance_meters": 0.0
        },
        {
            "id": "s2", "name": "Low Risk Town", "latitude": 26.4, "longitude": 91.4,
            "estimated_population": 2000, "connectivity_status": "connected",
            "flood_distance_meters": 2000.0
        }
    ]
    priorities = priority_engine.calculate_priorities(settlements, [])
    assert priorities[0]["settlement_id"] == "s1"
    assert priorities[0]["score"] > priorities[1]["score"]
    assert priorities[0]["rank"] == 1
    assert priorities[1]["rank"] == 2

# 6. API Validation & Health
def test_api_health_and_events():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    events_res = client.get("/api/events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) > 0
    assert "Assam" in events[0]["state"]

# 7. Missing Satellite Data & Error Handling
def test_missing_event_handling():
    res = client.get("/api/events/non-existent-uuid-99999")
    assert res.status_code == 404

# 8. Empty / fallback flood analysis
def test_empty_flood_analysis_handling():
    res = client.post("/api/analysis/flood", json={
        "event_id": "non-existent-id",
        "algorithm": "SAR_BACKSCATTER_THRESHOLD"
    })
    assert res.status_code == 404

# 9. Disconnected road networks routing
def test_disconnected_routing():
    base = {"id": "b1", "name": "Base 1", "latitude": 10.0, "longitude": 10.0}
    settlement = {"id": "s1", "name": "Island", "latitude": 20.0, "longitude": 20.0}
    route = routing_engine.analyze_route(base, settlement, [])
    assert route["route_classification"] == "no_mapped_route"
    assert "Air-drop" in route["safety_disclaimer"]

# 10. Gemini Grounded Copilot Tool Calling
def test_copilot_tool_calling(db_session):
    event = db_session.query(DisasterEvent).first()
    res = client.post("/api/copilot/chat", json={
        "event_id": event.id,
        "message": "Which villages are potentially isolated and why?"
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["content"]) > 50
    assert "Isolated" in data["content"] or "Mandia" in data["content"]
    assert len(data["references"]) > 0

# 10b. Multimodal Field Photo Evaluation Test
def test_copilot_multimodal_photo_query(db_session):
    event = db_session.query(DisasterEvent).first()
    res = client.post("/api/copilot/chat", json={
        "event_id": event.id,
        "message": "Here is an uploaded field observation photograph of submerged road."
    })
    assert res.status_code == 200
    content = res.json()["content"]
    assert "Multimodal Field Observation Analysis" in content
    assert "Satellite Cross-Validation" in content

# 11. Report Generation (HTML, CSV, GeoJSON)
def test_report_generation(db_session):
    event = db_session.query(DisasterEvent).first()
    
    # HTML Report
    html_res = client.post("/api/reports/generate", json={
        "event_id": event.id,
        "format": "PDF",
        "title": "Tactical Field Report"
    })
    assert html_res.status_code == 200
    assert "FLOODGUARD AI" in html_res.json()["content"]

    # CSV Report
    csv_res = client.post("/api/reports/generate", json={
        "event_id": event.id,
        "format": "CSV"
    })
    assert csv_res.status_code == 200
    assert "Priority Rank" in csv_res.json()["content"]

    # GeoJSON Report
    geo_res = client.post("/api/reports/generate", json={
        "event_id": event.id,
        "format": "GEOJSON"
    })
    assert geo_res.status_code == 200
    assert "FeatureCollection" in geo_res.json()["content"]

# 12. Map Layers Endpoint
def test_map_layers(db_session):
    event = db_session.query(DisasterEvent).first()
    res = client.get(f"/api/map/layers/{event.id}")
    assert res.status_code == 200
    data = res.json()
    assert "layers" in data
    assert "settlements" in data["layers"]
    assert "roads" in data["layers"]
    assert "flood_inundation" in data["layers"]
    assert len(data["layers"]["settlements"]["features"]) >= 10

# 13. Infrastructure & Isolation Endpoints
def test_infrastructure_and_isolation_endpoints(db_session):
    event = db_session.query(DisasterEvent).first()
    
    infra_res = client.get(f"/api/infrastructure/{event.id}")
    assert infra_res.status_code == 200
    assert infra_res.json()["exposed_assets_count"] > 0

    iso_res = client.get(f"/api/isolation/{event.id}")
    assert iso_res.status_code == 200
    assert iso_res.json()["isolated_settlements_count"] > 0
    assert iso_res.json()["potentially_isolated_population"] > 10000

# 14. Priority Weights Adjustment Endpoint
def test_custom_priority_weights(db_session):
    event = db_session.query(DisasterEvent).first()
    res = client.get(f"/api/priorities/{event.id}?pop_w=0.6&iso_w=0.1&flood_w=0.1&infra_w=0.1&unc_w=0.1")
    assert res.status_code == 200
    priorities = res.json()["priorities"]
    assert len(priorities) > 0
    assert priorities[0]["weights_used"]["population"] > 0.5

# 15. Road Status Verification & Graph Recalculation
def test_road_status_verification_and_recalculation(db_session):
    event = db_session.query(DisasterEvent).first()
    road = db_session.query(RoadSegment).filter(RoadSegment.event_id == event.id).first()
    assert road is not None

    # Analyst marks road as reported_open
    patch_res = client.patch(f"/api/roads/{road.id}/status", json={
        "verification_status": "reported_open",
        "reporter": "NDRF Lead Scout Maj. Sharma",
        "evidence_notes": "Embankment surveyed; shallow runoff navigable by 4x4 trucks."
    })
    assert patch_res.status_code == 200
    updated_road = patch_res.json()
    assert updated_road["verification_status"] == "reported_open"
    assert updated_road["verified_by"] == "NDRF Lead Scout Maj. Sharma"
    assert updated_road["accessibility_status"] == "accessible"

# 16. Multimodal Field Observation Lifecycle
def test_field_observation_workflow(db_session):
    event = db_session.query(DisasterEvent).first()

    # 1. Submit observation
    post_res = client.post("/api/observations", json={
        "event_id": event.id,
        "observer_name": "SDRF Tactical Unit 3",
        "observation_type": "embankment_breach",
        "latitude": 26.215,
        "longitude": 90.985,
        "description": "Severe 20m breach along Beki river dyke; water rapidly flowing across feeder road.",
        "water_depth_meters": 1.4,
        "nearest_feature_name": "Mandia Char Feeder Rd"
    })
    assert post_res.status_code == 200
    obs = post_res.json()
    obs_id = obs["id"]
    assert obs["verification_status"] == "pending"
    assert "Automated Visual Analysis" in obs["ai_interpretation"]

    # 2. Review and verify
    verify_res = client.patch(f"/api/observations/{obs_id}/verify", json={
        "status": "verified",
        "reviewer_name": "Incident Commander Col. Barua",
        "review_notes": "Confirmed by district flood control drone."
    })
    assert verify_res.status_code == 200
    verified_obs = verify_res.json()
    assert verified_obs["verification_status"] == "verified"
    assert verified_obs["verified"] is True
    assert verified_obs["reviewed_by"] == "Incident Commander Col. Barua"

    # 3. List observations
    list_res = client.get(f"/api/observations/{event.id}")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

# 17. Data Sources Provenance Catalog
def test_data_sources_catalog():
    res = client.get("/api/data-sources")
    assert res.status_code == 200
    data = res.json()
    assert "satellite_sensors" in data
    assert "geospatial_vectors" in data
    assert "operational_frameworks" in data
    assert len(data["satellite_sensors"]) >= 2
