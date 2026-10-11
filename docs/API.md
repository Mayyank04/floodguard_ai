# FloodGuard AI — REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive OpenAPI Documentation: `http://localhost:8000/docs`

---

## Endpoints

### 1. System Health
- **`GET /health`**
  - **Description:** Returns system status, service identification, and operational mode.
  - **Response:**
    ```json
    {
      "status": "online",
      "service": "FloodGuard AI Disaster Response Intelligence",
      "version": "1.0.0",
      "mode": "Operational & Historical Demo"
    }
    ```

### 2. Disaster Events
- **`GET /events`**
  - **Description:** Lists all disaster events.
- **`POST /events`**
  - **Description:** Creates a new disaster event.
- **`GET /events/{id}`**
  - **Description:** Retrieves details of a specific disaster event.

### 3. Geospatial Regions
- **`GET /regions`**
  - **Description:** Returns monitored regions with center coordinates and bounding GeoJSON.

### 4. Satellite Flood Analysis
- **`POST /analysis/flood`**
  - **Description:** Triggers SAR change detection or optical NDWI water extraction.
  - **Payload:**
    ```json
    {
      "event_id": "6d5354bb-015e-4fb3-b050-d78fb1302910",
      "algorithm": "SAR_BACKSCATTER_THRESHOLD",
      "satellite_source": "Sentinel-1",
      "sensitivity_threshold_db": -14.5,
      "filter_speckle": true
    }
    ```
- **`GET /analysis/{id}/status`**
  - **Description:** Checks processing job status.
- **`GET /analysis/{id}/results`**
  - **Description:** Retrieves computed flood mask polygons and statistics.

### 5. Infrastructure Impact
- **`GET /infrastructure/{event_id}`**
  - **Description:** Returns exposed roads, bridges, hospitals, and evacuation shelters.

### 6. Community Isolation Engine
- **`GET /isolation/{event_id}`**
  - **Description:** Returns graph-modeled reachable paths, isolated settlements count, and trapped population.

### 7. Rescue Route Assessment
- **`POST /routes/analyze`**
  - **Description:** Evaluates candidate paths between a rescue base and settlement via Dijkstra or A*.
  - **Payload:**
    ```json
    {
      "event_id": "6d5354bb-015e-4fb3-b050-d78fb1302910",
      "base_id": "base-uuid",
      "settlement_id": "settlement-uuid",
      "algorithm": "dijkstra"
    }
    ```

### 8. Rescue Priority Scoring
- **`GET /priorities/{event_id}`**
  - **Query Parameters:** `pop_w`, `iso_w`, `flood_w`, `infra_w`, `unc_w`
  - **Description:** Computes explainable normalized priority rankings.

### 9. Gemini AI Disaster Copilot
- **`POST /copilot/chat`**
  - **Description:** Submits responder query. Copilot executes backend tools and synthesizes grounded evidence.
  - **Payload:**
    ```json
    {
      "message": "Which villages are potentially isolated?",
      "event_id": "6d5354bb-015e-4fb3-b050-d78fb1302910"
    }
    ```

### 10. Disaster Reports Generator
- **`POST /reports/generate`**
  - **Description:** Compiles and exports structured reports in PDF/HTML, CSV, or GeoJSON.
  - **Payload:**
    ```json
    {
      "event_id": "6d5354bb-015e-4fb3-b050-d78fb1302910",
      "format": "PDF",
      "title": "Tactical Field Report"
    }
    ```

### 11. Unified Map Layers
- **`GET /map/layers/{event_id}`**
  - **Description:** Returns unified GeoJSON feature collections for all MapLibre GL map layers (flood polygons, roads, facilities, settlements, bases).
