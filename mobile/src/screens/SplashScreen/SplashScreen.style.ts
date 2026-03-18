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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#E8E8E8",
    textAlign: "center",
  },
  loaderBlock: {
    marginTop: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#F3F3F3",
    fontSize: 13,
    letterSpacing: 0.3,
  },
});