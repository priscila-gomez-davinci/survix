import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { PurchaseLink } from "@/src/data/homeData";
import { styles } from "./DetailScreen.styles";

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    purchaseLinks?: string;
  }>();

  const purchaseLinks: PurchaseLink[] = params.purchaseLinks
    ? JSON.parse(params.purchaseLinks)
    : [];

  const handlePurchaseLinkPress = (link: PurchaseLink) => {
    Alert.alert(
      "Estas saliendo de Survix",
      `Vas a abrir ${link.label} en tu navegador.`,
      [
        {
          text: "Mejor no",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            void Linking.openURL(link.url);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: params.image }} style={styles.image} />

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.type}>
            {params.type === "activity"
              ? "Actividad"
              : params.type === "guide"
                ? "Guia"
                : "Equipamiento"}
          </Text>

          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.subtitle}>{params.subtitle}</Text>

          <Text style={styles.sectionTitle}>Descripcion</Text>
          <Text style={styles.description}>{params.description}</Text>

          {params.type === "equipment" && purchaseLinks.length > 0 ? (
            <View style={styles.linksSection}>
              <Text style={styles.sectionTitle}>Donde comprar</Text>
              <Text style={styles.description}>
                Elegi una tienda para ver opciones de compra disponibles.
              </Text>

              <View style={styles.linksList}>
                {purchaseLinks.map((link) => (
                  <Pressable
                    key={`${params.id}-${link.label}`}
                    style={styles.linkCard}
                    onPress={() => handlePurchaseLinkPress(link)}
                  >
                    <View style={styles.linkCopy}>
                      <Text style={styles.linkLabel}>{link.label}</Text>
                      <Text style={styles.linkUrl} numberOfLines={1}>
                        {link.url}
                      </Text>
                    </View>

                    <Ionicons
                      name="open-outline"
                      size={18}
                      color="#103D34"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Mas informacion</Text>
              <Text style={styles.description}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                aliquam, tortor eget dignissim congue, eros nibh varius nunc,
                sed tincidunt orci purus sed ipsum. Nulla facilisi.
                Pellentesque pharetra eros et lorem feugiat, a luctus enim
                efficitur.
              </Text>

              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Accion pendiente</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
