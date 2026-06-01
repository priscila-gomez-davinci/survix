import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://survixapp.com";
const TOKEN_KEY = "survix_token";

// ─── Token helpers ────────────────────────────────────────────────────────────
// On native: expo-secure-store (encrypted keychain/keystore).
// On web: sessionStorage (secure-store is not available on web).

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  if (Platform.OS === "web") {
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Unauthorized handler ─────────────────────────────────────────────────────
// AuthContext registers a callback here so expired tokens trigger auto-logout
// without api.ts needing to import React context.

let _onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  _onUnauthorized = handler;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      _onUnauthorized?.();
    }
    const error = await response.json().catch(() => ({}));
    const detail = error?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((d: { msg?: string }) => d.msg ?? "error").join("; ")
        : "Error del servidor";
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id_usuario: number;
  email: string;
  firebase_uid: string | null;
  id_rol: number;
  role: string;
  fecha_creacion: string;
};

export type Profile = {
  id_perfil_usuario: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  foto_url: string;
  bio: string;
  ubicacion: string;
  fecha_nacimiento: string;
};

export type Route = {
  id: number;
  name: string;
  description: string | null;
  distance: number | null;
  duration: number | null;
  id_actividad?: number;
  id_dificultad?: number;
  id_ubicacion?: number;
  latitud?: number | null;
  longitud?: number | null;
  images?: RouteImage[];
  points?: RoutePoint[];
};

export type RouteImage = {
  id: number;
  url: string;
};

export type RoutePoint = {
  id: number;
  lat: number;
  lng: number;
  order: number;
};

export type RouteReview = {
  id_resenia_ruta: number;
  id_rutas: number;
  id_usuario: number;
  puntaje: number;
};

export type RouteDetailData = {
  route: {
    id_rutas: number;
    nombre: string;
    descripcion: string;
    distancia_km: number;
    duracion_min: number;
    latitud?: number | null;
    longitud?: number | null;
  };
  location: { id_ubicacion: number; pais: string; provincia: string; ciudad: string };
  activity: { id_actividad: number; nombre: string };
  difficulty: { id_dificultad: number; nombre: string };
  images: { id_ruta_imagen: number; url: string }[];
  rating_avg: number | null;
  reviews_count: number;
};

export type RouteCreateRequest = {
  id_actividad: number;
  id_dificultad: number;
  id_ubicacion: number;
  nombre: string;
  descripcion: string;
  distancia_km: number;
  duracion_min: number;
  latitud?: number | null;
  longitud?: number | null;
};

export type Guide = {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  category_id: number | null;
  complexity_level_id: number | null;
  latitud?: number | null;
  longitud?: number | null;
  image?: string;
  steps?: GuideStep[];
  products?: GuideProduct[];
};

export type GuideStep = {
  id: number;
  order: number;
  title: string;
  description: string;
};

export type GuideProduct = {
  id: number;
  name: string;
  url: string | null;
  image_url: string | null;
};

export type GuideCreateRequest = {
  titulo: string;
  descripcion: string;
  duracion_min: number;
  id_categoria_guias: number;
  id_nivel_complejidad: number;
  latitud?: number | null;
  longitud?: number | null;
};

export type GuideStepRequest = {
  titulo: string;
  descripcion: string;
  orden: number;
};

export type CatalogItem = {
  id: number;
  nombre: string;
};

export type RoleItem = {
  id_rol: number;
  nombre: string;
};

// ─── Internal backend shapes + mappers ───────────────────────────────────────
// Backend uses Spanish field names (id_rutas, nombre, id_guias_supervivencia, titulo…).
// These types + functions convert them to the public English-named types above.

type _BackendRoute = {
  id_rutas: number;
  nombre: string;
  descripcion: string;
  distancia_km: number;
  duracion_min: number;
  id_actividad: number;
  id_dificultad: number;
  id_ubicacion: number;
  latitud?: number | null;
  longitud?: number | null;
};

type _BackendGuide = {
  id_guias_supervivencia: number;
  titulo: string;
  descripcion: string;
  duracion_min: number;
  id_categoria_guias: number;
  id_nivel_complejidad: number;
  latitud?: number | null;
  longitud?: number | null;
  imagen_url?: string | null;
};

