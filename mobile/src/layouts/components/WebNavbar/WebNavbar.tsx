import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { styles } from "./WebNavbar.styles";

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
  const { isAdmin, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          router.replace("/login");
          void logout();
        },
      },
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
      </View>
    </View>
  );
}
