import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { usePostsContext } from "@/src/context/PostsContext";
import { styles } from "./PostDetailScreen.styles";

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { posts, toggleLike, addComment } = usePostsContext();
  const [draft, setDraft] = useState("");

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#14342B" />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Publicación no encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDraft("");
    await addComment(post.id, trimmed);
  };

  const initials = post.author.split(" ").map((w) => w[0]).join("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#14342B" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {post.image ? (
          <Image source={{ uri: post.image }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
            <Text style={styles.heroImageCategory}>{post.category}</Text>
          </View>
        )}

        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorRole}>{post.role}</Text>
          </View>
        </View>

        <Text style={styles.summary}>{post.summary}</Text>

        {post.body && post.body !== post.summary ? (
          <Text style={styles.body}>{post.body}</Text>
        ) : null}

        <View style={styles.divider} />

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
            {post.likes} {post.likes === 1 ? "me gusta" : "me gusta"}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.commentsTitle}>
          Comentarios ({post.comments.length})
        </Text>

        {post.comments.length === 0 ? (
          <Text style={styles.noComments}>Sé el primero en comentar.</Text>
        ) : (
          post.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentBadge}>
                <Ionicons name="person" size={14} color="#14342B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.commentComposer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#8A9490"
            style={styles.commentInput}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
