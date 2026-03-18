import TabsLayout from "@/src/layouts/TabsLayout/TabsLayout";
import HomeScreen from "@/src/screens/HomeScreen/HomeScreen";

export default function HomeRoute() {
  return (
    <TabsLayout>
      <HomeScreen />
    </TabsLayout>
  );
}
