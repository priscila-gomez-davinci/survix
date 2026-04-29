import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UsersTab } from "./tabs/UsersTab";
import { RoutesTab } from "./tabs/RoutesTab";
import { GuidesTab } from "./tabs/GuidesTab";
import { styles } from "./AdminScreen.styles";

type Tab = "users" | "routes" | "guides";

const TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "users", label: "Usuarios", icon: "people-outline" },
  { id: "routes", label: "Rutas", icon: "map-outline" },
  { id: "guides", label: "Guías", icon: "book-outline" },
];

export default function AdminScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");

  if (!isAdmin) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}
      >
        <Ionicons name="lock-closed-outline" size={48} color="#C5D4CE" />
        <Text
          style={{
            marginTop: 16,
            color: "#8A9490",
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        >
          Acceso restringido a administradores.
        </Text>
        <Pressable
          style={[styles.saveBtn, { marginTop: 24, width: 160 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.saveBtnText}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? "#14342B" : "#8A9490"}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === "users" && <UsersTab />}
        {activeTab === "routes" && <RoutesTab />}
        {activeTab === "guides" && <GuidesTab />}
      </View>
    </SafeAreaView>
  );
}
