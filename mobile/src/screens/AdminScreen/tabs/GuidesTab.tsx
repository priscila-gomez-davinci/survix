import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { guidesApi, catalogApi, ApiError, type Guide, type CatalogItem } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles, C } from "../AdminScreen.styles";
import { DeleteModal } from "../DeleteModal";
import { AppDialog } from "@/src/components/AppDialog";

type Option = { value: number; label: string };

// ─── Fallback catalogs (used if API fails) ────────────────────────────────────

const FALLBACK_CATEGORY: Option[] = [
  { value: 1, label: "Supervivencia" },
  { value: 2, label: "Primeros Auxilios" },
  { value: 3, label: "Equipamiento" },
];

const FALLBACK_LEVEL: Option[] = [
  { value: 1, label: "Básico" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Avanzado" },
];

function catalogToOptions(items: CatalogItem[]): Option[] {
  return items.map((c) => ({ value: c.id, label: c.nombre }));
}

// ─── SelectField ─────────────────────────────────────────────────────────────

function SelectField({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: number | null;
  options: Option[];
  placeholder: string;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ zIndex: open ? 500 : 1 }}>
      <Pressable
        style={styles.selectField}
        onPress={() => setOpen((v) => !v)}
      >
        <Text
          style={[
            styles.selectFieldText,
            !selected && styles.selectPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={C.muted}
        />
      </Pressable>
      {open && (
        <ScrollView style={styles.selectDropdown} scrollEnabled>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.selectOption,
                opt.value === value && styles.selectOptionActive,
              ]}
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

// ─── GuideModal ───────────────────────────────────────────────────────────────

type GuideModalProps = {
  mode: "create" | "edit";
  initial?: Guide;
  categoryOptions: Option[];
  levelOptions: Option[];
  onClose: () => void;
  onSaved: (g: Guide) => void;
};

function GuideModal({ mode, initial, categoryOptions, levelOptions, onClose, onSaved }: GuideModalProps) {
  const [titulo, setTitulo] = useState(initial?.title ?? "");
  const [descripcion, setDescripcion] = useState(initial?.description ?? "");
  const [duracion, setDuracion] = useState(
    initial?.duration != null ? String(initial.duration) : ""
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initial?.category_id ?? null
  );
  const [levelId, setLevelId] = useState<number | null>(
    initial?.complexity_level_id ?? null
  );
  const [latitud, setLatitud] = useState(
    initial?.latitud != null ? String(initial.latitud) : ""
  );
  const [longitud, setLongitud] = useState(
    initial?.longitud != null ? String(initial.longitud) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!titulo.trim()) return "El título es obligatorio.";
    if (!categoryId) return "Seleccioná una categoría.";
    if (!levelId) return "Seleccioná un nivel de complejidad.";
    const dur = Number(duracion);
    if (!duracion || isNaN(dur) || dur <= 0) return "Ingresá una duración válida (minutos).";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      let result: Guide;
      if (mode === "create") {
        result = await guidesApi.create({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          duracion_min: Number(duracion),
          id_categoria_guias: categoryId!,
          id_nivel_complejidad: levelId!,
          latitud: latitud ? Number(latitud) : null,
          longitud: longitud ? Number(longitud) : null,
        });
      } else {
        result = await guidesApi.update(initial!.id, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          duracion_min: Number(duracion),
          id_categoria_guias: categoryId!,
          id_nivel_complejidad: levelId!,
          latitud: latitud ? Number(latitud) : null,
          longitud: longitud ? Number(longitud) : null,
        });
      }
      onSaved(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modal, { overflow: "visible" as never }]}>
        <Text style={styles.modalTitle}>
          {mode === "create" ? "Nueva guía" : "Editar guía"}
        </Text>

        {/* Título */}
        <View style={[styles.formGroup, { zIndex: 1 }]}>
          <Text style={styles.formLabel}>Título *</Text>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            style={styles.formInput}
            placeholder="Nombre de la guía"
            placeholderTextColor={C.muted}
            maxLength={150}
          />
        </View>

        {/* Categoría + Nivel */}
        <View style={[styles.formRow, { zIndex: 600 }]}>
          <View style={[styles.formGroup, { zIndex: 600 }]}>
            <Text style={styles.formLabel}>Categoría *</Text>
            <SelectField
              value={categoryId}
              options={categoryOptions}
              placeholder="Seleccionar..."
              onChange={setCategoryId}
            />
          </View>
          <View style={[styles.formGroup, { zIndex: 400 }]}>
            <Text style={styles.formLabel}>Nivel *</Text>
            <SelectField
              value={levelId}
              options={levelOptions}
              placeholder="Seleccionar..."
              onChange={setLevelId}
            />
          </View>
        </View>

        {/* Duración */}
        <View style={[styles.formGroup, { zIndex: 1 }]}>
          <Text style={styles.formLabel}>Duración (min) *</Text>
          <TextInput
            value={duracion}
            onChangeText={setDuracion}
            style={styles.formInput}
            placeholder="60"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
          />
        </View>

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Descripción</Text>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.formTextarea}
            placeholder="Descripción de la guía..."
            placeholderTextColor={C.muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Latitud / Longitud */}
        <View style={[styles.formRow, { zIndex: 1 }]}>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Latitud (mapa)</Text>
            <TextInput
              value={latitud}
              onChangeText={setLatitud}
              style={styles.formInput}
              placeholder="-34.6037"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.formLabel}>Longitud (mapa)</Text>
            <TextInput
              value={longitud}
              onChangeText={setLongitud}
              style={styles.formInput}
              placeholder="-58.3816"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {error ? <Text style={styles.generalError}>{error}</Text> : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnSave, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnSaveText}>
                {mode === "create" ? "Crear" : "Guardar"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ id, label }: { id: number | null; label: string }) {
  if (label === "—") return <Text style={styles.tdMuted}>—</Text>;
  if (id === 1) return (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text style={[styles.badgeText, styles.badgeGreenText]}>{label}</Text>
    </View>
  );
  if (id === 2) return (
    <View style={[styles.badge, styles.badgeYellow]}>
      <Text style={[styles.badgeText, styles.badgeYellowText]}>{label}</Text>
    </View>
  );
  return (
    <View style={[styles.badge, styles.badgeRed]}>
      <Text style={[styles.badgeText, styles.badgeRedText]}>{label}</Text>
    </View>
  );
}

