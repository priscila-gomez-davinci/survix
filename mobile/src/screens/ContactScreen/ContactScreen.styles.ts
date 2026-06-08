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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroCopy: {
    gap: 4,
    flex: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#D7E9E2",
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 14,
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
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F8FAF9",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#173B32",
  },
  submitButton: {
    backgroundColor: "#18B678",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#18B678",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    color: "#14342B",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  successText: {
    color: "#6F7D78",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
