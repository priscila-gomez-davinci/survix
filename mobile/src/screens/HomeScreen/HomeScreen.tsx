import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { activities, equipment, guides } from "@/src/data/homeData";
import { styles } from "./HomeScreen.styles";
import { Section } from "./components/section/Section";

export default function HomeScreen() {
  const router = useRouter();

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
          />
        </View>

        <Section
          title="Actividades cerca de vos"
          items={activities}
          type="activity"
        />
        <Section title="GuÃ­as" items={guides} type="guide" />
        <Section
          title="Equipamiento recomendado"
          items={equipment}
          type="equipment"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
