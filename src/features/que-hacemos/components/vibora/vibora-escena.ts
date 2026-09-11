// La víbora de Qué hacemos: UN solo animal, en una capa fija de la página,
// desde la apertura de Niveles hasta el cartel del cierre.
//
// Antes cada sección tenía la suya, dentro de su escenario clavado, y en
// la costura entre Niveles y Proyectos la víbora se quedaba quieta una
// pantalla entera: mientras Proyectos subía, la de Niveles ya no tenía
// línea de tiempo y la de Proyectos no podía moverse sin estirar el cuerpo
// en el borde. Medido: ~1000 px de scroll a velocidad cero, el tramo más
// largo sin movimiento de todo el recorrido (Gastón, 2026-09-11). En una
// capa fija no hay bordes: el trazo vive en coordenadas de la pantalla, las
// secciones pasan por detrás, y un solo reloj de scroll abarca las dos
// zonas.
//
// Recorrido en el viewBox 1440 x 900 (la pantalla; el trazo no escala), en
// TRAMOS, y cada fin de tramo es un hito de la coreografía:
//
//  N  Niveles: el lazo de siempre (era un viewBox de 1600: x · 0,9), que
//     entra por arriba, serpentea entre las cinco cards y baja por la
//     izquierda; ya no sale por abajo: frena cerca del pie;
//  K  la costura: mientras Proyectos sube, TREPA por el centro hacia el
//     rincón de arriba, por delante de las cards que se van;
//  A  con Proyectos clavado, el solo: un gancho arriba y baja por el hueco
//     entre la columna del título y la pila;
//  B  se abre POR DEBAJO del texto (la columna termina en el contador, a
//     ~65 % del alto) y cruza el pie;
//  C  con las fichas del lado A cayendo, repta por el pie hacia la derecha
//     con una onda: más trazo para que la velocidad no caiga tanto;
//  D  el giro: sube por el costado derecho, por donde estaba la pila que
//     acaba de irse, y cruza el borde de arriba hacia el centro;
//  E  baja por el centro del hueco del lado B (la pila termina en el 37 %,
//     el texto arranca en el 58 %) y pasa por debajo del contador con aire;
//  F  con las fichas del lado B cayendo, hace el pie hacia la derecha, da
//     la vuelta y vuelve por el pie hasta el centro;
//  G  la salida: cuando el escenario se suelta y el cartel del cierre viene
//     subiendo, se zambulle derecho hacia abajo y el cartel la tapa.
//
// NUNCA pasa por detrás de texto: el navy sobre el azul medio no se lee.
export const CINTA_INICIO = "M 738 -80";
export const TRAMOS = [
  "C 702 150 450 260 342 430 C 297 560 378 640 558 560 C 720 490 630 220 774 140 C 918 60 1080 140 1116 300 C 1152 470 1026 560 882 640 C 760 720 620 790 560 860",
  "C 500 930 420 700 470 500 C 520 300 580 200 620 120",
  "C 650 40 780 60 750 220 C 730 330 700 380 700 420",
  "C 680 580 420 640 280 700 C 150 760 300 840 640 815",
  "C 720 800 780 760 860 770 C 940 780 960 850 1040 860 C 1100 868 1120 850 1160 870",
  "C 1290 860 1330 700 1310 500 C 1300 280 1180 90 950 50 C 860 35 790 60 760 140",
  "C 720 260 670 330 700 420 C 710 660 940 720 1120 730",
  "C 1300 740 1330 880 1120 870 C 1000 866 940 820 860 830 C 790 840 750 870 720 890",
  "C 670 925 660 990 660 1140",
] as const;
export const CINTA = `${CINTA_INICIO} ${TRAMOS.join(" ")}`;

// El trazo: mismo grosor y proporciones que tenía en Niveles (54 px; largos
// en píxeles porque el recorrido ahora es uno solo y largo).
export const GROSOR = 54;
export const LAZO_PX = 620; // largo de la víbora
export const PUNTO_PX = 72; // largo de la cápsula perseguidora
export const GAP_PX = 103; // aire entre la cola y la cápsula
// Cuánto scroll después de que Proyectos se suelta termina de irse por
// abajo, en pantallas.
export const SALIDA_VH = 0.36;
