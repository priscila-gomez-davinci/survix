import { Image, SafeAreaView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./MapScreen.style";

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
        <Image
          source={{
            uri: "https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=1600&center=lonlat:-58.3816,-34.6037&zoom=12&apiKey=YOUR_API_KEY",
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#7A7A7A" />
          <TextInput
            placeholder="Buscar ubicación"
            placeholderTextColor="#7A7A7A"
            style={styles.input}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}