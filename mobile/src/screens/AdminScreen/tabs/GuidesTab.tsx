import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { guidesApi, ApiError, type Guide } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles } from "../AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuideForm = {
  titulo: string;
  descripcion: string;
  duracion_min: string;
  id_categoria: string;
  id_nivel: string;
};

type FormErrors = {
  titulo?: string;
  duracion_min?: string;
  id_categoria?: string;
  id_nivel?: string;
  general?: string;
};

const emptyForm: GuideForm = {
  titulo: "",
  descripcion: "",
  duracion_min: "",
  id_categoria: "",
  id_nivel: "",
};

function validateCreateForm(form: GuideForm): FormErrors {
  const e: FormErrors = {};
  if (!form.titulo.trim()) e.titulo = "El título es obligatorio.";
  const dur = Number(form.duracion_min);
  if (!form.duracion_min || isNaN(dur) || dur <= 0) e.duracion_min = "Duración inválida (min).";
  if (!form.id_categoria || isNaN(Number(form.id_categoria))) e.id_categoria = "Requerido.";
  if (!form.id_nivel || isNaN(Number(form.id_nivel))) e.id_nivel = "Requerido.";
  return e;
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateGuideForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (guide: Guide) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<GuideForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof GuideForm) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const errs = validateCreateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const created = await guidesApi.create({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        duracion_min: Number(form.duracion_min),
        id_categoria_guias: Number(form.id_categoria),
        id_nivel_complejidad: Number(form.id_nivel),
      });
      onSuccess(created);
    } catch (e) {
      setErrors({ general: e instanceof ApiError ? e.message : "No se pudo crear la guía." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          value={form.titulo}
          onChangeText={set("titulo")}
          style={[styles.input, errors.titulo && styles.inputError]}
          placeholder="Título de la guía"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
        {errors.titulo ? <Text style={styles.errorText}>{errors.titulo}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={form.descripcion}
          onChangeText={set("descripcion")}
          style={styles.textArea}
          placeholder="Descripción de la guía"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formRow}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Duración min *</Text>
          <TextInput
            value={form.duracion_min}
            onChangeText={set("duracion_min")}
            style={[styles.input, errors.duracion_min && styles.inputError]}
            placeholder="60"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.duracion_min ? <Text style={styles.errorText}>{errors.duracion_min}</Text> : null}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ID Categoría *</Text>
          <TextInput
            value={form.id_categoria}
            onChangeText={set("id_categoria")}
            style={[styles.input, errors.id_categoria && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.id_categoria ? <Text style={styles.errorText}>{errors.id_categoria}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ID Nivel *</Text>
          <TextInput
            value={form.id_nivel}
            onChangeText={set("id_nivel")}
            style={[styles.input, errors.id_nivel && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.id_nivel ? <Text style={styles.errorText}>{errors.id_nivel}</Text> : null}
        </View>
      </View>

      {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}

      <View style={styles.formActions}>
        <Pressable
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Crear</Text>}
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditGuideForm({
  guide,
  onSuccess,
  onCancel,
}: {
  guide: Guide;
  onSuccess: (updated: Guide) => void;
  onCancel: () => void;
}) {
  const [titulo, setTitulo] = useState(guide.title);
  const [descripcion, setDescripcion] = useState(guide.description ?? "");
  const [duracion, setDuracion] = useState(guide.duration != null ? String(guide.duration) : "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const errs: FormErrors = {};
    if (!titulo.trim()) errs.titulo = "El título es obligatorio.";
    const dur = duracion ? Number(duracion) : null;
    if (dur !== null && (isNaN(dur) || dur <= 0)) errs.duracion_min = "Duración inválida.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const updated = await guidesApi.update(guide.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        ...(dur ? { duracion_min: dur } : {}),
      });
      onSuccess(updated);
    } catch (e) {
      setErrors({ general: e instanceof ApiError ? e.message : "No se pudo guardar." });
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
          onChangeText={(v) => { setTitulo(v); setErrors((e) => ({ ...e, titulo: undefined })); }}
          style={[styles.input, errors.titulo && styles.inputError]}
          placeholder="Título de la guía"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
        {errors.titulo ? <Text style={styles.errorText}>{errors.titulo}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.textArea}
          placeholder="Descripción"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Duración min</Text>
        <TextInput
          value={duracion}
          onChangeText={(v) => { setDuracion(v); setErrors((e) => ({ ...e, duracion_min: undefined })); }}
          style={[styles.input, errors.duracion_min && styles.inputError]}
          placeholder="60"
          placeholderTextColor="#8A9490"
          keyboardType="numeric"
        />
        {errors.duracion_min ? <Text style={styles.errorText}>{errors.duracion_min}</Text> : null}
      </View>

      {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}

      <View style={styles.formActions}>
        <Pressable
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

export function GuidesTab() {
  const { refresh: refreshHomeData } = useHomeData();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchGuides = useCallback(async () => {
    try {
      const data = await guidesApi.list();
      setGuides(data);
      setFetchError(null);
    } catch {
      setFetchError("No se pudieron cargar las guías.");
    }
  }, []);

  useEffect(() => {
    fetchGuides().finally(() => setLoading(false));
  }, [fetchGuides]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGuides();
    setRefreshing(false);
  };

  const handleCreateSuccess = (created: Guide) => {
    setGuides((prev) => [created, ...prev]);
    setShowCreate(false);
    refreshHomeData();
  };

  const handleEditSuccess = (updated: Guide) => {
    setGuides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingId(null);
    refreshHomeData();
  };

  const handleDelete = (guide: Guide) => {
    Alert.alert(
      "Eliminar guía",
      `¿Seguro que querés eliminar "${guide.title}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingId(guide.id);
            try {
              await guidesApi.delete(guide.id);
              setGuides((prev) => prev.filter((g) => g.id !== guide.id));
              if (editingId === guide.id) setEditingId(null);
              refreshHomeData();
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof ApiError ? e.message : "No se pudo eliminar la guía."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#14342B" />
        <Text style={styles.emptyText}>Cargando guías...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.tabContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#14342B" />
      }
    >
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Guías ({guides.length})</Text>
        <Pressable
          style={[styles.createButton, showCreate && { backgroundColor: "#8A9490" }]}
          onPress={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
          }}
        >
          <Ionicons name={showCreate ? "close" : "add"} size={16} color="#fff" />
          <Text style={styles.createButtonText}>{showCreate ? "Cancelar" : "Nueva guía"}</Text>
        </Pressable>
      </View>

      {/* Create form */}
      {showCreate && (
        <View style={[styles.itemCard, styles.itemCardExpanded, { marginBottom: 16 }]}>
          <Text style={[styles.itemName, { marginBottom: 4 }]}>Nueva guía</Text>
          <CreateGuideForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreate(false)}
          />
        </View>
      )}

      {fetchError ? (
        <Text style={[styles.generalError, { paddingHorizontal: 20 }]}>{fetchError}</Text>
      ) : null}

      {guides.length === 0 && !fetchError ? (
        <View style={styles.center}>
          <Ionicons name="book-outline" size={44} color="#C5D4CE" />
          <Text style={styles.emptyText}>Sin guías</Text>
          <Text style={styles.emptySubtext}>
            Creá la primera guía usando el botón de arriba.
          </Text>
        </View>
      ) : (
        guides.map((guide) => {
          const isEditing = editingId === guide.id;
          const isDeleting = deletingId === guide.id;

          return (
            <View
              key={guide.id}
              style={[styles.itemCard, isEditing && styles.itemCardExpanded]}
            >
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{guide.title}</Text>
                  <Text style={styles.itemMeta}>
                    {guide.duration != null ? `${guide.duration} min` : "Sin duración"}
                    {"  ·  ID: "}
                    {guide.id}
                  </Text>
                </View>
                {!isEditing && (
                  <View style={styles.itemActions}>
                    <Pressable
                      style={styles.editBtn}
                      onPress={() => setEditingId(guide.id)}
                      disabled={isDeleting}
                    >
                      <Ionicons name="pencil-outline" size={14} color="#14342B" />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.deleteBtn, isDeleting && { opacity: 0.5 }]}
                      onPress={() => handleDelete(guide)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#D93025" />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={14} color="#D93025" />
                          <Text style={styles.deleteBtnText}>Eliminar</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>

              {isEditing && (
                <EditGuideForm
                  guide={guide}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
