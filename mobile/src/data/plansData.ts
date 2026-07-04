export type PlanId = "free" | "premium" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  billingLabel: string;
  description: string;
  highlighted: boolean;
  ctaLabel: string;
  trialDays?: number;
  features: string[];
};

export type ComparisonFeature = {
  label: string;
  free: string | boolean;
  premium: string | boolean;
  pro: string | boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Explorador",
    price: 0,
    priceLabel: "Gratis",
    billingLabel: "para siempre",
    description: "Acceso esencial para empezar a explorar.",
    highlighted: false,
    ctaLabel: "Tu plan actual",
    features: [
      "Rutas y mapas básicos",
      "Tips de supervivencia básicos",
      "Comunidad",
      "Hasta 5 favoritos",
    ],
  },
  {
    id: "premium",
    name: "Aventurero",
    price: 4.99,
    priceLabel: "$4.99",
    billingLabel: "por mes",
    description: "Para quienes salen seguido y quieren más.",
    highlighted: true,
    ctaLabel: "Comenzar prueba gratuita",
    trialDays: 30,
    features: [
      "Todo lo del plan Explorador",
      "Tips de supervivencia completos",
      "Mapas sin conexión",
      "Descarga de rutas",
      "Favoritos ilimitados",
      "Sin publicidad",
    ],
  },
  {
    id: "pro",
    name: "Experto",
    price: 9.99,
    priceLabel: "$9.99",
    billingLabel: "por mes",
    description: "El máximo nivel para aventureros serios.",
    highlighted: false,
    ctaLabel: "Contratar",
    features: [
      "Todo lo del plan Aventurero",
      "Creación de guías propias",
      "Guías de expertos certificados",
      "Estadísticas de actividad",
      "Soporte prioritario 24/7",
    ],
  },
];

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  { label: "Rutas y mapas",           free: true,        premium: true,       pro: true },
  { label: "Tips de supervivencia",   free: "Básicos",   premium: "Completos", pro: "Completos" },
  { label: "Comunidad",                 free: true,        premium: true,       pro: true },
  { label: "Mapas sin conexión",       free: false,       premium: true,       pro: true },
  { label: "Descarga de rutas",        free: false,       premium: true,       pro: true },
  { label: "Favoritos",                free: "Hasta 5",   premium: "Ilimitados", pro: "Ilimitados" },
  { label: "Sin publicidad",           free: false,       premium: true,       pro: true },
  { label: "Guías de expertos",        free: false,       premium: false,      pro: true },
  { label: "Creación de guías",        free: false,       premium: false,      pro: true },
  { label: "Soporte prioritario",      free: false,       premium: false,      pro: true },
];
