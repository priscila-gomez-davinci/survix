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
    paddingBottom: 24,
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
});
