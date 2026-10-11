"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Eye, EyeOff, ZoomIn, ZoomOut, Compass, Info, MapPin } from "lucide-react";

interface FloodMapProps {
  layersData?: any;
  selectedSettlement?: any;
  candidateRoute?: any;
  onSelectSettlement?: (settlement: any) => void;
  floodOpacity?: number;
  showBeforeAfter?: boolean;
}

export default function FloodMap({
  layersData,
  selectedSettlement,
  candidateRoute,
  onSelectSettlement,
  floodOpacity = 0.7,
  showBeforeAfter = false
}: FloodMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [basemap, setBasemap] = useState<"satellite" | "dark">("dark");
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    roads: true,
    settlements: true,
    infrastructure: true,
    bases: true
  });

  const [hoveredFeature, setHoveredFeature] = useState<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // OpenFreeMap / CARTO Dark tiles style
    const darkStyle = {
      version: 8 as const,
      sources: {
        "carto-dark": {
          type: "raster" as const,
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: "carto-dark-layer",
          type: "raster" as const,
          source: "carto-dark",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: darkStyle,
      center: [91.01, 26.29], // Barpeta, Assam
      zoom: 10.6,
      attributionControl: false
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Data Sources and Layers
  useEffect(() => {
    if (!map.current || !mapLoaded || !layersData) return;
    const m = map.current;

    // 1. Flood Inundation Source & Layer
    if (layersData.flood_inundation) {
      if (m.getSource("flood-source")) {
        (m.getSource("flood-source") as maplibregl.GeoJSONSource).setData(layersData.flood_inundation);
      } else {
        m.addSource("flood-source", {
          type: "geojson",
          data: layersData.flood_inundation
        });

        m.addLayer({
          id: "flood-fill",
          type: "fill",
          source: "flood-source",
          paint: {
            "fill-color": "#00D4FF",
            "fill-opacity": floodOpacity
          }
        });

        m.addLayer({
          id: "flood-outline",
          type: "line",
          source: "flood-source",
          paint: {
            "line-color": "#38BDF8",
            "line-width": 2,
            "line-opacity": 0.9
          }
        });
      }
    }

    // 2. Road Network Source & Layer
    if (layersData.roads) {
      if (m.getSource("roads-source")) {
        (m.getSource("roads-source") as maplibregl.GeoJSONSource).setData(layersData.roads);
      } else {
        m.addSource("roads-source", {
          type: "geojson",
          data: layersData.roads
        });

        m.addLayer({
          id: "roads-lines",
          type: "line",
          source: "roads-source",
          paint: {
            "line-color": [
              "case",
              ["get", "flood_intersection"],
              "#EF4444",
              "#22C55E"
            ],
            "line-width": [
              "case",
              ["==", ["get", "road_type"], "national_highway"],
              4,
              2.5
            ],
            "line-opacity": 0.85
          }
        });
      }
    }

    // 3. Candidate Route Line (if generated)
    if (candidateRoute && candidateRoute.waypoints_geojson) {
      if (m.getSource("route-source")) {
        (m.getSource("route-source") as maplibregl.GeoJSONSource).setData(candidateRoute.waypoints_geojson);
      } else {
        m.addSource("route-source", {
          type: "geojson",
          data: candidateRoute.waypoints_geojson
        });

        m.addLayer({
          id: "candidate-route-line",
          type: "line",
          source: "route-source",
          paint: {
            "line-color": "#FACC15",
            "line-width": 5,
            "line-dasharray": [2, 1],
            "line-opacity": 0.95
          }
        });
      }
    }

    // 4. Critical Infrastructure Markers
    if (layersData.infrastructure) {
      if (m.getSource("infra-source")) {
        (m.getSource("infra-source") as maplibregl.GeoJSONSource).setData(layersData.infrastructure);
      } else {
        m.addSource("infra-source", {
          type: "geojson",
          data: layersData.infrastructure
        });

        m.addLayer({
          id: "infra-circles",
          type: "circle",
          source: "infra-source",
          paint: {
            "circle-radius": 7,
            "circle-color": [
              "match",
              ["get", "asset_type"],
              "hospital", "#A855F7",
              "shelter", "#F59E0B",
              "bridge", "#EC4899",
              "#3B82F6"
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });
      }
    }

    // 5. Rescue Bases Markers
    if (layersData.rescue_bases) {
      if (m.getSource("bases-source")) {
        (m.getSource("bases-source") as maplibregl.GeoJSONSource).setData(layersData.rescue_bases);
      } else {
        m.addSource("bases-source", {
          type: "geojson",
          data: layersData.rescue_bases
        });

        m.addLayer({
          id: "bases-circles",
          type: "circle",
          source: "bases-source",
          paint: {
            "circle-radius": 9,
            "circle-color": "#3B82F6",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#60A5FA"
          }
        });
      }
    }

    // 6. Settlements Markers
    if (layersData.settlements) {
      if (m.getSource("settlements-source")) {
        (m.getSource("settlements-source") as maplibregl.GeoJSONSource).setData(layersData.settlements);
      } else {
        m.addSource("settlements-source", {
          type: "geojson",
          data: layersData.settlements
        });

        m.addLayer({
          id: "settlements-glow",
          type: "circle",
          source: "settlements-source",
          paint: {
            "circle-radius": 14,
            "circle-color": [
              "match",
              ["get", "connectivity_status"],
              "critical_isolated", "rgba(239, 68, 68, 0.4)",
              "potentially_isolated", "rgba(249, 115, 22, 0.4)",
              "rgba(34, 197, 94, 0.2)"
            ]
          }
        });

        m.addLayer({
          id: "settlements-circles",
          type: "circle",
          source: "settlements-source",
          paint: {
            "circle-radius": 7,
            "circle-color": [
              "match",
              ["get", "connectivity_status"],
              "critical_isolated", "#EF4444",
              "potentially_isolated", "#F97316",
              "#22C55E"
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });

        // Hover & Click interaction
        m.on("click", "settlements-circles", (e) => {
          if (e.features && e.features[0] && onSelectSettlement) {
            onSelectSettlement(e.features[0].properties);
          }
        });

        m.on("mouseenter", "settlements-circles", (e) => {
          m.getCanvas().style.cursor = "pointer";
          if (e.features && e.features[0]) {
            setHoveredFeature({
              type: "settlement",
              props: e.features[0].properties,
              x: e.point.x,
              y: e.point.y
            });
          }
        });

        m.on("mouseleave", "settlements-circles", () => {
          m.getCanvas().style.cursor = "";
          setHoveredFeature(null);
        });
      }
    }
  }, [layersData, mapLoaded, candidateRoute, onSelectSettlement, floodOpacity]);

  // Adjust flood fill opacity dynamically
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (map.current.getLayer("flood-fill")) {
      map.current.setPaintProperty("flood-fill", "fill-opacity", floodOpacity);
    }
  }, [floodOpacity, mapLoaded]);

  // Pan to selected settlement if specified
  useEffect(() => {
    if (!map.current || !selectedSettlement) return;
    if (selectedSettlement.longitude && selectedSettlement.latitude) {
      map.current.flyTo({
        center: [selectedSettlement.longitude, selectedSettlement.latitude],
        zoom: 12.5,
        speed: 1.2
      });
    }
  }, [selectedSettlement]);

  // Toggle Layer Visibility
  const toggleLayer = (layerName: keyof typeof activeLayers) => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;
    const nextState = !activeLayers[layerName];
    setActiveLayers(prev => ({ ...prev, [layerName]: nextState }));

    const visibility = nextState ? "visible" : "none";
    if (layerName === "flood" && m.getLayer("flood-fill")) {
      m.setLayoutProperty("flood-fill", "visibility", visibility);
      m.setLayoutProperty("flood-outline", "visibility", visibility);
    } else if (layerName === "roads" && m.getLayer("roads-lines")) {
      m.setLayoutProperty("roads-lines", "visibility", visibility);
    } else if (layerName === "settlements" && m.getLayer("settlements-circles")) {
      m.setLayoutProperty("settlements-circles", "visibility", visibility);
      m.setLayoutProperty("settlements-glow", "visibility", visibility);
    } else if (layerName === "infrastructure" && m.getLayer("infra-circles")) {
      m.setLayoutProperty("infra-circles", "visibility", visibility);
    } else if (layerName === "bases" && m.getLayer("bases-circles")) {
      m.setLayoutProperty("bases-circles", "visibility", visibility);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-xl overflow-hidden border border-slate-800 bg-[#07111F]">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="glass-panel p-2 rounded-lg flex flex-col gap-1 shadow-2xl">
          <button
            onClick={() => map.current?.zoomIn()}
            className="p-2 hover:bg-slate-700/50 rounded text-slate-200 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => map.current?.zoomOut()}
            className="p-2 hover:bg-slate-700/50 rounded text-slate-200 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => map.current?.resetNorthPitch()}
            className="p-2 hover:bg-slate-700/50 rounded text-slate-200 transition"
            title="Reset Orientation"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Toggles Panel Top-Right */}
      <div className="absolute top-4 right-4 z-20 glass-panel p-3 rounded-xl shadow-2xl max-w-xs">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/60">
          <Layers className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Map Layers</span>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <button
            onClick={() => toggleLayer("flood")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              activeLayers.flood ? "bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
              SAR Floodwater Mask
            </span>
            {activeLayers.flood ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("roads")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              activeLayers.roads ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-1 rounded bg-emerald-400" />
              Road Network (OSM)
            </span>
            {activeLayers.roads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("settlements")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              activeLayers.settlements ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Settlements & Isolation
            </span>
            {activeLayers.settlements ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("infrastructure")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              activeLayers.infrastructure ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Hospitals & Shelters
            </span>
            {activeLayers.infrastructure ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("bases")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              activeLayers.bases ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              NDRF / SDRF Bases
            </span>
            {activeLayers.bases ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Legend Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel px-3 py-2 rounded-lg text-[11px] text-slate-300 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Critical Cut-off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <span>Potentially Isolated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <span>Road Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded bg-[#EF4444]" />
          <span>Severed Road</span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredFeature && hoveredFeature.props && (
        <div
          className="absolute z-30 pointer-events-none glass-panel p-2.5 rounded-lg shadow-xl text-xs"
          style={{ left: hoveredFeature.x + 12, top: hoveredFeature.y - 12 }}
        >
          <div className="font-bold text-slate-100">{hoveredFeature.props.name}</div>
          <div className="text-slate-300 mt-0.5">
            Population: <span className="text-[#00D4FF] font-semibold">{Number(hoveredFeature.props.population || 0).toLocaleString()}</span>
          </div>
          <div className="text-slate-400 mt-0.5 capitalize">
            Status: <span className={
              hoveredFeature.props.connectivity_status === "critical_isolated" ? "text-red-400 font-bold" :
              hoveredFeature.props.connectivity_status === "potentially_isolated" ? "text-orange-400 font-bold" : "text-emerald-400"
            }>{hoveredFeature.props.connectivity_status?.replace('_', ' ')}</span>
          </div>
          {hoveredFeature.props.priority_score && (
            <div className="text-slate-400 mt-0.5">
              Priority: <span className="text-yellow-400 font-bold">{hoveredFeature.props.priority_score}/100</span> (Rank #{hoveredFeature.props.priority_rank})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
