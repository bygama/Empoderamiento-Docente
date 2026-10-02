import { esIdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import type { Lectura, Lecturas } from "./comun";

/**
 * Un caso no se borra desde el admin: lleva a su editor mientras siga entre
 * los fijos. El 02 y el 03 salieron por migración (2026-10-01): lo que se
 * anotó de ellos queda, pero ya no tiene ficha adonde llevar.
 */
const deUnCaso: Lectura = {
  modulo: "contenido",
  pantalla: (id) => (esIdDeCaso(id) ? { href: `/admin/contenido/casos/${id}`, que: "Ver el caso" } : null),
};

export const DE_LOS_CASOS = {
  "publico-un-caso": deUnCaso,
  "descarto-cambios-de-un-caso": deUnCaso,
} satisfies Lecturas;
