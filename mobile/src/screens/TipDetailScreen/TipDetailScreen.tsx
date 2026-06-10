import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TIP_CATEGORIES, getTipById } from "@/src/data/tipsData";
import { styles } from "./TipDetailScreen.styles";

export default function TipDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tip = getTipById(id ?? "");
  const category = TIP_CATEGORIES.find((c) => c.id === tip?.categoryId);

  if (!tip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Ionicons name="alert-circle-outline" size={40} color="#8A9490" />
          <Text style={{ color: "#8A9490", fontSize: 15 }}>Tip no encontrado.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: "#14342B", fontWeight: "700" }}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = category?.accentColor ?? "#14342B";
  const bgColor = category?.bgColor ?? "#E8F4F0";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero — imagen o color sólido */}
        <View style={styles.imageWrapper}>
          {tip.image ? (
            <Image
              source={{ uri: tip.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.colorHeader, { backgroundColor: accentColor }]}>
              {category && (
                <Ionicons name={category.icon} size={64} color="rgba(255,255,255,0.25)" />
              )}
            </View>
          )}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          {category && (
            <View style={[styles.categoryPill, { backgroundColor: accentColor + "CC" }]}>
              <Text style={styles.categoryPillText}>{category.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Título y resumen */}
          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.summary}>{tip.summary}</Text>

          {/* Cuerpo */}
          <View style={styles.bodyCard}>
            <Text style={styles.bodyLabel}>¿Por qué importa?</Text>
            <Text style={styles.bodyText}>{tip.body}</Text>
          </View>

          {/* Pasos */}
          {tip.steps.length > 0 && (
            <View style={styles.stepsCard}>
              <Text style={styles.stepsLabel}>Pasos a seguir</Text>
              {tip.steps.map((step, index) => (
                <View key={step.order}>
                  {index > 0 && <View style={styles.stepDivider} />}
                  <View style={styles.stepRow}>
                    <View style={[styles.stepBadge, { backgroundColor: accentColor }]}>
                      <Text style={styles.stepBadgeText}>{step.order}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recursos visuales: badge de categoría */}
          {category && (
            <View
              style={{
                backgroundColor: bgColor,
                borderRadius: 18,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons name={category.icon} size={20} color={accentColor} />
              <Text style={{ color: accentColor, fontSize: 13, fontWeight: "600", flex: 1 }}>
                Más tips de {category.label.toLowerCase()} disponibles en la sección principal.
              </Text>
              <Pressable onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={16} color={accentColor} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
