export type PurchaseLink = {
  label: string;
  url: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type HomeItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  purchaseLinks?: PurchaseLink[];
  coordinates?: Coordinates;
};

export const equipment: HomeItem[] = [
  {
    id: "eq-1",
    title: "Mochila de trekking",
    subtitle: "Capacidad 40L",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec est ut ipsum bibendum dictum.",
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80",
    purchaseLinks: [
      {
        label: "Mercado Libre",
        url: "https://www.mercadolibre.com.ar/",
      },
      {
        label: "Zona de Recreacion",
        url: "https://www.zonaderecreacion.com/",
      },
    ],
  },
  {
    id: "eq-2",
    title: "Botella termica",
    subtitle: "Acero inoxidable",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus, eros nec feugiat congue, nibh nisl ultrices velit.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
    purchaseLinks: [
      {
        label: "Mercado Libre",
        url: "https://www.mercadolibre.com.ar/",
      },
      {
        label: "Aventura Store",
        url: "https://www.aventurastore.com/",
      },
    ],
  },
  {
    id: "eq-3",
    title: "Linterna recargable",
    subtitle: "Uso outdoor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus malesuada orci nec augue varius, non posuere felis fermentum.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
    purchaseLinks: [
      {
        label: "Mercado Libre",
        url: "https://www.mercadolibre.com.ar/",
      },
      {
        label: "Camping Shop",
        url: "https://www.campingshop.com/",
      },
    ],
  },
];
