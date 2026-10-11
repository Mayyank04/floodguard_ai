"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers, Eye, EyeOff, ZoomIn, ZoomOut, Compass,
  MapPin, Maximize2, Minimize2, Navigation, Shield,
  Search, Crosshair, ChevronDown, ChevronUp, AlertCircle,
  Building2, Hospital, Radio, RefreshCw, X
} from "lucide-react";
import { BASEMAPS, DEFAULT_BASEMAP_ID, BasemapConfig } from "./basemaps";

export interface FloodGuardMapProps {
  layersData?: any;
  selectedSettlement?: any;
  candidateRoute?: any;
  onSelectSettlement?: (settlement: any) => void;
  onSelectRoad?: (road: any) => void;
  floodOpacity?: number;
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  className?: string;
}

const QUICK_LOCATIONS = [
  { name: "Barpeta Center", coords: [91.0065, 26.3211], zoom: 11 },
  { name: "Mandia Char", coords: [90.965, 26.175], zoom: 12.5 },
  { name: "Kalgachia", coords: [90.875, 26.291], zoom: 12 },
  { name: "Chenga Sector", coords: [91.072, 26.248], zoom: 12 },
  { name: "Full Flood Basin", coords: [91.01, 26.32], zoom: 10 },
];

export default function FloodGuardMap({
  layersData,
  selectedSettlement,
  candidateRoute,
  onSelectSettlement,
  onSelectRoad,
  floodOpacity = 0.65,
  initialCenter = [91.01, 26.32],
  initialZoom = 10,
  className = ""
}: FloodGuardMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentBasemap, setCurrentBasemap] = useState<string>(DEFAULT_BASEMAP_ID);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersMenuOpen, setLayersMenuOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Mouse coordinate HUD
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({
    lat: initialCenter[1].toFixed(4),
    lng: initialCenter[0].toFixed(4)
  });
  const [zoomLevel, setZoomLevel] = useState(initialZoom.toFixed(1));

  // Feature inspection drawer state
  const [activeFeature, setActiveFeature] = useState<{
    type: "settlement" | "road" | "asset";
    data: any;
  } | null>(null);

  // Layer visibility state
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    roads: true,
    settlements: true,
    infrastructure: true,
    bases: true,
    routes: true
  });

  // Safe layer initialization & source binding
  const syncLayersToMap = useCallback((m: maplibregl.Map) => {
    if (!layersData) return;

    // 1. Flood Inundation Polygon
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
            "fill-color": "#06B6D4",
            "fill-opacity": floodOpacity
          }
        });

        m.addLayer({
          id: "flood-outline",
          type: "line",
          source: "flood-source",
          paint: {
            "line-color": "#0891B2",
            "line-width": 1.5,
            "line-opacity": 0.9
          }
        });
      }
    }

    // 2. Road Network Lines
    if (layersData.roads) {
      if (m.getSource("roads-source")) {
        (m.getSource("roads-source") as maplibregl.GeoJSONSource).setData(layersData.roads);
      } else {
        m.addSource("roads-source", {
          type: "geojson",
          data: layersData.roads
        });

        // Background casing for roads
        m.addLayer({
          id: "roads-casing",
          type: "line",
          source: "roads-source",
          paint: {
            "line-color": "#0F172A",
            "line-width": 4,
            "line-opacity": 0.6
          }
        });

        // Active road colored lines
        m.addLayer({
          id: "roads-lines",
          type: "line",
          source: "roads-source",
          paint: {
            "line-color": [
              "case",
              ["get", "flood_intersection"],
              "#EF4444", // Red = severed/intersected
              "#10B981"  // Emerald = open corridor
            ],
            "line-width": [
              "case",
              ["==", ["get", "road_type"], "national_highway"],
              3.5,
              2.0
            ],
            "line-opacity": 0.95
          }
        });

        // Click road interaction
        m.on("click", "roads-lines", (e) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties;
            setActiveFeature({ type: "road", data: props });
            if (onSelectRoad) onSelectRoad(props);
          }
        });

        m.on("mouseenter", "roads-lines", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "roads-lines", () => {
          m.getCanvas().style.cursor = "";
        });
      }
    }

    // 3. Candidate Rescue Route
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
            "line-color": "#2563EB",
            "line-width": 8,
            "line-opacity": 0.35,
            "line-blur": 2
          }
        });

        m.addLayer({
          id: "candidate-route-line",
          type: "line",
          source: "route-source",
          paint: {
            "line-color": "#3B82F6",
            "line-width": 3.5,
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
            "circle-radius": 6.5,
            "circle-color": [
              "match",
              ["get", "asset_type"],
              "hospital", "#9333EA",
              "shelter", "#F59E0B",
              "bridge", "#EC4899",
              "#2563EB"
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });

        m.on("click", "infra-circles", (e) => {
          if (e.features && e.features[0]) {
            setActiveFeature({ type: "asset", data: e.features[0].properties });
          }
        });
        m.on("mouseenter", "infra-circles", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "infra-circles", () => {
          m.getCanvas().style.cursor = "";
        });
      }
    }

    // 5. Rescue Bases
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
            "circle-radius": 8,
            "circle-color": "#2563EB",
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#FFFFFF"
          }
        });
      }
    }

    // 6. Settlements & Isolation Points
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
            "circle-radius": 12,
            "circle-color": [
              "match",
              ["get", "connectivity_status"],
              "critical_isolated", "rgba(239, 68, 68, 0.35)",
              "potentially_isolated", "rgba(245, 158, 11, 0.35)",
              "rgba(16, 185, 129, 0.2)"
            ]
          }
        });

        m.addLayer({
          id: "settlements-circles",
          type: "circle",
          source: "settlements-source",
          paint: {
            "circle-radius": 6.5,
            "circle-color": [
              "match",
              ["get", "connectivity_status"],
              "critical_isolated", "#EF4444",
              "potentially_isolated", "#F59E0B",
              "#10B981"
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });

        m.on("click", "settlements-circles", (e) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties;
            setActiveFeature({ type: "settlement", data: props });
            if (onSelectSettlement) onSelectSettlement(props);
          }
        });

        m.on("mouseenter", "settlements-circles", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "settlements-circles", () => {
          m.getCanvas().style.cursor = "";
        });
      }
    }
  }, [layersData, candidateRoute, floodOpacity, onSelectSettlement, onSelectRoad]);

  // Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      const selectedStyle = BASEMAPS[currentBasemap]?.style || BASEMAPS[DEFAULT_BASEMAP_ID].style;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: selectedStyle,
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false
      });

      // Add standard navigation & scale controls
      map.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

      map.current.on("load", () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on("error", (e) => {
        console.warn("MapLibre event error:", e);
        // Do not crash on transient tile 404s
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
    } catch (err: any) {
      console.error("Map initialization failed:", err);
      setMapError("WebGL initialization failed or MapLibre could not load. Check browser hardware acceleration.");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Sync data layers whenever layersData or mapLoaded changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    syncLayersToMap(map.current);
  }, [mapLoaded, syncLayersToMap]);

  // Adjust flood opacity dynamically
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (map.current.getLayer("flood-fill")) {
      map.current.setPaintProperty("flood-fill", "fill-opacity", floodOpacity);
    }
  }, [floodOpacity, mapLoaded]);

  // Pan to selected settlement if passed as prop
  useEffect(() => {
    if (!map.current || !selectedSettlement) return;
    const lng = selectedSettlement.longitude;
    const lat = selectedSettlement.latitude;
    if (lng && lat) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 12.5,
        speed: 1.2
      });
      setActiveFeature({ type: "settlement", data: selectedSettlement });
    }
  }, [selectedSettlement]);

  // Basemap switch handler
  const switchBasemap = (basemapId: string) => {
    if (!map.current || basemapId === currentBasemap) return;
    const cfg = BASEMAPS[basemapId];
    if (!cfg) return;

    setCurrentBasemap(basemapId);
    map.current.setStyle(cfg.style);

    map.current.once("style.load", () => {
      setMapLoaded(true);
      if (map.current) {
        syncLayersToMap(map.current);
      }
    });
  };

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
      if (m.getLayer("roads-casing")) m.setLayoutProperty("roads-casing", "visibility", visibility);
    } else if (layerName === "settlements" && m.getLayer("settlements-circles")) {
      m.setLayoutProperty("settlements-circles", "visibility", visibility);
      m.setLayoutProperty("settlements-glow", "visibility", visibility);
    } else if (layerName === "infrastructure" && m.getLayer("infra-circles")) {
      m.setLayoutProperty("infra-circles", "visibility", visibility);
    } else if (layerName === "bases" && m.getLayer("bases-circles")) {
      m.setLayoutProperty("bases-circles", "visibility", visibility);
    } else if (layerName === "routes" && m.getLayer("candidate-route-line")) {
      m.setLayoutProperty("candidate-route-line", "visibility", visibility);
      if (m.getLayer("candidate-route-glow")) m.setLayoutProperty("candidate-route-glow", "visibility", visibility);
    }
  };

  const handleFlyTo = (coords: [number, number], zoom: number) => {
    if (!map.current) return;
    map.current.flyTo({
      center: coords,
      zoom,
      speed: 1.4
    });
    setSearchOpen(false);
  };

  const resetExtent = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0
    });
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
    <div
      className={`relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-[#334155] bg-[#0B1220] ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      } ${className}`}
    >
      {/* Map Canvas Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Diagnostics Fallback if WebGL/Tile Fails */}
      {mapError && (
        <div className="absolute inset-0 z-40 bg-[#0B1220]/95 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 rounded-xl bg-[#172033] border border-red-500/30 text-slate-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Geospatial Map Diagnostic</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Top-Left: Navigation HUD & Location Search */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 bg-[#172033]/90 backdrop-blur-md rounded-lg border border-[#334155] shadow-lg text-slate-200">
          <button
            onClick={() => map.current?.zoomIn()}
            className="p-1.5 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => map.current?.zoomOut()}
            className="p-1.5 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetExtent}
            className="p-1.5 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition"
            title="Reset North & AOI Extent"
          >
            <Compass className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#334155]" />
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            title="Quick AOI Locations"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition"
            title="Toggle Fullscreen View"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Location Dropdown */}
        {searchOpen && (
          <div className="p-2 bg-[#172033]/95 backdrop-blur-md rounded-lg border border-[#334155] shadow-xl w-48 flex flex-col gap-1 text-xs text-slate-200 animate-in fade-in duration-150">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Jump to Location
            </div>
            {QUICK_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleFlyTo(loc.coords as [number, number], loc.zoom)}
                className="px-2 py-1.5 text-left rounded hover:bg-[#1E293B] flex items-center justify-between text-slate-300 hover:text-white transition cursor-pointer"
              >
                <span>{loc.name}</span>
                <MapPin className="w-3 h-3 text-[#2563EB]" />
              </button>
            ))}
          </div>
        )}

        {/* Live Coordinate Display */}
        <div className="px-2.5 py-1 bg-[#172033]/90 backdrop-blur-md rounded-md border border-[#334155] text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow">
          <Crosshair className="w-3 h-3 text-[#2563EB]" />
          <span>{mouseCoords.lat}°N, {mouseCoords.lng}°E</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">z{zoomLevel}</span>
        </div>
      </div>

      {/* Top-Center: Basemap Switcher */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 bg-[#172033]/90 backdrop-blur-md rounded-lg border border-[#334155] shadow-lg text-xs font-medium">
          {Object.values(BASEMAPS).map((b) => (
            <button
              key={b.id}
              onClick={() => switchBasemap(b.id)}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                currentBasemap === b.id
                  ? "bg-[#2563EB] text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Top-Right: GIS Layers Control */}
      <div className="absolute top-3 right-3 z-20 pointer-events-auto">
        <div className="bg-[#172033]/95 backdrop-blur-md rounded-lg border border-[#334155] shadow-xl w-60 overflow-hidden text-xs">
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#1E293B]/80 border-b border-[#334155] text-slate-200 font-semibold cursor-pointer hover:bg-[#1E293B] transition"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Map Layers</span>
            </div>
            {layersMenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {layersMenuOpen && (
            <div className="p-2 space-y-1">
              <button
                onClick={() => toggleLayer("flood")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                  activeLayers.flood ? "bg-[#06B6D4]/15 text-[#06B6D4] font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#06B6D4]" />
                  <span>SAR Flood Extent</span>
                </span>
                {activeLayers.flood ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("roads")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                  activeLayers.roads ? "bg-[#10B981]/15 text-[#10B981] font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-[#10B981]" />
                  <span>Road Network (OSM)</span>
                </span>
                {activeLayers.roads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("settlements")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                  activeLayers.settlements ? "bg-red-500/15 text-red-400 font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span>Settlements & Isolation</span>
                </span>
                {activeLayers.settlements ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("infrastructure")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                  activeLayers.infrastructure ? "bg-purple-500/15 text-purple-300 font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Critical Facilities</span>
                </span>
                {activeLayers.infrastructure ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => toggleLayer("bases")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                  activeLayers.bases ? "bg-[#2563EB]/15 text-[#2563EB] font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span>NDRF Staging Bases</span>
                </span>
                {activeLayers.bases ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {candidateRoute && (
                <button
                  onClick={() => toggleLayer("routes")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                    activeLayers.routes ? "bg-blue-500/15 text-blue-300 font-medium" : "text-slate-400 hover:bg-[#1E293B]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-1 border-t-2 border-dashed border-blue-400" />
                    <span>Candidate Route</span>
                  </span>
                  {activeLayers.routes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Inspection Modal / Overlay */}
      {activeFeature && (
        <div className="absolute bottom-12 left-3 z-30 bg-[#172033]/95 backdrop-blur-md p-4 rounded-xl border border-[#334155] shadow-2xl max-w-sm text-xs text-slate-200 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-3 border-b border-[#334155] pb-2 mb-2.5">
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                {activeFeature.type === "settlement" ? "Settlement Target" : activeFeature.type === "road" ? "Road Corridor Segment" : "Critical Infrastructure"}
              </div>
              <h5 className="text-sm font-bold text-white mt-0.5">
                {activeFeature.data.name || activeFeature.data.id || "Monitored Asset"}
              </h5>
            </div>
            <button
              onClick={() => setActiveFeature(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1E293B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeFeature.type === "settlement" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Population</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {Number(activeFeature.data.population || activeFeature.data.estimated_population || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Urgency Score</span>
                  <span className="font-bold text-amber-400 mt-0.5 block">
                    {activeFeature.data.priority_score || "N/A"}/100
                  </span>
                </div>
              </div>

              <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155] text-[11px]">
                <span className="text-slate-400 block text-[10px]">Connectivity Status</span>
                <span className={`font-semibold capitalize mt-0.5 block ${
                  activeFeature.data.connectivity_status === "critical_isolated" ? "text-red-400" :
                  activeFeature.data.connectivity_status === "potentially_isolated" ? "text-amber-400" :
                  "text-emerald-400"
                }`}>
                  {activeFeature.data.connectivity_status?.replace(/_/g, " ") || "Connected"}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-[#334155]/60 flex justify-between">
                <span>Source: OpenStreetMap + S-1 SAR</span>
                <span>Obs: 2022-06-20</span>
              </div>
            </div>
          )}

          {activeFeature.type === "road" && (
            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Classification</span>
                  <span className="font-bold capitalize text-white mt-0.5 block">
                    {activeFeature.data.road_type?.replace(/_/g, " ") || "Primary"}
                  </span>
                </div>
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Exposure Condition</span>
                  <span className={`font-bold mt-0.5 block ${
                    activeFeature.data.flood_intersection ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {activeFeature.data.flood_intersection ? "Submerged / Severed" : "Dry / Passable"}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-[#334155]/60">
                Status: Preliminary geometric intersection. Verification requires ground reconnaissance.
              </div>
            </div>
          )}

          {activeFeature.type === "asset" && (
            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Type</span>
                  <span className="font-bold capitalize text-white mt-0.5 block">
                    {activeFeature.data.asset_type || "Facility"}
                  </span>
                </div>
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Flood Condition</span>
                  <span className={`font-bold mt-0.5 block ${
                    activeFeature.data.flood_intersection ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {activeFeature.data.flood_intersection ? "Exposed / Inundated" : "Operational / Safe"}
                  </span>
                </div>
              </div>
              {activeFeature.data.capacity && (
                <div className="p-2 bg-[#0B1220]/60 rounded border border-[#334155]">
                  <span className="text-slate-400 block text-[10px]">Capacity</span>
                  <span className="font-bold text-white mt-0.5 block">{activeFeature.data.capacity}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Legend Bar */}
      <div className="absolute bottom-2 left-3 right-3 z-20 pointer-events-auto">
        <div className="px-3 py-1.5 bg-[#172033]/90 backdrop-blur-md rounded-lg border border-[#334155] flex items-center justify-between text-[11px] text-slate-300 overflow-x-auto scrollbar-none gap-4">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span className="font-semibold text-slate-400 text-[10px] uppercase font-mono">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#06B6D4]" />
              <span>Inundation (SAR Mask)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Isolated Community</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-[#10B981]" />
              <span>Passable Road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-red-400" />
              <span>Severed Road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <span>NDRF Staging Base</span>
            </div>
          </div>
          <div className="hidden sm:block text-[10px] text-slate-400 font-mono">
            CARTO Voyager Tiles (EPSG:3857)
          </div>
        </div>
      </div>
    </div>
  );
}
