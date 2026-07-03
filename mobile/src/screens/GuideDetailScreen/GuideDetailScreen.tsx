import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./GuideDetailScreen.styles";
import { guidesApi, type GuideStep, type GuideProduct, type GuideReview } from "@/src/services/api";
import { offlineService, type OfflineGuide } from "@/src/services/offlineService";
import { useAuth } from "@/src/context/AuthContext";

const MOBILE_SUMMARY_STEPS = 3;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";

type DownloadState = "idle" | "checking" | "downloading" | "saved" | "removing";

function ratingLabel(r: number) {
  if (r >= 4.5) return "Excelente";
  if (r >= 4.0) return "Muy bueno";
  if (r >= 3.0) return "Bueno";
  if (r >= 2.0) return "Regular";
  return "Mejorable";
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step }: { step: GuideStep }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step.order}</Text>
      </View>
      <View style={styles.stepBody}>
        {step.title ? (
          <Text style={styles.stepTitle}>{step.title}</Text>
        ) : null}
        <Text style={styles.stepDesc}>{step.description}</Text>
      </View>
    </View>
  );
}

// ─── GuideDetailScreen ────────────────────────────────────────────────────────

export default function GuideDetailScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    offline?: string;
  }>();

  const isOffline = params.offline === "true";
  const isMobile = Platform.OS !== "web";

  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [products, setProducts] = useState<GuideProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!isMobile);
  const [downloadState, setDownloadState] = useState<DownloadState>("checking");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [reviews, setReviews] = useState<GuideReview[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const guideId = Number(params.id);
  const image = params.image || PLACEHOLDER_IMAGE;

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isNaN(guideId)) { setLoading(false); return; }

    if (isOffline) {
      offlineService.getOfflineGuide(guideId).then((guide) => {
        if (guide) {
          setSteps(guide.steps);
          setSavedAt(guide.savedAt);
          setDownloadState("saved");
        }
      }).finally(() => setLoading(false));
      return;
    }

    Promise.all([
      guidesApi.getSteps(guideId),
      guidesApi.getProducts(guideId),
      guidesApi.getReviews(guideId),
    ])
      .then(([s, p, revs]) => {
        setSteps(s.sort((a, b) => a.order - b.order));
        setProducts(p);
        setReviews(revs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Check if already saved offline
    offlineService.isGuideSaved(guideId).then((saved) => {
      setDownloadState(saved ? "saved" : "idle");
      if (saved) {
        offlineService.getOfflineGuide(guideId).then((g) => {
          if (g) setSavedAt(g.savedAt);
        });
      }
    });
  }, [guideId, isOffline]);

  // ── Offline download ───────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (downloadState !== "idle") return;
    setDownloadState("downloading");
    try {
      const toSave: OfflineGuide = {
        id: guideId,
        title: params.title,
        description: params.description || null,
        duration: params.subtitle ? extractDuration(params.subtitle) : null,
        image,
        steps,
        savedAt: new Date().toISOString(),
      };
      await offlineService.saveGuide(toSave);
      setSavedAt(toSave.savedAt);
      setDownloadState("saved");
    } catch {
      Alert.alert("Error", "No se pudo descargar la guía. Intentá de nuevo.");
      setDownloadState("idle");
    }
  };

  const handleRemoveDownload = () => {
    Alert.alert(
      "Eliminar descarga",
      "¿Querés eliminar esta guía de tu contenido offline?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDownloadState("removing");
            try {
              await offlineService.removeGuide(guideId);
              setDownloadState("idle");
              setSavedAt(null);
              if (isOffline) router.back();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la descarga.");
              setDownloadState("saved");
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
      await guidesApi.addReview(guideId, userRating);
      // Refetch from the backend instead of trusting the local append, so the
      // UI always reflects what actually got persisted server-side.
      const revs = await guidesApi.getReviews(guideId);
      setReviews(revs);
      setUserRating(0);
    } catch {
      Alert.alert("Error", "No se pudo enviar la reseña. Intentá de nuevo.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleProductPress = (url: string | null) => {
    if (!url) return;
    Alert.alert(
      "Saliendo de SurvixApp",
      "Vas a abrir el producto en tu navegador.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir", onPress: () => { void Linking.openURL(url); } },
      ]
    );
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const duration = params.subtitle ? extractDuration(params.subtitle) : null;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.puntaje, 0) / reviews.length
    : null;
  const visibleSteps =
    isMobile && !expanded
      ? steps.slice(0, MOBILE_SUMMARY_STEPS)
      : steps;

  const hiddenCount = steps.length - MOBILE_SUMMARY_STEPS;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#76E2B3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.heroWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="book-outline" size={52} color="rgba(255,255,255,0.3)" />
            </View>
          )}

          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          {duration !== null && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color="#14342B" />
              <Text style={styles.durationBadgeText}>{duration} min</Text>
            </View>
          )}

          {isOffline && (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline-outline" size={13} color="#76E2B3" />
              <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
          )}

          {!isOffline && avgRating !== null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingBadgeValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingBadgeLabel}>
                {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.categoryLabel}>Guía de supervivencia</Text>
          <Text style={styles.title}>{params.title}</Text>

          {params.description ? (
            <Text style={styles.description}>{params.description}</Text>
          ) : null}

          {/* Mobile summary banner */}
          {isMobile && !isOffline && steps.length > MOBILE_SUMMARY_STEPS && !expanded && (
            <View style={styles.summaryBanner}>
              <Ionicons name="phone-portrait-outline" size={16} color="#14342B" />
              <Text style={styles.summaryBannerText}>
                Vista rápida — mostrando {MOBILE_SUMMARY_STEPS} de {steps.length} pasos.
              </Text>
              <Pressable onPress={() => setExpanded(true)}>
                <Text style={styles.summaryBannerLink}>Ver todos</Text>
              </Pressable>
            </View>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pasos</Text>
              {visibleSteps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}

              {isMobile && !expanded && hiddenCount > 0 && (
                <Pressable style={styles.expandBtn} onPress={() => setExpanded(true)}>
                  <Ionicons name="chevron-down" size={16} color="#14342B" />
                  <Text style={styles.expandBtnText}>
                    Ver {hiddenCount} paso{hiddenCount !== 1 ? "s" : ""} más
                  </Text>
                </Pressable>
              )}
              {isMobile && expanded && steps.length > MOBILE_SUMMARY_STEPS && (
                <Pressable style={styles.expandBtn} onPress={() => setExpanded(false)}>
                  <Ionicons name="chevron-up" size={16} color="#14342B" />
                  <Text style={styles.expandBtnText}>Mostrar menos</Text>
                </Pressable>
              )}
            </>
          )}

          {/* Products (online only) */}
          {!isOffline && products.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Productos relacionados</Text>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(p.url)}
                  disabled={!p.url}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    {p.url ? <Text style={styles.productUrl} numberOfLines={1}>{p.url}</Text> : null}
                  </View>
                  {p.url ? <Ionicons name="open-outline" size={18} color="#14342B" /> : null}
                </Pressable>
              ))}
            </>
          )}

          {/* Reviews (online only) */}
          {!isOffline && (
            <>
              <Text style={styles.sectionTitle}>Reseñas</Text>

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

              {reviews.length === 0 && (
                <Text style={[styles.description, { color: "#8A9490", marginBottom: 8 }]}>
                  Todavía no hay reseñas. ¡Sé el primero!
                </Text>
              )}
              {reviews.map((r) => (
                <View key={r.id_resenia_guia} style={styles.reviewCard}>
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

              {token && myReview && (
                <View style={styles.reviewForm}>
                  <Text style={[styles.description, { fontWeight: "600", marginBottom: 8 }]}>
                    Ya calificaste esta guía
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
                      <Text style={styles.reviewSubmitBtnText}>Enviar reseña</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </>
          )}

          {/* Offline download (mobile only) */}
          {isMobile && !isOffline && (
            <>
              <Pressable
                style={[
                  styles.downloadBtn,
                  downloadState === "saved" && styles.downloadBtnSaved,
                  (downloadState === "downloading" || downloadState === "removing" || downloadState === "checking") && { opacity: 0.6 },
                ]}
                onPress={handleDownload}
                disabled={downloadState !== "idle"}
              >
                {downloadState === "downloading" ? (
                  <ActivityIndicator color="#fff" />
                ) : downloadState === "saved" ? (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>Descargado para offline</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>Descargar para offline</Text>
                  </>
                )}
              </Pressable>

              {downloadState === "saved" && savedAt && (
                <>
                  <Text style={{ textAlign: "center", fontSize: 12, color: "#8A9490", marginTop: 6 }}>
                    Guardado el {formatDate(savedAt)}
                  </Text>
                  <Pressable
                    style={[styles.removeBtn, downloadState === "removing" && { opacity: 0.6 }]}
                    onPress={handleRemoveDownload}
                    disabled={downloadState === "removing"}
                  >
                    {downloadState === "removing" ? (
                      <ActivityIndicator size="small" color="#8A9490" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={15} color="#8A9490" />
                        <Text style={styles.removeBtnText}>Eliminar descarga</Text>
                      </>
                    )}
                  </Pressable>
                </>
              )}
            </>
          )}

          {/* Remove from offline (when viewing offline mode) */}
          {isOffline && (
            <Pressable
              style={[styles.removeBtn, { marginTop: 24 }, downloadState === "removing" && { opacity: 0.6 }]}
              onPress={handleRemoveDownload}
              disabled={downloadState === "removing"}
            >
              <Ionicons name="trash-outline" size={15} color="#8A9490" />
              <Text style={styles.removeBtnText}>Eliminar descarga</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDuration(subtitle: string): number | null {
  const match = subtitle.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
