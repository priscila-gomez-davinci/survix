import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ProfileScreen.styles";
import { useAuth } from "@/src/context/AuthContext";
import { profilesApi, type Profile } from "@/src/services/api";

type ProfileForm = {
  name: string;
  surname: string;
  email: string;
  location: string;
  bio: string;
};

function profileToForm(profile: Profile | null, email: string): ProfileForm {
  return {
    name: profile?.name ?? "",
    surname: profile?.surname ?? "",
    email,
    location: profile?.location ?? "",
    bio: profile?.bio ?? "",
  };
}

export default function ProfileScreen() {
  const { user, isAdmin } = useAuth();

  const [, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>(profileToForm(null, user?.email ?? ""));
  const [draft, setDraft] = useState<ProfileForm>(profileToForm(null, user?.email ?? ""));
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsFetching(true);
    profilesApi
      .getById(user.id_usuario)
      .then((p) => {
        setProfile(p);
        const f = profileToForm(p, user.email);
        setForm(f);
        setDraft(f);
      })
      .catch(() => {
        // Profile might not exist yet — start with empty form
        const f = profileToForm(null, user.email);
        setForm(f);
        setDraft(f);
      })
      .finally(() => setIsFetching(false));
  }, [user]);

  const completion = useMemo(() => {
    const values = [form.name, form.surname, form.email, form.location, form.bio];
    const filled = values.filter((v) => v.trim().length > 0).length;
    return Math.round((filled / values.length) * 100);
  }, [form]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      if (!user) return;
      setIsSaving(true);
      try {
        const updated = await profilesApi.update(user.id_usuario, {
          name: draft.name || null,
          surname: draft.surname || null,
          bio: draft.bio || null,
          location: draft.location || null,
        });
        setProfile(updated);
        const f = profileToForm(updated, user.email);
        setForm(f);
        setDraft(f);
        setIsEditing(false);
      } catch {
        Alert.alert("Error", "No se pudo guardar el perfil. Intentá de nuevo.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setDraft(form);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setDraft(form);
    setIsEditing(false);
  };

  const visibleForm = isEditing ? draft : form;
  const displayName = [form.name, form.surname].filter(Boolean).join(" ") || (user?.email ?? "");

  if (isFetching) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#14342B" />
      </SafeAreaView>
    );
  }

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
            <Text style={styles.heroTitle}>{displayName}</Text>
            <Text style={styles.heroSubtitle}>
              {isAdmin ? "Administrador" : "Perfil de la comunidad"}
            </Text>
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

            <Pressable
              style={[styles.editButton, isSaving && { opacity: 0.6 }]}
              onPress={handleToggleEdit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#14342B" />
              ) : (
                <Text style={styles.editButtonText}>
                  {isEditing ? "Guardar" : "Editar"}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={visibleForm.name}
              onChangeText={(v) => handleChange("name", v)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="Tu nombre"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              value={visibleForm.surname}
              onChangeText={(v) => handleChange("surname", v)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="Tu apellido"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              value={visibleForm.email}
              editable={false}
              style={[styles.input, styles.inputReadonly]}
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              value={visibleForm.location}
              onChangeText={(v) => handleChange("location", v)}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputReadonly]}
              placeholder="Tu ciudad"
              placeholderTextColor="#8A9490"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Biografia</Text>
            <TextInput
              value={visibleForm.bio}
              onChangeText={(v) => handleChange("bio", v)}
              editable={isEditing}
              style={[styles.textArea, !isEditing && styles.inputReadonly]}
              placeholder="Conta que sabes y que te interesa aprender"
              placeholderTextColor="#8A9490"
              multiline
              textAlignVertical="top"
            />
          </View>

          {isEditing && (
            <Pressable style={styles.secondaryButton} onPress={handleCancel}>
              <Text style={styles.secondaryButtonText}>Cancelar cambios</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>aportes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>guias guardadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>consultas abiertas</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
