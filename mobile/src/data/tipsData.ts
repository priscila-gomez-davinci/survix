import type { Ionicons } from "@expo/vector-icons";

export type TipStep = {
  order: number;
  text: string;
};

export type Tip = {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  body: string;
  steps: TipStep[];
  image?: string;
};

export type TipCategory = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  accentColor: string;
};

export const TIP_CATEGORIES: TipCategory[] = [
  {
    id: "first-aid",
    label: "Primeros auxilios",
    icon: "medkit-outline",
    bgColor: "#FEF3E2",
    accentColor: "#C05621",
  },
  {
    id: "shelter",
    label: "Refugios",
    icon: "home-outline",
    bgColor: "#E8F4F0",
    accentColor: "#14342B",
  },
  {
    id: "water",
    label: "Agua",
    icon: "water-outline",
    bgColor: "#EBF5FB",
    accentColor: "#1A6B9A",
  },
  {
    id: "navigation",
    label: "Orientación",
    icon: "compass-outline",
    bgColor: "#F0EBF8",
    accentColor: "#5B2D8E",
  },
];

export const TIPS: Tip[] = [
  // ── Primeros auxilios ──────────────────────────────────────────────────────
  {
    id: "fa-1",
    categoryId: "first-aid",
    title: "Cómo curar una herida en el campo",
    summary: "Pasos para limpiar y cubrir una herida con los elementos del botiquín básico.",
    body: "Una herida mal tratada en el campo puede infectarse rápidamente. Con los elementos mínimos del botiquín podés controlar el riesgo.",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    steps: [
      { order: 1, text: "Lavá la herida con agua limpia durante al menos 60 segundos para retirar tierra y bacterias." },
      { order: 2, text: "Aplicá antiséptico (yodopovidona o clorhexidina) de adentro hacia afuera, sin frotar." },
      { order: 3, text: "Cubrí con gasa estéril y asegurá con esparadrapo. Nunca uses algodón directo sobre la herida." },
      { order: 4, text: "Revisá la herida cada 12 horas. Enrojecimiento, calor o pus son señales de infección: buscá atención médica." },
    ],
  },
  {
    id: "fa-2",
    categoryId: "first-aid",
    title: "Reconocer y actuar ante una hipotermia",
    summary: "Identificá los síntomas a tiempo para evitar complicaciones graves.",
    body: "La hipotermia ocurre cuando la temperatura corporal baja de 35°C. Es una emergencia que puede progresar rápido.",
    steps: [
      { order: 1, text: "Identificá los signos: tiritones intensos, confusión, piel fría y pálida, habla pastosa." },
      { order: 2, text: "Sacá a la persona del frío y del viento. Quitá la ropa mojada." },
      { order: 3, text: "Abrigala con mantas secas. En manta térmica, el lado dorado va hacia adentro." },
      { order: 4, text: "Si está consciente, dá bebidas calientes (no alcohólicas). No frotés la piel con fuerza." },
      { order: 5, text: "Si los síntomas no mejoran en 30 minutos o la persona pierde el conocimiento, activá la emergencia." },
    ],
  },
  {
    id: "fa-3",
    categoryId: "first-aid",
    title: "Manejo de esguinces con el método RICE",
    summary: "Qué hacer en las primeras 48 horas después de una torcedura.",
    body: "Los esguinces de tobillo son las lesiones más comunes en el campo. Un buen manejo temprano reduce el tiempo de recuperación.",
    steps: [
      { order: 1, text: "Reposo: suspendé la actividad de inmediato y evitá apoyar la zona lesionada." },
      { order: 2, text: "Hielo: aplicá frío (bolsa con agua helada o nieve envuelta en tela) 20 minutos cada 2 horas." },
      { order: 3, text: "Compresión: vendá la zona con vendaje elástico sin apretar demasiado." },
      { order: 4, text: "Elevación: mantené la extremidad por encima del nivel del corazón cuando sea posible." },
    ],
  },
  // ── Refugios ───────────────────────────────────────────────────────────────
  {
    id: "sh-1",
    categoryId: "shelter",
    title: "Elegir el lugar ideal para acampar",
    summary: "Tres criterios esenciales para decidir antes de que anochezca.",
    body: "El lugar del campamento define en gran medida tu seguridad durante la noche. Dedicá 10 minutos a evaluarlo correctamente.",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80",
    steps: [
      { order: 1, text: "Terreno: buscá una superficie levemente elevada y plana. Evitá canaletas y zonas bajas donde se acumula agua." },
      { order: 2, text: "Agua: campá a al menos 60 metros de ríos o arroyos para evitar crecidas nocturnas y animales." },
      { order: 3, text: "Cobertura: los árboles medianos dan protección del viento, pero evitá ramas secas y troncos dañados." },
      { order: 4, text: "Orientá la entrada de la carpa de espaldas al viento dominante para minimizar el frío interior." },
    ],
  },
  {
    id: "sh-2",
    categoryId: "shelter",
    title: "Improvisar un refugio tipo A-frame",
    summary: "Cómo armar un refugio básico si no tenés carpa disponible.",
    body: "Un refugio improvisado puede salvarte la vida si te quedás sin equipo. Lo básico es bloquear el viento y crear una capa aislante.",
    steps: [
      { order: 1, text: "Encontrá una rama larga y resistente. Apoyala entre dos árboles a la altura de tu hombro (palo mayor)." },
      { order: 2, text: "Apoyá ramas más cortas diagonalmente a ambos lados formando una A." },
      { order: 3, text: "Cubrí con hojas secas, helechos o corteza desde abajo hacia arriba, como si fueran tejas." },
      { order: 4, text: "La capa de hojas debe tener al menos 30 cm de grosor para aislar del frío." },
      { order: 5, text: "Hacé una cama elevada con ramas y hojas para no dormir directo en el suelo frío." },
    ],
  },
  // ── Agua ───────────────────────────────────────────────────────────────────
  {
    id: "wa-1",
    categoryId: "water",
    title: "Purificar agua en el campo",
    summary: "Cuatro métodos para obtener agua segura sin filtros modernos.",
    body: "El agua de ríos, arroyos y lluvia puede contener parásitos y bacterias. Nunca la bebas sin tratarla.",
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80",
    steps: [
      { order: 1, text: "Hervido: lleva el agua a hervor por al menos 1 minuto (3 minutos a más de 2000 m de altitud). Es el método más confiable." },
      { order: 2, text: "Pastillas purificadoras: 1 pastilla por litro, esperar 30 minutos antes de beber." },
      { order: 3, text: "Filtración con tela: pasá el agua por varias capas de tela para retirar sedimentos antes de hervir." },
      { order: 4, text: "Lluvia: recolectá agua de lluvia con lonas o la carpa. No requiere tratamiento adicional." },
    ],
  },
  {
    id: "wa-2",
    categoryId: "water",
    title: "Señales de deshidratación y cómo prevenirla",
    summary: "Reconocé los síntomas antes de que se vuelvan urgentes.",
    body: "En condiciones de calor, frío extremo o actividad intensa, el cuerpo pierde agua más rápido de lo que percibís.",
    steps: [
      { order: 1, text: "Reconocé los síntomas tempranos: sed intensa, orina oscura, dolor de cabeza, fatiga inusual." },
      { order: 2, text: "Bebé constantemente: al menos 500 ml por hora de actividad intensa, incluso sin sentir sed." },
      { order: 3, text: "En calor extremo agregá sales: una pizca de sal y azúcar en agua replica un suero oral básico." },
      { order: 4, text: "Si no podés orinar en 6 horas, consideralo una emergencia médica." },
    ],
  },
  // ── Orientación ────────────────────────────────────────────────────────────
  {
    id: "na-1",
    categoryId: "navigation",
    title: "Orientarse sin brújula ni GPS",
    summary: "Técnicas para encontrar el norte usando el sol y las estrellas.",
    body: "Si la batería se agota o no llevás brújula, la naturaleza tiene señales que podés aprender a leer.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    steps: [
      { order: 1, text: "Método del palo: clavá un palo vertical. Marcá la punta de su sombra. Esperá 15 min y marcá de nuevo. La línea entre puntos va de oeste a este." },
      { order: 2, text: "Cruz del Sur: en el hemisferio sur, extendé el eje largo de la Cruz del Sur hacia el horizonte para encontrar el sur." },
      { order: 3, text: "Vegetación: en el hemisferio sur el musgo crece más en el lado sur (más húmedo y con menos sol directo)." },
      { order: 4, text: "Ríos: en la mayoría de las cuencas argentinas los ríos fluyen hacia el este o sur. Seguir aguas abajo te lleva a zonas habitadas." },
    ],
  },
  {
    id: "na-2",
    categoryId: "navigation",
    title: "Cómo leer un mapa topográfico",
    summary: "Lo esencial para interpretar curvas de nivel antes de tu salida.",
    body: "Un mapa topográfico te da información sobre el relieve que ningún GPS puede reemplazar cuando se corta la señal.",
    steps: [
      { order: 1, text: "Las curvas de nivel unen puntos a la misma altitud. Cuanto más juntas, más empinado el terreno." },
      { order: 2, text: "Los valles se ven como curvas en V apuntando hacia altitudes mayores. Las cumbres son círculos cerrados." },
      { order: 3, text: "Orientá el mapa: alineá el norte del mapa con el norte real usando una brújula o el método del sol." },
      { order: 4, text: "Ubicá dos puntos de referencia visibles en el terreno (ríos, cerros) y buscalos en el mapa para determinar tu posición." },
    ],
  },
];

export function getTipsByCategory(categoryId: string): Tip[] {
  return TIPS.filter((t) => t.categoryId === categoryId);
}

export function getTipById(id: string): Tip | undefined {
  return TIPS.find((t) => t.id === id);
}
