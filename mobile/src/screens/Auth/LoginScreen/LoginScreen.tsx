import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { firebaseAuth } from "@/src/services/firebase";
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
import { styles } from "./LoginScreen.style";
import { useAuth } from "@/src/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  email?: string;
  password?: string;
  general?: string;
};

function validate(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Ingresá un correo válido.";
  }
  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  }
  return errors;
}

function mapFirebaseError(error: FirebaseError): Errors {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return { general: "Correo o contraseña incorrectos." };
    case "auth/invalid-email":
      return { email: "Correo inválido." };
    case "auth/user-disabled":
      return { general: "Esta cuenta fue deshabilitada." };
    case "auth/too-many-requests":
      return { general: "Demasiados intentos. Intentá más tarde." };
    default:
      return { general: "No se pudo iniciar sesión. Intentá de nuevo." };
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { idToken, accessToken } = response.authentication ?? {};
    if (!accessToken) return;

    setGoogleLoading(true);
    (async () => {
      try {
        if (idToken) {
          // Sign into Firebase with the Google credential to get a real Firebase UID
          const credential = GoogleAuthProvider.credential(idToken, accessToken);
          const { user } = await signInWithCredential(firebaseAuth, credential);
          await loginWithGoogle(user.uid, user.email ?? "");
        } else {
          // Fallback: fetch Google user info manually
          const info = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }).then((r) => r.json()) as { id: string; email: string };
          await loginWithGoogle(info.id, info.email);
        }
        router.replace("/home");
      } catch {
        setErrors({ general: "No se pudo iniciar sesión con Google." });
      } finally {
        setGoogleLoading(false);
      }
    })();
  }, [response]);

  // ─── Email login ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/home");
    } catch (error) {
      setErrors(
        error instanceof FirebaseError
          ? mapFirebaseError(error)
          : { general: "Ocurrió un error inesperado." },
      );
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
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, general: undefined })); }}
                style={[styles.input, errors.email ? styles.inputError : null]}
                editable={!anyLoading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <TextInput
                placeholder="Contrasena"
                placeholderTextColor="#7A7A7A"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, general: undefined })); }}
                style={[styles.input, errors.password ? styles.inputError : null]}
                editable={!anyLoading}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {errors.general ? (
                <Text style={[styles.errorText, { textAlign: "center", marginBottom: 4 }]}>
                  {errors.general}
                </Text>
              ) : null}

              <Pressable
                style={[styles.primaryButton, anyLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={anyLoading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryButtonText}>Iniciar sesion</Text>
                }
              </Pressable>

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
                  : <Text style={styles.googleButtonText}>Seguir con Google</Text>
                }
              </Pressable>

              {!googleClientId && (
                <Text style={[styles.errorText, { textAlign: "center" }]}>
                  Google auth no configurado (falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)
                </Text>
              )}

              <Link href="/register" asChild>
                <Pressable disabled={anyLoading}>
                  <Text style={styles.linkText}>No tenes cuenta? Registrate</Text>
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
