import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { HeatmapPoint } from "@/hooks/use-delivery-heatmap";

interface DeliveryHeatMapProps {
  points: HeatmapPoint[];
  isLoading: boolean;
}

export function DeliveryHeatMap({ points, isLoading }: DeliveryHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-14.235, -51.9253], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
      markersRef.current = null;
    }

    if (points.length === 0) return;

    // Heat layer
    const heatData = points.map(p => [p.lat, p.lng, p.intensity] as [number, number, number]);
    const maxIntensity = Math.max(...points.map(p => p.intensity), 1);

    // @ts-ignore - leaflet.heat adds this to L
    const heat = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      max: maxIntensity,
      gradient: { 0.2: "#00f", 0.4: "#0ff", 0.6: "#0f0", 0.8: "#ff0", 1.0: "#f00" },
    });
    heat.addTo(map);
    heatLayerRef.current = heat;

    // Markers
    const markerGroup = L.layerGroup();
    points.forEach(p => {
      const cepFormatted = p.zipCode
        ? `${p.zipCode.slice(0, 5)}-${p.zipCode.slice(5)}`
        : "—";
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 8,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.85,
        weight: 2,
      });
      marker.bindPopup(
        `<div style="font-size:13px;line-height:1.5">
          <b>CEP:</b> ${cepFormatted}<br/>
          <b>Bairro:</b> ${p.neighborhood || "—"}<br/>
          <b>Pedidos:</b> ${p.intensity}
        </div>`
      );
      markerGroup.addLayer(marker);
    });
    markerGroup.addTo(map);
    markersRef.current = markerGroup;

    // Fit bounds to pins
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    const bounds = L.latLngBounds(
      [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
      [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [points]);

  return (
    <div className="relative rounded-lg border bg-card overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            Geocodificando CEPs...
          </div>
        </div>
      )}
      {!isLoading && points.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/60">
          <p className="text-sm text-muted-foreground">Nenhum pedido com CEP encontrado no período.</p>
        </div>
      )}
      <div ref={mapRef} className="h-[450px] w-full" />
    </div>
  );
}