type _BackendPoint = {
  id_ruta_punto: number;
  lat: number;
  lng: number;
  orden: number;
  id_rutas: number;
};

function _mapRoute(r: _BackendRoute): Route {
  return {
    id: r.id_rutas,
    name: r.nombre,
    description: r.descripcion,
    distance: r.distancia_km,
    duration: r.duracion_min,
    id_actividad: r.id_actividad,
    id_dificultad: r.id_dificultad,
    id_ubicacion: r.id_ubicacion,
    latitud: r.latitud,
    longitud: r.longitud,
  };
}

function _mapGuide(g: _BackendGuide): Guide {
  return {
    id: g.id_guias_supervivencia,
    title: g.titulo,
    description: g.descripcion,
    duration: g.duracion_min,
    category_id: g.id_categoria_guias,
    complexity_level_id: g.id_nivel_complejidad,
    latitud: g.latitud,
    longitud: g.longitud,
    image: g.imagen_url ?? undefined,
  };
}

function _mapPoint(p: _BackendPoint): RoutePoint {
  return {
    id: p.id_ruta_punto,
    lat: p.lat,
    lng: p.lng,
    order: p.orden,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me", {}, true),

  firebaseSync: (firebase_uid: string, email: string, id_token?: string) =>
    request<AuthResponse>("/auth/firebase-sync", {
      method: "POST",
      body: JSON.stringify({ firebase_uid, email, id_token }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: () =>
    request<User[]>("/users", {}, true),

  getById: (id: number) =>
    request<User>(`/users/${id}`, {}, true),

  update: (id: number, data: Partial<Pick<User, "email">>) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),

  delete: (id: number) =>
    request<void>(`/users/${id}`, { method: "DELETE" }, true),

  updateRole: (userId: number, roleId: number) =>
    request<User>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ id_rol: roleId }),
    }, true),
};

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const catalogApi = {
  activities: () => request<CatalogItem[]>("/activities"),
  difficulties: () => request<CatalogItem[]>("/difficulties"),
  roles: () => request<RoleItem[]>("/roles"),
  guideCategories: () => request<CatalogItem[]>("/guide-categories"),
  guideLevels: () => request<CatalogItem[]>("/guide-levels"),

  createActivity: (nombre: string) =>
    request<CatalogItem>("/activities", {
      method: "POST",
      body: JSON.stringify({ nombre }),
    }, true),

  updateActivity: (id: number, nombre: string) =>
    request<CatalogItem>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombre }),
    }, true),

  deleteActivity: (id: number) =>
    request<void>(`/activities/${id}`, { method: "DELETE" }, true),
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profilesApi = {
  getById: (userId: number) =>
    request<Profile>(`/profiles/${userId}`, {}, true),

  update: (userId: number, data: Partial<Omit<Profile, "id_perfil_usuario" | "id_usuario">>) =>
    request<Profile>(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),
};

// ─── Routes ───────────────────────────────────────────────────────────────────

export type RouteFilters = {
  activity?: string;
  difficulty?: string;
  location?: string;
  distance?: number;
  duration?: number;
  search?: string;
};

