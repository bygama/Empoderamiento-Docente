import { revalidatePath } from "next/cache";

// Qué se regenera cuando un perfil del Equipo cambia (SPEC §8.1 de
// `work/equipo/`). No es una Server Action: la llaman las acciones de
// equipo.ts y ciclo-de-equipo.ts, después de escribir.

/** Las pantallas del admin que lo muestran: Contenido (la tarjeta del índice, la lista y la ficha). */
export function refrescarAdmin(): void {
  revalidatePath("/admin/contenido", "layout");
}

/** Lo que el sitio muestra del equipo: Quiénes somos, la tarjeta y el perfil de cada persona. Es estática: esto la regenera en la próxima visita. */
export function revalidarSitio(): void {
  refrescarAdmin();
  revalidatePath("/quienes-somos");
}
