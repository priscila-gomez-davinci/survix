import { Platform, View } from "react-native";
import AdminScreen from "@/src/screens/AdminScreen/AdminScreen";
import { WebNavbar } from "@/src/layouts/components/WebNavbar/WebNavbar";
import { WebFooter } from "@/src/layouts/components/WebFooter/WebFooter";

export default function AdminRoute() {
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        <WebNavbar />
        <AdminScreen />
        <WebFooter />
      </View>
    );
  }
  return <AdminScreen />;
}
