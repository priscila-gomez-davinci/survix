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
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#18B678",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    gap: 4,
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
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF1A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: "#173B32",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#6F7D78",
    fontSize: 13,
    marginTop: 4,
    maxWidth: 240,
  },
  editButton: {
    backgroundColor: "#18B678",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7DEDB",
    backgroundColor: "#F8FAF9",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#173B32",
  },
  inputReadonly: {
    backgroundColor: "#EEF2F0",
    color: "#50625D",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#BFC9C5",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#173B32",
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#E9F5F0",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "#14342B",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#5A7068",
    fontSize: 12,
    textAlign: "center",
  },
});
