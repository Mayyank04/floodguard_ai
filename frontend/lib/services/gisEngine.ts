// GIS and Graph Analytics Engine for FloodGuard AI
// Implements Dijkstra, A*, topological network isolation, and multi-factor prioritization.

export interface RoadEdge {
  id: string;
  name: string;
  road_type: string;
  length_km: number;
  flood_intersection: boolean;
  potentially_exposed_length_km: number;
  accessibility_status: string;
  verification_status: string;
  coordinates: [number, number][];
}

export interface SettlementPoint {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  estimated_population: number;
  connectivity_status: string;
  flood_exposure_level: string;
  flood_distance_meters: number;
  priority_score: number;
  priority_rank: number;
  notes: string;
}

export interface RescueBasePoint {
  id: string;
  name: string;
  base_type: string;
  latitude: number;
  longitude: number;
  operational_status: string;
  personnel_count: number;
  boats_count: number;
  vehicles_count: number;
}

export interface InfrastructurePoint {
  id: string;
  name: string;
  asset_type: string;
  latitude: number;
  longitude: number;
  flood_intersection: boolean;
  exposure_status: string;
  distance_to_flood_meters: number;
  capacity: number;
  contact_info: string;
}

interface GraphNode {
  key: string;
  lon: number;
  lat: number;
  type?: string;
  name?: string;
  id?: string;
}

interface GraphEdge {
  u: string;
  v: string;
  weight: number;
  data: any;
}

export class SimpleGraph {
  nodes: Map<string, GraphNode> = new Map();
  adjacency: Map<string, { target: string; weight: number; edgeData: any }[]> = new Map();

  addNode(key: string, lon: number, lat: number, meta: Record<string, any> = {}) {
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { key, lon, lat, ...meta });
      this.adjacency.set(key, []);
    }
  }

  addEdge(u: string, v: string, weight: number, edgeData: any = {}) {
    if (!this.adjacency.has(u)) this.adjacency.set(u, []);
    if (!this.adjacency.has(v)) this.adjacency.set(v, []);
    this.adjacency.get(u)!.push({ target: v, weight, edgeData });
    this.adjacency.get(v)!.push({ target: u, weight, edgeData });
  }

  hasPath(start: string, goal: string): boolean {
    if (!this.nodes.has(start) || !this.nodes.has(goal)) return false;
    const visited = new Set<string>();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === goal) return true;
      const neighbors = this.adjacency.get(current) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push(edge.target);
        }
      }
    }
    return false;
  }

  dijkstra(start: string, goal: string): { path: string[]; distance: number } | null {
    if (!this.nodes.has(start) || !this.nodes.has(goal)) return null;

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    for (const key of this.nodes.keys()) {
      distances.set(key, Infinity);
      previous.set(key, null);
      unvisited.add(key);
    }
    distances.set(start, 0);

    while (unvisited.size > 0) {
      let closestNode: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        const d = distances.get(node)!;
        if (d < minDistance) {
          minDistance = d;
          closestNode = node;
        }
      }

      if (!closestNode || minDistance === Infinity) break;
      if (closestNode === goal) break;

      unvisited.delete(closestNode);
      const neighbors = this.adjacency.get(closestNode) || [];

      for (const { target, weight } of neighbors) {
        if (unvisited.has(target)) {
          const alt = minDistance + weight;
          if (alt < distances.get(target)!) {
            distances.set(target, alt);
            previous.set(target, closestNode);
          }
        }
      }
    }

    if (distances.get(goal) === Infinity) return null;

    const path: string[] = [];
    let curr: string | null = goal;
    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr) || null;
    }

    return { path, distance: distances.get(goal)! };
  }

  aStar(
    start: string,
    goal: string,
    heuristic: (u: GraphNode, v: GraphNode) => number
  ): { path: string[]; distance: number } | null {
    if (!this.nodes.has(start) || !this.nodes.has(goal)) return null;

    const goalNode = this.nodes.get(goal)!;
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const cameFrom = new Map<string, string>();
    const openSet = new Set<string>([start]);

    for (const key of this.nodes.keys()) {
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    }

    gScore.set(start, 0);
    fScore.set(start, heuristic(this.nodes.get(start)!, goalNode));

    while (openSet.size > 0) {
      let current: string | null = null;
      let lowestF = Infinity;

      for (const node of openSet) {
        const f = fScore.get(node)!;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }

      if (!current) break;
      if (current === goal) {
        const path: string[] = [current];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!;
          path.unshift(current);
        }
        return { path, distance: gScore.get(goal)! };
      }

      openSet.delete(current);
      const neighbors = this.adjacency.get(current) || [];

      for (const { target, weight } of neighbors) {
        const tentativeG = gScore.get(current)! + weight;
        if (tentativeG < gScore.get(target)!) {
          cameFrom.set(target, current);
          gScore.set(target, tentativeG);
          const f = tentativeG + heuristic(this.nodes.get(target)!, goalNode);
          fScore.set(target, f);
          openSet.add(target);
        }
      }
    }

    return null;
  }
}

