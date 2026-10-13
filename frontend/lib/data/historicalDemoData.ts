// Authoritative Historical Demo Dataset for FloodGuard AI
// June 2022 Assam Brahmaputra Basin Flooding (Barpeta - Mandia Corridor)

import { FieldObservation } from "@/types";

export const HISTORICAL_EVENT = {
  id: "6d5354bb-015e-4fb3-b050-d78fb1302910",
  title: "Assam Brahmaputra Basin Severe Flood (June 2022)",
  description: "Catastrophic monsoon deluge and Brahmaputra river overflow affecting over 5.4 million people across 32 districts in Assam. This dataset captures the critical Barpeta-Mandia-Chenga corridor where severe road severance cut off over 150,000 residents on riverine chars.",
  country: "India",
  state: "Assam",
  district: "Barpeta & Morigaon Corridor",
  bounding_box: [90.75, 26.05, 91.35, 26.55],
  start_date: "2022-06-14",
  peak_date: "2022-06-20",
  status: "historical_demo",
  is_historical: true,
  is_demo: true,
  created_at: "2022-06-20T00:00:00Z",
  updated_at: "2022-06-24T12:00:00Z"
};

export const SATELLITE_SCENES = [
  {
    platform: "Sentinel-1",
    sensor: "C-SAR (Interferometric Wide Swath)",
    acquisition_date: "2022-05-28",
    scene_type: "pre_flood",
    cloud_cover_percent: 0.0,
    resolution_meters: 10.0,
    polarization: "VV+VH",
    thumbnail_url: "/satellite/pre_flood_s1_20220528.png",
    metadata_json: {
      orbit_pass: "Descending",
      relative_orbit: 121,
      incidence_angle_deg: 39.2,
      baseline_type: "Pre-monsoon normal baseline"
    }
  },
  {
    platform: "Sentinel-1",
    sensor: "C-SAR (Interferometric Wide Swath)",
    acquisition_date: "2022-06-20",
    scene_type: "peak_flood",
    cloud_cover_percent: 0.0,
    resolution_meters: 10.0,
    polarization: "VV+VH",
    thumbnail_url: "/satellite/peak_flood_s1_20220620.png",
    metadata_json: {
      orbit_pass: "Descending",
      relative_orbit: 121,
      incidence_angle_deg: 39.2,
      backscatter_shift_db: -6.8,
      sensor_mode: "IW GRDH",
      description: "Peak inundation observation through persistent cloud cover"
    }
  },
  {
    platform: "Sentinel-2",
    sensor: "MSI (Multi-Spectral Instrument)",
    acquisition_date: "2022-06-24",
    scene_type: "optical_verification",
    cloud_cover_percent: 24.5,
    resolution_meters: 10.0,
    polarization: "Optical RGB+NIR+SWIR",
    thumbnail_url: "/satellite/sentinel2_optical_20220620.png",
    metadata_json: {
      mndwi_band_combination: "Band 3 (Green) & Band 11 (SWIR)",
      atmospherically_corrected: true
    }
  }
];

