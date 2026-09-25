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
  contenido: {
    nombre: "Contenido",
    para: "Los textos y las fotos del sitio que no se publican por fecha.",
    pantallas: [
      { nombre: "Páginas", ruta: "/admin/contenido/paginas", que: "Las siete páginas con su estado, y el editor por secciones con borrador, vista previa y publicar.", hoy: { href: "/admin/paginas", etiqueta: "Abrir Páginas" } },
      { nombre: "Casos", ruta: "/admin/contenido/casos", que: "Los cuatro casos de investigación. Se editan, pero no se crean ni se borran." },
      { nombre: "Equipo", ruta: "/admin/contenido/equipo", que: "Los 15 perfiles, en el orden que se arrastre, con sus etapas y sus publicaciones de la Biblioteca." },
      { nombre: "Aliados", ruta: "/admin/contenido/aliados", que: "Los logos. Sin la marca «Autorizado», que ponen quien dirige o quien administra, un logo no se publica." },
      { nombre: "Fotos", ruta: "/admin/contenido/fotos", que: "Todas las fotos, con su texto alternativo y dónde se usa cada una." },
    ],
  },
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
  mensajes: {
    nombre: "Mensajes",
    para: "Lo que llega por los formularios del sitio.",
    pantallas: [
      { nombre: "Contacto", ruta: "/admin/mensajes/contacto", que: "Nuevo, En curso, Cerrado y Spam, con «Lo tomo yo» y «Responder» por mail." },
      { nombre: "Un mensaje", ruta: "/admin/mensajes/contacto/[id]", que: "Los datos, el mensaje, el estado y cuándo se borra: a los 24 meses." },
      { nombre: "CV de docentes", ruta: "/admin/mensajes/cv", que: "Igual que Contacto, con el archivo privado. Solo lo ven quien dirige y quien administra." },
      { nombre: "Un CV", ruta: "/admin/mensajes/cv/[id]", que: "El archivo no tiene URL pública y se borra a los 12 meses." },
    ],
  },
  metricas: {
    nombre: "Métricas",
    para: "Todo dato gratis y legal, sin cookies. Nunca se identifica a una persona ni a una institución.",
    pantallas: [
      { nombre: "Resumen", ruta: "/admin/metricas", que: "Visitas contra el período anterior, la curva con marcas, los canales y las páginas más vistas.", hoy: { href: "/admin", etiqueta: "Hoy, en el Inicio" } },
      { nombre: "Búsquedas", ruta: "/admin/metricas/busquedas", que: "Qué buscó la gente en Google para llegar, desde Search Console." },
      { nombre: "Origen", ruta: "/admin/metricas/origen", que: "Países, regiones, referidos, dispositivos y la mejor hora para publicar." },
      { nombre: "Qué hace la gente", ruta: "/admin/metricas/acciones", que: "Los materiales más consultados, el camino hasta enviar un CV y los contactos." },
      { nombre: "Links para compartir", ruta: "/admin/metricas/enlaces", que: "Links cortos propios (/l/…) para saber qué posteo trajo gente." },
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
  "mi-cuenta": {
    nombre: "Mi cuenta",
    para: "Tus datos, tu contraseña y dónde tenés abierto el admin.",
    pantallas: [
      { nombre: "Perfil", ruta: "/admin/mi-cuenta#perfil", que: "Nombre y correo. La contraseña se cambia pidiendo la actual." },
      { nombre: "Tu rol", ruta: "/admin/mi-cuenta#rol", que: "Qué podés hacer, en una frase." },
      { nombre: "Sesiones", ruta: "/admin/mi-cuenta#sesiones", que: "Dónde tenés el admin abierto, con «Cerrar las demás»." },
      { nombre: "Avisos", ruta: "/admin/mi-cuenta#avisos", que: "Qué mails recibís: mensajes nuevos y el resumen semanal." },
      { nombre: "Seguridad", ruta: "/admin/mi-cuenta#seguridad", que: "El segundo factor por mail, obligatorio para quien dirige y quien administra." },
    ],
  },
};

/** La guía de un módulo, o `undefined` si esa clave no es un módulo por hacer. */
export function guiaDe(modulo: string): Guia | undefined {
  return Object.hasOwn(GUIAS, modulo) ? GUIAS[modulo] : undefined;
}
