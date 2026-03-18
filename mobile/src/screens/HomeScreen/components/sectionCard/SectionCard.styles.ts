import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 100,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  type: {
    fontSize: 11,
    color: "#999",
    textTransform: "capitalize",
  },
});