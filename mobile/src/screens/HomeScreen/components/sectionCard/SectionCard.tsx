import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { styles } from "./SectionCard.styles";

type Props = {
  item: HomeItem;
  type: "activity" | "guide" | "equipment";
};

export function SectionCard({ item, type }: Props) {
  const router = useRouter();

  const handlePress = () => {
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

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        ) : null}
        <Text style={styles.type}>{type}</Text>
      </View>
    </Pressable>
  );
}
