import { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { styles } from "./LoginScreen.style";
import { useAuth } from "@/src/context/AuthContext";
import { ApiError } from "@/src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Faltan datos", "Completá el correo y la contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/home");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 400) {
          Alert.alert("Error", "Correo o contraseña incorrectos.");
        } else {
          Alert.alert("Error", "No se pudo conectar al servidor. Intentá de nuevo.");
        }
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.brandSub}>Explora, aprende y preparate</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Inicia sesion</Text>
              <Text style={styles.subtitle}>
                Accede a la comunidad y a tus actividades
              </Text>

              <TextInput
                placeholder="Correo electronico"
                placeholderTextColor="#7A7A7A"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />

              <TextInput
                placeholder="Contrasena"
                placeholderTextColor="#7A7A7A"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />

              <Pressable
                style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Iniciar sesion</Text>
                )}
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
                    No tenes cuenta? Registrate
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Survix App</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
