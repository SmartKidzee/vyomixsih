import { useState, useRef, useEffect } from "react";
import { Camera, MousePointer, MapPin, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useI18n } from "@/lib/i18n";

Cesium.Ion.defaultAccessToken = "";

const freeSatelliteProvider = new Cesium.UrlTemplateImageryProvider({
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  credit: 'Esri World Imagery',
  maximumLevel: 19
});

const labelsProvider = new Cesium.UrlTemplateImageryProvider({
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  credit: 'Esri Reference',
  maximumLevel: 19
});

interface MapSelectorProps {
  onSelectBounds: (bounds: [[number, number], [number, number]], imageFile?: File) => void;
}

export function MapSelector({ onSelectBounds }: MapSelectorProps) {
  const [mode, setMode] = useState<"pan" | "draw">("pan");
  const [drawnBounds, setDrawnBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasUsedLocation, setHasUsedLocation] = useState(false);
  const { t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const locationMarkerRef = useRef<Cesium.Entity | null>(null);
  const locationCircleRef = useRef<Cesium.Entity | null>(null);

  // Drawing refs
  const drawingRef = useRef(false);
  const startRef = useRef<Cesium.Cartographic | null>(null);
  const endRef = useRef<Cesium.Cartographic | null>(null);
  const tempEntityRef = useRef<Cesium.Entity | null>(null);
  const finalEntityRef = useRef<Cesium.Entity | null>(null);

  // Initialize Cesium viewer once
  useEffect(() => {
    if (!containerRef.current) return;

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
      baseLayer: new Cesium.ImageryLayer(freeSatelliteProvider),
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
        }
      }
    });

    viewer.imageryLayers.addImageryProvider(labelsProvider);

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

  // Handle mode changes — setup/teardown draw handlers
  useEffect(() => {
    const handler = handlerRef.current;
    const viewer = viewerRef.current;
    if (!handler || !viewer) return;

    if (mode === "draw") {
      // Disable camera controls for drawing
      viewer.scene.screenSpaceCameraController.enableInputs = false;
      viewer.canvas.style.cursor = "crosshair";

      // Remove any previous final rectangle
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

        // Remove old temp entity
        if (tempEntityRef.current) {
          viewer.entities.remove(tempEntityRef.current);
        }

        // Create live-updating rectangle while dragging
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

          // Only accept if the box is big enough (not just a click)
          if (Math.abs(maxLat - minLat) > 0.0001 || Math.abs(maxLon - minLon) > 0.0001) {
            const bounds: [[number, number], [number, number]] = [
              [minLat, minLon],
              [maxLat, maxLon]
            ];
            setDrawnBounds(bounds);

            // Remove temp entity, add a persistent outline rectangle
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

            // Auto-switch back to pan
            setMode("pan");
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

    } else {
      // Pan mode — re-enable camera, remove handlers
      viewer.scene.screenSpaceCameraController.enableInputs = true;
      viewer.canvas.style.cursor = "default";
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);

      // Clean up temp drawing entity if mode switched mid-draw
      if (tempEntityRef.current) {
        viewer.entities.remove(tempEntityRef.current);
        tempEntityRef.current = null;
      }
      drawingRef.current = false;
    }
  }, [mode]);

  // Live location using browser Geolocation API (NOT IP-based)
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setLocationError(null);
    setHasUsedLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const viewer = viewerRef.current;
        
        if (viewer) {
          // Remove previous location markers
          if (locationMarkerRef.current) {
            viewer.entities.remove(locationMarkerRef.current);
          }
          if (locationCircleRef.current) {
            viewer.entities.remove(locationCircleRef.current);
          }

          // Add accuracy circle
          locationCircleRef.current = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            ellipse: {
              semiMajorAxis: Math.max(accuracy, 50),
              semiMinorAxis: Math.max(accuracy, 50),
              material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.1),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.4),
              outlineWidth: 2,
              height: 0,
            }
          });

          // Add location marker point
          locationMarkerRef.current = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            point: {
              pixelSize: 14,
              color: Cesium.Color.fromCssColorString('#38bdf8'),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 3,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: `📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              font: '13px Inter, sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('#0c1428').withAlpha(0.85),
              backgroundPadding: new Cesium.Cartesian2(8, 5),
            }
          });

          // Fly to the location — top-down view with proper zoom
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 2500),
            orientation: {
              heading: 0.0,
              pitch: Cesium.Math.toRadians(-90.0),
              roll: 0.0,
            },
            duration: 2.5,
            complete: () => {
              // After reaching, zoom in a bit more smoothly
              viewer.camera.zoomIn(500);
            }
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
        enableHighAccuracy: true,  // Use GPS, not just WiFi/IP
        timeout: 15000,
        maximumAge: 0,  // No caching — always get fresh position
      }
    );
  };

  const handleCapture = async () => {
    if (!drawnBounds || !containerRef.current) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    setCapturing(true);

    // Remove the outline rectangle before capturing so image is clean
    if (finalEntityRef.current) {
      viewer.entities.remove(finalEntityRef.current);
      finalEntityRef.current = null;
    }
    viewer.render();

    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: false
      });
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `map-selection-${Date.now()}.png`, { type: "image/png" });
          onSelectBounds(drawnBounds, file);
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
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-sm flex flex-col bg-[#0c1428]">
      {/* Cesium container */}
      <div className="flex-1 relative w-full min-h-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full" ref={containerRef} />
      </div>

      {/* Bottom controls */}
      <div className="p-4 bg-[#0c1428]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-10 shrink-0 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white">{t("map.selectRegion")}</h3>
          <p className="text-xs text-slate-400">
            {mode === "draw"
              ? t("map.drawInstruction")
              : t("map.panInstruction")}
          </p>
          {locationError && (
            <p className="text-xs text-red-400 mt-1">{locationError}</p>
          )}
          {!hasUsedLocation && !locationError && (
            <p className="text-xs text-cyan-400/60 mt-1">{t("map.locationHint")}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Location Button */}
          <button
            onClick={handleLiveLocation}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {locating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("map.locating")}
              </>
            ) : (
              <>
                <MapPin className="size-4" />
                {t("map.useLocation")}
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (mode === "pan") {
                setDrawnBounds(null);
                setMode("draw");
              } else {
                setMode("pan");
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm border ${
              mode === "draw"
                ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <MousePointer className="size-4" />
            {mode === "draw" ? t("map.cancelDrawing") : t("map.drawArea")}
          </button>

          {drawnBounds && (
            <button
              onClick={() => void handleCapture()}
              disabled={capturing}
              className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-sm"
            >
              {capturing ? (
                <span className="animate-pulse">{t("map.capturing")}</span>
              ) : (
                <>
                  <Camera className="size-4" /> {t("map.sendToChat")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
