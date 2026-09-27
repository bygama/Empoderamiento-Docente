import { COLORES } from "@/features/quienes-somos/contenido/modelo-del-equipo";

// Los acentos de una etapa o de una categoría, como se eligen en el
// formulario: dichos por lo que significan (DESIGN.md: el color es un acento,
// nunca un fondo, y el naranja va poco).

export const OPCIONES_DE_COLOR = [
  { valor: "verde", etiqueta: "Verde · el aula, los conceptos" },
  { valor: "azul", etiqueta: "Azul · la investigación" },
  { valor: "naranja", etiqueta: "Naranja · la transformación (poco)" },
] as const;

/** El color elegido, con su tipo, o vacío si no es uno de los tres. */
export const colorDe = (v: string) => COLORES.find((c) => c === v) ?? "";
