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
import { guidesApi, ApiError, type Guide } from "@/src/services/api";
import { useHomeData } from "@/src/context/HomeDataContext";
import { styles, C } from "../AdminScreen.styles";

// ─── Catalogs ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 1, label: "Supervivencia" },
  { value: 2, label: "Primeros Auxilios" },
  { value: 3, label: "Equipamiento" },
  { value: 4, label: "Orientación" },
  { value: 5, label: "Alimentación en campo" },
  { value: 6, label: "Técnicas de escalada" },
];

const LEVEL_OPTIONS = [
  { value: 1, label: "Básico" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Avanzado" },
];

function categoryLabel(id: number | null) {
  return CATEGORY_OPTIONS.find((o) => o.value === id)?.label ?? "—";
}

function levelLabel(id: number | null) {
  return LEVEL_OPTIONS.find((o) => o.value === id)?.label ?? "—";
}

// ─── SelectField ─────────────────────────────────────────────────────────────

type Option = { value: number; label: string };

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
  onClose: () => void;
  onSaved: (g: Guide) => void;
};

function GuideModal({ mode, initial, onClose, onSaved }: GuideModalProps) {
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
          descripcion: descripcion.trim() || undefined,
          duracion_min: Number(duracion),
          id_categoria_guias: categoryId!,
          id_nivel_complejidad: levelId!,
        });
      } else {
        result = await guidesApi.update(initial!.id, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          duracion_min: Number(duracion),
          id_categoria_guias: categoryId!,
          id_nivel_complejidad: levelId!,
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
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>
          {mode === "create" ? "Nueva guía" : "Editar guía"}
        </Text>

        {/* Título */}
        <View style={styles.formGroup}>
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
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { zIndex: 600 }]}>
            <Text style={styles.formLabel}>Categoría *</Text>
            <SelectField
              value={categoryId}
              options={CATEGORY_OPTIONS}
              placeholder="Seleccionar..."
              onChange={setCategoryId}
            />
          </View>
          <View style={[styles.formGroup, { zIndex: 400 }]}>
            <Text style={styles.formLabel}>Nivel *</Text>
            <SelectField
              value={levelId}
              options={LEVEL_OPTIONS}
              placeholder="Seleccionar..."
              onChange={setLevelId}
            />
          </View>
        </View>

        {/* Duración */}
        <View style={styles.formGroup}>
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

function LevelBadge({ id }: { id: number | null }) {
  if (id === 1) return (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text style={[styles.badgeText, styles.badgeGreenText]}>Básico</Text>
    </View>
  );
  if (id === 2) return (
    <View style={[styles.badge, styles.badgeYellow]}>
      <Text style={[styles.badgeText, styles.badgeYellowText]}>Intermedio</Text>
    </View>
  );
  if (id === 3) return (
    <View style={[styles.badge, styles.badgeRed]}>
      <Text style={[styles.badgeText, styles.badgeRedText]}>Avanzado</Text>
    </View>
  );
  return <Text style={styles.tdMuted}>—</Text>;
}

// ─── GuidesTab ────────────────────────────────────────────────────────────────

export function GuidesTab() {
  const { refresh: refreshHomeData } = useHomeData();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<Guide | null>(null);
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

  const filtered = guides.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
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

  const handleDelete = async (guide: Guide) => {
    const ok = (globalThis as unknown as { confirm: (s: string) => boolean }).confirm(
      `¿Eliminar la guía "${guide.title}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setDeletingId(guide.id);
    try {
      await guidesApi.delete(guide.id);
      setGuides((prev) => prev.filter((g) => g.id !== guide.id));
      refreshHomeData();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "No se pudo eliminar la guía.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View>
      {/* Modal */}
      {(modalOpen || editGuide) && (
        <GuideModal
          mode={editGuide ? "edit" : "create"}
          initial={editGuide ?? undefined}
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
          <Text style={styles.statValue}>{CATEGORY_OPTIONS.length}</Text>
          <Text style={styles.statDelta}>Temáticas disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Niveles</Text>
          <Text style={styles.statValue}>{LEVEL_OPTIONS.length}</Text>
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
                {categoryLabel(guide.category_id)}
              </Text>
              <View style={{ width: 110 }}>
                <LevelBadge id={guide.complexity_level_id} />
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
