# FloodGuard AI — Hackathon Demonstration Script

This script guides presenters and judges through a complete 5-minute walkthrough of FloodGuard AI for **Track B: Mapping Flood Damage from Space**.

---

## Act 1: The Challenge (0:00 - 0:45)
1. Open the **Landing Page** at `http://localhost:3000`.
2. Introduce the mission:
   > *"When roads, bridges, and phone lines are gone, rescuers still need to know where the damage is and who is cut off. FloodGuard AI tells them—from space."*
3. Highlight the 3 core pillars:
   - Cloud-penetrating Satellite Flood Intelligence
   - Graph-based Community Isolation Detection
   - Evidence-grounded AI Rescue Prioritization

---

## Act 2: Interactive Presentation Mode (0:45 - 1:30)
1. Click the top button: **[Launch Demo Mode]**.
2. Walk through the 6 guided phases:
   - Phase 1: Historical Event Ingestion (Assam 2022 Brahmaputra basin).
   - Phase 2: SAR Microwave Backscatter (-14.5 dB threshold, 412.8 km² extent).
   - Phase 3: Infrastructure Intersections (41.7 km severed roads, 4 compromised hospitals).
   - Phase 4: NetworkX Graph Isolation (61,100 civilians cut off).
   - Phase 5: Multi-Factor Prioritization (Mandia Char & Chenga Village).
   - Phase 6: Grounded Gemini Copilot & Instant Report Generation.

---

## Act 3: Disaster Command Center (1:30 - 3:00)
1. Navigate to **Command Center** (`/command`).
2. Show the live overview metrics:
   - Flooded Area: **412.8 km²**
   - Isolated Population: **61,100**
   - Severed Corridors: **41.7 km**
   - Cut-off Villages: **5**
3. Interact with the **MapLibre GL Map**:
   - Adjust the **Flood Inundation Opacity Slider** (watch the blue SAR overlay fade).
   - Toggle Map Layers (Roads, Settlements, Hospitals, Rescue Bases).
   - Click on **Mandia Char Settlement** (Rank #1 priority, Score: 94.6/100).
   - Click on **Chenga Village** (Culvert breaches along State Highway SH-4).

---

## Act 4: Rescue Route Assessment (3:00 - 3:45)
1. Navigate to **Rescue Planning** (`/routing`).
2. Select Origin: **NDRF 1st Bn Barpeta Staging Unit**.
3. Select Destination: **Mandia Char Settlement**.
4. Click **[Compute Candidate Route]**.
5. Observe the result:
   - Route classification: `flood_exposed_candidate_route` or `no_mapped_route`.
   - Prominent tactical warning: *"Preliminary planning aid. Satellite imagery cannot confirm road subgrade stability."*

---

## Act 5: Evidence-Grounded AI Copilot (3:45 - 4:30)
1. Navigate to **AI Copilot** (`/copilot`).
2. Click the suggested prompt: *"Which villages are potentially isolated?"*
3. Point out:
   - Executed backend tool badges: `get_isolated_settlements()`, `get_flood_analysis()`.
   - Exact numerical statistics cited directly from the database.
   - Zero hallucination or invented casualties.

---

## Act 6: Disaster Brief Generation (4:30 - 5:00)
1. Navigate to **Disaster Reports** (`/reports`).
2. Click **[Generate Report]**.
3. View the printable operations brief with executive metrics, priority tables, and sensor provenance.
4. Click **[Print / Save as PDF]** or download structured **CSV** / **GeoJSON**.
5. Conclude: *"From Space to Safety. Intelligence That Saves Lives."*
