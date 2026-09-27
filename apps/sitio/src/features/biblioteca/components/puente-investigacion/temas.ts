/** Ancho del lomo de cada panel de la pila. */
export const PASO = "clamp(52px, 5.5vw, 80px)";

/** Las clases de un panel según su fondo: el lomo, los textos y la línea de la que nace. */
export type Tema = {
  card: string;
  spine: string;
  eyebrow: string;
  titulo: string;
  desc: string;
  divisor: string;
  naceLabel: string;
  linea: string;
};

export const TEMAS: Record<"navy" | "gris", Tema> = {
  navy: {
    card: "bg-azul-principal",
    spine: "text-white/85",
    eyebrow: "text-azul-claro/90",
    titulo: "text-white",
    desc: "text-white/75",
    divisor: "border-white/15",
    naceLabel: "text-white/45",
    linea: "text-verde-concepto",
  },
  // El "blanco" de las cards es gris-fondo (el blanco sucio del sitio): sobre
  // la sección blanca se recorta solo, sin depender del ring.
  gris: {
    card: "bg-gris-fondo ring-1 ring-azul-principal/10",
    spine: "text-azul-principal/75",
    eyebrow: "text-gris-texto",
    titulo: "text-azul-principal",
    desc: "text-gris-texto",
    divisor: "border-azul-principal/12",
    naceLabel: "text-gris-texto/80",
    linea: "text-verde-concepto-texto",
  },
};
