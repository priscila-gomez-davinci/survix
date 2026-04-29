import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usersApi, profilesApi, ApiError, type User, type Profile } from "@/src/services/api";
import { styles, C } from "../AdminScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserWithProfile = { user: User; profile: Profile };
type EditMode = "none" | "user" | "profile";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("es-AR"); }
  catch { return dateStr; }
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") return (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text style={[styles.badgeText, styles.badgeGreenText]}>Admin</Text>
    </View>
  );
  return (
    <View style={[styles.badge, styles.badgeBlue]}>
      <Text style={[styles.badgeText, styles.badgeBlueText]}>Usuario</Text>
    </View>
  );
}

// ─── UserModal (edit email or profile) ────────────────────────────────────────

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}) {
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) { setError("El email no puede estar vacío."); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await usersApi.update(user.id_usuario, { email: email.trim() });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>Editar cuenta · ID {user.id_usuario}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.formInput}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={C.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {error ? <Text style={styles.generalError}>{error}</Text> : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnSave, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnSaveText}>Guardar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function EditProfileModal({
  userId,
  profile,
  onClose,
  onSaved,
}: {
  userId: number;
  profile: Profile;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [surname, setSurname] = useState(profile.surname ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [birthdate, setBirthdate] = useState(profile.birthdate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await profilesApi.update(userId, {
        name: name.trim() || null,
        surname: surname.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        birthdate: birthdate.trim() || null,
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>Editar perfil · ID {userId}</Text>

        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.formInput}
              placeholder="Nombre"
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Apellido</Text>
            <TextInput
              value={surname}
              onChangeText={setSurname}
              style={styles.formInput}
              placeholder="Apellido"
              placeholderTextColor={C.muted}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Ubicación</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            style={styles.formInput}
            placeholder="Ciudad, País"
            placeholderTextColor={C.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Fecha de nacimiento</Text>
          <TextInput
            value={birthdate}
            onChangeText={setBirthdate}
            style={styles.formInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={C.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={styles.formTextarea}
            placeholder="Descripción del usuario"
            placeholderTextColor={C.muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {error ? <Text style={styles.generalError}>{error}</Text> : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnSave, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnSaveText}>Guardar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────────────

export function UsersTab() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UserWithProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("none");

  const handleSearch = async () => {
    const id = Number(searchId.trim());
    if (!searchId.trim() || isNaN(id) || id <= 0) {
      setSearchError("Ingresá un ID de usuario válido (número entero positivo).");
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
          ? `No se encontró un usuario con ID ${id}.`
          : "Error al buscar el usuario. Verificá el ID e intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Modals */}
      {editMode === "user" && result && (
        <EditUserModal
          user={result.user}
          onClose={() => setEditMode("none")}
          onSaved={(updated) => {
            setResult((prev) => prev ? { ...prev, user: updated } : null);
            setEditMode("none");
          }}
        />
      )}
      {editMode === "profile" && result && (
        <EditProfileModal
          userId={result.user.id_usuario}
          profile={result.profile}
          onClose={() => setEditMode("none")}
          onSaved={(updated) => {
            setResult((prev) => prev ? { ...prev, profile: updated } : null);
            setEditMode("none");
          }}
        />
      )}

      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Usuarios</Text>
          <Text style={styles.pageSubtitle}>
            Buscá usuarios por ID para ver o editar su información
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <TextInput
          value={searchId}
          onChangeText={(v) => { setSearchId(v); setSearchError(null); }}
          placeholder="ID de usuario (ej: 42)"
          placeholderTextColor={C.muted}
          style={[
            styles.searchSectionInput,
            searchError ? { borderColor: C.red } : null,
          ]}
          keyboardType="numeric"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable
          style={[styles.searchSectionBtn, loading && { opacity: 0.7 }]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="search-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.searchSectionBtnText}>Buscar</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Error */}
      {searchError ? (
        <View
          style={{
            backgroundColor: C.redLight,
            borderWidth: 1,
            borderColor: C.redBorder,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="alert-circle-outline" size={16} color={C.red} />
          <Text style={{ color: C.red, fontSize: 13 }}>{searchError}</Text>
        </View>
      ) : null}

      {/* Result */}
      {result ? (
        <View style={styles.infoCard}>
          {/* Header with avatar */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 }}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: C.greenMid, width: 48, height: 48, borderRadius: 24 },
              ]}
            >
              <Text style={[styles.avatarText, { fontSize: 18 }]}>
                {result.user.email[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cellName}>
                {[result.profile.name, result.profile.surname].filter(Boolean).join(" ") || result.user.email}
              </Text>
              <Text style={styles.cellSub}>{result.user.email}</Text>
            </View>
            <RoleBadge role={result.user.role} />
          </View>

          <View style={styles.infoSeparator} />

          {/* Account section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionLabel}>Cuenta</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>ID</Text>
              <Text style={styles.infoValue}>{result.user.id_usuario}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Email</Text>
              <Text style={styles.infoValue}>{result.user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Rol</Text>
              <RoleBadge role={result.user.role} />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Registrado</Text>
              <Text style={styles.infoValue}>{formatDate(result.user.fecha_creacion)}</Text>
            </View>

            <Pressable
              style={[
                styles.btnGhost,
                { alignSelf: "flex-start", marginTop: 4, height: 32, paddingHorizontal: 12 },
              ]}
              onPress={() => setEditMode("user")}
            >
              <Ionicons name="pencil-outline" size={13} color={C.textSub} style={{ marginRight: 4 }} />
              <Text style={[styles.btnGhostText, { fontSize: 12 }]}>Editar email</Text>
            </Pressable>
          </View>

          <View style={styles.infoSeparator} />

          {/* Profile section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionLabel}>Perfil</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Nombre</Text>
              <Text style={styles.infoValue}>
                {[result.profile.name, result.profile.surname].filter(Boolean).join(" ") || "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Ubicación</Text>
              <Text style={styles.infoValue}>{result.profile.location || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Nacimiento</Text>
              <Text style={styles.infoValue}>{formatDate(result.profile.birthdate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Bio</Text>
              <Text style={styles.infoValue}>{result.profile.bio || "—"}</Text>
            </View>

            <Pressable
              style={[
                styles.btnGhost,
                { alignSelf: "flex-start", marginTop: 4, height: 32, paddingHorizontal: 12 },
              ]}
              onPress={() => setEditMode("profile")}
            >
              <Ionicons name="pencil-outline" size={13} color={C.textSub} style={{ marginRight: 4 }} />
              <Text style={[styles.btnGhostText, { fontSize: 12 }]}>Editar perfil</Text>
            </Pressable>
          </View>
        </View>
      ) : !loading && !searchError ? (
        <View style={[styles.emptyWrap, { paddingTop: 60 }]}>
          <Ionicons name="person-circle-outline" size={48} color={C.border} />
          <Text style={styles.emptyText}>Buscá un usuario por su ID</Text>
        </View>
      ) : null}
    </View>
  );
}
