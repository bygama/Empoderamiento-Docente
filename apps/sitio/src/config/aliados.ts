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
// Orden pedido por ED (2026-09-08): UNESCO primero, Techint segundo.
//
// `w`/`h` son las medidas REALES del archivo (los PNG, sus píxeles; el SVG, su
// viewBox): `next/image` las pide para reservar el espacio, aunque después el
// alto lo mande la clase y el ancho vaya `auto`. El SVG va `unoptimized`: el
// optimizador de Next no procesa SVG salvo que se le baje la guardia
// (`dangerouslyAllowSVG`), y un logo vectorial no necesita optimización.
export const ALIADOS = [
  { src: "/aliados/unesco.png", alt: "UNESCO", w: 1250, h: 265, alto: { home: "h-8", pie: "h-7" } },
  {
    src: "/aliados/techint.svg",
    alt: "Techint",
    w: 147,
    h: 195,
    vectorial: true,
    alto: { home: "h-12", pie: "h-11" },
  },
  { src: "/aliados/bloom.png", alt: "Bloom", w: 896, h: 264, alto: { home: "h-8", pie: "h-7" } },
  {
    src: "/aliados/ucsh.png",
    alt: "Universidad Católica Silva Henríquez",
    w: 923,
    h: 400,
    alto: { home: "h-12", pie: "h-11" },
  },
  {
    src: "/aliados/science-up.png",
    alt: "Science Up — Consorcio Ciencia 2030 PUCV, USACH, UCN",
    w: 1668,
    h: 428,
    alto: { home: "h-11", pie: "h-10" },
  },
] as const;
