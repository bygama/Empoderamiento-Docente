import type { z } from "zod";

// El documento de una página es `{ [seccion]: contenido }` (SPEC §4.3). Acá
// se completa y se valida contra el registro; no sabe de la base ni de ED.

export type SeccionRegistrada = { nombre: string; esquema: z.ZodType; inicial: unknown };
export type PaginaRegistrada = { ruta: string; nombre: string; secciones: Record<string, SeccionRegistrada> };
export type RegistroDePaginas = Record<string, PaginaRegistrada>;

/** Lo que hay en una columna Json, leído como documento: un objeto por sección, o nada. */
export function comoDocumento(json: unknown): Record<string, unknown> {
  // El `as` solo dice que un objeto que no es array se puede recorrer por clave; los valores siguen siendo unknown.
  return json !== null && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
}

/**
 * El contenido completo de una página: cada sección del registro, validada
 * contra su esquema. La que falta o no pasa vuelve al contenido inicial y se
 * avisa: la base puede traer un documento viejo si el esquema cambió, y el
 * sitio no se rompe por eso (SPEC §4.2).
 */
export function completarPagina(
  pagina: PaginaRegistrada,
  documento: Record<string, unknown>,
  avisar: (mensaje: string) => void = console.warn,
): Record<string, unknown> {
  const completo: Record<string, unknown> = {};
  for (const [clave, seccion] of Object.entries(pagina.secciones)) {
    if (!(clave in documento)) {
      completo[clave] = seccion.inicial;
      continue;
    }
    const valido = seccion.esquema.safeParse(documento[clave]);
    if (valido.success) {
      completo[clave] = valido.data;
    } else {
      avisar(`La sección «${seccion.nombre}» de ${pagina.nombre} no pasa su esquema; se muestra el contenido inicial.`);
      completo[clave] = seccion.inicial;
    }
  }
  return completo;
}
