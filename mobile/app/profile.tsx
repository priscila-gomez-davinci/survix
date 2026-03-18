import TabsLayout from "@/src/layouts/TabsLayout/TabsLayout";
import ProfileScreen from "@/src/screens/ProfileScreen/ProfileScreen";

export default function ProfileRoute() {
  return (
    <TabsLayout>
      <ProfileScreen />
    </TabsLayout>
  );
}
