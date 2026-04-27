import { useEffect, useState } from "react";
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
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { styles } from "./RegisterScreen.style";
import { useAuth } from "@/src/context/AuthContext";
import { ApiError } from "@/src/services/api";

WebBrowser.maybeCompleteAuthSession();

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

function validate(email: string, password: string, confirmPassword: string): Errors {
  const errors: Errors = {};

  if (!email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Ingresá un correo válido.";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < 8) {
    errors.password = "Mínimo 8 caracteres.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirmá tu contraseña.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // ─── Google auth session ──────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const token = response.authentication?.accessToken;
    if (!token) return;

    setGoogleLoading(true);
    fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (info: { id: string; email: string }) => {
        await loginWithGoogle(info.id, info.email);
        router.replace("/home");
      })
      .catch(() => {
        setErrors({ general: "No se pudo completar el registro con Google." });
      })
      .finally(() => setGoogleLoading(false));
  }, [response]);

  // ─── Email register ───────────────────────────────────────────────────────
  const handleRegister = async () => {
    const validationErrors = validate(email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(email.trim(), password);
      router.replace("/home");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 409) {
          setErrors({ email: "Ya existe una cuenta con ese correo." });
        } else {
          setErrors({ general: "No se pudo crear la cuenta. Intentá de nuevo." });
        }
      } else {
        setErrors({ general: "Ocurrió un error inesperado." });
      }
    } finally {
      setLoading(false);
    }
  };

  const anyLoading = loading || googleLoading;

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

              {/* Correo */}
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#7A7A7A"
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, errors.email ? styles.inputError : null]}
                editable={!anyLoading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              {/* Contraseña */}
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#7A7A7A"
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry
                style={[styles.input, errors.password ? styles.inputError : null]}
                editable={!anyLoading}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {/* Confirmar contraseña */}
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#7A7A7A"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
                secureTextEntry
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                editable={!anyLoading}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

              {/* Error general */}
              {errors.general ? (
                <Text style={[styles.errorText, { textAlign: "center", marginBottom: 4 }]}>
                  {errors.general}
                </Text>
              ) : null}

              {/* Botón crear cuenta */}
              <Pressable
                style={[styles.primaryButton, anyLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={anyLoading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                }
              </Pressable>

              {/* Botón Google */}
              <Pressable
                style={[
                  styles.googleButton,
                  (!googleClientId || !request || anyLoading) && { opacity: 0.5 },
                ]}
                onPress={() => promptAsync()}
                disabled={!googleClientId || !request || anyLoading}
              >
                {googleLoading
                  ? <ActivityIndicator color="#2457C5" />
                  : <Text style={styles.googleButtonText}>Registrarse con Google</Text>
                }
              </Pressable>

              {!googleClientId && (
                <Text style={[styles.errorText, { textAlign: "center" }]}>
                  Google auth no configurado (falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)
                </Text>
              )}

              <Link href="/login" asChild>
                <Pressable disabled={anyLoading}>
                  <Text style={styles.linkText}>¿Ya tenés cuenta? Iniciá sesión</Text>
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
