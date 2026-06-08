import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/src/services/firebase";
import { TIP_CATEGORIES, TIPS, type Tip, type TipStep } from "@/src/data/tipsData";
import { styles, C } from "../AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentSubTab = "tips" | "institucional";

type EditableTip = {
  id: string;
  title: string;
  summary: string;
  body: string;
  steps: TipStep[];
};

type InstitutionalContent = {
  mision: string;
  descripcionEquipo: string;
};

// ─── TipModal ─────────────────────────────────────────────────────────────────

function TipModal({
  tip,
  onClose,
  onSaved,
}: {
  tip: EditableTip;
  onClose: () => void;
  onSaved: (updated: EditableTip) => void;
}) {
  const [title, setTitle] = useState(tip.title);
  const [summary, setSummary] = useState(tip.summary);
  const [body, setBody] = useState(tip.body);
  const [steps, setSteps] = useState<TipStep[]>(tip.steps.map((s) => ({ ...s })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStepChange = (index: number, text: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, text } : s)));
  };

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { order: prev.length + 1, text: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("El título es obligatorio."); return; }
    setSaving(true);
    setError(null);
    try {
      const updated: EditableTip = {
        id: tip.id,
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
        steps: steps.filter((s) => s.text.trim()).map((s, i) => ({ order: i + 1, text: s.text.trim() })),
      };
      await setDoc(doc(db, "tips_overrides", tip.id), updated);
      onSaved(updated);
    } catch {
      setError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modal, { width: 580, maxHeight: "85%" as never, overflow: "hidden" }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Editar tip</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Título *</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.formInput} placeholderTextColor={C.muted} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Resumen</Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              style={styles.formTextarea}
              multiline
              textAlignVertical="top"
              placeholderTextColor={C.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cuerpo explicativo</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              style={[styles.formTextarea, { minHeight: 90 }]}
              multiline
              textAlignVertical="top"
              placeholderTextColor={C.muted}
            />
          </View>

          <View style={[styles.formGroup, { marginBottom: 6 }]}>
            <Text style={styles.formLabel}>Pasos ({steps.length})</Text>
          </View>

          {steps.map((step, index) => (
            <View key={index} style={[styles.formRow, { alignItems: "flex-start", marginBottom: 8 }]}>
              <View
                style={{
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: C.greenDark,
                  alignItems: "center", justifyContent: "center",
                  marginTop: 7, flexShrink: 0,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{step.order}</Text>
              </View>
              <TextInput
                value={step.text}
                onChangeText={(v) => handleStepChange(index, v)}
                style={[styles.formTextarea, { flex: 1, minHeight: 52, marginBottom: 0 }]}
                multiline
                textAlignVertical="top"
                placeholderTextColor={C.muted}
                placeholder={`Paso ${step.order}...`}
              />
              <Pressable
                style={[styles.btnIcon, styles.btnIconRed, { marginTop: 4 }]}
                onPress={() => handleRemoveStep(index)}
              >
                <Ionicons name="trash-outline" size={13} color={C.red} />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={[styles.filterBtn, { alignSelf: "flex-start", marginBottom: 16 }]}
            onPress={handleAddStep}
          >
            <Ionicons name="add" size={14} color={C.textSub} />
            <Text style={styles.filterBtnText}>Agregar paso</Text>
          </Pressable>

          {error ? <Text style={styles.generalError}>{error}</Text> : null}
        </ScrollView>

        <View style={[styles.modalFooter, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16, marginTop: 8 }]}>
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
              : <Text style={styles.btnSaveText}>Guardar cambios</Text>
            }
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── InstitucionalForm ────────────────────────────────────────────────────────

function InstitucionalForm() {
  const [content, setContent] = useState<InstitutionalContent>({
    mision: "",
    descripcionEquipo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "contenido_institucional", "about"))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setContent({
            mision: data.mision ?? "",
            descripcionEquipo: data.descripcionEquipo ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "contenido_institucional", "about"), content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore - user sees no feedback but save didn't crash
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator color={C.greenDark} />
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Misión de la plataforma</Text>
        <TextInput
          value={content.mision}
          onChangeText={(v) => setContent((c) => ({ ...c, mision: v }))}
          style={[styles.formTextarea, { minHeight: 100 }]}
          multiline
          textAlignVertical="top"
          placeholder="Texto de misión que se muestra en la sección 'Quiénes somos'..."
          placeholderTextColor={C.muted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Descripción del equipo</Text>
        <TextInput
          value={content.descripcionEquipo}
          onChangeText={(v) => setContent((c) => ({ ...c, descripcionEquipo: v }))}
          style={[styles.formTextarea, { minHeight: 80 }]}
          multiline
          textAlignVertical="top"
          placeholder="Descripción del equipo de SurvixApp..."
          placeholderTextColor={C.muted}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          style={[styles.btnSave, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnSaveText}>Guardar textos</Text>
          }
        </Pressable>
        {saved && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>
              Guardado correctamente
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── ContentTab ───────────────────────────────────────────────────────────────

export function ContentTab() {
  const [subTab, setSubTab] = useState<ContentSubTab>("tips");
  const [editingTip, setEditingTip] = useState<EditableTip | null>(null);
  const [overrides, setOverrides] = useState<Record<string, EditableTip>>({});
  const [loadingOverrides, setLoadingOverrides] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Load all tip overrides from Firestore on mount
  useEffect(() => {
    const fetches = TIPS.map((tip) =>
      getDoc(doc(db, "tips_overrides", tip.id)).then((snap) => ({
        id: tip.id,
        data: snap.exists() ? (snap.data() as EditableTip) : null,
      }))
    );
    Promise.all(fetches)
      .then((results) => {
        const map: Record<string, EditableTip> = {};
        results.forEach(({ id, data }) => { if (data) map[id] = data; });
        setOverrides(map);
      })
      .catch(() => {})
      .finally(() => setLoadingOverrides(false));
  }, []);

  const getTipData = (tip: Tip): EditableTip => {
    const ov = overrides[tip.id];
    return {
      id: tip.id,
      title: ov?.title ?? tip.title,
      summary: ov?.summary ?? tip.summary,
      body: ov?.body ?? tip.body,
      steps: ov?.steps ?? tip.steps,
    };
  };

  const handleSaved = (updated: EditableTip) => {
    setOverrides((prev) => ({ ...prev, [updated.id]: updated }));
    setEditingTip(null);
  };

  const filteredTips = categoryFilter === "all"
    ? TIPS
    : TIPS.filter((t) => t.categoryId === categoryFilter);

  const SUB_TABS: { id: ContentSubTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "tips",          label: "Tips de supervivencia", icon: "shield-checkmark-outline" },
    { id: "institucional", label: "Textos institucionales",  icon: "document-text-outline" },
  ];

  return (
    <View>
      {/* Tip edit modal */}
      {editingTip && (
        <TipModal
          tip={editingTip}
          onClose={() => setEditingTip(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Gestión de contenido</Text>
          <Text style={styles.pageSubtitle}>
            Editar tips, recursos y textos institucionales de la plataforma.
          </Text>
        </View>
      </View>

      {/* Sub-tabs */}
      <View style={styles.filterTabs}>
        {SUB_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.filterTab, subTab === tab.id && styles.filterTabActive]}
            onPress={() => setSubTab(tab.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                subTab === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Tips tab ─────────────────────────────────────────────────────── */}
      {subTab === "tips" && (
        <View>
          {/* Category filter */}
          <View style={[styles.toolbar, { marginBottom: 16 }]}>
            <Pressable
              style={[styles.filterBtn, categoryFilter === "all" && { backgroundColor: C.greenLight, borderColor: C.greenDark }]}
              onPress={() => setCategoryFilter("all")}
            >
              <Text style={[styles.filterBtnText, categoryFilter === "all" && { color: C.greenDark, fontWeight: "600" }]}>
                Todas
              </Text>
            </Pressable>
            {TIP_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.filterBtn, categoryFilter === cat.id && { backgroundColor: C.greenLight, borderColor: C.greenDark }]}
                onPress={() => setCategoryFilter(cat.id)}
              >
                <Text style={[styles.filterBtnText, categoryFilter === cat.id && { color: C.greenDark, fontWeight: "600" }]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
            <Text style={styles.toolbarCount}>
              {filteredTips.length} tips · {Object.keys(overrides).length} con sobreescritura
            </Text>
          </View>

          {/* Table */}
          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { flex: 1 }]}>Título</Text>
              <Text style={[styles.thText, { width: 130 }]}>Categoría</Text>
              <Text style={[styles.thText, { width: 60 }]}>Pasos</Text>
              <Text style={[styles.thText, { width: 100 }]}>Estado</Text>
              <Text style={[styles.thText, { width: 70, textAlign: "right" }]}>Acción</Text>
            </View>

            {loadingOverrides ? (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color={C.greenDark} />
              </View>
            ) : filteredTips.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Sin tips para esta categoría</Text>
              </View>
            ) : (
              filteredTips.map((tip, i) => {
                const cat = TIP_CATEGORIES.find((c) => c.id === tip.categoryId);
                const hasOverride = !!overrides[tip.id];
                const tipData = getTipData(tip);

                return (
                  <View
                    key={tip.id}
                    style={[styles.tableRow, i === filteredTips.length - 1 && styles.tableRowLast]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tdBold} numberOfLines={1}>{tipData.title}</Text>
                      <Text style={styles.tdMuted} numberOfLines={1}>{tipData.summary}</Text>
                    </View>
                    <Text style={[styles.tdText, { width: 130 }]} numberOfLines={1}>
                      {cat?.label ?? "—"}
                    </Text>
                    <Text style={[styles.tdMuted, { width: 60 }]}>
                      {tipData.steps.length}
                    </Text>
                    <View style={{ width: 100 }}>
                      {hasOverride ? (
                        <View style={[styles.badge, styles.badgeBlue]}>
                          <Text style={[styles.badgeText, styles.badgeBlueText]}>Editado</Text>
                        </View>
                      ) : (
                        <View style={[styles.badge, styles.badgeGray]}>
                          <Text style={[styles.badgeText, styles.badgeGrayText]}>Original</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ width: 70, alignItems: "flex-end" }}>
                      <Pressable
                        style={styles.btnIcon}
                        onPress={() => setEditingTip(tipData)}
                      >
                        <Ionicons name="pencil-outline" size={14} color={C.textSub} />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      )}

      {/* ── Textos institucionales tab ────────────────────────────────────── */}
      {subTab === "institucional" && (
        <View
          style={{
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <Text style={[styles.panelTitle, { marginBottom: 4 }]}>
            Contenido de la página "Quiénes somos"
          </Text>
          <Text style={[styles.pageSubtitle, { marginBottom: 20 }]}>
            Los cambios se reflejan inmediatamente en la sección About de la app.
          </Text>
          <InstitucionalForm />
        </View>
      )}
    </View>
  );
}
