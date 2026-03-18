import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  bottomBar: {
    height: 70,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7E6",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  navItem: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    backgroundColor: "#14342B",
  },
  primaryNavItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#18B678",
    marginTop: -20,
    shadowColor: "#0B2C24",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