function coordKey(lon: number, lat: number): string {
  return `${lon.toFixed(4)},${lat.toFixed(4)}`;
}

export function euclideanDistanceKm(p1: { lon: number; lat: number }, p2: { lon: number; lat: number }): number {
  const dLon = (p1.lon - p2.lon) * 99.77;
  const dLat = (p1.lat - p2.lat) * 110.8;
  return Math.sqrt(dLon * dLon + dLat * dLat);
}

function findNearestNode(graph: SimpleGraph, pt: { lon: number; lat: number }): { key: string; distKm: number } | null {
  if (graph.nodes.size === 0) return null;
  let bestKey: string | null = null;
  let minDist = Infinity;

  for (const node of graph.nodes.values()) {
    const d = euclideanDistanceKm(node, pt);
    if (d < minDist) {
      minDist = d;
      bestKey = node.key;
    }
  }

  return bestKey ? { key: bestKey, distKm: Math.round(minDist * 100) / 100 } : null;
}

export function buildNetworkGraphs(
  roads: RoadEdge[],
  bases: RescueBasePoint[],
  settlements: SettlementPoint[]
): { gFull: SimpleGraph; gScenario: SimpleGraph } {
  const gFull = new SimpleGraph();
  const gScenario = new SimpleGraph();

  for (let idx = 0; idx < roads.length; idx++) {
    const r = roads[idx];
    const coords = r.coordinates || [];
    if (coords.length < 2) continue;

    const startPt = { lon: coords[0][0], lat: coords[0][1] };
    const endPt = { lon: coords[coords.length - 1][0], lat: coords[coords.length - 1][1] };

    const uKey = coordKey(startPt.lon, startPt.lat);
    const vKey = coordKey(endPt.lon, endPt.lat);

    gFull.addNode(uKey, startPt.lon, startPt.lat);
    gFull.addNode(vKey, endPt.lon, endPt.lat);

    gScenario.addNode(uKey, startPt.lon, startPt.lat);
    gScenario.addNode(vKey, endPt.lon, endPt.lat);

    const lengthKm = r.length_km || 5.0;
    const isFlooded = Boolean(r.flood_intersection);
    const vStatus = r.verification_status || "unverified";

    const edgeData = {
      id: r.id,
      name: r.name || `Road-${idx}`,
      length_km: lengthKm,
      is_flooded: isFlooded,
      coordinates: coords,
      road_type: r.road_type,
      verification_status: vStatus
    };

    gFull.addEdge(uKey, vKey, lengthKm, edgeData);

    let includeInScenario = false;
    if (vStatus === "reported_open") {
      includeInScenario = true;
    } else if (vStatus === "reported_blocked") {
      includeInScenario = false;
    } else {
      includeInScenario = !isFlooded;
    }

    if (includeInScenario) {
      gScenario.addEdge(uKey, vKey, lengthKm, edgeData);
    }
  }

  // Connect rescue bases
  for (const b of bases) {
    const bPt = { lon: b.longitude, lat: b.latitude };
    const bKey = coordKey(bPt.lon, bPt.lat);

    const nearestFull = findNearestNode(gFull, bPt);
    if (nearestFull) {
      gFull.addNode(bKey, bPt.lon, bPt.lat, { type: "rescue_base", name: b.name, id: b.id });
      gFull.addEdge(bKey, nearestFull.key, nearestFull.distKm, { name: "Base Link" });

      gScenario.addNode(bKey, bPt.lon, bPt.lat, { type: "rescue_base", name: b.name, id: b.id });
      gScenario.addEdge(bKey, nearestFull.key, nearestFull.distKm, { name: "Base Link" });
    }
  }

  // Connect settlements
  for (const s of settlements) {
    const sPt = { lon: s.longitude, lat: s.latitude };
    const sKey = coordKey(sPt.lon, sPt.lat);

    const nearestFull = findNearestNode(gFull, sPt);
    if (nearestFull) {
      gFull.addNode(sKey, sPt.lon, sPt.lat, { type: "settlement", name: s.name, id: s.id });
      gFull.addEdge(sKey, nearestFull.key, nearestFull.distKm, { name: "Settlement Link" });

      gScenario.addNode(sKey, sPt.lon, sPt.lat, { type: "settlement", name: s.name, id: s.id });
      // If settlement has flood_distance_meters > 0, link to dry network
      if ((s.flood_distance_meters ?? 100) > 0) {
        gScenario.addEdge(sKey, nearestFull.key, nearestFull.distKm, { name: "Settlement Link" });
      }
    }
  }

  return { gFull, gScenario };
}

