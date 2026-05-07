import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useHomeData } from "@/src/context/HomeDataContext";
import { routesApi } from "@/src/services/api";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 };

const ACTIVITY_COLOR = "#14342B";
const GUIDE_COLOR = "#D97706";

function makePinUrl(bgColor: string, iconSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
    <path d="M15 0C6.7 0 0 6.7 0 15C0 26.3 15 38 15 38S30 26.3 30 15C30 6.7 23.3 0 15 0Z" fill="${bgColor}"/>
    ${iconSvg}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const ACTIVITY_PIN_URL = makePinUrl(
  ACTIVITY_COLOR,
  `<polygon points="4,22 13,8 22,22" fill="rgba(255,255,255,0.5)"/>
   <polygon points="9,22 18,8 27,22" fill="white"/>`,
);

const GUIDE_PIN_URL = makePinUrl(
  GUIDE_COLOR,
  `<rect x="8" y="6" width="14" height="17" rx="1.5" fill="white"/>
   <rect x="8" y="6" width="3" height="17" rx="1.5" fill="${GUIDE_COLOR}" opacity="0.35"/>
   <rect x="12" y="10" width="8" height="1.5" rx="0.75" fill="${GUIDE_COLOR}"/>
   <rect x="12" y="13" width="8" height="1.5" rx="0.75" fill="${GUIDE_COLOR}"/>
   <rect x="12" y="16" width="5" height="1.5" rx="0.75" fill="${GUIDE_COLOR}"/>`,
);

declare global {
  interface Window { google: any }
}

export default function MapScreen() {
  const router = useRouter();
  const { activities, guides } = useHomeData();
  const mapContainerRef = useRef<any>(null);
  const gMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
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
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const addMarker = (
      item: { id: string; title: string; subtitle?: string; description?: string; image?: string; coordinates?: { latitude: number; longitude: number } },
      type: "activity" | "guide",
    ) => {
      if (!item.coordinates) return;
      const color = type === "activity" ? ACTIVITY_COLOR : GUIDE_COLOR;
      const pinUrl = type === "activity" ? ACTIVITY_PIN_URL : GUIDE_PIN_URL;
      const marker = new gm.Marker({
        position: {
          lat: item.coordinates.latitude,
          lng: item.coordinates.longitude,
        },
        map: gMapRef.current,
        title: item.title,
        icon: {
          url: pinUrl,
          scaledSize: new gm.Size(30, 38),
          anchor: new gm.Point(15, 38),
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

      if (type === "activity") {
        routesApi.getPoints(Number(item.id)).then((pts) => {
          if (pts.length < 2 || !gMapRef.current) return;
          const sorted = [...pts].sort((a, b) => a.order - b.order);
          const polyline = new gm.Polyline({
            path: sorted.map((p) => ({ lat: p.lat, lng: p.lng })),
            map: gMapRef.current,
            strokeColor: "#14342B",
            strokeWeight: 3,
            strokeOpacity: 0.85,
          });
          polylinesRef.current.push(polyline);
        }).catch(() => {});
      }

      markersRef.current.push(marker);
    };

    activities.forEach((a) => addMarker(a, "activity"));
    guides.forEach((g) => addMarker(g, "guide"));

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
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
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: ACTIVITY_COLOR }]} />
          <Text style={styles.legendText}>Actividades</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: GUIDE_COLOR }]} />
          <Text style={styles.legendText}>Guías</Text>
        </View>
      </View>
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
  legend: {
    position: "absolute",
    bottom: 20,
    right: 14,
    backgroundColor: "#FFFFFFEE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
});
