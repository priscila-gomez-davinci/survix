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
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#14342B",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#D7E9E2",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: "#173B32",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionText: {
    color: "#5A7068",
    fontSize: 14,
    lineHeight: 22,
  },
  teamRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  memberCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: "#E9F5F0",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#18B678",
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    color: "#14342B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  memberRole: {
    color: "#5A7068",
    fontSize: 12,
    textAlign: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  valueIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9F5F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
    gap: 2,
  },
  valueTitle: {
    color: "#14342B",
    fontSize: 14,
    fontWeight: "700",
  },
  valueDesc: {
    color: "#5A7068",
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F0",
  },
  contactBanner: {
    backgroundColor: "#14342B",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactBannerText: {
    color: "#D7E9E2",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  contactBannerLink: {
    color: "#4ade80",
    fontWeight: "700",
  },
});
