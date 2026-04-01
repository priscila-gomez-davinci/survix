import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePostsContext } from "@/src/context/PostsContext";
import { styles } from "./BlogScreen.styles";

type Reaction = "like" | "dislike" | null;

type PostState = {
  id: string;
  reaction: Reaction;
  likes: number;
  dislikes: number;
  comments: string[];
  draftComment: string;
};

const ALL_CATEGORIES = "Todos";
const STORAGE_KEY = "@survix/post_states";

type PersistedState = Record<string, {
  reaction: Reaction;
  likes: number;
  dislikes: number;
  comments: string[];
}>;

function makePostState(id: string, likes: number, dislikes: number, comments: string[]): PostState {
  return { id, reaction: null, likes, dislikes, comments: [...comments], draftComment: "" };
}

export default function BlogScreen() {
  const { posts: allPosts } = usePostsContext();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const hasLoaded = useRef(false);

  const [postStates, setPostStates] = useState<PostState[]>(() =>
    allPosts.map((p) => makePostState(p.id, p.likes, p.dislikes, p.comments)),
  );

  // Load persisted reactions/likes/comments on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved: PersistedState = JSON.parse(raw);
          setPostStates((current) =>
            current.map((state) => {
              const persisted = saved[state.id];
              if (!persisted) return state;
              return { ...state, ...persisted, draftComment: "" };
            }),
          );
        } catch {
          // ignore corrupt data
        }
      }
      hasLoaded.current = true;
    });
  }, []);

  // Save whenever postStates changes (skip until initial load is done)
  useEffect(() => {
    if (!hasLoaded.current) return;
    const toSave: PersistedState = {};
    for (const state of postStates) {
      toSave[state.id] = {
        reaction: state.reaction,
        likes: state.likes,
        dislikes: state.dislikes,
        comments: state.comments,
      };
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [postStates]);

  // Sync new posts added via ComposeScreen
  useEffect(() => {
    setPostStates((current) => {
      const existingIds = new Set(current.map((s) => s.id));
      const newEntries = allPosts
        .filter((p) => !existingIds.has(p.id))
        .map((p) => makePostState(p.id, p.likes, p.dislikes, p.comments));
      return newEntries.length > 0 ? [...newEntries, ...current] : current;
    });
  }, [allPosts]);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(allPosts.map((p) => p.category)))],
    [allPosts],
  );

  const visiblePosts = useMemo(
    () =>
      activeCategory === ALL_CATEGORIES
        ? allPosts
        : allPosts.filter((p) => p.category === activeCategory),
    [activeCategory, allPosts],
  );

  const communityPulse = useMemo(() => {
    const totalLikes = postStates.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = postStates.reduce((sum, post) => sum + post.comments.length, 0);
    return { totalLikes, totalComments };
  }, [postStates]);

  const handleReaction = (postId: string, nextReaction: Exclude<Reaction, null>) => {
    setPostStates((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;

        const alreadySelected = post.reaction === nextReaction;
        const baseLike = post.likes - (post.reaction === "like" ? 1 : 0);
        const baseDislike = post.dislikes - (post.reaction === "dislike" ? 1 : 0);

        if (alreadySelected) {
          return { ...post, reaction: null, likes: baseLike, dislikes: baseDislike };
        }

        return {
          ...post,
          reaction: nextReaction,
          likes: baseLike + (nextReaction === "like" ? 1 : 0),
          dislikes: baseDislike + (nextReaction === "dislike" ? 1 : 0),
        };
      }),
    );
  };

  const handleCommentDraft = (postId: string, value: string) => {
    setPostStates((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, draftComment: value } : post,
      ),
    );
  };

  const handleAddComment = (postId: string) => {
    setPostStates((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const nextComment = post.draftComment.trim();
        if (!nextComment) return post;
        return { ...post, comments: [...post.comments, nextComment], draftComment: "" };
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
          const state = postStates.find((item) => item.id === post.id);
          if (!state) return null;

          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorBadge}>
                  <Text style={styles.authorBadgeText}>
                    {post.author
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </Text>
                </View>

                <View style={styles.authorCopy}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorRole}>{post.role}</Text>
                </View>

                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postSummary}>{post.summary}</Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    state.reaction === "like" && styles.actionButtonPositive,
                  ]}
                  onPress={() => handleReaction(post.id, "like")}
                >
                  <Ionicons
                    name={state.reaction === "like" ? "thumbs-up" : "thumbs-up-outline"}
                    size={18}
                    color={state.reaction === "like" ? "#FFFFFF" : "#173B32"}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      state.reaction === "like" && styles.actionTextActive,
                    ]}
                  >
                    {state.likes}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    state.reaction === "dislike" && styles.actionButtonNegative,
                  ]}
                  onPress={() => handleReaction(post.id, "dislike")}
                >
                  <Ionicons
                    name={state.reaction === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                    size={18}
                    color={state.reaction === "dislike" ? "#FFFFFF" : "#173B32"}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      state.reaction === "dislike" && styles.actionTextActive,
                    ]}
                  >
                    {state.dislikes}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.commentsBlock}>
                <Text style={styles.commentsTitle}>Comentarios</Text>
                {state.comments.map((comment, index) => (
                  <View key={`${post.id}-${index}`} style={styles.commentChip}>
                    <Text style={styles.commentText}>{comment}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.commentComposer}>
                <TextInput
                  value={state.draftComment}
                  onChangeText={(value) => handleCommentDraft(post.id, value)}
                  placeholder="Escribe un comentario"
                  placeholderTextColor="#8A9490"
                  style={styles.commentInput}
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
    </SafeAreaView>
  );
}
