import json
import csv
import io
from datetime import datetime
from typing import Dict, Any, List

class DisasterReportService:
    """
    Multi-format Disaster Report Generator.
    Exports:
    - High-fidelity emergency operations PDF-printable HTML document
    - Structured tabular CSV export
    - Comprehensive multi-layer GeoJSON export
    """

    def generate_html_report(self, data: Dict[str, Any]) -> str:
        event = data.get("event", {})
        flood = data.get("flood", {})
        settlements = data.get("settlements", [])
        infrastructure = data.get("infrastructure", [])
        roads = data.get("roads", [])

        isolated_count = sum(1 for s in settlements if s.get("connectivity_status") in ["critical_isolated", "potentially_isolated"])
        isolated_pop = sum(s.get("estimated_population", 0) for s in settlements if s.get("connectivity_status") in ["critical_isolated", "potentially_isolated"])
        exposed_infra_count = sum(1 for i in infrastructure if i.get("flood_intersection"))
        exposed_road_km = sum(r.get("potentially_exposed_length_km", 0.0) for r in roads if r.get("flood_intersection"))

        settlement_rows = "".join([
            f"""<tr>
                <td style="padding: 8px; border: 1px solid #334155; font-weight: bold;">{s.get('priority_rank', '-')}</td>
                <td style="padding: 8px; border: 1px solid #334155;">{s.get('name')}</td>
                <td style="padding: 8px; border: 1px solid #334155;">{s.get('estimated_population', 0):,}</td>
                <td style="padding: 8px; border: 1px solid #334155; color: {'#ef4444' if s.get('connectivity_status') == 'critical_isolated' else '#f97316' if s.get('connectivity_status') == 'potentially_isolated' else '#22c55e'}; font-weight: bold;">
                    {s.get('connectivity_status', '').replace('_', ' ').upper()}
                </td>
                <td style="padding: 8px; border: 1px solid #334155;">{s.get('priority_score', 0)} / 100</td>
                <td style="padding: 8px; border: 1px solid #334155; font-size: 12px; color: #94a3b8;">{s.get('notes', 'N/A')}</td>
            </tr>"""
            for s in sorted(settlements, key=lambda x: x.get('priority_rank', 99))
        ])

        infra_rows = "".join([
            f"""<tr>
                <td style="padding: 8px; border: 1px solid #334155; font-weight: bold;">{i.get('name')}</td>
                <td style="padding: 8px; border: 1px solid #334155;">{i.get('asset_type', '').title()}</td>
                <td style="padding: 8px; border: 1px solid #334155; color: {'#ef4444' if i.get('flood_intersection') else '#22c55e'}; font-weight: bold;">
                    {'EXPOSED TO FLOOD' if i.get('flood_intersection') else 'CLEAR'}
                </td>
                <td style="padding: 8px; border: 1px solid #334155;">{i.get('capacity', 0)}</td>
                <td style="padding: 8px; border: 1px solid #334155; font-size: 12px;">{i.get('contact_info', 'Control Room')}</td>
            </tr>"""
            for i in infrastructure
        ])

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FloodGuard AI — Emergency Disaster Intelligence Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #07111F;
            color: #F8FAFC;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }}
        .header {{
            border-bottom: 2px solid #00D4FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }}
        .logo {{
            color: #00D4FF;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 1px;
        }}
        .tagline {{
            color: #94A3B8;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        .badge {{
            background: #EF4444;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
        }}
        .metric-card {{
            background: #102238;
            border: 1px solid #1E293B;
            border-radius: 8px;
            padding: 18px;
        }}
        .metric-val {{
            font-size: 28px;
            font-weight: 800;
            color: #00D4FF;
            margin-top: 6px;
        }}
        .metric-lbl {{
            font-size: 12px;
            color: #94A3B8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #0B1728;
            border: 1px solid #1E293B;
        }}
        th {{
            background: #102238;
            color: #00D4FF;
            text-align: left;
            padding: 10px;
            font-size: 13px;
            border: 1px solid #334155;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: bold;
            color: #F8FAFC;
            margin-top: 30px;
            border-left: 4px solid #00D4FF;
            padding-left: 10px;
        }}
        .disclaimer-box {{
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #EF4444;
            padding: 16px;
            border-radius: 6px;
            margin-top: 40px;
            font-size: 13px;
        }}
        @media print {{
            body {{ background: #ffffff; color: #000000; padding: 20px; }}
            .metric-card, table, th {{ background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }}
            .metric-val {{ color: #0284c7; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">FLOODGUARD AI</div>
            <div class="tagline">Disaster Response Intelligence & Satellite Remote Sensing</div>
        </div>
        <div style="text-align: right;">
            <span class="badge">HISTORICAL DISASTER REPORT</span>
            <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
        </div>
    </div>

    <div>
        <h1 style="margin: 0; font-size: 24px;">{event.get('title', 'Assam Flood Response Brief')}</h1>
        <p style="color: #94A3B8; margin: 6px 0 24px 0;">Region: <strong>{event.get('district')}, {event.get('state')}, {event.get('country')}</strong> | Observation Date: <strong>{event.get('peak_date')}</strong> | Sensor: <strong>Sentinel-1 SAR C-Band</strong></p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-lbl">Detected Flood Area</div>
            <div class="metric-val">{flood.get('flooded_area_sq_km', 412.8)} km²</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Isolated Population</div>
            <div class="metric-val">{isolated_pop:,}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Isolated Communities</div>
            <div class="metric-val">{isolated_count}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Exposed Road Network</div>
            <div class="metric-val">{round(exposed_road_km, 1)} km</div>
        </div>
    </div>

    <div class="section-title">Settlement Priority & Connectivity Assessment</div>
    <table>
        <thead>
            <tr>
                <th>Rank</th>
                <th>Settlement</th>
                <th>Population</th>
                <th>Connectivity Status</th>
                <th>Priority Score</th>
                <th>Field Evidence</th>
            </tr>
        </thead>
        <tbody>
            {settlement_rows}
        </tbody>
    </table>

    <div class="section-title">Critical Infrastructure Status</div>
    <table>
        <thead>
            <tr>
                <th>Facility Name</th>
                <th>Type</th>
                <th>Flood Status</th>
                <th>Capacity / Beds</th>
                <th>Emergency Contact</th>
            </tr>
        </thead>
        <tbody>
            {infra_rows}
        </tbody>
    </table>

    <div class="section-title">Methodology & Sensor Provenance</div>
    <p style="font-size: 13px; color: #94A3B8;">
        Surface water inundation was derived via European Space Agency (ESA) Copernicus Sentinel-1 C-Band Synthetic Aperture Radar (SAR) 
        GRD observations at 10m spatial resolution. Radar backscatter drop (&lt; -14.5 dB) indicates specular reflection from open water. 
        Network topology and community isolation were computed via NetworkX scenario graph subtraction of flood-intersected OpenStreetMap arterial and rural road vectors.
    </p>

    <div class="disclaimer-box">
        <strong>OPERATIONAL USE LIMITATION:</strong>
        This assessment is a computational planning aid. Satellite imagery reflects surface conditions at acquisition time. 
        Road closures and bridge clearances must receive operational reconnaissance verification prior to heavy relief convoy dispatch.
    </div>
</body>
</html>
"""

    def generate_csv_report(self, data: Dict[str, Any]) -> str:
        settlements = data.get("settlements", [])
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Priority Rank",
            "Settlement Name",
            "District",
            "Latitude",
            "Longitude",
            "Estimated Population",
            "Connectivity Status",
            "Flood Exposure Level",
            "Distance to Flood (m)",
            "Priority Score (0-100)",
            "Notes"
        ])

        for s in sorted(settlements, key=lambda x: x.get("priority_rank", 99)):
            writer.writerow([
                s.get("priority_rank", ""),
                s.get("name", ""),
                s.get("district", ""),
                s.get("latitude", ""),
                s.get("longitude", ""),
                s.get("estimated_population", ""),
                s.get("connectivity_status", ""),
                s.get("flood_exposure_level", ""),
                s.get("flood_distance_meters", ""),
                s.get("priority_score", ""),
                s.get("notes", "")
            ])

        return output.getvalue()

    def generate_geojson_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        features = []

        # Settlements
        for s in data.get("settlements", []):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [s["longitude"], s["latitude"]]
                },
                "properties": {
                    "feature_type": "settlement",
                    "name": s["name"],
                    "population": s["estimated_population"],
                    "connectivity_status": s["connectivity_status"],
                    "priority_score": s["priority_score"],
                    "priority_rank": s["priority_rank"]
                }
            })

        # Critical Infrastructure
        for i in data.get("infrastructure", []):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [i["longitude"], i["latitude"]]
                },
                "properties": {
                    "feature_type": "infrastructure",
                    "name": i["name"],
                    "asset_type": i["asset_type"],
                    "flood_intersection": i["flood_intersection"],
                    "capacity": i["capacity"]
                }
            })

        # Road Segments
        for r in data.get("roads", []):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": r.get("coordinates", [])
                },
                "properties": {
                    "feature_type": "road_segment",
                    "name": r.get("name"),
                    "road_type": r.get("road_type"),
                    "flood_intersection": r.get("flood_intersection"),
                    "exposed_km": r.get("potentially_exposed_length_km")
                }
            })

        # Flood Polygons
        flood_geojson = data.get("flood", {}).get("geojson_data")
        if flood_geojson and "features" in flood_geojson:
            for f in flood_geojson["features"]:
                f_copy = dict(f)
                f_copy["properties"]["feature_type"] = "satellite_flood_polygon"
                features.append(f_copy)

        return {
            "type": "FeatureCollection",
            "metadata": {
                "generated_by": "FloodGuard AI Multi-Modal Engine",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "event_title": data.get("event", {}).get("title")
            },
            "features": features
        }

report_service = DisasterReportService()
