import type { Lectura, Lecturas } from "./comun";

/** Lo de un perfil del Equipo lleva a su ficha, si todavía existe. */
const alPerfil: Lectura = {
  modulo: "contenido",
  pantalla: (id, existen) => (existen.perfiles.has(id) ? { href: `/admin/contenido/equipo/${id}`, que: "Ver el perfil" } : null),
};

export const DEL_EQUIPO = {
  "publico-un-perfil": alPerfil,
  "despublico-un-perfil": alPerfil,
  "descarto-cambios-de-un-perfil": alPerfil,
  // Borrado, el perfil ya no tiene ficha.
  "borro-un-perfil": { modulo: "contenido" },
  "movio-un-perfil": alPerfil,
} satisfies Lecturas;