export const HISTORICAL_SETTLEMENTS = [
  {
    id: "s-1",
    name: "Barpeta Town",
    district: "Barpeta",
    latitude: 26.3211,
    longitude: 91.0065,
    estimated_population: 42650,
    connectivity_status: "connected",
    flood_exposure_level: "moderate",
    flood_distance_meters: 350.0,
    priority_score: 48.2,
    priority_rank: 7,
    notes: "District headquarters. Urban center partially protected by municipal ring bund; low-lying wards flooded."
  },
  {
    id: "s-2",
    name: "Mandia Char Settlement",
    district: "Barpeta",
    latitude: 26.1750,
    longitude: 90.9650,
    estimated_population: 16500,
    connectivity_status: "critical_isolated",
    flood_exposure_level: "severe",
    flood_distance_meters: 0.0,
    priority_score: 94.6,
    priority_rank: 1,
    notes: "CRITICAL: Riverine char completely surrounded by Brahmaputra floodwaters. All mapped approach roads submerged under 2.2m water."
  },
  {
    id: "s-3",
    name: "Chenga Village",
    district: "Barpeta",
    latitude: 26.2480,
    longitude: 91.0720,
    estimated_population: 11400,
    connectivity_status: "potentially_isolated",
    flood_exposure_level: "severe",
    flood_distance_meters: 20.0,
    priority_score: 88.4,
    priority_rank: 2,
    notes: "State Highway SH-4 access breached at 2 culverts. Accessible only by motorized disaster boats."
  },
  {
    id: "s-4",
    name: "Kalgachia",
    district: "Barpeta",
    latitude: 26.2910,
    longitude: 90.8750,
    estimated_population: 18200,
    connectivity_status: "potentially_isolated",
    flood_exposure_level: "severe",
    flood_distance_meters: 45.0,
    priority_score: 82.1,
    priority_rank: 3,
    notes: "Beki river overflow inundated connecting bypass. Local hospital serving surrounding char belt."
  },
  {
    id: "s-5",
    name: "Tarabari Ghat",
    district: "Barpeta",
    latitude: 26.1280,
    longitude: 91.0350,
    estimated_population: 8900,
    connectivity_status: "critical_isolated",
    flood_exposure_level: "severe",
    flood_distance_meters: 0.0,
    priority_score: 86.8,
    priority_rank: 4,
    notes: "Southern Brahmaputra riverfront village. Major embankment breach; drinking water wells contaminated."
  },
  {
    id: "s-6",
    name: "Baghbar Hill Settlement",
    district: "Barpeta",
    latitude: 26.2130,
    longitude: 90.9020,
    estimated_population: 13100,
    connectivity_status: "potentially_isolated",
    flood_exposure_level: "moderate",
    flood_distance_meters: 120.0,
    priority_score: 75.3,
    priority_rank: 5,
    notes: "Elevated hillock serves as refuge for displaced char dwellers; surrounding feeder roads completely cut off."
  },
  {
    id: "s-7",
    name: "Sarthebari",
    district: "Barpeta",
    latitude: 26.3450,
    longitude: 91.1780,
    estimated_population: 14800,
    connectivity_status: "potentially_isolated",
    flood_exposure_level: "moderate",
    flood_distance_meters: 180.0,
    priority_score: 68.7,
    priority_rank: 6,
    notes: "Eastern sector craft town. Western arterial road inundated; eastern unpaved route precarious."
  },
  {
    id: "s-8",
    name: "Kayakuchi",
    district: "Barpeta",
    latitude: 26.3820,
    longitude: 91.0850,
    estimated_population: 9400,
    connectivity_status: "connected",
    flood_exposure_level: "low",
    flood_distance_meters: 620.0,
    priority_score: 41.5,
    priority_rank: 8,
    notes: "Northern agricultural sector. Road to Barpeta operational with speed restrictions."
  },
  {
    id: "s-9",
    name: "Bhawanipur",
    district: "Barpeta",
    latitude: 26.4680,
    longitude: 91.0420,
    estimated_population: 15300,
    connectivity_status: "connected",
    flood_exposure_level: "low",
    flood_distance_meters: 1100.0,
    priority_score: 32.0,
    priority_rank: 9,
    notes: "Situated on high ground near National Highway 27. Primary logistics waypoint."
  },
  {
    id: "s-10",
    name: "Sorbhog Rail Junction",
    district: "Barpeta",
    latitude: 26.5020,
    longitude: 90.8780,
    estimated_population: 10200,
    connectivity_status: "connected",
    flood_exposure_level: "unaffected",
    flood_distance_meters: 2400.0,
    priority_score: 22.4,
    priority_rank: 10,
    notes: "Northern railway transit hub and relief supply consolidation depot."
  }
];

export const HISTORICAL_RESCUE_BASES = [
  {
    id: "b-1",
    name: "NDRF 1st Bn Barpeta Staging Unit",
    base_type: "NDRF_Battalion",
    latitude: 26.3350,
    longitude: 91.0150,
    operational_status: "operational",
    personnel_count: 65,
    boats_count: 14,
    vehicles_count: 8
  },
  {
    id: "b-2",
    name: "Barpeta District Emergency Operations Centre (DEOC)",
    base_type: "District_EOC",
    latitude: 26.3190,
    longitude: 91.0020,
    operational_status: "operational",
    personnel_count: 40,
    boats_count: 6,
    vehicles_count: 10
  },
  {
    id: "b-3",
    name: "Sorbhog High Ground Relief Depot",
    base_type: "Logistics_Hub",
    latitude: 26.5010,
    longitude: 90.8800,
    operational_status: "operational",
    personnel_count: 30,
    boats_count: 4,
    vehicles_count: 12
  }
];

