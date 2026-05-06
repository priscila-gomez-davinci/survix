import { useEffect, useRef } from "react";
import { View } from "react-native";
import type { RoutePoint } from "@/src/services/api";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";

declare global {
  interface Window { google: any }
}

type Props = {
  points: RoutePoint[];
};

export default function RouteMap({ points }: Props) {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (points.length === 0) return;

    const sorted = [...points].sort((a, b) => a.order - b.order);
    const path = sorted.map((p) => ({ lat: p.lat, lng: p.lng }));

    const init = () => {
      const el = containerRef.current as unknown as HTMLElement | null;
      if (!el) return;
      const gm = window.google.maps;
      const map = new gm.Map(el, {
        disableDefaultUI: true,
        gestureHandling: "none",
        zoomControl: false,
      });
      new gm.Polyline({ path, strokeColor: "#14342B", strokeWeight: 3, map });
      const bounds = new gm.LatLngBounds();
      path.forEach((p: { lat: number; lng: number }) => bounds.extend(p));
      map.fitBounds(bounds, 24);
    };

    if (window.google?.maps) {
      init();
      return;
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      const poll = setInterval(() => {
        if (window.google?.maps) { clearInterval(poll); init(); }
      }, 100);
      return () => clearInterval(poll);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [points]);

  if (points.length === 0) return null;

  return (
    <View
      ref={containerRef}
      style={{ width: "100%", height: 220, borderRadius: 16, overflow: "hidden", marginTop: 8 }}
    />
  );
}
