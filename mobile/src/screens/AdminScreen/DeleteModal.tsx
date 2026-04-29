import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteModal({ label, onConfirm, onCancel }: Props) {
  return (
    <View style={{
      position: "fixed" as never,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <View style={{
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
      }}>
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: "#fee2e2",
          alignItems: "center", justifyContent: "center",
          marginBottom: 4,
        }}>
          <Ionicons name="trash-outline" size={24} color="#dc2626" />
        </View>

        <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a2a1e" }}>
          ¿Eliminar elemento?
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7a70", textAlign: "center", marginBottom: 8 }}>
          Estás por eliminar {label}.{"\n"}Esta acción no se puede deshacer.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, width: "100%" as never }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1, height: 40, borderRadius: 8,
              borderWidth: 1, borderColor: "#dde5df",
              alignItems: "center", justifyContent: "center",
              backgroundColor: pressed ? "#f4f5f4" : "transparent",
            })}
            onPress={onCancel}
          >
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#3a4a3e" }}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              flex: 1, height: 40, borderRadius: 8,
              alignItems: "center", justifyContent: "center",
              backgroundColor: pressed ? "#b91c1c" : "#dc2626",
            })}
            onPress={onConfirm}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
