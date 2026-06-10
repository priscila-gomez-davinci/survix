import TabsLayout from "@/src/layouts/TabsLayout/TabsLayout";
import PlansScreen from "@/src/screens/PlansScreen/PlansScreen";

export default function PlansRoute() {
  return (
    <TabsLayout>
      <PlansScreen />
    </TabsLayout>
  );
}
