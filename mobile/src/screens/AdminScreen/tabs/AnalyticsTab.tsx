import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, C } from "../AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "all" | "web" | "mobile";
type ExportFormat = "csv" | "pdf";

type SectionData = { label: string; value: number; color: string };

type AnalyticsData = {
  sections: SectionData[];
  totals: { totalVisits: number; avgSession: string; bounceRate: string; newUsers: number };
  mobile: {
    offlineDownloads: number;
    mapsDownloaded: number;
    topTips: { label: string; visits: number }[];
  };
};

// ─── Data generation (simulated) ─────────────────────────────────────────────

function parseDateSafe(str: string): Date | null {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function computeAnalytics(from: string, to: string, platform: Platform): AnalyticsData {
  const fromDate = parseDateSafe(from) ?? new Date(Date.now() - 30 * 86400000);
  const toDate = parseDateSafe(to) ?? new Date();
  const days = Math.max(1, Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000));

  // Deterministic seed from date
  const seed = (fromDate.getDate() + fromDate.getMonth() * 7 + fromDate.getFullYear() * 3) % 100;
  const scale = days / 30;
  const platformMult = platform === "mobile" ? 0.42 : platform === "web" ? 0.58 : 1.0;

  const base = (n: number) => Math.floor(n * scale * platformMult);

  const sections: SectionData[] = [
    { label: "Actividades",  value: base(1240 + seed * 4),  color: C.blue },
    { label: "Tips",         value: base(980  + seed * 5),  color: "#7c3aed" },
    { label: "Guías",        value: base(820  + seed * 3),  color: C.greenDark },
    { label: "Blog",         value: base(640  + seed * 2),  color: "#d97706" },
    { label: "Mapa",         value: base(710  + seed * 4),  color: "#0891b2" },
    { label: "Planes",       value: base(380  + seed * 2),  color: "#dc2626" },
  ];

  const totalVisits = sections.reduce((sum, s) => sum + s.value, 0);

  return {
    sections,
    totals: {
      totalVisits,
      avgSession: `${3 + (seed % 4)}.${(seed * 3) % 9} min`,
      bounceRate: `${22 + (seed % 28)}%`,
      newUsers: base(140 + seed * 2),
    },
    mobile: {
      offlineDownloads: Math.floor((48 + seed) * scale),
      mapsDownloaded:   Math.floor((31 + seed % 18) * scale),
      topTips: [
        { label: "Purificar agua en el campo",      visits: Math.floor((130 + seed * 2) * scale) },
        { label: "Cómo curar una herida",           visits: Math.floor((105 + seed)     * scale) },
        { label: "Orientarse sin brújula",          visits: Math.floor((88  + seed)     * scale) },
        { label: "Reconocer hipotermia",            visits: Math.floor((76  + seed % 15)* scale) },
        { label: "Improvisa un refugio A-frame",    visits: Math.floor((62  + seed % 10)* scale) },
      ],
    },
  };
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

function BarChart({ items }: { items: SectionData[] }) {
  const max = Math.max(...items.map((d) => d.value), 1);
  return (
    <View style={{ gap: 12 }}>
      {items.map((item) => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: C.textSub, fontWeight: "500" }}>{item.label}</Text>
            <Text style={{ fontSize: 12, color: C.muted, fontVariant: ["tabular-nums"] as never }}>
              {item.value.toLocaleString("es-AR")}
            </Text>
          </View>
          <View style={{ height: 10, backgroundColor: "#eef1ee", borderRadius: 5, overflow: "hidden" }}>
            <View
              style={{
                width: `${(item.value / max) * 100}%` as never,
                height: 10,
                backgroundColor: item.color,
                borderRadius: 5,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, delta }: { label: string; value: string | number; delta?: string }) {
  return (
    <View style={[styles.statCard, { flex: 1 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {delta ? <Text style={styles.statDelta}>{delta}</Text> : null}
    </View>
  );
}

// ─── Export helpers (web-only) ────────────────────────────────────────────────

function exportCSV(data: AnalyticsData, from: string, to: string) {
  const lines = [
    `"Reporte de Analytics — ${from} a ${to}"`,
    "",
    `"Total visitas","${data.totals.totalVisits}"`,
    `"Nuevos usuarios","${data.totals.newUsers}"`,
    `"Sesión promedio","${data.totals.avgSession}"`,
    `"Tasa de rebote","${data.totals.bounceRate}"`,
    "",
    '"Visitas por sección"',
    '"Sección","Visitas"',
    ...data.sections.map((s) => `"${s.label}","${s.value}"`),
    "",
    '"Tips más consultados (mobile)"',
    '"Tip","Visitas"',
    ...data.mobile.topTips.map((t) => `"${t.label}","${t.visits}"`),
    "",
    `"Descargas offline","${data.mobile.offlineDownloads}"`,
    `"Mapas descargados","${data.mobile.mapsDownloaded}"`,
  ];

  const csv = lines.join("\n");
  const g = globalThis as unknown as {
    Blob: typeof Blob;
    URL: { createObjectURL: (b: Blob) => string; revokeObjectURL: (u: string) => void };
    document: Document;
  };
  const blob = new g.Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = g.URL.createObjectURL(blob);
  const link = g.document.createElement("a");
  link.href = url;
  link.download = `survix_analytics_${from}_${to}.csv`;
  link.click();
  g.URL.revokeObjectURL(url);
}

function exportPDF(data: AnalyticsData, from: string, to: string) {
  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Reporte SurvixApp — ${from} / ${to}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:32px;color:#1a2a1e}
      h1{color:#1d3828;font-size:20px;margin-bottom:4px}
      p.sub{color:#6b7a70;font-size:13px;margin-top:0;margin-bottom:24px}
      h2{color:#1d3828;font-size:14px;margin:20px 0 8px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #dde5df;padding:8px 12px;text-align:left;font-size:13px}
      th{background:#f4f5f4;font-weight:600}
      .summary{display:flex;gap:20px;margin-bottom:24px}
      .card{border:1px solid #dde5df;border-radius:8px;padding:14px;min-width:130px}
      .card-val{font-size:22px;font-weight:700;color:#1d3828}
      .card-lbl{font-size:11px;color:#6b7a70;text-transform:uppercase}
      @media print{@page{margin:24px}}
    </style></head><body>
    <h1>Reporte de Analytics — SurvixApp</h1>
    <p class="sub">Período: ${from} — ${to}</p>

    <div class="summary">
      <div class="card"><div class="card-val">${data.totals.totalVisits.toLocaleString("es-AR")}</div><div class="card-lbl">Visitas totales</div></div>
      <div class="card"><div class="card-val">${data.totals.newUsers}</div><div class="card-lbl">Nuevos usuarios</div></div>
      <div class="card"><div class="card-val">${data.totals.avgSession}</div><div class="card-lbl">Sesión promedio</div></div>
      <div class="card"><div class="card-val">${data.totals.bounceRate}</div><div class="card-lbl">Tasa de rebote</div></div>
    </div>

    <h2>Visitas por sección</h2>
    <table><tr><th>Sección</th><th>Visitas</th></tr>
    ${data.sections.map((s) => `<tr><td>${s.label}</td><td>${s.value.toLocaleString("es-AR")}</td></tr>`).join("")}
    </table>

    <h2>Tips más consultados (mobile)</h2>
    <table><tr><th>Tip</th><th>Visitas</th></tr>
    ${data.mobile.topTips.map((t) => `<tr><td>${t.label}</td><td>${t.visits}</td></tr>`).join("")}
    </table>

    <h2>Uso mobile</h2>
    <table>
      <tr><td>Descargas offline</td><td>${data.mobile.offlineDownloads}</td></tr>
      <tr><td>Mapas descargados</td><td>${data.mobile.mapsDownloaded}</td></tr>
    </table>
    </body></html>`;

  const g = globalThis as unknown as { open: (url: string, target: string) => Window };
  const win = g.open("", "_blank");
  (win as unknown as { document: Document }).document.write(html);
  (win as unknown as { document: Document & { close: () => void } }).document.close();
  (win as unknown as { print: () => void }).print();
}

// ─── AnalyticsTab ─────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

const PLATFORM_OPTIONS: { id: Platform; label: string }[] = [
  { id: "all",    label: "Todas las plataformas" },
  { id: "web",    label: "Web" },
  { id: "mobile", label: "Mobile" },
];

export function AnalyticsTab() {
  const [dateFrom,  setDateFrom]  = useState(thirtyDaysAgo);
  const [dateTo,    setDateTo]    = useState(today);
  const [platform,  setPlatform]  = useState<Platform>("all");
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const data = useMemo(() => computeAnalytics(dateFrom, dateTo, platform), [dateFrom, dateTo, platform]);

  const showMobileStats = platform === "mobile" || platform === "all";

  const handleExport = (format: ExportFormat) => {
    setExporting(true);
    setTimeout(() => {
      try {
        if (format === "csv") exportCSV(data, dateFrom, dateTo);
        else exportPDF(data, dateFrom, dateTo);
        setExportDone(true);
        setTimeout(() => setExportDone(false), 3000);
      } catch {
        // fail silently
      } finally {
        setExporting(false);
      }
    }, 100);
  };

  return (
    <View style={{ gap: 24 }}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Analytics</Text>
          <Text style={styles.pageSubtitle}>
            Visitas por sección, estadísticas de uso y exportación de reportes.
          </Text>
        </View>

        {/* Export buttons */}
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {exportDone && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
              <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>Exportado</Text>
            </View>
          )}
          <Pressable
            style={[styles.filterBtn, exporting && { opacity: 0.6 }]}
            onPress={() => handleExport("csv")}
            disabled={exporting}
          >
            {exporting
              ? <ActivityIndicator size="small" color={C.textSub} />
              : <Ionicons name="download-outline" size={14} color={C.textSub} />
            }
            <Text style={styles.filterBtnText}>Exportar CSV</Text>
          </Pressable>
          <Pressable
            style={[styles.btnPrimary, exporting && { opacity: 0.6 }]}
            onPress={() => handleExport("pdf")}
            disabled={exporting}
          >
            <Ionicons name="print-outline" size={14} color="#fff" />
            <Text style={styles.btnPrimaryText}>Exportar PDF</Text>
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.panelCard, { overflow: "visible" as never }]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Filtros del reporte</Text>
        </View>
        <View style={[styles.panelBody, { flexDirection: "row", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }]}>
          {/* Date range */}
          <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Desde</Text>
              <TextInput
                value={dateFrom}
                onChangeText={setDateFrom}
                style={[styles.formInput, { width: 140 }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={C.muted}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hasta</Text>
              <TextInput
                value={dateTo}
                onChangeText={setDateTo}
                style={[styles.formInput, { width: 140 }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={C.muted}
              />
            </View>
          </View>

          {/* Platform filter */}
          <View>
            <Text style={[styles.formLabel, { marginBottom: 6 }]}>Plataforma</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {PLATFORM_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.filterBtn,
                    platform === opt.id && { backgroundColor: C.greenLight, borderColor: C.greenDark },
                  ]}
                  onPress={() => setPlatform(opt.id)}
                >
                  {opt.id === "mobile" && (
                    <Ionicons name="phone-portrait-outline" size={13} color={platform === opt.id ? C.greenDark : C.textSub} />
                  )}
                  {opt.id === "web" && (
                    <Ionicons name="desktop-outline" size={13} color={platform === opt.id ? C.greenDark : C.textSub} />
                  )}
                  <Text style={[styles.filterBtnText, platform === opt.id && { color: C.greenDark, fontWeight: "600" }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Summary stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Visitas totales"
          value={data.totals.totalVisits.toLocaleString("es-AR")}
          delta={platform !== "all" ? `Filtro: ${platform}` : "Todas las plataformas"}
        />
        <StatCard
          label="Nuevos usuarios"
          value={data.totals.newUsers.toLocaleString("es-AR")}
          delta="En el período"
        />
        <StatCard
          label="Sesión promedio"
          value={data.totals.avgSession}
          delta="Tiempo activo"
        />
        <StatCard
          label="Tasa de rebote"
          value={data.totals.bounceRate}
          delta="Salidas sin interacción"
        />
      </View>

      {/* Section visits chart */}
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Visitas por sección</Text>
          <Text style={[styles.pageSubtitle, { marginTop: 2 }]}>
            {dateFrom} — {dateTo}
          </Text>
        </View>
        <View style={styles.panelBody}>
          <BarChart items={data.sections} />
        </View>
      </View>

      {/* Mobile-specific stats */}
      {showMobileStats && (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="phone-portrait-outline" size={16} color={C.greenDark} />
            <Text style={[styles.panelTitle, { fontSize: 16 }]}>Estadísticas Mobile</Text>
          </View>

          {/* Mobile summary cards */}
          <View style={styles.statsRow}>
            <StatCard
              label="Descargas offline"
              value={data.mobile.offlineDownloads}
              delta="Contenido guardado"
            />
            <StatCard
              label="Mapas descargados"
              value={data.mobile.mapsDownloaded}
              delta="Mapas sin conexión"
            />
            <StatCard
              label="Tip más visto"
              value={data.mobile.topTips[0]?.visits ?? 0}
              delta={`"${data.mobile.topTips[0]?.label ?? "—"}"`}
            />
          </View>

          {/* Top tips table */}
          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Tips más consultados en Mobile</Text>
            </View>
            <View style={styles.tableWrap}>
              <View style={styles.tableHeader}>
                <Text style={[styles.thText, { width: 30 }]}>#</Text>
                <Text style={[styles.thText, { flex: 1 }]}>Tip</Text>
                <Text style={[styles.thText, { width: 120, textAlign: "right" }]}>Visitas</Text>
                <Text style={[styles.thText, { width: 180 }]}>Popularidad</Text>
              </View>
              {data.mobile.topTips.map((tip, index) => {
                const maxV = data.mobile.topTips[0]?.visits ?? 1;
                const pct = Math.round((tip.visits / maxV) * 100);
                return (
                  <View
                    key={tip.label}
                    style={[styles.tableRow, index === data.mobile.topTips.length - 1 && styles.tableRowLast]}
                  >
                    <Text style={[styles.tdMuted, { width: 30 }]}>{index + 1}</Text>
                    <Text style={[styles.tdBold, { flex: 1 }]} numberOfLines={1}>{tip.label}</Text>
                    <Text style={[styles.tdText, { width: 120, textAlign: "right" }]}>
                      {tip.visits.toLocaleString("es-AR")}
                    </Text>
                    <View style={{ width: 180, paddingLeft: 12 }}>
                      <View style={{ height: 6, backgroundColor: "#eef1ee", borderRadius: 3, overflow: "hidden" }}>
                        <View
                          style={{
                            width: `${pct}%` as never,
                            height: 6,
                            backgroundColor: "#7c3aed",
                            borderRadius: 3,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
