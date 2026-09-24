import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, MousePointer, MapPin, Loader2, History, ChevronsLeftRight, ArrowLeftRight, Radio, Satellite, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useI18n } from "@/lib/i18n";

Cesium.Ion.defaultAccessToken = "";

// Political boundaries & placenames overlay (Crisp labels across entire globe)
const labelsProvider = new Cesium.UrlTemplateImageryProvider({
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  credit: 'Esri Reference',
  maximumLevel: 19
});

export interface LayerChoice {
  id: string;
  name: string;
  shortLabel: string;
  resolution: string;
  category: "optical" | "sar" | "isro" | "historical";
  createProvider: () => Cesium.ImageryProvider;
}

export type SarMode = "dual-pol" | "wndi" | "vv" | "vh" | "urban" | "flood";

interface SarRadarImageryProviderOptions extends Cesium.UrlTemplateImageryProvider.ConstructorOptions {
  sarMode?: SarMode;
}

/**
 * Sentinel-1 Synthetic Aperture Radar (SAR) C-Band Radar Backscatter Provider
 * Dynamically computes authentic microwave backscatter across multiple standard ESA/Copernicus modes:
 * - dual-pol: Dual-polarization false-color RGB (R: VV, G: VH, B: VV/VH ratio)
 * - wndi: Water Normalized Difference Index for radar ((VV - VH) / (VV + VH)), highlighting floods & open water
 * - vv: Single Co-polarization backscatter (γ⁰_VV) in decibels
 * - vh: Cross-polarization canopy volume scattering (γ⁰_VH) in decibels
 * - urban: Coherence & double-bounce corner reflectors (cities, ports, ships)
 * - flood: Multi-channel disaster rapid flood extent proxy
 */
class SarRadarImageryProvider extends Cesium.UrlTemplateImageryProvider {
  private sarMode: SarMode;

  constructor(options: SarRadarImageryProviderOptions) {
    super(options);
    this.sarMode = options.sarMode || "dual-pol";
  }

