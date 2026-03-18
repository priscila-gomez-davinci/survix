import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { styles } from "./DetailScreen.styles";

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: params.image }} style={styles.image} />

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.type}>
            {params.type === "activity"
              ? "Actividad"
              : params.type === "guide"
              ? "Guía"
              : "Equipamiento"}
          </Text>

          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.subtitle}>{params.subtitle}</Text>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{params.description}</Text>

          <Text style={styles.sectionTitle}>Más información</Text>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            aliquam, tortor eget dignissim congue, eros nibh varius nunc, sed
            tincidunt orci purus sed ipsum. Nulla facilisi. Pellentesque
            pharetra eros et lorem feugiat, a luctus enim efficitur.
          </Text>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Acción principal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}