import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { styles } from "./HomeScreen.styles";
import { Section } from "./components/section/Section";
import { useHomeData } from "@/src/context/HomeDataContext";
import { ActivityPreviewModal } from "./components/activityPreview/ActivityPreviewModal";

function filterItems(items: HomeItem[], query: string): HomeItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<HomeItem | null>(null);
  const { activities, guides, equipment, isLoading, error, refresh } = useHomeData();

  const filteredActivities = filterItems(activities, query);
  const filteredGuides = filterItems(guides, query);
  const filteredEquipment = filterItems(equipment, query);

  const hasResults =
    filteredActivities.length > 0 ||
    filteredGuides.length > 0 ||
    filteredEquipment.length > 0;

  const handleActivitySearchPress = (item: HomeItem) => {
    setPreviewItem(item);
  };

  const handlePreviewStart = (item: HomeItem) => {
    setPreviewItem(null);
    router.push({
      pathname: "/map",
      params: { startActivityId: item.id },
    });
  };

  const handlePreviewDetail = (item: HomeItem) => {
    setPreviewItem(null);
    router.push({
      pathname: "/detail",
      params: {
        id: item.id,
        type: "activity",
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        image: item.image,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#14342B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Text style={{ color: "#14342B", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        <Text
          style={{ color: "#14342B", fontWeight: "600", textDecorationLine: "underline" }}
          onPress={refresh}
        >
          Reintentar
        </Text>
      </SafeAreaView>
    );
  }

  const isSearchActive = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8A9490" />
          <TextInput
            placeholder="Buscar temática o recurso"
            placeholderTextColor="#8A9490"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Tips de supervivencia — entry banner */}
        {!isSearchActive && (
          <Pressable
            onPress={() => router.push("/tips")}
            style={{
              backgroundColor: "#14342B",
              borderRadius: 20,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 2,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-half-outline" size={22} color="#76E2B3" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                Tips de supervivencia
              </Text>
              <Text style={{ color: "#D7E9E2", fontSize: 12 }}>
                Primeros auxilios · Refugios · Agua · Orientación
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#76E2B3" />
          </Pressable>
        )}

        {!hasResults && isSearchActive ? (
          <Text style={styles.emptyText}>
            No se encontraron resultados para "{query}"
          </Text>
        ) : (
          <>
            {filteredActivities.length > 0 && (
              <Section
                title="Actividades cerca de vos"
                items={filteredActivities}
                type="activity"
                onItemPress={isSearchActive ? handleActivitySearchPress : undefined}
              />
            )}
            {filteredGuides.length > 0 && (
              <Section title="Guías" items={filteredGuides} type="guide" />
            )}
            {filteredEquipment.length > 0 && (
              <Section
                title="Equipamiento recomendado"
                items={filteredEquipment}
                type="equipment"
              />
            )}
          </>
        )}
      </ScrollView>

      <ActivityPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onStart={handlePreviewStart}
        onDetail={handlePreviewDetail}
      />
    </SafeAreaView>
  );
}
