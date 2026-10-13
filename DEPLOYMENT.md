# FloodGuard AI — Vercel Production Deployment Guide

This guide describes how to deploy the FloodGuard AI Next.js web application to Vercel for public demonstration and submission in the Multimodal AI Hackathon 2026.

---

## 1. Architecture Overview

FloodGuard AI is architected to deploy seamlessly on Vercel as a production-grade, self-contained Next.js App Router application:

- **Built-in Serverless API Routes (`/api/*`)**: Handles Gemini AI Copilot (`/api/copilot`), route evaluation (`/api/routes/analyze`), community isolation analysis (`/api/isolation/[id]`), priority scoring (`/api/priorities/[id]`), map layers (`/api/map/layers/[id]`), and report generation (`/api/reports/generate`).
- **Zero Localhost Dependencies**: Default API requests resolve relative to the deployment origin (`/api`), eliminating hardcoded local development ports.
- **Embedded Historical Demo Repository (`public/demo/assam-2022/`)**: Serves precomputed Copernicus Sentinel-1 SAR observations, OpenStreetMap road vectors, settlement points, critical infrastructure, and rescue bases for the June 2022 Assam flood scenario.
- **Client-Side GIS & Graph Engine Fallbacks**: Topological Dijkstra and A* pathfinding, connectivity diagnostics, and multi-format report exports (PDF HTML, CSV, GeoJSON) execute deterministically on-demand.
- **SSR Safety**: Heavy browser-only mapping libraries (MapLibre GL JS) are loaded via dynamic imports with `ssr: false` to eliminate WebGL / window SSR errors.

---

## 2. Environment Variables

Configure the following environment variable in your Vercel Project Settings:

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Recommended** | *None* | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Enables live AI reasoning in `/api/copilot`. If omitted, Copilot displays an explicit offline state with setup instructions rather than faking an AI call. |
| `NEXT_PUBLIC_API_URL` | Optional | `""` (relative `/api`) | Optional URL to an external FastAPI backend. Leave **empty** on Vercel to use the built-in Next.js serverless API routes. |

---

## 3. Deployment Options

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "chore: prepare Next.js application for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository (`floodguard-ai`).

3. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`** (Crucial: the Next.js app is located in the `frontend` subfolder).
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Under **Environment Variables**, add:
     - `GEMINI_API_KEY`: `<your_actual_gemini_api_key>`
   - Leave `NEXT_PUBLIC_API_URL` empty.

5. **Deploy**:
   - Click **Deploy**.
   - Build completes in ~1-2 minutes.

---

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the frontend directory**:
   ```bash
   cd frontend
   vercel
   ```
   Follow the prompts to link your Vercel account and set up the project.

3. **Set the environment variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   (Paste your Gemini key and select Production, Preview, Development).

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## 4. Verification & Testing Checklist

After your deployment completes, verify each core capability on your live URL:

- [ ] **Homepage (`/`)**: Hero section renders smoothly, "Launch Platform" links to `/command`, "Watch Demo" opens walkthrough modal.
- [ ] **Command Center (`/command`)**: Interactive MapLibre GL map renders CARTO Voyager tiles, Brahmaputra flood overlay is visible, metrics bar populates with 412.8 km² flooded area and 56,700 isolated population.
- [ ] **Interactive Map (`/command`, `/routing`, `/isolation`)**:
  - Pan and Zoom work smoothly.
  - CARTO Voyager tiles load with authorized endpoint and proper attribution.
  - Clicking settlements opens contextual inspection drawer.
  - Clicking road corridors displays accessibility details and status override form.
- [ ] **Satellite Engine (`/satellite`)**: Split comparison slider shifts smoothly between May 28 (Pre-Flood) and June 20 (Peak Flood Sentinel-1 radar) imagery.
- [ ] **Community Isolation (`/isolation`)**: Cut-off settlements (Mandia Char, Tarabari Ghat, Chenga, Kalgachia) list connectivity evidence and population exposure.
- [ ] **Rescue Route Planner (`/routing`)**:
  - Origin: *Barpeta District DEOC*
  - Destination: *Bhawanipur* (Computes accessible unexposed route via High Ground Connector, ~17.6 km).
  - Destination: *Mandia Char* (Identifies approach road severance, calculates flooded candidate route with mandatory safety warning).
  - Safety disclaimer is clearly visible.
- [ ] **Gemini Copilot (`/copilot`)**:
  - If `GEMINI_API_KEY` is configured: Returns structured operational answer citing Sentinel-1 and OpenStreetMap references across 5 required sections.
  - If `GEMINI_API_KEY` is omitted: Cleanly displays an unavailable state informing the reviewer how to add the key.
- [ ] **Report Generator (`/reports`)**:
  - Executive PDF format opens printable emergency dossier (`window.print()`).
  - Tabular CSV triggers `.csv` download.
  - Spatial GeoJSON triggers `.geojson` download.
- [ ] **Mobile Responsiveness**: Test on mobile screen sizes (navigation drawer, touch-friendly map controls).

---

## 5. Precomputed Historical Demo Data Layout

All historical reference data is publicly accessible under `/demo/assam-2022/`:

```
public/demo/assam-2022/
├── event.json                 # Disaster metadata, coordinates, bounding box
├── satellite-metadata.json    # Sentinel-1 & Sentinel-2 scene parameters
├── flood-extent.geojson       # MultiPolygon change-detection inundation mask
├── settlements.geojson        # Point geometries with population & isolation rank
├── roads.geojson              # Highway & rural road LineString corridors
├── infrastructure.geojson     # Hospitals, relief shelters, culvert bridges
├── rescue-bases.geojson       # NDRF staging units & District EOC locations
└── analysis-results.json      # Comprehensive multi-criteria analysis summary
```

---

## 6. Known Constraints & Operational Disclaimers

1. **Preliminary Planning Aids**: Candidate rescue routes are computational planning aids derived from satellite radar change detection and topological OpenStreetMap geometries. Spaceborne radar cannot confirm subterranean roadbed integrity, culvert washouts, or structural bridge safety. Tactical reconnaissance is strictly required before deploying vehicles.
2. **Heavy Raster Pipelines**: Full SAR Level-1 speckle filtering and radiometric calibration require heavy GDAL/rasterio bindings preserved in `backend/app/data/generate_satellite_rasters.py`. On Vercel, lightweight vector geometries and pre-rendered satellite rasters are served for instant response times.
