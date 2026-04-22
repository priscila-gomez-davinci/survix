import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { routesApi, guidesApi, type Route, type Guide } from "@/src/services/api";
import type { HomeItem } from "@/src/data/homeData";
import { equipment } from "@/src/data/homeData";

// ─── WKT parser ──────────────────────────────────────────────────────────────
// Backend returns coordinates as WKT: "POINT(longitude latitude)"
function parseWkt(wkt: string): { latitude: number; longitude: number } | null {
  const match = wkt.match(/POINT\((-?\d+\.?\d*)\s+(-?\d+\.?\d*)\)/);
  if (!match) return null;
  return { longitude: Number(match[1]), latitude: Number(match[2]) };
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";

function routeToHomeItem(route: Route): HomeItem {
  const subtitle =
    route.distance != null && route.duration != null
      ? `${route.distance} km · ${route.duration} min`
      : route.distance != null
        ? `${route.distance} km`
        : route.duration != null
          ? `${route.duration} min`
          : "";

  const image = route.images?.[0]?.url ?? PLACEHOLDER_IMAGE;

  const firstPoint = route.points?.[0];
  const coordinates = firstPoint ? parseWkt(firstPoint.coordinates) ?? undefined : undefined;

  return {
    id: String(route.id),
    title: route.name,
    subtitle,
    description: route.description ?? "",
    image,
    coordinates,
  };
}

function guideToHomeItem(guide: Guide): HomeItem {
  const subtitle =
    guide.duration != null ? `${guide.duration} min` : "";

  return {
    id: String(guide.id),
    title: guide.title,
    subtitle,
    description: guide.description ?? "",
    image: PLACEHOLDER_IMAGE,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeDataContextValue = {
  activities: HomeItem[];
  guides: HomeItem[];
  equipment: HomeItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function HomeDataProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<HomeItem[]>([]);
  const [guides, setGuides] = useState<HomeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([routesApi.list(), guidesApi.list()])
      .then(([routes, guidesList]) => {
        if (cancelled) return;
        setActivities(routes.map(routeToHomeItem));
        setGuides(guidesList.map(guideToHomeItem));
      })
      .catch(() => {
        if (cancelled) return;
        setError("No se pudo cargar el contenido. Verificá tu conexión.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  return (
    <HomeDataContext.Provider
      value={{ activities, guides, equipment, isLoading, error, refresh }}
    >
      {children}
    </HomeDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeData() {
  const ctx = useContext(HomeDataContext);
  if (!ctx) throw new Error("useHomeData must be used within HomeDataProvider");
  return ctx;
}
