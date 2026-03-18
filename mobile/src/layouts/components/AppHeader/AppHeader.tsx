import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { styles } from "./AppHeader.styles";

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
        <Text style={styles.brandText}>SurvixApp</Text>
      </View>
    </View>
  );
}