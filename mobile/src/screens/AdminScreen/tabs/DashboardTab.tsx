import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { routesApi, guidesApi } from "@/src/services/api";
import { styles, C } from "../AdminScreen.styles";

type Page = "dashboard" | "users" | "routes" | "guides";

function StatCard({ label, value, delta }: { label: string; value: string | number; delta?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {delta ? <Text style={styles.statDelta}>{delta}</Text> : null}
    </View>
  );
}

export function DashboardTab({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [routeCount, setRouteCount] = useState<number | null>(null);
  const [guideCount, setGuideCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([routesApi.list(), guidesApi.list()])
      .then(([routes, guides]) => {
        setRouteCount(routes.length);
        setGuideCount(guides.length);
      })
      .catch(() => {
        setRouteCount(0);
        setGuideCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const quickLinks: { page: Page; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
    { page: "users", icon: "people-outline", label: "Gestionar usuarios", color: C.greenDark },
    { page: "routes", icon: "map-outline", label: "Gestionar rutas", color: C.blue },
    { page: "guides", icon: "book-outline", label: "Gestionar guías", color: "#7c3aed" },
  ];

  return (
    <View>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Panel General</Text>
          <Text style={styles.pageSubtitle}>Resumen de contenido en SurvivApp</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Rutas"
          value={loading ? "—" : String(routeCount ?? 0)}
          delta="Actividades en el mapa"
        />
        <StatCard
          label="Guías"
          value={loading ? "—" : String(guideCount ?? 0)}
          delta="Guías publicadas"
        />
        <StatCard label="Usuarios" value="—" delta="Buscar por ID en Usuarios" />
        <StatCard label="Estado API" value="✓" delta="Conectado a survixapp.com" />
      </View>

      {/* Quick links */}
      <View style={[styles.tableWrap, { marginBottom: 24 }]}>
        <View style={[styles.tableHeader]}>
          <Text style={[styles.thText, { flex: 1 }]}>Accesos rápidos</Text>
        </View>
        {quickLinks.map((link, i) => (
          <View
            key={link.page}
            style={[
              styles.tableRow,
              i === quickLinks.length - 1 && styles.tableRowLast,
            ]}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: link.color + "18",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name={link.icon} size={16} color={link.color} />
            </View>
            <Text
              style={[styles.tdText, { flex: 1, color: link.color, fontWeight: "600", cursor: "pointer" } as never]}
              onPress={() => onNavigate(link.page)}
            >
              {link.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </View>
        ))}
      </View>

      {loading && (
        <View style={{ alignItems: "center", paddingTop: 8 }}>
          <ActivityIndicator color={C.greenDark} />
        </View>
      )}
    </View>
  );
}
