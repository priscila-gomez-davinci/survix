import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const G_DARK = "#14342B";
const G_LIGHT = "#d4edd9";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";

type AppDialogProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "info" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AppDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  variant = "info",
  icon,
}: AppDialogProps) {
  const isDanger = variant === "danger";
  const iconName = icon ?? (isDanger ? "warning-outline" : "information-circle-outline");
  const iconColor = isDanger ? RED : G_DARK;
  const iconBg = isDanger ? RED_LIGHT : G_LIGHT;
  const confirmBg = isDanger ? RED : G_DARK;
  const confirmPressed = isDanger ? "#b91c1c" : "#0d2318";

  return (
    <View
      style={{
        position: "fixed" as never,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {onCancel && (
        <Pressable
          style={{ position: "absolute" as never, inset: 0 } as never}
          onPress={onCancel}
        />
      )}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 28,
          width: 360,
          maxWidth: "90%" as never,
          alignItems: "center",
          gap: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <View
          style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: iconBg,
            alignItems: "center", justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Ionicons name={iconName} size={26} color={iconColor} />
        </View>

        <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a2a1e" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7a70", textAlign: "center", marginBottom: 8 }}>
          {message}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, width: "100%" as never }}>
          {onCancel && (
            <Pressable
              style={({ pressed }) => ({
                flex: 1, height: 40, borderRadius: 8,
                borderWidth: 1, borderColor: "#dde5df",
                alignItems: "center", justifyContent: "center",
                backgroundColor: pressed ? "#f4f5f4" : "transparent",
              })}
              onPress={onCancel}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: "#3a4a3e" }}>
                {cancelLabel}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => ({
              flex: 1, height: 40, borderRadius: 8,
              alignItems: "center", justifyContent: "center",
              backgroundColor: pressed ? confirmPressed : confirmBg,
            })}
            onPress={onConfirm}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
