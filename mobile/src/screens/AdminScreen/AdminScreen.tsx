import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { DashboardTab } from "./tabs/DashboardTab";
import { UsersTab } from "./tabs/UsersTab";
import { RoutesTab } from "./tabs/RoutesTab";
import { GuidesTab } from "./tabs/GuidesTab";
import { styles, C } from "./AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "dashboard" | "users" | "routes" | "guides";

type SidebarSection = {
  label: string;
  items: { id: Page; icon: keyof typeof Ionicons.glyphMap; text: string; badge?: number }[];
};

const SECTIONS: SidebarSection[] = [
  {
    label: "General",
    items: [{ id: "dashboard", icon: "grid-outline", text: "Dashboard" }],
  },
  {
    label: "Gestión",
    items: [
      { id: "users", icon: "people-outline", text: "Usuarios" },
      { id: "routes", icon: "map-outline", text: "Rutas" },
      { id: "guides", icon: "book-outline", text: "Guías" },
    ],
  },
];

// ─── Not available on mobile ──────────────────────────────────────────────────

function MobileUnsupported() {
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.root, styles.mobileMessage]}>
      <Ionicons name="desktop-outline" size={52} color={C.muted} />
      <Text style={styles.mobileMessageText}>
        El panel de administración solo está disponible en la versión web.
      </Text>
      <Pressable
        style={[styles.btnPrimary, { marginTop: 8 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.btnPrimaryText}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Access denied ────────────────────────────────────────────────────────────

function AccessDenied() {
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.root, styles.mobileMessage]}>
      <Ionicons name="lock-closed-outline" size={52} color={C.muted} />
      <Text style={styles.mobileMessageText}>
        Acceso restringido a administradores.
      </Text>
      <Pressable
        style={[styles.btnPrimary, { marginTop: 8 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.btnPrimaryText}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const { isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState<Page>("dashboard");

  if (Platform.OS !== "web") return <MobileUnsupported />;
  if (!isAdmin) return <AccessDenied />;

  const initials = user
    ? [user.email[0]].join("").toUpperCase()
    : "A";

  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleLogout = () => {
    if ((globalThis as unknown as { confirm: (s: string) => boolean }).confirm(
      "¿Seguro que querés cerrar sesión?"
    )) {
      void doLogout();
    }
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardTab onNavigate={setPage} />;
      case "users": return <UsersTab />;
      case "routes": return <RoutesTab />;
      case "guides": return <GuidesTab />;
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Topbar ── */}
      <View style={styles.topbar}>
        <Pressable style={styles.topbarLogo} onPress={() => router.replace("/home")}>
          <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
          <Text style={styles.topbarLogoText}>SurvivApp</Text>
        </Pressable>

        <View style={styles.topbarRight}>
          <Text style={styles.topbarRoleText}>Panel Admin</Text>
          <View style={styles.topbarAvatar}>
            <Text style={styles.topbarAvatarText}>{initials}</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Sidebar */}
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
                    <Text style={[
                      styles.sidebarItemText,
                      isActive && styles.sidebarItemTextActive,
                    ]}>
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

        {/* Main */}
        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderPage()}
        </ScrollView>
      </View>
    </View>
  );
}
