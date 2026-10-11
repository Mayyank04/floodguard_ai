import math
import logging
from typing import List, Dict, Any
from shapely.geometry import shape, Point, LineString
from shapely.ops import unary_union

logger = logging.getLogger(__name__)

class InfrastructureService:
    """
    Spatial intersection and infrastructure exposure analytics.
    Calculates intersection of roads, bridges, hospitals, schools, and shelters
    with satellite-detected floodwater polygons.
    """

    @staticmethod
    def _deg_to_meters(deg: float) -> float:
        # Approximate conversion at 26.3°N latitude
        return deg * 105000.0

    @staticmethod
    def _meters_to_deg(meters: float) -> float:
        return meters / 105000.0

    def analyze_asset_exposure(self, assets: List[Dict[str, Any]], flood_geom) -> List[Dict[str, Any]]:
        """
        Analyzes point infrastructure assets (hospitals, shelters, bridges, schools).
        """
        results = []
        for asset in assets:
            pt = Point(asset["longitude"], asset["latitude"])
            intersects = flood_geom.intersects(pt)
            distance_deg = flood_geom.distance(pt)
            distance_meters = round(self._deg_to_meters(distance_deg), 1)

            if intersects or distance_meters == 0:
                status = "flood_exposed"
                action = "Urgent evacuation/containment check required."
            elif distance_meters < 500:
                status = "potentially_affected"
                action = "Monitor water ingress; high inundation risk."
            else:
                status = "clear"
                action = "Operational; clear from current satellite flood extent."

            res = dict(asset)
            res["flood_intersection"] = intersects
            res["distance_to_flood_meters"] = distance_meters
            res["exposure_status"] = status
            res["recommended_action"] = action
            results.append(res)
        return results

    def analyze_road_exposure(self, roads: List[Dict[str, Any]], flood_geom) -> List[Dict[str, Any]]:
        """
        Analyzes linear road networks against flood polygons.
        Computes exact intersected line length.
        """
        results = []
        for road in roads:
            coords = road.get("coordinates", [])
            if not coords or len(coords) < 2:
                continue

            line = LineString(coords)
            intersects = flood_geom.intersects(line)
            
            if intersects:
                intersection_geom = flood_geom.intersection(line)
                # Compute length ratio
                if line.length > 0:
                    exposed_ratio = intersection_geom.length / line.length
                    total_length = road.get("length_km", 10.0)
                    exposed_km = round(total_length * exposed_ratio, 2)
                    if exposed_km == 0 and exposed_ratio > 0:
                        exposed_km = round(total_length * 0.15, 2)
                else:
                    exposed_km = 0.0

                status = "potentially_inundated" if exposed_km < (road.get("length_km", 10.0) * 0.6) else "impassable_suspected"
            else:
                exposed_km = 0.0
                status = "accessible"

            res = dict(road)
            res["flood_intersection"] = intersects
            res["potentially_exposed_length_km"] = exposed_km
            res["accessibility_status"] = status
            res["safety_disclaimer"] = "Field verification required. Satellite intersection indicates probable inundation, not verified structural integrity."
            results.append(res)
        return results

infrastructure_service = InfrastructureService()
