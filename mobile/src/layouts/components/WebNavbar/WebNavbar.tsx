import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, Pressable, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { AppDialog } from "@/src/components/AppDialog";
import { styles } from "./WebNavbar.styles";

const AVATAR_BG = "#2a4f38";

type NavRoute = {
  path: "/home" | "/map" | "/compose" | "/blog" | "/profile" | "/plans";
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const navRoutes: NavRoute[] = [
  { path: "/home",    icon: "home-outline",      iconActive: "home",      label: "Inicio" },
  { path: "/map",     icon: "location-outline",  iconActive: "location",  label: "Mapa" },
  { path: "/blog",    icon: "newspaper-outline", iconActive: "newspaper", label: "Blog" },
  { path: "/plans",   icon: "star-outline",      iconActive: "star",      label: "Planes" },
  { path: "/profile", icon: "person-outline",    iconActive: "person",    label: "Perfil" },
];

// ─── WebNavbar ────────────────────────────────────────────────────────────────

export function WebNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, user, logout, profilePhoto } = useAuth();
  const isAdminPage = pathname === "/admin";
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      setShowLogoutModal(true);
      return;
    }
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void doLogout() },
    ]);
  };

  return (
    <View style={styles.navbar}>
      {/* Logout modal */}
      {showLogoutModal && (
        <AppDialog
          title="Cerrar sesión"
          message="¿Estás seguro que querés salir de tu cuenta?"
          icon="log-out-outline"
          confirmLabel="Salir"
          onConfirm={() => { setShowLogoutModal(false); void doLogout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <Pressable style={styles.brand} onPress={() => router.replace("/home")}>
        <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
        <Text style={styles.brandText}>SurvixApp</Text>
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.navLinks}>
        {navRoutes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Pressable
              key={route.path}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.replace(route.path)}
            >
              {route.path === "/profile" && profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}
                />
              ) : (
                <Ionicons
                  name={isActive ? route.iconActive : route.icon}
                  size={18}
                  color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
                />
              )}
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {route.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.navDivider} />

        {isAdmin && (
          <Pressable
            style={[styles.navItem, isAdminPage && styles.navItemActive]}
            onPress={() => router.push("/admin")}
          >
            <Ionicons
              name={isAdminPage ? "shield-checkmark" : "shield-checkmark-outline"}
              size={18}
              color={isAdminPage ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
            />
            <Text style={[styles.navLabel, isAdminPage && styles.navLabelActive]}>
              Admin
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.navItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.navLabel}>Salir</Text>
        </Pressable>

        {isAdminPage && user && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <View style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.2)" }} />
            <Text style={[styles.navLabel, { fontSize: 12 }]}>Panel Admin</Text>
            <View style={{
              width: 30, height: 30, borderRadius: 15,
              backgroundColor: AVATAR_BG,
              borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {user.email.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