export function analyzeIsolation(
  settlements: SettlementPoint[],
  bases: RescueBasePoint[],
  roads: RoadEdge[]
) {
  const { gFull, gScenario } = buildNetworkGraphs(roads, bases, settlements);

  const baseKeys = bases.map(b => coordKey(b.longitude, b.latitude));

  const updatedSettlements: SettlementPoint[] = [];

  for (const s of settlements) {
    const sKey = coordKey(s.longitude, s.latitude);

    let baselineReachable = false;
    for (const bKey of baseKeys) {
      if (gFull.hasPath(bKey, sKey)) {
        baselineReachable = true;
        break;
      }
    }

    let scenarioReachable = false;
    for (const bKey of baseKeys) {
      if (gScenario.hasPath(bKey, sKey)) {
        scenarioReachable = true;
        break;
      }
    }

    let status = s.connectivity_status;
    let notes = s.notes;

    if (scenarioReachable) {
      status = "connected";
      notes = "Accessible via current dry road network.";
    } else if (baselineReachable) {
      if (s.flood_exposure_level === "severe" || s.flood_distance_meters === 0) {
        status = "critical_isolated";
        notes = "CRITICAL: Approach road corridor severed by floodwater. Motorized boat/helicopter staging required.";
      } else {
        status = "potentially_isolated";
        notes = "POTENTIALLY ISOLATED: Arterial links cut off; bypass requires ground reconnaissance verification.";
      }
    } else {
      status = "potentially_isolated";
      notes = "Unconnected in baseline road map or completely cut off.";
    }

    updatedSettlements.push({
      ...s,
      connectivity_status: status,
      notes
    });
  }

  const isolatedCount = updatedSettlements.filter(s =>
    s.connectivity_status === "critical_isolated" || s.connectivity_status === "potentially_isolated"
  ).length;

  const isolatedPopulation = updatedSettlements
    .filter(s => s.connectivity_status === "critical_isolated" || s.connectivity_status === "potentially_isolated")
    .reduce((sum, s) => sum + (s.estimated_population || 0), 0);

  return {
    total_settlements: settlements.length,
    isolated_settlements_count: isolatedCount,
    potentially_isolated_population: isolatedPopulation,
    rescue_bases_active: bases.length,
    isolated_settlements: updatedSettlements.filter(s => s.connectivity_status !== "connected"),
    all_settlements: updatedSettlements,
    rescue_bases: bases,
    network_assumptions: "OpenStreetMap topological graph minus satellite-inundated segments (Sentinel-1 C-SAR IW GRDH)"
  };
}

export function analyzeRoute(params: {
  base: RescueBasePoint;
  settlement: SettlementPoint;
  roads: RoadEdge[];
  algorithm?: string;
}) {
  const { base, settlement, roads, algorithm = "dijkstra" } = params;
  const { gFull, gScenario } = buildNetworkGraphs(roads, [base], [settlement]);

  const startKey = coordKey(base.longitude, base.latitude);
  const endKey = coordKey(settlement.longitude, settlement.latitude);

  const heuristic = (u: GraphNode, v: GraphNode) => euclideanDistanceKm(u, v);

  // Check dry route in gScenario first
  let res = algorithm.toLowerCase() === "a_star"
    ? gScenario.aStar(startKey, endKey, heuristic)
    : gScenario.dijkstra(startKey, endKey);

  let classification = "unexposed_candidate_route";
  let summary = "Candidate route does not intersect satellite-detected flood polygons.";
  let speedKmh = 35.0; // Relief convoy speed

  if (!res) {
    // Check if path exists in full graph (through flooded segments)
    const fullRes = gFull.dijkstra(startKey, endKey);
    if (fullRes) {
      res = fullRes;
      classification = "flood_exposed_candidate_route";
      summary = "Route intersects floodwater. Road segments may be submerged, washed out, or impassable without boat/amphibious transport.";
      speedKmh = 15.0; // Severely reduced speed
    }
  }

  if (!res) {
    return {
      base_id: base.id,
      base_name: base.name,
      settlement_id: settlement.id,
      settlement_name: settlement.name,
      route_classification: "no_mapped_route",
      distance_km: 0.0,
      estimated_time_minutes: 0.0,
      waypoints_geojson: {
        type: "LineString",
        coordinates: []
      },
      flood_exposure_summary: "No mapped overland route exists in the OpenStreetMap network to this destination under current modeling assumptions.",
      verification_status: "inaccessible_by_road",
      safety_disclaimer: "Air-drop, helicopter staging, or amphibious boat rescue required. NEVER consider candidate routes guaranteed safe without ground reconnaissance."
    };
  }

  const coords: [number, number][] = res.path.map(key => {
    const node = gFull.nodes.get(key) || gScenario.nodes.get(key)!;
    return [node.lon, node.lat];
  });

  const distKm = Math.round(res.distance * 100) / 100;
  const timeMinutes = Math.round((distKm / speedKmh) * 60 * 10) / 10;

  return {
    base_id: base.id,
    base_name: base.name,
    settlement_id: settlement.id,
    settlement_name: settlement.name,
    route_classification: classification,
    algorithm_used: algorithm.toUpperCase(),
    distance_km: distKm,
    estimated_time_minutes: timeMinutes,
    waypoints_geojson: {
      type: "LineString",
      coordinates: coords
    },
    flood_exposure_summary: summary,
    verification_status: "preliminary_planning_aid_unverified",
    safety_disclaimer: (
      "CRITICAL SAFETY NOTICE: This candidate route is a preliminary computational planning aid " +
      "generated from satellite radar observations and OpenStreetMap geometries. " +
      "Satellite imagery CANNOT confirm that a road surface is structurally intact or passable. " +
      "All candidate routes require operational reconnaissance verification before deployment."
    )
  };
}

