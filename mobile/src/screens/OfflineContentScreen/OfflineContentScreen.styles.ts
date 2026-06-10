import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F5F2",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#14342B",
  },
  headerSub: {
    fontSize: 13,
    color: "#8A9490",
    marginTop: 2,
  },

  // ─── Section label ────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A9490",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 10,
  },

  // ─── Guide card ──────────────────────────────────────────────────────────
  guideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  guideCardRow: {
    flexDirection: "row",
    padding: 14,
    gap: 14,
    alignItems: "center",
  },
  guideThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#E8EDEB",
  },
  guideInfo: {
    flex: 1,
    gap: 3,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14342B",
    lineHeight: 20,
  },
  guideMeta: {
    fontSize: 12,
    color: "#8A9490",
  },
  guideSavedAt: {
    fontSize: 11,
    color: "#A5B4AD",
    marginTop: 2,
  },
  guideActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F5F2",
  },
  guideActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  guideActionBtnPrimary: {
    backgroundColor: "#14342B",
    borderBottomLeftRadius: 18,
  },
  guideActionBtnSecondary: {
    borderBottomRightRadius: 18,
  },
  guideActionDivider: {
    width: 1,
    backgroundColor: "#F0F5F2",
  },
  guideActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#14342B",
  },
  guideActionTextPrimary: {
    color: "#FFFFFF",
  },

  // ─── Map card ─────────────────────────────────────────────────────────────
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  mapIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#EBF5FB",
    justifyContent: "center",
    alignItems: "center",
  },
  mapInfo: {
    flex: 1,
    gap: 3,
  },
  mapLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14342B",
  },
  mapCoords: {
    fontSize: 12,
    color: "#8A9490",
  },
  mapSavedAt: {
    fontSize: 11,
    color: "#A5B4AD",
  },
  mapDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── Empty state ──────────────────────────────────────────────────────────
  emptySection: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6D7673",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#A5B4AD",
    textAlign: "center",
    lineHeight: 19,
  },

  // ─── Info banner ──────────────────────────────────────────────────────────
  infoBanner: {
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F4EE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#14342B",
    lineHeight: 19,
  },
});
