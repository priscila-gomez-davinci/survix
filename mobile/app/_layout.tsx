import { Stack } from "expo-router";
import { PostsProvider } from "@/src/context/PostsContext";

export default function RootLayout() {
  return (
    <PostsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PostsProvider>
  );
}
