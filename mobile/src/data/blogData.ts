export type BlogPost = {
  id: string;
  author: string;
  role: string;
  title: string;
  summary: string;
  category: string;
  likes: number;
  dislikes: number;
  comments: string[];
};

export const mockPosts: BlogPost[] = [
  {
    id: "post-1",
    author: "Lara Benitez",
    role: "Guardaparque urbana",
    title: "Como preparar una mochila basica de 24 horas",
    summary:
      "Una lista corta para salir con agua, manta termica, linterna, encendedor y una muda seca sin llevar peso de mas.",
    category: "Equipo",
    likes: 18,
    dislikes: 2,
    comments: [
      "Me gusto que la lista sea simple.",
      "Yo sumaria un silbato y una bateria externa.",
    ],
  },
  {
    id: "post-2",
    author: "Nico Alvarez",
    role: "Instructor voluntario",
    title: "Tres senales para elegir un lugar seguro al acampar",
    summary:
      "Revisar altura del terreno, distancia al agua y cobertura natural ayuda a decidir rapido antes de que anochezca.",
    category: "Refugio",
    likes: 24,
    dislikes: 1,
    comments: [
      "Muy util para salidas cortas.",
    ],
  },
  {
    id: "post-3",
    author: "Camila Rios",
    role: "Huerta comunitaria",
    title: "Que cocinar con pocos recursos cuando se corta la luz",
    summary:
      "Ideas practicas para resolver comidas frias, organizar el agua y cuidar los alimentos en una emergencia corta.",
    category: "Alimentacion",
    likes: 31,
    dislikes: 3,
    comments: [
      "La parte de conservas me sirvio mucho.",
      "Estaria bueno sumar opciones para chicos.",
    ],
  },
];
