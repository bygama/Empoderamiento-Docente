import { revalidatePath } from "next/cache";

// Qué se regenera cuando una novedad cambia (SPEC §7.3 de
// `work/novedades-y-kit/`). No es una Server Action: la llaman las acciones de
// novedades.ts y ciclo-de-novedades.ts, después de escribir.

/** Las pantallas del admin que la listan: la lista, sus pestañas y la ficha. */
export function refrescarAdmin(): void {
  revalidatePath("/admin/novedades", "layout");
}

/**
 * Lo que el sitio muestra de una novedad: el Inicio (las cuatro más nuevas),
 * el listado, el RSS, y la ficha con su imagen, con el slug viejo y el nuevo
 * si cambió. Las páginas son estáticas: esto las regenera en la próxima
 * visita (spec del admin §4).
 */
export function revalidarSitio(slugs: readonly string[]): void {
  refrescarAdmin();
  for (const ruta of ["/", "/novedades", "/novedades/rss.xml"]) revalidatePath(ruta);
  for (const slug of slugs) {
    revalidatePath(`/novedades/${slug}`);
    revalidatePath(`/novedades/${slug}/imagen-para-redes`);
  }
}
