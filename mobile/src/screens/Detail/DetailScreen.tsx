import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
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
import { routesApi, guidesApi, ApiError, type GuideStep, type GuideProduct, type RouteReview, type RouteDetailData, type RoutePoint } from "@/src/services/api";
import RouteMap from "@/src/components/RouteMap";

type FavoriteStatus = "idle" | "saving";

type EditableFields = {
  title: string;
  description: string;
  subtitle: string;
  distancia: string;
  duracion: string;
};

type EditErrors = {
  title?: string;
  distancia?: string;
  duracion?: string;
};

function parseSubtitle(
  subtitle: string,
  type: string
): { distancia: string; duracion: string } {
  if (type === "activity") {
    const match = subtitle.match(/^([\d.]+)\s*km\s*[·-]\s*(\d+)\s*min/);
    if (match) return { distancia: match[1], duracion: match[2] };
  }
  if (type === "guide") {
    const match = subtitle.match(/^(\d+)\s*min/);
    if (match) return { distancia: "", duracion: match[1] };
  }
  return { distancia: "", duracion: "" };
}

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
  const [editErrors, setEditErrors] = useState<EditErrors>({});

  const initialRouteFields = parseSubtitle(params.subtitle, params.type);
  const [draft, setDraft] = useState<EditableFields>({
    title: params.title,
    description: params.description,
    subtitle: params.subtitle,
    ...initialRouteFields,
  });
  const [displayed, setDisplayed] = useState<EditableFields>({
    title: params.title,
    description: params.description,
    subtitle: params.subtitle,
    ...initialRouteFields,
  });

  // ─── Favorites state ──────────────────────────────────────────────────────
  const [favorited, setFavorited] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>("idle");

  // ─── Extra data from API ──────────────────────────────────────────────────
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [products, setProducts] = useState<GuideProduct[]>([]);
  const [extraLoading, setExtraLoading] = useState(false);

  // ─── Route-specific data ──────────────────────────────────────────────────
  const [routeDetail, setRouteDetail] = useState<RouteDetailData | null>(null);
  const [reviews, setReviews] = useState<RouteReview[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

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
        .catch(() => {})
        .finally(() => setExtraLoading(false));
    } else if (params.type === "activity") {
      Promise.all([
        routesApi.getDetail(id),
        routesApi.getReviews(id),
        routesApi.getPoints(id),
      ])
        .then(([detail, revs, pts]) => {
          setRouteDetail(detail);
          setReviews(revs);
          setRoutePoints(pts);
        })
        .catch(() => {})
        .finally(() => setExtraLoading(false));
    } else {
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
    const errs: EditErrors = {};
    if (!draft.title.trim()) errs.title = "El título no puede estar vacío.";
    if (params.type === "activity") {
      const dist = Number(draft.distancia);
      const dur = Number(draft.duracion);
      if (draft.distancia && (isNaN(dist) || dist <= 0)) errs.distancia = "Distancia inválida.";
      if (draft.duracion && (isNaN(dur) || dur <= 0)) errs.duracion = "Duración inválida.";
    }
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    setEditErrors({});
    setIsSaving(true);
    try {
      const id = Number(params.id);
      if (params.type === "activity") {
        const dist = draft.distancia ? Number(draft.distancia) : undefined;
        const dur = draft.duracion ? Number(draft.duracion) : undefined;
        await routesApi.update(id, {
          nombre: draft.title.trim(),
          descripcion: draft.description.trim() || undefined,
          ...(dist ? { distancia_km: dist } : {}),
          ...(dur ? { duracion_min: dur } : {}),
        });
        const newSubtitle =
          dist && dur ? `${dist} km · ${dur} min`
          : dist ? `${dist} km`
          : dur ? `${dur} min`
          : draft.subtitle;
        setDisplayed({ ...draft, subtitle: newSubtitle });
      } else {
        const dur = draft.duracion ? Number(draft.duracion) : undefined;
        if (dur !== undefined && (isNaN(dur) || dur <= 0)) {
          setEditErrors({ duracion: "Duración inválida." });
          setIsSaving(false);
          return;
        }
        await guidesApi.update(id, {
          titulo: draft.title.trim(),
          descripcion: draft.description.trim() || undefined,
          ...(dur ? { duracion_min: dur } : {}),
        });
        const newSubtitle = dur ? `${dur} min` : draft.subtitle;
        setDisplayed({ ...draft, subtitle: newSubtitle });
      }
      setIsEditing(false);
      refresh();
    } catch (error) {
      setEditErrors({
        title: error instanceof ApiError && error.status === 403
          ? "No tenés permiso para editar este contenido."
          : "No se pudo guardar. Intentá de nuevo.",
      });
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

  const handleSubmitReview = async () => {
    if (userRating === 0 || submittingReview) return;
    setSubmittingReview(true);
    try {
      const newReview = await routesApi.addReview(Number(params.id), userRating);
      setReviews((prev) => [...prev, newReview]);
      setUserRating(0);
    } catch {
      Alert.alert("Error", "No se pudo enviar la reseña. Intentá de nuevo.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.puntaje, 0) / reviews.length
      : (routeDetail?.rating_avg ?? null);

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

          {isAdmin && isBackendItem && !isEditing && Platform.OS === "web" && (
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
              <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>Título *</Text>
              <TextInput
                value={draft.title}
                onChangeText={(v) => { setDraft((d) => ({ ...d, title: v })); setEditErrors((e) => ({ ...e, title: undefined })); }}
                style={[styles.description, { borderWidth: 1, borderColor: editErrors.title ? "#D93025" : "#C5D4CE", borderRadius: 8, padding: 10, marginBottom: 4 }]}
                placeholder="Título"
                placeholderTextColor="#8A9490"
              />
              {editErrors.title && <Text style={{ color: "#D93025", fontSize: 12, marginBottom: 8 }}>{editErrors.title}</Text>}

              <Text style={[styles.sectionTitle, { marginBottom: 4, marginTop: 8 }]}>Descripción</Text>
              <TextInput
                value={draft.description}
                onChangeText={(v) => setDraft((d) => ({ ...d, description: v }))}
                style={[styles.description, { borderWidth: 1, borderColor: "#C5D4CE", borderRadius: 8, padding: 10, minHeight: 100, marginBottom: 12 }]}
                placeholder="Descripción"
                placeholderTextColor="#8A9490"
                multiline
                textAlignVertical="top"
              />

              {(params.type === "activity" || params.type === "guide") && (
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
                  {params.type === "activity" && (
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 4 }]}>Distancia (km)</Text>
                      <TextInput
                        value={draft.distancia}
                        onChangeText={(v) => { setDraft((d) => ({ ...d, distancia: v })); setEditErrors((e) => ({ ...e, distancia: undefined })); }}
                        style={[styles.description, { borderWidth: 1, borderColor: editErrors.distancia ? "#D93025" : "#C5D4CE", borderRadius: 8, padding: 10 }]}
                        placeholder="5.5"
                        placeholderTextColor="#8A9490"
                        keyboardType="decimal-pad"
                      />
                      {editErrors.distancia && <Text style={{ color: "#D93025", fontSize: 12, marginTop: 2 }}>{editErrors.distancia}</Text>}
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 4 }]}>Duración (min)</Text>
                    <TextInput
                      value={draft.duracion}
                      onChangeText={(v) => { setDraft((d) => ({ ...d, duracion: v })); setEditErrors((e) => ({ ...e, duracion: undefined })); }}
                      style={[styles.description, { borderWidth: 1, borderColor: editErrors.duracion ? "#D93025" : "#C5D4CE", borderRadius: 8, padding: 10 }]}
                      placeholder={params.type === "activity" ? "90" : "60"}
                      placeholderTextColor="#8A9490"
                      keyboardType="numeric"
                    />
                    {editErrors.duracion && <Text style={{ color: "#D93025", fontSize: 12, marginTop: 2 }}>{editErrors.duracion}</Text>}
                  </View>
                </View>
              )}

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
                  onPress={() => { setIsEditing(false); setEditErrors({}); }}
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

              {/* ── Route info chips ── */}
              {params.type === "activity" && routeDetail && (
                <View style={styles.chips}>
                  {routeDetail.activity?.nombre ? (
                    <View style={styles.chip}>
                      <Ionicons name="walk-outline" size={13} color="#14342B" />
                      <Text style={styles.chipText}>{routeDetail.activity.nombre}</Text>
                    </View>
                  ) : null}
                  {routeDetail.difficulty?.nombre ? (
                    <View style={styles.chip}>
                      <Ionicons name="trending-up-outline" size={13} color="#14342B" />
                      <Text style={styles.chipText}>{routeDetail.difficulty.nombre}</Text>
                    </View>
                  ) : null}
                  {routeDetail.location?.ciudad ? (
                    <View style={styles.chip}>
                      <Ionicons name="location-outline" size={13} color="#14342B" />
                      <Text style={styles.chipText}>
                        {routeDetail.location.ciudad}, {routeDetail.location.pais}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* ── Route images gallery ── */}
              {params.type === "activity" && routeDetail && routeDetail.images.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Fotos</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.gallery}
                    contentContainerStyle={{ gap: 10, paddingRight: 4 }}
                  >
                    {routeDetail.images.map((img) => (
                      <Image
                        key={img.id_ruta_imagen}
                        source={{ uri: img.url }}
                        style={styles.galleryImage}
                      />
                    ))}
                  </ScrollView>
                </>
              )}

              {/* ── Route map with polyline ── */}
              {params.type === "activity" && routePoints.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recorrido</Text>
                  <RouteMap points={routePoints} />
                </>
              )}

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

              {/* ── Reviews section ── */}
              {params.type === "activity" && isBackendItem && (
                <>
                  <Text style={styles.sectionTitle}>Reseñas</Text>

                  {extraLoading ? (
                    <ActivityIndicator color="#14342B" style={{ marginVertical: 8 }} />
                  ) : (
                    <>
                      {/* Average rating */}
                      {avgRating !== null && (
                        <View style={styles.ratingRow}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Ionicons
                              key={i}
                              name={i <= Math.round(avgRating) ? "star" : "star-outline"}
                              size={18}
                              color="#F59E0B"
                            />
                          ))}
                          <Text style={styles.ratingLabel}>
                            {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
                          </Text>
                        </View>
                      )}

                      {/* Reviews list */}
                      {reviews.length === 0 && avgRating === null && (
                        <Text style={[styles.description, { color: "#8A9490", marginBottom: 8 }]}>
                          Todavía no hay reseñas. ¡Sé el primero!
                        </Text>
                      )}
                      {reviews.map((r) => (
                        <View key={r.id_resenia_ruta} style={styles.reviewCard}>
                          <View style={{ flexDirection: "row", gap: 3 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Ionicons
                                key={i}
                                name={i <= r.puntaje ? "star" : "star-outline"}
                                size={14}
                                color="#F59E0B"
                              />
                            ))}
                          </View>
                        </View>
                      ))}

                      {/* Add review form */}
                      {token && (
                        <View style={styles.reviewForm}>
                          <Text style={[styles.description, { fontWeight: "600", marginBottom: 8 }]}>
                            Tu calificación
                          </Text>
                          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Pressable key={i} onPress={() => setUserRating(i)}>
                                <Ionicons
                                  name={i <= userRating ? "star" : "star-outline"}
                                  size={30}
                                  color="#F59E0B"
                                />
                              </Pressable>
                            ))}
                          </View>
                          <Pressable
                            style={[
                              styles.reviewSubmitBtn,
                              (userRating === 0 || submittingReview) && { opacity: 0.45 },
                            ]}
                            onPress={handleSubmitReview}
                            disabled={userRating === 0 || submittingReview}
                          >
                            {submittingReview ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <Text style={styles.primaryButtonText}>Enviar reseña</Text>
                            )}
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                </>
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
