import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { styles } from "./WebNavbar.styles";

const AVATAR_BG = "#2a4f38";

type NavRoute = {
  path: "/home" | "/map" | "/compose" | "/blog" | "/profile";
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const navRoutes: NavRoute[] = [
  { path: "/home",    icon: "home-outline",      iconActive: "home",      label: "Inicio" },
  { path: "/map",     icon: "location-outline",  iconActive: "location",  label: "Mapa" },
  { path: "/compose", icon: "create-outline",    iconActive: "create",    label: "Novedades" },
  { path: "/blog",    icon: "newspaper-outline", iconActive: "newspaper", label: "Blog" },
  { path: "/profile", icon: "person-outline",    iconActive: "person",    label: "Perfil" },
];

// ─── Logout confirmation modal ────────────────────────────────────────────────

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <View style={{
      position: "fixed" as never,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <View style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 28,
        width: 340,
        maxWidth: "90%" as never,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 12,
      }}>
        {/* Icon */}
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: "#fee2e2",
          alignItems: "center", justifyContent: "center",
          marginBottom: 4,
        }}>
          <Ionicons name="log-out-outline" size={26} color="#dc2626" />
        </View>

        <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a2a1e" }}>
          Cerrar sesión
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7a70", textAlign: "center", marginBottom: 8 }}>
          ¿Estás seguro que querés salir de tu cuenta?
        </Text>

        {/* Buttons */}
        <View style={{ flexDirection: "row", gap: 10, width: "100%" as never }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1, height: 40, borderRadius: 8,
              borderWidth: 1, borderColor: "#dde5df",
              alignItems: "center", justifyContent: "center",
              backgroundColor: pressed ? "#f4f5f4" : "transparent",
            })}
            onPress={onCancel}
          >
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#3a4a3e" }}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              flex: 1, height: 40, borderRadius: 8,
              alignItems: "center", justifyContent: "center",
              backgroundColor: pressed ? "#b91c1c" : "#dc2626",
            })}
            onPress={onConfirm}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Salir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── WebNavbar ────────────────────────────────────────────────────────────────

export function WebNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, user, logout } = useAuth();
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
        <LogoutModal
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
              <Ionicons
                name={isActive ? route.iconActive : route.icon}
                size={18}
                color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
              />
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
