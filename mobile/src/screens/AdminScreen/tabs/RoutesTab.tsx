import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { routesApi, catalogApi, ApiError, type Route, type RoutePoint, type CatalogItem } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles, C } from "../AdminScreen.styles";
import { DeleteModal } from "../DeleteModal";
import { AppDialog } from "@/src/components/AppDialog";

// ─── Fallback catalog options ─────────────────────────────────────────────────

const FALLBACK_DIFFICULTY: SelectOption[] = [
  { value: 1, label: "Fácil" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Difícil" },
];

const FALLBACK_ACTIVITY: SelectOption[] = [
  { value: 1, label: "Trekking" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectOption = { value: number; label: string };

function catalogToOptions(items: CatalogItem[]): SelectOption[] {
  return items.map((c) => ({ value: c.id, label: c.nombre }));
}

// ─── SelectField component ────────────────────────────────────────────────────

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ position: "relative", zIndex: 10 }}>
      <Pressable style={styles.selectField} onPress={() => setOpen((v) => !v)}>
        <Text style={[styles.selectFieldText, !selected && styles.selectPlaceholder]}>
          {selected ? selected.label : (placeholder ?? "Seleccioná...")}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={13} color={C.muted} />
      </Pressable>
      {open && (
        <ScrollView style={styles.selectDropdown} nestedScrollEnabled>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.selectOption, opt.value === value && styles.selectOptionActive]}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  opt.value === value && styles.selectOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Location options (extracted from existing routes) ────────────────────────

function useLocationOptions(routes: Route[]): SelectOption[] {
  const seen = new Set<number>();
  const opts: SelectOption[] = [];
  for (const r of routes) {
    if (r.id_ubicacion != null && !seen.has(r.id_ubicacion)) {
      seen.add(r.id_ubicacion);
      opts.push({ value: r.id_ubicacion, label: `Ubicación #${r.id_ubicacion}` });
    }
  }
  if (opts.length === 0) {
    // Fallback defaults
    [1, 2, 3, 4, 5].forEach((n) =>
      opts.push({ value: n, label: `Ubicación #${n}` })
    );
  }
  return opts;
}

// ─── Route modal form ─────────────────────────────────────────────────────────

type RouteFormState = {
  nombre: string;
  descripcion: string;
  distancia_km: string;
  duracion_min: string;
  id_actividad: number | null;
  id_dificultad: number | null;
  id_ubicacion: number | null;
  latitud: string;
  longitud: string;
};

type RouteFormErrors = Partial<Record<keyof RouteFormState | "general", string>>;

const emptyRouteForm: RouteFormState = {
  nombre: "",
  descripcion: "",
  distancia_km: "",
  duracion_min: "",
  id_actividad: null,
  id_dificultad: null,
  id_ubicacion: null,
  latitud: "",
  longitud: "",
};

function RouteModal({
  initial,
  locationOptions,
  activityOptions,
  difficultyOptions,
  onClose,
  onSave,
}: {
  initial: Partial<RouteFormState> | null;
  locationOptions: SelectOption[];
  activityOptions: SelectOption[];
  difficultyOptions: SelectOption[];
  onClose: () => void;
  onSave: (form: RouteFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<RouteFormState>({
    ...emptyRouteForm,
    ...initial,
  });
  const [errors, setErrors] = useState<RouteFormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RouteFormState>(k: K, v: RouteFormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): RouteFormErrors => {
    const e: RouteFormErrors = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    const dist = Number(form.distancia_km);
    if (!form.distancia_km || isNaN(dist) || dist <= 0) e.distancia_km = "Distancia inválida.";
    const dur = Number(form.duracion_min);
    if (!form.duracion_min || isNaN(dur) || dur <= 0) e.duracion_min = "Duración inválida.";
    if (!form.id_actividad) e.id_actividad = "Requerido.";
    if (!form.id_dificultad) e.id_dificultad = "Requerido.";
    if (!form.id_ubicacion) e.id_ubicacion = "Requerido.";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
    } catch (e) {
      setErrors({ general: e instanceof ApiError ? e.message : "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initial;

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={{ position: "absolute", inset: 0 } as never} onPress={onClose} />
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>
          {isEdit ? "Editar actividad" : "Nueva actividad"}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Nombre *</Text>
          <TextInput
            value={form.nombre}
            onChangeText={(v) => set("nombre", v)}
            style={styles.formInput}
            placeholder="Nombre de la ruta"
            placeholderTextColor={C.muted}
            maxLength={150}
          />
          {errors.nombre ? <Text style={styles.formError}>{errors.nombre}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Descripción</Text>
          <TextInput
            value={form.descripcion}
            onChangeText={(v) => set("descripcion", v)}
            style={styles.formTextarea}
            placeholder="Descripción de la ruta"
            placeholderTextColor={C.muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Distancia (km) *</Text>
            <TextInput
              value={form.distancia_km}
              onChangeText={(v) => set("distancia_km", v)}
              style={styles.formInput}
              placeholder="5.5"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />
            {errors.distancia_km ? <Text style={styles.formError}>{errors.distancia_km}</Text> : null}
          </View>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Duración (min) *</Text>
            <TextInput
              value={form.duracion_min}
              onChangeText={(v) => set("duracion_min", v)}
              style={styles.formInput}
              placeholder="90"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
            />
            {errors.duracion_min ? <Text style={styles.formError}>{errors.duracion_min}</Text> : null}
          </View>
        </View>

        <View style={[styles.formRow, { marginTop: 14 }]}>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Tipo de actividad *</Text>
            <SelectField
              value={form.id_actividad}
              onChange={(v) => set("id_actividad", v)}
              options={activityOptions}
              placeholder="Seleccioná actividad"
            />
            {errors.id_actividad ? <Text style={styles.formError}>{errors.id_actividad}</Text> : null}
          </View>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Dificultad *</Text>
            <SelectField
              value={form.id_dificultad}
              onChange={(v) => set("id_dificultad", v)}
              options={difficultyOptions}
              placeholder="Seleccioná nivel"
            />
            {errors.id_dificultad ? <Text style={styles.formError}>{errors.id_dificultad}</Text> : null}
          </View>
        </View>

        <View style={[styles.formGroup, { marginTop: 14 }]}>
          <Text style={styles.formLabel}>Ubicación *</Text>
          <SelectField
            value={form.id_ubicacion}
            onChange={(v) => set("id_ubicacion", v)}
            options={locationOptions}
            placeholder="Seleccioná ubicación"
          />
          {errors.id_ubicacion ? <Text style={styles.formError}>{errors.id_ubicacion}</Text> : null}
        </View>

        <View style={[styles.formRow, { marginTop: 14 }]}>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Latitud (mapa)</Text>
            <TextInput
              value={form.latitud}
              onChangeText={(v) => set("latitud", v)}
              style={styles.formInput}
              placeholder="-34.6037"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Longitud (mapa)</Text>
            <TextInput
              value={form.longitud}
              onChangeText={(v) => set("longitud", v)}
              style={styles.formInput}
              placeholder="-58.3816"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnSave, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnSaveText}>{isEdit ? "Guardar cambios" : "Crear ruta"}</Text>
            }
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Points sub-panel ─────────────────────────────────────────────────────────

function PointsPanel({ routeId }: { routeId: number }) {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLat, setAddLat] = useState("");
  const [addLng, setAddLng] = useState("");
  const [addOrden, setAddOrden] = useState("1");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await routesApi.getPoints(routeId);
      setPoints(data as RoutePoint[]);
    } catch {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => { load(); }, [load]);

  const fmtCoord = (pt: RoutePoint): string => `${pt.lat}, ${pt.lng}`;

  const handleAdd = async () => {
    const lat = Number(addLat);
    const lng = Number(addLng);
    const orden = Number(addOrden);
    if (isNaN(lat) || lat < -90 || lat > 90) { setAddError("Latitud inválida (-90 a 90)."); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setAddError("Longitud inválida (-180 a 180)."); return; }
    if (!addOrden || isNaN(orden) || orden < 1) { setAddError("Orden debe ser ≥ 1."); return; }
    setAddError(null);
    setAddLoading(true);
    try {
      const created = await routesApi.addPoint(routeId, lat, lng, orden);
      setPoints((prev) => [...prev, created]);
      setAddLat(""); setAddLng(""); setAddOrden(String(points.length + 2));
    } catch (e) {
      setAddError(e instanceof ApiError ? e.message : "No se pudo agregar el punto.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (pointId: number) => {
    setDeletingId(pointId);
    try {
      await routesApi.deletePoint(pointId);
      setPoints((prev) => prev.filter((p) => p.id !== pointId));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.subPanel}>
      <View style={styles.subPanelHeader}>
        <Text style={styles.subPanelTitle}>Puntos en el mapa ({points.length})</Text>
      </View>

      {loading ? (
        <View style={{ padding: 16, alignItems: "center" }}>
          <ActivityIndicator color={C.greenDark} size="small" />
        </View>
      ) : points.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={[styles.tdMuted, { fontSize: 12.5 }]}>Sin puntos. Agregá el primero abajo.</Text>
        </View>
      ) : (
        points.map((pt) => (
          <View key={pt.id} style={styles.subPanelRow}>
            <Ionicons name="location-outline" size={14} color={C.greenDark} />
            <Text style={[styles.tdText, { flex: 1, fontSize: 13 }]}>
              {fmtCoord(pt)}
            </Text>
            <Text style={[styles.tdMuted, { fontSize: 12, marginRight: 8 }]}>
              Orden: {pt.order}
            </Text>
            <Pressable
              style={[styles.btnIcon, styles.btnIconRed, deletingId === pt.id && { opacity: 0.5 }]}
              onPress={() => handleDelete(pt.id)}
              disabled={deletingId === pt.id}
            >
              {deletingId === pt.id
                ? <ActivityIndicator size="small" color={C.red} />
                : <Ionicons name="trash-outline" size={13} color={C.red} />
              }
            </Pressable>
          </View>
        ))
      )}

      {/* Add point form */}
      <View style={[styles.subPanelRow, { borderBottomWidth: 0, gap: 8, flexWrap: "wrap" }]}>
        <TextInput
          value={addLat}
          onChangeText={setAddLat}
          style={[styles.formInput, { flex: 1, minWidth: 80 }]}
          placeholder="Latitud"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
        />
        <TextInput
          value={addLng}
          onChangeText={setAddLng}
          style={[styles.formInput, { flex: 1, minWidth: 80 }]}
          placeholder="Longitud"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
        />
        <TextInput
          value={addOrden}
          onChangeText={setAddOrden}
          style={[styles.formInput, { width: 70 }]}
          placeholder="Orden"
          placeholderTextColor={C.muted}
          keyboardType="numeric"
        />
        <Pressable
          style={[styles.btnPrimary, addLoading && { opacity: 0.7 }]}
          onPress={handleAdd}
          disabled={addLoading}
        >
          {addLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="add" size={16} color="#fff" />
          }
        </Pressable>
      </View>
      {addError ? (
        <Text style={[styles.formError, { paddingHorizontal: 14, paddingBottom: 8 }]}>{addError}</Text>
      ) : null}
    </View>
  );
}

// ─── Activity type management panel ──────────────────────────────────────────

function ActivityTypePanel({
  options,
  onChanged,
}: {
  options: SelectOption[];
  onChanged: (updated: SelectOption[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await catalogApi.createActivity(newName.trim());
      const next = [...options, { value: created.id, label: created.nombre }];
      onChanged(next);
      setNewName("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await catalogApi.updateActivity(id, editName.trim());
      const next = options.map((o) => o.value === id ? { value: updated.id, label: updated.nombre } : o);
      onChanged(next);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      await catalogApi.deleteActivity(id);
      onChanged(options.filter((o) => o.value !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={{
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 10,
      marginBottom: 16,
      overflow: "hidden",
    }}>
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 11,
          backgroundColor: "#f9fbf9",
          borderBottomWidth: expanded ? 1 : 0,
          borderBottomColor: C.border,
        }}
        onPress={() => setExpanded((v) => !v)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="layers-outline" size={14} color={C.textSub} />
          <Text style={{ fontSize: 12.5, fontWeight: "700", color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Tipos de actividad ({options.length})
          </Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={13} color={C.muted} />
      </Pressable>

      {expanded && (
        <View style={{ padding: 14, gap: 8 }}>
          {options.map((opt) => (
            <View key={opt.value} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {editingId === opt.value ? (
                <>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={[styles.formInput, { flex: 1, height: 32 }]}
                    autoFocus
                    placeholderTextColor={C.muted}
                  />
                  <Pressable
                    style={[styles.btnIcon, { backgroundColor: C.greenLight, borderColor: C.greenDark }]}
                    onPress={() => handleEdit(opt.value)}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator size="small" color={C.greenDark} /> : <Ionicons name="checkmark" size={13} color={C.greenDark} />}
                  </Pressable>
                  <Pressable style={styles.btnIcon} onPress={() => setEditingId(null)}>
                    <Ionicons name="close" size={13} color={C.muted} />
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={[styles.tdText, { flex: 1, fontSize: 13 }]}>{opt.label}</Text>
                  <Pressable style={styles.btnIcon} onPress={() => { setEditingId(opt.value); setEditName(opt.label); setError(null); }}>
                    <Ionicons name="pencil-outline" size={13} color={C.muted} />
                  </Pressable>
                  <Pressable
                    style={[styles.btnIcon, styles.btnIconRed, deletingId === opt.value && { opacity: 0.5 }]}
                    onPress={() => handleDelete(opt.value)}
                    disabled={deletingId === opt.value}
                  >
                    {deletingId === opt.value
                      ? <ActivityIndicator size="small" color={C.red} />
                      : <Ionicons name="trash-outline" size={13} color={C.red} />}
                  </Pressable>
                </>
              )}
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={[styles.formInput, { flex: 1, height: 32 }]}
              placeholder="Nueva actividad..."
              placeholderTextColor={C.muted}
              onSubmitEditing={handleAdd}
            />
            <Pressable
              style={[styles.btnPrimary, { height: 32 }, saving && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={saving || !newName.trim()}
            >
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="add" size={14} color="#fff" />}
            </Pressable>
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}
        </View>
      )}
    </View>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function RoutesTab() {
  const { refresh: refreshHomeData } = useHomeData();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState<"create" | number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ label: string; onConfirm: () => void } | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [activityOptions, setActivityOptions] = useState<SelectOption[]>(FALLBACK_ACTIVITY);
  const [difficultyOptions, setDifficultyOptions] = useState<SelectOption[]>(FALLBACK_DIFFICULTY);

  const locationOptions = useLocationOptions(routes);

  const load = useCallback(async () => {
    try {
      setRoutes(await routesApi.list());
    } catch {
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([catalogApi.activities(), catalogApi.difficulties()])
      .then(([acts, diffs]) => {
        if (acts.length > 0) setActivityOptions(catalogToOptions(acts));
        if (diffs.length > 0) setDifficultyOptions(catalogToOptions(diffs));
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  const filtered = routes.filter(
    (r) =>
      !search ||
      (r.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (route: Route) => {
    setDeleteTarget({
      label: `la ruta "${route.name}"`,
      onConfirm: async () => {
        setDeleteTarget(null);
        setDeletingId(route.id);
        try {
          await routesApi.delete(route.id);
          setRoutes((prev) => prev.filter((r) => r.id !== route.id));
          if (expandedId === route.id) setExpandedId(null);
          refreshHomeData();
        } catch (e) {
          setErrorDialog(e instanceof ApiError ? e.message : "No se pudo eliminar.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleCreate = async (form: RouteFormState) => {
    const created = await routesApi.create({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      distancia_km: Number(form.distancia_km),
      duracion_min: Number(form.duracion_min),
      id_actividad: form.id_actividad!,
      id_dificultad: form.id_dificultad!,
      id_ubicacion: form.id_ubicacion!,
      latitud: form.latitud ? Number(form.latitud) : null,
      longitud: form.longitud ? Number(form.longitud) : null,
    });
    setRoutes((prev) => [created, ...prev]);
    setShowModal(null);
    refreshHomeData();
  };

  const handleEdit = async (form: RouteFormState) => {
    if (typeof showModal !== "number") return;
    const updated = await routesApi.update(showModal, {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      distancia_km: form.distancia_km ? Number(form.distancia_km) : undefined,
      duracion_min: form.duracion_min ? Number(form.duracion_min) : undefined,
      latitud: form.latitud ? Number(form.latitud) : null,
      longitud: form.longitud ? Number(form.longitud) : null,
    });
    setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setShowModal(null);
    refreshHomeData();
  };

  const editingRoute = typeof showModal === "number"
    ? routes.find((r) => r.id === showModal)
    : null;

  const diffLabel = (id?: number) =>
    difficultyOptions.find((o) => o.value === id)?.label ?? `#${id ?? "?"}`;

  const actLabel = (id?: number) =>
    activityOptions.find((o) => o.value === id)?.label ?? `#${id ?? "?"}`;

  return (
    <View>
      {deleteTarget && (
        <DeleteModal
          label={deleteTarget.label}
          onConfirm={deleteTarget.onConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {errorDialog && (
        <AppDialog
          title="No se pudo eliminar"
          message={errorDialog}
          variant="danger"
          icon="alert-circle-outline"
          confirmLabel="Entendido"
          onConfirm={() => setErrorDialog(null)}
        />
      )}

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Rutas</Text>
          <Text style={styles.pageSubtitle}>Gestión de rutas y puntos de interés</Text>
        </View>
        <Pressable style={styles.btnPrimary} onPress={() => setShowModal("create")}>
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.btnPrimaryText}>Nueva ruta</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total rutas</Text>
          <Text style={styles.statValue}>{routes.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Con puntos</Text>
          <Text style={styles.statValue}>—</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Km promedio</Text>
          <Text style={styles.statValue}>
            {routes.length > 0
              ? (routes.reduce((s, r) => s + (r.distance ?? 0), 0) / routes.length).toFixed(1)
              : "—"
            }
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Min promedio</Text>
          <Text style={styles.statValue}>
            {routes.length > 0
              ? Math.round(routes.reduce((s, r) => s + (r.duration ?? 0), 0) / routes.length)
              : "—"
            }
          </Text>
        </View>
      </View>

      {/* Activity type management */}
      <ActivityTypePanel
        options={activityOptions}
        onChanged={setActivityOptions}
      />

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={14} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar rutas..."
            placeholderTextColor={C.muted}
            style={styles.searchInput}
          />
        </View>
        <Text style={styles.toolbarCount}>{filtered.length} rutas</Text>
      </View>

      {/* Table */}
      <View style={styles.tableWrap}>
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { flex: 3 }]}>Nombre</Text>
          <Text style={[styles.thText, { flex: 1.5, textAlign: "center" as never }]}>Actividad</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: "center" as never }]}>Dificultad</Text>
          <Text style={[styles.thText, { width: 90, textAlign: "center" as never }]}>Distancia</Text>
          <Text style={[styles.thText, { width: 90, textAlign: "center" as never }]}>Duración</Text>
          <Text style={[styles.thText, { width: 110 }]}></Text>
        </View>

        {loading ? (
          <View style={[styles.emptyWrap, { paddingVertical: 32 }]}>
            <ActivityIndicator color={C.greenDark} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="map-outline" size={32} color={C.border} />
            <Text style={styles.emptyText}>Sin rutas</Text>
          </View>
        ) : (
          filtered.map((route, i) => {
            const isLast = i === filtered.length - 1 && expandedId !== route.id;
            const isExpanded = expandedId === route.id;
            const isDeleting = deletingId === route.id;

            return (
              <View key={route.id}>
                <View style={[styles.tableRow, isLast && styles.tableRowLast]}>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.tdBold}>{route.name}</Text>
                    {route.description ? (
                      <Text style={styles.tdMuted} numberOfLines={1}>{route.description}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.tdMuted, { flex: 1.5, textAlign: "center" as never }]}>
                    {actLabel(route.id_actividad)}
                  </Text>
                  <Text style={[styles.tdMuted, { flex: 1.2, textAlign: "center" as never }]}>
                    {diffLabel(route.id_dificultad)}
                  </Text>
                  <Text style={[styles.tdText, { width: 90, textAlign: "center" as never }]}>
                    {route.distance != null ? `${route.distance} km` : "—"}
                  </Text>
                  <Text style={[styles.tdText, { width: 90, textAlign: "center" as never }]}>
                    {route.duration != null ? `${route.duration} min` : "—"}
                  </Text>
                  <View style={[styles.rowActions, { width: 110, justifyContent: "flex-end" as never }]}>
                    <Pressable
                      style={[styles.btnIcon, isExpanded && { backgroundColor: C.greenLight }]}
                      onPress={() => setExpandedId(isExpanded ? null : route.id)}
                    >
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "location-outline"}
                        size={13}
                        color={isExpanded ? C.greenDark : C.muted}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.btnIcon}
                      onPress={() => setShowModal(route.id)}
                    >
                      <Ionicons name="pencil-outline" size={13} color={C.muted} />
                    </Pressable>
                    <Pressable
                      style={[styles.btnIcon, styles.btnIconRed, isDeleting && { opacity: 0.5 }]}
                      onPress={() => handleDelete(route)}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? <ActivityIndicator size="small" color={C.red} />
                        : <Ionicons name="trash-outline" size={13} color={C.red} />
                      }
                    </Pressable>
                  </View>
                </View>

                {/* Expandable points panel */}
                {isExpanded && (
                  <View style={{
                    backgroundColor: "#f9fbf9",
                    borderBottomWidth: i === filtered.length - 1 ? 0 : 1,
                    borderBottomColor: "#f0f4f1",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}>
                    <PointsPanel routeId={route.id} />
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Mostrando {filtered.length} de {routes.length} rutas
          </Text>
        </View>
      </View>

      {/* Modal */}
      {showModal !== null && (
        <RouteModal
          initial={
            editingRoute
              ? {
                  nombre: editingRoute.name,
                  descripcion: editingRoute.description ?? "",
                  distancia_km: editingRoute.distance != null ? String(editingRoute.distance) : "",
                  duracion_min: editingRoute.duration != null ? String(editingRoute.duration) : "",
                  id_actividad: editingRoute.id_actividad ?? null,
                  id_dificultad: editingRoute.id_dificultad ?? null,
                  id_ubicacion: editingRoute.id_ubicacion ?? null,
                  latitud: editingRoute.latitud != null ? String(editingRoute.latitud) : "",
                  longitud: editingRoute.longitud != null ? String(editingRoute.longitud) : "",
                }
              : null
          }
          locationOptions={locationOptions}
          activityOptions={activityOptions}
          difficultyOptions={difficultyOptions}
          onClose={() => setShowModal(null)}
          onSave={showModal === "create" ? handleCreate : handleEdit}
        />
      )}
    </View>
  );
}
