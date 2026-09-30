/**
 * Map Tile Layer Configuration for GSEM / GEMS
 * 
 * CARTO basemaps enforce an API key requirement. Without an API key (?key=YOUR_KEY),
 * CARTO overlays an "API KEY REQUIRED" watermark across every tile.
 * 
 * To ensure zero disruption and clean, watermark-free maps out-of-the-box:
 * 1. If VITE_CARTO_API_KEY is supplied, CARTO Positron/Dark Matter tiles are loaded with ?key=...
 * 2. If no key is provided, high-reliability OpenStreetMap tiles are loaded (100% free, zero watermark).
 */

const CARTO_API_KEY = (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim();

export interface TileLayerConfig {
  url: string;
  attribution: string;
  className?: string;
  maxZoom?: number;
}

/**
 * Returns tile layer configuration for light cartography (e.g. Situation Room).
 */
export function getLightTileConfig(): TileLayerConfig {
  if (CARTO_API_KEY) {
    return {
      url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    };
  }

  // OpenStreetMap standard tiles (completely free, zero API key required, zero watermark)
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  };
}

/**
 * Returns tile layer configuration for dark cartography (e.g. Anomaly detection map).
 */
export function getDarkTileConfig(): TileLayerConfig {
  if (CARTO_API_KEY) {
    return {
      url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    };
  }

  // Standard OpenStreetMap with CSS inverted dark treatment
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles-dark',
    maxZoom: 19,
  };
}
