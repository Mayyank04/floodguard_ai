# FloodGuard AI — Hackathon Demonstration Script

This script guides presenters and judges through an authentic, reproducible 5-minute walkthrough of FloodGuard AI for **Track B: Mapping Flood Damage from Space** (Multimodal AI Hackathon 2026).

---

## Act 1: The Tactical Problem & Space Intelligence (0:00 - 0:45)
1. **Open the Landing Page** at `http://localhost:3000`.
2. **Presenter Opening Statement:**
   > *"During catastrophic floods, clouds block optical cameras, power grids fail, and cellular towers go dark. Responders need to know what is underwater and who is cut off. FloodGuard AI transforms radar from space into ground rescue operations."*
3. **Show Core Pillars on Landing Page:**
   - **Sentinel-1 SAR C-Band Radar:** Microwaves penetrate monsoon clouds and rain day or night.
   - **NetworkX Topological Road Severance:** Models community isolation beyond simple perimeter buffers.
   - **Explainable Multi-Criteria Priority Scoring:** Directs limited boats and helicopters to the most vulnerable.

---

## Act 2: Hackathon Interactive Guided Tour (0:45 - 1:30)
1. In the Top Navigation, click the glowing cyan button: **[Launch Demo Mode]** (or **[Interactive Demo]**).
2. The 6-Step Hackathon Walkthrough modal appears:
   - **Step 1: Event Ingestion** — European Space Agency Sentinel-1 SAR acquisition over Assam Brahmaputra Basin (June 2022).
   - **Step 2: Radar Physics & Backscatter Drop** — Demonstrates specular reflection drop below `-14.5 dB`, extracting **412.80 km²** inundation extent with 94.2% confidence.
   - **Step 3: Critical Infrastructure Exposure** — OSM intersection analysis identifying 4 compromised medical/bridge assets and **47.4 km** of submerged roads.
   - **Step 4: Topological Isolation Discovery** — Road network graph subtraction identifies **4 completely cut-off char settlements** holding **56,700 civilians**.
   - **Step 5: Multi-Criteria Prioritization & Evacuation Routing** — Normalized scoring prioritizing Mandia Char (Rank #1) and calculating safe transit corridors.
   - **Step 6: Grounded AI Copilot & Verified Reports** — Zero-hallucination tool-grounded synthesis and instant export.
3. Advance through the tour and click **[Proceed to Command Center]** or close modal.

---

## Act 3: Live Disaster Command Center (`/command`) (1:30 - 3:00)
1. Navigate to `/command`.
2. **Review Real-Time Telemetry KPI Cards:**
   - **SAR Inundation:** `412.8 km²` (+184% increase over pre-flood baseline).
   - **Cut-Off Population:** `56,700` civilians on riverine chars.
   - **Severed Corridors:** `47.4 km` of submerged arterial links.
   - **Cut-Off Villages:** `4 of 10` monitored settlements completely isolated.
   - **Compromised Facilities:** `4` healthcare/bridge assets affected.
   - **Detection Confidence:** `94.2%` (Dual-polarization VV+VH normalized).
3. **Demonstrate Interactive Geospatial Map (MapLibre GL):**
   - Move mouse over the map to show **Live Lat/Lng Crosshairs** (`26.32°N, 91.01°E`).
   - Switch Basemap between **Dark Carto Vector** and **Esri Satellite Imagery**.
   - Adjust the **Water Inundation Opacity Slider** from 70% to 30% to reveal underlying flooded terrain.
   - Toggle **GIS Overlays** (SAR Flood Extent, OSM Roads, Settlements, Hospitals, NDRF Staging).
   - Hover and click on **Mandia Char Settlement** in the map or Urgency Hierarchy list.
   - Show the **Target Inspector Card**: Population 16,500, Status `CRITICAL ISOLATED`, Priority Score `72.9/100`, Rank #1.
   - Filter Urgency list between **[All (10)]** and **[Critical (4)]**.

---

## Act 4: Candidate Evacuation Route Planning (`/routing`) (3:00 - 3:45)
1. Navigate to `/routing` (or click **"Compute Evacuation Route"** in Target Inspector).
2. **Origin Staging Base:** Select `NDRF 1st Bn Barpeta Staging Unit (65 personnel, 12 boats)`.
3. **Destination Target:** Select `Mandia Char Settlement (Pop: 16,500)`.
4. **Algorithm:** Select `Dijkstra Search` or `A* Heuristic Search`.
5. Click **[Compute Candidate Route]**.
6. **Walk Through the Algorithmic Output:**
   - Geospatial overlay renders gold dashed candidate trajectory (**21.56 km**, estimated transit time: **86.2 min**).
   - Route Classification: `flood_exposed_candidate_route`.
   - **Mandatory Operational Safety Disclaimer:**
     > *"IMPORTANT SAFETY NOTICE: This route is a preliminary computational planning aid generated from satellite observations and OpenStreetMap geometries. Satellite imagery CANNOT confirm that a road surface is structurally sound. Ground or UAV reconnaissance is required before dispatch."*

---

## Act 5: Evidence-Grounded AI Disaster Copilot (`/copilot`) (3:45 - 4:25)
1. Navigate to `/copilot`.
2. Click the quick suggestion chip:
   > *"Which settlements have lost 100% of road access?"*
3. **Highlight Key Architectural Strengths to Judges:**
   - Point to the **Executed Backend Tool Badge**: `✓ get_isolated_settlements()`.
   - The response cites exact verifiable metrics (4 settlements, 56,700 population, Mandia Char 16,500, Kalgachia 18,200, Tarabari Ghat 8,900, Baghbar Hill 13,100).
   - Zero hallucination: Every number is derived from the database and graph engine.
   - Multimodal photo capability: Responders can upload geotagged field photos for high-water mark damage assessment.

---

## Act 6: Verified Disaster Briefing Export (`/reports`) (4:25 - 5:00)
1. Navigate to `/reports`.
2. Click **[Generate Operations Brief]**.
3. View the instantly rendered HTML Sitrep with executive summary, radar detection provenance, critical hospital status, and settlement priority table.
4. Show the one-click export actions:
   - **Printable PDF Brief**
   - **Tabular CSV Data**
   - **Unified GeoJSON Layers**
5. **Presenter Closing:**
   > *"FloodGuard AI bridges the gap between raw Copernicus satellite data and frontline emergency dispatch. From Space to Safety. Intelligence That Saves Lives."*
