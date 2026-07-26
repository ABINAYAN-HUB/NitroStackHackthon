"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Fix missing marker icons in Leaflet with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Custom icon using lucide-react colors
const createCustomIcon = (isContradicted: boolean) => {
  return new L.DivIcon({
    className: "custom-leaflet-icon",
    html: `<div style="
      background-color: ${isContradicted ? '#f43f5e' : '#10b981'};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px ${isContradicted ? '#f43f5e' : '#10b981'};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

interface Props {
  address: string;
  isContradicted?: boolean;
}

export default function MapWidget({ address, isContradicted = false }: Props) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Fallbacks for demo cases if API fails or we want instant load
    const hardcoded: Record<string, [number, number]> = {
      "coimbatore": [11.0168, 76.9558],
      "bengaluru": [12.9716, 77.5946],
      "mysuru": [12.2958, 76.6394],
      "visakhapatnam": [17.6868, 83.2185],
      "mumbai": [18.9220, 72.8347],
      "madurai": [9.9252, 78.1198]
    };

    const extractCity = () => {
      const parts = address.toLowerCase().split(",");
      if (parts.length >= 2) return parts[parts.length - 2].trim();
      return address.toLowerCase();
    };

    const fetchCoords = async () => {
      try {
        const city = extractCity();
        
        // Use hardcoded if it exists for the demo
        const match = Object.keys(hardcoded).find(k => city.includes(k) || address.toLowerCase().includes(k));
        if (match) {
          if (isMounted) {
            setCoords(hardcoded[match]);
            setLoading(false);
          }
          return;
        }

        // Otherwise fallback to nominatim API
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        
        if (data && data.length > 0 && isMounted) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setLoading(false);
        } else if (isMounted) {
          // Ultimate fallback (India center roughly)
          setCoords([20.5937, 78.9629]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchCoords();

    return () => {
      isMounted = false;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="w-full h-48 rounded-xl bg-paper border border-border/30 flex items-center justify-center animate-pulse">
        <span className="text-text-muted text-xs font-mono tracking-widest">GEOCODING...</span>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div className="w-full h-48 rounded-xl bg-paper border border-border/30 flex items-center justify-center text-text-muted text-xs">
        Failed to load map data.
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-56 rounded-xl overflow-hidden border relative z-0 group shadow-lg",
      isContradicted ? "border-contradiction/40 shadow-contradiction/10" : "border-emerald-500/20 shadow-emerald-500/5"
    )}>
      {/* Radar scanning animation overlay */}
      <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50 radar-scan" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,14,20,0.4)_100%)]" />
      </div>

      <MapContainer 
        center={coords} 
        zoom={12} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        {/* Dark mode tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={coords} icon={createCustomIcon(isContradicted)}>
          <Popup className="custom-popup">
            <div className="font-sans text-xs">
              <strong className="text-text">{address}</strong>
            </div>
          </Popup>
        </Marker>
        
        {/* Radius circle */}
        <Circle 
          center={coords} 
          radius={2000} 
          pathOptions={{ 
            color: isContradicted ? '#f43f5e' : '#10b981', 
            fillColor: isContradicted ? '#f43f5e' : '#10b981', 
            fillOpacity: 0.1,
            weight: 1
          }} 
        />
      </MapContainer>

      {/* Overlay Status Badge */}
      <div className="absolute top-2 right-2 z-[400] glass-card px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 backdrop-blur-md">
        {isContradicted ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-contradiction" />
            <span className="text-[10px] font-bold text-contradiction uppercase tracking-wider">Mismatch</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
            <span className="text-[10px] font-bold text-verified uppercase tracking-wider">Verified</span>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background-color: #0B0E14 !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background-color: #11141D;
          color: #E2E8F0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background-color: #11141D;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaflet-control-zoom a {
          background-color: #11141D !important;
          color: #E2E8F0 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #1A1F2B !important;
        }
        @keyframes radar-scan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        .radar-scan {
          animation: radar-scan 3s ease-in-out infinite;
        }
      ` }} />
    </div>
  );
}
