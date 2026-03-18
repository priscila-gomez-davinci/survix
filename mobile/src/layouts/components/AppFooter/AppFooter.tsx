import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { styles } from "./AppFooter.styles";

export function AppFooter() {
  const router = useRouter();

  return (
    <View style={styles.bottomBar}>
      <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
        <Ionicons name="home" size={22} color="#14342B" />
      </Pressable>

      <Pressable style={styles.navItem} onPress={() => router.replace("/map")}>
        <Ionicons name="location-outline" size={22} color="#14342B" />
      </Pressable>

      <Pressable style={styles.navItem}>
        <Ionicons name="add-circle-outline" size={22} color="#14342B" />
      </Pressable>

      <Pressable style={styles.navItem}>
        <Ionicons name="hand-left-outline" size={22} color="#14342B" />
      </Pressable>

      <Pressable style={styles.navItem}>
        <Ionicons name="person-outline" size={22} color="#14342B" />
      </Pressable>
    </View>
  );
}