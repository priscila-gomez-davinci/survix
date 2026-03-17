import { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Faltan datos", "Completá correo y contraseña.");
      return;
    }

    // Más adelante acá vas a conectar tu backend.
    Alert.alert("Login simulado", "Ingreso correcto.");
    // router.replace("/community");
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google", "Login con Google pendiente de integración.");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
      }}
      resizeMode="cover"
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.55)"]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardWrapper}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.topBrand}>
              <Text style={styles.brand}>SurvixApp</Text>
              <Text style={styles.brandSub}>Explorá, aprendé y preparate</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Iniciá sesión</Text>
              <Text style={styles.subtitle}>
                Accedé a la comunidad y a tus actividades
              </Text>

              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#7A7A7A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#7A7A7A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />

              <Pressable style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              </Pressable>

              <Pressable
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <Text style={styles.googleButtonText}>Seguir con Google</Text>
              </Pressable>

              <Link href="/register" asChild>
                <Pressable>
                  <Text style={styles.linkText}>
                    ¿No tenés cuenta? Registrate
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Survix App ©</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  topBrand: {
    width: "100%",
    alignItems: "flex-start",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  brandSub: {
    color: "#E6E6E6",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#14342B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#5E6A66",
    textAlign: "center",
    marginBottom: 22,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D9E0DD",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAF9",
    color: "#1C1C1C",
    marginBottom: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#103D34",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  googleButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  googleButtonText: {
    color: "#2457C5",
    fontSize: 15,
    fontWeight: "700",
  },
  linkText: {
    textAlign: "center",
    marginTop: 18,
    color: "#103D34",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    color: "#F2F2F2",
    fontSize: 12,
  },
});