import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { styles } from "./ListScreen.styles";
import { useHomeData } from "@/src/context/HomeDataContext";
import { useAuth } from "@/src/context/AuthContext";
import { routesApi } from "@/src/services/api";

const TITLE_BY_TYPE: Record<string, string> = {
  activity: "Actividades",
  guide: "Guías",
  equipment: "Equipamiento",
};

function parseSubtitleValues(subtitle: string) {
  const distMatch = subtitle.match(/([\d.]+)\s*km/);
  const durMatch = subtitle.match(/(\d+)\s*min/);
  return {
    distance: distMatch ? Number(distMatch[1]) : undefined,
    duration: durMatch ? Number(durMatch[1]) : undefined,
  };
}

export default function ListScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { activities, guides, equipment } = useHomeData();
  const { isAdmin, token } = useAuth();

  const [search, setSearch] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (type !== "activity" || !token) return;
    routesApi.listFavorites()
      .then((favs) => setFavoriteIds(new Set(favs.map((r) => String(r.id)))))
      .catch(() => {});
  }, [type, token]);

  const canCreate = isAdmin && Platform.OS === "web" && (type === "activity" || type === "guide");
  const isActivity = type === "activity";
  const showFilters = type === "activity" || type === "guide";
  const hasActiveFilters = Boolean(search || maxDistance || maxDuration);

  const DATA_BY_TYPE: Record<string, HomeItem[]> = {
    activity: activities,
    guide: guides,
    equipment,
  };

  const items = DATA_BY_TYPE[type] ?? [];
  const title = TITLE_BY_TYPE[type] ?? "Contenido";

  const filteredItems = items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (isActivity) {
      const { distance, duration } = parseSubtitleValues(item.subtitle ?? "");
      if (maxDistance && distance != null && distance > Number(maxDistance)) return false;
      if (maxDuration && duration != null && duration > Number(maxDuration)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setMaxDistance("");
    setMaxDuration("");
  };

  const handleFavoriteToggle = async (itemId: string) => {
    if (togglingId) return;
    setTogglingId(itemId);
    const isFav = favoriteIds.has(itemId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(itemId) : next.add(itemId);
      return next;
    });
    try {
      if (isFav) await routesApi.removeFavorite(Number(itemId));
      else await routesApi.addFavorite(Number(itemId));
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(itemId) : next.delete(itemId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleItemPress = (item: HomeItem) => {
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
        purchaseLinks: item.purchaseLinks
          ? JSON.stringify(item.purchaseLinks)
          : undefined,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#14342B" />
        </Pressable>
        <Text style={[styles.headerTitle, { flex: 1 }]}>{title}</Text>
        {showFilters && (
          <Pressable
            style={[styles.backButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setShowExtraFilters((v) => !v)}
          >
            <Ionicons
              name={hasActiveFilters ? "options" : "options-outline"}
              size={20}
              color={hasActiveFilters ? "#FFFFFF" : "#14342B"}
            />
          </Pressable>
        )}
        {canCreate && (
          <Pressable
            style={styles.backButton}
            onPress={() => router.push({ pathname: "/create", params: { type } })}
          >
            <Ionicons name="add" size={22} color="#14342B" />
          </Pressable>
        )}
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color="#8A9490" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Buscar ${title.toLowerCase()}...`}
              placeholderTextColor="#8A9490"
              style={styles.searchInput}
            />
            {search ? (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color="#8A9490" />
              </Pressable>
            ) : null}
          </View>

          {isActivity && showExtraFilters && (
            <View style={styles.extraFilters}>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Distancia máx (km)</Text>
                <TextInput
                  value={maxDistance}
                  onChangeText={setMaxDistance}
                  placeholder="Ej: 10"
                  placeholderTextColor="#8A9490"
                  style={styles.filterInput}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Duración máx (min)</Text>
                <TextInput
                  value={maxDuration}
                  onChangeText={setMaxDuration}
                  placeholder="Ej: 120"
                  placeholderTextColor="#8A9490"
                  style={styles.filterInput}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {hasActiveFilters && (
            <Pressable style={styles.clearRow} onPress={clearFilters}>
              <Ionicons name="close-circle-outline" size={14} color="#10A95A" />
              <Text style={styles.clearText}>Limpiar filtros</Text>
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={32} color="#8A9490" />
            </View>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "Ningún resultado coincide con los filtros aplicados."
                : "No hay contenido disponible aún."}
            </Text>
            {hasActiveFilters && (
              <Pressable style={styles.emptyButton} onPress={clearFilters}>
                <Text style={styles.emptyButtonText}>Limpiar filtros</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredItems.map((item) => (
            <Pressable key={item.id} style={styles.card} onPress={() => handleItemPress(item)}>
              <View style={styles.cardImageWrapper}>
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                {isActivity && token ? (
                  <Pressable
                    style={styles.favoriteButton}
                    onPress={() => handleFavoriteToggle(item.id)}
                    hitSlop={8}
                  >
                    {togglingId === item.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={favoriteIds.has(item.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={favoriteIds.has(item.id) ? "#FF4D6A" : "#FFFFFF"}
                      />
                    )}
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardType}>{title.slice(0, -1)}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