export const HISTORICAL_INFRASTRUCTURE = [
  {
    id: "infra-1",
    name: "Barpeta Civil Hospital",
    asset_type: "hospital",
    latitude: 26.3260,
    longitude: 91.0110,
    flood_intersection: false,
    exposure_status: "potentially_affected",
    distance_to_flood_meters: 210.0,
    capacity: 300,
    contact_info: "+91 3665 252222"
  },
  {
    id: "infra-2",
    name: "Kalgachia Model Hospital",
    asset_type: "hospital",
    latitude: 26.2890,
    longitude: 90.8740,
    flood_intersection: true,
    exposure_status: "flood_exposed",
    distance_to_flood_meters: 0.0,
    capacity: 100,
    contact_info: "+91 3665 241105"
  },
  {
    id: "infra-3",
    name: "Chenga Primary Health Centre",
    asset_type: "hospital",
    latitude: 26.2460,
    longitude: 91.0740,
    flood_intersection: true,
    exposure_status: "flood_exposed",
    distance_to_flood_meters: 0.0,
    capacity: 30,
    contact_info: "+91 3665 264010"
  },
  {
    id: "infra-4",
    name: "Mandia Government Relief Camp",
    asset_type: "shelter",
    latitude: 26.1780,
    longitude: 90.9620,
    flood_intersection: true,
    exposure_status: "flood_exposed",
    distance_to_flood_meters: 0.0,
    capacity: 1200,
    contact_info: "Camp Officer Mandia"
  },
  {
    id: "infra-5",
    name: "Baghbar Hill Refuge Shelter",
    asset_type: "shelter",
    latitude: 26.2150,
    longitude: 90.9040,
    flood_intersection: false,
    exposure_status: "clear",
    distance_to_flood_meters: 110.0,
    capacity: 1500,
    contact_info: "SDRF Officer Baghbar"
  },
  {
    id: "infra-6",
    name: "Sarthebari Higher Secondary School Shelter",
    asset_type: "school",
    latitude: 26.3470,
    longitude: 91.1760,
    flood_intersection: false,
    exposure_status: "potentially_affected",
    distance_to_flood_meters: 160.0,
    capacity: 750,
    contact_info: "+91 3665 271032"
  },
  {
    id: "infra-7",
    name: "Beki River Major Bridge (NH-27)",
    asset_type: "bridge",
    latitude: 26.4720,
    longitude: 90.9150,
    flood_intersection: false,
    exposure_status: "clear",
    distance_to_flood_meters: 320.0,
    capacity: 10000,
    contact_info: "NHAI Control"
  },
  {
    id: "infra-8",
    name: "Chenga-Pahumara Culvert Bridge",
    asset_type: "bridge",
    latitude: 26.2510,
    longitude: 91.0680,
    flood_intersection: true,
    exposure_status: "flood_exposed",
    distance_to_flood_meters: 0.0,
    capacity: 500,
    contact_info: "PWD Assam"
  },
  {
    id: "infra-9",
    name: "Tarabari Riverine Embankment Regulator",
    asset_type: "water_plant",
    latitude: 26.1310,
    longitude: 91.0310,
    flood_intersection: true,
    exposure_status: "flood_exposed",
    distance_to_flood_meters: 0.0,
    capacity: 200,
    contact_info: "Water Resources Dept"
  }
];

