import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mockPosts } from "@/src/data/blogData";
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

export default function BlogScreen() {
  const [posts, setPosts] = useState<PostState[]>(
    mockPosts.map((post) => ({
      id: post.id,
      reaction: null,
      likes: post.likes,
      dislikes: post.dislikes,
      comments: post.comments,
      draftComment: "",
    })),
  );

  const communityPulse = useMemo(() => {
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

    return { totalLikes, totalComments };
  }, [posts]);

  const handleReaction = (postId: string, nextReaction: Exclude<Reaction, null>) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const alreadySelected = post.reaction === nextReaction;
        const baseLike = post.likes - (post.reaction === "like" ? 1 : 0);
        const baseDislike = post.dislikes - (post.reaction === "dislike" ? 1 : 0);

        if (alreadySelected) {
          return {
            ...post,
            reaction: null,
            likes: baseLike,
            dislikes: baseDislike,
          };
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
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, draftComment: value } : post,
      ),
    );
  };

  const handleAddComment = (postId: string) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextComment = post.draftComment.trim();

        if (!nextComment) {
          return post;
        }

        return {
          ...post,
          comments: [...post.comments, nextComment],
          draftComment: "",
        };
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
            Publicaciones simuladas para validar el flujo social antes de conectar un backend real.
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

        {mockPosts.map((post) => {
          const state = posts.find((item) => item.id === post.id);

          if (!state) {
            return null;
          }

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
