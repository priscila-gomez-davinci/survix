import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { styles } from "./LoginScreen.style";

export default function LoginScreen() {
  const handleGoogleLogin = () => {
    Alert.alert("Google", "Login con Google pendiente de integracion.");
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
                style={styles.input}
              />

              <TextInput
                placeholder="Contrasena"
                placeholderTextColor="#7A7A7A"
                secureTextEntry
                style={styles.input}
              />

              <Link href="/home" asChild>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Iniciar sesion</Text>
                </Pressable>
              </Link>

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