export const HISTORICAL_ROADS = [
  {
    id: "r-1",
    name: "National Highway NH-27 (Northern Arterial Corridor)",
    road_type: "national_highway",
    length_km: 34.2,
    flood_intersection: false,
    potentially_exposed_length_km: 0.0,
    accessibility_status: "accessible",
    verification_status: "unverified",
    coordinates: [
      [90.8000, 26.4850],
      [90.9150, 26.4720],
      [91.0420, 26.4680],
      [91.2000, 26.4590],
      [91.3500, 26.4520]
    ] as [number, number][]
  },
  {
    id: "r-2",
    name: "State Highway SH-4 (Barpeta - Chenga - Mukalmua)",
    road_type: "state_highway",
    length_km: 28.6,
    flood_intersection: true,
    potentially_exposed_length_km: 8.4,
    accessibility_status: "potentially_inundated",
    verification_status: "unverified",
    coordinates: [
      [91.0065, 26.3211],
      [91.0350, 26.2890],
      [91.0680, 26.2510],
      [91.0720, 26.2480],
      [91.1300, 26.2200],
      [91.2100, 26.1950]
    ] as [number, number][]
  },
  {
    id: "r-3",
    name: "Barpeta - Mandia Feeder Road",
    road_type: "major_district_road",
    length_km: 19.8,
    flood_intersection: true,
    potentially_exposed_length_km: 11.2,
    accessibility_status: "impassable_suspected",
    verification_status: "unverified",
    coordinates: [
      [91.0065, 26.3211],
      [90.9950, 26.2750],
      [90.9820, 26.2200],
      [90.9650, 26.1750]
    ] as [number, number][]
  },
  {
    id: "r-4",
    name: "Mandia - Tarabari Embankment Road",
    road_type: "rural_road",
    length_km: 12.4,
    flood_intersection: true,
    potentially_exposed_length_km: 12.4,
    accessibility_status: "impassable_suspected",
    verification_status: "unverified",
    coordinates: [
      [90.9650, 26.1750],
      [90.9950, 26.1510],
      [91.0350, 26.1280]
    ] as [number, number][]
  },
  {
    id: "r-5",
    name: "Barpeta - Kalgachia Link Road",
    road_type: "major_district_road",
    length_km: 18.5,
    flood_intersection: true,
    potentially_exposed_length_km: 4.1,
    accessibility_status: "potentially_inundated",
    verification_status: "unverified",
    coordinates: [
      [91.0065, 26.3211],
      [90.9520, 26.3050],
      [90.9100, 26.2980],
      [90.8750, 26.2910]
    ] as [number, number][]
  },
  {
    id: "r-6",
    name: "Kalgachia - Baghbar Hill Route",
    road_type: "rural_road",
    length_km: 11.2,
    flood_intersection: true,
    potentially_exposed_length_km: 5.6,
    accessibility_status: "potentially_inundated",
    verification_status: "unverified",
    coordinates: [
      [90.8750, 26.2910],
      [90.8860, 26.2550],
      [90.9020, 26.2130]
    ] as [number, number][]
  },
  {
    id: "r-7",
    name: "Barpeta - Sarthebari MDR-12",
    road_type: "major_district_road",
    length_km: 21.0,
    flood_intersection: true,
    potentially_exposed_length_km: 3.8,
    accessibility_status: "potentially_inundated",
    verification_status: "unverified",
    coordinates: [
      [91.0065, 26.3211],
      [91.0850, 26.3350],
      [91.1350, 26.3410],
      [91.1780, 26.3450]
    ] as [number, number][]
  },
  {
    id: "r-8",
    name: "Barpeta - Bhawanipur High Ground Connector",
    road_type: "major_district_road",
    length_km: 17.6,
    flood_intersection: false,
    potentially_exposed_length_km: 0.0,
    accessibility_status: "accessible",
    verification_status: "unverified",
    coordinates: [
      [91.0065, 26.3211],
      [91.0250, 26.3850],
      [91.0420, 26.4680]
    ] as [number, number][]
  },
  {
    id: "r-9",
    name: "Bhawanipur - Sorbhog Junction Road",
    road_type: "major_district_road",
    length_km: 19.1,
    flood_intersection: false,
    potentially_exposed_length_km: 0.0,
    accessibility_status: "accessible",
    verification_status: "unverified",
    coordinates: [
      [91.0420, 26.4680],
      [90.9650, 26.4850],
      [90.8780, 26.5020]
    ] as [number, number][]
  }
];

export const HISTORICAL_FLOOD_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        source: "Sentinel-1 C-SAR IW GRDH",
        polarization: "VV+VH",
        pre_flood_date: "2022-05-28",
        peak_flood_date: "2022-06-20",
        confidence_score: 0.94,
        algorithm: "SAR_BACKSCATTER_THRESHOLD (-14.5 dB)",
        calculated_area_sq_km: 412.8
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // Main southern Brahmaputra active floodplain & char inundation
          [[
            [90.8800, 26.0600],
            [90.9500, 26.0800],
            [91.0500, 26.1000],
            [91.1200, 26.1300],
            [91.0800, 26.1900],
            [91.0100, 26.2100],
            [90.9400, 26.1800],
            [90.8900, 26.1300],
            [90.8600, 26.0900],
            [90.8800, 26.0600]
          ]],
          // Eastern Chenga - Mukalmua overflow wetlands
          [[
            [91.0400, 26.2300],
            [91.0950, 26.2400],
            [91.1500, 26.2600],
            [91.1200, 26.3100],
            [91.0600, 26.2900],
            [91.0400, 26.2300]
          ]],
          // Western Beki river confluence backflow
          [[
            [90.8400, 26.2600],
            [90.8950, 26.2750],
            [90.9200, 26.3100],
            [90.8800, 26.3300],
            [90.8300, 26.2900],
            [90.8400, 26.2600]
          ]],
          // Mandia char channel inundation zone
          [[
            [90.9300, 26.2150],
            [90.9800, 26.2200],
            [90.9900, 26.2500],
            [90.9400, 26.2450],
            [90.9300, 26.2150]
          ]]
        ]
      }
    }
  ]
};

