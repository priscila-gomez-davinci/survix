import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { styles } from "./OfflineContentScreen.styles";
import { offlineService, type OfflineGuide, type OfflineMap } from "@/src/services/offlineService";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=60";

// ─── GuideCard ────────────────────────────────────────────────────────────────

function GuideCard({ guide, onView, onDelete }: {
  guide: OfflineGuide;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.guideCard}>
      <View style={styles.guideCardRow}>
        <Image
          source={{ uri: guide.image || PLACEHOLDER_IMAGE }}
          style={styles.guideThumb}
          resizeMode="cover"
        />
        <View style={styles.guideInfo}>
          <Text style={styles.guideTitle} numberOfLines={2}>{guide.title}</Text>
          <Text style={styles.guideMeta}>
            {guide.steps.length} paso{guide.steps.length !== 1 ? "s" : ""}
            {guide.duration != null ? ` · ${guide.duration} min` : ""}
          </Text>
          <Text style={styles.guideSavedAt}>Guardado {formatDate(guide.savedAt)}</Text>
        </View>
      </View>
      <View style={styles.guideActions}>
        <Pressable style={[styles.guideActionBtn, styles.guideActionBtnPrimary]} onPress={onView}>
          <Ionicons name="book-outline" size={14} color="#FFFFFF" />
          <Text style={[styles.guideActionText, styles.guideActionTextPrimary]}>Ver guía</Text>
        </Pressable>
        <View style={styles.guideActionDivider} />
        <Pressable style={[styles.guideActionBtn, styles.guideActionBtnSecondary]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color="#D93025" />
          <Text style={[styles.guideActionText, { color: "#D93025" }]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── MapCard ──────────────────────────────────────────────────────────────────

function MapCard({ map, onDelete }: { map: OfflineMap; onDelete: () => void }) {
  const { latitude, longitude } = map.region;
  return (
    <View style={styles.mapCard}>
      <View style={styles.mapIcon}>
        <Ionicons name="map-outline" size={26} color="#1A6B9A" />
      </View>
      <View style={styles.mapInfo}>
        <Text style={styles.mapLabel} numberOfLines={1}>{map.label}</Text>
        <Text style={styles.mapCoords}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={styles.mapSavedAt}>Guardado {formatDate(map.savedAt)}</Text>
      </View>
      <Pressable style={styles.mapDeleteBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color="#D93025" />
      </Pressable>
    </View>
  );
}

// ─── OfflineContentScreen ──────────────────────────────────────────────────────

export default function OfflineContentScreen() {
  const router = useRouter();
  const [guides, setGuides] = useState<OfflineGuide[]>([]);
  const [maps, setMaps] = useState<OfflineMap[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([offlineService.getGuides(), offlineService.getMaps()])
        .then(([g, m]) => {
          setGuides(g.sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
          setMaps(m.sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const handleDeleteGuide = (id: number, title: string) => {
    Alert.alert(
      "Eliminar guía offline",
      `¿Eliminar "${title}" de tu contenido descargado?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await offlineService.removeGuide(id);
            setGuides((prev) => prev.filter((g) => g.id !== id));
          },
        },
      ]
    );
  };

  const handleDeleteMap = (id: string, label: string) => {
    Alert.alert(
      "Eliminar mapa offline",
      `¿Eliminar el área "${label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await offlineService.removeMap(id);
            setMaps((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const handleViewGuide = (guide: OfflineGuide) => {
    router.push({
      pathname: "/guide-detail",
      params: {
        id: String(guide.id),
        title: guide.title,
        subtitle: guide.duration != null ? `${guide.duration} min` : "",
        description: guide.description ?? "",
        image: guide.image,
        offline: "true",
      },
    });
  };

  const totalItems = guides.length + maps.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#14342B" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Contenido descargado</Text>
          <Text style={styles.headerSub}>
            {loading ? "Cargando…" : totalItems === 0 ? "Sin contenido guardado" : `${totalItems} elemento${totalItems !== 1 ? "s" : ""} disponible${totalItems !== 1 ? "s" : ""} sin conexión`}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#14342B" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#14342B" />
            <Text style={styles.infoBannerText}>
              Este contenido está disponible aunque no tengas conexión a internet.
            </Text>
          </View>

          {/* Guides section */}
          <Text style={styles.sectionLabel}>Guías descargadas</Text>
          {guides.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="book-outline" size={28} color="#C5D4CE" />
              <Text style={styles.emptyTitle}>Sin guías descargadas</Text>
              <Text style={styles.emptyText}>
                Abrí una guía y pulsá "Descargar para offline" para tenerla disponible sin internet.
              </Text>
            </View>
          ) : (
            guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onView={() => handleViewGuide(guide)}
                onDelete={() => handleDeleteGuide(guide.id, guide.title)}
              />
            ))
          )}

          {/* Maps section */}
          <Text style={styles.sectionLabel}>Mapas guardados</Text>
          {maps.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="map-outline" size={28} color="#C5D4CE" />
              <Text style={styles.emptyTitle}>Sin mapas guardados</Text>
              <Text style={styles.emptyText}>
                Abrí el mapa y pulsá "Descargar área" para guardar una zona para usar sin internet.
              </Text>
            </View>
          ) : (
            maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onDelete={() => handleDeleteMap(map.id, map.label)}
              />
            ))
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
