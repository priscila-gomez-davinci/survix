import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  TIP_CATEGORIES,
  TIPS,
  getTipsByCategory,
  type TipCategory,
} from "@/src/data/tipsData";
import { styles } from "./TipsScreen.styles";

const ALL_ID = "all";

export default function TipsScreen() {
  const router = useRouter();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const visibleTips = useMemo(() => {
    if (!activeCategoryId || activeCategoryId === ALL_ID) return TIPS;
    return getTipsByCategory(activeCategoryId);
  }, [activeCategoryId]);

  const activeCategoryMeta = useMemo<TipCategory | undefined>(
    () => TIP_CATEGORIES.find((c) => c.id === activeCategoryId),
    [activeCategoryId]
  );

  const handleCategoryCard = (id: string) => {
    setActiveCategoryId((prev) => (prev === id ? null : id));
  };

  const handleTipPress = (tipId: string) => {
    router.push({ pathname: "/tip-detail", params: { id: tipId } });
  };

  const showingAllCategories = !activeCategoryId || activeCategoryId === ALL_ID;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Guía de campo</Text>
          <Text style={styles.heroTitle}>Tips de supervivencia</Text>
          <Text style={styles.heroSubtitle}>
            Encontrá rápido lo que necesitás. Seleccioná una categoría o explorá todos los tips.
          </Text>
        </View>

        {/* Category grid — always visible */}
        <View style={styles.categoryGrid}>
          {TIP_CATEGORIES.map((cat) => {
            const count = getTipsByCategory(cat.id).length;
            const isActive = activeCategoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isActive ? cat.accentColor : cat.bgColor,
                  },
                ]}
                onPress={() => handleCategoryCard(cat.id)}
              >
                <View
                  style={[
                    styles.categoryIconWrap,
                    {
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : cat.accentColor + "22",
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={isActive ? "#FFFFFF" : cat.accentColor}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isActive ? "#FFFFFF" : cat.accentColor },
                  ]}
                >
                  {cat.label}
                </Text>
                <Text
                  style={[
                    styles.categoryCount,
                    { color: isActive ? "rgba(255,255,255,0.75)" : cat.accentColor + "99" },
                  ]}
                >
                  {count} {count === 1 ? "tip" : "tips"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={[
              styles.filterChip,
              showingAllCategories && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategoryId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                showingAllCategories && styles.filterChipTextActive,
              ]}
            >
              Todos
            </Text>
          </Pressable>
          {TIP_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.filterChip,
                activeCategoryId === cat.id && styles.filterChipActive,
              ]}
              onPress={() => handleCategoryCard(cat.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategoryId === cat.id && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tips list */}
        {showingAllCategories ? (
          // Show tips grouped by category
          TIP_CATEGORIES.map((cat) => {
            const catTips = getTipsByCategory(cat.id);
            return (
              <View key={cat.id} style={{ gap: 8 }}>
                <Text style={styles.sectionLabel}>{cat.label}</Text>
                {catTips.map((tip) => (
                  <Pressable
                    key={tip.id}
                    style={styles.tipCard}
                    onPress={() => handleTipPress(tip.id)}
                  >
                    <View
                      style={[
                        styles.tipIconWrap,
                        { backgroundColor: cat.bgColor },
                      ]}
                    >
                      <Ionicons name={cat.icon} size={20} color={cat.accentColor} />
                    </View>
                    <View style={styles.tipContent}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipSummary} numberOfLines={2}>
                        {tip.summary}
                      </Text>
                      <Text style={[styles.tipStepCount, { color: cat.accentColor }]}>
                        {tip.steps.length} pasos
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#8A9490" />
                  </Pressable>
                ))}
              </View>
            );
          })
        ) : (
          // Show tips for selected category
          <View style={{ gap: 8 }}>
            {activeCategoryMeta && (
              <Text style={styles.sectionLabel}>{activeCategoryMeta.label}</Text>
            )}
            {visibleTips.map((tip) => (
              <Pressable
                key={tip.id}
                style={styles.tipCard}
                onPress={() => handleTipPress(tip.id)}
              >
                {activeCategoryMeta && (
                  <View
                    style={[
                      styles.tipIconWrap,
                      { backgroundColor: activeCategoryMeta.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={activeCategoryMeta.icon}
                      size={20}
                      color={activeCategoryMeta.accentColor}
                    />
                  </View>
                )}
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipSummary} numberOfLines={2}>
                    {tip.summary}
                  </Text>
                  <Text
                    style={[
                      styles.tipStepCount,
                      { color: activeCategoryMeta?.accentColor ?? "#14342B" },
                    ]}
                  >
                    {tip.steps.length} pasos
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#8A9490" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
