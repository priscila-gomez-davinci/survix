import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { PostsProvider } from "@/src/context/PostsContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { HomeDataProvider } from "@/src/context/HomeDataContext";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["splash", "login", "register", "forgot-password", "index", "about", "contact", "tips", "tip-detail", "plans"];

function AuthGate() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] as string | undefined;
    const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (!token && !isPublic) {
      router.replace("/login");
    }
  }, [token, isLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <HomeDataProvider>
        <PostsProvider>
          <AuthGate />
          <Stack screenOptions={{ headerShown: false }} />
        </PostsProvider>
      </HomeDataProvider>
    </AuthProvider>
  );
}
