import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import RouteMap from "@/src/components/RouteMap";
import { routesApi, type RouteDetailData, type RoutePoint } from "@/src/services/api";
import { styles } from "./ActivityPreviewModal.styles";

type Props = {
  item: HomeItem | null;
  onClose: () => void;
  onStart: (item: HomeItem) => void;
  onDetail: (item: HomeItem) => void;
};

function parseStats(subtitle: string): { distance: string; duration: string } {
  const match = subtitle.match(/^([\d.]+)\s*km\s*[·\-]\s*(\d+)\s*min/);
  if (match) return { distance: match[1], duration: match[2] };
  return { distance: "", duration: "" };
}

export function ActivityPreviewModal({ item, onClose, onStart, onDetail }: Props) {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [detail, setDetail] = useState<RouteDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setPoints([]);
      setDetail(null);
      return;
    }
    const id = Number(item.id);
    if (isNaN(id)) return;

    setLoading(true);
    Promise.allSettled([
      routesApi.getPoints(id),
      routesApi.getDetail(id),
    ]).then(([pointsResult, detailResult]) => {
      if (pointsResult.status === "fulfilled") setPoints(pointsResult.value);
      if (detailResult.status === "fulfilled") setDetail(detailResult.value);
    }).finally(() => setLoading(false));
  }, [item?.id]);

  if (!item) return null;

  const stats = parseStats(item.subtitle);
  const difficulty = detail?.difficulty?.nombre ?? null;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#14342B" />
          </Pressable>

          <Text style={styles.typeLabel}>Actividad</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

          <View style={styles.statsRow}>
            {stats.distance ? (
              <View style={styles.statItem}>
                <Ionicons name="navigate-outline" size={16} color="#10A95A" />
                <Text style={styles.statValue}>{stats.distance} km</Text>
              </View>
            ) : null}
            {stats.duration ? (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#10A95A" />
                <Text style={styles.statValue}>{stats.duration} min</Text>
              </View>
            ) : null}
            {difficulty ? (
              <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={16} color="#10A95A" />
                <Text style={styles.statValue}>{difficulty}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.mapContainer}>
            {loading ? (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator color="#14342B" />
                <Text style={styles.placeholderText}>Cargando recorrido...</Text>
              </View>
            ) : points.length > 0 ? (
              <RouteMap points={points} />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={32} color="#C5D4CE" />
                <Text style={styles.placeholderText}>Sin recorrido disponible</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.startButton} onPress={() => onStart(item)}>
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Iniciar</Text>
            </Pressable>
            <Pressable style={styles.detailButton} onPress={() => onDetail(item)}>
              <Text style={styles.detailButtonText}>Ver detalle</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
