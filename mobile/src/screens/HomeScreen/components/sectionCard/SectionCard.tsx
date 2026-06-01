import { useRouter } from "expo-router";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { styles } from "./SectionCard.styles";

type Props = {
  item: HomeItem;
  type: "activity" | "guide" | "equipment";
  onPress?: () => void;
};

const H_PADDING = 14;
const CARD_GAP = 14;

export function SectionCard({ item, type, onPress: onPressProp }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const cardWidth =
    width >= 700
      ? Math.floor((width - H_PADDING * 2 - CARD_GAP * 3) / 4)
      : 240;

  const handlePress = () => {
    if (onPressProp) {
      onPressProp();
      return;
    }
    router.push({
      pathname: "/detail",
      params: {
        id: item.id,
        type,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        image: item.image,
        purchaseLinks: item.purchaseLinks
          ? JSON.stringify(item.purchaseLinks)
          : undefined,
      },
    });
  };

  const typeLabel =
    type === "activity" ? "Actividad"
    : type === "guide" ? "Guía"
    : "Equipamiento";

  return (
    <Pressable style={[styles.card, { width: cardWidth }]} onPress={handlePress}>
      <View>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeLabel}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
