import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { routesApi, guidesApi, ApiError, uploadImage } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { useAuth } from "@/src/context/AuthContext";
import { styles } from "./CreateScreen.styles";

// ─── Web image picker ─────────────────────────────────────────────────────────

function useWebImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickImage = () => {
    if (!inputRef.current) {
      const el = document.createElement("input");
      el.type = "file";
      el.accept = "image/jpeg,image/png,image/webp,image/gif";
      el.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        setImageFile(file);
        setImageUri(URL.createObjectURL(file));
      };
      inputRef.current = el;
    }
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const uploadPicked = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      return await uploadImage(imageFile);
    } finally {
      setUploading(false);
    }
  };

  return { imageUri, imageFile, uploading, pickImage, uploadPicked };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

function Field({
  label,
  children,
  error,
  style,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  style?: object;
}) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      <FieldError message={error} />
    </View>
  );
}

// ─── Guide form ───────────────────────────────────────────────────────────────

type GuideErrors = {
  titulo?: string;
  duracion?: string;
  idCategoria?: string;
  idNivel?: string;
  general?: string;
};

function GuideForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useHomeData();
  const { imageUri, imageFile, uploading, pickImage, uploadPicked } = useWebImagePicker();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idNivel, setIdNivel] = useState("");
  const [errors, setErrors] = useState<GuideErrors>({});
  const [loading, setLoading] = useState(false);

  const clearField = (field: keyof GuideErrors) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  const validate = (): GuideErrors => {
    const e: GuideErrors = {};
    if (!titulo.trim()) e.titulo = "El título es obligatorio.";
    const dur = Number(duracion);
    if (!duracion || isNaN(dur) || dur <= 0) e.duracion = "Ingresá una duración válida (min).";
    const cat = Number(idCategoria);
    if (!idCategoria || isNaN(cat)) e.idCategoria = "Ingresá el ID de categoría.";
    const niv = Number(idNivel);
    if (!idNivel || isNaN(niv)) e.idNivel = "Ingresá el ID de nivel de complejidad.";
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      let uploadedUrl: string | null = null;
      if (imageFile) {
        uploadedUrl = await uploadPicked();
      }

      const guide = await guidesApi.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        duracion_min: Number(duracion),
        id_categoria_guias: Number(idCategoria),
        id_nivel_complejidad: Number(idNivel),
      });

      if (uploadedUrl) {
        await guidesApi.addImage(guide.id, uploadedUrl).catch(() => {});
      }

      refresh();
      onSuccess();
    } catch (error) {
      setErrors({
        general: error instanceof ApiError
          ? error.message
          : "No se pudo crear la guía. Intentá de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Field label="Título *" error={errors.titulo}>
        <TextInput
          value={titulo}
          onChangeText={(v) => { setTitulo(v); clearField("titulo"); }}
          style={[styles.input, errors.titulo && styles.inputError]}
          placeholder="Nombre de la guía"
          placeholderTextColor="#8A9490"
          maxLength={45}
        />
      </Field>

      <Field label="Descripción">
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.textArea}
          placeholder="Descripción de la guía"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </Field>

      <View style={styles.row}>
        <Field label="Duración (min) *" error={errors.duracion} style={{ flex: 1 }}>
          <TextInput
            value={duracion}
            onChangeText={(v) => { setDuracion(v); clearField("duracion"); }}
            style={[styles.input, errors.duracion && styles.inputError]}
            placeholder="60"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
      </View>

      <View style={styles.row}>
        <Field label="ID Categoría *" error={errors.idCategoria} style={{ flex: 1 }}>
          <TextInput
            value={idCategoria}
            onChangeText={(v) => { setIdCategoria(v); clearField("idCategoria"); }}
            style={[styles.input, errors.idCategoria && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
        <Field label="ID Nivel *" error={errors.idNivel} style={{ flex: 1 }}>
          <TextInput
            value={idNivel}
            onChangeText={(v) => { setIdNivel(v); clearField("idNivel"); }}
            style={[styles.input, errors.idNivel && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
      </View>

      {/* Imagen de portada */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionLabel}>Imagen de portada (opcional)</Text>
      </View>

      <Pressable
        style={[styles.imagePicker, imageUri && { padding: 0, borderWidth: 0 }]}
        onPress={pickImage}
        disabled={uploading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePickerInner}>
            <Ionicons name="image-outline" size={28} color="#8A9490" />
            <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
            <Text style={styles.imagePickerHint}>JPG, PNG o WebP · máx 8 MB</Text>
          </View>
        )}
        {imageUri && (
          <View style={styles.imagePickerOverlay}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.imagePickerOverlayText}>Cambiar</Text>
          </View>
        )}
      </Pressable>

      {errors.general && (
        <Text style={[styles.errorText, { textAlign: "center" }]}>{errors.general}</Text>
      )}

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

type RouteErrors = {
  nombre?: string;
  distancia?: string;
  duracion?: string;
  idActividad?: string;
  idDificultad?: string;
  idUbicacion?: string;
  lat?: string;
  lng?: string;
  general?: string;
};

function RouteForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useHomeData();
  const { imageUri, imageFile, uploading, pickImage, uploadPicked } = useWebImagePicker();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [distancia, setDistancia] = useState("");
  const [duracion, setDuracion] = useState("");
  const [idActividad, setIdActividad] = useState("");
  const [idDificultad, setIdDificultad] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [errors, setErrors] = useState<RouteErrors>({});
  const [loading, setLoading] = useState(false);

  const clearField = (field: keyof RouteErrors) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  const validate = (): RouteErrors => {
    const e: RouteErrors = {};
    if (!nombre.trim()) e.nombre = "El nombre es obligatorio.";

    const dist = Number(distancia);
    if (!distancia || isNaN(dist) || dist <= 0) e.distancia = "Ingresá una distancia válida (km).";

    const dur = Number(duracion);
    if (!duracion || isNaN(dur) || dur <= 0) e.duracion = "Ingresá una duración válida (min).";

    if (!idActividad || isNaN(Number(idActividad))) e.idActividad = "Requerido.";
    if (!idDificultad || isNaN(Number(idDificultad))) e.idDificultad = "Requerido.";
    if (!idUbicacion || isNaN(Number(idUbicacion))) e.idUbicacion = "Requerido.";

    if (lat && (isNaN(Number(lat)) || Number(lat) < -90 || Number(lat) > 90))
      e.lat = "Latitud inválida (-90 a 90).";
    if (lng && (isNaN(Number(lng)) || Number(lng) < -180 || Number(lng) > 180))
      e.lng = "Longitud inválida (-180 a 180).";

    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Upload image first if one was picked
      let uploadedUrl: string | null = null;
      if (imageFile) {
        uploadedUrl = await uploadPicked();
      }

      const route = await routesApi.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        distancia_km: Number(distancia),
        duracion_min: Number(duracion),
        id_actividad: Number(idActividad),
        id_dificultad: Number(idDificultad),
        id_ubicacion: Number(idUbicacion),
      });

      // Attach image if uploaded
      if (uploadedUrl) {
        await routesApi.addImage(route.id, uploadedUrl).catch(() => {});
      }

      // If coordinates provided, add the point so it appears on the map
      if (lat && lng) {
        await routesApi.addPoint(route.id, Number(lat), Number(lng)).catch(() => {});
      }

      refresh();
      onSuccess();
    } catch (error) {
      setErrors({
        general: error instanceof ApiError
          ? error.message
          : "No se pudo crear la ruta. Intentá de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Field label="Nombre *" error={errors.nombre}>
        <TextInput
          value={nombre}
          onChangeText={(v) => { setNombre(v); clearField("nombre"); }}
          style={[styles.input, errors.nombre && styles.inputError]}
          placeholder="Nombre de la ruta"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
      </Field>

      <Field label="Descripción">
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.textArea}
          placeholder="Descripción de la ruta"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </Field>

      <View style={styles.row}>
        <Field label="Distancia (km) *" error={errors.distancia} style={{ flex: 1 }}>
          <TextInput
            value={distancia}
            onChangeText={(v) => { setDistancia(v); clearField("distancia"); }}
            style={[styles.input, errors.distancia && styles.inputError]}
            placeholder="5.5"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
        </Field>
        <Field label="Duración (min) *" error={errors.duracion} style={{ flex: 1 }}>
          <TextInput
            value={duracion}
            onChangeText={(v) => { setDuracion(v); clearField("duracion"); }}
            style={[styles.input, errors.duracion && styles.inputError]}
            placeholder="90"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
      </View>

      <View style={styles.row}>
        <Field label="ID Actividad *" error={errors.idActividad} style={{ flex: 1 }}>
          <TextInput
            value={idActividad}
            onChangeText={(v) => { setIdActividad(v); clearField("idActividad"); }}
            style={[styles.input, errors.idActividad && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
        <Field label="ID Dificultad *" error={errors.idDificultad} style={{ flex: 1 }}>
          <TextInput
            value={idDificultad}
            onChangeText={(v) => { setIdDificultad(v); clearField("idDificultad"); }}
            style={[styles.input, errors.idDificultad && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
        </Field>
      </View>

      <Field label="ID Ubicación *" error={errors.idUbicacion}>
        <TextInput
          value={idUbicacion}
          onChangeText={(v) => { setIdUbicacion(v); clearField("idUbicacion"); }}
          style={[styles.input, errors.idUbicacion && styles.inputError]}
          placeholder="1"
          placeholderTextColor="#8A9490"
          keyboardType="numeric"
        />
      </Field>

      {/* Imagen de portada */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionLabel}>Imagen de portada (opcional)</Text>
      </View>

      <Pressable
        style={[styles.imagePicker, imageUri && { padding: 0, borderWidth: 0 }]}
        onPress={pickImage}
        disabled={uploading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePickerInner}>
            <Ionicons name="image-outline" size={28} color="#8A9490" />
            <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
            <Text style={styles.imagePickerHint}>JPG, PNG o WebP · máx 8 MB</Text>
          </View>
        )}
        {imageUri && (
          <View style={styles.imagePickerOverlay}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.imagePickerOverlayText}>Cambiar</Text>
          </View>
        )}
      </Pressable>

      {/* Coordenadas opcionales — necesarias para que aparezca en el mapa */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionLabel}>Ubicación en el mapa (opcional)</Text>
      </View>

      <View style={styles.row}>
        <Field label="Latitud" error={errors.lat} style={{ flex: 1 }}>
          <TextInput
            value={lat}
            onChangeText={(v) => { setLat(v); clearField("lat"); }}
            style={[styles.input, errors.lat && styles.inputError]}
            placeholder="ej. -34.6037"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
        </Field>
        <Field label="Longitud" error={errors.lng} style={{ flex: 1 }}>
          <TextInput
            value={lng}
            onChangeText={(v) => { setLng(v); clearField("lng"); }}
            style={[styles.input, errors.lng && styles.inputError]}
            placeholder="ej. -58.3816"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
        </Field>
      </View>

      {errors.general && (
        <Text style={[styles.errorText, { textAlign: "center" }]}>{errors.general}</Text>
      )}

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
  const { isAdmin } = useAuth();

  const isGuide = type === "guide";
  const title = isGuide ? "Nueva guía" : "Nueva ruta";

  if (!isAdmin || Platform.OS !== "web") {
    const message = !isAdmin
      ? "Acceso restringido a administradores"
      : "Esta función solo está disponible en la versión web.";
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name={!isAdmin ? "lock-closed-outline" : "desktop-outline"} size={44} color="#8A9490" />
        <Text style={[styles.headerTitle, { marginTop: 16, color: "#8A9490", fontSize: 16, textAlign: "center", paddingHorizontal: 24 }]}>
          {message}
        </Text>
        <Pressable style={[styles.backButton, { marginTop: 24, width: "auto", paddingHorizontal: 20 }]} onPress={() => router.back()}>
          <Text style={{ color: "#14342B", fontWeight: "700" }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

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
