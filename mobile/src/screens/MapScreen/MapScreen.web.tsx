import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, Text, View } from "react-native";
import { StyleSheet } from "react-native";

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Ionicons name="map-outline" size={52} color="#14342B" />
        </View>
        <Text style={styles.title}>Mapa disponible en la app móvil</Text>
        <Text style={styles.subtitle}>
          El mapa interactivo con actividades cercanas funciona en iOS y Android.
          Descargá la app para usarlo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E6F4EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#14342B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6D7673",
    textAlign: "center",
    lineHeight: 22,
  },
});
