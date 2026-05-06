import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://survixapp.com";
const TOKEN_KEY = "@survix/token";

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
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

  firebaseSync: (firebase_uid: string, email: string) =>
    request<AuthResponse>("/auth/firebase-sync", {
      method: "POST",
      body: JSON.stringify({ firebase_uid, email }),
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

  addFavorite: (id: number) =>
    request<void>(`/routes/${id}/favorite`, { method: "POST" }, true),

  removeFavorite: (id: number) =>
    request<void>(`/routes/${id}/favorite`, { method: "DELETE" }, true),
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

  addFavorite: (id: number) =>
    request<void>(`/guides/${id}/favorite`, { method: "POST" }, true),

  removeFavorite: (id: number) =>
    request<void>(`/guides/${id}/favorite`, { method: "DELETE" }, true),
};
