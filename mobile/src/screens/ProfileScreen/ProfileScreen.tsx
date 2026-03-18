import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ProfileScreen.styles";

type ProfileForm = {
  name: string;
  email: string;
  city: string;
  bio: string;
};

const initialProfile: ProfileForm = {
  name: "Priscila Torres",
  email: "priscila@survix.app",
  city: "Buenos Aires, Argentina",
  bio: "Aprendiendo supervivencia urbana, huerta y primeros auxilios con la comunidad.",
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const completion = useMemo(() => {
    const values = Object.values(profile);
    const filled = values.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setProfile(draft);
    } else {
      setDraft(profile);
    }

    setIsEditing((current) => !current);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const visibleProfile = isEditing ? draft : profile;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color="#FFFFFF" />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{profile.name}</Text>
            <Text style={styles.heroSubtitle}>Perfil editable de la comunidad</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{completion}% completo</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tus datos</Text>
              <Text style={styles.sectionDescription}>
                Actualiza tu informacion para que otros sepan en que temas podes aportar.
              </Text>
            </View>

            <Pressable style={styles.editButton} onPress={handleToggleEdit}>
              <Text style={styles.editButtonText}>
                {isEditing ? "Guardar" : "Editar"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre y apellido</Text>
            <TextInput
              value={visibleProfile.name}
              onChangeText={(value) => handleChange("name", value)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="Tu nombre"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              value={visibleProfile.email}
              onChangeText={(value) => handleChange("email", value)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#8A9490"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              value={visibleProfile.city}
              onChangeText={(value) => handleChange("city", value)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="Tu ciudad"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Biografia</Text>
            <TextInput
              value={visibleProfile.bio}
              onChangeText={(value) => handleChange("bio", value)}
              editable={isEditing}
              style={[styles.textArea, !isEditing && styles.inputReadonly]}
              placeholder="Conta que sabes y que te interesa aprender"
              placeholderTextColor="#8A9490"
              multiline
              textAlignVertical="top"
            />
          </View>

          {isEditing ? (
            <Pressable style={styles.secondaryButton} onPress={handleCancel}>
              <Text style={styles.secondaryButtonText}>Cancelar cambios</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>aportes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>guias guardadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>consultas abiertas</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
