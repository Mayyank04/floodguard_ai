import os
import math
import numpy as np
from PIL import Image, ImageFilter
from shapely.geometry import shape, Point
from app.data.assam_flood_dataset import get_historical_flood_geojson

def generate_rasters():
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/public/satellite"))
    os.makedirs(output_dir, exist_ok=True)
    
    # Grid dimensions (representing 90.75E to 91.35E, 26.05N to 26.55N at ~50m pixel resolution)
    width, height = 800, 600
    min_lon, max_lon = 90.75, 91.35
    min_lat, max_lat = 26.05, 26.55

    geojson = get_historical_flood_geojson()
    flood_geom = shape(geojson["features"][0]["geometry"])

    # Normal permanent river channel coordinates (Brahmaputra main stem)
    river_pts = [
        (90.78, 26.12), (90.88, 26.14), (90.95, 26.16),
        (91.04, 26.18), (91.15, 26.22), (91.28, 26.26), (91.34, 26.28)
    ]

    # Pre-flood array: May 28, 2022 (Sigma0 backscatter: Land ~ -9 to -12 dB, Normal Water ~ -18 dB)
    # Mapping dB to grayscale: [-22 dB ... -5 dB] -> [20 ... 230]
    np.random.seed(42)
    # Base terrain backscatter with speckle noise (Rayleigh / Gamma distributed amplitude)
    base_land = np.random.normal(140, 22, (height, width)).astype(np.float32)

    # Add topography / agricultural texture
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    texture = np.sin(x_coords / 15.0) * 8.0 + np.cos(y_coords / 18.0) * 8.0
    pre_img = np.clip(base_land + texture, 30, 240)

    # Permanent river channel mask in pre-flood
    for i in range(len(river_pts) - 1):
        x1 = int((river_pts[i][0] - min_lon) / (max_lon - min_lon) * width)
        y1 = int((max_lat - river_pts[i][1]) / (max_lat - min_lat) * height)
        x2 = int((river_pts[i+1][0] - min_lon) / (max_lon - min_lon) * width)
        y2 = int((max_lat - river_pts[i+1][1]) / (max_lat - min_lat) * height)
        # Draw channel line
        dist = np.hypot(x_coords - (x1 + x2)/2, y_coords - (y1 + y2)/2)
        channel_mask = dist < 25
        pre_img[channel_mask] = np.random.normal(35, 6, np.count_nonzero(channel_mask))

    pre_img = np.clip(pre_img, 15, 245).astype(np.uint8)
    pre_pil = Image.fromarray(pre_img)
    # Apply subtle radar speckle filter
    pre_pil = pre_pil.filter(ImageFilter.GaussianBlur(radius=0.7))
    pre_path = os.path.join(output_dir, "pre_flood_s1_20220528.png")
    pre_pil.save(pre_path)
    print(f"Generated {pre_path}")

    # Peak-flood array: June 20, 2022 (Extensive specular reflection across inundated chars)
    peak_img = pre_img.copy().astype(np.float32)

    # Inundation mask from actual flood polygon
    # Downsample check for pixel containment
    step_y, step_x = (max_lat - min_lat) / height, (max_lon - min_lon) / width
    for y in range(0, height, 4):
        lat = max_lat - y * step_y
        for x in range(0, width, 4):
            lon = min_lon + x * step_x
            if flood_geom.contains(Point(lon, lat)):
                # Water causes backscatter drop below -15 dB (grayscale 25-45)
                patch = np.random.normal(32, 7, (4, 4))
                peak_img[y:y+4, x:x+4] = patch

    peak_img = np.clip(peak_img, 15, 245).astype(np.uint8)
    peak_pil = Image.fromarray(peak_img)
    peak_pil = peak_pil.filter(ImageFilter.GaussianBlur(radius=0.7))
    peak_path = os.path.join(output_dir, "peak_flood_s1_20220620.png")
    peak_pil.save(peak_path)
    print(f"Generated {peak_path}")

    # Sentinel-2 False Color (SWIR-NIR-Green) simulation
    # Healthy vegetation = bright green, turbid flood water = dark blue/cyan, clouds = white
    s2_rgb = np.zeros((height, width, 3), dtype=np.uint8)
    s2_rgb[:, :, 0] = (peak_img * 0.4).astype(np.uint8) # Red/SWIR
    s2_rgb[:, :, 1] = np.clip(peak_img * 1.1 + 30, 0, 255).astype(np.uint8) # Green/NIR
    s2_rgb[:, :, 2] = np.clip(peak_img * 0.8 + 20, 0, 255).astype(np.uint8) # Blue

    # Add monsoon cloud deck across upper 35% of optical scene
    clouds = (np.sin(x_coords/40.0) * np.cos(y_coords/30.0) > 0.1) & (y_coords < 250)
    s2_rgb[clouds] = [235, 240, 250]
    
    s2_pil = Image.fromarray(s2_rgb)
    s2_path = os.path.join(output_dir, "sentinel2_optical_20220620.png")
    s2_pil.save(s2_path)
    print(f"Generated {s2_path}")

if __name__ == "__main__":
    generate_rasters()
