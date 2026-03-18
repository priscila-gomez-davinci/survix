import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F5",
  },
  mapWrapper: {
    flex: 1,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: "#1C1C1C",
  },
});