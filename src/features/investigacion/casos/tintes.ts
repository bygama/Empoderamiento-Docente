import type { TinteCarpeta } from "./data";

/**
 * Mapeo de tintes de carpeta a clases del design system (tokens, no
 * hardcodes). Cada caso tiene su color propio dentro de la paleta ED:
 * navy institucional, azul claro (carpeta "manila" del archivo: texto navy
 * encima, no blanco), azul medio y verde-concepto. El naranja queda
 * reservado para la acción principal de navegación (DESIGN §1).
 */
export const TINTES: Record<
  TinteCarpeta,
  {
    /** Fondo de carpeta / carcasa del expediente. */
    carpeta: string;
    /** Mismo color como TEXTO (fill de la Pestana SVG vía currentColor). */
    tinta: string;
    /** Color del texto SOBRE la carpeta (blanco en oscuras, navy en claras). */
    texto: string;
    /** Hover de la carpeta (apenas más claro/oscuro). group-hover: responde
     *  también desde la pestaña — feedback ESTÁTICO, nada se mueve. */
    carpetaHover: string;
    /** Grano de material acorde al fondo (dark = blend screen sobre oscuro). */
    grano: string;
    /** Número fantasma / marca de agua sobre la tapa. */
    marcaAgua: string;
    /** Acento de texto sobre papel claro (cumple AA). */
    acentoTexto: string;
    /** Borde suave del mismo tinte sobre papel. */
    borde: string;
    /** Borde pleno (placa de rótulo, pregunta destacada). */
    bordeFuerte: string;
    /** Fondo suave del tinte sobre papel (chips, franjas, notas). */
    suave: string;
  }
> = {
  navy: {
    carpeta: "bg-azul-principal",
    tinta: "text-azul-principal",
    texto: "text-white",
    carpetaHover: "group-hover:bg-azul-principal/95",
    grano: "bg-grain-dark",
    marcaAgua: "text-white/15",
    acentoTexto: "text-azul-principal",
    borde: "border-azul-principal/25",
    bordeFuerte: "border-azul-principal",
    suave: "bg-azul-principal/[0.06]",
  },
  medio: {
    carpeta: "bg-azul-medio",
    tinta: "text-azul-medio",
    texto: "text-white",
    carpetaHover: "group-hover:bg-azul-medio/95",
    grano: "bg-grain-dark",
    marcaAgua: "text-white/15",
    acentoTexto: "text-azul-medio",
    borde: "border-azul-medio/30",
    bordeFuerte: "border-azul-medio",
    suave: "bg-azul-medio/[0.08]",
  },
  claro: {
    // Carpeta "manila" del archivo: fondo azul-claro con TEXTO NAVY
    // (blanco sobre azul-claro no tiene contraste; navy da ~7.4:1).
    // Sus acentos sobre papel usan azul-medio: azul-claro puro es
    // demasiado pálido como texto/borde protagonista.
    carpeta: "bg-azul-claro",
    tinta: "text-azul-claro",
    texto: "text-azul-principal",
    carpetaHover: "group-hover:bg-azul-claro/90",
    grano: "bg-grain-light",
    marcaAgua: "text-azul-principal/15",
    acentoTexto: "text-azul-medio",
    borde: "border-azul-claro",
    bordeFuerte: "border-azul-medio",
    suave: "bg-azul-claro/25",
  },
  verde: {
    // Carpeta en la variante AA del verde (#177a5f): blanco pleno da 5.27:1;
    // sobre verde-concepto puro el blanco queda en 3.53:1 y falla en texto
    // chico. verde-concepto queda para bordes y acentos grandes.
    carpeta: "bg-verde-concepto-texto",
    tinta: "text-verde-concepto-texto",
    texto: "text-white",
    carpetaHover: "group-hover:bg-verde-concepto-texto/95",
    grano: "bg-grain-dark",
    marcaAgua: "text-white/15",
    acentoTexto: "text-verde-concepto-texto",
    borde: "border-verde-concepto/30",
    bordeFuerte: "border-verde-concepto",
    suave: "bg-verde-concepto/[0.08]",
  },
};

/**
 * Posición horizontal de la pestaña de cada carpeta dentro del archivo:
 * contiguas desde la izquierda (cada una arranca donde termina la anterior,
 * como separadores reales de un cajón). El ancho de pestaña es w-56
 * (224px ≈ 19% del contenedor de 1200): pasos de 19%.
 */
export const OFFSET_PESTANA = ["left-[2%]", "left-[21%]", "left-[40%]"] as const;

/**
 * Familia micro-tipográfica del archivo (el design system termina en
 * text-small): TRES variantes compartidas para que el rótulo mono — el
 * dispositivo identitario de la sección — no derive en cuerpos y trackings
 * arbitrarios por componente. El color se decide en cada contexto (AA).
 */
export const ROTULO_SECCION = "font-mono text-[0.72rem] tracking-[0.24em]";
export const ROTULO_MICRO = "font-mono text-[0.68rem] tracking-[0.2em]";
export const ROTULO_TAB = "font-mono text-[0.78rem] font-bold tracking-[0.22em]";
