import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },

  // ─── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#103D34",
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
  },
  adminBadge: {
    backgroundColor: "#18B678",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ─── Tabs ─────────────────────────────────────────────────────────────────────
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDEB",
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#14342B",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8A9490",
  },
  tabTextActive: {
    color: "#14342B",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },

  // ─── Tab container ────────────────────────────────────────────────────────────
  tabContainer: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14342B",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#14342B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // ─── Item cards ───────────────────────────────────────────────────────────────
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8EDEB",
  },
  itemCardExpanded: {
    borderColor: "#14342B",
    borderWidth: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14342B",
  },
  itemMeta: {
    fontSize: 13,
    color: "#8A9490",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8EDEB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14342B",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D93025",
  },

  // ─── Form fields ──────────────────────────────────────────────────────────────
  form: {
    gap: 12,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E8EDEB",
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldGroup: {
    gap: 5,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#14342B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F5F6F5",
    paddingHorizontal: 12,
    color: "#14342B",
    fontSize: 14,
  },
  inputError: {
    borderColor: "#D93025",
    backgroundColor: "#FFF5F5",
  },
  textArea: {
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F5F6F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#14342B",
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: "#D93025",
    marginTop: 2,
  },
  generalError: {
    fontSize: 13,
    color: "#D93025",
    textAlign: "center",
    marginTop: 4,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#14342B",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E8EDEB",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#14342B",
    fontWeight: "700",
    fontSize: 14,
  },

  // ─── Empty / loading states ───────────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8A9490",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8A9490",
    textAlign: "center",
    lineHeight: 20,
  },

  // ─── Users tab specifics ──────────────────────────────────────────────────────
  searchBox: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: "#14342B",
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: "#14342B",
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E8EDEB",
  },
  userCardSection: {
    gap: 8,
  },
  userCardSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10A95A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userDataRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  userDataLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A9490",
    width: 90,
    flexShrink: 0,
  },
  userDataValue: {
    fontSize: 13,
    color: "#14342B",
    flex: 1,
  },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E8EDEB",
    paddingTop: 14,
    marginTop: 4,
  },
});
