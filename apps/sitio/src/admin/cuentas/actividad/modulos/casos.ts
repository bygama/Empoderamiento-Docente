import type { Lectura, Lecturas } from "./comun";

/** Un caso no se borra (son siempre cuatro): lleva siempre a su editor. */
const deUnCaso: Lectura = { modulo: "contenido", pantalla: (id) => ({ href: `/admin/contenido/casos/${id}`, que: "Ver el caso" }) };

export const DE_LOS_CASOS = {
  "publico-un-caso": deUnCaso,
  "descarto-cambios-de-un-caso": deUnCaso,
} satisfies Lecturas;
