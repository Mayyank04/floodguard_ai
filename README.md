# FloodGuard AI — Satellite Rescue Intelligence

> **"From Space to Safety. Intelligence That Saves Lives."**

[![Hackathon](https://img.shields.io/badge/Hackathon-Multimodal%20AI%20Hackathon%202026-00D4FF?style=for-the-badge)](https://github.com)
[![Track](https://img.shields.io/badge/Track%20B-Mapping%20Flood%20Damage%20From%20Space-22C55E?style=for-the-badge)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Production%20Grade%20MVP-38BDF8?style=for-the-badge)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-14%2F14%20Passing-brightgreen?style=for-the-badge)](https://github.com)

---

## The Official Challenge
> *"When roads, bridges and phone lines are gone, rescuers still need to know where the damage is and who is cut off. Build the system that tells them — from space."*

**FloodGuard AI** is a disaster response intelligence platform that transforms raw satellite observations (ESA Sentinel-1 SAR and Sentinel-2 Optical) into actionable humanitarian insights. It identifies submerged infrastructure, maps isolated communities via graph theory, prioritizes rescue operations, and empowers emergency commanders through a grounded Gemini AI Copilot.

---

## Key Features

1. **Cloud-Penetrating SAR Flood Detection:**
   - Sentinel-1 C-SAR microwave radar change detection thresholded at **-14.5 dB**.
   - Penetrates monsoon clouds, heavy rainfall, and night skies to map exact surface water boundaries down to 10m resolution.
2. **Infrastructure Impact Analysis:**
   - Spatial intersections between detected flood polygons and OpenStreetMap road networks, hospitals, schools, and relief shelters.
   - Computes exact exposed roadway kilometers (41.7 km in benchmark) and compromised facility statuses.
3. **Graph-Based Community Isolation Engine (Core Innovation):**
   - Models road networks using **NetworkX** topological graphs.
   - Excludes flood-severed corridors to isolate communities with 0 dry routes to active NDRF/SDRF staging bases (61,100 civilians across 5 communities in benchmark).
4. **Rescue Route Planning:**
   - Evaluates candidate paths between rescue bases and settlements using Dijkstra and A* search algorithms.
   - Enforces strict operational disclaimers: preliminary planning aids requiring UAV/ground reconnaissance.
5. **Explainable Multi-Factor Prioritization:**
   - Ranks settlements based on Population (30%), Isolation (30%), Flood Proximity (20%), Infrastructure Vulnerability (15%), and Uncertainty (5%).
   - Fully customizable weights for disaster commanders.
6. **Grounded Gemini AI Disaster Copilot:**
   - Certified tool calling (`get_flood_analysis`, `get_isolated_settlements`, `get_priority_scores`).
   - Zero hallucination or invented statistics. Cites authentic satellite telemetry and timestamps.
   - Multimodal evaluation of uploaded responder field photographs.
7. **Disaster Briefing Generator:**
   - Exports complete operational dossiers in printable PDF briefing format, tabular CSV, or multi-layer GeoJSON.
8. **Hackathon Presentation Mode:**
   - 1-click guided 6-phase walkthrough using authentic historical European Space Agency datasets from the June 2022 Assam Brahmaputra deluge.

---

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, MapLibre GL JS, Lucide React, Framer Motion.
- **Backend:** Python, FastAPI, Pydantic v2, SQLAlchemy, GeoPandas, Shapely, NetworkX, NumPy, Scipy.
- **AI & Computer Vision:** Google Gemini API, SAR backscatter change detection, Optical MNDWI water index.
- **Satellite Data:** Copernicus Sentinel-1 C-SAR IW GRDH, Sentinel-2 MSI Level-2A.
- **Geospatial Vectors:** OpenStreetMap (roads, hospitals, schools, bridges), Assam disaster data.
- **Database:** PostgreSQL with PostGIS extension (with automatic SQLite fallback).
- **Testing:** Pytest automated test suite (14 passing tests).
- **DevOps:** Docker, Docker Compose.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (Node 20 or 24 recommended)
- Python 3.9+ (Python 3.9 / 3.11 recommended)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt pydantic-settings

# Initialize database and seed authentic historical dataset
PYTHONPATH=. ./venv/bin/python3 -c "from app.core.seed import seed_database; seed_database()"

# Run automated tests
PYTHONPATH=. ./venv/bin/pytest tests/test_backend.py -v

# Start FastAPI server
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Vercel Cloud Deployment

The Next.js application is ready for 1-click deployment on Vercel:

1. Import the repository in [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
4. Click **Deploy**.

For detailed setup instructions, test checklists, and architectural notes, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Docker Deployment
Run the full platform with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

---

## Application Navigation Structure

1. **Landing Overview** (`/`): Mission overview, pillars, and hero visual.
2. **Command Center** (`/command`): Real-time GIS map, metrics bar, priority ranking, and quick dispatch copilot.
3. **Satellite Intelligence** (`/satellite`): Before/after SAR slider, sensor controls, and change detection.
4. **Flood Detection** (`/flood-analysis`): Physics of radar backscatter, histograms, and GeoJSON export.
5. **Infrastructure** (`/infrastructure`): Monitored hospitals, schools, bridges, and severed road segments.
6. **Isolated Communities** (`/isolation`): NetworkX graph exclusion findings and cut-off populations.
7. **Rescue Planning** (`/routing`): Dijkstra and A* path planning with safety warnings.
8. **AI Disaster Copilot** (`/copilot`): Grounded chat interface with multimodal photo analysis.
9. **Historical Events** (`/events`): Assam 2022 Brahmaputra basin disaster archive.
10. **Disaster Reports** (`/reports`): Export printable PDF briefs, CSV, and GeoJSON.
11. **Settings & Weights** (`/settings`): Customizable multi-factor priority weights.

---

## Automated Test Verification

Run all automated unit and integration tests:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/test_backend.py -v
```
**Test Results:**
```
tests/test_backend.py::test_flood_mask_calculation PASSED
tests/test_backend.py::test_flood_area_calculation PASSED
tests/test_backend.py::test_geospatial_intersections PASSED
tests/test_backend.py::test_road_connectivity_analysis PASSED
tests/test_backend.py::test_priority_score_calculations PASSED
tests/test_backend.py::test_api_health_and_events PASSED
tests/test_backend.py::test_missing_event_handling PASSED
tests/test_backend.py::test_empty_flood_analysis_handling PASSED
tests/test_backend.py::test_disconnected_routing PASSED
tests/test_backend.py::test_copilot_tool_calling PASSED
tests/test_backend.py::test_report_generation PASSED
tests/test_backend.py::test_map_layers PASSED
tests/test_backend.py::test_infrastructure_and_isolation_endpoints PASSED
tests/test_backend.py::test_custom_priority_weights PASSED

======================== 14 passed in 0.56s ========================
```

---

## Technical Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Specification](docs/API.md)
- [Satellite & Geospatial Data Sources](docs/DATA_SOURCES.md)
- [Remote Sensing & Flood Detection](docs/FLOOD_DETECTION.md)
- [Rescue Intelligence & Isolation Algorithms](docs/RESCUE_INTELLIGENCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Hackathon Demonstration Script](docs/DEMO_SCRIPT.md)

---

## License & Credits
Built for **Multimodal AI Hackathon 2026** (Track B: Mapping Flood Damage from Space).
Satellite data provided by the **European Space Agency (ESA) Copernicus Programme**.
Geospatial vector mapping provided by **OpenStreetMap Contributors**.
