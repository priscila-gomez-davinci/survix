import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useHomeData } from "@/src/context/HomeDataContext";
import { routesApi } from "@/src/services/api";

type FilterType = "all" | "activity" | "guide";

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
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowsRef = useRef<Map<string, any>>(new Map());
  const polylinesRef = useRef<any[]>([]);
  const firstPointsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const [scriptReady, setScriptReady] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load Maps JS API
  useEffect(() => {
    if (window.google?.maps) { setScriptReady(true); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!scriptReady || !mapContainerRef.current || gMapRef.current) return;
    const domNode = mapContainerRef.current as unknown as HTMLElement;
    gMapRef.current = new window.google.maps.Map(domNode, {
      center: BUENOS_AIRES,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });
  }, [scriptReady]);

  // Sync markers
  useEffect(() => {
    if (!gMapRef.current) return;
    const gm = window.google.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current.clear();
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
        position: { lat: item.coordinates.latitude, lng: item.coordinates.longitude },
        map: gMapRef.current,
        title: item.title,
        icon: { url: pinUrl, scaledSize: new gm.Size(30, 38), anchor: new gm.Point(15, 38) },
      });

      const iw = new gm.InfoWindow({
        content: `
          <div style="font-family:system-ui,sans-serif;padding:6px 2px;max-width:220px;">
            <div style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
              ${type === "activity" ? "Actividad" : "Guía"}
            </div>
            <div style="font-weight:800;color:#14342B;font-size:14px;line-height:1.3;margin-bottom:${item.subtitle ? "4px" : "10px"};">
              ${item.title}
            </div>
            ${item.subtitle ? `<div style="color:#6D7673;font-size:12px;margin-bottom:10px;">${item.subtitle}</div>` : ""}
            <div id="iw-nav-${type}-${item.id}"
              style="display:inline-block;background:#14342B;color:#fff;font-weight:700;font-size:12px;
                     padding:7px 14px;border-radius:8px;cursor:pointer;user-select:none;">
              Ver detalle →
            </div>
          </div>
        `,
      });

      gm.event.addListenerOnce(iw, "domready", () => {
        document.getElementById(`iw-nav-${type}-${item.id}`)
          ?.addEventListener("click", () => {
            router.push({
              pathname: "/detail",
              params: {
                id: item.id,
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
        infoWindowsRef.current.forEach((w) => w.close());
        iw.open(gMapRef.current, marker);
        setSelectedId(item.id);
        const el = document.getElementById(`map-card-${type}-${item.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      markersRef.current.set(`${type}-${item.id}`, marker);
      infoWindowsRef.current.set(`${type}-${item.id}`, iw);
    };

    activities.forEach((a) => {
      routesApi.getPoints(Number(a.id)).then((pts) => {
        if (!gMapRef.current) return;
        const sorted = [...pts].sort((x, y) => x.order - y.order);
        let markerItem = a;
        if (!a.coordinates && sorted.length > 0) {
          const lat = sorted.reduce((s, p) => s + p.lat, 0) / sorted.length;
          const lng = sorted.reduce((s, p) => s + p.lng, 0) / sorted.length;
          markerItem = { ...a, coordinates: { latitude: lat, longitude: lng } };
        }
        if (sorted.length > 0) {
          firstPointsRef.current.set(`activity-${a.id}`, { lat: sorted[0].lat, lng: sorted[0].lng });
        }
        addMarker(markerItem, "activity");
        if (sorted.length >= 2) {
          const poly = new gm.Polyline({
            path: sorted.map((p) => ({ lat: p.lat, lng: p.lng })),
            map: gMapRef.current,
            strokeColor: ACTIVITY_COLOR,
            strokeWeight: 3,
            strokeOpacity: 0.85,
          });
          polylinesRef.current.push(poly);
        }
      }).catch(() => { if (a.coordinates) addMarker(a, "activity"); });
    });

    guides.forEach((g) => addMarker(g, "guide"));

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      infoWindowsRef.current.forEach((iw) => iw.close());
      infoWindowsRef.current.clear();
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [activities, guides, scriptReady]);

  const handleCardPress = (
    item: { id: string; title: string; subtitle?: string; description?: string; image?: string; coordinates?: { latitude: number; longitude: number } },
    type: "activity" | "guide",
  ) => {
    setSelectedId(item.id);

    if (gMapRef.current) {
      const firstPt = firstPointsRef.current.get(`${type}-${item.id}`);
      const target = firstPt
        ?? (item.coordinates ? { lat: item.coordinates.latitude, lng: item.coordinates.longitude } : null);
      if (target) {
        gMapRef.current.panTo(target);
        gMapRef.current.setZoom(15);
      }
    }

    // Close any open info window, then open this item's after the pan settles
    infoWindowsRef.current.forEach((w) => w.close());
    const iw = infoWindowsRef.current.get(`${type}-${item.id}`);
    const marker = markersRef.current.get(`${type}-${item.id}`);
    if (iw && marker) {
      setTimeout(() => iw.open(gMapRef.current, marker), 350);
    }
  };

  const allItems = [
    ...activities.map((a) => ({ ...a, itemType: "activity" as const })),
    ...guides.map((g) => ({ ...g, itemType: "guide" as const })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (filter === "activity" && item.itemType !== "activity") return false;
    if (filter === "guide" && item.itemType !== "guide") return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Left panel: list ── */}
      <View style={styles.leftPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Explorar</Text>
          <Text style={styles.panelCount}>{filteredItems.length} resultados</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="#8A9490" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#8A9490"
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#8A9490" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(["all", "activity", "guide"] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f === "all" ? "Todas" : f === "activity" ? "Actividades" : "Guías"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Card grid */}
        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => (
            <Pressable
              key={`${item.itemType}-${item.id}`}
              nativeID={`map-card-${item.itemType}-${item.id}`}
              style={[styles.card, selectedId === item.id && styles.cardSelected]}
              onPress={() => handleCardPress(item, item.itemType)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardContent}>
                <Text style={[styles.cardType, item.itemType === "guide" && styles.cardTypeGuide]}>
                  {item.itemType === "activity" ? "Actividad" : "Guía"}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                ) : null}
              </View>
            </Pressable>
          ))}
          {filteredItems.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Sin resultados.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ── Right panel: map ── */}
      <View style={styles.rightPanel}>
        {!scriptReady && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#14342B" />
          </View>
        )}
        <View ref={mapContainerRef} style={styles.mapContainer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F6F5",
  },

  // ─── Left panel ──────────────────────────────────────────────────────────────
  leftPanel: {
    width: 460,
    borderRightWidth: 1,
    borderRightColor: "#E0E7E4",
    backgroundColor: "#F5F6F5",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 8,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#14342B",
  },
  panelCount: {
    fontSize: 13,
    color: "#8A9490",
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#14342B",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#E8EDEB",
  },
  filterChipActive: {
    backgroundColor: "#14342B",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#58716A",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#14342B",
  },
  cardImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#E8EDEB",
  },
  cardContent: {
    padding: 10,
    gap: 3,
  },
  cardType: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10A95A",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardTypeGuide: {
    color: "#D97706",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14342B",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6D7673",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#8A9490",
    fontSize: 14,
  },

  // ─── Right panel ─────────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    position: "relative",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "#F5F6F5",
  },
  mapContainer: {
    flex: 1,
  },
});
