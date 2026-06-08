import { ScrollView, SafeAreaView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "./AboutScreen.styles";

type TeamMember = {
  name: string;
  role: string;
  initials: string;
};

const TEAM: TeamMember[] = [
  { name: "Equipo Survix", role: "Desarrollo", initials: "SX" },
  { name: "Comunidad", role: "Contenido", initials: "CM" },
];

type Value = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const VALUES: Value[] = [
  {
    icon: "shield-checkmark-outline",
    title: "Información confiable",
    description:
      "Cada ruta y guía es revisada por la comunidad y validada por expertos en actividades al aire libre.",
  },
  {
    icon: "people-outline",
    title: "Comunidad activa",
    description:
      "Más de mil exploradores comparten experiencias, tips y rutas para que nadie salga sin preparación.",
  },
  {
    icon: "leaf-outline",
    title: "Respeto por la naturaleza",
    description:
      "Promovemos prácticas sustentables y el cuidado del entorno en cada aventura.",
  },
  {
    icon: "location-outline",
    title: "Cobertura local",
    description:
      "Rutas y guías pensadas para Argentina, con información actualizada sobre cada región.",
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Quiénes somos</Text>
          <Text style={styles.heroSubtitle}>
            SurvixApp nació de la pasión por el aire libre y la necesidad de
            contar con información confiable antes de cada aventura. Somos una
            comunidad de exploradores que cree en compartir el conocimiento.
          </Text>
        </View>

        {/* Misión */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nuestra misión</Text>
          <Text style={styles.sectionText}>
            Brindar a cada persona las herramientas, rutas y guías de
            supervivencia necesarias para disfrutar de la naturaleza de forma
            segura, informada y responsable. Queremos que nadie se quede sin
            explorar por falta de información.
          </Text>
        </View>

        {/* Valores */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nuestros valores</Text>
          {VALUES.map((v, i) => (
            <View key={v.title}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.valueRow}>
                <View style={styles.valueIconWrap}>
                  <Ionicons name={v.icon} size={18} color="#18B678" />
                </View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>{v.title}</Text>
                  <Text style={styles.valueDesc}>{v.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Equipo */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>El equipo</Text>
          <Text style={styles.sectionText}>
            Somos un equipo multidisciplinario de desarrolladores, diseñadores y
            amantes del outdoor comprometidos con construir la mejor plataforma
            de aventura del país.
          </Text>
          <View style={styles.teamRow}>
            {TEAM.map((member) => (
              <View key={member.name} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text
                    style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}
                  >
                    {member.initials}
                  </Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contacto banner */}
        <View style={styles.contactBanner}>
          <Ionicons name="mail-outline" size={22} color="#4ade80" />
          <Text style={styles.contactBannerText}>
            ¿Tenés alguna pregunta o sugerencia?{" "}
            <Text
              style={styles.contactBannerLink}
              onPress={() => router.push("/contact")}
            >
              Contactanos
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
