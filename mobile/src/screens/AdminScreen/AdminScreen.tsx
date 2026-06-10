import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { usersApi, guidesApi, routesApi, type User, type Guide, type Route } from "@/src/services/api";
import { DashboardTab } from "./tabs/DashboardTab";
import { UsersTab } from "./tabs/UsersTab";
import { RoutesTab } from "./tabs/RoutesTab";
import { GuidesTab } from "./tabs/GuidesTab";
import { ContentTab } from "./tabs/ContentTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { styles, C } from "./AdminScreen.styles";

type Page = "dashboard" | "users" | "routes" | "guides" | "content" | "analytics";

type SidebarItem = { id: Page; icon: keyof typeof Ionicons.glyphMap; text: string; badge?: number };
type SidebarSection = { label: string; items: SidebarItem[] };

function MobileUnsupported() {
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.root, styles.mobileMessage]}>
      <Ionicons name="desktop-outline" size={52} color={C.muted} />
      <Text style={styles.mobileMessageText}>
        El panel de administración solo está disponible en la versión web.
      </Text>
      <Pressable style={[styles.btnPrimary, { marginTop: 8 }]} onPress={() => router.back()}>
        <Text style={styles.btnPrimaryText}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function AccessDenied() {
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.root, styles.mobileMessage]}>
      <Ionicons name="lock-closed-outline" size={52} color={C.muted} />
      <Text style={styles.mobileMessageText}>Acceso restringido a administradores.</Text>
      <Pressable style={[styles.btnPrimary, { marginTop: 8 }]} onPress={() => router.back()}>
        <Text style={styles.btnPrimaryText}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.list().catch(() => [] as User[]),
      guidesApi.list().catch(() => [] as Guide[]),
      routesApi.list().catch(() => [] as Route[]),
    ]).then(([u, g, r]) => {
      setUsers(u);
      setGuides(g);
      setRoutes(r);
    }).finally(() => setDataLoading(false));
  }, []);

  if (Platform.OS !== "web") return <MobileUnsupported />;
  if (!isAdmin) return <AccessDenied />;

  const SECTIONS: SidebarSection[] = [
    {
      label: "General",
      items: [{ id: "dashboard", icon: "grid-outline", text: "Dashboard" }],
    },
    {
      label: "Gestión",
      items: [
        { id: "users",  icon: "people-outline", text: "Usuarios",    badge: dataLoading ? undefined : users.length },
        { id: "guides", icon: "book-outline",   text: "Guías",       badge: dataLoading ? undefined : guides.length },
        { id: "routes", icon: "map-outline",    text: "Actividades", badge: dataLoading ? undefined : routes.length },
      ],
    },
    {
      label: "Contenido y reportes",
      items: [
        { id: "content",   icon: "create-outline",     text: "Contenido" },
        { id: "analytics", icon: "bar-chart-outline",  text: "Analytics" },
      ],
    },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <DashboardTab
            onNavigate={setPage}
            users={users}
            guides={guides}
            routes={routes}
            loading={dataLoading}
          />
        );
      case "users":     return <UsersTab />;
      case "routes":    return <RoutesTab />;
      case "guides":    return <GuidesTab />;
      case "content":   return <ContentTab />;
      case "analytics": return <AnalyticsTab />;
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.label}>
            <Text style={styles.sidebarLabel}>{section.label}</Text>
            {section.items.map((item) => {
              const isActive = page === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setPage(item.id)}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={isActive ? C.greenDark : C.muted}
                  />
                  <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
                    {item.text}
                  </Text>
                  {item.badge != null && (
                    <View style={styles.sidebarBadge}>
                      <Text style={styles.sidebarBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderPage()}
      </ScrollView>
    </View>
  );
}
