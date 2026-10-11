import math
import logging
import networkx as nx
from typing import Dict, Any, List, Optional
from app.services.isolation_service import isolation_engine

logger = logging.getLogger(__name__)

class RescueRoutingEngine:
    """
    Rescue route assessment and multi-scenario pathfinder.
    Implements Dijkstra and A* search on mapped road network graphs.
    Provides clear risk classifications and safety disclaimers.
    """

    def analyze_route(
        self,
        base: Dict[str, Any],
        settlement: Dict[str, Any],
        roads: List[Dict[str, Any]],
        algorithm: str = "dijkstra"
    ) -> Dict[str, Any]:
        """
        Calculates both baseline (shortest direct) and unflooded candidate routes.
        """
        G_full, G_scenario = isolation_engine.build_network_graphs(roads, [base], [settlement])

        start_node = (round(base["longitude"], 4), round(base["latitude"], 4))
        end_node = (round(settlement["longitude"], 4), round(settlement["latitude"], 4))

        # Check unflooded route first
        has_dry_route = (
            start_node in G_scenario and end_node in G_scenario and nx.has_path(G_scenario, start_node, end_node)
        )
        has_full_route = (
            start_node in G_full and end_node in G_full and nx.has_path(G_full, start_node, end_node)
        )

        if has_dry_route:
            if algorithm == "a_star":
                # Euclidean heuristic
                def heuristic(u, v):
                    return math.sqrt(((u[0]-v[0])*99.77)**2 + ((u[1]-v[1])*110.8)**2)
                path = nx.astar_path(G_scenario, start_node, end_node, heuristic=heuristic, weight="length_km")
                dist = nx.astar_path_length(G_scenario, start_node, end_node, heuristic=heuristic, weight="length_km")
            else:
                path = nx.shortest_path(G_scenario, start_node, end_node, weight="length_km")
                dist = nx.shortest_path_length(G_scenario, start_node, end_node, weight="length_km")

            classification = "unexposed_candidate_route"
            exposure_summary = "Candidate route does not intersect satellite-detected flood polygons."
            est_speed_kmh = 35.0 # Disaster relief convoy speed
            est_time_minutes = round((dist / est_speed_kmh) * 60, 1)

        elif has_full_route:
            # Route exists but encounters flooded segments
            path = nx.shortest_path(G_full, start_node, end_node, weight="length_km")
            dist = nx.shortest_path_length(G_full, start_node, end_node, weight="length_km")
            
            classification = "flood_exposed_candidate_route"
            exposure_summary = "Route intersects floodwater. Road segments may be submerged, washed out, or impassable without boat/amphibious transport."
            est_time_minutes = round((dist / 15.0) * 60, 1) # Severely reduced speed

        else:
            return {
                "base_id": base.get("id"),
                "base_name": base.get("name"),
                "settlement_id": settlement.get("id"),
                "settlement_name": settlement.get("name"),
                "route_classification": "no_mapped_route",
                "distance_km": 0.0,
                "estimated_time_minutes": 0.0,
                "waypoints_geojson": {
                    "type": "LineString",
                    "coordinates": []
                },
                "flood_exposure_summary": "No mapped route exists in the OpenStreetMap network to this destination under current modeling assumptions.",
                "verification_status": "inaccessible_by_road",
                "safety_disclaimer": "Air-drop, helicopter staging, or amphibious boat rescue required."
            }

        # Convert path nodes to GeoJSON coordinates
        geojson_coords = [[node[0], node[1]] for node in path]

        return {
            "base_id": base.get("id"),
            "base_name": base.get("name"),
            "settlement_id": settlement.get("id"),
            "settlement_name": settlement.get("name"),
            "route_classification": classification,
            "algorithm_used": algorithm.upper(),
            "distance_km": round(dist, 2),
            "estimated_time_minutes": est_time_minutes,
            "waypoints_geojson": {
                "type": "LineString",
                "coordinates": geojson_coords
            },
            "flood_exposure_summary": exposure_summary,
            "verification_status": "preliminary_planning_aid_unverified",
            "safety_disclaimer": (
                "IMPORTANT SAFETY NOTICE: This route is a preliminary computational planning aid "
                "generated from satellite observations and OpenStreetMap geometries. "
                "Satellite imagery CANNOT confirm that a road surface is structurally sound or passable. "
                "All routes require operational ground or UAV reconnaissance before dispatch."
            )
        }

routing_engine = RescueRoutingEngine()
