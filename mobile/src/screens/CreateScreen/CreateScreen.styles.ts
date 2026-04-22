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
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#14342B",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14342B",
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: "#14342B",
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#14342B",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#14342B",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
