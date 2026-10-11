export interface BasemapConfig {
  id: string;
  name: string;
  attribution: string;
  style: any;
}

const CARTO_KEY = "cb1_4dyn_1_dcd21ae5edce6d4870f307e2";

export const BASEMAPS: Record<string, BasemapConfig> = {
  voyager: {
    id: "voyager",
    name: "CARTO Voyager",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    style: {
      version: 8,
      sources: {
        "carto-voyager": {
          type: "raster",
          tiles: [
            `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: "carto-voyager-layer",
          type: "raster",
          source: "carto-voyager",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  dark: {
    id: "dark",
    name: "CARTO Dark Matter",
    attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    style: {
      version: 8,
      sources: {
        "carto-dark": {
          type: "raster",
          tiles: [
            `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: "carto-dark-layer",
          type: "raster",
          source: "carto-dark",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  positron: {
    id: "positron",
    name: "CARTO Positron",
    attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    style: {
      version: 8,
      sources: {
        "carto-positron": {
          type: "raster",
          tiles: [
            `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: "carto-positron-layer",
          type: "raster",
          source: "carto-positron",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  satellite: {
    id: "satellite",
    name: "High-Res Satellite",
    attribution: 'Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    style: {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri'
        }
      },
      layers: [
        {
          id: "esri-sat-layer",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  }
};

export const DEFAULT_BASEMAP_ID = "voyager";
