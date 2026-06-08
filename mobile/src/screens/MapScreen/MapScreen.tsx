import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { styles } from "./MapScreen.style";
import { useHomeData } from "@/src/context/HomeDataContext";
import { routesApi } from "@/src/services/api";
import { offlineService } from "@/src/services/offlineService";

const BUENOS_AIRES = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

type LocationStatus = "loading" | "granted" | "denied";

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ startActivityId?: string }>();
  const { activities, guides } = useHomeData();

  const [region, setRegion] = useState(BUENOS_AIRES);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [routePolylines, setRoutePolylines] = useState<{ id: string; coords: { latitude: number; longitude: number }[] }[]>([]);
  const [syntheticMarkers, setSyntheticMarkers] = useState<typeof activities>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [mapSaved, setMapSaved] = useState(false);

  const mapRef = useRef<MapView>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (activities.length === 0) return;
    Promise.allSettled(
      activities.map(async (a) => ({ item: a, pts: await routesApi.getPoints(Number(a.id)) }))
    ).then((results) => {
      const fulfilled = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<{ item: typeof activities[0]; pts: { lat: number; lng: number; order: number }[] }>).value);

      const lines = fulfilled
        .filter((r) => r.pts.length >= 2)
        .map((r) => ({
          id: r.item.id,
          coords: [...r.pts].sort((a, b) => a.order - b.order).map((p) => ({ latitude: p.lat, longitude: p.lng })),
        }));
      setRoutePolylines(lines);

      const synth = fulfilled
        .filter((r) => !r.item.coordinates && r.pts.length > 0)
        .map((r) => {
          const sorted = [...r.pts].sort((a, b) => a.order - b.order);
          const centerLat = sorted.reduce((s, p) => s + p.lat, 0) / sorted.length;
          const centerLng = sorted.reduce((s, p) => s + p.lng, 0) / sorted.length;
          return { ...r.item, coordinates: { latitude: centerLat, longitude: centerLng } };
        });
      setSyntheticMarkers(synth);
    });
  }, [activities]);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (status !== "granted") {
        setLocationStatus("denied");
        return;
      }

      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000),
      );

      const position = await Promise.race([
        Location.getLastKnownPositionAsync().catch(() => null),
        timeout,
      ]) ?? await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);

      if (position) {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.18,
          longitudeDelta: 0.18,
        });
      }
      setLocationStatus("granted");
    });
  }, []);

  useEffect(() => {
    const paramId = params.startActivityId;
    if (!paramId || activeActivityId || routePolylines.length === 0) return;
    void startNavigation(paramId);
  }, [params.startActivityId, routePolylines.length]);

  useEffect(() => {
    return () => {
      locationWatchRef.current?.remove();
    };
  }, []);

  const startNavigation = async (activityId: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationStatus("denied");
      Alert.alert(
        "Ubicación requerida",
        "Activá el acceso a la ubicación para iniciar la actividad."
      );
      return;
    }
    setLocationStatus("granted");

    locationWatchRef.current?.remove();
    locationWatchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 10 },
      () => {},
    );

    setActiveActivityId(activityId);
    setSelectedId(activityId);

    const polyline = routePolylines.find(p => p.id === activityId);
    if (polyline && polyline.coords.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(polyline.coords, {
          edgePadding: { top: 100, right: 40, bottom: 250, left: 40 },
          animated: true,
        });
      }, 300);
    }
  };

  // Testea esto Lucas
  const stopNavigation = () => {
    locationWatchRef.current?.remove();
    locationWatchRef.current = null;
    setActiveActivityId(null);
  };

  const inRegion = (coords: { latitude: number; longitude: number }) =>
    coords.latitude >= region.latitude - region.latitudeDelta / 2 &&
    coords.latitude <= region.latitude + region.latitudeDelta / 2 &&
    coords.longitude >= region.longitude - region.longitudeDelta / 2 &&
    coords.longitude <= region.longitude + region.longitudeDelta / 2;

  const visibleActivities = activities.filter((a) => a.coordinates && inRegion(a.coordinates!));
  const visibleSyntheticMarkers = syntheticMarkers.filter((m) => inRegion(m.coordinates!));
  const visibleGuides = guides.filter((g) => g.coordinates && inRegion(g.coordinates!));

  const handleCalloutPress = (item: typeof activities[number], type: "activity" | "guide") => {
    if (type === "guide") {
      router.push({
        pathname: "/guide-detail",
        params: {
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          description: item.description ?? "",
          image: item.image,
        },
      });
      return;
    }
    router.push({
      pathname: "/detail",
      params: {
        id: item.id,
        type,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        image: item.image,
      },
    });
  };

  const handleDownloadMap = () => {
    Alert.alert(
      "Descargar área del mapa",
      `¿Guardar esta zona para usar sin internet?\n\nCentro: ${region.latitude.toFixed(3)}, ${region.longitude.toFixed(3)}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descargar",
          onPress: async () => {
            const label = `Zona ${new Date().toLocaleDateString("es-AR")}`;
            await offlineService.saveMap({
              id: `map_${Date.now()}`,
              label,
              region,
              savedAt: new Date().toISOString(),
            });
            setMapSaved(true);
            setTimeout(() => setMapSaved(false), 3000);
          },
        },
      ]
    );
  };

  const activeActivity = activeActivityId
    ? [...activities, ...syntheticMarkers].find(a => a.id === activeActivityId)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
        {locationStatus === "loading" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14342B" />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {routePolylines.map((poly) => (
              <Polyline
                key={`poly-${poly.id}`}
                coordinates={poly.coords}
                strokeColor={activeActivityId === poly.id ? "#10A95A" : "#14342B"}
                strokeWidth={activeActivityId === poly.id ? 5 : 3}
              />
            ))}

            {[...visibleActivities, ...visibleSyntheticMarkers].map((activity) => (
              <Marker
                key={`a-${activity.id}`}
                coordinate={activity.coordinates!}
                tracksViewChanges={false}
                onPress={() => setSelectedId(activity.id === selectedId ? null : activity.id)}
              >
                <Pressable
                  style={[styles.markerLabel, selectedId === activity.id && styles.markerLabelSelected]}
                  onPress={() => handleCalloutPress(activity, "activity")}
                >
                  <Text
                    style={[styles.markerLabelText, selectedId === activity.id && styles.markerLabelTextSelected]}
                    numberOfLines={1}
                  >
                    {activity.title}
                  </Text>
                </Pressable>
              </Marker>
            ))}

            {visibleGuides.map((guide) => (
              <Marker
                key={`g-${guide.id}`}
                coordinate={guide.coordinates!}
                tracksViewChanges={false}
                onPress={() => setSelectedId(guide.id === selectedId ? null : guide.id)}
              >
                <Pressable
                  style={[styles.markerLabel, styles.markerLabelGuide, selectedId === guide.id && styles.markerLabelGuideSelected]}
                  onPress={() => handleCalloutPress(guide, "guide")}
                >
                  <Text
                    style={[styles.markerLabelText, selectedId === guide.id && styles.markerLabelTextSelected]}
                    numberOfLines={1}
                  >
                    {guide.title}
                  </Text>
                </Pressable>
              </Marker>
            ))}
          </MapView>
        )}

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#7A7A7A" />
          <TextInput
            placeholder="Buscar ubicación"
            placeholderTextColor="#7A7A7A"
            style={styles.input}
          />
        </View>

        {locationStatus === "denied" && (
          <View style={styles.permissionBanner}>
            <Ionicons name="location-outline" size={15} color="#7A5200" />
            <Text style={styles.permissionText}>
              Mostrando Buenos Aires. Activá la ubicación para ver actividades cerca tuyo.
            </Text>
          </View>
        )}

        {([...visibleActivities, ...visibleSyntheticMarkers, ...visibleGuides].length > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.bottomStrip, activeActivityId ? { bottom: 64 } : {}]}
            contentContainerStyle={styles.bottomStripContent}
          >
            {[...visibleActivities, ...visibleSyntheticMarkers].map((item) => (
              <Pressable
                key={`card-a-${item.id}`}
                style={styles.bottomCard}
                onPress={() => handleCalloutPress(item, "activity")}
              >
                <Image source={{ uri: item.image }} style={styles.bottomCardImage} resizeMode="cover" />
                <View style={styles.bottomCardContent}>
                  <Text style={styles.bottomCardType}>Actividad</Text>
                  <Text style={styles.bottomCardTitle} numberOfLines={1}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.bottomCardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  ) : null}
                  <Pressable
                    style={[
                      styles.startButton,
                      activeActivityId === item.id && styles.startButtonActive,
                    ]}
                    onPress={() => {
                      if (activeActivityId === item.id) {
                        stopNavigation();
                      } else {
                        void startNavigation(item.id);
                      }
                    }}
                  >
                    <Ionicons
                      name={activeActivityId === item.id ? "stop-circle-outline" : "navigate-outline"}
                      size={13}
                      color="#FFFFFF"
                    />
                    <Text style={styles.startButtonText}>
                      {activeActivityId === item.id ? "Detener" : "Iniciar"}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
            {visibleGuides.map((item) => (
              <Pressable
                key={`card-g-${item.id}`}
                style={styles.bottomCard}
                onPress={() => handleCalloutPress(item, "guide")}
              >
                <Image source={{ uri: item.image }} style={styles.bottomCardImage} resizeMode="cover" />
                <View style={styles.bottomCardContent}>
                  <Text style={styles.bottomCardType}>Guía</Text>
                  <Text style={styles.bottomCardTitle} numberOfLines={1}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.bottomCardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {activeActivityId && (
          <View style={styles.navBanner}>
            <Ionicons name="navigate" size={16} color="#FFFFFF" />
            <Text style={styles.navBannerText} numberOfLines={1}>
              {activeActivity?.title ?? "Navegando..."}
            </Text>
            <Pressable style={styles.stopButton} onPress={stopNavigation}>
              <Text style={styles.stopButtonText}>Detener</Text>
            </Pressable>
          </View>
        )}

        {/* Download area FAB */}
        <Pressable
          style={{
            position: "absolute",
            top: 70,
            right: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: mapSaved ? "#10A95A" : "#14342B",
            borderRadius: 22,
            paddingHorizontal: 14,
            paddingVertical: 9,
            shadowColor: "#000",
            shadowOpacity: 0.22,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={handleDownloadMap}
        >
          <Ionicons
            name={mapSaved ? "checkmark-circle" : "download-outline"}
            size={16}
            color="#FFFFFF"
          />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
            {mapSaved ? "Guardado" : "Descargar área"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