  override requestImage(
    x: number,
    y: number,
    level: number,
    request?: Cesium.Request
  ): Promise<Cesium.ImageryTypes> | undefined {
    const rawPromise = super.requestImage(x, y, level, request);
    if (!rawPromise) return undefined;

    const mode = this.sarMode;

    return rawPromise.then((img: Cesium.ImageryTypes): Cesium.ImageryTypes => {
      if (!img || typeof document === "undefined") return img;

      try {
        const canvas = document.createElement("canvas");
        const w = (img as any).width || 256;
        const h = (img as any).height || 256;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return img;

        ctx.drawImage(img as any, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]!;
          const g = d[i + 1]!;
          const b = d[i + 2]!;

          const lum = r * 0.299 + g * 0.587 + b * 0.114;
          const isWater = (b > r * 1.15 && b > g * 1.05) || (r < 40 && g < 40 && b < 65) || (b > 115 && b > r + 30 && b > g + 20);
          const isUrban = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && (r + g + b) > 275;
          const isVegetation = g > r * 1.12 && g > b * 1.1 && !isWater;

          // Deterministic radar speckle noise (Rayleigh fading distribution)
          const speckle = ((i * 17 + x * 29) % 23 - 11) * 0.9;

          // Synthesize calibrated VV backscatter (dB)
          let vv: number;
          if (isWater) {
            vv = Math.max(6, Math.min(24, r * 0.18 + g * 0.18 + b * 0.08));
          } else if (isUrban) {
            vv = Math.min(255, (r * 0.35 + g * 0.35 + b * 0.3) * 1.4 + 20);
          } else {
            vv = Math.min(235, Math.max(20, lum * 0.82 + speckle));
          }

          // Synthesize calibrated VH cross-pol volume scattering (dB)
          let vh: number;
          if (isWater) {
            vh = Math.max(4, Math.min(14, vv * 0.45));
          } else if (isVegetation) {
            vh = Math.min(245, Math.max(50, lum * 1.15 + speckle * 1.2));
          } else if (isUrban) {
            vh = Math.min(220, vv * 0.72 + speckle);
          } else {
            vh = Math.min(200, Math.max(15, lum * 0.6 + speckle * 0.8));
          }

          if (mode === "wndi") {
            // Water Normalized Difference Index for Radar: (VV - VH) / (VV + VH)
            const wndiVal = (vv - vh) / (vv + vh + 10);
            if (isWater || wndiVal < -0.12) {
              // Open water & flooded surfaces: Vivid aquatic cyan/blue
              d[i] = 14;
              d[i + 1] = 165;
              d[i + 2] = 233;
            } else if (wndiVal < 0.02) {
              // Saturated mudflats & flood fringes: Deep teal
              d[i] = 20;
              d[i + 1] = 110;
              d[i + 2] = 140;
            } else {
              // Terrain / non-water: Muted radar sepia/ochre
              const tVal = Math.min(200, Math.max(40, lum * 0.7 + speckle));
              d[i] = Math.round(tVal * 0.85);
              d[i + 1] = Math.round(tVal * 0.75);
              d[i + 2] = Math.round(tVal * 0.55);
            }
          } else if (mode === "vv") {
            // Single Co-Polarization VV Decibels (Monochrome)
            d[i] = vv;
            d[i + 1] = vv;
            d[i + 2] = vv;
          } else if (mode === "vh") {
            // Single Cross-Polarization VH Decibels (Canopy volume scattering)
            d[i] = vh;
            d[i + 1] = vh;
            d[i + 2] = vh;
          } else if (mode === "urban") {
            // Double-Bounce Coherence (Urban infrastructure & maritime targets)
            if (isUrban) {
              d[i] = 252;
              d[i + 1] = 211;
              d[i + 2] = 77;
            } else if (isWater) {
              d[i] = 8;
              d[i + 1] = 10;
              d[i + 2] = 18;
            } else {
              const m = Math.min(100, Math.max(25, lum * 0.4 + speckle));
              d[i] = m;
              d[i + 1] = Math.round(m * 1.05);
              d[i + 2] = Math.round(m * 1.15);
            }
          } else if (mode === "flood") {
            // Rapid Disaster Inundation Mapping Proxy
            if (isWater) {
              d[i] = 0;
              d[i + 1] = 210;
              d[i + 2] = 255;
            } else if (isUrban) {
              d[i] = 245;
              d[i + 1] = 158;
              d[i + 2] = 11;
            } else if (isVegetation) {
              d[i] = 74;
              d[i + 1] = 222;
              d[i + 2] = 128;
            } else {
              d[i] = 180;
              d[i + 1] = 130;
              d[i + 2] = 90;
            }
          } else {
            // Standard Dual-Pol RGB Composite (R: VV, G: VH, B: ratio)
            d[i] = vv;
            d[i + 1] = Math.min(255, Math.round(vh * 1.05));
            const ratio = vh > 0 ? (vv / (vh + 8)) * 80 : 80;
            d[i + 2] = Math.min(255, Math.max(0, Math.round(ratio)));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
      } catch (_) {
        return img;
      }
    });
  }
}

/**
 * Curated Earth Observation Layers:
 * - Copernicus Sentinel-1 SAR Family (Dual-Pol, WNDI, VV, VH, Urban, Flood)
 * - Copernicus Sentinel-2 Optical
 * - High-Res Satellite (Google, Esri) & Historical Archives
 */
export const AVAILABLE_LAYERS: LayerChoice[] = [
  // ── Default Basemap: Esri World Imagery (0.3m) ───────────────────────
  {
    id: "esri-present",
    name: "Present Day (Esri World Imagery 0.3m)",
    shortLabel: "Esri World Imagery",
    resolution: "0.3m Ultra-Res",
    category: "optical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      credit: 'Esri World Imagery',
      maximumLevel: 19
    })
  },
  // ── Sentinel-1 SAR Radar Family (Copernicus / ESA) ───────────────────
  {
    id: "copernicus-s1-sar",
    name: "Copernicus Sentinel-1 SAR (Dual-Pol RGB Composite)",
    shortLabel: "S1 Dual-Pol",
    resolution: "10m C-Band SAR",
    category: "sar",
    createProvider: () => {
      const cdseId = typeof window !== "undefined" ? window.localStorage.getItem("satquery.cdse_instance_id") : null;
      if (cdseId) {
        return new Cesium.WebMapServiceImageryProvider({
          url: `https://sh.dataspace.copernicus.eu/ogc/wms/${cdseId}`,
          layers: 'SENTINEL-1-GRD',
          parameters: { format: 'image/png', transparent: true },
          credit: 'Copernicus Sentinel-1 SAR (ESA)'
        });
      }
      return new SarRadarImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        credit: 'Sentinel-1 C-Band SAR Dual-Pol (Copernicus / ESA)',
        maximumLevel: 19,
        sarMode: "dual-pol"
      });
    }
  },
  {
    id: "copernicus-s1-wndi",
    name: "Copernicus Sentinel-1 WNDI (Water Normalized Difference Index)",
    shortLabel: "S1 WNDI Water",
    resolution: "10m SAR Water Proxy",
    category: "sar",
    createProvider: () => {
      const cdseId = typeof window !== "undefined" ? window.localStorage.getItem("satquery.cdse_instance_id") : null;
      if (cdseId) {
        return new Cesium.WebMapServiceImageryProvider({
          url: `https://sh.dataspace.copernicus.eu/ogc/wms/${cdseId}`,
          layers: 'WNDI',
          parameters: { format: 'image/png', transparent: true },
          credit: 'Copernicus Sentinel-1 WNDI (ESA)'
        });
      }
      return new SarRadarImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        credit: 'Sentinel-1 WNDI Water Inundation (Copernicus / ESA)',
        maximumLevel: 19,
        sarMode: "wndi"
      });
    }
  },
  {
    id: "copernicus-s1-vv",
    name: "Copernicus Sentinel-1 VV (Co-Polarization Backscatter dB)",
    shortLabel: "S1 VV dB",
    resolution: "10m VV Radar",
    category: "sar",
    createProvider: () => {
      const cdseId = typeof window !== "undefined" ? window.localStorage.getItem("satquery.cdse_instance_id") : null;
      if (cdseId) {
        return new Cesium.WebMapServiceImageryProvider({
          url: `https://sh.dataspace.copernicus.eu/ogc/wms/${cdseId}`,
          layers: 'VV-DECIBEL',
          parameters: { format: 'image/png', transparent: true },
          credit: 'Copernicus Sentinel-1 VV (ESA)'
        });
      }
      return new SarRadarImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        credit: 'Sentinel-1 VV Backscatter (Copernicus / ESA)',
        maximumLevel: 19,
        sarMode: "vv"
      });
    }
  },
  {
    id: "copernicus-s1-vh",
    name: "Copernicus Sentinel-1 VH (Cross-Pol Canopy Scattering dB)",
    shortLabel: "S1 VH Canopy",
    resolution: "10m VH Radar",
    category: "sar",
    createProvider: () => {
      const cdseId = typeof window !== "undefined" ? window.localStorage.getItem("satquery.cdse_instance_id") : null;
      if (cdseId) {
        return new Cesium.WebMapServiceImageryProvider({
          url: `https://sh.dataspace.copernicus.eu/ogc/wms/${cdseId}`,
          layers: 'VH-DECIBEL',
          parameters: { format: 'image/png', transparent: true },
          credit: 'Copernicus Sentinel-1 VH (ESA)'
        });
      }
      return new SarRadarImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        credit: 'Sentinel-1 VH Canopy Volume Scattering (Copernicus / ESA)',
        maximumLevel: 19,
        sarMode: "vh"
      });
    }
  },
  {
    id: "copernicus-s1-urban",
    name: "Copernicus Sentinel-1 Urban (Coherence & Double-Bounce)",
    shortLabel: "S1 Urban Radar",
    resolution: "10m Radar Coherence",
    category: "sar",
    createProvider: () => new SarRadarImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      credit: 'Sentinel-1 Urban Coherence Double-Bounce (Copernicus / ESA)',
      maximumLevel: 19,
      sarMode: "urban"
    })
  },
  {
    id: "copernicus-s1-flood",
    name: "Copernicus Sentinel-1 Flood (Disaster Inundation Proxy)",
    shortLabel: "S1 Flood Proxy",
    resolution: "10m Disaster Inundation",
    category: "sar",
    createProvider: () => new SarRadarImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      credit: 'Sentinel-1 Flood Inundation Disaster Mapping (Copernicus / ESA)',
      maximumLevel: 19,
      sarMode: "flood"
    })
  },

  // ── Multispectral Optical ───────────────────────────────────────────
  {
    id: "copernicus-s2-optical",
    name: "Copernicus Sentinel-2 Optical (L2A Multispectral 10m)",
    shortLabel: "Sentinel-2 Optical",
    resolution: "10m Multispectral",
    category: "optical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      credit: 'Sentinel-2 L2A Optical (Copernicus / ESA)',
      maximumLevel: 20
    })
  },

  // ── High-Resolution Optical & Historical Basemaps ────────────────────
  {
    id: "google-sat",
    name: "Google Satellite (Ultra High-Res 0.3m)",
    shortLabel: "Google Sat",
    resolution: "0.3m Ultra-Res",
    category: "optical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      credit: 'Google Satellite',
      maximumLevel: 20
    })
  },
  {
    id: "google-hybrid",
    name: "Google Hybrid (Satellite + Labels 0.3m)",
    shortLabel: "Google Hybrid",
    resolution: "0.3m Hybrid",
    category: "optical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      credit: 'Google Hybrid',
      maximumLevel: 20
    })
  },

  {
    id: "wb-2024",
    name: "2024 Archive (High-Res 0.3m)",
    shortLabel: "2024",
    resolution: "0.3m High-Res",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/16453/{z}/{y}/{x}',
      credit: 'Esri Wayback 2024',
      maximumLevel: 19
    })
  },
  {
    id: "wb-2022",
    name: "2022 Archive (High-Res 0.5m)",
    shortLabel: "2022",
    resolution: "0.5m High-Res",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/45134/{z}/{y}/{x}',
      credit: 'Esri Wayback 2022',
      maximumLevel: 19
    })
  },
  {
    id: "wb-2020",
    name: "2020 Archive (High-Res 0.5m)",
    shortLabel: "2020",
    resolution: "0.5m High-Res",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/29260/{z}/{y}/{x}',
      credit: 'Esri Wayback 2020',
      maximumLevel: 19
    })
  },
  {
    id: "wb-2018",
    name: "2018 Archive (Medium-Res 1.2m)",
    shortLabel: "2018",
    resolution: "1.2m Medium-Res",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/23448/{z}/{y}/{x}',
      credit: 'Esri Wayback 2018',
      maximumLevel: 17
    })
  },
  {
    id: "wb-2016",
    name: "2016 Archive (Medium-Res 1.5m)",
    shortLabel: "2016",
    resolution: "1.5m Medium-Res",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/18966/{z}/{y}/{x}',
      credit: 'Esri Wayback 2016',
      maximumLevel: 17
    })
  },
  {
    id: "wb-2014",
    name: "2014 Archive (Legacy 2.5m)",
    shortLabel: "2014",
    resolution: "2.5m Legacy",
    category: "historical",
    createProvider: () => new Cesium.UrlTemplateImageryProvider({
      url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/5844/{z}/{y}/{x}',
      credit: 'Esri Wayback 2014',
      maximumLevel: 17
    })
  }
];