export const routesApi = {
  list: async (filters?: RouteFilters): Promise<Route[]> => {
    const params = new URLSearchParams();
    if (filters?.activity) params.set("activity", filters.activity);
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.location) params.set("location", filters.location);
    if (filters?.distance) params.set("distance", String(filters.distance));
    if (filters?.duration) params.set("duration", String(filters.duration));
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    const raw = await request<_BackendRoute[]>(`/routes${query ? `?${query}` : ""}`);
    return raw.map(_mapRoute);
  },

  getById: async (id: number): Promise<Route> => {
    const raw = await request<_BackendRoute>(`/routes/${id}`);
    return _mapRoute(raw);
  },

  getDetail: (id: number): Promise<RouteDetailData> =>
    request<RouteDetailData>(`/routes/${id}`),

  create: async (data: RouteCreateRequest): Promise<Route> => {
    const raw = await request<_BackendRoute>("/routes", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
    return _mapRoute(raw);
  },

  update: async (id: number, data: Partial<RouteCreateRequest>): Promise<Route> => {
    const raw = await request<_BackendRoute>(`/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true);
    return _mapRoute(raw);
  },

  delete: (id: number) =>
    request<void>(`/routes/${id}`, { method: "DELETE" }, true),

  getImages: (id: number) =>
    request<RouteImage[]>(`/routes/${id}/images`),

  addImage: (id: number, url: string) =>
    request<RouteImage>(`/routes/${id}/images`, {
      method: "POST",
      body: JSON.stringify({ url }),
    }, true),

  getReviews: (id: number) =>
    request<RouteReview[]>(`/routes/${id}/reviews`),

  addReview: (id: number, puntaje: number) =>
    request<RouteReview>(`/routes/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ puntaje }),
    }, true),

  getPoints: async (id: number): Promise<RoutePoint[]> => {
    const raw = await request<_BackendPoint[]>(`/routes/${id}/points`);
    return raw.map(_mapPoint);
  },

  addPoint: async (id: number, latitude: number, longitude: number, orden = 1): Promise<RoutePoint> => {
    const raw = await request<_BackendPoint>(`/routes/${id}/points`, {
      method: "POST",
      body: JSON.stringify({
        latlong: `POINT(${longitude} ${latitude})`,
        orden,
      }),
    }, true);
    return _mapPoint(raw);
  },

  updatePoint: async (pointId: number, latitude: number, longitude: number, orden: number): Promise<RoutePoint> => {
    const raw = await request<_BackendPoint>(`/routes/points/${pointId}`, {
      method: "PUT",
      body: JSON.stringify({
        latlong: `POINT(${longitude} ${latitude})`,
        orden,
      }),
    }, true);
    return _mapPoint(raw);
  },

  deletePoint: (pointId: number) =>
    request<void>(`/routes/points/${pointId}`, { method: "DELETE" }, true),

  download: (id: number) =>
    request<void>(`/routes/${id}/download`, { method: "POST" }, true),

  checkFavorite: (id: number) =>
    request<{ is_favorited: boolean }>(`/routes/${id}/favorite`, {}, true),

  addFavorite: (id: number) =>
    request<void>(`/routes/${id}/favorite`, { method: "POST" }, true),

  removeFavorite: (id: number) =>
    request<void>(`/routes/${id}/favorite`, { method: "DELETE" }, true),

  listFavorites: async (): Promise<Route[]> => {
    const raw = await request<_BackendRoute[]>(`/routes/favorites`, {}, true);
    return raw.map(_mapRoute);
  },
};

// ─── Guides ───────────────────────────────────────────────────────────────────

export type GuideFilters = {
  category?: string;
  complexity?: string;
  search?: string;
};

