import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import type { PurchaseLink } from "@/src/data/homeData";
import { styles } from "./DetailScreen.styles";
import { useAuth } from "@/src/context/AuthContext";
import { useHomeData } from "@/src/context/HomeDataContext";
import { routesApi, guidesApi, ApiError, type GuideStep, type GuideProduct } from "@/src/services/api";

type FavoriteStatus = "idle" | "saving";

type EditableFields = {
  title: string;
  description: string;
  subtitle: string;
};

export default function DetailScreen() {
  const router = useRouter();
  const { isAdmin, token } = useAuth();
  const { refresh } = useHomeData();

  const params = useLocalSearchParams<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    purchaseLinks?: string;
  }>();

  const isBackendItem =
    (params.type === "activity" || params.type === "guide") &&
    !isNaN(Number(params.id));

  // ─── Edit / delete state ──────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [draft, setDraft] = useState<EditableFields>({
    title: params.title,
    description: params.description,
    subtitle: params.subtitle,
  });
  const [displayed, setDisplayed] = useState<EditableFields>({
    title: params.title,
    description: params.description,
    subtitle: params.subtitle,
  });

  // ─── Favorites state ──────────────────────────────────────────────────────
  const [favorited, setFavorited] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>("idle");

  // ─── Extra data from API ──────────────────────────────────────────────────
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [products, setProducts] = useState<GuideProduct[]>([]);
  const [extraLoading, setExtraLoading] = useState(false);

  useEffect(() => {
    if (!isBackendItem) return;
    const id = Number(params.id);
    setExtraLoading(true);

    if (params.type === "guide") {
      Promise.all([guidesApi.getSteps(id), guidesApi.getProducts(id)])
        .then(([s, p]) => {
          setSteps(s.sort((a, b) => a.order - b.order));
          setProducts(p);
        })
        .catch(() => {}) // extra data is non-critical
        .finally(() => setExtraLoading(false));
    } else {
      // For routes, nothing extra to fetch beyond what we have
      setExtraLoading(false);
    }
  }, [params.id, params.type, isBackendItem]);

  // ─── Purchase links (equipment, mocked) ───────────────────────────────────
  const purchaseLinks: PurchaseLink[] = params.purchaseLinks
    ? JSON.parse(params.purchaseLinks)
    : [];

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePurchaseLinkPress = (link: PurchaseLink) => {
    Alert.alert(
      "Estas saliendo de Survix",
      `Vas a abrir ${link.label} en tu navegador.`,
      [
        { text: "Mejor no", style: "cancel" },
        { text: "OK", onPress: () => { void Linking.openURL(link.url); } },
      ]
    );
  };

  const handleProductPress = (url: string | null) => {
    if (!url) return;
    Alert.alert(
      "Estas saliendo de Survix",
      "Vas a abrir el producto en tu navegador.",
      [
        { text: "Mejor no", style: "cancel" },
        { text: "OK", onPress: () => { void Linking.openURL(url); } },
      ]
    );
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      Alert.alert("Error", "El título no puede estar vacío.");
      return;
    }
    setIsSaving(true);
    try {
      const id = Number(params.id);
      if (params.type === "activity") {
        await routesApi.update(id, {
          nombre: draft.title.trim(),
          descripcion: draft.description.trim() || undefined,
        });
      } else {
        await guidesApi.update(id, {
          titulo: draft.title.trim(),
          descripcion: draft.description.trim() || undefined,
        });
      }
      setDisplayed({ ...draft });
      setIsEditing(false);
      refresh();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof ApiError && error.status === 403
          ? "No tenés permiso para editar este contenido."
          : "No se pudo guardar. Intentá de nuevo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (favoriteStatus === "saving") return;
    const next = !favorited;
    setFavorited(next);
    setFavoriteStatus("saving");
    try {
      const id = Number(params.id);
      if (params.type === "activity") {
        next ? await routesApi.addFavorite(id) : await routesApi.removeFavorite(id);
      } else {
        next ? await guidesApi.addFavorite(id) : await guidesApi.removeFavorite(id);
      }
    } catch {
      setFavorited(!next);
      Alert.alert("Error", "No se pudo actualizar el favorito.");
    } finally {
      setFavoriteStatus("idle");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar",
      `¿Seguro que querés eliminar "${displayed.title}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const id = Number(params.id);
              if (params.type === "activity") {
                await routesApi.delete(id);
              } else {
                await guidesApi.delete(id);
              }
              refresh();
              router.back();
            } catch (error) {
              setIsDeleting(false);
              Alert.alert(
                "Error",
                error instanceof ApiError && error.status === 403
                  ? "No tenés permiso para eliminar este contenido."
                  : "No se pudo eliminar. Intentá de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const typeLabel =
    params.type === "activity" ? "Actividad"
    : params.type === "guide" ? "Guia"
    : "Equipamiento";

  if (isDeleting) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#14342B" />
        <Text style={{ marginTop: 12, color: "#14342B" }}>Eliminando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero image ── */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: params.image }} style={styles.image} />

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          {isAdmin && isBackendItem && !isEditing && (
            <View style={{ position: "absolute", top: 16, right: 16, flexDirection: "row", gap: 8 }}>
              <Pressable
                style={{ backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, padding: 8 }}
                onPress={() => { setDraft({ ...displayed }); setIsEditing(true); }}
              >
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={{ backgroundColor: "rgba(180,30,30,0.8)", borderRadius: 8, padding: 8 }}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.type}>{typeLabel}</Text>

          {/* ── Edit mode ── */}
          {isEditing ? (
            <>
              <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>Título</Text>
              <TextInput
                value={draft.title}
                onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
                style={[styles.description, { borderWidth: 1, borderColor: "#C5D4CE", borderRadius: 8, padding: 10, marginBottom: 12 }]}
                placeholder="Título"
                placeholderTextColor="#8A9490"
              />

              <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>Descripción</Text>
              <TextInput
                value={draft.description}
                onChangeText={(v) => setDraft((d) => ({ ...d, description: v }))}
                style={[styles.description, { borderWidth: 1, borderColor: "#C5D4CE", borderRadius: 8, padding: 10, minHeight: 100 }]}
                placeholder="Descripción"
                placeholderTextColor="#8A9490"
                multiline
                textAlignVertical="top"
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <Pressable
                  style={[styles.primaryButton, { flex: 1, opacity: isSaving ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryButtonText}>Guardar</Text>
                  }
                </Pressable>
                <Pressable
                  style={[styles.primaryButton, { flex: 1, backgroundColor: "#8A9490" }]}
                  onPress={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.primaryButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{displayed.title}</Text>
              <Text style={styles.subtitle}>{displayed.subtitle}</Text>

              {/* ── Description ── */}
              {displayed.description ? (
                <>
                  <Text style={styles.sectionTitle}>Descripcion</Text>
                  <Text style={styles.description}>{displayed.description}</Text>
                </>
              ) : null}

              {/* ── Guide steps ── */}
              {params.type === "guide" && (
                extraLoading ? (
                  <ActivityIndicator color="#14342B" style={{ marginTop: 16 }} />
                ) : steps.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Pasos</Text>
                    {steps.map((step) => (
                      <View
                        key={step.id}
                        style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}
                      >
                        <View style={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: "#14342B",
                          justifyContent: "center", alignItems: "center",
                          marginTop: 2, flexShrink: 0,
                        }}>
                          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>
                            {step.order}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          {step.title ? (
                            <Text style={[styles.description, { fontWeight: "700", marginBottom: 2 }]}>
                              {step.title}
                            </Text>
                          ) : null}
                          <Text style={styles.description}>{step.description}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : null
              )}

              {/* ── Equipment purchase links (mocked) ── */}
              {params.type === "equipment" && purchaseLinks.length > 0 && (
                <View style={styles.linksSection}>
                  <Text style={styles.sectionTitle}>Donde comprar</Text>
                  <Text style={styles.description}>
                    Elegi una tienda para ver opciones de compra disponibles.
                  </Text>
                  <View style={styles.linksList}>
                    {purchaseLinks.map((link) => (
                      <Pressable
                        key={`${params.id}-${link.label}`}
                        style={styles.linkCard}
                        onPress={() => handlePurchaseLinkPress(link)}
                      >
                        <View style={styles.linkCopy}>
                          <Text style={styles.linkLabel}>{link.label}</Text>
                          <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                        </View>
                        <Ionicons name="open-outline" size={18} color="#103D34" />
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* ── Guide products ── */}
              {params.type === "guide" && products.length > 0 && (
                <View style={styles.linksSection}>
                  <Text style={styles.sectionTitle}>Productos relacionados</Text>
                  <View style={styles.linksList}>
                    {products.map((product) => (
                      <Pressable
                        key={product.id}
                        style={styles.linkCard}
                        onPress={() => handleProductPress(product.url)}
                        disabled={!product.url}
                      >
                        <View style={styles.linkCopy}>
                          <Text style={styles.linkLabel}>{product.name}</Text>
                          {product.url ? (
                            <Text style={styles.linkUrl} numberOfLines={1}>{product.url}</Text>
                          ) : null}
                        </View>
                        {product.url ? (
                          <Ionicons name="open-outline" size={18} color="#103D34" />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* ── Favorites button ── */}
              {isBackendItem && token && (
                <Pressable
                  style={[
                    styles.primaryButton,
                    favorited && { backgroundColor: "#18B678" },
                    favoriteStatus === "saving" && { opacity: 0.7 },
                  ]}
                  onPress={handleToggleFavorite}
                  disabled={favoriteStatus === "saving"}
                >
                  {favoriteStatus === "saving" ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons
                        name={favorited ? "heart" : "heart-outline"}
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.primaryButtonText}>
                        {favorited ? "Guardado en favoritos" : "Guardar en favoritos"}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
