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

export const mockPosts: BlogPost[] = [
  {
    id: "post-1",
    author: "Lara Benitez",
    role: "Miembro de la comunidad",
    title: "Como preparar una mochila basica de 24 horas",
    summary:
      "Una lista corta para salir con agua, manta termica, linterna, encendedor y una muda seca sin llevar peso de mas.",
    body:
      "La clave de una mochila de 24 horas es priorizar peso y funcion. El error mas comun es llevar ropa demas y olvidar items criticos.\n\nLista recomendada:\n• 1.5 litros de agua (o pastillas purificadoras)\n• Manta termica de emergencia\n• Linterna frontal con pilas nuevas\n• Encendedor + fosforos impermeables\n• Muda seca en bolsa hermetica\n• Botiquin minimo: curita, gasa, ibuprofeno\n• Barra de cereal o frutos secos\n• Documentos y efectivo en bolsa zip\n\nEl peso total no deberia superar los 5 kg para no comprometer la movilidad.",
    image: "https://images.unsplash.com/photo-1553531384-411a247ccd73?w=800&q=80",
    category: "Equipo",
    likes: 18,
    likedByMe: false,
    comments: [
      { id: 1, text: "Me gusto que la lista sea simple.", author: "Comunidad" },
      { id: 2, text: "Yo sumaria un silbato y una bateria externa.", author: "Comunidad" },
    ],
  },
  {
    id: "post-2",
    author: "Nico Alvarez",
    role: "Miembro de la comunidad",
    title: "Tres senales para elegir un lugar seguro al acampar",
    summary:
      "Revisar altura del terreno, distancia al agua y cobertura natural ayuda a decidir rapido antes de que anochezca.",
    body:
      "Antes de montar la carpa, dedica 10 minutos a evaluar el entorno. Estas tres senales reducen los riesgos mas comunes.\n\n1. Altura del terreno\nEvita zonas bajas o canaletas donde se acumula agua de lluvia. Buscas un terreno levemente elevado pero no expuesto al viento.\n\n2. Distancia al agua\nCampamento a al menos 60 metros de rios o arroyos. El agua sube rapido con lluvia y los animales frecuentan la orilla en la madrugada.\n\n3. Cobertura natural\nArboles medianos dan proteccion del viento y la lluvia, pero evita acampar directamente bajo ramas secas o arboles con troncos danados.\n\nSi encontras las tres condiciones favorables, ese es tu lugar.",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80",
    category: "Refugio",
    likes: 24,
    likedByMe: false,
    comments: [
      { id: 3, text: "Muy util para salidas cortas.", author: "Comunidad" },
    ],
  },
  {
    id: "post-3",
    author: "Camila Rios",
    role: "Miembro de la comunidad",
    title: "Que cocinar con pocos recursos cuando se corta la luz",
    summary:
      "Ideas practicas para resolver comidas frias, organizar el agua y cuidar los alimentos en una emergencia corta.",
    body:
      "Cuando se corta la luz, el primer instinto es abrir el freezer. Es justo lo que no hay que hacer: el frio se pierde rapido y los alimentos se echan a perder antes.\n\nQue hacer en las primeras 2 horas:\n• No abrir heladera ni freezer innecesariamente\n• Sacar lo que vayas a comer en el momento\n• Priorizar frutas, verduras y conservas\n\nIdeas de comidas sin luz:\n• Latas de atun o sardinas con galletitas\n• Mantequilla de mani con pan\n• Frutas con avena y miel\n• Conservas de garbanzos con aceite y limon\n\nPara el agua:\nTener siempre 2 litros por persona guardados fuera de la heladera. Si hay dudas de la calidad, hervir (si tenes gas) o usar pastillas purificadoras.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
    category: "Alimentacion",
    likes: 31,
    likedByMe: false,
    comments: [
      { id: 4, text: "La parte de conservas me sirvio mucho.", author: "Comunidad" },
      { id: 5, text: "Estaria bueno sumar opciones para chicos.", author: "Comunidad" },
    ],
  },
];
