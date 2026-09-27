import type { Descripcion } from "./descripcion";
import { posicionDelFoco, type Foco } from "./fotos";

// «Qué cambió» (SPEC §4 de `work/paginas-inicio/`): una sección antes y
// después, campo por campo, con las etiquetas del formulario. Recorre la misma
// `Descripcion` que dibuja el formulario, así lo que se compara es lo que se
// edita. Sin Zod ni ED: la lee el servidor y el resultado viaja como JSON.

/** Un valor como se muestra: un texto, una foto (archivo, alt y foco) o nada. */
export type Legible = { tipo: "texto"; texto: string } | { tipo: "foto"; src: string; alt: string; foco: string } | { tipo: "nada" };

/** Un campo que cambió: dónde, en etiquetas, y cómo estaba y cómo queda. */
export type Diferencia = { donde: string[]; antes: Legible; despues: Legible };

type Objeto = Record<string, unknown>;
const esObjeto = (v: unknown): v is Objeto => typeof v === "object" && v !== null;
const campo = (v: unknown, clave: string) => (esObjeto(v) ? v[clave] : undefined);
const item = (v: unknown, i: number) => (Array.isArray(v) ? v[i] : undefined);

/**
 * Igualdad profunda, sin mirar el orden de las claves: el mismo contenido
 * guardado dos veces no es un cambio. La usa también «Cambios sin guardar» de
 * la ficha de un caso y de un aliado (el `jsonb` guarda las claves en su orden).
 */
export function igual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!esObjeto(a) || !esObjeto(b) || Array.isArray(a) !== Array.isArray(b)) return false;
  const claves = Object.keys(a);
  return claves.length === Object.keys(b).length && claves.every((k) => igual(a[k], b[k]));
}

/** Lo que se ve de un valor: los textos de un grupo o una lista juntos, una foto con su alt y su foco. */
function legibleDe(d: Descripcion, v: unknown): Legible {
  if (v === null || v === undefined) return { tipo: "nada" };
  if (d.tipo === "foto") {
    const src = campo(v, "src");
    if (typeof src !== "string" || src === "") return { tipo: "nada" };
    const foco = campo(v, "foco");
    // El `as`: un foco guardado salió del esquema de foto(), que lo valida como { x, y }.
    return { tipo: "foto", src, alt: String(campo(v, "alt") ?? ""), foco: esObjeto(foco) ? posicionDelFoco(foco as Foco) : "50% 50%" };
  }
  if (d.tipo === "opcional") return legibleDe(d.de, v);
  if (d.tipo === "grupo" || d.tipo === "listaFija") {
    const partes = d.tipo === "grupo" ? d.campos.map((c) => legibleDe(c.descripcion, campo(v, c.clave))) : Array.from({ length: d.cantidad }, (_, i) => legibleDe(d.item, item(v, i)));
    const textos = partes.flatMap((p) => (p.tipo === "texto" ? [p.texto] : []));
    return textos.length > 0 ? { tipo: "texto", texto: textos.join(" · ") } : { tipo: "nada" };
  }
  return typeof v === "string" && v !== "" ? { tipo: "texto", texto: v } : { tipo: "nada" };
}

/**
 * Las diferencias entre dos valores de una sección, hoja por hoja. Un grupo o
 * una lista se abren campo por campo («Tarjeta 3 › Foto»); un opcional que
 * aparece o se va es una sola diferencia contra «nada»; una foto se compara
 * entera. `donde` arranca vacío: el nombre de la sección lo pone quien llama.
 */
export function compararSeccion(d: Descripcion, antes: unknown, despues: unknown, donde: string[] = []): Diferencia[] {
  if (igual(antes, despues)) return [];
  switch (d.tipo) {
    case "grupo":
      return d.campos.flatMap((c) => compararSeccion(c.descripcion, campo(antes, c.clave), campo(despues, c.clave), [...donde, c.descripcion.etiqueta]));
    case "listaFija":
      return Array.from({ length: d.cantidad }, (_, i) => compararSeccion(d.item, item(antes, i), item(despues, i), [...donde, `${d.item.etiqueta} ${i + 1}`])).flat();
    case "opcional":
      if (antes === null || antes === undefined || despues === null || despues === undefined) {
        return [{ donde, antes: legibleDe(d, antes), despues: legibleDe(d, despues) }];
      }
      return compararSeccion(d.de, antes, despues, donde);
    default:
      return [{ donde, antes: legibleDe(d, antes), despues: legibleDe(d, despues) }];
  }
}
