// Geometría del escenario de «Niveles en los que intervenimos»: dónde se
// planta cada card, cuánto mide la zona y el recorrido del lazo.

// Zig-zag a lo ancho del escenario, esquivando la esquina superior izquierda
// (ahí vive el encabezado de la sección): % del escenario.
export const POS = [
  { left: "7%", top: "40%" },
  { left: "44%", top: "14%" },
  { left: "20%", top: "60%" },
  { left: "66%", top: "34%" },
  { left: "50%", top: "64%" },
];

// Antes 640 con el remate del titular (13,3 unidades de timeline), 560 con
// cierres largos (11,3), 520 sin el cierre de la quinta (10,4) y 600 con las
// 12,4 de la escalada sola. Con la apertura (1,6 más: el título grande
// antes de la primera card) son 14, al mismo ritmo de ~40svh por unidad.
export const ALTO_SVH = 665;

// Cuánto scroll corre la timeline ANTES de que el escenario se clave. El
// sticky se traba cuando el tope de la zona toca el tope del viewport, así
// que basta con arrancar el ScrollTrigger a `top ENTRADA_SVH%`. Apenas un
// anticipo: con 30 el lazo entraba de más y se comía el arranque (Mateo,
// 2026-09-05). La capa fija de la víbora arranca en el mismo punto.
export const ENTRADA_SVH = 10;

// El recorrido de la víbora ya no vive acá: es uno solo, de Niveles al
// cierre, en `../vibora/vibora-escena.ts`.
