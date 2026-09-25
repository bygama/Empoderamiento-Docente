// El tema del admin: claro, mixto (la sidebar en el azul de la marca) u
// oscuro, guardado en una cookie para que el servidor lo dibuje bien de
// entrada, sin un parpadeo al cargar. Lo lee el layout protegido y lo escribe
// el selector del menú de la cuenta. Los valores de cada tema, en globals.css.

export const TEMAS = ["claro", "mixto", "oscuro"] as const;
export type Tema = (typeof TEMAS)[number];

/** El de fábrica: el que ve quien nunca eligió. */
export const TEMA_POR_DEFECTO: Tema = "mixto";

export const COOKIE_DEL_TEMA = "tema-del-admin";

/** Un año: es una preferencia, no una sesión. */
export const DURACION_DEL_TEMA = 60 * 60 * 24 * 365;

/** Una cookie ausente o adulterada vale el tema de fábrica. */
export function temaDe(valor: string | undefined): Tema {
  return TEMAS.find((t) => t === valor) ?? TEMA_POR_DEFECTO;
}
