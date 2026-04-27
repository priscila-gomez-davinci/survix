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
    throw new ApiError(response.status, error?.detail ?? "Error del servidor");
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
  id_usuario: number;
  name: string | null;
  surname: string | null;
  photo_url: string | null;
  bio: string | null;
  location: string | null;
  birthdate: string | null;
};

export type Route = {
  id: number;
  name: string;
  description: string | null;
  distance: number | null;
  duration: number | null;
  images?: RouteImage[];
  points?: RoutePoint[];
};

export type RouteImage = {
  id: number;
  url: string;
};

export type RoutePoint = {
  id: number;
  coordinates: string;
  order: number;
};

export type RouteCreateRequest = {
  id_actividad: number;
  id_dificultad: number;
  id_ubicacion: number;
  nombre: string;
  descripcion?: string;
  distancia_km: number;
  duracion_min: number;
};

export type Guide = {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  category_id: number | null;
  complexity_level_id: number | null;
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
  descripcion?: string;
  duracion_min: number;
  id_categoria_guias: number;
  id_nivel_complejidad: number;
};

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
  getById: (id: number) =>
    request<User>(`/users/${id}`, {}, true),

  update: (id: number, data: Partial<Pick<User, "email">>) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profilesApi = {
  getById: (userId: number) =>
    request<Profile>(`/profiles/${userId}`, {}, true),

  update: (userId: number, data: Partial<Omit<Profile, "id_usuario">>) =>
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
  list: (filters?: RouteFilters) => {
    const params = new URLSearchParams();
    if (filters?.activity) params.set("activity", filters.activity);
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.location) params.set("location", filters.location);
    if (filters?.distance) params.set("distance", String(filters.distance));
    if (filters?.duration) params.set("duration", String(filters.duration));
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    return request<Route[]>(`/routes${query ? `?${query}` : ""}`);
  },

  getById: (id: number) =>
    request<Route>(`/routes/${id}`),

  create: (data: RouteCreateRequest) =>
    request<Route>("/routes", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  update: (id: number, data: Partial<RouteCreateRequest>) =>
    request<Route>(`/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),

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
    request<unknown[]>(`/routes/${id}/reviews`),

  addReview: (id: number, rating: number, comment?: string) =>
    request<unknown>(`/routes/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }, true),

  addPoint: (id: number, latitude: number, longitude: number, order = 1) =>
    request<RoutePoint>(`/routes/${id}/points`, {
      method: "POST",
      body: JSON.stringify({
        coordinates: `POINT(${longitude} ${latitude})`,
        order,
      }),
    }, true),

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
  list: (filters?: GuideFilters) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.complexity) params.set("complexity", filters.complexity);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    return request<Guide[]>(`/guides${query ? `?${query}` : ""}`);
  },

  getById: (id: number) =>
    request<Guide>(`/guides/${id}`),

  create: (data: GuideCreateRequest) =>
    request<Guide>("/guides", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  update: (id: number, data: Partial<GuideCreateRequest>) =>
    request<Guide>(`/guides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true),

  delete: (id: number) =>
    request<void>(`/guides/${id}`, { method: "DELETE" }, true),

  getSteps: (id: number) =>
    request<GuideStep[]>(`/guides/${id}/steps`),

  getProducts: (id: number) =>
    request<GuideProduct[]>(`/guides/${id}/products`),

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
