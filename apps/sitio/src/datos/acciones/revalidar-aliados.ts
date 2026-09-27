import { revalidatePath } from "next/cache";

// Qué se regenera cuando un aliado cambia (`work/casos-aliados-fotos/SPEC.md`
// §8). No es una Server Action: la llaman las de aliados.ts y
// ciclo-de-aliados.ts, después de escribir.

/** Las pantallas del admin que lo muestran: la lista, la ficha y el índice de Contenido. */
export function refrescarAdminDeAliados(): void {
  revalidatePath("/admin/contenido", "layout");
}

/** La tira va en el pie de todas las páginas: el layout del sitio entero, y con él el Inicio y Qué hacemos. */
export function revalidarTira(): void {
  refrescarAdminDeAliados();
  revalidatePath("/", "layout");
}
