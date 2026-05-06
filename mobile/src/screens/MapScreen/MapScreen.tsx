import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { styles } from "./MapScreen.style";
import { useHomeData } from "@/src/context/HomeDataContext";

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
            {visibleActivities.map((activity) => (
              <Marker
                key={`a-${activity.id}`}
                coordinate={activity.coordinates!}
                onCalloutPress={() => handleCalloutPress(activity, "activity")}
              >
                <View style={styles.markerPin}>
                  <Ionicons name="map-outline" size={14} color="#FFFFFF" />
                </View>
                <Callout style={styles.callout}>
                  <Text style={styles.calloutTitle}>{activity.title}</Text>
                  <Text style={styles.calloutSubtitle}>{activity.subtitle}</Text>
                  <Text style={styles.calloutAction}>Ver detalle →</Text>
                </Callout>
              </Marker>
            ))}

            {visibleGuides.map((guide) => (
              <Marker
                key={`g-${guide.id}`}
                coordinate={guide.coordinates!}
                onCalloutPress={() => handleCalloutPress(guide, "guide")}
              >
                <View style={[styles.markerPin, styles.markerPinGuide]}>
                  <Ionicons name="book-outline" size={14} color="#FFFFFF" />
                </View>
                <Callout style={styles.callout}>
                  <Text style={styles.calloutTitle}>{guide.title}</Text>
                  <Text style={styles.calloutSubtitle}>{guide.subtitle}</Text>
                  <Text style={styles.calloutAction}>Ver detalle →</Text>
                </Callout>
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

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#14342B" }]} />
            <Text style={styles.legendText}>Actividades</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#D97706" }]} />
            <Text style={styles.legendText}>Guías</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
