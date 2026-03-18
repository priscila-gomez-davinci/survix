export type HomeItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export const activities: HomeItem[] = [
  {
    id: "act-1",
    title: "Reserva Ecológica Costanera Sur",
    subtitle: "Buenos Aires, Argentina",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin feugiat, velit id faucibus pretium, urna nisl hendrerit turpis, non feugiat erat arcu quis nibh.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "act-2",
    title: "Circuito de trekking urbano",
    subtitle: "Buenos Aires, Argentina",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque viverra, justo nec facilisis vulputate, erat velit pharetra velit, eu lacinia sem purus eget massa.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "act-3",
    title: "Sendero ribereño",
    subtitle: "Tigre, Buenos Aires",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet tortor sed justo laoreet volutpat.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  },
];

export const guides: HomeItem[] = [
  {
    id: "guide-1",
    title: "Guía de Huertas",
    subtitle: "Soluciones low tech",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse accumsan lorem non diam luctus, a faucibus dui volutpat.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "guide-2",
    title: "Guía de Pesca",
    subtitle: "Técnicas básicas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tristique augue et nisl feugiat, vitae tempus purus molestie.",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "guide-3",
    title: "Primeros auxilios",
    subtitle: "Nociones esenciales",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque euismod arcu sed justo porttitor, ut aliquam massa elementum.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  },
];

export const equipment: HomeItem[] = [
  {
    id: "eq-1",
    title: "Mochila de trekking",
    subtitle: "Capacidad 40L",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec est ut ipsum bibendum dictum.",
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "eq-2",
    title: "Botella térmica",
    subtitle: "Acero inoxidable",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus, eros nec feugiat congue, nibh nisl ultrices velit.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "eq-3",
    title: "Linterna recargable",
    subtitle: "Uso outdoor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus malesuada orci nec augue varius, non posuere felis fermentum.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  },
];