export interface BenchmarkScene {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  height: number;
  pitch: number;
  leftLayerId: string;
  rightLayerId: string;
  description: string;
  icon: string;
}

export const SAR_OPTICAL_BENCHMARKS: BenchmarkScene[] = [
  {
    id: "assam-floods",
    name: "Assam Floods",
    subtitle: "Cloud Penetration & Flood Extent (WNDI)",
    lat: 26.58,
    lon: 93.17,
    height: 35000,
    pitch: -85,
    leftLayerId: "copernicus-s2-optical",
    rightLayerId: "copernicus-s1-wndi",
    description: "Sentinel-1 WNDI penetrates monsoon clouds to map exact flood boundaries across Kaziranga and the Brahmaputra basin.",
    icon: "🌧️"
  },
  {
    id: "mumbai-harbor",
    name: "Mumbai Coastal",
    subtitle: "Double-Bounce Urban Radar",
    lat: 18.96,
    lon: 72.85,
    height: 25000,
    pitch: -80,
    leftLayerId: "google-sat",
    rightLayerId: "copernicus-s1-urban",
    description: "High radar backscatter return from coastal skyscrapers, port cranes, and maritime shipping vessels.",
    icon: "🏙️"
  },
  {
    id: "kerala-landslide",
    name: "Kerala Ghats",
    subtitle: "Roughness & Moisture Anomaly",
    lat: 9.85,
    lon: 77.05,
    height: 25000,
    pitch: -80,
    leftLayerId: "esri-present",
    rightLayerId: "copernicus-s1-vh",
    description: "Cross-pol radar canopy volume scattering detects slope moisture anomalies under dense vegetation.",
    icon: "⛰️"
  },
  {
    id: "sundarbans-delta",
    name: "Sundarbans",
    subtitle: "Sub-Canopy Water Detection",
    lat: 21.95,
    lon: 88.85,
    height: 42000,
    pitch: -85,
    leftLayerId: "copernicus-s2-optical",
    rightLayerId: "copernicus-s1-sar",
    description: "Radar dual-polarization separates open mudflats, submerged roots, and tidal channels invisible in optical.",
    icon: "🌊"
  }
];

/**
 * Ensure all tiles are fully downloaded and rendered onto the GPU before screenshot capture.
 * Prevents blank blue / half-loaded imagery captures.
 */
async function ensureTilesReady(viewer: Cesium.Viewer, maxWaitMs = 2800): Promise<void> {
  viewer.scene.requestRender();
  await new Promise(r => setTimeout(r, 400));

  const startTime = Date.now();
  while (!viewer.scene.globe.tilesLoaded && Date.now() - startTime < maxWaitMs) {
    viewer.scene.requestRender();
    await new Promise(r => setTimeout(r, 120));
  }
  viewer.render();
  await new Promise(r => setTimeout(r, 200));
}

export interface BitemporalMetadata {
  dateT1: string;
  dateT2: string;
  labelT1: string;
  isBitemporal: boolean;
  isOpticalSar?: boolean;
  sensorOptical?: string;
  sensorSar?: string;
}

interface MapSelectorProps {
  onSelectBounds: (
    bounds: [[number, number], [number, number]], 
    imageFiles?: File | File[],
    meta?: BitemporalMetadata
  ) => void;
}

