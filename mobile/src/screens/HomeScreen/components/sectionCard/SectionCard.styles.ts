import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 200,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10A95A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#14342B",
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    color: "#6D7673",
    marginTop: 2,
  },
  // kept for backwards compatibility (no longer rendered)
  type: {
    fontSize: 11,
    color: "#999",
    textTransform: "capitalize",
  },
});