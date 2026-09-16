import { useState, useRef, useEffect } from "react";
import { Camera, MousePointer } from "lucide-react";
import html2canvas from "html2canvas";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);

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
            material: Cesium.Color.fromCssColorString('#CC5A37').withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#CC5A37'),
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

            // Remove temp entity, add a persistent dark outline rectangle
            if (tempEntityRef.current) {
              viewer.entities.remove(tempEntityRef.current);
              tempEntityRef.current = null;
            }

            finalEntityRef.current = viewer.entities.add({
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat),
                material: Cesium.Color.fromCssColorString('#1F1E1B').withAlpha(0.1),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#1F1E1B'),
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

  const handleCapture = async () => {
    if (!drawnBounds || !containerRef.current) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    setCapturing(true);

    // Remove the dark outline rectangle before capturing so image is clean
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
    <div className="w-full h-full rounded-2xl overflow-hidden border border-[#E5E0D8] relative shadow-sm flex flex-col bg-white">
      {/* Cesium container */}
      <div className="flex-1 relative w-full min-h-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full" ref={containerRef} />
      </div>

      {/* Bottom controls */}
      <div className="p-4 bg-white border-t border-[#E5E0D8] flex items-center justify-between z-10 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-[#1F1E1B]">Select Region</h3>
          <p className="text-xs text-[#7D786F]">
            {mode === "draw"
              ? "Click and drag to draw a box."
              : "Pan and zoom, or draw a new region."}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                ? "bg-[#F2EFEA] border-[#CC5A37] text-[#CC5A37]"
                : "bg-white border-[#E5E0D8] text-[#1F1E1B] hover:bg-[#F2EFEA]"
            }`}
          >
            <MousePointer className="size-4" />
            {mode === "draw" ? "Cancel Drawing" : "Draw Area"}
          </button>

          {drawnBounds && (
            <button
              onClick={() => void handleCapture()}
              disabled={capturing}
              className="flex items-center gap-2 bg-[#CC5A37] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#B54A2B] disabled:opacity-50 transition-colors shadow-sm"
            >
              {capturing ? (
                <span className="animate-pulse">Capturing...</span>
              ) : (
                <>
                  <Camera className="size-4" /> Send to Chat
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
