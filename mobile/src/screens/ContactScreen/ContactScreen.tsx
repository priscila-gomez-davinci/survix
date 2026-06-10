import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/services/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { styles } from "./ContactScreen.styles";

type ContactForm = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

export default function ContactScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    nombre: "",
    email: user?.email ?? "",
    asunto: "",
    mensaje: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const isValid =
    form.nombre.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.asunto.trim().length > 0 &&
    form.mensaje.trim().length > 0;

  const handleSend = async () => {
    if (!isValid) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, "consultas"), {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        asunto: form.asunto.trim(),
        mensaje: form.mensaje.trim(),
        id_usuario: user?.id_usuario ?? null,
        fecha: serverTimestamp(),
      });
      setSent(true);
    } catch {
      Alert.alert("Error", "No se pudo enviar el mensaje. Intentá de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>¡Mensaje enviado!</Text>
          <Text style={styles.successText}>
            Recibimos tu consulta. Nos pondremos en contacto con vos a la brevedad.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Ionicons name="mail" size={28} color="#FFFFFF" />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Contacto</Text>
            <Text style={styles.heroSubtitle}>
              Escribinos con tu consulta o sugerencia.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={form.nombre}
              onChangeText={(v) => handleChange("nombre", v)}
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#8A9490"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Asunto</Text>
            <TextInput
              value={form.asunto}
              onChangeText={(v) => handleChange("asunto", v)}
              style={styles.input}
              placeholder="¿En qué podemos ayudarte?"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mensaje</Text>
            <TextInput
              value={form.mensaje}
              onChangeText={(v) => handleChange("mensaje", v)}
              style={styles.textArea}
              placeholder="Escribí tu mensaje aquí..."
              placeholderTextColor="#8A9490"
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[
              styles.submitButton,
              (!isValid || isSending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!isValid || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
