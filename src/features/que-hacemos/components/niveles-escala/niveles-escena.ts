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
// cierres largos (11,3) y 520 sin el cierre de la quinta (10,4). Se sostiene
// el mismo ritmo de scroll por unidad (~40svh) para las 12,4 que quedan.
export const ALTO_SVH = 600;

// Recorrido del lazo viajero (viewBox 1600x900): entra por arriba, serpentea
// entre las cards y sale por abajo. No se dibuja y queda — VIAJA: la cabeza
// avanza mientras la cola se borra, y al final sale de escena (referencia
// Assistantly). Lo persigue una cápsula corta por detrás. El primer tramo
// entra a la derecha del título (que ocupa hasta ~35% del ancho): antes
// le pasaba por detrás y lo ensuciaba.
export const LAZO =
  "M 820 -80 C 780 150 500 260 380 430 C 330 560 420 640 620 560 C 800 490 700 220 860 140 C 1020 60 1200 140 1240 300 C 1280 470 1140 560 980 640 C 820 720 640 780 560 950";
export const LAZO_SEG = 0.3; // largo de la serpiente (fracción del recorrido)
export const PUNTO_SEG = 0.035; // largo de la cápsula perseguidora
export const PUNTO_GAP = 0.05; // aire entre la cola del lazo y la cápsula
