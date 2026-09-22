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

/**
 * El valor de una clave PROPIA del registro, o undefined si no está. Un
 * `registro[clave]` a secas deja pasar `"__proto__"`, `"constructor"` y
 * similares como si fueran una página o sección real (resuelven al
 * prototipo del objeto, que existe pero no tiene `secciones` ni `esquema`,
 * y el código de quien llama tira en vez de contestar en llano);
 * `Object.hasOwn` corta eso antes de indexar.
 */
export function propioDe<T>(registro: Record<string, T>, clave: string): T | undefined {
  return Object.hasOwn(registro, clave) ? registro[clave] : undefined;
}

/** El primer problema de Zod, en llano y con el camino al campo. */
export function primerProblema(error: z.ZodError): string {
  const [problema] = error.issues;
  const donde = problema && problema.path.length > 0 ? ` (en ${problema.path.map(String).join(" › ")})` : "";
  return `${problema?.message ?? "Hay un dato que no pasa."}${donde}`;
}
