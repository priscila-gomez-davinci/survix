import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { mockPosts } from "@/src/data/blogData";
import { postsApi, type BlogPost, type PostCreatePayload } from "@/src/services/api";

type PostsContextValue = {
  posts: BlogPost[];
  loading: boolean;
  addPost: (payload: PostCreatePayload) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: number) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const fetched = await postsApi.list();
      setPosts(fetched);
    } catch {
      // fallback to mock data when offline or API unavailable
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const addPost = async (payload: PostCreatePayload) => {
    const created = await postsApi.create(payload);
    setPosts((current) => [created, ...current]);
  };

  const toggleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.likedByMe;
    // Optimistic update
    setPosts((current) =>
      current.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );

    try {
      if (wasLiked) {
        await postsApi.removeLike(Number(postId));
      } else {
        await postsApi.addLike(Number(postId));
      }
    } catch {
      // Rollback
      setPosts((current) =>
        current.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: wasLiked, likes: wasLiked ? p.likes + 1 : p.likes - 1 }
            : p,
        ),
      );
    }
  };

  const addComment = async (postId: string, text: string) => {
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed) return;
    await postsApi.addComment(Number(postId), trimmed);
    // Reload the post to get the comment with server-assigned id and author
    try {
      const updated = await postsApi.getById(Number(postId));
      setPosts((current) => current.map((p) => (p.id === postId ? updated : p)));
    } catch {
      // ignore refresh error — comment was saved
    }
  };

  const deletePost = async (postId: string) => {
    const previous = posts;
    setPosts((current) => current.filter((p) => p.id !== postId));
    try {
      await postsApi.delete(Number(postId));
    } catch {
      setPosts(previous);
      throw new Error("No se pudo eliminar la publicación.");
    }
  };

  const deleteComment = async (postId: string, commentId: number) => {
    const previous = posts;
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p,
      ),
    );
    try {
      await postsApi.deleteComment(Number(postId), commentId);
    } catch {
      setPosts(previous);
      throw new Error("No se pudo eliminar el comentario.");
    }
  };

  return (
    <PostsContext.Provider
      value={{ posts, loading, addPost, toggleLike, addComment, deletePost, deleteComment }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePostsContext must be used within PostsProvider");
  return ctx;
}