// ─── GuidesTab ────────────────────────────────────────────────────────────────

type DeleteTarget = { label: string; onConfirm: () => void };

export function GuidesTab() {
  const { refresh: refreshHomeData } = useHomeData();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<Guide | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>(FALLBACK_CATEGORY);
  const [levelOptions, setLevelOptions] = useState<Option[]>(FALLBACK_LEVEL);

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

  useEffect(() => {
    Promise.all([catalogApi.guideCategories(), catalogApi.guideLevels()])
      .then(([cats, lvls]) => {
        if (cats.length > 0) setCategoryOptions(catalogToOptions(cats));
        if (lvls.length > 0) setLevelOptions(catalogToOptions(lvls));
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  const filtered = guides.filter((g) =>
    (g.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = (saved: Guide) => {
    if (editGuide) {
      setGuides((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    } else {
      setGuides((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
    setEditGuide(null);
    refreshHomeData();
  };

  const handleDelete = (guide: Guide) => {
    setDeleteTarget({
      label: `la guía "${guide.title}"`,
      onConfirm: async () => {
        setDeleteTarget(null);
        setDeletingId(guide.id);
        try {
          await guidesApi.delete(guide.id);
          setGuides((prev) => prev.filter((g) => g.id !== guide.id));
          refreshHomeData();
        } catch (e) {
          setErrorDialog(e instanceof ApiError ? e.message : "No se pudo eliminar la guía.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <View>
      {/* Delete confirmation */}
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

      {/* Modal */}
      {(modalOpen || editGuide) && (
        <GuideModal
          mode={editGuide ? "edit" : "create"}
          initial={editGuide ?? undefined}
          categoryOptions={categoryOptions}
          levelOptions={levelOptions}
          onClose={() => { setModalOpen(false); setEditGuide(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Guías</Text>
          <Text style={styles.pageSubtitle}>Gestión de guías de supervivencia y actividades</Text>
        </View>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => { setEditGuide(null); setModalOpen(true); }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.btnPrimaryText}>Nueva guía</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total guías</Text>
          <Text style={styles.statValue}>{loading ? "—" : guides.length}</Text>
          <Text style={styles.statDelta}>Guías publicadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Categorías</Text>
          <Text style={styles.statValue}>{categoryOptions.length}</Text>
          <Text style={styles.statDelta}>Temáticas disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Niveles</Text>
          <Text style={styles.statValue}>{levelOptions.length}</Text>
          <Text style={styles.statDelta}>Básico · Intermedio · Avanzado</Text>
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={15} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por título..."
            placeholderTextColor={C.muted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          style={styles.filterBtn}
          onPress={() => fetchGuides()}
        >
          <Ionicons name="refresh-outline" size={14} color={C.textSub} />
          <Text style={styles.filterBtnText}>Actualizar</Text>
        </Pressable>
        <Text style={styles.toolbarCount}>
          {filtered.length} de {guides.length} guías
        </Text>
      </View>

      {/* Table */}
      <View style={styles.tableWrap}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { width: 42 }]}>ID</Text>
          <Text style={[styles.thText, { flex: 1 }]}>Título</Text>
          <Text style={[styles.thText, { width: 140 }]}>Categoría</Text>
          <Text style={[styles.thText, { width: 110 }]}>Nivel</Text>
          <Text style={[styles.thText, { width: 80 }]}>Duración</Text>
          <Text style={[styles.thText, { width: 80, textAlign: "right" }]}>Acciones</Text>
        </View>

        {/* Rows */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={C.greenDark} />
          </View>
        ) : fetchError ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="alert-circle-outline" size={28} color={C.red} />
            <Text style={[styles.emptyText, { color: C.red }]}>{fetchError}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="book-outline" size={32} color={C.border} />
            <Text style={styles.emptyText}>
              {search ? "Sin resultados para la búsqueda" : "No hay guías creadas"}
            </Text>
          </View>
        ) : (
          filtered.map((guide, i) => (
            <View
              key={guide.id}
              style={[
                styles.tableRow,
                i === filtered.length - 1 && styles.tableRowLast,
              ]}
            >
              <Text style={[styles.tdMuted, { width: 42 }]}>{guide.id}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tdBold} numberOfLines={1}>{guide.title}</Text>
                {guide.description ? (
                  <Text style={styles.tdMuted} numberOfLines={1}>
                    {guide.description}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.tdText, { width: 140 }]} numberOfLines={1}>
                {categoryOptions.find((o) => o.value === guide.category_id)?.label ?? "—"}
              </Text>
              <View style={{ width: 110 }}>
                <LevelBadge
                  id={guide.complexity_level_id}
                  label={levelOptions.find((o) => o.value === guide.complexity_level_id)?.label ?? "—"}
                />
              </View>
              <Text style={[styles.tdText, { width: 80 }]}>
                {guide.duration != null ? `${guide.duration} min` : "—"}
              </Text>
              <View style={[styles.rowActions, { width: 80, justifyContent: "flex-end" }]}>
                <Pressable
                  style={styles.btnIcon}
                  onPress={() => { setEditGuide(guide); setModalOpen(false); }}
                  disabled={deletingId === guide.id}
                >
                  <Ionicons name="pencil-outline" size={14} color={C.textSub} />
                </Pressable>
                <Pressable
                  style={[styles.btnIcon, styles.btnIconRed]}
                  onPress={() => handleDelete(guide)}
                  disabled={deletingId === guide.id}
                >
                  {deletingId === guide.id ? (
                    <ActivityIndicator size="small" color={C.red} />
                  ) : (
                    <Ionicons name="trash-outline" size={14} color={C.red} />
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
