import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  header: {
    backgroundColor: "#103D34",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  searchContainer: {
    height: 42,
    backgroundColor: "#E4E8E6",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#1C1C1C",
    fontSize: 14,
  },
  bottomBar: {
    height: 62,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7E6",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    padding: 6,
  },
});