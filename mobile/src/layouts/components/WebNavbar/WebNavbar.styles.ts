import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#103D34",
    paddingHorizontal: 32,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    zIndex: 100,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  adminBadge: {
    backgroundColor: "#18B678",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  navLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  navDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 6,
  },
});
