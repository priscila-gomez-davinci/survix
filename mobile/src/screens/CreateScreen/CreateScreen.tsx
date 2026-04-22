import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { routesApi, guidesApi, ApiError } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles } from "./CreateScreen.styles";

// ─── Guide form ───────────────────────────────────────────────────────────────

function GuideForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useHomeData();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idNivel, setIdNivel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio.");
      return;
    }
    const duracionNum = Number(duracion);
    const catNum = Number(idCategoria);
    const nivelNum = Number(idNivel);
    if (!duracion || isNaN(duracionNum) || duracionNum <= 0) {
      Alert.alert("Error", "Ingresá una duración válida (en minutos).");
      return;
    }
    if (!idCategoria || isNaN(catNum)) {
      Alert.alert("Error", "Ingresá el ID de categoría.");
      return;
    }
    if (!idNivel || isNaN(nivelNum)) {
      Alert.alert("Error", "Ingresá el ID de nivel de complejidad.");
      return;
    }

    setLoading(true);
    try {
      await guidesApi.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        duracion_min: duracionNum,
        id_categoria_guias: catNum,
        id_nivel_complejidad: nivelNum,
      });
      refresh();
      onSuccess();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof ApiError
          ? error.message
          : "No se pudo crear la guía. Intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          style={styles.input}
          placeholder="Nombre de la guía"
          placeholderTextColor="#8A9490"
          maxLength={45}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.textArea}
          placeholder="Descripción de la guía"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Duración (min) *</Text>
          <TextInput
            value={duracion}
            onChangeText={setDuracion}
            style={styles.input}
            placeholder="60"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>ID Categoría *</Text>
          <TextInput
            value={idCategoria}
            onChangeText={setIdCategoria}
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>ID Nivel *</Text>
          <TextInput
            value={idNivel}
            onChangeText={setIdNivel}
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Pressable
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitButtonText}>Crear guía</Text>
        }
      </Pressable>
    </View>
  );
}

// ─── Route form ───────────────────────────────────────────────────────────────

function RouteForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useHomeData();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [distancia, setDistancia] = useState("");
  const [duracion, setDuracion] = useState("");
  const [idActividad, setIdActividad] = useState("");
  const [idDificultad, setIdDificultad] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return;
    }
    const distNum = Number(distancia);
    const durNum = Number(duracion);
    const actNum = Number(idActividad);
    const difNum = Number(idDificultad);
    const ubNum = Number(idUbicacion);

    if (!distancia || isNaN(distNum) || distNum <= 0) {
      Alert.alert("Error", "Ingresá una distancia válida (en km).");
      return;
    }
    if (!duracion || isNaN(durNum) || durNum <= 0) {
      Alert.alert("Error", "Ingresá una duración válida (en minutos).");
      return;
    }
    if (!idActividad || isNaN(actNum)) {
      Alert.alert("Error", "Ingresá el ID de actividad.");
      return;
    }
    if (!idDificultad || isNaN(difNum)) {
      Alert.alert("Error", "Ingresá el ID de dificultad.");
      return;
    }
    if (!idUbicacion || isNaN(ubNum)) {
      Alert.alert("Error", "Ingresá el ID de ubicación.");
      return;
    }

    setLoading(true);
    try {
      await routesApi.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        distancia_km: distNum,
        duracion_min: durNum,
        id_actividad: actNum,
        id_dificultad: difNum,
        id_ubicacion: ubNum,
      });
      refresh();
      onSuccess();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof ApiError
          ? error.message
          : "No se pudo crear la ruta. Intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          placeholder="Nombre de la ruta"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.textArea}
          placeholder="Descripción de la ruta"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Distancia (km) *</Text>
          <TextInput
            value={distancia}
            onChangeText={setDistancia}
            style={styles.input}
            placeholder="5.5"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Duración (min) *</Text>
          <TextInput
            value={duracion}
            onChangeText={setDuracion}
            style={styles.input}
            placeholder="90"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>ID Actividad *</Text>
          <TextInput
            value={idActividad}
            onChangeText={setIdActividad}
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>ID Dificultad *</Text>
          <TextInput
            value={idDificultad}
            onChangeText={setIdDificultad}
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>ID Ubicación *</Text>
        <TextInput
          value={idUbicacion}
          onChangeText={setIdUbicacion}
          style={styles.input}
          placeholder="1"
          placeholderTextColor="#8A9490"
          keyboardType="numeric"
        />
      </View>

      <Pressable
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitButtonText}>Crear ruta</Text>
        }
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CreateScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  const isGuide = type === "guide";
  const title = isGuide ? "Nueva guía" : "Nueva ruta";

  const handleSuccess = () => {
    Alert.alert("Listo", `${isGuide ? "Guía" : "Ruta"} creada correctamente.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#14342B" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isGuide ? (
          <GuideForm onSuccess={handleSuccess} />
        ) : (
          <RouteForm onSuccess={handleSuccess} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
