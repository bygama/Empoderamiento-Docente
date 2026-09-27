import type { Lectura, Lecturas } from "./comun";

/** Lo de un material lleva a su ficha, si todavía existe. */
const alMaterial: Lectura = {
  modulo: "biblioteca",
  pantalla: (id, existen) => (existen.materiales.has(id) ? { href: `/admin/biblioteca/${id}`, que: "Ver el material" } : null),
};

export const DE_LA_BIBLIOTECA = {
  "agrego-un-material": alMaterial,
  "publico-un-material": alMaterial,
  "oculto-un-material": alMaterial,
  "descarto-cambios-de-un-material": alMaterial,
  "borro-un-material": alMaterial,
} satisfies Lecturas;
