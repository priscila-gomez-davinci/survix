import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  topBrand: {
    width: "100%",
    alignItems: "flex-start",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  brandSub: {
    color: "#E6E6E6",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#14342B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#5E6A66",
    textAlign: "center",
    marginBottom: 22,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D9E0DD",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAF9",
    color: "#1C1C1C",
    marginBottom: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#103D34",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  linkText: {
    textAlign: "center",
    marginTop: 18,
    color: "#103D34",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    color: "#F2F2F2",
    fontSize: 12,
  },
});