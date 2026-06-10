import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  imageWrapper: {
    height: 220,
    backgroundColor: "#14342B",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  colorHeader: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPill: {
    position: "absolute",
    bottom: 16,
    left: 16,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  title: {
    color: "#14342B",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  summary: {
    color: "#5A7068",
    fontSize: 15,
    lineHeight: 22,
  },
  bodyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  bodyLabel: {
    color: "#173B32",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bodyText: {
    color: "#5A7068",
    fontSize: 14,
    lineHeight: 22,
  },
  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  stepsLabel: {
    color: "#173B32",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  stepDivider: {
    height: 1,
    backgroundColor: "#EEF2F0",
    marginLeft: 40,
  },
  stepText: {
    flex: 1,
    color: "#3D524B",
    fontSize: 14,
    lineHeight: 22,
  },
});
