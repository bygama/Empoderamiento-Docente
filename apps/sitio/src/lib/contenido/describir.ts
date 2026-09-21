import { z } from "zod";
import { metaDe } from "./campos";
import { humanizar, type Descripcion } from "./descripcion";

/**
 * Recorre un esquema y devuelve lo que el admin necesita para dibujar el
 * formulario (SPEC §4.1: el formulario sale del esquema; excepción acotada a
 * AGENTS.md §12, ver «Lo que este plan fija», 9). Lo que no salió de
 * `campos.ts` —salvo un `z.object` pelado, que es un grupo, y un `.nullable()`
 * / `.optional()` / `.nullish()`, que son un opcional— no se sabe dibujar y
 * tira: mejor romper en desarrollo que mostrar un campo mudo.
 *
 * Los `as z.ZodType` de abajo: Zod tipa a los hijos (`element`, `unwrap()`,
 * los valores de `shape`) como `SomeType`, la interfaz mínima de su núcleo;
 * para nosotros son esquemas más, y así los trata la recursión.
 */
export function describir(esquema: z.ZodType, etiquetaPorDefecto = ""): Descripcion {
  const meta = metaDe(esquema);
  const etiqueta = meta?.etiqueta ?? etiquetaPorDefecto;
  // Sin la clave cuando no hay ayuda: así el árbol se compara entero en los tests.
  const base = meta?.ayuda === undefined ? { etiqueta } : { etiqueta, ayuda: meta.ayuda };

  if (meta?.tipo === "textoCorto" || meta?.tipo === "parrafo") return { ...base, tipo: meta.tipo, maximo: meta.maximo };
  if (meta?.tipo === "foto") return { ...base, tipo: "foto" };
  if (meta?.tipo === "rutaInterna") {
    if (!(esquema instanceof z.ZodEnum)) throw new Error("rutaInterna tiene que ser un z.enum");
    return { ...base, tipo: "rutaInterna", opciones: esquema.options.map(String) };
  }
  if (meta?.tipo === "listaFija") {
    if (!(esquema instanceof z.ZodArray)) throw new Error("listaFija tiene que ser un z.array");
    return { ...base, tipo: "listaFija", cantidad: meta.cantidad, item: describir(esquema.element as z.ZodType, meta.etiquetaDelItem ?? "Ítem") };
  }
  if (esquema instanceof z.ZodNullable || esquema instanceof z.ZodOptional) {
    // .nullish() es optional(nullable(x)): dos envoltorios para un solo interior.
    // Los sacamos todos los que haga falta para que .nullable(), .optional() y
    // .nullish() den el mismo nodo "opcional", sin anidarlo dos veces.
    let interior = esquema.unwrap() as z.ZodType;
    while (interior instanceof z.ZodNullable || interior instanceof z.ZodOptional) interior = interior.unwrap() as z.ZodType;
    return { etiqueta, tipo: "opcional", de: describir(interior, etiqueta) };
  }
  if (esquema instanceof z.ZodObject) {
    return {
      ...base,
      tipo: "grupo",
      campos: Object.entries(esquema.shape).map(([clave, sub]) => ({ clave, descripcion: describir(sub as z.ZodType, humanizar(clave)) })),
    };
  }
  throw new Error(`No sé dibujar un campo «${esquema.def.type}» (${etiqueta || "sin etiqueta"}).`);
}
