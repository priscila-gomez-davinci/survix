import { createContext, useContext, useState, type ReactNode } from "react";
import type { BlogPost } from "@/src/data/blogData";
import { mockPosts } from "@/src/data/blogData";

type PostsContextValue = {
  posts: BlogPost[];
  addPost: (post: BlogPost) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);

  const addPost = (post: BlogPost) => {
    setPosts((current) => [post, ...current]);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePostsContext must be used within PostsProvider");
  return ctx;
}
