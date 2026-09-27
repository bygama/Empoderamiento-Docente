import { COMPOSICIONES, type Composicion } from "@/features/quienes-somos/contenido/modelo-del-equipo";

// Qué usa cada composición de una etapa (SPEC §4.1.1 de `work/equipo/`): el
// formulario muestra solo eso. Lo que una composición no usa se guarda igual
// y el sitio no lo lee, así cambiar de composición no borra nada.

type Uso = { etiqueta: string; cita?: true; hitos?: "simples" | "con-principal"; ramas?: true; territorios?: true; publicaciones?: true };

export const COMPOSICION: Record<Composicion, Uso> = {
  editorial: { etiqueta: "Editorial · el título grande, el texto y una lista mínima", hitos: "simples" },
  ficha: { etiqueta: "Ficha · los títulos en un panel y las estancias al costado", hitos: "simples", ramas: true },
  concepto: { etiqueta: "Concepto · una cita destacada, una línea sostenida y una pieza", cita: true, hitos: "simples", publicaciones: true },
  hitos: { etiqueta: "Hitos · uno o dos principales y el resto en renglones", hitos: "con-principal" },
  mapa: { etiqueta: "Mapa · los territorios, sueltos", territorios: true },
  ramas: { etiqueta: "Ramas · las publicaciones colgando del camino", publicaciones: true },
  sintesis: { etiqueta: "Síntesis · el rol principal y lo que hace en paralelo", hitos: "con-principal" },
};

/** Lo que usa una composición; sin elegir, nada más que lo común. */
export function usoDe(composicion: string): Uso | null {
  const elegida = COMPOSICIONES.find((c) => c === composicion);
  return elegida ? COMPOSICION[elegida] : null;
}
