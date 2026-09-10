// Geometría y ritmo del archivo de fichas de «Así se ve en la práctica».
//
// UN SOLO ESCENARIO clavado con dos LADOS (Gastón, 2026-09-10): el lado A
// con el título a la izquierda y la pila a la derecha (desarrollo
// profesional, cuatro fichas), y el lado B dado vuelta (currículo y el
// remate, otras cuatro). Entre los dos, el GIRO: la pila del lado A se va
// por arriba, el texto se apaga, la víbora sube por el costado derecho y
// vuelve a bajar por el centro con la cámara siguiéndola, y el lado B
// aparece. Antes eran dos zonas clavadas con una costura entre medio, y en
// la costura la víbora moría en una caja y nacía cortada en la otra. Con
// un solo escenario y un solo trazo, no hay costura: el animal no se
// detiene nunca.

// Cuánto scroll corre la timeline ANTES de que el escenario se clave: una
// pantalla entera, la que tarda la sección en subir desde abajo. Durante
// esa pantalla la víbora está QUIETA, a caballo entre Niveles y acá (ver
// el tramo P), y arranca cuando el escenario se clava.
export const ENTRADA_SVH = 100;
// Cuánto scroll vale una unidad de la timeline: ~60svh por ficha, lo que
// lleva leer veinte palabras.
const SVH_POR_UNIDAD = 60;
// La timeline sigue una pantalla DESPUÉS de que el escenario se suelta (el
// ScrollTrigger termina en «bottom top»): la víbora termina de irse por
// abajo mientras el cierre viene subiendo, y se esconde debajo del cartel
// que sigue (Gastón, 2026-09-10), en vez de desaparecer por el pie de un
// escenario todavía clavado.
export const SALIDA_SVH = 100;

// Ritmo (unidades de la timeline).
export const PASO = 1; // separación entre fichas
export const SUBIDA = 0.7; // lo que tarda una ficha en caer sobre la pila
const RESPIRO = 0.6; // después de la última ficha, antes de soltar

// Tramo EN SOLITARIO con el escenario ya clavado: solo la víbora cruzando,
// la cámara la sigue con un zoom leve que se asienta, y recién después
// entra el texto. El GIRO es el segundo solo, una variación del primero:
// más corto, con la mitad de zoom y sin título grande.
export const SOLO = 1;
export const GIRO = 1.6;
// La cámara arranca en 1 (durante la subida el escenario tiene que calzar
// píxel a píxel con Niveles), late al clavarse y se asienta.
export const ZOOM = 1.06;
export const ZOOM_GIRO = 1.04;
export const PIVOTE = "42% 58%";
export const PIVOTE_GIRO = "62% 45%";

// Inclinación con la que cada ficha se planta sobre la pila (grados),
// indexada por ficha GLOBAL: alternadas y chicas, como hojas apoyadas a
// mano. La del remate, derecha.
export const ROT = [-1.6, 1.4, -1.2, 1.5, -1.4, 1.2, -1.5, 0];