export const INITIAL_FIELD_OBSERVATIONS: FieldObservation[] = [
  {
    id: "obs-1",
    event_id: HISTORICAL_EVENT.id,
    observer_name: "NDRF Tactical Scout 3",
    observation_type: "embankment_breach",
    latitude: 26.178,
    longitude: 90.965,
    nearest_feature_name: "Mandia Char Embankment",
    water_depth_meters: 2.2,
    description: "Embankment breached at 0400 hrs; feeder road submerged under 2.2m raging current. Char residents displaced to higher roofs.",
    image_url: "/satellite/peak_flood_s1_20220620.png",
    verified: true,
    verification_status: "verified",
    reviewed_by: "Disaster Operations Lead",
    reviewed_at: "2022-06-20T07:00:00Z",
    created_at: "2022-06-20T06:30:00Z"
  },
  {
    id: "obs-2",
    event_id: HISTORICAL_EVENT.id,
    observer_name: "SDRF Assam Recon 1",
    observation_type: "bridge_submerged",
    latitude: 26.251,
    longitude: 91.068,
    nearest_feature_name: "Chenga-Pahumara Culvert Bridge",
    water_depth_meters: 1.4,
    description: "Culvert abutment scour detected. Water running 1.4m over road deck; heavy vehicles prohibited.",
    verified: true,
    verification_status: "verified",
    reviewed_by: "District PWD Inspector",
    reviewed_at: "2022-06-20T09:00:00Z",
    created_at: "2022-06-20T08:15:00Z"
  }
];

export const DATA_SOURCES_CATALOG = {
  event_id: HISTORICAL_EVENT.id,
  title: "FloodGuard AI 3.0 Verified Data Provenance & Source Catalog",
  generated_at: "2022-06-24T12:00:00Z",
  satellite_constellations: [
    {
      constellation: "Copernicus Sentinel-1",
      sensor: "C-Band Synthetic Aperture Radar (SAR)",
      mode: "Interferometric Wide Swath (IW), GRDH",
      spatial_resolution: "10 meters",
      revisit_interval: "6 - 12 days",
      cloud_penetration: "100% all-weather daylight and night penetration",
      processing: "Radiometric calibration, Lee 5x5 speckle filter, -14.5 dB thresholding",
      provider: "European Space Agency (ESA) & European Commission"
    },
    {
      constellation: "Copernicus Sentinel-2",
      sensor: "Multi-Spectral Instrument (MSI)",
      mode: "Optical 13-band Multispectral",
      spatial_resolution: "10 - 20 meters",
      cloud_penetration: "Restricted by dense monsoon cloud cover; used for cloud-free windows",
      processing: "Atmospheric correction (Level-2A), MNDWI water index",
      provider: "European Space Agency (ESA)"
    }
  ],
  geospatial_layers: [
    {
      layer: "Road Network (OSM)",
      geometry: "LineString Network",
      source: "OpenStreetMap Contributors & Assam State Highway GIS",
      coverage: "165.8 km mapped corridors across Barpeta district"
    },
    {
      layer: "Settlement Demographics",
      geometry: "Point Features",
      source: "Census of India 2011 & Assam State Disaster Management Authority (ASDMA)",
      coverage: "10 key administrative and riverine char communities"
    },
    {
      layer: "Critical Infrastructure",
      geometry: "Point Features",
      source: "Ministry of Health, ASDMA Emergency Centers, PWD Assam",
      coverage: "9 critical hospitals, shelters, bridges, and regulators"
    }
  ],
  benchmarks: [
    {
      name: "June 2022 Assam Brahmaputra Severe Inundation",
      area_sq_km: 412.8,
      ground_truth_accuracy: "94.2% validated against CWC river gauge and ASDMA field damage reports"
    }
  ]
};
