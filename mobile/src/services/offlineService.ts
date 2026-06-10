import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuideStep } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfflineGuide = {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  image: string;
  steps: GuideStep[];
  savedAt: string;
};

export type OfflineMap = {
  id: string;
  label: string;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  savedAt: string;
};

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEY_GUIDES = "@survix:offline_guides";
const KEY_MAPS   = "@survix:offline_maps";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadJSON<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}

async function saveJSON<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const offlineService = {
  // ── Guides ──────────────────────────────────────────────────────────────────

  async getGuides(): Promise<OfflineGuide[]> {
    return loadJSON<OfflineGuide>(KEY_GUIDES);
  },

  async saveGuide(guide: OfflineGuide): Promise<void> {
    const current = await loadJSON<OfflineGuide>(KEY_GUIDES);
    const filtered = current.filter((g) => g.id !== guide.id);
    await saveJSON(KEY_GUIDES, [...filtered, guide]);
  },

  async removeGuide(id: number): Promise<void> {
    const current = await loadJSON<OfflineGuide>(KEY_GUIDES);
    await saveJSON(KEY_GUIDES, current.filter((g) => g.id !== id));
  },

  async isGuideSaved(id: number): Promise<boolean> {
    const guides = await loadJSON<OfflineGuide>(KEY_GUIDES);
    return guides.some((g) => g.id === id);
  },

  async getOfflineGuide(id: number): Promise<OfflineGuide | null> {
    const guides = await loadJSON<OfflineGuide>(KEY_GUIDES);
    return guides.find((g) => g.id === id) ?? null;
  },

  // ── Maps ────────────────────────────────────────────────────────────────────

  async getMaps(): Promise<OfflineMap[]> {
    return loadJSON<OfflineMap>(KEY_MAPS);
  },

  async saveMap(map: OfflineMap): Promise<void> {
    const current = await loadJSON<OfflineMap>(KEY_MAPS);
    const filtered = current.filter((m) => m.id !== map.id);
    await saveJSON(KEY_MAPS, [...filtered, map]);
  },

  async removeMap(id: string): Promise<void> {
    const current = await loadJSON<OfflineMap>(KEY_MAPS);
    await saveJSON(KEY_MAPS, current.filter((m) => m.id !== id));
  },
};
