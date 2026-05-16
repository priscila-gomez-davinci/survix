import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8EDEB",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#14342B",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#14342B",
  },

  // ─── Filter panel ────────────────────────────────────────────────────────────
  filterPanel: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDEB",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#14342B",
  },
  extraFilters: {
    flexDirection: "row",
    gap: 12,
  },
  filterField: {
    flex: 1,
    gap: 4,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A9490",
    textTransform: "uppercase",
  },
  filterInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F5F6F5",
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#14342B",
  },
  clearRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10A95A",
  },

  // ─── List ────────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#E8EDEB",
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardType: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10A95A",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14342B",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6D7673",
  },
  favoriteButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── Empty state ─────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8EDEB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14342B",
  },
  emptyText: {
    fontSize: 14,
    color: "#6D7673",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 4,
    backgroundColor: "#14342B",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
