import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { activities, equipment, guides } from "@/src/data/homeData";
import { styles } from "./HomeScreen.styles";
import { Section } from "./components/section/Section";

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
  const [query, setQuery] = useState("");

  const filteredActivities = filterItems(activities, query);
  const filteredGuides = filterItems(guides, query);
  const filteredEquipment = filterItems(equipment, query);

  const hasResults =
    filteredActivities.length > 0 ||
    filteredGuides.length > 0 ||
    filteredEquipment.length > 0;

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
