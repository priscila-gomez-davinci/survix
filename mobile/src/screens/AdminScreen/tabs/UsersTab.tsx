import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usersApi, profilesApi, ApiError, type User, type Profile } from "@/src/services/api";
import { useAuth } from "@/src/context/AuthContext";
import { styles, C } from "../AdminScreen.styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#1d3828", "#2563eb", "#7c3aed", "#d97706",
  "#dc2626", "#059669", "#0891b2", "#db2777",
];
function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

function formatDate(dateStr: string) {
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
    <View style={[styles.badge, styles.badgeGray]}>
      <Text style={[styles.badgeText, styles.badgeGrayText]}>Usuario</Text>
    </View>
  );
}

// ─── Edit email modal ─────────────────────────────────────────────────────────

function EditEmailModal({
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
        <Text style={styles.modalTitle}>Editar email · ID {user.id_usuario}</Text>

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

// ─── Edit profile modal ────────────────────────────────────────────────────────

function EditProfileModal({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profilesApi.getById(userId)
      .then((p) => {
        setProfile(p);
        setName(p.name ?? "");
        setSurname(p.surname ?? "");
        setBio(p.bio ?? "");
        setLocation(p.location ?? "");
        setBirthdate(p.birthdate ?? "");
      })
      .catch(() => setError("No se encontró el perfil de este usuario."))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await profilesApi.update(userId, {
        name: name.trim() || null,
        surname: surname.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        birthdate: birthdate.trim() || null,
      });
      onClose();
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

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <ActivityIndicator color={C.greenDark} />
          </View>
        ) : (
          <>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre</Text>
                <TextInput value={name} onChangeText={setName} style={styles.formInput} placeholder="Nombre" placeholderTextColor={C.muted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Apellido</Text>
                <TextInput value={surname} onChangeText={setSurname} style={styles.formInput} placeholder="Apellido" placeholderTextColor={C.muted} />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ubicación</Text>
              <TextInput value={location} onChangeText={setLocation} style={styles.formInput} placeholder="Ciudad, País" placeholderTextColor={C.muted} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha de nacimiento</Text>
              <TextInput value={birthdate} onChangeText={setBirthdate} style={styles.formInput} placeholder="YYYY-MM-DD" placeholderTextColor={C.muted} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput value={bio} onChangeText={setBio} style={styles.formTextarea} placeholder="Descripción" placeholderTextColor={C.muted} multiline textAlignVertical="top" />
            </View>
          </>
        )}

        {error ? <Text style={styles.generalError}>{error}</Text> : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          {!loading && !error && (
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
          )}
        </View>
      </View>
    </View>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────────────

type Modal =
  | { type: "email"; user: User }
  | { type: "profile"; userId: number }
  | null;

type RoleFilter = "all" | "admin" | "user";

const FILTER_TABS: { key: RoleFilter; label: string }[] = [
  { key: "all",   label: "Todos" },
  { key: "admin", label: "Admin" },
  { key: "user",  label: "Usuario" },
];

export function UsersTab() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [modal, setModal] = useState<Modal>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
      setFetchError(null);
    } catch (e) {
      setFetchError(
        e instanceof ApiError && e.status === 403
          ? "Acceso denegado. Se requieren privilegios de administrador."
          : "No se pudieron cargar los usuarios."
      );
    }
  }, []);

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, [fetchUsers]);

  const filtered = users
    .filter((u) => {
      if (roleFilter === "admin") return u.role === "admin";
      if (roleFilter === "user")  return u.role !== "admin";
      return true;
    })
    .filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      String(u.id_usuario).includes(search)
    );

  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleDelete = async (user: User) => {
    const ok = (globalThis as unknown as { confirm: (s: string) => boolean }).confirm(
      `¿Eliminar al usuario "${user.email}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setDeletingId(user.id_usuario);
    try {
      await usersApi.delete(user.id_usuario);
      setUsers((prev) => prev.filter((u) => u.id_usuario !== user.id_usuario));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "No se pudo eliminar el usuario.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEmailSaved = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id_usuario === updated.id_usuario ? { ...u, email: updated.email } : u))
    );
    setModal(null);
  };

  return (
    <View>
      {/* Modals */}
      {modal?.type === "email" && (
        <EditEmailModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleEmailSaved}
        />
      )}
      {modal?.type === "profile" && (
        <EditProfileModal
          userId={modal.userId}
          onClose={() => setModal(null)}
        />
      )}

      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Usuarios</Text>
          <Text style={styles.pageSubtitle}>Gestión de cuentas registradas en SurvivApp</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total usuarios</Text>
          <Text style={styles.statValue}>{loading ? "—" : users.length}</Text>
          <Text style={styles.statDelta}>Cuentas registradas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Administradores</Text>
          <Text style={styles.statValue}>{loading ? "—" : adminCount}</Text>
          <Text style={styles.statDelta}>Con acceso al panel</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Usuarios regulares</Text>
          <Text style={styles.statValue}>{loading ? "—" : users.length - adminCount}</Text>
          <Text style={styles.statDelta}>Sin privilegios de admin</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.filterTab, roleFilter === tab.key && styles.filterTabActive]}
            onPress={() => setRoleFilter(tab.key)}
          >
            <Text style={[styles.filterTabText, roleFilter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={15} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por email o ID..."
            placeholderTextColor={C.muted}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => fetchUsers()}>
          <Ionicons name="refresh-outline" size={14} color={C.textSub} />
          <Text style={styles.filterBtnText}>Actualizar</Text>
        </Pressable>
        <Text style={styles.toolbarCount}>
          {filtered.length} de {users.length} usuarios
        </Text>
      </View>

      {/* Table */}
      <View style={styles.tableWrap}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { width: 50 }]}>ID</Text>
          <Text style={[styles.thText, { flex: 1 }]}>Email</Text>
          <Text style={[styles.thText, { width: 90 }]}>Rol</Text>
          <Text style={[styles.thText, { width: 110 }]}>Registrado</Text>
          <Text style={[styles.thText, { width: 100, textAlign: "right" }]}>Acciones</Text>
        </View>

        {/* Rows */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={C.greenDark} />
          </View>
        ) : fetchError ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="alert-circle-outline" size={28} color={C.red} />
            <Text style={[styles.emptyText, { color: C.red }]}>{fetchError}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={32} color={C.border} />
            <Text style={styles.emptyText}>
              {search ? "Sin resultados para la búsqueda" : "No hay usuarios registrados"}
            </Text>
          </View>
        ) : (
          filtered.map((user, i) => {
            const isMe = user.id_usuario === me?.id_usuario;
            return (
              <View
                key={user.id_usuario}
                style={[
                  styles.tableRow,
                  i === filtered.length - 1 && styles.tableRowLast,
                ]}
              >
                <Text style={[styles.tdMuted, { width: 50 }]}>{user.id_usuario}</Text>

                <View style={[styles.userCell, { flex: 1 }]}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: avatarColor(user.id_usuario),
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                      },
                    ]}
                  >
                    <Text style={[styles.avatarText, { fontSize: 12 }]}>
                      {user.email.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.tdBold} numberOfLines={1}>
                      {user.email}
                      {isMe ? (
                        <Text style={[styles.tdMuted, { fontSize: 11 }]}> (vos)</Text>
                      ) : null}
                    </Text>
                  </View>
                </View>

                <View style={{ width: 90 }}>
                  <RoleBadge role={user.role} />
                </View>

                <Text style={[styles.tdMuted, { width: 110 }]}>
                  {formatDate(user.fecha_creacion)}
                </Text>

                <View style={[styles.rowActions, { width: 100, justifyContent: "flex-end" }]}>
                  <Pressable
                    style={styles.btnIcon}
                    onPress={() => setModal({ type: "email", user })}
                  >
                    <Ionicons name="mail-outline" size={14} color={C.textSub} />
                  </Pressable>
                  <Pressable
                    style={styles.btnIcon}
                    onPress={() => setModal({ type: "profile", userId: user.id_usuario })}
                  >
                    <Ionicons name="person-outline" size={14} color={C.textSub} />
                  </Pressable>
                  <Pressable
                    style={[styles.btnIcon, styles.btnIconRed, isMe && { opacity: 0.3 }]}
                    onPress={() => handleDelete(user)}
                    disabled={isMe || deletingId === user.id_usuario}
                  >
                    {deletingId === user.id_usuario ? (
                      <ActivityIndicator size="small" color={C.red} />
                    ) : (
                      <Ionicons name="trash-outline" size={14} color={C.red} />
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
