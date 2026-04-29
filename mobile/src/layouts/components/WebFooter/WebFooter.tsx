import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type SocialLink = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  url: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  { icon: "logo-instagram", label: "Instagram", url: "https://www.google.com" },
  { icon: "logo-twitter",   label: "Twitter / X", url: "https://www.google.com" },
  { icon: "logo-facebook",  label: "Facebook",  url: "https://www.google.com" },
  { icon: "logo-youtube",   label: "YouTube",   url: "https://www.google.com" },
];

export function WebFooter() {
  const openLink = (url: string) => {
    (globalThis as unknown as { open: (url: string, target: string) => void }).open(
      url,
      "_blank"
    );
  };

  return (
    <View
      style={{
        backgroundColor: "#1d3828",
        paddingVertical: 28,
        paddingHorizontal: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Brand */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="shield-checkmark" size={18} color="#4ade80" />
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>SurvixApp</Text>
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginLeft: 12 }}>
          © {new Date().getFullYear()} Todos los derechos reservados
        </Text>
      </View>

      {/* Social icons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {SOCIAL_LINKS.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => openLink(link.url)}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.08)",
            })}
            accessibilityLabel={link.label}
          >
            <Ionicons name={link.icon} size={17} color="rgba(255,255,255,0.75)" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
