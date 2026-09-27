import { cookies, draftMode } from "next/headers";

// Encender la vista previa (el Draft Mode de Next) para quien edita. Lo usan
// las acciones de las páginas y de las novedades, que antes chequean la
// sesión y la capacidad. No es una Server Action a propósito: si lo fuera, el
// navegador podría encenderla sin sesión.

/** La cookie que pone `draftMode().enable()`: el nombre es de Next y no lo exporta. */
const COOKIE_DE_VISTA_PREVIA = "__prerender_bypass";

/**
 * Enciende el Draft Mode y acota su cookie. Next la pone sin vencimiento (dura
 * lo que dure el navegador, que con «restaurar pestañas» es para siempre) y
 * con `SameSite=None`: se reescribe con el mismo valor para que venza en una
 * hora y no viaje en pedidos de otros sitios. `Lax` alcanza, porque la vista
 * previa se abre con un link del admin.
 */
export async function encenderVistaPrevia(): Promise<void> {
  (await draftMode()).enable();
  const galletas = await cookies();
  const puesta = galletas.get(COOKIE_DE_VISTA_PREVIA);
  if (!puesta) return;
  galletas.set(COOKIE_DE_VISTA_PREVIA, puesta.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}