export const guidesApi = {
  list: async (filters?: GuideFilters): Promise<Guide[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.complexity) params.set("complexity", filters.complexity);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    const raw = await request<_BackendGuide[]>(`/guides${query ? `?${query}` : ""}`);
    return raw.map(_mapGuide);
  },

  getById: async (id: number): Promise<Guide> => {
    const raw = await request<_BackendGuide>(`/guides/${id}`);
    return _mapGuide(raw);
  },

  create: async (data: GuideCreateRequest): Promise<Guide> => {
    const raw = await request<_BackendGuide>("/guides", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
    return _mapGuide(raw);
  },

  update: async (id: number, data: Partial<GuideCreateRequest>): Promise<Guide> => {
    const raw = await request<_BackendGuide>(`/guides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true);
    return _mapGuide(raw);
  },

  delete: (id: number) =>
    request<void>(`/guides/${id}`, { method: "DELETE" }, true),

  getSteps: (id: number) =>
    request<GuideStep[]>(`/guides/${id}/steps`),

  getProducts: (id: number) =>
    request<GuideProduct[]>(`/guides/${id}/products`),

  addStep: (id: number, step: GuideStepRequest) =>
    request<GuideStep>(`/guides/${id}/steps`, {
      method: "POST",
      body: JSON.stringify(step),
    }, true),

  updateStep: (stepId: number, step: Partial<GuideStepRequest>) =>
    request<GuideStep>(`/guides/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify(step),
    }, true),

  deleteStep: (stepId: number) =>
    request<void>(`/guides/steps/${stepId}`, { method: "DELETE" }, true),

  download: (id: number) =>
    request<void>(`/guides/${id}/download`, { method: "POST" }, true),

  addProduct: (id: number, product: { name: string; url?: string; image_url?: string }) =>
    request<GuideProduct>(`/guides/${id}/products`, {
      method: "POST",
      body: JSON.stringify(product),
    }, true),

  addImage: (id: number, url: string) =>
    request<{ id_guia_imagen: number; url: string }>(`/guides/${id}/images`, {
      method: "POST",
      body: JSON.stringify({ url }),
    }, true),

  addFavorite: (id: number) =>
    request<void>(`/guides/${id}/favorite`, { method: "POST" }, true),

  removeFavorite: (id: number) =>
    request<void>(`/guides/${id}/favorite`, { method: "DELETE" }, true),
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export type BlogComment = {
  id: number;
  text: string;
  author: string;
};

export type BlogPost = {
  id: string;
  author: string;
  role: string;
  authorPhoto?: string;
  title: string;
  summary: string;
  body?: string;
  image?: string;
  category: string;
  likes: number;
  likedByMe: boolean;
  comments: BlogComment[];
};

type _BackendComment = {
  id: number;
  contenido: string;
  autor_nombre: string;
  fecha: string;
};

type _BackendPost = {
  id: number;
  titulo: string | null;
  contenido: string;
  categoria: string | null;
  fecha: string;
  autor_nombre: string;
  autor_rol: string;
  autor_foto_url: string | null;
  imagen_url: string | null;
  likes_count: number;
  liked_by_me: boolean;
  comments: _BackendComment[];
};

function _mapComment(c: _BackendComment): BlogComment {
  return { id: c.id, text: c.contenido, author: c.autor_nombre };
}

function _mapPost(p: _BackendPost): BlogPost {
  const full = p.contenido;
  const summary = full.length > 200 ? `${full.slice(0, 200)}…` : full;
  return {
    id: String(p.id),
    author: p.autor_nombre,
    role: p.autor_rol,
    authorPhoto: p.autor_foto_url ?? undefined,
    title: p.titulo ?? "",
    summary,
    body: full,
    image: p.imagen_url ?? undefined,
    category: p.categoria ?? "General",
    likes: p.likes_count,
    likedByMe: p.liked_by_me,
    comments: p.comments.map(_mapComment),
  };
}

export type PostCreatePayload = {
  titulo: string;
  contenido: string;
  categoria: string;
  imagen_url?: string;
};

export const postsApi = {
  list: async (): Promise<BlogPost[]> => {
    const raw = await request<_BackendPost[]>("/posts", {}, true);
    return raw.map(_mapPost);
  },

  getById: async (id: number): Promise<BlogPost> => {
    const raw = await request<_BackendPost>(`/posts/${id}`, {}, true);
    return _mapPost(raw);
  },

  create: async (payload: PostCreatePayload): Promise<BlogPost> => {
    const raw = await request<_BackendPost>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
    return _mapPost(raw);
  },

  delete: (id: number) =>
    request<void>(`/posts/${id}`, { method: "DELETE" }, true),

  addLike: (id: number) =>
    request<void>(`/posts/${id}/like`, { method: "POST" }, true),

  removeLike: (id: number) =>
    request<void>(`/posts/${id}/like`, { method: "DELETE" }, true),

  addComment: (id: number, contenido: string) =>
    request<void>(`/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ contenido }),
    }, true),

  deleteComment: (postId: number, commentId: number) =>
    request<void>(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" }, true),
};

// ─── File upload ──────────────────────────────────────────────────────────────

async function _compressImage(file: File, maxDim = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
    img.src = blobUrl;
  });
}

export async function uploadImage(file: File): Promise<string> {
  const compressed = await _compressImage(file);
  const token = await getStoredToken();
  const formData = new FormData();
  formData.append("file", compressed);

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).detail ?? "Error al subir la imagen.");
  }

  const data = await res.json() as { url: string };
  return data.url;
}
