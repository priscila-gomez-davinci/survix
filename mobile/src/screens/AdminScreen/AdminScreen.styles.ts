import { StyleSheet } from "react-native";

// Design tokens matching the HTML mockup
export const C = {
  greenDark: "#1d3828",
  greenMid: "#2a4f38",
  greenLight: "#e6efe9",
  border: "#dde5df",
  muted: "#6b7a70",
  bg: "#f4f5f4",
  surface: "#ffffff",
  red: "#dc2626",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
  blue: "#2563eb",
  blueHover: "#1d4fd8",
  yellow: "#d97706",
  yellowLight: "#fffbeb",
  text: "#1a2a1e",
  textSub: "#3a4a3e",
};

export const styles = StyleSheet.create({
  // ─── Outer shell (sidebar + main, fills below WebNavbar) ─────────────────────
  root: {
    flex: 1,
    backgroundColor: C.bg,
    flexDirection: "row",
  },

  // ─── Sidebar ──────────────────────────────────────────────────────────────────
  sidebar: {
    width: "25%" as never,
    maxWidth: 280,
    backgroundColor: C.surface,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingVertical: 20,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: C.muted,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  sidebarItemActive: {
    backgroundColor: C.greenLight,
    borderLeftColor: C.greenDark,
  },
  sidebarItemText: {
    fontSize: 13.5,
    fontWeight: "500",
    color: C.textSub,
    flex: 1,
  },
  sidebarItemTextActive: {
    color: C.greenDark,
    fontWeight: "600",
  },
  sidebarBadge: {
    backgroundColor: C.greenDark,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: "center",
  },
  sidebarBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // ─── Main ─────────────────────────────────────────────────────────────────────
  main: {
    flex: 1,
    backgroundColor: C.bg,
  },
  mainContent: {
    padding: 28,
    paddingBottom: 48,
  },

  // ─── Page header ──────────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.greenDark,
  },
  pageSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },

  // ─── Stats row ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 18,
    gap: 6,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: C.greenDark,
  },
  statDelta: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "500",
  },

  // ─── Section tabs ─────────────────────────────────────────────────────────────
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 20,
  },
  sectionTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  sectionTabActive: {
    borderBottomColor: C.greenDark,
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.muted,
  },
  sectionTabTextActive: {
    color: C.greenDark,
    fontWeight: "600",
  },

  // ─── Toolbar ──────────────────────────────────────────────────────────────────
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    maxWidth: 320,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    outlineWidth: 0,
  } as never,
  filterBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.textSub,
  },
  toolbarCount: {
    marginLeft: "auto" as never,
    fontSize: 12,
    color: C.muted,
  },

  // ─── Primary / danger buttons ─────────────────────────────────────────────────
  btnPrimary: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: C.blue,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  btnIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  btnIconRed: {
    borderColor: C.redBorder,
    backgroundColor: C.redLight,
  },

  // ─── Table ────────────────────────────────────────────────────────────────────
  tableWrap: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fbf9",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  thText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f1",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tdText: {
    fontSize: 13.5,
    color: C.text,
  },
  tdMuted: {
    fontSize: 12.5,
    color: C.muted,
  },
  tdBold: {
    fontSize: 13.5,
    fontWeight: "600",
    color: C.text,
  },

  // ─── User cell ────────────────────────────────────────────────────────────────
  userCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cellName: {
    fontSize: 13.5,
    fontWeight: "600",
    color: C.text,
  },
  cellSub: {
    fontSize: 12,
    color: C.muted,
  },

  // ─── Badges ───────────────────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeGreenText: { color: "#15803d" },
  badgeBlue: { backgroundColor: "#dbeafe" },
  badgeBlueText: { color: "#1d4ed8" },
  badgeYellow: { backgroundColor: "#fef3c7" },
  badgeYellowText: { color: "#b45309" },
  badgeRed: { backgroundColor: "#fee2e2" },
  badgeRedText: { color: "#b91c1c" },
  badgeGray: { backgroundColor: "#f3f4f6" },
  badgeGrayText: { color: "#4b5563" },

  // ─── Row actions ──────────────────────────────────────────────────────────────
  rowActions: {
    flexDirection: "row",
    gap: 6,
  },

  // ─── Pagination ───────────────────────────────────────────────────────────────
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  paginationText: {
    fontSize: 12.5,
    color: C.muted,
  },

  // ─── Modal ────────────────────────────────────────────────────────────────────
  modalOverlay: {
    position: "absolute" as never,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  modal: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 28,
    width: 480,
    maxWidth: "90%" as never,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
    overflow: "visible" as never,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.greenDark,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },

  // ─── Form fields ──────────────────────────────────────────────────────────────
  formRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  formGroup: {
    flex: 1,
    gap: 5,
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSub,
  },
  formInput: {
    height: 38,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: C.text,
    backgroundColor: C.surface,
    outlineWidth: 0,
  } as never,
  formTextarea: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: C.text,
    backgroundColor: C.surface,
    minHeight: 72,
    outlineWidth: 0,
  } as never,
  formInputFocus: {
    borderColor: C.greenDark,
  },
  formError: {
    fontSize: 11.5,
    color: C.red,
    marginTop: 2,
  },
  generalError: {
    fontSize: 12.5,
    color: C.red,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },

  // ─── Select field ─────────────────────────────────────────────────────────────
  selectField: {
    height: 38,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
  },
  selectFieldText: {
    fontSize: 13,
    color: C.text,
    flex: 1,
  },
  selectPlaceholder: {
    color: C.muted,
  },
  selectDropdown: {
    position: "absolute" as never,
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 200,
    overflow: "hidden",
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f1",
  },
  selectOptionActive: {
    backgroundColor: C.greenLight,
  },
  selectOptionText: {
    fontSize: 13,
    color: C.text,
  },
  selectOptionTextActive: {
    color: C.greenDark,
    fontWeight: "600",
  },

  // ─── Ghost / cancel button ────────────────────────────────────────────────────
  btnGhost: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.textSub,
  },
  btnSave: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: C.blue,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnSaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },

  // ─── Empty / loading ──────────────────────────────────────────────────────────
  emptyWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
    marginTop: 8,
  },

  // ─── Section divider ─────────────────────────────────────────────────────────
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionDividerText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ─── Sub-panel (points) ───────────────────────────────────────────────────────
  subPanel: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 12,
  },
  subPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fbf9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  subPanelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSub,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f1",
    gap: 8,
  },

  // ─── Search users section ─────────────────────────────────────────────────────
  searchSection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  searchSectionInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.surface,
    outlineWidth: 0,
  } as never,
  searchSectionBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: C.greenDark,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSectionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ─── User info card ───────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 20,
    gap: 12,
  },
  infoSection: {
    gap: 8,
  },
  infoSectionLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#10A95A",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  infoKey: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    width: 90,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    color: C.text,
    flex: 1,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 8,
  },

  // ─── "Not available on mobile" ────────────────────────────────────────────────
  mobileMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  mobileMessageText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.muted,
    textAlign: "center",
  },

  // ─── Dashboard panels ─────────────────────────────────────────────────────────
  dashboardRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 0,
  },
  panelCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  panelBody: {
    padding: 20,
    gap: 12,
  },

  // Activity list
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f1",
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },

  // Distribution bars
  distRow: {
    gap: 6,
  },
  distLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distLabelText: {
    fontSize: 12.5,
    color: C.textSub,
    fontWeight: "500",
  },
  distCount: {
    fontSize: 12.5,
    color: C.muted,
  },
  distTrack: {
    height: 6,
    backgroundColor: "#eef1ee",
    borderRadius: 3,
    overflow: "hidden",
  },
  distFill: {
    height: 6,
    borderRadius: 3,
  },

  // Filter tabs (used in UsersTab)
  filterTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  filterTabActive: {
    borderBottomColor: C.greenDark,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.muted,
  },
  filterTabTextActive: {
    color: C.greenDark,
    fontWeight: "600",
  },
});
