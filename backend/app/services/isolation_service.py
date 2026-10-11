import math
import logging
import networkx as nx
from typing import List, Dict, Any, Tuple
from shapely.geometry import Point, LineString

logger = logging.getLogger(__name__)

class CommunityIsolationEngine:
    """
    Graph-based community isolation analysis engine using NetworkX.
    Constructs a topological network graph of rescue bases, road corridors, and settlements.
    Simulates flood inundation by removing or heavily weighting severed edges.
    Calculates connectivity, reachable components, and isolated population.
    """

    def build_network_graphs(
        self,
        roads: List[Dict[str, Any]],
        bases: List[Dict[str, Any]],
        settlements: List[Dict[str, Any]]
    ) -> Tuple[nx.Graph, nx.Graph]:
        """
        Builds two graphs:
        1. G_full: The full mapped baseline road network
        2. G_scenario: The scenario network with flood-severed segments removed
        """
        G_full = nx.Graph()
        G_scenario = nx.Graph()

        # Add road segments as edges
        for idx, road in enumerate(roads):
            coords = road.get("coordinates", [])
            if len(coords) < 2:
                continue
            
            u_coord = (round(coords[0][0], 4), round(coords[0][1], 4))
            v_coord = (round(coords[-1][0], 4), round(coords[-1][1], 4))
            length_km = road.get("length_km", 5.0)
            is_flooded = road.get("flood_intersection", False)
            exposed_km = road.get("potentially_exposed_length_km", 0.0)

            edge_data = {
                "name": road.get("name", f"Road-{idx}"),
                "length_km": length_km,
                "is_flooded": is_flooded,
                "exposed_km": exposed_km,
                "coordinates": coords,
                "road_type": road.get("road_type", "road")
            }

            G_full.add_edge(u_coord, v_coord, **edge_data)

            # In scenario graph, if road is flooded or severely compromised, exclude or heavily penalize
            if not is_flooded:
                G_scenario.add_edge(u_coord, v_coord, **edge_data)

        # Connect rescue bases to the nearest node on the graph
        for base in bases:
            base_pt = (round(base["longitude"], 4), round(base["latitude"], 4))
            nearest_node, dist_km = self._find_nearest_node(G_full, base_pt)
            if nearest_node:
                G_full.add_node(base_pt, type="rescue_base", name=base["name"], id=base.get("id"))
                G_full.add_edge(base_pt, nearest_node, length_km=dist_km, is_flooded=False, name="Base Link")
                
                G_scenario.add_node(base_pt, type="rescue_base", name=base["name"], id=base.get("id"))
                G_scenario.add_edge(base_pt, nearest_node, length_km=dist_km, is_flooded=False, name="Base Link")

        # Connect settlements to nearest node
        for settlement in settlements:
            s_pt = (round(settlement["longitude"], 4), round(settlement["latitude"], 4))
            nearest_node, dist_km = self._find_nearest_node(G_full, s_pt)
            if nearest_node:
                G_full.add_node(s_pt, type="settlement", name=settlement["name"], id=settlement.get("id"))
                G_full.add_edge(s_pt, nearest_node, length_km=dist_km, is_flooded=False, name="Settlement Link")

                G_scenario.add_node(s_pt, type="settlement", name=settlement["name"], id=settlement.get("id"))
                # If settlement is directly submerged or isolated, connection to dry road network may be severed
                if settlement.get("flood_distance_meters", 100) > 0:
                    G_scenario.add_edge(s_pt, nearest_node, length_km=dist_km, is_flooded=False, name="Settlement Link")

        return G_full, G_scenario

    @staticmethod
    def _find_nearest_node(graph: nx.Graph, pt: Tuple[float, float]) -> Tuple[Tuple[float, float], float]:
        if not graph.nodes:
            return None, 0.0
        
        min_dist = float("inf")
        best_node = None
        for node in graph.nodes:
            # Euclidean distance approximation in km
            d_lon = (node[0] - pt[0]) * 99.77
            d_lat = (node[1] - pt[1]) * 110.8
            dist = math.sqrt(d_lon**2 + d_lat**2)
            if dist < min_dist:
                min_dist = dist
                best_node = node
        return best_node, round(min_dist, 2)

    def analyze_isolation(
        self,
        settlements: List[Dict[str, Any]],
        bases: List[Dict[str, Any]],
        roads: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates reachable paths from any active rescue base to each settlement.
        """
        G_full, G_scenario = self.build_network_graphs(roads, bases, settlements)

        base_nodes = [
            (round(b["longitude"], 4), round(b["latitude"], 4))
            for b in bases
        ]

        results = []
        for settlement in settlements:
            s_node = (round(settlement["longitude"], 4), round(settlement["latitude"], 4))
            
            # Check baseline path in full graph
            baseline_reachable = False
            baseline_min_dist = float("inf")
            for b_node in base_nodes:
                if nx.has_path(G_full, b_node, s_node):
                    baseline_reachable = True
                    try:
                        d = nx.shortest_path_length(G_full, b_node, s_node, weight="length_km")
                        if d < baseline_min_dist:
                            baseline_min_dist = d
                    except Exception:
                        pass

            # Check scenario path in flood-subtracted graph
            scenario_reachable = False
            scenario_min_dist = float("inf")
            nearest_base_name = bases[0]["name"] if bases else "Headquarters"

            for b in bases:
                b_node = (round(b["longitude"], 4), round(b["latitude"], 4))
                if nx.has_path(G_scenario, b_node, s_node):
                    scenario_reachable = True
                    try:
                        d = nx.shortest_path_length(G_scenario, b_node, s_node, weight="length_km")
                        if d < scenario_min_dist:
                            scenario_min_dist = d
                            nearest_base_name = b["name"]
                    except Exception:
                        pass

            # Determine isolation classification
            if not baseline_reachable:
                status = "insufficient_network_data"
                evidence = "No mapped road connections recorded in baseline OpenStreetMap dataset."
            elif not scenario_reachable:
                if settlement.get("flood_distance_meters", 100) == 0:
                    status = "critical_isolated"
                    evidence = "All mapped approach roads severed by floodwater AND settlement core is directly inundated."
                else:
                    status = "potentially_isolated"
                    evidence = "All mapped dry road routes to rescue bases are cut by flood intersections."
            else:
                status = "connected"
                evidence = f"Dry route maintained from {nearest_base_name} ({round(scenario_min_dist, 1)} km)."

            res = dict(settlement)
            res["connectivity_status"] = status
            res["evidence"] = evidence
            res["modeled_dry_route_available"] = scenario_reachable
            res["dry_route_distance_km"] = round(scenario_min_dist, 1) if scenario_reachable else None
            res["nearest_rescue_base_name"] = nearest_base_name
            res["network_assumptions"] = (
                "Modeled using OpenStreetMap arterial, secondary, and tertiary road graphs. "
                "Assumes any road segment intersecting satellite flood polygons is impassable to standard vehicles."
            )
            results.append(res)

        return results

isolation_engine = CommunityIsolationEngine()
