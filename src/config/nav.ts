/**
 * Navegación principal del sitio.
 *
 * "Inicio" NO va como link de texto: el LOGO es el acceso a Inicio (cliqueable).
 * "Contacto" se rinde como CTA (naranja), no como link de texto, para respetar
 * la regla del manual (naranja solo en acciones).
 *
 * SUBMENÚS (decisión de ED, 2026-09-08). Cada página, salvo Inicio y
 * Contacto, despliega un menú con DESTINOS con nombre propio: lo que alguien
 * que usa el sitio todos los días busca en un clic desde cualquier página,
 * sin recorrer las escenas que hay antes. No es el índice de la página (para
 * eso está la columna del borde derecho, IndicePagina): son pocos ítems, los
 * que se buscan, no cada capítulo. Menos es más.
 *
 * El `href` de cada ítem es una URL completa (`/pagina#seccion` o
 * `/pagina?filtro=x#seccion`): así sirve igual desde otra página (navega y
 * aterriza, ver lib/navegar.ts) y desde la misma (corta directo). El `#id`
 * tiene que ser el `id` real de la sección en su componente.
 */
export type NavSubItem = { label: string; href: string };
export type NavItem = {
  label: string;
  href: string;
  submenu?: readonly NavSubItem[];
};

export const NAV_LINKS: readonly NavItem[] = [
  {
    label: "Qué hacemos",
    href: "/que-hacemos",
    // Las secciones reales de la página (ids de sus componentes): el
    // "enfoque" que se pensó primero no existe acá (vive en Quiénes somos).
    submenu: [
      { label: "Cómo trabajamos", href: "/que-hacemos#como-trabajamos" },
      { label: "Áreas", href: "/que-hacemos#areas" },
      { label: "Niveles", href: "/que-hacemos#niveles" },
      { label: "Proyectos", href: "/que-hacemos#proyectos" },
    ],
  },
  {
    label: "Quiénes somos",
    href: "/quienes-somos",
    // ED es una idea, no un grupo de personas: el menú no lista nombres.
    submenu: [
      { label: "Origen", href: "/quienes-somos#origen" },
      { label: "Nuestra mirada", href: "/quienes-somos#mirada" },
      { label: "Quiénes sostienen ED", href: "/quienes-somos#equipo" },
    ],
  },
  {
    label: "Investigación",
    href: "/investigacion",
    // Por secciones, y al final los casos (la página va a cambiar: esta
    // lista se ajusta con ella, es solo data).
    submenu: [
      { label: "Por qué investigamos", href: "/investigacion#sentido" },
      { label: "Líneas de investigación", href: "/investigacion#lineas" },
      { label: "Ciclo y evidencia", href: "/investigacion#ciclo" },
      { label: "Casos de investigación", href: "/investigacion#en-accion" },
    ],
  },
  {
    label: "Biblioteca",
    href: "/biblioteca",
    // Los tipos de material llegan con el filtro del catálogo ya aplicado
    // (MaterialesListado lee `?tipo=` de la URL). Los valores son los de
    // TIPOS en features/biblioteca/data/materiales.ts.
    submenu: [
      { label: "Destacados", href: "/biblioteca#destacados" },
      { label: "Artículos", href: "/biblioteca?tipo=Art%C3%ADculos#materiales" },
      { label: "Capítulos de libro", href: "/biblioteca?tipo=Cap%C3%ADtulos%20de%20libro#materiales" },
      { label: "Libros", href: "/biblioteca?tipo=Libros#materiales" },
      { label: "Tesis", href: "/biblioteca?tipo=Tesis#materiales" },
      { label: "Actas de congreso", href: "/biblioteca?tipo=Actas%20de%20congreso#materiales" },
      { label: "Divulgación", href: "/biblioteca?tipo=Divulgaci%C3%B3n#materiales" },
      { label: "Materiales", href: "/biblioteca?tipo=Materiales#materiales" },
    ],
  },
  {
    label: "Novedades",
    href: "/novedades",
    submenu: [
      { label: "Destacadas", href: "/novedades#destacado" },
      { label: "Últimas", href: "/novedades#ultimas" },
    ],
  },
];

export const CTA_LINK = { label: "Contacto", href: "/contacto" } as const;
export const HOME_LINK = { label: "Inicio", href: "/" } as const;

/** ¿`pathname` está dentro de la página de este ítem? (activo de nivel 1) */
export function esPaginaActiva(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
