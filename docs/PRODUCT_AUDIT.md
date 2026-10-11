# FloodGuard AI 2.0 — Comprehensive Product & Engineering Audit

**Audit Date:** October 11, 2026  
**Auditor:** Principal Software Architect & Product Engineering Lead  
**Challenge Track:** Multimodal AI Hackathon 2026 (Track B: Mapping Flood Damage from Space)  
**Target Disaster Benchmark:** Assam Brahmaputra Basin Deluge (June 2022)  

---

## 1. Executive Summary

FloodGuard AI contains a robust mathematical and geospatial foundation (FastAPI backend, SQLAlchemy database, Shapely geospatial operations, NetworkX road network connectivity, Dijkstra/A* routing, and grounded Copilot tool execution). 

However, prior iterations over-indexed on decorative "AI-generated" sci-fi visuals (excessive cyan glows, pulsing neon animations, non-standard cards) at the expense of operational clarity. Crucially, the map basemap requires immediate stabilization with **CARTO Voyager**, satellite comparison views used CSS radial-gradient simulations instead of authentic georeferenced raster scenes, and several UI components lacked deep data provenance and asset-specific table structures.

This audit establishes the ground truth across every subsystem and provides the roadmap for FloodGuard AI 2.0.

---

## 2. Framework & Architectural Inventory

### Backend Architecture (`/backend`)
- **Framework:** FastAPI `0.110.0` with Python 3.9+
- **ASGI Server:** Uvicorn with ASGI worker on port 8000
- **Database:** SQLAlchemy 2.0 ORM with PostgreSQL and automatic SQLite (`floodguard.db`) fallback
- **Validation:** Pydantic v2 with `ConfigDict(from_attributes=True)` and `model_validate()`
- **Geospatial & Graph Engines:**
  - `shapely` 2.0.3 (Vector geometries, intersection, buffering, `make_valid`)
  - `networkx` 3.2.1 (Graph topology, edge subtraction, Dijkstra, A* shortest paths)
  - `scipy` / `numpy` (Statistical analysis, metrics)
- **AI Engine:**
  - Google Gemini 1.5 with structured function calling tools
  - Deterministic fallback tool dispatcher for offline resilience and credential exhaustion

### Frontend Architecture (`/frontend`)
- **Framework:** Next.js 16.4.0 (Turbopack, App Router)
- **React:** React 19.3.0
- **Styling:** Tailwind CSS v4 with custom CSS design tokens
- **Mapping:** MapLibre GL JS `6.13.0`
- **Typography:** Inter (Primary UI) and JetBrains Mono (Telemetry/Coordinates) via `next/font/google`
- **Component Libraries:** `lucide-react`, `recharts`, `framer-motion`, `canvas-confetti`

---

## 3. Detailed Feature Classification Matrix

