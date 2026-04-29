import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import { useAuth } from "@/src/context/AuthContext";

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

const ADMIN_ACTIONS = [
  {
    type: "activity" as const,
    label: "Nueva ruta",
    sub: "Agregar actividad al mapa",
    icon: "map" as const,
    color: "#14342B",
  },
  {
    type: "guide" as const,
    label: "Nueva guía",
    sub: "Publicar guía de contenido",
    icon: "book" as const,
    color: "#18B678",
  },
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { activities, guides, equipment, isLoading, error, refresh } = useHomeData();
  const { isAdmin } = useAuth();

  const filteredActivities = filterItems(activities, query);
  const filteredGuides = filterItems(guides, query);
  const filteredEquipment = filterItems(equipment, query);

  const hasResults =
    filteredActivities.length > 0 ||
    filteredGuides.length > 0 ||
    filteredEquipment.length > 0;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isAdmin && Platform.OS === "web" && (
          <View style={styles.adminPanel}>
            <View style={styles.adminPanelHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#14342B" />
              <Text style={styles.adminPanelTitle}>Gestión de contenido</Text>
            </View>
            <View style={styles.adminActions}>
              {ADMIN_ACTIONS.map((action) => (
                <Pressable
                  key={action.type}
                  style={styles.adminAction}
                  onPress={() =>
                    router.push({ pathname: "/create", params: { type: action.type } })
                  }
                >
                  <View style={[styles.adminActionIcon, { backgroundColor: action.color }]}>
                    <Ionicons name={action.icon} size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminActionCopy}>
                    <Text style={styles.adminActionLabel}>{action.label}</Text>
                    <Text style={styles.adminActionSub}>{action.sub}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={20} color="#8A9490" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

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

        {!hasResults && query.trim().length > 0 ? (
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
    </SafeAreaView>
  );
}
