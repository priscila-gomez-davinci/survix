import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { activities, equipment, guides } from "@/src/data/homeData";
import { styles } from "./ListScreen.styles";

const DATA_BY_TYPE: Record<string, HomeItem[]> = {
  activity: activities,
  guide: guides,
  equipment: equipment,
};

const TITLE_BY_TYPE: Record<string, string> = {
  activity: "Actividades",
  guide: "Guías",
  equipment: "Equipamiento",
};

export default function ListScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  const items = DATA_BY_TYPE[type] ?? [];
  const title = TITLE_BY_TYPE[type] ?? "Contenido";

  const handleItemPress = (item: HomeItem) => {
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
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => handleItemPress(item)}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardType}>{title.slice(0, -1)}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A9490" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
