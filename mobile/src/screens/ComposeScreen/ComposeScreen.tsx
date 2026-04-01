import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { usePostsContext } from "@/src/context/PostsContext";
import { styles } from "./ComposeScreen.styles";

type MessageType = "suggestion" | "question";

type MessageState = {
  title: string;
  body: string;
  category: string;
  urgent: boolean;
};

const initialState: MessageState = {
  title: "",
  body: "",
  category: "Supervivencia urbana",
  urgent: false,
};

export default function ComposeScreen() {
  const router = useRouter();
  const { addPost } = usePostsContext();
  const [messageType, setMessageType] = useState<MessageType>("suggestion");
  const [form, setForm] = useState<MessageState>(initialState);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const helperText = useMemo(() => {
    return messageType === "suggestion"
      ? "Comparte una mejora para la app o una idea de contenido util para la comunidad."
      : "Escribe una consulta sobre seguridad, equipo, refugio, agua o alimentacion.";
  }, [messageType]);

  const handleChange = (field: keyof MessageState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.body.trim()) {
      setSubmittedMessage("Completa un titulo y un mensaje antes de enviar.");
      return;
    }

    addPost({
      id: `post-${Date.now()}`,
      author: "Priscila Torres",
      role: messageType === "suggestion" ? "Sugerencia" : "Consulta",
      title: form.title.trim(),
      summary: form.body.trim(),
      category: form.category.trim() || "General",
      likes: 0,
      dislikes: 0,
      comments: [],
    });

    setForm(initialState);
    router.push("/blog");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Centro de mensajes</Text>
          <Text style={styles.heroTitle}>Crea una sugerencia o una consulta</Text>
          <Text style={styles.heroText}>{helperText}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tipo de mensaje</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.togglePill,
                messageType === "suggestion" && styles.togglePillActive,
              ]}
              onPress={() => setMessageType("suggestion")}
            >
              <Text
                style={[
                  styles.toggleText,
                  messageType === "suggestion" && styles.toggleTextActive,
                ]}
              >
                Sugerencia
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.togglePill,
                messageType === "question" && styles.togglePillActive,
              ]}
              onPress={() => setMessageType("question")}
            >
              <Text
                style={[
                  styles.toggleText,
                  messageType === "question" && styles.toggleTextActive,
                ]}
              >
                Consulta
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Titulo</Text>
            <TextInput
              value={form.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="Ej: Lista de items para una mochila urbana"
              placeholderTextColor="#8A9490"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria</Text>
            <TextInput
              value={form.category}
              onChangeText={(value) => handleChange("category", value)}
              placeholder="Categoria"
              placeholderTextColor="#8A9490"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mensaje</Text>
            <TextInput
              value={form.body}
              onChangeText={(value) => handleChange("body", value)}
              placeholder="Describe la sugerencia o consulta con el mayor contexto posible"
              placeholderTextColor="#8A9490"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.label}>Marcar como urgente</Text>
              <Text style={styles.switchHint}>
                Ideal para dudas relacionadas con clima, botiquin o seguridad inmediata.
              </Text>
            </View>

            <Switch
              value={form.urgent}
              onValueChange={(value) => handleChange("urgent", value)}
              trackColor={{ false: "#D4DBD8", true: "#6FDFC0" }}
              thumbColor={form.urgent ? "#14342B" : "#FFFFFF"}
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Enviar mensaje</Text>
          </Pressable>

          {submittedMessage ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>{submittedMessage}</Text>
            </View>
          ) : null}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
