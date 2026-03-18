import { useEffect } from "react";
import {
  ImageBackground,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { styles } from "./SplashScreen.style";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
      }}
      resizeMode="cover"
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.7)"]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.title}>SurvixApp</Text>
            <Text style={styles.subtitle}>Explorá, aprendé y preparate</Text>

            <View style={styles.loaderBlock}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Cargando experiencia...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}