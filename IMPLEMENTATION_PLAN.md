# Implementation Plan: FLOODGUARD AI — Satellite Rescue Intelligence

## Architecture & Directory Structure
```
floodguard-ai/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind, MapLibre GL
│   ├── app/                      # Pages: Landing, Command Center, Satellite, Flood, Infrastructure, Isolation, Routing, Copilot, Events, Reports, Settings
│   ├── components/               # Map, Dashboard, Layers, Modals, Sliders, Copilot Chat, Charts
│   ├── hooks/                    # useEvent, useMapLayers, useAnalysis, useCopilot
│   ├── lib/                      # API client, geo utilities, formatters, export helpers
│   ├── styles/                   # Glassmorphism, animations, GIS styling
│   └── types/                    # Geospatial & analysis TypeScript interfaces
├── backend/                      # FastAPI, SQLAlchemy, GeoPandas, Shapely, NetworkX
│   ├── app/
│   │   ├── api/                  # REST routers: events, analysis, infrastructure, isolation, routes, copilot, reports
│   │   ├── core/                 # Config, DB session, security, CORS
│   │   ├── models/               # SQLAlchemy models (events, flood_masks, settlements, infrastructure, routes, priorities, observations)
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   ├── services/             # Satellite processing, GIS intersections, Graph isolation, Gemini Copilot, PDF/CSV/GeoJSON generator
│   │   └── data/                 # Seed data & geospatial catalogs
│   └── tests/                    # Pytest test suite (14+ test suites matching specs)
├── ai/                           # Satellite Remote Sensing & Flood Detection
│   ├── flood_detection/          # SAR backscatter difference & Sentinel-2 NDWI/MNDWI algorithms
│   └── evaluation/               # Accuracy, false positive filtering, confidence scoring
├── geospatial/                   # Graph connectivity, routing, spatial exposure
├── datasets/                     # Assam 2022 historical flood Sentinel scenes, OSM roads, settlements, facilities
├── docs/                         # ARCHITECTURE, API, DATA_SOURCES, FLOOD_DETECTION, RESCUE_INTELLIGENCE, DEPLOYMENT, DEMO_SCRIPT
├── docker-compose.yml
├── .env.example
└── README.md
```

## Phases of Execution
1. **Scaffold & Foundation**:
   - Backend structure, virtual environment, dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `shapely`, `geopandas`, `networkx`, `google-genai` / `requests`, `pydantic`).
   - PostgreSQL / SQLite hybrid database setup with automatic schema migrations.
   - Authentic historical dataset generation for Assam 2022/2024 (Barpeta / Morigaon / Brahmaputra basin) with genuine coordinate bounds, settlements, roads, facilities, and Sentinel-1/Sentinel-2 metadata.
2. **Backend Engines & APIs**:
   - Real flood detection change-detection algorithms (SAR backscatter thresholding + Optical NDWI).
   - Real spatial intersection engine (road kilometers exposed, hospital/school/bridge vulnerability).
   - Real graph connectivity & community isolation engine (NetworkX graph exclusion, isolated settlement identification).
   - Real rescue routing engine (Dijkstra/A* unflooded vs flooded candidate paths with distance and safety disclaimers).
   - Explainable priority engine with adjustable weights and uncertainty quantification.
   - Grounded Gemini AI Copilot with tool calling (`get_flood_analysis`, `get_isolated_settlements`, etc.) and multimodal field photo analysis.
   - Multi-format report generator (PDF HTML rendering, CSV, GeoJSON).
3. **Frontend Implementation**:
   - Next.js 14 App Router with Tailwind CSS, Lucide React, MapLibre GL, Recharts.
   - Premium dark command center UI (#07111F, cyan `#00D4FF`, green `#22C55E`, amber, crimson alert states).
   - MapLibre GL JS interactive map with satellite/street tiles, before/after split slider, flood raster/vector overlay, roads, bridges, settlements, isolation states, route lines.
   - All 11 navigation pages: Landing, Command Center, Satellite Intelligence, Flood Analysis, Infrastructure, Community Isolation, Rescue Planning, AI Copilot, Historical Events, Reports, Settings.
   - Hackathon Presentation Mode: 1-click end-to-end interactive guided demo flow.
4. **Verification & Automated Testing**:
   - Pytest suite covering all 14 required test cases.
   - Frontend build & API integration validation.
   - Complete technical documentation in `docs/` and root `README.md`.
