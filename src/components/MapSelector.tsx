import { useState, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents, Rectangle } from "react-leaflet";
import { Camera, MousePointer } from "lucide-react";
import html2canvas from "html2canvas";
import "leaflet/dist/leaflet.css";

interface MapSelectorProps {
  onSelectBounds: (bounds: [[number, number], [number, number]], imageFile?: File) => void;
}

function DrawLayer({ isDrawing, onDrawn }: { isDrawing: boolean, onDrawn: (b: [[number, number], [number, number]]) => void }) {
  const [start, setStart] = useState<L.LatLng | null>(null);
  const [end, setEnd] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    mousedown(e) {
      if (!isDrawing) return;
      map.dragging.disable();
      setStart(e.latlng);
      setEnd(null);
    },
    mousemove(e) {
      if (!isDrawing || !start) return;
      setEnd(e.latlng);
    },
    mouseup(e) {
      if (!isDrawing || !start) return;
      map.dragging.enable();
      if (end) {
        onDrawn([[Math.min(start.lat, end.lat), Math.min(start.lng, end.lng)], [Math.max(start.lat, end.lat), Math.max(start.lng, end.lng)]]);
      }
      setStart(null);
      setEnd(null);
    }
  });

  if (start && end) {
    return <Rectangle bounds={[[start.lat, start.lng], [end.lat, end.lng]]} pathOptions={{ color: '#CC5A37', weight: 2, fillOpacity: 0.2 }} />;
  }
  return null;
}

export function MapSelector({ onSelectBounds }: MapSelectorProps) {
  const [mode, setMode] = useState<"pan" | "draw">("pan");
  const [drawnBounds, setDrawnBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [capturing, setCapturing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!drawnBounds) return;
    
    if (mapRef.current) {
      setCapturing(true);
      try {
        const canvas = await html2canvas(mapRef.current, { useCORS: true, allowTaint: false });
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `map-selection-${Date.now()}.png`, { type: "image/png" });
            onSelectBounds(drawnBounds, file);
          } else {
            onSelectBounds(drawnBounds);
          }
          setCapturing(false);
        }, "image/png");
      } catch (err) {
        console.error("Failed to capture map:", err);
        onSelectBounds(drawnBounds);
        setCapturing(false);
      }
    } else {
      onSelectBounds(drawnBounds);
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-[#E5E0D8] relative shadow-sm flex flex-col bg-white">
      <div className="flex-1 relative" ref={mapRef} style={{ cursor: mode === "draw" ? "crosshair" : "grab" }}>
        <MapContainer center={[20, 0]} zoom={3} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            crossOrigin="anonymous"
          />
          <DrawLayer 
            isDrawing={mode === "draw"} 
            onDrawn={(b) => {
              setDrawnBounds(b);
              setMode("pan"); // Auto-switch back to pan so they can see the box
            }} 
          />
          {drawnBounds && mode !== "draw" && (
            <Rectangle bounds={drawnBounds} pathOptions={{ color: '#1F1E1B', weight: 2, fillOpacity: 0.1 }} />
          )}
        </MapContainer>
      </div>

      <div className="p-4 bg-white border-t border-[#E5E0D8] flex items-center justify-between z-10 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-[#1F1E1B]">Select Region</h3>
          <p className="text-xs text-[#7D786F]">
            {mode === "draw" ? "Click and drag to draw a box." : "Pan and zoom, or draw a new region."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setMode(mode === "pan" ? "draw" : "pan");
              if (mode === "pan") setDrawnBounds(null); // Clear previous
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm border ${mode === "draw" ? "bg-[#F2EFEA] border-[#CC5A37] text-[#CC5A37]" : "bg-white border-[#E5E0D8] text-[#1F1E1B] hover:bg-[#F2EFEA]"}`}
          >
            <MousePointer className="size-4" /> {mode === "draw" ? "Cancel Drawing" : "Draw Area"}
          </button>
          
          {drawnBounds && (
            <button 
              onClick={() => void handleCapture()}
              disabled={capturing}
              className="flex items-center gap-2 bg-[#CC5A37] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#B54A2B] disabled:opacity-50 transition-colors shadow-sm"
            >
              {capturing ? <span className="animate-pulse">Capturing...</span> : <><Camera className="size-4" /> Send to Chat</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
