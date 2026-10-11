# FloodGuard AI — Flood Detection Methodology

## 1. Remote Sensing Physics: SAR vs. Optical

During severe monsoonal flooding in South Asia, persistent cloud decks blind optical satellite sensors (Landsat, Sentinel-2). Synthetic Aperture Radar (SAR) transmits microwave pulses that penetrate clouds, heavy rain, and darkness.

### Specular Reflection Mechanism
- **Dry Soil & Canopy:** Micro-rough surfaces scatter microwave pulses in all directions; a strong backscatter returns to the antenna (-6 dB to -10 dB).
- **Open Water:** Calm surface water behaves as a specular mirror, reflecting the radar beam away from the sensor. Backscatter intensity drops dramatically (&lt; -14.5 dB).

```
Radar Antenna                      Radar Antenna
     ^                                  \
     | Backscatter                      | Incident Beam
     |                                  v
+----+----+ (Rough Terrain)        ~~~~~~~~~~~~~~~~ (Calm Water Surface)
Strong Signal Received              Reflected Away (Specular Reflection)
Sigma0: -8 dB                       Sigma0: -18 dB (Dark in SAR Image)
```

---

## 2. Detection Pipeline

```
1. Ingest Dual-Date Sentinel-1 IW GRDH Scenes (Pre-flood & Peak-flood)
   ↓
2. Radiometric Calibration: Digital Numbers (DN) → Sigma0 dB
   ↓
3. Speckle Noise Reduction: 5x5 Lee Sigma Spatial Filter
   ↓
4. Change Detection Thresholding: Identify pixels with Sigma0 < -14.5 dB & Delta > 4.5 dB drop
   ↓
5. Permanent Water Body Masking: Subtract pre-monsoon dry season baseline
   ↓
6. Morphological Cleanup & Connected Component Clustering
   ↓
7. Vectorization: Convert binary raster mask to MultiPolygon GeoJSON
   ↓
8. Geodesic Metric Area Calculation: Scale to local latitude (26.3°N)
```

---

## 3. Optical Fallback: Sentinel-2 MNDWI

When cloud-free optical scenes are available, FloodGuard calculates the Modified Normalized Difference Water Index (MNDWI):

$$\text{MNDWI} = \frac{\text{Green} - \text{SWIR}}{\text{Green} + \text{SWIR}} = \frac{\text{Band 3} - \text{Band 11}}{\text{Band 3} + \text{Band 11}}$$

Pixels with $\text{MNDWI} > 0.15$ are classified as surface water, with cloud masking applied via Sentinel-2 Scene Classification (SCL).
