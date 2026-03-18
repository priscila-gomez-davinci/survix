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
    fontSize: 24,
    fontWeight: "800",
  },
  heroText: {
    color: "#D7E9E2",
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    color: "#173B32",
    fontSize: 20,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  togglePill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: "#EEF2F0",
    alignItems: "center",
  },
  togglePillActive: {
    backgroundColor: "#18B678",
  },
  toggleText: {
    color: "#173B32",
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#173B32",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F8FAF9",
    paddingHorizontal: 14,
    color: "#173B32",
  },
  textArea: {
    minHeight: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F8FAF9",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#173B32",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 6,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchHint: {
    color: "#73837D",
    fontSize: 12,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: "#14342B",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  feedbackCard: {
    backgroundColor: "#E9F5F0",
    borderRadius: 16,
    padding: 14,
  },
  feedbackText: {
    color: "#173B32",
    lineHeight: 20,
    fontWeight: "600",
  },
});
