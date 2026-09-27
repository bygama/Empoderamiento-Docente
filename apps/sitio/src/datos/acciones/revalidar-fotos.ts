import { revalidatePath } from "next/cache";
import type { Regenerar } from "@/datos/fotos/uso";

// Qué se regenera cuando una foto cambia (`work/casos-aliados-fotos/SPEC.md`
// §8). No es una Server Action: la llaman las acciones de fotos.ts, después
// de escribir.

/** Las pantallas del admin que la muestran: la grilla, la ficha, y el índice y el Inicio que cuentan las sin alt. */
export function refrescarAdminDeFotos(): void {
  revalidatePath("/admin/contenido", "layout");
  revalidatePath("/admin");
}

/** Lo que cada módulo dijo que muestra la foto en el sitio. */
export function regenerarSitio(regenerar: readonly Regenerar[]): void {
  refrescarAdminDeFotos();
  for (const { ruta, layout } of regenerar) revalidatePath(ruta, layout ? "layout" : "page");
}
