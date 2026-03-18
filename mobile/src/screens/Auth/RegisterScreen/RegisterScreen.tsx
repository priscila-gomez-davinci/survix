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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { styles } from "./RegisterScreen.style";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Faltan datos", "Completá todos los campos.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    Alert.alert("Registro simulado", "Cuenta creada correctamente.");
    router.replace("/login");
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
                placeholder="Nombre completo"
                placeholderTextColor="#7A7A7A"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.input}
              />

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

              <Pressable style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
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