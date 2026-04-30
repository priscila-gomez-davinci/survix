import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useHomeData } from "@/src/context/HomeDataContext";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 };

declare global {
  interface Window { google: any }
}

export default function MapScreen() {
  const router = useRouter();
  const { activities, guides } = useHomeData();
  const mapContainerRef = useRef<any>(null);
  const gMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [scriptReady, setScriptReady] = useState(false);

  // Load the Maps JS API once
  useEffect(() => {
    if (window.google?.maps) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map when script is ready
  useEffect(() => {
    if (!scriptReady || !mapContainerRef.current || gMapRef.current) return;
    const domNode = mapContainerRef.current as unknown as HTMLElement;
    gMapRef.current = new window.google.maps.Map(domNode, {
      center: BUENOS_AIRES,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
    });
    return () => {
      gMapRef.current = null;
    };
  }, [scriptReady]);

  // Sync markers whenever activities/guides or map readiness changes
  useEffect(() => {
    if (!gMapRef.current) return;
    const gm = window.google.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const addMarker = (
      item: { id: string; title: string; subtitle?: string; description?: string; image?: string; coordinates?: { latitude: number; longitude: number } },
      color: string,
      type: "activity" | "guide",
    ) => {
      if (!item.coordinates) return;
      const marker = new gm.Marker({
        position: {
          lat: item.coordinates.latitude,
          lng: item.coordinates.longitude,
        },
        map: gMapRef.current,
        title: item.title,
        icon: {
          path: gm.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 9,
        },
      });

      const infoWindow = new gm.InfoWindow({
        content: `
          <div style="font-family:system-ui,sans-serif;padding:4px 6px;max-width:200px;">
            <div style="font-weight:700;color:${color};font-size:13px;">${item.title}</div>
            <div style="color:#6D7673;font-size:12px;margin-top:2px;">${item.subtitle ?? ""}</div>
            <div id="map-nav-${type}-${item.id}" style="color:#10A95A;font-weight:700;font-size:12px;margin-top:6px;cursor:pointer;">
              Ver detalle →
            </div>
          </div>
        `,
      });

      gm.event.addListenerOnce(infoWindow, "domready", () => {
        document.getElementById(`map-nav-${type}-${item.id}`)
          ?.addEventListener("click", () => {
            router.push({
              pathname: "/detail",
              params: {
                id: String(item.id),
                type,
                title: item.title,
                subtitle: item.subtitle ?? "",
                description: item.description ?? "",
                image: item.image ?? "",
              },
            });
          });
      });

      marker.addListener("click", () => {
        infoWindow.open(gMapRef.current, marker);
      });

      markersRef.current.push(marker);
    };

    activities.forEach((a) => addMarker(a, "#14342B", "activity"));
    guides.forEach((g) => addMarker(g, "#D97706", "guide"));

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [activities, guides, scriptReady, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {!scriptReady && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#14342B" />
        </View>
      )}
      <View ref={mapContainerRef} style={styles.mapContainer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  mapContainer: {
    flex: 1,
  },
});
