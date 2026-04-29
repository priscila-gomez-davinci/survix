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
import { routesApi, ApiError, type Route } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles } from "../AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteForm = {
  nombre: string;
  descripcion: string;
  distancia_km: string;
  duracion_min: string;
  id_actividad: string;
  id_dificultad: string;
  id_ubicacion: string;
};

type FormErrors = {
  nombre?: string;
  distancia_km?: string;
  duracion_min?: string;
  id_actividad?: string;
  id_dificultad?: string;
  id_ubicacion?: string;
  general?: string;
};

const emptyForm: RouteForm = {
  nombre: "",
  descripcion: "",
  distancia_km: "",
  duracion_min: "",
  id_actividad: "",
  id_dificultad: "",
  id_ubicacion: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateCreateForm(form: RouteForm): FormErrors {
  const e: FormErrors = {};
  if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
  const dist = Number(form.distancia_km);
  if (!form.distancia_km || isNaN(dist) || dist <= 0) e.distancia_km = "Distancia inválida (km).";
  const dur = Number(form.duracion_min);
  if (!form.duracion_min || isNaN(dur) || dur <= 0) e.duracion_min = "Duración inválida (min).";
  if (!form.id_actividad || isNaN(Number(form.id_actividad))) e.id_actividad = "Requerido.";
  if (!form.id_dificultad || isNaN(Number(form.id_dificultad))) e.id_dificultad = "Requerido.";
  if (!form.id_ubicacion || isNaN(Number(form.id_ubicacion))) e.id_ubicacion = "Requerido.";
  return e;
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateRouteForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (route: Route) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RouteForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof RouteForm) => (v: string) => {
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
      const created = await routesApi.create({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        distancia_km: Number(form.distancia_km),
        duracion_min: Number(form.duracion_min),
        id_actividad: Number(form.id_actividad),
        id_dificultad: Number(form.id_dificultad),
        id_ubicacion: Number(form.id_ubicacion),
      });
      onSuccess(created);
    } catch (e) {
      setErrors({ general: e instanceof ApiError ? e.message : "No se pudo crear la ruta." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          value={form.nombre}
          onChangeText={set("nombre")}
          style={[styles.input, errors.nombre && styles.inputError]}
          placeholder="Nombre de la ruta"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={form.descripcion}
          onChangeText={set("descripcion")}
          style={styles.textArea}
          placeholder="Descripción de la ruta"
          placeholderTextColor="#8A9490"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formRow}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Distancia km *</Text>
          <TextInput
            value={form.distancia_km}
            onChangeText={set("distancia_km")}
            style={[styles.input, errors.distancia_km && styles.inputError]}
            placeholder="5.5"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
          {errors.distancia_km ? <Text style={styles.errorText}>{errors.distancia_km}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Duración min *</Text>
          <TextInput
            value={form.duracion_min}
            onChangeText={set("duracion_min")}
            style={[styles.input, errors.duracion_min && styles.inputError]}
            placeholder="90"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.duracion_min ? <Text style={styles.errorText}>{errors.duracion_min}</Text> : null}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ID Actividad *</Text>
          <TextInput
            value={form.id_actividad}
            onChangeText={set("id_actividad")}
            style={[styles.input, errors.id_actividad && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.id_actividad ? <Text style={styles.errorText}>{errors.id_actividad}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ID Dificultad *</Text>
          <TextInput
            value={form.id_dificultad}
            onChangeText={set("id_dificultad")}
            style={[styles.input, errors.id_dificultad && styles.inputError]}
            placeholder="1"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.id_dificultad ? <Text style={styles.errorText}>{errors.id_dificultad}</Text> : null}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>ID Ubicación *</Text>
        <TextInput
          value={form.id_ubicacion}
          onChangeText={set("id_ubicacion")}
          style={[styles.input, errors.id_ubicacion && styles.inputError]}
          placeholder="1"
          placeholderTextColor="#8A9490"
          keyboardType="numeric"
        />
        {errors.id_ubicacion ? <Text style={styles.errorText}>{errors.id_ubicacion}</Text> : null}
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

function EditRouteForm({
  route,
  onSuccess,
  onCancel,
}: {
  route: Route;
  onSuccess: (updated: Route) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(route.name);
  const [descripcion, setDescripcion] = useState(route.description ?? "");
  const [distancia, setDistancia] = useState(route.distance != null ? String(route.distance) : "");
  const [duracion, setDuracion] = useState(route.duration != null ? String(route.duration) : "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const errs: FormErrors = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    const dist = distancia ? Number(distancia) : null;
    const dur = duracion ? Number(duracion) : null;
    if (dist !== null && (isNaN(dist) || dist <= 0)) errs.distancia_km = "Distancia inválida.";
    if (dur !== null && (isNaN(dur) || dur <= 0)) errs.duracion_min = "Duración inválida.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const updated = await routesApi.update(route.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        ...(dist ? { distancia_km: dist } : {}),
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
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          value={nombre}
          onChangeText={(v) => { setNombre(v); setErrors((e) => ({ ...e, nombre: undefined })); }}
          style={[styles.input, errors.nombre && styles.inputError]}
          placeholder="Nombre de la ruta"
          placeholderTextColor="#8A9490"
          maxLength={150}
        />
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
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

      <View style={styles.formRow}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Distancia km</Text>
          <TextInput
            value={distancia}
            onChangeText={(v) => { setDistancia(v); setErrors((e) => ({ ...e, distancia_km: undefined })); }}
            style={[styles.input, errors.distancia_km && styles.inputError]}
            placeholder="5.5"
            placeholderTextColor="#8A9490"
            keyboardType="decimal-pad"
          />
          {errors.distancia_km ? <Text style={styles.errorText}>{errors.distancia_km}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Duración min</Text>
          <TextInput
            value={duracion}
            onChangeText={(v) => { setDuracion(v); setErrors((e) => ({ ...e, duracion_min: undefined })); }}
            style={[styles.input, errors.duracion_min && styles.inputError]}
            placeholder="90"
            placeholderTextColor="#8A9490"
            keyboardType="numeric"
          />
          {errors.duracion_min ? <Text style={styles.errorText}>{errors.duracion_min}</Text> : null}
        </View>
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

export function RoutesTab() {
  const { refresh: refreshHomeData } = useHomeData();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      const data = await routesApi.list();
      setRoutes(data);
      setFetchError(null);
    } catch {
      setFetchError("No se pudieron cargar las rutas.");
    }
  }, []);

  useEffect(() => {
    fetchRoutes().finally(() => setLoading(false));
  }, [fetchRoutes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  };

  const handleCreateSuccess = (created: Route) => {
    setRoutes((prev) => [created, ...prev]);
    setShowCreate(false);
    refreshHomeData();
  };

  const handleEditSuccess = (updated: Route) => {
    setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingId(null);
    refreshHomeData();
  };

  const handleDelete = (route: Route) => {
    Alert.alert(
      "Eliminar ruta",
      `¿Seguro que querés eliminar "${route.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingId(route.id);
            try {
              await routesApi.delete(route.id);
              setRoutes((prev) => prev.filter((r) => r.id !== route.id));
              if (editingId === route.id) setEditingId(null);
              refreshHomeData();
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof ApiError ? e.message : "No se pudo eliminar la ruta."
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
        <Text style={styles.emptyText}>Cargando rutas...</Text>
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
        <Text style={styles.tabTitle}>Rutas ({routes.length})</Text>
        <Pressable
          style={[styles.createButton, showCreate && { backgroundColor: "#8A9490" }]}
          onPress={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
          }}
        >
          <Ionicons name={showCreate ? "close" : "add"} size={16} color="#fff" />
          <Text style={styles.createButtonText}>{showCreate ? "Cancelar" : "Nueva ruta"}</Text>
        </Pressable>
      </View>

      {/* Create form */}
      {showCreate && (
        <View style={[styles.itemCard, styles.itemCardExpanded, { marginBottom: 16 }]}>
          <Text style={[styles.itemName, { marginBottom: 4 }]}>Nueva ruta</Text>
          <CreateRouteForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreate(false)}
          />
        </View>
      )}

      {fetchError ? (
        <Text style={[styles.generalError, { paddingHorizontal: 20 }]}>{fetchError}</Text>
      ) : null}

      {routes.length === 0 && !fetchError ? (
        <View style={styles.center}>
          <Ionicons name="map-outline" size={44} color="#C5D4CE" />
          <Text style={styles.emptyText}>Sin rutas</Text>
          <Text style={styles.emptySubtext}>
            Creá la primera ruta usando el botón de arriba.
          </Text>
        </View>
      ) : (
        routes.map((route) => {
          const isEditing = editingId === route.id;
          const isDeleting = deletingId === route.id;

          return (
            <View
              key={route.id}
              style={[styles.itemCard, isEditing && styles.itemCardExpanded]}
            >
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{route.name}</Text>
                  <Text style={styles.itemMeta}>
                    {[
                      route.distance != null && `${route.distance} km`,
                      route.duration != null && `${route.duration} min`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Sin datos"}
                    {"  ·  ID: "}
                    {route.id}
                  </Text>
                </View>
                {!isEditing && (
                  <View style={styles.itemActions}>
                    <Pressable
                      style={styles.editBtn}
                      onPress={() => setEditingId(route.id)}
                      disabled={isDeleting}
                    >
                      <Ionicons name="pencil-outline" size={14} color="#14342B" />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.deleteBtn, isDeleting && { opacity: 0.5 }]}
                      onPress={() => handleDelete(route)}
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
                <EditRouteForm
                  route={route}
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
