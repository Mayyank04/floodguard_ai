# FloodGuard AI — Satellite & Geospatial Data Sources

## 1. Primary Remote Sensing Imagery

### Copernicus Sentinel-1 C-Band SAR
- **Operator:** European Space Agency (ESA) & European Commission
- **Sensor:** Synthetic Aperture Radar (C-SAR)
- **Central Frequency:** 5.405 GHz (C-band)
- **Acquisition Mode:** Interferometric Wide Swath (IW)
- **Product Type:** Ground Range Detected High Resolution (GRDH)
- **Spatial Resolution:** 10 meters pixel spacing
- **Polarization:** Dual polarization (VV + VH)
- **Historical Scenes Used:**
  - `2022-05-28`: Pre-monsoon dry season baseline (Track 121, descending pass)
  - `2022-06-20`: Peak monsoonal inundation pass (Track 121, descending pass)

### Copernicus Sentinel-2 Optical MSI
- **Sensor:** Multi-Spectral Instrument (MSI)
- **Bands:** Band 3 (Green, 560 nm) and Band 11 (SWIR-1, 1610 nm)
- **Spatial Resolution:** 10m / 20m
- **Processing Level:** Level-2A Bottom-Of-Atmosphere (BOA) surface reflectance
- **Scene Used:** `2022-06-24` (Used for optical MNDWI water verification)

---

## 2. Geospatial Infrastructure & Vector Data

### OpenStreetMap (OSM)
- **Road Network:** Arterial highways (NH-27, SH-4), major district roads (MDR-12), and rural char feeder pathways.
- **Bridges:** Major river crossings over the Beki and Manas rivers, as well as rural culvert crossings.
- **Healthcare Assets:** Barpeta Civil Hospital, Kalgachia Model Hospital, and Chenga Primary Health Centre.
- **Relief Facilities:** Government-designated flood shelters, higher secondary schools, and elevated embankment refuges.

---

## 3. Hydrological & Meteorological Ground Truth

### Central Water Commission (CWC)
- **River Gauging Station:** Beki River at Road Bridge (Barpeta District).
- **Recorded Water Level:** 45.10m (Danger Level: 43.24m, +1.86m above danger mark on 2022-06-20).

### Assam State Disaster Management Authority (ASDMA)
- **Disaster Reports:** Official June 2022 flood situation reports documenting over 5.4 million affected civilians and severe road severances across the Barpeta-Mandia-Chenga corridor.
