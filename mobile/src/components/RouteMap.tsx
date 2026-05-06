import { View } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import type { RoutePoint } from "@/src/services/api";

type Props = {
  points: RoutePoint[];
};

export default function RouteMap({ points }: Props) {
  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.order - b.order);
  const coordinates = sorted.map((p) => ({ latitude: p.lat, longitude: p.lng }));

  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.006;

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + pad, pad),
    longitudeDelta: Math.max(maxLng - minLng + pad, pad),
  };

  return (
    <View style={{ width: "100%", height: 220, borderRadius: 16, overflow: "hidden", marginTop: 8 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Polyline coordinates={coordinates} strokeColor="#14342B" strokeWidth={3} />
      </MapView>
    </View>
  );
}
