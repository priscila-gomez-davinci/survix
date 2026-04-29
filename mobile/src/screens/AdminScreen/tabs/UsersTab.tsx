import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { usersApi, profilesApi, ApiError, type User, type Profile } from "@/src/services/api";
import { styles } from "../AdminScreen.styles";

type UserWithProfile = {
  user: User;
  profile: Profile;
};

type EditMode = "none" | "user" | "profile";

export function UsersTab() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UserWithProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [saving, setSaving] = useState(false);

  // User edit
  const [editEmail, setEditEmail] = useState("");

  // Profile edit
  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");

  const handleSearch = async () => {
    const id = Number(searchId.trim());
    if (!searchId.trim() || isNaN(id) || id <= 0) {
      setSearchError("Ingresá un ID de usuario válido.");
      return;
    }
    setSearchError(null);
    setResult(null);
    setEditMode("none");
    setLoading(true);
    try {
      const [user, profile] = await Promise.all([
        usersApi.getById(id),
        profilesApi.getById(id),
      ]);
      setResult({ user, profile });
    } catch (e) {
      setSearchError(
        e instanceof ApiError && e.status === 404
          ? "No se encontró un usuario con ese ID."
          : "Error al buscar el usuario. Verificá el ID e intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditUser = () => {
    if (!result) return;
    setEditEmail(result.user.email);
    setEditMode("user");
  };

  const startEditProfile = () => {
    if (!result) return;
    setEditName(result.profile.name ?? "");
    setEditSurname(result.profile.surname ?? "");
    setEditBio(result.profile.bio ?? "");
    setEditLocation(result.profile.location ?? "");
    setEditBirthdate(result.profile.birthdate ?? "");
    setEditMode("profile");
  };

  const handleSaveUser = async () => {
    if (!result) return;
    if (!editEmail.trim()) {
      Alert.alert("Error", "El email no puede estar vacío.");
      return;
    }
    setSaving(true);
    try {
      const updated = await usersApi.update(result.user.id_usuario, {
        email: editEmail.trim(),
      });
      setResult({ ...result, user: updated });
      setEditMode("none");
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof ApiError ? e.message : "No se pudo guardar. Intentá de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const updated = await profilesApi.update(result.user.id_usuario, {
        name: editName.trim() || null,
        surname: editSurname.trim() || null,
        bio: editBio.trim() || null,
        location: editLocation.trim() || null,
        birthdate: editBirthdate.trim() || null,
      });
      setResult({ ...result, profile: updated });
      setEditMode("none");
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof ApiError ? e.message : "No se pudo guardar. Intentá de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  const roleColor = result?.user.role === "admin" ? "#14342B" : "#10A95A";
  const roleBg = result?.user.role === "admin" ? "#E8EDEB" : "#E6F9F1";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-AR");
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView
      style={styles.tabContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Gestión de usuarios</Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBox}>
        <TextInput
          value={searchId}
          onChangeText={(v) => {
            setSearchId(v);
            setSearchError(null);
          }}
          placeholder="ID de usuario (ej: 42)"
          placeholderTextColor="#8A9490"
          style={[styles.searchInput, searchError ? styles.inputError : null]}
          keyboardType="numeric"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable
          style={[styles.searchBtn, loading && { opacity: 0.7 }]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchBtnText}>Buscar</Text>
          )}
        </Pressable>
      </View>

      {searchError ? (
        <Text style={[styles.generalError, { paddingHorizontal: 20, marginBottom: 16 }]}>
          {searchError}
        </Text>
      ) : null}

      {/* ── Result ── */}
      {result ? (
        <View style={styles.userCard}>
          {/* Cuenta */}
          <View style={styles.userCardSection}>
            <Text style={styles.userCardSectionTitle}>Cuenta</Text>

            <View style={styles.userDataRow}>
              <Text style={styles.userDataLabel}>ID</Text>
              <Text style={styles.userDataValue}>{result.user.id_usuario}</Text>
            </View>

            {editMode === "user" ? (
              <View style={{ gap: 10, marginTop: 4 }}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#8A9490"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSaveUser}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Guardar</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => setEditMode("none")}
                    disabled={saving}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Email</Text>
                  <Text style={styles.userDataValue}>{result.user.email}</Text>
                </View>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Rol</Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                      {result.user.role}
                    </Text>
                  </View>
                </View>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Creado</Text>
                  <Text style={styles.userDataValue}>
                    {formatDate(result.user.fecha_creacion)}
                  </Text>
                </View>
                <Pressable
                  style={[styles.editBtn, { alignSelf: "flex-start", marginTop: 4 }]}
                  onPress={startEditUser}
                >
                  <Text style={styles.editBtnText}>Editar email</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Perfil */}
          <View style={[styles.userCardSection, styles.sectionDivider]}>
            <Text style={styles.userCardSectionTitle}>Perfil</Text>

            {editMode === "profile" ? (
              <View style={{ gap: 10, marginTop: 4 }}>
                <View style={styles.formRow}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      style={styles.input}
                      placeholder="Nombre"
                      placeholderTextColor="#8A9490"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                      value={editSurname}
                      onChangeText={setEditSurname}
                      style={styles.input}
                      placeholder="Apellido"
                      placeholderTextColor="#8A9490"
                    />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Ubicación</Text>
                  <TextInput
                    value={editLocation}
                    onChangeText={setEditLocation}
                    style={styles.input}
                    placeholder="Ciudad, País"
                    placeholderTextColor="#8A9490"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    value={editBio}
                    onChangeText={setEditBio}
                    style={styles.textArea}
                    placeholder="Descripción del usuario"
                    placeholderTextColor="#8A9490"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Fecha de nacimiento</Text>
                  <TextInput
                    value={editBirthdate}
                    onChangeText={setEditBirthdate}
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8A9490"
                  />
                </View>
                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Guardar</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => setEditMode("none")}
                    disabled={saving}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Nombre</Text>
                  <Text style={styles.userDataValue}>
                    {[result.profile.name, result.profile.surname].filter(Boolean).join(" ") || "—"}
                  </Text>
                </View>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Ubicación</Text>
                  <Text style={styles.userDataValue}>{result.profile.location || "—"}</Text>
                </View>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Bio</Text>
                  <Text style={styles.userDataValue}>{result.profile.bio || "—"}</Text>
                </View>
                <View style={styles.userDataRow}>
                  <Text style={styles.userDataLabel}>Nacimiento</Text>
                  <Text style={styles.userDataValue}>
                    {formatDate(result.profile.birthdate)}
                  </Text>
                </View>
                <Pressable
                  style={[styles.editBtn, { alignSelf: "flex-start", marginTop: 4 }]}
                  onPress={startEditProfile}
                >
                  <Text style={styles.editBtnText}>Editar perfil</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
