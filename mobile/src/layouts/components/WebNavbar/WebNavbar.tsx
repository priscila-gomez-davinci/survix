import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
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
  { path: "/home", icon: "home-outline", iconActive: "home", label: "Inicio" },
  { path: "/map", icon: "location-outline", iconActive: "location", label: "Mapa" },
  { path: "/compose", icon: "create-outline", iconActive: "create", label: "Novedades" },
  { path: "/blog", icon: "newspaper-outline", iconActive: "newspaper", label: "Blog" },
  { path: "/profile", icon: "person-outline", iconActive: "person", label: "Perfil" },
];

export function WebNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, user, logout } = useAuth();
  const isAdminPage = pathname === "/admin";

  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-restricted-globals
      if ((globalThis as unknown as { confirm: (msg: string) => boolean }).confirm("¿Seguro que querés cerrar sesión?")) {
        void doLogout();
      }
      return;
    }
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void doLogout() },
    ]);
  };

  return (
    <View style={styles.navbar}>
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
            style={[styles.navItem, pathname === "/admin" && styles.navItemActive]}
            onPress={() => router.push("/admin")}
          >
            <Ionicons
              name={pathname === "/admin" ? "shield-checkmark" : "shield-checkmark-outline"}
              size={18}
              color={pathname === "/admin" ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
            />
            <Text style={[styles.navLabel, pathname === "/admin" && styles.navLabelActive]}>
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
