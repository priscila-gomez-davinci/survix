import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { usePostsContext } from "@/src/context/PostsContext";
import { useAuth } from "@/src/context/AuthContext";
import { buildPostCategory, parsePostCategory, uploadImage, type PostMessageType } from "@/src/services/api";
import { styles } from "./BlogScreen.styles";

const ALL_CATEGORIES = "Todos";
const COMMENT_MAX_LENGTH = 500;

type TypeFilter = "all" | PostMessageType;

const TYPE_TABS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "suggestion", label: "Sugerencias" },
  { key: "question", label: "Consultas" },
];

export default function BlogScreen() {
  const router = useRouter();
  const { posts: allPosts, loading, toggleLike, addComment, addPost, deletePost } = usePostsContext();
  const { isAdmin, profileName } = useAuth();

  // Feed state
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});

  // Compose state
  const [messageType, setMessageType] = useState<PostMessageType>("suggestion");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Supervivencia urbana");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const postsWithType = useMemo(
    () => allPosts.map((p) => ({ ...p, ...parsePostCategory(p.category) })),
    [allPosts],
  );

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(postsWithType.map((p) => p.label)))],
    [postsWithType],
  );

  const visiblePosts = useMemo(
    () =>
      postsWithType
        .filter((p) => activeType === "all" || p.type === activeType)
        .filter((p) => activeCategory === ALL_CATEGORIES || p.label === activeCategory),
    [activeCategory, activeType, postsWithType],
  );

  const communityPulse = useMemo(() => {
    const totalLikes = allPosts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = allPosts.reduce((sum, p) => sum + p.comments.length, 0);
    return { totalLikes, totalComments };
  }, [allPosts]);

  const handleAddComment = async (postId: string) => {
    const draft = draftComments[postId] ?? "";
    if (!draft.trim()) return;
    setDraftComments((prev) => ({ ...prev, [postId]: "" }));
    await addComment(postId, draft);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      "Eliminar publicación",
      "¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(postId);
            } catch {
              Alert.alert("Error", "No se pudo eliminar la publicación. Intentá de nuevo.");
            }
          },
        },
      ]
    );
  };

  const handlePickPhoto = () => {
    if (!fileInputRef.current) {
      const el = document.createElement("input");
      el.type = "file";
      el.accept = "image/jpeg,image/png,image/webp";
      el.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        // Show local preview immediately — no waiting for upload
        setImageUrl(URL.createObjectURL(file));
        setUploadingPhoto(true);
        try {
          const serverUrl = await uploadImage(file);
          setImageUrl(serverUrl);
        } catch {
          Alert.alert("Error", "No se pudo subir la foto. Intentá de nuevo.");
          setImageUrl(null);
        } finally {
          setUploadingPhoto(false);
        }
      };
      fileInputRef.current = el;
    }
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setSubmitError("Completá el título y el mensaje antes de publicar.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addPost({
        titulo: title.trim(),
        contenido: body.trim(),
        categoria: buildPostCategory(messageType, category.trim() || "General"),
        imagen_url: imageUrl ?? undefined,
      });
      setTitle("");
      setBody("");
      setCategory("Supervivencia urbana");
      setImageUrl(null);
      setMessageType("suggestion");
    } catch {
      setSubmitError("No se pudo publicar. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#14342B" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.webLayout}>

        {/* ── Left: Feed ────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.feedColumn}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Blog de comunidad</Text>
            <Text style={styles.heroTitle}>Ideas practicas para sobrevivencia cotidiana</Text>
            <Text style={styles.heroText}>
              Compartí tips, guías y consultas con la comunidad outdoor.
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{communityPulse.totalLikes}</Text>
                <Text style={styles.metricLabel}>me gusta</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{communityPulse.totalComments}</Text>
                <Text style={styles.metricLabel}>comentarios</Text>
              </View>
            </View>
          </View>

          <View style={styles.typeTabRow}>
            {TYPE_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.typeTab, activeType === tab.key && styles.typeTabActive]}
                onPress={() => setActiveType(tab.key)}
              >
                <Text
                  style={[styles.typeTabText, activeType === tab.key && styles.typeTabTextActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {visiblePosts.map((post) => {
            const draft = draftComments[post.id] ?? "";
            return (
              <View key={post.id} style={styles.postCard}>
                <Pressable
                  style={styles.postHeader}
                  onPress={() =>
                    router.push({ pathname: "/post-detail", params: { postId: post.id } })
                  }
                >
                  {post.authorPhoto ? (
                    <Image source={{ uri: post.authorPhoto }} style={styles.authorAvatar} />
                  ) : (
                    <View style={styles.authorBadge}>
                      <Text style={styles.authorBadgeText}>
                        {post.author.split(" ").map((w) => w[0]).join("")}
                      </Text>
                    </View>
                  )}
                  <View style={styles.authorCopy}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.authorRole}>{post.role}</Text>
                  </View>
                  {post.type && (
                    <View
                      style={[
                        styles.typeBadge,
                        post.type === "suggestion" ? styles.typeBadgeSuggestion : styles.typeBadgeQuestion,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          post.type === "suggestion"
                            ? styles.typeBadgeTextSuggestion
                            : styles.typeBadgeTextQuestion,
                        ]}
                      >
                        {post.type === "suggestion" ? "Sugerencia" : "Consulta"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{post.label}</Text>
                  </View>
                  {(isAdmin || (!!profileName && post.author.trim() === profileName.trim())) && (
                    <Pressable hitSlop={8} onPress={() => handleDeletePost(post.id)}>
                      <Ionicons name="trash-outline" size={18} color="#D93025" />
                    </Pressable>
                  )}
                </Pressable>

                {post.image ? (
                  <Image source={{ uri: post.image }} style={styles.postImageWeb} resizeMode="contain" />
                ) : null}

                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/post-detail", params: { postId: post.id } })
                  }
                >
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={[styles.postSummary, { marginTop: 6 }]}>{post.summary}</Text>
                  <Text style={styles.readMore}>Ver publicación →</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, post.likedByMe && styles.actionButtonPositive]}
                  onPress={() => toggleLike(post.id)}
                >
                  <Ionicons
                    name={post.likedByMe ? "thumbs-up" : "thumbs-up-outline"}
                    size={18}
                    color={post.likedByMe ? "#FFFFFF" : "#173B32"}
                  />
                  <Text style={[styles.actionText, post.likedByMe && styles.actionTextActive]}>
                    {post.likes}
                  </Text>
                </Pressable>

                <View style={styles.commentsBlock}>
                  <Text style={styles.commentsTitle}>
                    Comentarios ({post.comments.length})
                  </Text>
                  {post.comments.slice(-2).map((comment) => (
                    <View key={comment.id} style={styles.commentChip}>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))}
                  {post.comments.length > 2 && (
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: "/post-detail", params: { postId: post.id } })
                      }
                    >
                      <Text style={styles.readMore}>Ver todos los comentarios →</Text>
                    </Pressable>
                  )}
                </View>

                <Text
                  style={[
                    styles.commentCounter,
                    draft.length >= COMMENT_MAX_LENGTH && styles.commentCounterLimit,
                  ]}
                >
                  {draft.length}/{COMMENT_MAX_LENGTH}
                </Text>
                <View style={styles.commentComposer}>
                  <TextInput
                    value={draft}
                    onChangeText={(value) =>
                      setDraftComments((prev) => ({ ...prev, [post.id]: value }))
                    }
                    placeholder="Escribe un comentario"
                    placeholderTextColor="#8A9490"
                    style={styles.commentInput}
                    maxLength={COMMENT_MAX_LENGTH}
                  />
                  <Pressable
                    style={styles.sendButton}
                    onPress={() => handleAddComment(post.id)}
                  >
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── Right: Compose panel ──────────────────────────────────────── */}
        <View style={styles.composeColumn}>
          <ScrollView
            contentContainerStyle={styles.composeScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.composeTitle}>Nueva publicación</Text>
            <Text style={styles.composeSubtitle}>
              Compartí tips, guías o consultá a la comunidad
            </Text>

            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.togglePill, messageType === "suggestion" && styles.togglePillActive]}
                onPress={() => setMessageType("suggestion")}
              >
                <Text
                  style={[styles.toggleText, messageType === "suggestion" && styles.toggleTextActive]}
                >
                  Sugerencia
                </Text>
              </Pressable>
              <Pressable
                style={[styles.togglePill, messageType === "question" && styles.togglePillActive]}
                onPress={() => setMessageType("question")}
              >
                <Text
                  style={[styles.toggleText, messageType === "question" && styles.toggleTextActive]}
                >
                  Consulta
                </Text>
              </Pressable>
            </View>

            <View style={styles.composeFieldGroup}>
              <Text style={styles.composeLabel}>Título</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Lista de items para una mochila urbana"
                placeholderTextColor="#8A9490"
                style={styles.composeInput}
              />
            </View>

            <View style={styles.composeFieldGroup}>
              <Text style={styles.composeLabel}>Categoría</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Categoría"
                placeholderTextColor="#8A9490"
                style={styles.composeInput}
              />
            </View>

            <View style={styles.composeFieldGroup}>
              <Text style={styles.composeLabel}>Mensaje</Text>
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Describe tu sugerencia o consulta con el mayor contexto posible"
                placeholderTextColor="#8A9490"
                style={styles.composeTextArea}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.composeFieldGroup}>
              <Text style={styles.composeLabel}>Foto (opcional)</Text>
              {imageUrl ? (
                <View>
                  <View style={{ position: "relative" }}>
                    <Image source={{ uri: imageUrl }} style={styles.composeImagePreview} />
                    {uploadingPhoto && (
                      <View style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 12,
                        justifyContent: "center", alignItems: "center", gap: 6,
                      }}>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                          Subiendo...
                        </Text>
                      </View>
                    )}
                  </View>
                  {!uploadingPhoto && (
                    <Pressable style={styles.changePhotoButton} onPress={handlePickPhoto}>
                      <Ionicons name="camera-outline" size={14} color="#14342B" />
                      <Text style={styles.changePhotoText}>Cambiar foto</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <Pressable
                  style={styles.composePhotoButton}
                  onPress={handlePickPhoto}
                  disabled={uploadingPhoto}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#14342B" />
                  <Text style={styles.composePhotoButtonText}>Subir foto</Text>
                </Pressable>
              )}
            </View>

            {submitError ? (
              <Text style={styles.composeError}>{submitError}</Text>
            ) : null}

            <Pressable
              style={[styles.composeSubmit, (submitting || uploadingPhoto) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting || uploadingPhoto}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.composeSubmitText}>Publicar</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
}