// LA MISMA VÍBORA DE NIVELES, que sigue: mismo grosor (54, el de
// `LazoViajero`), mismo azul, la cápsula verde persiguiendo la cola, y el
// mismo modo —VIAJA: la cabeza avanza y la cola se borra—. Un solo
// recorrido en el viewBox 1440 x 900 (el escenario entero; el trazo no
// escala), en TRAMOS, y cada fin de tramo es un hito de la coreografía:
//
//  P  LA COSTURA CON NIVELES. Es el último tramo del lazo de Niveles,
//     pasado a estas coordenadas (su viewBox es de 1600 de ancho: x · 0,9;
//     y − 900), así que queda casi entero por encima del borde de arriba.
//     Niveles termina su viaje con la cabeza justo en el final de su
//     trazo, que es el punto (504, 50) de acá, y se queda quieto; este
//     escenario arranca con la cabeza en ese mismo punto y quieta también.
//     Mientras la sección sube, los dos escenarios se mueven juntos con la
//     página, así que lo que se ve es UN cuerpo continuo cruzando el borde:
//     Niveles dibuja lo de arriba, esto dibuja lo de abajo. Cuando el
//     escenario se clava, Niveles ya salió de pantalla y la cabeza arranca.
//     Antes la víbora moría en Niveles y nacía cortada acá, con un hueco
//     vacío entre medio (Gastón, 2026-09-10).
//  A  baja por el hueco entre la columna del título y la pila;
//  B  el solo: se abre hacia abajo POR DEBAJO del texto (la columna
//     termina en el contador, a ~65 % del alto) y cruza el pie;
//  C  con las fichas del lado A cayendo, repta despacio por el pie hacia
//     la derecha;
//  D  el giro: sube por el costado derecho, por donde estaba la pila que
//     acaba de irse, y cruza el borde de arriba hacia el centro;
//  E  baja por el centro del hueco del lado B (la pila termina en el 37 %,
//     el texto arranca en el 58 %) y pasa por debajo del contador con aire;
//  F  con las fichas del lado B cayendo, hace el pie hacia la derecha, da
//     la vuelta y vuelve por el pie hasta el centro;
//  G  la salida: cuando el escenario se suelta y el cartel del cierre viene
//     subiendo, se zambulle derecho hacia abajo y se esconde debajo del
//     cartel (Gastón, 2026-09-10).
//
// NUNCA pasa por detrás de texto: el navy sobre el azul medio no se lee.
// Los lados no son simétricos porque el texto va alineado a la izquierda
// y en el lado B ese borde recto cae del lado de la víbora.
export const CINTA_INICIO = "M 1116 -600";
export const TRAMOS = [
  "C 1152 -430 1026 -340 882 -260 C 738 -180 576 -120 504 50",
  "C 464 150 560 330 700 420",
  "C 680 580 420 640 280 700 C 150 760 300 840 640 815",
  "C 760 806 850 780 930 800 C 1020 825 1080 880 1160 870",
  "C 1290 860 1330 700 1310 500 C 1300 280 1180 90 950 50 C 860 35 790 60 760 140",
  "C 720 260 670 330 700 420 C 710 660 940 720 1120 730",
  "C 1300 740 1330 880 1120 870 C 900 866 780 850 720 890",
  "C 670 925 660 990 660 1140",
] as const;
export const CINTA = `${CINTA_INICIO} ${TRAMOS.join(" ")}`;
export const GROSOR = 54;
// Largos EN PÍXELES del trazo, los mismos de Niveles (allá son fracciones
// de un recorrido de ~2060: 0,3 / 0,035 / 0,05). Acá el recorrido es más
// del doble y la víbora tiene que medir lo mismo.
export const LAZO_PX = 620; // largo de la víbora
export const PUNTO_PX = 72; // largo de la cápsula perseguidora
export const GAP_PX = 103; // aire entre la cola y la cápsula
// La estela del solo: un trazo ancho y tenue que arranca casi en la cola y
// se extiende bastante hacia atrás, como un halo que la víbora deja.
export const ESTELA_PX = 660;
export const ESTELA_ATRASO_PX = 40;
export const ESTELA_ALPHA = 0.08;

/**
 * Los hitos del escenario, en unidades de la timeline, y el alto de la
 * zona en svh. La timeline corre desde que la zona asoma por abajo hasta
 * que su pie llega al pie de la pantalla: `entrada` es la pantalla de
 * subida, `inicio` cuando cae la primera ficha del lado A, `giro` cuando
 * el lado A se va, `inicio2` cuando cae la primera del lado B, `fin`
 * cuando se suelta, `salida` cuando el escenario ya se fue del todo.
 */
export function ritmo(fichasA: number, fichasB: number) {
  const entrada = ENTRADA_SVH / SVH_POR_UNIDAD;
  const inicio = entrada + SOLO;
  const giro = inicio + fichasA * PASO;
  const inicio2 = giro + GIRO;
  const fin = inicio2 + fichasB * PASO + RESPIRO;
  const salida = fin + SALIDA_SVH / SVH_POR_UNIDAD;
  const alto = ENTRADA_SVH + (fin - entrada) * SVH_POR_UNIDAD;
  return { entrada, inicio, giro, inicio2, fin, salida, alto };
}

export type Ritmo = ReturnType<typeof ritmo>;
