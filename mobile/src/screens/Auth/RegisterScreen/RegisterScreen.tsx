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
import { styles } from "./RegisterScreen.style";
import { useAuth } from "@/src/context/AuthContext";
import { ApiError } from "@/src/services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Faltan datos", "Completá todos los campos.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password);
      router.replace("/home");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 409) {
          Alert.alert("Error", "Ya existe una cuenta con ese correo.");
        } else {
          Alert.alert("Error", "No se pudo crear la cuenta. Intentá de nuevo.");
        }
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.brandSub}>Creá tu cuenta para empezar</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Registrate</Text>
              <Text style={styles.subtitle}>
                Unite a la comunidad y accedé a tus actividades
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

              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#7A7A7A"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
              />

              <Pressable
                style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                )}
              </Pressable>

              <Link href="/login" asChild>
                <Pressable>
                  <Text style={styles.linkText}>
                    ¿Ya tenés cuenta? Iniciá sesión
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
