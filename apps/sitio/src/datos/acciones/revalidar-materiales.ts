import { revalidatePath } from "next/cache";

// Qué se regenera cuando un material cambia (SPEC §7 de `work/biblioteca/`).
// No es una Server Action: la llaman las acciones de materiales.ts y
// ciclo-de-materiales.ts, después de escribir.

/** Las pantallas del admin que lo listan: la lista, sus filtros y la ficha. */
export function refrescarAdmin(): void {
  revalidatePath("/admin/biblioteca", "layout");
}

/**
 * Lo que el sitio muestra de un material: la Biblioteca (el catálogo y los
 * destacados), el Inicio (los destacados), Quiénes somos (las publicaciones
 * de los perfiles: work/equipo/SPEC.md §8.1), su portada generada y la ficha
 * de cada novedad que lo abre. Las páginas son estáticas: esto las regenera en
 * la próxima visita (spec del admin §4).
 */
export function revalidarSitio(id: string, novedades: readonly string[]): void {
  refrescarAdmin();
  for (const ruta of ["/", "/biblioteca", "/quienes-somos", `/biblioteca/portada/${id}`]) revalidatePath(ruta);
  for (const slug of novedades) revalidatePath(`/novedades/${slug}`);
}
