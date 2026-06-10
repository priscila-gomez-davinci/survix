import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/src/services/firebase";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { useRouter } from "expo-router";
import { styles } from "./ForgotPasswordScreen.styles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setEmailError("El correo es obligatorio.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Ingresá un correo válido.");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch {
    } finally {
      setLoading(false);
      setSent(true);
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
              <Text style={styles.brandSub}>Recuperá el acceso a tu cuenta</Text>
            </View>

            <View style={styles.card}>
              {sent ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successIcon}>✉️</Text>
                  <Text style={styles.title}>Revisá tu correo</Text>
                  <Text style={styles.subtitle}>
                    Si tu dirección está registrada con Google, recibirás un enlace para
                    restablecer tu contraseña en los próximos minutos.
                  </Text>
                  <Pressable style={styles.primaryButton} onPress={() => router.replace("/login")}>
                    <Text style={styles.primaryButtonText}>Volver al inicio de sesión</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={styles.title}>Recuperar contraseña</Text>
                  <Text style={styles.subtitle}>
                    Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </Text>

                  <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#7A7A7A"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                    style={[styles.input, emailError ? styles.inputError : null]}
                    editable={!loading}
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                  <Pressable
                    style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                    onPress={handleSend}
                    disabled={loading}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.primaryButtonText}>Enviar enlace</Text>
                    }
                  </Pressable>

                  <Pressable onPress={() => router.back()} disabled={loading}>
                    <Text style={styles.linkText}>Volver al inicio de sesión</Text>
                  </Pressable>
                </>
              )}
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
