import { cuentaDeFotos } from "@/datos/consultas/fotos";

// Lo que el Inicio lee de la tabla `fotos` (SPEC de `work/casos-aliados-fotos/`
// §9): las que no tienen texto alternativo, con la misma vara que el filtro de
// la grilla.

/** «2 fotos sin texto alternativo», con lo que eso cuesta, o `null` si no hay ninguna. Pura: se prueba sin base. */
export function filaDeFotosSinAlt(cuantas: number): { titulo: string; detalle: string } | null {
  if (!cuantas) return null;
  if (cuantas === 1) return { titulo: "1 foto sin texto alternativo", detalle: "Un lector de pantalla no puede decir qué muestra." };
  return { titulo: `${cuantas} fotos sin texto alternativo`, detalle: "Un lector de pantalla no puede decir qué muestran." };
}

export async function fotosSinAlt(): Promise<{ titulo: string; detalle: string } | null> {
  return filaDeFotosSinAlt((await cuentaDeFotos()).sinAlt);
}
