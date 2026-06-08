import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 32,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: "#14342B",
    borderRadius: 24,
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  heroEyebrow: {
    color: "#76E2B3",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#D7E9E2",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  // ── Plan cards ────────────────────────────────────────────────────────────
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardHighlighted: {
    borderColor: "#18B678",
    backgroundColor: "#FFFFFF",
  },
  recommendedBadge: {
    backgroundColor: "#18B678",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  recommendedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  planHeader: {
    gap: 4,
  },
  planName: {
    color: "#14342B",
    fontSize: 20,
    fontWeight: "800",
  },
  planDescription: {
    color: "#6F7D78",
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  planPrice: {
    color: "#14342B",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
  },
  planBilling: {
    color: "#8A9490",
    fontSize: 13,
    marginBottom: 4,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "#3D524B",
    fontSize: 14,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F0",
  },
  planButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  planButtonPrimary: {
    backgroundColor: "#18B678",
  },
  planButtonSecondary: {
    backgroundColor: "#E9F5F0",
  },
  planButtonDisabled: {
    backgroundColor: "#EEF2F0",
  },
  planButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
  planButtonTextPrimary: {
    color: "#FFFFFF",
  },
  planButtonTextSecondary: {
    color: "#14342B",
  },
  planButtonTextDisabled: {
    color: "#8A9490",
  },
  trialNote: {
    color: "#8A9490",
    fontSize: 12,
    textAlign: "center",
    marginTop: -6,
  },

  // ── Comparison table ──────────────────────────────────────────────────────
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
  },
  tableTitle: {
    color: "#14342B",
    fontSize: 18,
    fontWeight: "800",
    padding: 16,
    paddingBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#14342B",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableHeaderFeature: {
    flex: 2,
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tableHeaderPlan: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
  tableHeaderPlanHighlighted: {
    color: "#76E2B3",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#F8FAF9",
  },
  tableRowFeature: {
    flex: 2,
    color: "#3D524B",
    fontSize: 13,
  },
  tableRowCell: {
    flex: 1,
    alignItems: "center",
  },
  tableRowCellText: {
    color: "#3D524B",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },

  // ── Trial success ─────────────────────────────────────────────────────────
  successBanner: {
    backgroundColor: "#E9F5F0",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  successIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#18B678",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  successText: {
    color: "#14342B",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  successSubtext: {
    color: "#5A7068",
    fontSize: 12,
    marginTop: 2,
    flex: 1,
  },
});
