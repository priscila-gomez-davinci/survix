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
  },
  heroCard: {
    backgroundColor: "#14342B",
    borderRadius: 24,
    padding: 18,
    gap: 10,
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
  heroText: {
    color: "#D7E9E2",
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF14",
    borderRadius: 18,
    padding: 14,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#D7E9E2",
    marginTop: 4,
    fontSize: 12,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  authorBadgeText: {
    color: "#14342B",
    fontWeight: "800",
  },
  authorCopy: {
    flex: 1,
  },
  authorName: {
    color: "#173B32",
    fontWeight: "800",
    fontSize: 15,
  },
  authorRole: {
    color: "#72847D",
    fontSize: 12,
    marginTop: 2,
  },
  categoryPill: {
    backgroundColor: "#EAF7F1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: "#1B7754",
    fontSize: 11,
    fontWeight: "700",
  },
  postTitle: {
    color: "#173B32",
    fontSize: 18,
    fontWeight: "800",
  },
  postSummary: {
    color: "#58716A",
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EEF3F1",
  },
  actionButtonPositive: {
    backgroundColor: "#18B678",
  },
  actionButtonNegative: {
    backgroundColor: "#C15A5A",
  },
  actionText: {
    color: "#173B32",
    fontWeight: "700",
  },
  actionTextActive: {
    color: "#FFFFFF",
  },
  commentsBlock: {
    gap: 8,
  },
  commentsTitle: {
    color: "#173B32",
    fontWeight: "700",
  },
  commentChip: {
    backgroundColor: "#F4F7F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentText: {
    color: "#536963",
    lineHeight: 18,
  },
  commentComposer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 46,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#D5DEDA",
    borderRadius: 16,
    paddingHorizontal: 14,
    color: "#173B32",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#14342B",
    alignItems: "center",
    justifyContent: "center",
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
});
