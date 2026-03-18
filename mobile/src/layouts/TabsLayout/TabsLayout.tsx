import type { ReactNode } from "react";
import { View } from "react-native";
import { styles } from "./TabsLayout.style";
import { AppHeader } from "../components/AppHeader/AppHeader";
import { AppFooter } from "../components/AppFooter/AppFooter";

type TabsLayoutProps = {
  children: ReactNode;
};

export default function TabsLayout({ children }: TabsLayoutProps) {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>{children}</View>
      <AppFooter />
    </View>
  );
}
