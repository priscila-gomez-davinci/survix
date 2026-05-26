import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { styles } from "./MapScreen.style";
import { useHomeData } from "@/src/context/HomeDataContext";
import { routesApi } from "@/src/services/api";

const BUENOS_AIRES = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

type LocationStatus = "loading" | "granted" | "denied";

export default function MapScreen() {
  const router = useRouter();
  const { activities, guides } = useHomeData();

  const [region, setRegion] = useState(BUENOS_AIRES);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [routePolylines, setRoutePolylines] = useState<{ id: string; coords: { latitude: number; longitude: number }[] }[]>([]);
  const [syntheticMarkers, setSyntheticMarkers] = useState<typeof activities>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const inRegion = (coords: { latitude: number; longitude: number }) =>
    coords.latitude >= region.latitude - region.latitudeDelta / 2 &&
    coords.latitude <= region.latitude + region.latitudeDelta / 2 &&
    coords.longitude >= region.longitude - region.longitudeDelta / 2 &&
    coords.longitude <= region.longitude + region.longitudeDelta / 2;

  const visibleActivities = activities.filter((a) => a.coordinates && inRegion(a.coordinates!));
  const visibleSyntheticMarkers = syntheticMarkers.filter((m) => inRegion(m.coordinates!));
  const visibleGuides = guides.filter((g) => g.coordinates && inRegion(g.coordinates!));

  const handleCalloutPress = (item: typeof activities[number], type: "activity" | "guide") => {
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
                strokeColor="#14342B"
                strokeWidth={3}
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
            style={styles.bottomStrip}
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
      </View>
    </SafeAreaView>
  );
}
