// Lo que va a tener cada módulo del admin que todavía no existe, sacado del
// mapa del admin aprobado el 2026-09-23. Cada entrada del menú lleva a su
// guía hasta que el módulo se construye: ese día su entrada sale de acá y la
// ruta pasa a ser la pantalla de verdad. Cuando no quede ninguna, esta
// carpeta se borra.

export type Pantalla = {
  nombre: string;
  ruta: string;
  que: string;
  /** Si ya existe en otro lado, adónde está hoy. */
  hoy?: { href: string; etiqueta: string };
};

export type Guia = { nombre: string; para: string; pantallas: readonly Pantalla[] };

const GUIAS: Record<string, Guia> = {
  novedades: {
    nombre: "Novedades",
    para: "Lo que se publica con fecha: las noticias de ED.",
    pantallas: [
      { nombre: "Lista de novedades", ruta: "/admin/novedades", que: "Borradores y publicadas, con buscador y la destacada marcada." },
      { nombre: "Nueva novedad", ruta: "/admin/novedades/nueva", que: "Crea el borrador y abre su ficha." },
      { nombre: "Ficha de una novedad", ruta: "/admin/novedades/[id]", que: "Título, bajada, categoría, imagen y cuerpo, con la vista previa en Google y en redes." },
      { nombre: "Feed de novedades", ruta: "/novedades/rss.xml", que: "En el sitio público, para quien siga las novedades con un lector." },
    ],
  },
  biblioteca: {
    nombre: "Biblioteca",
    para: "Los 63 materiales, que llevan a la revista o a la editorial.",
    pantallas: [
      { nombre: "Lista de materiales", ruta: "/admin/biblioteca", que: "Buscador, filtros por tipo y por estado, consultas del mes y links rotos." },
      { nombre: "Agregar material", ruta: "/admin/biblioteca/nuevo", que: "Se pega un DOI, un ISBN o un link y el formulario se completa solo." },
      { nombre: "Ficha de un material", ruta: "/admin/biblioteca/[id]", que: "Autores vinculados al Equipo, cita APA y el último chequeo del link." },
    ],
  },
  cuentas: {
    nombre: "Cuentas",
    para: "Quién entra al admin y qué puede hacer. Solo para quien dirige y quien administra.",
    pantallas: [
      { nombre: "Personas", ruta: "/admin/cuentas", que: "Qué puede cada rol y la lista de cuentas, con su último acceso y su estado." },
      { nombre: "Invitar", ruta: "/admin/cuentas/invitar", que: "Correo, nombre y rol. Llega «Elegí tu contraseña», que vence a las 72 horas." },
      { nombre: "Una cuenta", ruta: "/admin/cuentas/[id]", que: "Cambiar el rol, cerrar sus sesiones o suspenderla en vez de borrarla." },
      { nombre: "Actividad", ruta: "/admin/cuentas/actividad", que: "Quién hizo qué y cuándo, durante 12 meses." },
    ],
  },
  ajustes: {
    nombre: "Ajustes",
    para: "Lo que se configura una vez. Solo para quien dirige y quien administra.",
    pantallas: [
      { nombre: "Datos del sitio", ruta: "/admin/ajustes/sitio", que: "Correo, teléfono, dirección, países y redes: lo que hoy vive en el código." },
      { nombre: "SEO", ruta: "/admin/ajustes/seo", que: "Las redirecciones, la indexación según Search Console y el sitemap." },
      { nombre: "Avisos", ruta: "/admin/ajustes/avisos", que: "Quién recibe el mail de cada contacto y de cada CV." },
      { nombre: "Privacidad", ruta: "/admin/ajustes/privacidad", que: "Los plazos de retención: CV 12 meses, Contacto 24 y Spam 30 días." },
      { nombre: "Conexiones", ruta: "/admin/ajustes/conexiones", que: "El estado de Vercel Analytics, Search Console, Resend y Blob." },
    ],
  },
};

/** La guía de un módulo, o `undefined` si esa clave no es un módulo por hacer. */
export function guiaDe(modulo: string): Guia | undefined {
  return Object.hasOwn(GUIAS, modulo) ? GUIAS[modulo] : undefined;
}
