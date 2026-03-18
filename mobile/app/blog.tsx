import TabsLayout from "@/src/layouts/TabsLayout/TabsLayout";
import BlogScreen from "@/src/screens/BlogScreen/BlogScreen";

export default function BlogRoute() {
  return (
    <TabsLayout>
      <BlogScreen />
    </TabsLayout>
  );
}
