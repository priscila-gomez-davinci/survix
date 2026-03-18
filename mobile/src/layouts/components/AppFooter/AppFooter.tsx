import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { styles } from "./AppFooter.styles";

type NavRoute = {
  path: "/home" | "/map" | "/compose" | "/blog" | "/profile";
  icon: keyof typeof Ionicons.glyphMap;
  isPrimary?: boolean;
};

const navRoutes: NavRoute[] = [
  { path: "/home", icon: "home" },
  { path: "/map", icon: "location-outline" },
  { path: "/compose", icon: "add" , isPrimary: true },
  { path: "/blog", icon: "newspaper-outline" },
  { path: "/profile", icon: "person-outline" },
];

export function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomBar}>
      {navRoutes.map((route) => {
        const isActive = pathname === route.path;
        const iconColor = route.isPrimary
          ? "#FFFFFF"
          : isActive
            ? "#FFFFFF"
            : "#14342B";

        return (
          <Pressable
            key={route.path}
            style={[
              styles.navItem,
              isActive && styles.navItemActive,
              route.isPrimary && styles.primaryNavItem,
            ]}
            onPress={() => router.replace(route.path)}
          >
            <Ionicons name={route.icon} size={22} color={iconColor} />
          </Pressable>
        );
      })}
    </View>
  );
}
