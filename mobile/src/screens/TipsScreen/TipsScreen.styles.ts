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
    gap: 16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: "#14342B",
    borderRadius: 24,
    padding: 18,
    gap: 8,
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
  },
  heroSubtitle: {
    color: "#D7E9E2",
    fontSize: 14,
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
  categoryCount: {
    fontSize: 12,
    marginTop: -4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E8EDEB",
  },
  filterChipActive: {
    backgroundColor: "#14342B",
  },
  filterChipText: {
    color: "#58716A",
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sectionLabel: {
    color: "#173B32",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: -4,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    color: "#173B32",
    fontSize: 15,
    fontWeight: "700",
  },
  tipSummary: {
    color: "#6F7D78",
    fontSize: 13,
    lineHeight: 18,
  },
  tipStepCount: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
