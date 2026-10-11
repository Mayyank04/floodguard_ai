# FloodGuard AI — Rescue Intelligence & Community Isolation

## 1. The Core Problem
When major floods submerge roads and wash out bridges, responders often lose cellular connectivity to rural communities. Emergency headquarters lack ground truth on:
- Which specific villages are physically severed from the outside world.
- How many civilians are trapped without overland access.
- Which community requires immediate air-drop or boat deployment first.

---

## 2. Graph-Based Community Isolation Algorithm

FloodGuard AI addresses this with topological network graph analysis using **NetworkX**:

1. **Construct Baseline Road Graph $G = (V, E)$:**
   - Vertices $V$: Road intersections, rescue bases (NDRF/SDRF), and settlements.
   - Edges $E$: OpenStreetMap road segments weighted by distance (km).

2. **Compute Spatial Intersections with SAR Flood Polygons:**
   - For every road segment $e \in E$, compute $\text{Length}_{\text{flooded}} = \text{Intersection}(e, \text{FloodPolygons})$.
   - If $\text{Length}_{\text{flooded}} > 0$, mark edge as potentially impassable.

3. **Construct Scenario Subgraph $G_{\text{dry}}$:**
   - Exclude severed edges: $G_{\text{dry}} = G \setminus E_{\text{flooded}}$.

4. **Reachability Analysis:**
   - For each settlement $s$, test if there exists a valid path in $G_{\text{dry}}$ to any active rescue staging base:
     $$\text{IsIsolated}(s) = \neg \left( \exists b \in \text{RescueBases} : \text{HasPath}(G_{\text{dry}}, b, s) \right)$$

---

## 3. Explainable Multi-Factor Prioritization Engine

To assist disaster commanders without replacing human discretion, settlements are ranked using a multi-factor formula:

| Factor | Default Weight | Description |
| :--- | :---: | :--- |
| **Population Exposure** | 30% | Normalized civilian population in settlement |
| **Network Isolation** | 30% | 1.0 for critical isolation, 0.85 for potential isolation, 0.2 for connected |
| **Flood Severity** | 20% | Distance to nearest flood boundary (1.0 for direct inundation) |
| **Infrastructure Vulnerability** | 15% | Compromised hospitals or shelters within 5 km |
| **Observation Uncertainty** | 5% | Penalty for sparse road mapping or cloud gaps |

### Operational Safety Rule
FloodGuard AI **never** labels a road or route as "guaranteed safe." Satellite imagery represents surface conditions at the time of overpass. Structural integrity of road subgrades, culverts, and bridges must receive UAV or ground reconnaissance prior to heavy convoy dispatch.