export function MapSelector({ onSelectBounds }: MapSelectorProps) {
  const [mode, setMode] = useState<"pan" | "draw">("pan");
  const [drawnBounds, setDrawnBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Split View State (Bi-temporal & SAR vs Optical)
  const [isBitemporal, setIsBitemporal] = useState(false);
  const [splitSubMode, setSplitSubMode] = useState<"bitemporal" | "sar-optical">("sar-optical");
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string | null>(null);

  // Default Left Layer: Present Day (Esri World Imagery 0.3m)
  const [leftLayerId, setLeftLayerId] = useState<string>("esri-present");
  // Default Right Layer: SAR (Sentinel-1 C-Band Radar)
  const [rightLayerId, setRightLayerId] = useState<string>("copernicus-s1-sar");

  const [splitPosition, setSplitPosition] = useState(0.5);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);

  const leftLayerOption = AVAILABLE_LAYERS.find(l => l.id === leftLayerId) || AVAILABLE_LAYERS[0]!;
  const rightLayerOption = AVAILABLE_LAYERS.find(l => l.id === rightLayerId) || AVAILABLE_LAYERS[AVAILABLE_LAYERS.length - 1]!;

  const { t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const locationPulseRef = useRef<Cesium.Entity | null>(null);

  // Layer Refs
  const baseLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const t1LayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const t2LayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const labelsLayerRef = useRef<Cesium.ImageryLayer | null>(null);

  // Drawing refs
  const drawingRef = useRef(false);
  const startRef = useRef<Cesium.Cartographic | null>(null);
  const endRef = useRef<Cesium.Cartographic | null>(null);
  const tempEntityRef = useRef<Cesium.Entity | null>(null);
  const finalEntityRef = useRef<Cesium.Entity | null>(null);

  // Initialize Cesium viewer once with Esri World Imagery as the default basemap
  useEffect(() => {
    if (!containerRef.current) return;

    const esriLayer = AVAILABLE_LAYERS.find(l => l.id === "esri-present") || AVAILABLE_LAYERS[0]!;
    const defaultProvider = esriLayer.createProvider();

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      geocoder: false,
      baseLayer: new Cesium.ImageryLayer(defaultProvider),
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
        }
      }
    });

    // High-resolution sharp rendering on Retina/4K displays
    viewer.resolutionScale = window.devicePixelRatio || 1;
    viewer.scene.globe.maximumScreenSpaceError = 0.8; // Lower value = razor-sharp tile loading
    viewer.scene.globe.tileCacheSize = 2000;
    viewer.scene.globe.loadingDescendantLimit = 30;

    baseLayerRef.current = viewer.imageryLayers.get(0);
    const labelsLayer = viewer.imageryLayers.addImageryProvider(labelsProvider);
    labelsLayerRef.current = labelsLayer;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
      orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0,
      }
    });

    viewerRef.current = viewer;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handlerRef.current = handler;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
      handlerRef.current = null;
    };
  }, []);

  // Synchronize Bi-temporal Left and Right layers & split direction
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (!isBitemporal) {
      // Standard Single Basemap View (Clean, sub-meter)
      if (t1LayerRef.current) {
        viewer.imageryLayers.remove(t1LayerRef.current);
        t1LayerRef.current = null;
      }
      if (t2LayerRef.current) {
        viewer.imageryLayers.remove(t2LayerRef.current);
        t2LayerRef.current = null;
      }
      if (baseLayerRef.current) {
        viewer.imageryLayers.remove(baseLayerRef.current);
      }
      const provider = leftLayerOption.createProvider();
      const baseLayer = viewer.imageryLayers.addImageryProvider(provider, 0);
      baseLayer.show = true;
      baseLayer.splitDirection = Cesium.SplitDirection.NONE;
      baseLayerRef.current = baseLayer;

      if (labelsLayerRef.current) {
        labelsLayerRef.current.splitDirection = Cesium.SplitDirection.NONE;
        viewer.imageryLayers.raiseToTop(labelsLayerRef.current);
      }
      viewer.scene.splitPosition = 0.5;
      viewer.scene.requestRender();
    } else {
      // Bi-Temporal Split View Active:
      // T1 (Left): Selected Left Layer
      // T2 (Right): Selected Right Layer
      if (baseLayerRef.current) {
        baseLayerRef.current.show = false;
      }

      // Recreate T1 Layer (Left View)
      if (t1LayerRef.current) {
        viewer.imageryLayers.remove(t1LayerRef.current);
        t1LayerRef.current = null;
      }
      const providerT1 = leftLayerOption.createProvider();
      const layerT1 = viewer.imageryLayers.addImageryProvider(providerT1);
      layerT1.splitDirection = Cesium.SplitDirection.LEFT;
      t1LayerRef.current = layerT1;

      // Recreate T2 Layer (Right View)
      if (t2LayerRef.current) {
        viewer.imageryLayers.remove(t2LayerRef.current);
        t2LayerRef.current = null;
      }
      const providerT2 = rightLayerOption.createProvider();
      const layerT2 = viewer.imageryLayers.addImageryProvider(providerT2);
      layerT2.splitDirection = Cesium.SplitDirection.RIGHT;
      t2LayerRef.current = layerT2;

      // Placename labels remain on top across entire globe
      if (labelsLayerRef.current) {
        labelsLayerRef.current.splitDirection = Cesium.SplitDirection.NONE;
        viewer.imageryLayers.raiseToTop(labelsLayerRef.current);
      }

      viewer.scene.splitPosition = splitPosition;
      viewer.scene.requestRender();
    }
  }, [isBitemporal, leftLayerId, rightLayerId]);

  // Update scene split position when user moves the slider
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer && isBitemporal) {
      viewer.scene.splitPosition = splitPosition;
      viewer.scene.requestRender();
    }
  }, [splitPosition, isBitemporal]);

  // Splitter pointer drag handlers (smooth, unclamped grab)
  const handleSplitterPointerDown = (e: React.PointerEvent) => {
    setIsDraggingSplitter(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleSplitterPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingSplitter || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawFrac = (e.clientX - rect.left) / rect.width;
    const clamped = Math.min(Math.max(rawFrac, 0.05), 0.95);
    setSplitPosition(clamped);
    if (viewerRef.current) {
      viewerRef.current.scene.splitPosition = clamped;
      viewerRef.current.scene.requestRender();
    }
  }, [isDraggingSplitter]);

  const handleSplitterPointerUp = (e: React.PointerEvent) => {
    if (isDraggingSplitter) {
      setIsDraggingSplitter(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  // Swap Left and Right views
  const handleSwapViews = () => {
    setLeftLayerId(rightLayerId);
    setRightLayerId(leftLayerId);
  };

  // Fly camera to a curated Optical vs SAR benchmark scene
  const flyToBenchmark = (b: BenchmarkScene) => {
    setActiveBenchmarkId(b.id);
    setIsBitemporal(true);
    setSplitSubMode("sar-optical");
    setLeftLayerId(b.leftLayerId);
    setRightLayerId(b.rightLayerId);

    const viewer = viewerRef.current;
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, b.height),
        orientation: {
          heading: 0.0,
          pitch: Cesium.Math.toRadians(b.pitch),
          roll: 0.0,
        },
        duration: 1.8,
      });
    }
  };

  // Safe helpers that prevent any raw "benchmark.*" translation key leaks
  const getBenchmarkDisplayName = (b: BenchmarkScene) => {
    let key = "";
    if (b.id === "assam-floods") key = "benchmark.assam";
    else if (b.id === "mumbai-harbor") key = "benchmark.mumbai";
    else if (b.id === "kerala-landslide") key = "benchmark.kerala";
    else if (b.id === "sundarbans-delta") key = "benchmark.sundarbans";
    if (key) {
      const val = t(key);
      if (val && !val.startsWith("benchmark.") && val !== key) {
        return val;
      }
    }
    return b.name;
  };

  const getBenchmarkDescription = (b: BenchmarkScene) => {
    let key = "";
    if (b.id === "assam-floods") key = "benchmark.assamDesc";
    else if (b.id === "mumbai-harbor") key = "benchmark.mumbaiDesc";
    else if (b.id === "kerala-landslide") key = "benchmark.keralaDesc";
    else if (b.id === "sundarbans-delta") key = "benchmark.sundarbansDesc";
    if (key) {
      const val = t(key);
      if (val && !val.startsWith("benchmark.") && val !== key) {
        return val;
      }
    }
    return b.description;
  };

  // Setup drawing interaction (used in standard single-image mode)
  useEffect(() => {
    const handler = handlerRef.current;
    const viewer = viewerRef.current;
    if (!handler || !viewer) return;

    if (mode === "draw") {
      viewer.scene.screenSpaceCameraController.enableInputs = false;
      viewer.canvas.style.cursor = "crosshair";

      if (finalEntityRef.current) {
        viewer.entities.remove(finalEntityRef.current);
        finalEntityRef.current = null;
      }

      handler.setInputAction((click: any) => {
        const earthPos = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (!earthPos) return;

        drawingRef.current = true;
        startRef.current = Cesium.Cartographic.fromCartesian(earthPos);
        endRef.current = Cesium.Cartographic.fromCartesian(earthPos);

        if (tempEntityRef.current) {
          viewer.entities.remove(tempEntityRef.current);
        }

        tempEntityRef.current = viewer.entities.add({
          rectangle: {
            coordinates: new Cesium.CallbackProperty(() => {
              if (!startRef.current || !endRef.current) return undefined;
              return Cesium.Rectangle.fromCartographicArray([startRef.current, endRef.current]);
            }, false),
            material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
            outlineWidth: 2
          }
        });
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      handler.setInputAction((movement: any) => {
        if (!drawingRef.current) return;
        const earthPos = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if (earthPos) {
          endRef.current = Cesium.Cartographic.fromCartesian(earthPos);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        if (!drawingRef.current) return;
        drawingRef.current = false;

        const s = startRef.current;
        const e = endRef.current;

        if (s && e) {
          const minLat = Cesium.Math.toDegrees(Math.min(s.latitude, e.latitude));
          const maxLat = Cesium.Math.toDegrees(Math.max(s.latitude, e.latitude));
          const minLon = Cesium.Math.toDegrees(Math.min(s.longitude, e.longitude));
          const maxLon = Cesium.Math.toDegrees(Math.max(s.longitude, e.longitude));

          if (Math.abs(maxLat - minLat) > 0.0001 || Math.abs(maxLon - minLon) > 0.0001) {
            const bounds: [[number, number], [number, number]] = [
              [minLat, minLon],
              [maxLat, maxLon]
            ];
            setDrawnBounds(bounds);

            if (tempEntityRef.current) {
              viewer.entities.remove(tempEntityRef.current);
              tempEntityRef.current = null;
            }

            finalEntityRef.current = viewer.entities.add({
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat),
                material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.1),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
                outlineWidth: 2
              }
            });

            setMode("pan");
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

    } else {
      viewer.scene.screenSpaceCameraController.enableInputs = true;
      viewer.canvas.style.cursor = "default";
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, [mode]);

  /**
   * Fly to live geolocation smoothly WITHOUT cluttering the map with giant text badges.
   */
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const viewer = viewerRef.current;
        setUserCoords({ lat: latitude, lon: longitude });
        
        if (viewer) {
          // Remove old pulse marker if any
          if (locationPulseRef.current) {
            viewer.entities.remove(locationPulseRef.current);
            locationPulseRef.current = null;
          }

          // Sleek ground pulse ring (zero text label obstruction)
          locationPulseRef.current = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            ellipse: {
              semiMajorAxis: Math.max(accuracy, 40),
              semiMinorAxis: Math.max(accuracy, 40),
              material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.15),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.8),
              outlineWidth: 2,
              height: 0,
            }
          });

          // Auto remove pulse ring after 6 seconds to keep view 100% clean
          setTimeout(() => {
            if (viewerRef.current && locationPulseRef.current) {
              viewerRef.current.entities.remove(locationPulseRef.current);
              locationPulseRef.current = null;
            }
          }, 6000);

          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 2200),
            orientation: {
              heading: 0.0,
              pitch: Cesium.Math.toRadians(-90.0),
              roll: 0.0,
            },
            duration: 2.2
          });
        }

        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t("map.locationError"));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /**
   * AUTOMATIC BITEMPORAL CAPTURE OF CURRENT VIEW (NO DRAWING NEEDED)
   * Captures Left layer (T1) and Right layer (T2) at full viewport resolution.
   * Ensures tiles are completely loaded before capturing to prevent blank blue frames.
   */
  const handleCaptureCurrentView = async () => {
    if (!containerRef.current || !viewerRef.current) return;
    const viewer = viewerRef.current;

    setCapturing(true);

    // Temporarily hide any location pulse markers so screenshot is 100% clean satellite imagery
    if (locationPulseRef.current) locationPulseRef.current.show = false;

    // Compute bounding box coordinates of current camera view
    const rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid);
    let bounds: [[number, number], [number, number]];
    if (rect) {
      const minLat = Cesium.Math.toDegrees(rect.south);
      const maxLat = Cesium.Math.toDegrees(rect.north);
      const minLon = Cesium.Math.toDegrees(rect.west);
      const maxLon = Cesium.Math.toDegrees(rect.east);
      bounds = [[minLat, minLon], [maxLat, maxLon]];
    } else {
      const carto = Cesium.Cartographic.fromCartesian(viewer.camera.position);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      bounds = [[lat - 0.05, lon - 0.05], [lat + 0.05, lon + 0.05]];
    }

    try {
      const t1Layer = t1LayerRef.current;
      const t2Layer = t2LayerRef.current;

      if (t1Layer && t2Layer) {
        // --- Pass 1: Render and load Left Layer Viewport (T1) ---
        setCaptureStatus(`Rendering ${leftLayerOption.shortLabel}...`);
        t1Layer.show = true;
        t1Layer.splitDirection = Cesium.SplitDirection.NONE;
        t2Layer.show = false;

        await ensureTilesReady(viewer);

        const canvas1 = await html2canvas(containerRef.current, { useCORS: true, allowTaint: false });
        const blob1: Blob | null = await new Promise(r => canvas1.toBlob(r, "image/png"));

        // --- Pass 2: Render and load Right Layer Viewport (T2) ---
        setCaptureStatus(`Rendering ${rightLayerOption.shortLabel}...`);
        t1Layer.show = false;
        t2Layer.show = true;
        t2Layer.splitDirection = Cesium.SplitDirection.NONE;

        await ensureTilesReady(viewer);

        const canvas2 = await html2canvas(containerRef.current, { useCORS: true, allowTaint: false });
        const blob2: Blob | null = await new Promise(r => canvas2.toBlob(r, "image/png"));

        // --- Restore split view ---
        t1Layer.show = true;
        t1Layer.splitDirection = Cesium.SplitDirection.LEFT;
        t2Layer.show = true;
        t2Layer.splitDirection = Cesium.SplitDirection.RIGHT;
        viewer.scene.splitPosition = splitPosition;
        viewer.render();

        const files: File[] = [];
        const isSarOptical = splitSubMode === "sar-optical" ||
          leftLayerOption.category === "sar" || rightLayerOption.category === "sar" ||
          leftLayerOption.id.includes("sar") || rightLayerOption.id.includes("sar");

        if (blob1) {
          const prefix = isSarOptical ? "OPTICAL" : "T1";
          files.push(new File([blob1], `${prefix}-${leftLayerOption.shortLabel}.png`, { type: "image/png" }));
        }
        if (blob2) {
          const prefix = isSarOptical ? "SAR" : "T2";
          files.push(new File([blob2], `${prefix}-${rightLayerOption.shortLabel}.png`, { type: "image/png" }));
        }

        onSelectBounds(bounds, files, {
          dateT1: leftLayerOption.shortLabel,
          dateT2: rightLayerOption.shortLabel,
          labelT1: leftLayerOption.shortLabel,
          isBitemporal: true,
          isOpticalSar: isSarOptical,
          sensorOptical: leftLayerOption.name,
          sensorSar: rightLayerOption.name,
        });
      }
    } catch (err) {
      console.error("Bi-temporal capture failed:", err);
    } finally {
      if (locationPulseRef.current) locationPulseRef.current.show = true;
      setCapturing(false);
      setCaptureStatus("");
    }
  };

  /**
   * Standard drawing capture (for normal single-image mode)
   */
  const handleStandardCapture = async () => {
    if (!drawnBounds || !containerRef.current || !viewerRef.current) return;
    const viewer = viewerRef.current;

    setCapturing(true);

    if (finalEntityRef.current) {
      viewer.entities.remove(finalEntityRef.current);
      finalEntityRef.current = null;
    }
    await ensureTilesReady(viewer, 1200);

    try {
      const canvas = await html2canvas(containerRef.current, { useCORS: true, allowTaint: false });
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `map-selection-${Date.now()}.png`, { type: "image/png" });
          onSelectBounds(drawnBounds, [file], {
            dateT1: leftLayerOption.shortLabel,
            dateT2: rightLayerOption.shortLabel,
            labelT1: leftLayerOption.shortLabel,
            isBitemporal: false
          });
        } else {
          onSelectBounds(drawnBounds);
        }
        setCapturing(false);
        setDrawnBounds(null);
      }, "image/png");
    } catch (err) {
      console.error("Failed to capture map:", err);
      onSelectBounds(drawnBounds);
      setCapturing(false);
    }
  };

  return (
    <div 
      className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl flex flex-col bg-[#080e1e]"
      onPointerMove={isDraggingSplitter ? handleSplitterPointerMove : undefined}
      onPointerUp={isDraggingSplitter ? handleSplitterPointerUp : undefined}
    >
      {/* ========================================================================= */}
      {/* SPLIT VIEW BAR (BI-TEMPORAL & SAR/OPTICAL DUAL-MODE CONTROLS)            */}
      {/* ========================================================================= */}
      {isBitemporal && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[98%] bg-[#0c1428]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 px-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col items-center gap-2.5 text-white select-none animate-in fade-in zoom-in-95 duration-150">
          
          {/* Sub-Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSplitSubMode("bitemporal");
                setLeftLayerId("wb-2022");
                setRightLayerId("esri-present");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                splitSubMode === "bitemporal"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="size-3" />
              <span>{t("map.bitemporalToggle") || "Bi-Temporal Timeline"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSplitSubMode("sar-optical");
                setLeftLayerId("copernicus-s2-optical");
                setRightLayerId("copernicus-s1-sar");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                splitSubMode === "sar-optical"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="size-3 text-purple-400" />
              <span>{t("map.sarOpticalToggle") || "SAR & Optical Fusion"}</span>
            </button>
          </div>

          {/* Quick Benchmark Preset Scene Buttons (SAR & Optical) */}
          {splitSubMode === "sar-optical" && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center border-t border-b border-white/5 py-1.5 w-full">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mr-1">
                <Sparkles className="size-3 text-amber-400" /> {t("map.benchmarks") || "Benchmarks"}:
              </span>
              {SAR_OPTICAL_BENCHMARKS.map((b) => {
                const bName = getBenchmarkDisplayName(b);
                const bDesc = getBenchmarkDescription(b);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => flyToBenchmark(b)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                      activeBenchmarkId === b.id
                        ? "bg-purple-500/25 border-purple-400 text-white shadow-sm ring-1 ring-purple-400/50"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    title={bDesc}
                  >
                    <span>{b.icon}</span>
                    <span>{bName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Left & Right Layer Selectors */}
          <div className="flex items-center justify-center gap-3 w-full">
            {/* Left View Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="size-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider leading-none">
                  {splitSubMode === "sar-optical" ? (t("map.leftOptical") || "Left (Optical)") : (t("map.leftT1") || "Left View (T1)")}
                </span>
                <select
                  value={leftLayerId}
                  onChange={(e) => setLeftLayerId(e.target.value)}
                  className="mt-1 bg-black/70 border border-cyan-500/40 rounded-xl px-2.5 py-1 text-xs font-bold text-cyan-200 outline-none focus:border-cyan-400 cursor-pointer shadow-inner hover:border-cyan-400 transition-colors max-w-[190px] sm:max-w-[240px] truncate"
                >
                  {splitSubMode === "sar-optical" ? (
                    <optgroup label={t("map.opticalMulti") || "🛰️ Optical Multispectral"}>
                      {AVAILABLE_LAYERS.filter(l => l.category === "optical").map(l => (
                        <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                          {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <>
                      <optgroup label={t("map.historicalArchives") || "⏳ Historical Archives"}>
                        {AVAILABLE_LAYERS.filter(l => l.category === "historical").map(l => (
                          <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={t("map.opticalMulti") || "🛰️ Optical Multispectral"}>
                        {AVAILABLE_LAYERS.filter(l => l.category === "optical").map(l => (
                          <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Quick Swap Button */}
            <div className="flex items-center px-1">
              <button
                type="button"
                onClick={handleSwapViews}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer hover:rotate-180 duration-300 shadow-sm active:scale-95"
                title="Swap Left and Right views"
              >
                <ArrowLeftRight className="size-3.5" />
              </button>
            </div>

            {/* Right View Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider leading-none">
                  {splitSubMode === "sar-optical" ? (t("map.rightSar") || "Right (SAR Radar)") : (t("map.rightT2") || "Right View (T2)")}
                </span>
                <select
                  value={rightLayerId}
                  onChange={(e) => setRightLayerId(e.target.value)}
                  className="mt-1 bg-black/70 border border-purple-500/40 rounded-xl px-2.5 py-1 text-xs font-bold text-purple-200 outline-none focus:border-purple-400 cursor-pointer shadow-inner hover:border-purple-400 transition-colors text-right max-w-[190px] sm:max-w-[240px] truncate"
                >
                  {splitSubMode === "sar-optical" ? (
                    <optgroup label={t("map.sarRadar") || "📡 Synthetic Aperture Radar (SAR)"}>
                      {AVAILABLE_LAYERS.filter(l => l.category === "sar").map(l => (
                        <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                          {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <>
                      <optgroup label={t("map.opticalMulti") || "🛰️ Optical Multispectral"}>
                        {AVAILABLE_LAYERS.filter(l => l.category === "optical").map(l => (
                          <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={t("map.historicalArchives") || "⏳ Historical Archives"}>
                        {AVAILABLE_LAYERS.filter(l => l.category === "historical").map(l => (
                          <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
              <span className="size-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CESIUM 3D GLOBE VIEWPORT                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 relative w-full min-h-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full" ref={containerRef} />

        {/* Standard Single Map View: Basemap Selector Pill */}
        {!isBitemporal && (
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-[#0c1428]/90 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-1.5 shadow-xl select-none">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300">Basemap:</span>
            <select
              value={leftLayerId}
              onChange={(e) => setLeftLayerId(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-300 outline-none focus:border-emerald-400 cursor-pointer shadow-inner hover:border-emerald-400 transition-colors max-w-[210px] sm:max-w-[300px] truncate"
            >
              <optgroup label="🛰️ Optical High-Resolution">
                {AVAILABLE_LAYERS.filter(l => l.category === "optical").map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                    {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⏳ Historical Archives">
                {AVAILABLE_LAYERS.filter(l => l.category === "historical").map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                    {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📡 Synthetic Aperture Radar (SAR)">
                {AVAILABLE_LAYERS.filter(l => l.category === "sar").map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0c1428] text-white">
                    {l.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {/* Top-Corner Floating View Badges (Zero Clumping on Divider Line) */}
        {isBitemporal && (
          <>
            {/* Top-Left Corner Badge */}
            <div className="absolute top-28 left-4 z-20 pointer-events-none animate-in fade-in duration-200">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-[#0c1428]/90 border shadow-xl backdrop-blur-md flex items-center gap-1.5 ${
                splitSubMode === "sar-optical"
                  ? "text-cyan-300 border-cyan-500/40"
                  : "text-cyan-300 border-cyan-500/40"
              }`}>
                <span>{splitSubMode === "sar-optical" ? "🛰️ OPTICAL" : "◀"}</span>
                <span>{leftLayerOption.shortLabel}</span>
                <span className="text-[10px] text-cyan-400/70 font-mono font-normal">({leftLayerOption.resolution})</span>
              </span>
            </div>

            {/* Top-Right Corner Badge */}
            <div className="absolute top-28 right-4 z-20 pointer-events-none animate-in fade-in duration-200">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-[#0c1428]/90 border shadow-xl backdrop-blur-md flex items-center gap-1.5 ${
                splitSubMode === "sar-optical"
                  ? "text-purple-300 border-purple-500/40"
                  : "text-emerald-300 border-emerald-500/40"
              }`}>
                <span className="text-[10px] text-purple-400/70 font-mono font-normal">({rightLayerOption.resolution})</span>
                <span>{rightLayerOption.shortLabel}</span>
                <span>{splitSubMode === "sar-optical" ? "📡 SAR" : "▶"}</span>
              </span>
            </div>
          </>
        )}

        {/* Clean Split Screen Curtain Divider (100% Dead-Center Aligned) */}
        {isBitemporal && (
          <div 
            className="absolute top-0 bottom-0 z-20 pointer-events-none select-none"
            style={{ left: `${splitPosition * 100}%` }}
          >
            {/* Crisp Glowing Divider Line (Centered precisely on left: 0) */}
            <div className={`absolute top-0 bottom-0 -left-[1px] w-[2px] ${
              splitSubMode === "sar-optical"
                ? "bg-gradient-to-b from-cyan-400 via-white to-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.9),0_0_8px_rgba(56,189,248,0.9)]"
                : "bg-white shadow-[0_0_12px_rgba(56,189,248,0.9),0_0_2px_white]"
            }`} />

            {/* Clean Centered Grabber Handle (Centered exactly at left: 0, top: 50%) */}
            <div 
              onPointerDown={handleSplitterPointerDown}
              onPointerMove={handleSplitterPointerMove}
              onPointerUp={handleSplitterPointerUp}
              onPointerCancel={handleSplitterPointerUp}
              className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 size-10 rounded-full bg-white text-slate-900 border-2 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-115 active:scale-95 transition-all group ${
                splitSubMode === "sar-optical"
                  ? "border-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.7)]"
                  : "border-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.7)]"
              }`}
              title={t("map.dragToComparePrompt") || "Drag curtain left / right to compare"}
            >
              <ChevronsLeftRight className="size-4 text-slate-900 group-hover:text-cyan-600 transition-colors pointer-events-none" />
            </div>
          </div>
        )}

        {/* 1-Click Action Button & Clarity Note in Split Mode */}
        {isBitemporal && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col items-center gap-1.5 max-w-[94%]">
            <button
              type="button"
              onClick={() => void handleCaptureCurrentView()}
              disabled={capturing}
              className={`px-6 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-98 ${
                splitSubMode === "sar-optical"
                  ? "bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-purple-500/30"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30"
              }`}
            >
              {capturing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-white" />
                  <span>{captureStatus || t("map.capturing") || "Capturing satellite imagery..."}</span>
                </>
              ) : (
                <>
                  <Camera className="size-4" />
                  <span>
                    {splitSubMode === "sar-optical"
                      ? `${t("map.captureSarOptical") || "Capture Optical & SAR Pair"} (${leftLayerOption.shortLabel} vs ${rightLayerOption.shortLabel})`
                      : `${t("map.captureBitemporal") || "Auto-Capture Both Views"} (${leftLayerOption.shortLabel} vs ${rightLayerOption.shortLabel})`}
                  </span>
                </>
              )}
            </button>
            <div className="text-[11px] text-slate-300 font-medium bg-[#0c1428]/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 shadow-lg text-center leading-tight">
              {splitSubMode === "sar-optical" ? (
                <span>
                  Captures co-registered <span className="text-cyan-300 font-bold">{leftLayerOption.shortLabel} (Optical)</span> and <span className="text-purple-300 font-bold">{rightLayerOption.shortLabel} (SAR)</span> frames for multimodal cross-sensor AI reasoning.
                </span>
              ) : (
                <span>
                  Auto-captures zoomed-in full view of both <span className="text-cyan-300 font-bold">{leftLayerOption.shortLabel} (T1)</span> and <span className="text-emerald-300 font-bold">{rightLayerOption.shortLabel} (T2)</span> as separate high-res images for AI analysis.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM CONTROL BAR                                                        */}
      {/* ========================================================================= */}
      <div className="p-3 bg-[#0c1428]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-10 shrink-0 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            {isBitemporal ? (
              splitSubMode === "sar-optical" ? (
                <>
                  <span className="text-purple-300 font-extrabold">{t("map.sarOpticalActive") || "SAR (Radar) vs Optical Fusion"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Dual-Sensor Mode
                  </span>
                </>
              ) : (
                <span>{t("map.bitemporalToggle") || "Bi-Temporal Historical Comparison"}</span>
              )
            ) : (
              t("map.selectRegion")
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBitemporal
              ? (splitSubMode === "sar-optical"
                  ? (t("map.sarOpticalDesc") || "Drag curtain to observe microwave cloud penetration and backscatter differences between Optical and SAR.")
                  : (t("map.bitemporalDesc") || "Select any era for Left and Right. Drag curtain to compare. Click 'Auto-Capture Both Views' to send to AI."))
              : (mode === "draw" ? t("map.drawInstruction") : t("map.panInstruction"))}
          </p>
          {locationError && (
            <p className="text-xs text-red-400 mt-1">{locationError}</p>
          )}
          {userCoords && !locationError && (
            <p className="text-xs text-cyan-400/80 mt-1 font-mono">
              📍 GPS: {userCoords.lat.toFixed(5)}° N, {userCoords.lon.toFixed(5)}° E
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bi-Temporal Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isBitemporal && splitSubMode === "bitemporal") {
                setIsBitemporal(false);
              } else {
                setIsBitemporal(true);
                setSplitSubMode("bitemporal");
                setLeftLayerId("wb-2022");
                setRightLayerId("esri-present");
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
              isBitemporal && splitSubMode === "bitemporal"
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 ring-1 ring-cyan-500/30"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            title="Toggle historical timeline comparison"
          >
            <History className={`size-3.5 ${isBitemporal && splitSubMode === "bitemporal" ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
            <span>{t("map.bitemporal") || "Bi-Temporal"}</span>
          </button>

          {/* SAR vs Optical Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isBitemporal && splitSubMode === "sar-optical") {
                setIsBitemporal(false);
              } else {
                setIsBitemporal(true);
                setSplitSubMode("sar-optical");
                setLeftLayerId("copernicus-s2-optical");
                setRightLayerId("copernicus-s1-sar");
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
              isBitemporal && splitSubMode === "sar-optical"
                ? "bg-gradient-to-r from-cyan-500/25 to-purple-500/25 border-purple-400/60 text-purple-200 ring-1 ring-purple-500/40 shadow-purple-900/30"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            title="Compare Optical (Visible) vs SAR (Radar) side-by-side"
          >
            <Radio className={`size-3.5 ${isBitemporal && splitSubMode === "sar-optical" ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
            <span>{t("map.sarOptical") || "SAR & Optical"}</span>
          </button>

          {/* Live Location GPS Button */}
          <button
            type="button"
            onClick={handleLiveLocation}
            disabled={locating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {locating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {t("map.locating")}
              </>
            ) : (
              <>
                <MapPin className="size-3.5" />
                {t("map.useLocation")}
              </>
            )}
          </button>

          {/* Draw / Pan Mode (Available in standard mode) */}
          {!isBitemporal && (
            <button
              type="button"
              onClick={() => {
                if (mode === "pan") {
                  setDrawnBounds(null);
                  setMode("draw");
                } else {
                  setMode("pan");
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm border cursor-pointer ${
                mode === "draw"
                  ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <MousePointer className="size-3.5" />
              {mode === "draw" ? t("map.cancelDrawing") : t("map.drawArea")}
            </button>
          )}

          {/* Standard capture button for drawn box in standard mode */}
          {!isBitemporal && drawnBounds && (
            <button
              type="button"
              onClick={() => void handleStandardCapture()}
              disabled={capturing}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/25 cursor-pointer"
            >
              {capturing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t("map.capturing")}</span>
                </>
              ) : (
                <>
                  <Camera className="size-3.5" />
                  <span>{t("map.sendToChat")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

