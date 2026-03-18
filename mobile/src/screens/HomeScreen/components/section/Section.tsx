import { Pressable, ScrollView, Text, View } from "react-native";
import type { HomeItem } from "@/src/data/homeData";
import { sectionStyles } from "./Section.styles";
import { SectionCard } from "../sectionCard/SectionCard";

type SectionProps = {
  title: string;
  items: HomeItem[];
  type: "activity" | "guide" | "equipment";
};

export function Section({ title, items, type }: SectionProps) {
  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>{title}</Text>
        <Pressable>
          <Text style={sectionStyles.seeMore}>Ver más</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sectionStyles.horizontalList}
      >
        {items.map((item) => (
          <SectionCard key={item.id} item={item} type={type} />
        ))}
      </ScrollView>
    </View>
  );
}
