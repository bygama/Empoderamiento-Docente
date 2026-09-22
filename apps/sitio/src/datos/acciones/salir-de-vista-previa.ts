"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { RUTAS_INTERNAS } from "@/config/nav";

// Está separada de vista-previa.ts porque la importa el layout del sitio, y
// todo lo que alcanza app/(sitio)/ tiene que poder cargarse sin base: un
// import de datos/auth acá armaría el cliente de Prisma en cada render de la
// home y el sitio dejaría de compilar y de correr sin DATABASE_URL.

/** ¿La ruta es una del sitio, o cuelga de una (`/novedades/algo`)? Nunca se redirige a lo que llegó tal cual. */
function rutaDelSitio(ruta: string): boolean {
  return RUTAS_INTERNAS.some((conocida) => ruta === conocida || (conocida !== "/" && ruta.startsWith(`${conocida}/`)));
}

/**
 * Deshabilita el Draft Mode y vuelve al sitio publicado, en la misma página.
 * Sin sesión a propósito: la cookie es de quien la tiene, y quien ya salió del
 * admin también tiene que poder salir del borrador.
 */
export async function salirDeVistaPrevia(datos: FormData): Promise<void> {
  (await draftMode()).disable();
  const ruta = datos.get("ruta");
  redirect(typeof ruta === "string" && rutaDelSitio(ruta) ? ruta : "/");
}

/**
 * Apaga el Draft Mode sin redirigir. La llama «Salir» del admin antes de
 * cerrar la sesión: la cookie no vence sola, y quien sale del admin no tiene
 * que seguir viendo borradores en el sitio. Sin sesión por el mismo motivo
 * que `salirDeVistaPrevia`.
 */
export async function apagarVistaPrevia(): Promise<void> {
  (await draftMode()).disable();
}
