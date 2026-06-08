import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "./ProfileScreen.styles";
import { useAuth } from "@/src/context/AuthContext";
import { profilesApi, uploadImage, type Profile } from "@/src/services/api";

type ProfileForm = {
  name: string;
  surname: string;
  email: string;
  location: string;
  bio: string;
  photo_url: string;
};

function profileToForm(profile: Profile | null, email: string): ProfileForm {
  return {
    name: profile?.nombre ?? "",
    surname: profile?.apellido ?? "",
    email,
    location: profile?.ubicacion ?? "",
    bio: profile?.bio ?? "",
    photo_url: profile?.foto_url ?? "",
  };
}

export default function ProfileScreen() {
  const { user, isAdmin, setProfilePhoto } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>(profileToForm(null, user?.email ?? ""));
  const [draft, setDraft] = useState<ProfileForm>(profileToForm(null, user?.email ?? ""));
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickPhoto = () => {
    if (Platform.OS !== "web") return;
    if (!fileInputRef.current) {
      const el = document.createElement("input");
      el.type = "file";
      el.accept = "image/jpeg,image/png,image/webp";
      el.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
          const url = await uploadImage(file);
          setDraft((d) => ({ ...d, photo_url: url }));
        } catch {
          Alert.alert("Error", "No se pudo subir la foto. Intentá de nuevo.");
        } finally {
          setUploadingPhoto(false);
        }
      };
      fileInputRef.current = el;
    }
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

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
        setProfilePhoto(p.foto_url ?? null);
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
    const values = [form.name, form.surname, form.email, form.location, form.bio, form.photo_url];
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
          nombre: draft.name,
          apellido: draft.surname,
          bio: draft.bio,
          ubicacion: draft.location,
          foto_url: draft.photo_url || undefined,
          fecha_nacimiento: profile?.fecha_nacimiento,
        });
        setProfile(updated);
        const f = profileToForm(updated, user.email);
        setForm(f);
        setDraft(f);
        setProfilePhoto(updated.foto_url ?? null);
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
          <Pressable
            style={styles.avatar}
            onPress={isEditing ? handlePickPhoto : undefined}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (visibleForm.photo_url || form.photo_url) ? (
              <>
                <Image
                  source={{ uri: isEditing ? draft.photo_url || form.photo_url : form.photo_url }}
                  style={styles.avatarImage}
                />
                {isEditing && (
                  <View style={styles.avatarEditOverlay}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                )}
              </>
            ) : (
              <>
                <Ionicons name="person" size={34} color="#FFFFFF" />
                {isEditing && (
                  <View style={styles.avatarEditOverlay}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                )}
              </>
            )}
          </Pressable>

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

          {isEditing && Platform.OS === "web" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Foto de perfil</Text>
              <Pressable
                style={styles.photoPickerButton}
                onPress={handlePickPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#14342B" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#14342B" />
                    <Text style={styles.photoPickerButtonText}>
                      {draft.photo_url ? "Cambiar foto" : "Subir foto desde el ordenador"}
                    </Text>
                  </>
                )}
              </Pressable>
              {draft.photo_url ? (
                <Text style={styles.photoPickerHint} numberOfLines={1}>{draft.photo_url}</Text>
              ) : null}
            </View>
          )}

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

        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 22, overflow: "hidden" }}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
            onPress={() => router.push("/plans")}
          >
            <Ionicons name="star-outline" size={20} color="#14342B" />
            <Text style={{ color: "#173B32", fontSize: 14, fontWeight: "600", flex: 1 }}>
              Planes y precios
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8A9490" />
          </Pressable>
          {Platform.OS !== "web" && (
            <>
              <View style={{ height: 1, backgroundColor: "#EEF2F0", marginHorizontal: 16 }} />
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
                onPress={() => router.push("/offline")}
              >
                <Ionicons name="cloud-offline-outline" size={20} color="#14342B" />
                <Text style={{ color: "#173B32", fontSize: 14, fontWeight: "600", flex: 1 }}>
                  Contenido descargado
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#8A9490" />
              </Pressable>
            </>
          )}
          <View style={{ height: 1, backgroundColor: "#EEF2F0", marginHorizontal: 16 }} />
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
            onPress={() => router.push("/about")}
          >
            <Ionicons name="information-circle-outline" size={20} color="#14342B" />
            <Text style={{ color: "#173B32", fontSize: 14, fontWeight: "600", flex: 1 }}>
              Quiénes somos
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8A9490" />
          </Pressable>
          <View style={{ height: 1, backgroundColor: "#EEF2F0", marginHorizontal: 16 }} />
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
            onPress={() => router.push("/contact")}
          >
            <Ionicons name="mail-outline" size={20} color="#14342B" />
            <Text style={{ color: "#173B32", fontSize: 14, fontWeight: "600", flex: 1 }}>
              Contacto
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8A9490" />
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
