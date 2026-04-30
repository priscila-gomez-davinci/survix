import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usersApi, profilesApi, catalogApi, ApiError, type User, type Profile, type RoleItem } from "@/src/services/api";
import { useAuth } from "@/src/context/AuthContext";
import { styles, C } from "../AdminScreen.styles";
import { DeleteModal } from "../DeleteModal";
import { AppDialog } from "@/src/components/AppDialog";

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
  const [fotoUrl, setFotoUrl] = useState("");
  const [noProfile, setNoProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profilesApi.getById(userId)
      .then((p) => {
        setProfile(p);
        setName(p.nombre ?? "");
        setSurname(p.apellido ?? "");
        setBio(p.bio ?? "");
        setLocation(p.ubicacion ?? "");
        setBirthdate(p.fecha_nacimiento ?? "");
        setFotoUrl(p.foto_url ?? "");
      })
      .catch(() => setNoProfile(true))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await profilesApi.update(userId, {
        nombre: name.trim(),
        apellido: surname.trim(),
        bio: bio.trim(),
        ubicacion: location.trim(),
        fecha_nacimiento: birthdate.trim() || profile?.fecha_nacimiento,
        foto_url: fotoUrl.trim() || undefined,
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
            {noProfile && (
              <View style={{
                backgroundColor: "#fffbeb",
                borderWidth: 1,
                borderColor: "#fde68a",
                borderRadius: 8,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}>
                <Ionicons name="information-circle-outline" size={16} color="#d97706" />
                <Text style={{ color: "#92400e", fontSize: 12.5, flex: 1 }}>
                  Este usuario aún no tiene perfil. Completá los datos para crearlo.
                </Text>
              </View>
            )}
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
              <Text style={styles.formLabel}>URL de foto</Text>
              <TextInput value={fotoUrl} onChangeText={setFotoUrl} style={styles.formInput} placeholder="https://..." placeholderTextColor={C.muted} autoCapitalize="none" keyboardType="url" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput value={bio} onChangeText={setBio} style={styles.formTextarea} placeholder="Descripción" placeholderTextColor={C.muted} multiline textAlignVertical="top" />
            </View>
          </>
        )}

        {error ? (
          <View style={{
            backgroundColor: "#fef2f2",
            borderWidth: 1,
            borderColor: "#fecaca",
            borderRadius: 8,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}>
            <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
            <Text style={{ color: "#dc2626", fontSize: 12.5, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          {!loading && (
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

// ─── Change role modal ────────────────────────────────────────────────────────

function ChangeRoleModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}) {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(user.id_rol);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.roles()
      .then(setRoles)
      .catch(() => setRoles([{ id_rol: 1, nombre: "usuario" }, { id_rol: 2, nombre: "admin" }]))
      .finally(() => setLoadingRoles(false));
  }, []);

  const handleSave = async () => {
    if (selectedRoleId === user.id_rol) { onClose(); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await usersApi.updateRole(user.id_usuario, selectedRoleId);
      onSaved(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo actualizar el rol.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>Cambiar rol · ID {user.id_usuario}</Text>
        <Text style={[styles.formLabel, { marginBottom: 12 }]}>{user.email}</Text>

        {loadingRoles ? (
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <ActivityIndicator color={C.greenDark} />
          </View>
        ) : (
          <View style={{ gap: 8, marginBottom: 16 }}>
            {roles.map((role) => {
              const active = selectedRoleId === role.id_rol;
              return (
                <Pressable
                  key={role.id_rol}
                  onPress={() => setSelectedRoleId(role.id_rol)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: active ? C.greenDark : C.border,
                    backgroundColor: active ? "#f0fdf4" : "#fff",
                  }}
                >
                  <View style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: active ? C.greenDark : C.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {active && (
                      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.greenDark }} />
                    )}
                  </View>
                  <Text style={{ color: active ? C.greenDark : C.textSub, fontWeight: active ? "600" : "400", fontSize: 14, textTransform: "capitalize" }}>
                    {role.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {error ? (
          <View style={{ backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 8, padding: 10, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
            <Text style={{ color: "#dc2626", fontSize: 12.5, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.modalFooter}>
          <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
            <Text style={styles.btnGhostText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnSave, (saving || loadingRoles) && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || loadingRoles}
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

type Modal =
  | { type: "email"; user: User }
  | { type: "profile"; userId: number }
  | { type: "role"; user: User }
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
  const [deleteTarget, setDeleteTarget] = useState<{ label: string; onConfirm: () => void } | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);

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

  const handleDelete = (user: User) => {
    setDeleteTarget({
      label: `al usuario "${user.email}"`,
      onConfirm: async () => {
        setDeleteTarget(null);
        setDeletingId(user.id_usuario);
        try {
          await usersApi.delete(user.id_usuario);
          setUsers((prev) => prev.filter((u) => u.id_usuario !== user.id_usuario));
        } catch (e) {
          setErrorDialog(e instanceof ApiError ? e.message : "No se pudo eliminar el usuario.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleEmailSaved = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id_usuario === updated.id_usuario ? { ...u, email: updated.email } : u))
    );
    setModal(null);
  };

  const handleRoleSaved = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id_usuario === updated.id_usuario ? { ...u, id_rol: updated.id_rol, role: updated.role } : u))
    );
    setModal(null);
  };

  return (
    <View>
      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteModal
          label={deleteTarget.label}
          onConfirm={deleteTarget.onConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {errorDialog && (
        <AppDialog
          title="No se pudo eliminar"
          message={errorDialog}
          variant="danger"
          icon="alert-circle-outline"
          confirmLabel="Entendido"
          onConfirm={() => setErrorDialog(null)}
        />
      )}

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
      {modal?.type === "role" && (
        <ChangeRoleModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleRoleSaved}
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
          <Text style={[styles.thText, { width: 130, textAlign: "right" }]}>Acciones</Text>
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

                <View style={[styles.rowActions, { width: 130, justifyContent: "flex-end" }]}>
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
                    style={[styles.btnIcon, isMe && { opacity: 0.3 }]}
                    onPress={() => setModal({ type: "role", user })}
                    disabled={isMe}
                  >
                    <Ionicons name="shield-outline" size={14} color={C.textSub} />
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
