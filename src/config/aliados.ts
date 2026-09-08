// Aliados con logo autorizado.
//
// Son exactamente los logos que mandó ED en la carpeta de Drive «LOGOS
// ALIANZAS» (dentro de «EQUIPO ALIANZAS CVS PAGINA»; el detalle está en
// docs/content/equipo-fuentes-drive.md). No sumar ninguno que no esté ahí:
// AGENTS.md §5.4, un logo sin autorización no se publica.
//
// La tira los muestra en blanco sobre azul con un filtro CSS, así que el
// archivo puede venir en cualquier color; lo único que importa es que el
// fondo sea transparente y que esté recortado al dibujo (sin aire alrededor,
// para que la altura CSS sea la del logo de verdad).
//
// `alto` compensa el ojo: una marca vertical (Techint) o un lockup con texto
// chico en dos líneas (UCSH, Science Up) necesita más alto que un wordmark de
// una línea (UNESCO, Bloom) para pesar lo mismo. La tira de la home tiene el
// renglón un poco más alto (h-12) que la del pie (h-11), por eso van dos.
export const ALIADOS = [
  { src: "/aliados/techint.svg", alt: "Techint", alto: { home: "h-12", pie: "h-11" } },
  { src: "/aliados/unesco.png", alt: "UNESCO", alto: { home: "h-8", pie: "h-7" } },
  { src: "/aliados/bloom.png", alt: "Bloom", alto: { home: "h-8", pie: "h-7" } },
  {
    src: "/aliados/ucsh.png",
    alt: "Universidad Católica Silva Henríquez",
    alto: { home: "h-12", pie: "h-11" },
  },
  {
    src: "/aliados/science-up.png",
    alt: "Science Up — Consorcio Ciencia 2030 PUCV, USACH, UCN",
    alto: { home: "h-11", pie: "h-10" },
  },
] as const;