| Feature / Component | Category | Current Status | Technical Findings & Root Cause | Action Plan for 2.0 |
|---|---|---|---|---|
| **Map Engine (`FloodMap.tsx`)** | Map & Spatial | **Broken / Needs Replacement** | Carto Dark endpoint without key occasionally triggers rate limits or missing tiles. No Voyager default. | Create `components/maps/FloodGuardMap.tsx` with CARTO Voyager as default (`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4dyn_1_dcd21ae5edce6d4870f307e2`), plus Dark Matter, Positron, and Satellite. |
| **Command Center (`/command`)** | Operations | **Working & Verified** | Loads 6 KPI cards, settlements, and layers, but UI has excessive glowing neon borders and decorative tech clutter. | Refine into Linear/Palantir aesthetic with `#0B1220` background, `#172033` surface, restrained typography, and map as centerpiece. |
| **SAR Comparison (`/satellite`)** | Remote Sensing | **UI-Only / Placeholder** | Before/After split slider used CSS radial gradients simulating radar backscatter rather than real georeferenced satellite rasters. | Integrate actual pre-flood (May 28, 2022) and peak deluge (June 20, 2022) georeferenced Sentinel-1 SAR and Sentinel-2 optical imagery with metadata provenance. |
| **Flood Detection (`/flood-analysis`)** | Physics & Mask | **Partially Implemented** | Backend correctly computes 412.8 km² using localized latitude scaling, but UI needs equal-area geodesic verification and configurable dB parameters. | Expose dynamic backscatter slider (-20 dB to -10 dB), Lee filter toggle, and genuine GeoJSON polygon exporter. |
| **Community Isolation (`/isolation`)** | Network Graph | **Working & Verified** | NetworkX correctly removes flooded edges and identifies 4 isolated settlements (56,700 pop). UI needs interactive graph edge inspector. | Add filter controls (All, Potentially Isolated, Connected), node connection inspector, and evidence cards. |
| **Rescue Routing (`/routing`)** | Logistics | **Working & Verified** | Dijkstra & A* successfully compute candidate path from NDRF Barpeta Base. Candidate route renders as gold dashed line. | Add alternative route comparison (Route A vs Route B), flood intersection highlighting, and prominent safety disclaimers. |
| **Infrastructure Table (`/infrastructure`)** | Asset Management | **Partially Implemented** | Generic table displays hospital bed capacity for bridges and roads. | Implement asset-specific schemas (Hospitals vs Bridges vs Shelters vs Roads), sorting, filtering, and CSV export. |
| **Gemini Copilot (`/copilot`)** | Multimodal AI | **Working & Verified** | Backend tools execute reliably. Frontend occasionally rendered raw unparsed markdown symbols (`**`). | Fix markdown rendering, implement streaming-style UX, citation chips, copy response, and clear conversation. |
| **Priority Settings (`/settings`)** | Multi-Criteria | **Partially Implemented** | Slider updates backend weights, but lacks strict 100% total sum validation message, preview mode, and reset button. | Implement strict 100% constraint validator, interactive factor breakdown, preset profiles, and reset button. |
| **Historical Archive (`/events`)** | Data Provenance | **Working & Verified** | Seeds authentic Assam June 2022 disaster. Lacks multi-event search and provenance categorization. | Add provenance tags (`Historical Observations`, `Precomputed Analysis`, `Simulation`). |
| **Report Generator (`/reports`)** | Sitrep Briefing | **Working & Verified** | Exports HTML/PDF printable, CSV, and GeoJSON. Needs richer methodology section and verified data provenance. | Add audit timestamp, data provenance section, and one-click downloads. |

---

## 4. UI/UX Aesthetic Deficiencies & Plan of Record

1. **Visual Decoration vs. Operational Clarity:**
   - Previous designs had glowing borders (`glow-cyan`, `glow-red`, `border-cyan-500/40`), distracting pulsating animations, and redundant badges.
   - **Resolution:** Migrate to a clean dark palette:
     - Background: `#0B1220`
     - Sidebar: `#111827`
     - Surface: `#172033`
     - Elevated Surface: `#1E293B`
     - Primary Accent: `#2563EB` (Professional Blue)
     - Secondary: `#06B6D4` (Cyan reserved only for water layers)
     - Borders: `#334155` (Subtle 1px borders)
2. **Typography Hierarchy:**
   - Eliminate all-caps styling from standard labels.
   - Reserve monospace (`JetBrains Mono`) strictly for coordinates (`26.32°N, 91.01°E`), timestamps, radar frequencies (`5.405 GHz`), and database IDs.
   - Use `Inter` for clean body text and titles.
3. **Map Centricity:**
   - Expand the map into the primary visual centerpiece across Command Center, Isolation, and Routing views.

---

## 5. Security & Credentials Audit
- **Client Bundles:** Zero exposed credentials. Verified `NEXT_PUBLIC_` variables only contain local backend endpoint `http://localhost:8000/api`.
- **Backend Secrets:** `GEMINI_API_KEY` is loaded strictly server-side via `os.getenv()` in `app/core/config.py`.
- **CARTO Tiles:** The key provided (`cb1_4dyn_1_dcd21ae5edce6d4870f307e2`) is verified working for raster tile rendering.
