"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers, Eye, EyeOff, ZoomIn, ZoomOut, Compass, Info,
  MapPin, Maximize2, Minimize2, Navigation, Shield, Satellite,
  Activity, Crosshair, ChevronDown, ChevronUp
} from "lucide-react";

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
  const [basemap, setBasemap] = useState<"dark" | "satellite">("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({ lat: "26.3211", lng: "91.0065" });
  const [zoomLevel, setZoomLevel] = useState("10.6");

  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    roads: true,
    settlements: true,
    infrastructure: true,
    bases: true
  });

  const [hoveredFeature, setHoveredFeature] = useState<any>(null);

  // Basemap style configurations
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

  const satelliteStyle = {
    version: 8 as const,
    sources: {
      "esri-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "esri-sat-layer",
        type: "raster" as const,
        source: "esri-satellite",
        minzoom: 0,
        maxzoom: 20
      }
    ]
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: basemap === "dark" ? darkStyle : satelliteStyle,
      center: [91.01, 26.29], // Barpeta, Assam
      zoom: 10.6,
      attributionControl: false
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    map.current.on("mousemove", (e) => {
      setMouseCoords({
        lat: e.lngLat.lat.toFixed(4),
        lng: e.lngLat.lng.toFixed(4)
      });
    });

    map.current.on("zoom", () => {
      if (map.current) {
        setZoomLevel(map.current.getZoom().toFixed(1));
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle Basemap Switch
  const switchBasemap = (newBasemap: "dark" | "satellite") => {
    if (newBasemap === basemap || !map.current) return;
    setBasemap(newBasemap);
    map.current.setStyle(newBasemap === "dark" ? darkStyle : satelliteStyle);
    map.current.once("style.load", () => {
      // Re-trigger layers addition
      setMapLoaded(true);
    });
  };

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
            "fill-color": "#00E5FF",
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
            "line-opacity": 0.95
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
              "#FF3B30",
              "#10B981"
            ],
            "line-width": [
              "case",
              ["==", ["get", "road_type"], "national_highway"],
              4,
              2.5
            ],
            "line-opacity": 0.9
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
          id: "candidate-route-glow",
          type: "line",
          source: "route-source",
          paint: {
            "line-color": "#FACC15",
            "line-width": 10,
            "line-opacity": 0.35,
            "line-blur": 3
          }
        });

        m.addLayer({
          id: "candidate-route-line",
          type: "line",
          source: "route-source",
          paint: {
            "line-color": "#FACC15",
            "line-width": 4,
            "line-dasharray": [2, 1],
            "line-opacity": 1.0
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
            "circle-color": "#2563EB",
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
              "critical_isolated", "rgba(255, 59, 48, 0.4)",
              "potentially_isolated", "rgba(249, 115, 22, 0.4)",
              "rgba(16, 185, 129, 0.2)"
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
              "critical_isolated", "#FF3B30",
              "potentially_isolated", "#F97316",
              "#10B981"
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
  }, [layersData, mapLoaded, candidateRoute, onSelectSettlement, floodOpacity, basemap]);

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

  const toggleFullscreen = () => {
    if (!mapContainer.current) return;
    if (!isFullscreen) {
      if (mapContainer.current.requestFullscreen) {
        mapContainer.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#050B14] shadow-2xl ${isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating HUD Telemetry Bar Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Navigation Controls */}
        <div className="glass-panel p-1.5 rounded-xl flex flex-col gap-1 shadow-2xl border border-slate-700/60">
          <button
            onClick={() => map.current?.zoomIn()}
            className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-200 hover:text-[#00E5FF] transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => map.current?.zoomOut()}
            className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-200 hover:text-[#00E5FF] transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => map.current?.resetNorthPitch()}
            className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-200 hover:text-[#00E5FF] transition cursor-pointer"
            title="Reset Orientation"
          >
            <Compass className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 my-0.5" />
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-200 hover:text-[#00E5FF] transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Coordinates Readout */}
        <div className="glass-panel px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-2 border border-slate-800/80 shadow-lg">
          <Crosshair className="w-3 h-3 text-[#00E5FF] animate-pulse" />
          <span>{mouseCoords.lat}°N, {mouseCoords.lng}°E</span>
          <span className="text-slate-500">|</span>
          <span className="text-[#00E5FF]">z{zoomLevel}</span>
        </div>
      </div>

      {/* Basemap Switcher Top-Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-2xl border border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => switchBasemap("dark")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              basemap === "dark"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dark Carto</span>
          </button>
          <button
            onClick={() => switchBasemap("satellite")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              basemap === "satellite"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite Imagery</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles Panel Top-Right */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <div className="glass-panel rounded-xl shadow-2xl border border-slate-700/60 w-64 overflow-hidden">
          <div
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center justify-between px-3 py-2.5 bg-slate-900/60 border-b border-slate-800 cursor-pointer select-none hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">GIS Overlays</span>
            </div>
            {layersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </div>

          {layersOpen && (
            <div className="p-2.5 flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => toggleLayer("flood")}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeLayers.flood ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 font-medium" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                  <span>SAR Flood Extent</span>
                </span>
                {activeLayers.flood ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("roads")}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeLayers.roads ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-emerald-400" />
                  <span>Road Network (OSM)</span>
                </span>
                {activeLayers.roads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("settlements")}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeLayers.settlements ? "bg-red-500/20 text-red-300 border border-red-500/30 font-medium" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#FF3B30]" />
                  <span>Settlements & Isolation</span>
                </span>
                {activeLayers.settlements ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("infrastructure")}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeLayers.infrastructure ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Hospitals & Shelters</span>
                </span>
                {activeLayers.infrastructure ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("bases")}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeLayers.bases ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>NDRF / SDRF Staging</span>
                </span>
                {activeLayers.bases ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Hover Tooltip Card */}
      {hoveredFeature && (
        <div
          className="absolute z-30 pointer-events-none glass-panel p-3 rounded-xl border border-cyan-500/40 shadow-2xl max-w-xs text-xs animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: Math.min(hoveredFeature.x + 15, 600),
            top: Math.max(hoveredFeature.y - 70, 20)
          }}
        >
          <div className="font-bold text-white flex items-center justify-between gap-2">
            <span>{hoveredFeature.props.name}</span>
            <span className="font-mono text-[10px] text-yellow-400">
              Score: {hoveredFeature.props.priority_score}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Pop: {Number(hoveredFeature.props.population || hoveredFeature.props.estimated_population || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
              hoveredFeature.props.connectivity_status === "critical_isolated" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
              hoveredFeature.props.connectivity_status === "potentially_isolated" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" :
              "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}>
              {hoveredFeature.props.connectivity_status?.replace('_', ' ')}
            </span>
            <span className="text-[9px] text-slate-400">Click to focus</span>
          </div>
        </div>
      )}

      {/* Tactical Bottom Legend Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center justify-between text-[11px] text-slate-300 border border-slate-700/60 overflow-x-auto scrollbar-none gap-4">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] font-mono">Legend:</span>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              <span>Inundated Flood Water (SAR Mask)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF3B30] shadow-[0_0_6px_#FF3B30]" />
              <span>Severed / Cut-Off Road</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span>Passable Dry Corridor</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#A855F7]" />
              <span>Hospital / Health Facility</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
              <span>NDRF Staging Base</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono text-[10px]">
            <span>10m Spatial Resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
