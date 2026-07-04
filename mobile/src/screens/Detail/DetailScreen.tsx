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
import { routesApi, guidesApi, ApiError, type GuideStep, type GuideProduct, type RouteDetailData, type RoutePoint } from "@/src/services/api";
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

// Reviews come back from the backend shaped differently for routes
// (id_resenia_ruta) vs guides (id_resenia_guia) — normalize both to this
// shape so the rest of the screen doesn't need to branch on type.
type NormalizedReview = {
  id: number;
  id_usuario: number;
  puntaje: number;
};

function ratingLabel(r: number) {
  if (r >= 4.5) return "Excelente";
  if (r >= 4.0) return "Muy bueno";
  if (r >= 3.0) return "Bueno";
  if (r >= 2.0) return "Regular";
  return "Mejorable";
}

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
  const { isAdmin, token, user } = useAuth();
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
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isBackendItem) return;
    const id = Number(params.id);
    setExtraLoading(true);

    if (params.type === "guide") {
      if (token) {
        guidesApi.checkFavorite(id).then((r) => setFavorited(r.is_favorited)).catch(() => {});
      }
      Promise.all([guidesApi.getSteps(id), guidesApi.getProducts(id), guidesApi.getReviews(id)])
        .then(([s, p, revs]) => {
          setSteps(s.sort((a, b) => a.order - b.order));
          setProducts(p);
          setReviews(revs.map((r) => ({ id: r.id_resenia_guia, id_usuario: r.id_usuario, puntaje: r.puntaje })));
        })
        .catch(() => {})
        .finally(() => setExtraLoading(false));
    } else if (params.type === "activity") {
      if (token) {
        routesApi.checkFavorite(id).then((r) => setFavorited(r.is_favorited)).catch(() => {});
      }
      // Fetched independently: one endpoint failing (e.g. an activity with no
      // recorded route points) must not wipe out data the others already got,
      // like reviews.
      routesApi.getDetail(id).then(setRouteDetail).catch(() => {});
      routesApi.getReviews(id)
        .then((revs) => setReviews(revs.map((r) => ({ id: r.id_resenia_ruta, id_usuario: r.id_usuario, puntaje: r.puntaje }))))
        .catch(() => {});
      routesApi.getPoints(id)
        .then(setRoutePoints)
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

  const myReview = user ? reviews.find((r) => r.id_usuario === user.id_usuario) ?? null : null;

  const handleSubmitReview = async () => {
    if (userRating === 0 || submittingReview || myReview) return;
    setSubmittingReview(true);
    try {
      const id = Number(params.id);
      // Apply the backend's response to local state immediately, instead of
      // waiting on a refetch to learn "you've already reviewed this". If a
      // refetch below fails, the UI must still know the submission went
      // through — otherwise the form stays open and the user resubmits,
      // creating duplicate reviews server-side (this is why activity ratings
      // looked like they "didn't persist": every retry was actually a new row).
      if (params.type === "guide") {
        const created = await guidesApi.addReview(id, userRating);
        setReviews((prev) => [...prev, { id: created.id_resenia_guia, id_usuario: created.id_usuario, puntaje: created.puntaje }]);
      } else {
        const created = await routesApi.addReview(id, userRating);
        setReviews((prev) => [...prev, { id: created.id_resenia_ruta, id_usuario: created.id_usuario, puntaje: created.puntaje }]);
      }
      setUserRating(0);

      // Best-effort sync with the backend afterwards; a failure here is silent
      // since the local state above already reflects the successful submission.
      try {
        if (params.type === "guide") {
          const revs = await guidesApi.getReviews(id);
          setReviews(revs.map((r) => ({ id: r.id_resenia_guia, id_usuario: r.id_usuario, puntaje: r.puntaje })));
        } else {
          const [revs, detail] = await Promise.all([
            routesApi.getReviews(id),
            routesApi.getDetail(id),
          ]);
          setReviews(revs.map((r) => ({ id: r.id_resenia_ruta, id_usuario: r.id_usuario, puntaje: r.puntaje })));
          setRouteDetail(detail);
        }
      } catch {}
    } catch {
      Alert.alert("Error", "No se pudo enviar la reseña. Intentá de nuevo.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.puntaje, 0) / reviews.length
      : params.type === "activity" ? (routeDetail?.rating_avg ?? null) : null;

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
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

          {(params.type === "activity" || params.type === "guide") && avgRating !== null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingBadgeValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingBadgeLabel}>
                {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.typeRow}>
            <Text style={styles.type}>{typeLabel}</Text>
          </View>

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

              {(displayed.distancia || displayed.duracion) && (
                <View style={styles.statsRow}>
                  {displayed.distancia ? (
                    <View style={styles.statCard}>
                      <Ionicons name="navigate-outline" size={18} color="#10A95A" />
                      <Text style={styles.statValue}>{displayed.distancia} km</Text>
                      <Text style={styles.statLabel}>Distancia</Text>
                    </View>
                  ) : null}
                  {displayed.duracion ? (
                    <View style={styles.statCard}>
                      <Ionicons name="time-outline" size={18} color="#10A95A" />
                      <Text style={styles.statValue}>{displayed.duracion} min</Text>
                      <Text style={styles.statLabel}>Duracion</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* ── Description ── */}
              {displayed.description ? (
                <>
                  <Text style={styles.sectionTitle}>Descripcion</Text>
                  <Text style={styles.description}>{displayed.description}</Text>
                </>
              ) : null}

              {/* ── Amenity grid ── */}
              {params.type === "activity" && routeDetail && (routeDetail.activity?.nombre || routeDetail.difficulty?.nombre || routeDetail.location?.ciudad) && (
                <View style={styles.amenityGrid}>
                  {routeDetail.activity?.nombre ? (
                    <View style={styles.amenityItem}>
                      <Ionicons name="walk-outline" size={22} color="#14342B" />
                      <View>
                        <Text style={styles.amenityName}>{routeDetail.activity.nombre}</Text>
                        <Text style={styles.amenityDesc}>Tipo de actividad</Text>
                      </View>
                    </View>
                  ) : null}
                  {routeDetail.difficulty?.nombre ? (
                    <View style={styles.amenityItem}>
                      <Ionicons name="trending-up-outline" size={22} color="#14342B" />
                      <View>
                        <Text style={styles.amenityName}>{routeDetail.difficulty.nombre}</Text>
                        <Text style={styles.amenityDesc}>Dificultad</Text>
                      </View>
                    </View>
                  ) : null}
                  {routeDetail.location?.ciudad ? (
                    <View style={styles.amenityItem}>
                      <Ionicons name="location-outline" size={22} color="#14342B" />
                      <View>
                        <Text style={styles.amenityName}>{routeDetail.location.ciudad}</Text>
                        <Text style={styles.amenityDesc}>{routeDetail.location.pais}</Text>
                      </View>
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
              {(params.type === "activity" || params.type === "guide") && isBackendItem && (
                <>
                  <Text style={styles.sectionTitle}>Reseñas</Text>

                  {extraLoading ? (
                    <ActivityIndicator color="#14342B" style={{ marginVertical: 8 }} />
                  ) : (
                    <>
                      {/* Average rating badge */}
                      {avgRating !== null && (
                        <View style={styles.ratingHeader}>
                          <View style={styles.scoreBadge}>
                            <Text style={styles.scoreValue}>{avgRating.toFixed(1)}</Text>
                          </View>
                          <View>
                            <Text style={styles.scoreLabel}>{ratingLabel(avgRating)}</Text>
                            <Text style={styles.reviewCount}>
                              {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Reviews list */}
                      {reviews.length === 0 && avgRating === null && (
                        <Text style={[styles.description, { color: "#8A9490", marginBottom: 8 }]}>
                          Todavía no hay reseñas. ¡Sé el primero!
                        </Text>
                      )}
                      {reviews.map((r) => (
                        <View key={r.id} style={styles.reviewCard}>
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
                      {token && myReview && (
                        <View style={styles.reviewForm}>
                          <Text style={[styles.description, { fontWeight: "600", marginBottom: 8 }]}>
                            Ya calificaste esta actividad
                          </Text>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Ionicons
                                key={i}
                                name={i <= myReview.puntaje ? "star" : "star-outline"}
                                size={30}
                                color="#F59E0B"
                              />
                            ))}
                          </View>
                        </View>
                      )}
                      {token && !myReview && (
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
