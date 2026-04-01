import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 280,
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 18,
  },
  type: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10A95A",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14342B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6D7673",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14342B",
    marginBottom: 8,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#303533",
  },
  linksSection: {
    marginTop: 10,
  },
  linksList: {
    marginTop: 14,
    gap: 12,
  },
  linkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE5E1",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkCopy: {
    flex: 1,
    marginRight: 12,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14342B",
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: "#6D7673",
  },
  primaryButton: {
    marginTop: 26,
    backgroundColor: "#103D34",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
