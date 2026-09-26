// Las cinco pantallas de Contenido (SPEC padre §5.3), en el orden de sus
// pestañas y de las tarjetas del índice. Una sola lista para las dos: así una
// pestaña y su tarjeta no pueden decir cosas distintas.

export const CONTENIDO = {
  nombre: "Contenido",
  para: "Los textos y las fotos del sitio que no se publican por fecha.",
};

export type PantallaDeContenido = {
  clave: "paginas" | "casos" | "equipo" | "aliados" | "fotos";
  nombre: string;
  href: string;
  /** Qué es, en una línea: la tarjeta del índice y el detalle de su pantalla. */
  que: string;
};

export const PANTALLAS_DE_CONTENIDO: readonly PantallaDeContenido[] = [
  { clave: "paginas", nombre: "Páginas", href: "/admin/contenido/paginas", que: "Los textos y las fotos de las siete páginas del sitio." },
  { clave: "casos", nombre: "Casos", href: "/admin/contenido/casos", que: "Los cuatro casos de investigación. Se editan, pero no se crean ni se borran." },
  { clave: "equipo", nombre: "Equipo", href: "/admin/contenido/equipo", que: "Los 15 perfiles, con sus etapas y sus publicaciones de la Biblioteca." },
  { clave: "aliados", nombre: "Aliados", href: "/admin/contenido/aliados", que: "Los logos. Sin la marca «Autorizado», un logo no se publica." },
  { clave: "fotos", nombre: "Fotos", href: "/admin/contenido/fotos", que: "Todas las fotos, con su texto alternativo y dónde se usa cada una." },
];
