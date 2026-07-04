import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
import { parsePostCategory, type PostMessageType } from "@/src/services/api";
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
  const { posts: allPosts, loading, toggleLike, addComment, deletePost } = usePostsContext();
  const { isAdmin, profileName } = useAuth();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#14342B" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Comunidad</Text>
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
                style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}
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
                <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="contain" />
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
                <Pressable style={styles.sendButton} onPress={() => handleAddComment(post.id)}>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