export function calculatePriorities(
  settlements: SettlementPoint[],
  infrastructure: InfrastructurePoint[],
  customWeights?: { pop: number; iso: number; flood: number; infra: number; unc: number }
) {
  const weights = {
    pop: customWeights?.pop ?? 0.30,
    iso: customWeights?.iso ?? 0.30,
    flood: customWeights?.flood ?? 0.20,
    infra: customWeights?.infra ?? 0.15,
    unc: customWeights?.unc ?? 0.05
  };

  const totalW = weights.pop + weights.iso + weights.flood + weights.infra + weights.unc || 1.0;
  const normW = {
    pop: weights.pop / totalW,
    iso: weights.iso / totalW,
    flood: weights.flood / totalW,
    infra: weights.infra / totalW,
    unc: weights.unc / totalW
  };

  const maxPop = Math.max(...settlements.map(s => s.estimated_population || 1), 50000);

  const scored = settlements.map(s => {
    const pop = s.estimated_population || 0;
    const popFactor = Math.min(pop / maxPop, 1.0);

    let isoFactor = 0.20;
    if (s.connectivity_status === "critical_isolated") isoFactor = 1.0;
    else if (s.connectivity_status === "potentially_isolated") isoFactor = 0.85;

    const distFlood = s.flood_distance_meters ?? 1000;
    let floodFactor = 0.05;
    if (distFlood === 0) floodFactor = 1.0;
    else if (distFlood < 100) floodFactor = 0.80;
    else if (distFlood < 500) floodFactor = 0.50;
    else if (distFlood < 1500) floodFactor = 0.25;

    let nearbyExposedInfra = 0;
    for (const item of infrastructure) {
      if (item.flood_intersection) {
        const dLat = Math.abs(item.latitude - s.latitude);
        const dLon = Math.abs(item.longitude - s.longitude);
        if (dLat < 0.05 && dLon < 0.05) nearbyExposedInfra++;
      }
    }
    const infraFactor = Math.min(nearbyExposedInfra * 0.4 + (pop > 15000 ? 0.3 : 0.1), 1.0);
    const uncFactor = s.connectivity_status === "critical_isolated" ? 0.25 : 0.15;

    const rawScore = (
      popFactor * normW.pop +
      isoFactor * normW.iso +
      floodFactor * normW.flood +
      infraFactor * normW.infra +
      uncFactor * normW.unc
    ) * 100.0;

    const score = Math.round(rawScore * 10) / 10;

    return {
      settlement_id: s.id,
      settlement_name: s.name,
      district: s.district,
      population: pop,
      connectivity_status: s.connectivity_status,
      flood_distance_meters: distFlood,
      priority_score: score,
      breakdown: {
        population_factor: Math.round(popFactor * 100) / 100,
        isolation_factor: Math.round(isoFactor * 100) / 100,
        flood_factor: Math.round(floodFactor * 100) / 100,
        infrastructure_factor: Math.round(infraFactor * 100) / 100,
        uncertainty_factor: Math.round(uncFactor * 100) / 100
      }
    };
  });

  scored.sort((a, b) => b.priority_score - a.priority_score);

  return scored.map((item, index) => ({
    ...item,
    priority_rank: index + 1
  }));
}
