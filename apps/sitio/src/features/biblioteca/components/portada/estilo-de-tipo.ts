import {
  BookOpen,
  LampManual,
  Lightbulb,
  School,
  Target,
  TrendingUp,
  Users,
  type IconProps,
} from "@/components/ui/icons";
import type { Tipo } from "@/features/biblioteca/contenido/modelo";

// El código visual de cada tipo de material: un color, un ícono y su nombre.
// Es el mismo en la portada, en el chip de cada fila del catálogo y en el riel
// del hero, para que un tipo se reconozca de un vistazo. El color nunca va
// solo: siempre lo acompañan el ícono y el nombre.
//
// La paleta (DESIGN.md) no tiene siete colores, y el naranja es solo de las
// acciones: van tres fondos plenos oscuros, el celeste y tres claros. El verde
// de «Libros» es el de texto, el que da contraste AA con el blanco.

export type EstiloDeTipo = {
  Icon: (p: IconProps) => React.JSX.Element;
  /** Cómo se nombra en la portada, en singular. */
  singular: string;
  /** El fondo y el color del texto. */
  fondo: string;
  /** Un tinte sobre el fondo: los verdes claros no son un token, son el verde con poca opacidad sobre blanco. */
  velo?: string;
  /** El ícono y el rótulo del tipo. */
  acento: string;
  /** Los fondos claros llevan borde: sobre el blanco del catálogo se perderían. */
  borde: boolean;
};

const CLARO = "text-azul-principal";

export const ESTILO_DE_TIPO: Record<Tipo, EstiloDeTipo> = {
  Artículos: { Icon: BookOpen, singular: "Artículo", fondo: "bg-azul-principal text-white", acento: "text-verde-concepto", borde: false },
  "Capítulos de libro": { Icon: Lightbulb, singular: "Capítulo", fondo: "bg-azul-medio text-white", acento: "text-white", borde: false },
  Libros: { Icon: School, singular: "Libro", fondo: "bg-verde-concepto-texto text-white", acento: "text-white", borde: false },
  Tesis: { Icon: Target, singular: "Tesis", fondo: `bg-azul-claro ${CLARO}`, acento: CLARO, borde: false },
  "Actas de congreso": { Icon: Users, singular: "Actas", fondo: `bg-gris-fondo ${CLARO}`, acento: "text-verde-concepto-texto", borde: true },
  Divulgación: { Icon: TrendingUp, singular: "Divulgación", fondo: `bg-white ${CLARO}`, velo: "bg-verde-concepto/15", acento: "text-verde-concepto-texto", borde: false },
  Materiales: { Icon: LampManual, singular: "Material", fondo: `bg-white ${CLARO}`, acento: "text-verde-concepto-texto", borde: true },
};

/** El estilo de un tipo; sin tipo (un borrador), el de los artículos, como la portada generada. */
export function estiloDe(tipo: Tipo | ""): EstiloDeTipo {
  return ESTILO_DE_TIPO[tipo || "Artículos"];
}

/** Las portadas tipográficas que ya tiene el sitio (las 57 de `public/` y la generada): las reemplaza la de código. */
export function esPortadaTipografica(src: string): boolean {
  return src.startsWith("/biblioteca/portadas/") || src.startsWith("/biblioteca/portada/");
}
