import type { ReactNode } from "react";
import { Platform, View } from "react-native";
import { styles } from "./TabsLayout.style";
import { AppHeader } from "../components/AppHeader/AppHeader";
import { AppFooter } from "../components/AppFooter/AppFooter";
import { WebNavbar } from "../components/WebNavbar/WebNavbar";
import { WebFooter } from "../components/WebFooter/WebFooter";

type TabsLayoutProps = {
  children: ReactNode;
};

export default function TabsLayout({ children }: TabsLayoutProps) {
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <WebNavbar />
        <View style={styles.content}>{children}</View>
        <WebFooter />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>{children}</View>
      <AppFooter />
    </View>
  );
}
