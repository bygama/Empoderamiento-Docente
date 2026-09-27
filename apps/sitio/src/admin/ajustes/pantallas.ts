// Las cinco pantallas de Ajustes (SPEC padre §5.9), en el orden de las
// tarjetas del índice. Ajustes no lleva pestañas: abre con el índice y cada
// pantalla vuelve con «← Ajustes» (SPEC padre §6).

export const AJUSTES = {
  nombre: "Ajustes",
  href: "/admin/ajustes",
  para: "Lo que se configura una vez. Solo para quien dirige y quien administra.",
} as const;

export type ClaveDeAjustes = "sitio" | "seo" | "avisos" | "privacidad" | "conexiones";

export type PantallaDeAjustes = {
  clave: ClaveDeAjustes;
  nombre: string;
  href: string;
  /** Qué es, en una línea: la tarjeta del índice. */
  que: string;
};

export const PANTALLAS_DE_AJUSTES: readonly PantallaDeAjustes[] = [
  { clave: "sitio", nombre: "Datos del sitio", href: "/admin/ajustes/sitio", que: "El correo, el WhatsApp, la oficina, los países y las redes que muestra el sitio." },
  { clave: "seo", nombre: "SEO", href: "/admin/ajustes/seo", que: "Las redirecciones, si cada página está en Google y el sitemap." },
  { clave: "avisos", nombre: "Avisos", href: "/admin/ajustes/avisos", que: "Quién recibe un correo con cada mensaje de Contacto y con cada CV." },
  { clave: "privacidad", nombre: "Privacidad", href: "/admin/ajustes/privacidad", que: "Cuánto se guarda lo que llega por los formularios del sitio." },
  { clave: "conexiones", nombre: "Conexiones", href: "/admin/ajustes/conexiones", que: "Vercel Analytics, Search Console, Resend y Blob: si están y cómo anduvieron." },
];

/** «← Ajustes», para cada pantalla. */
export const VOLVER_A_AJUSTES = { href: AJUSTES.href, etiqueta: AJUSTES.nombre };
