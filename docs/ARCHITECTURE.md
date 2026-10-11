# FloodGuard AI — Architecture & Systems Design

## Overview
FloodGuard AI is a disaster response intelligence platform built for **Multimodal AI Hackathon 2026: Track B (Mapping Flood Damage from Space)**. It integrates Synthetic Aperture Radar (SAR) remote sensing, topological graph analysis, and evidence-grounded AI reasoning into a cohesive operational workflow for disaster responders.

```
+-----------------------------------------------------------------------------------+
|                              FLOODGUARD ARCHITECTURE                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +-----------------------+     +------------------------+                        |
|   |  Sentinel-1 C-SAR     |     |   OpenStreetMap &      |                        |
|   |  Radar Remote Sensing |     |   Critical Assets      |                        |
|   +-----------+-----------+     +-----------+------------+                        |
|               |                             |                                     |
|               v                             v                                     |
|   +-----------------------+     +------------------------+                        |
|   |  SAR Backscatter      |     |  Spatial Intersections |                        |
|   |  Change Detection     |     |  Roads/Hospitals/Bases |                        |
|   +-----------+-----------+     +-----------+------------+                        |
|               |                             |                                     |
|               +------------+   +------------+                                     |
|                            |   |                                                  |
|                            v   v                                                  |
|               +-----------------------------+                                     |
|               |  NetworkX Scenario Graph    |                                     |
|               |  Community Isolation Engine |                                     |
|               +--------------+--------------+                                     |
|                              |                                                    |
|                              v                                                    |
|               +-----------------------------+                                     |
|               |  Multi-Factor Prioritization|                                     |
|               |  & Route Analysis (Dijkstra)|                                     |
|               +--------------+--------------+                                     |
|                              |                                                    |
|                              v                                                    |
|               +-----------------------------+                                     |
|               |  FastAPI Backend REST API   |                                     |
|               |  PostgreSQL / PostGIS DB    |                                     |
|               +--------------+--------------+                                     |
|                              |                                                    |
|               +--------------+--------------+                                     |
|               |                             |                                     |
|               v                             v                                     |
|   +-----------------------+     +------------------------+                        |
|   |  Next.js 14 Dashboard |     |  Grounded Gemini       |                        |
|   |  MapLibre GL Visualizer|     |  Disaster Copilot      |                        |
|   +-----------------------+     +------------------------+                        |
+-----------------------------------------------------------------------------------+
```

## System Components

### 1. Satellite Remote Sensing & Change Detection Engine
- **Sensor:** European Space Agency (ESA) Copernicus Sentinel-1 C-SAR (5.405 GHz microwave frequency).
- **Physics Principle:** Water causes specular reflection, redirecting radar pulses away from the antenna and creating a steep backscatter drop (< -14.5 dB).
- **Speckle Noise Filtering:** Lee Sigma spatial filtering removes radar noise while preserving riverine char boundaries.
- **Surface Inundation Area:** 412.8 km² georeferenced MultiPolygon with 10m spatial resolution.

### 2. Infrastructure Exposure Analysis Engine
- **Spatial Queries:** Shapely planar intersections between flood polygons and OpenStreetMap road vectors and point facilities.
- **Classifications:**
  - `flood_exposed`: Inundated directly.
  - `potentially_affected`: Within 500m proximity.
  - `clear`: Beyond flood boundaries.
- **Exposure Statistics:** 41.7 km of roads intersected; 4 critical health and relief facilities compromised.

### 3. Graph-Based Community Isolation Engine
- **Model:** Topological network graph $G = (V, E)$ constructed from OpenStreetMap road corridors and rescue staging bases.
- **Scenario Subtraction:** Road edges intersecting flood polygons are removed from scenario graph $G_{scenario}$.
- **Reachability:** NetworkX calculates shortest paths and reachable components from operational rescue bases.
- **Output:** 5 communities (61,100 civilians) identified with 0 unflooded road paths to relief staging units.

### 4. Explainable Multi-Factor Prioritization Engine
Composite priority score $S \in [0, 100]$:
$$S = 100 \times \sum_{i} w_i \cdot f_i$$
- Civilian Population Exposure: 30%
- Potential Network Isolation: 30%
- Flood Severity & Proximity: 20%
- Critical Infrastructure Vulnerability: 15%
- Observation Uncertainty: 5%

### 5. Grounded Gemini AI Copilot
- Strictly forbids fabricated metrics or hallucinations.
- Executes certified backend tools:
  - `get_flood_analysis()`
  - `get_exposed_infrastructure()`
  - `get_isolated_settlements()`
  - `get_priority_scores()`
  - `get_route_assessment()`
  - `get_analysis_metadata()`
- Returns evidence citations, observation timestamps, and operational uncertainty warnings.

### 6. Command Center Frontend
- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **GIS Mapping:** MapLibre GL JS with dual vector/raster tile styling, opacity slider, before/after split slider, and layer controls.
