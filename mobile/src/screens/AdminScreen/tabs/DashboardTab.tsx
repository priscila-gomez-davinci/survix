import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import type { User, Guide, Route } from "@/src/services/api";
import { styles, C } from "../AdminScreen.styles";

type Page = "dashboard" | "users" | "routes" | "guides";

type Props = {
  onNavigate: (page: Page) => void;
  users: User[];
  guides: Guide[];
  routes: Route[];
  loading: boolean;
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  deltaColor = "#16a34a",
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {delta ? <Text style={[styles.statDelta, { color: deltaColor }]}>{delta}</Text> : null}
    </View>
  );
}

// ─── Distribution bar ────────────────────────────────────────────────────────

function DistBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={styles.distRow}>
      <View style={styles.distLabel}>
        <Text style={styles.distLabelText}>{label}</Text>
        <Text style={styles.distCount}>{value}</Text>
      </View>
      <View style={styles.distTrack}>
        <View style={[styles.distFill, { width: `${pct}%` as never, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────

type ActivityEntry = { id: string; dot: string; text: string };

function ActivityItem({ item, last }: { item: ActivityEntry; last: boolean }) {
  return (
    <View style={[styles.activityItem, last && styles.activityItemLast]}>
      <View style={[styles.activityDot, { backgroundColor: item.dot }]} />
      <Text style={styles.activityText} numberOfLines={1}>{item.text}</Text>
    </View>
  );
}

// ─── DashboardTab ────────────────────────────────────────────────────────────

export function DashboardTab({ onNavigate, users, guides, routes, loading }: Props) {
  const month = new Date().toLocaleString("es-AR", { month: "long", year: "numeric" });
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);

  const total = users.length + guides.length + routes.length;

  // Build activity feed from available data
  const activityEntries: ActivityEntry[] = [
    ...routes.slice(0, 4).map((r) => ({
      id: `r-${r.id}`,
      dot: C.blue,
      text: `Actividad disponible: ${r.name}`,
    })),
    ...guides.slice(0, 4).map((g) => ({
      id: `g-${g.id}`,
      dot: "#7c3aed",
      text: `Guía publicada: ${g.title}`,
    })),
  ].slice(0, 7);

  const quickLinks: { page: Page; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
    { page: "users",  icon: "people-outline", label: "Gestionar usuarios",    color: C.greenDark },
    { page: "routes", icon: "map-outline",    label: "Gestionar actividades", color: C.blue },
    { page: "guides", icon: "book-outline",   label: "Gestionar guías",       color: "#7c3aed" },
  ];

  return (
    <View>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Panel General</Text>
          <Text style={styles.pageSubtitle}>Resumen de actividad — {monthLabel}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          label="Usuarios Totales"
          value={loading ? "—" : users.length}
          delta="Cuentas registradas"
        />
        <StatCard
          label="Guías Activos"
          value={loading ? "—" : guides.length}
          delta="Guías publicadas"
        />
        <StatCard
          label="Actividades"
          value={loading ? "—" : routes.length}
          delta="En el mapa"
        />
        <StatCard
          label="Estado API"
          value="✓"
          delta="Conectado a survixapp.com"
          deltaColor={C.muted}
        />
      </View>

      {/* Bottom panels */}
      <View style={styles.dashboardRow}>
        {/* Activity feed */}
        <View style={[styles.panelCard, { flex: 2 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Actividad reciente</Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            {loading ? (
              <Text style={[styles.activityText, { paddingVertical: 24, textAlign: "center", color: C.muted }]}>
                Cargando...
              </Text>
            ) : activityEntries.length === 0 ? (
              <Text style={[styles.activityText, { paddingVertical: 24, textAlign: "center", color: C.muted }]}>
                Sin actividad reciente
              </Text>
            ) : (
              activityEntries.map((item, i) => (
                <ActivityItem key={item.id} item={item} last={i === activityEntries.length - 1} />
              ))
            )}
          </View>
        </View>

        {/* Right column */}
        <View style={{ flex: 1, gap: 16 }}>
          {/* Distribution */}
          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Distribución por sección</Text>
            </View>
            <View style={[styles.panelBody]}>
              <DistBar label="Usuarios"     value={users.length}  total={total} color={C.greenDark} />
              <DistBar label="Actividades"  value={routes.length} total={total} color={C.blue} />
              <DistBar label="Guías"        value={guides.length} total={total} color="#7c3aed" />
            </View>
          </View>

          {/* Quick links */}
          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Accesos rápidos</Text>
            </View>
            {quickLinks.map((link, i) => (
              <Pressable
                key={link.page}
                style={[
                  styles.activityItem,
                  { paddingHorizontal: 20 },
                  i === quickLinks.length - 1 && styles.activityItemLast,
                ]}
                onPress={() => onNavigate(link.page)}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    backgroundColor: link.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={link.icon} size={14} color={link.color} />
                </View>
                <Text style={[styles.activityText, { color: link.color, fontWeight: "600" }]}>
                  {link.label}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
