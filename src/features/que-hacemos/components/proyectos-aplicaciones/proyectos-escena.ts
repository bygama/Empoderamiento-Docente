// Geometría y ritmo del archivo de fichas de «Así se ve en la práctica».
//
// El archivo va en DOS MITADES espejadas (Gastón, 2026-09-10): la primera
// con el título a la izquierda y la pila a la derecha (el capítulo de
// desarrollo profesional, cuatro fichas); la segunda dada vuelta, título a
// la derecha y pila a la izquierda (currículo y el remate, cuatro fichas).
// El doblez no es decorativo: es el de los capítulos. Entre las dos, la
// misma costura que entre Niveles y acá: la víbora se va por abajo de la
// primera y reaparece por arriba de la segunda, en el mismo punto.

// Cuánto scroll corre la timeline ANTES de que cada escenario se clave: una
// pantalla entera, la que tarda la mitad en subir desde abajo. La víbora
// tiene que asomar desde el PRIMER píxel (que sea una sola, continua), no
// cuando se clava.
export const ENTRADA_SVH = 100;
// Cuánto scroll vale una unidad de la timeline: ~60svh por ficha, lo que
// lleva leer veinte palabras.
export const SVH_POR_UNIDAD = 60;

// Ritmo (unidades de la timeline).
export const PASO = 1; // separación entre fichas
export const SUBIDA = 0.7; // lo que tarda una ficha en caer sobre la pila
export const RESPIRO = 0.6; // después de la última ficha, antes de soltar
export const RESPIRO_FIN = 1.2; // en el espejo: la víbora termina y se lee Techint

// Tramo EN SOLITARIO con el escenario ya clavado: solo la víbora cruzando,
// la cámara la sigue con un zoom leve que se asienta, y recién después
// entra el texto. En el espejo es la mitad de largo y con la mitad de zoom:
// el segundo cruce es una variación del primero, no una copia.
export const SOLO = 1;
export const SOLO_ESPEJO = 0.5;
export const ZOOM = 1.08;
export const ZOOM_ESPEJO = 1.04;
export const PIVOTE = "42% 58%";
export const PIVOTE_ESPEJO = "58% 58%";

// Inclinación con la que cada ficha se planta sobre la pila (grados),
// indexada por ficha GLOBAL: alternadas y chicas, como hojas apoyadas a
// mano. La del remate, derecha.
export const ROT = [-1.6, 1.4, -1.2, 1.5, -1.4, 1.2, -1.5, 0];

// LA MISMA VÍBORA DE NIVELES, que sigue: mismo grosor (54, el de
// `LazoViajero`), mismo azul, la cápsula verde persiguiendo la cola, y el
// mismo modo —VIAJA: la cabeza avanza y la cola se borra—. Recorrido en el
// viewBox 1440 x 900 (el escenario entero; el trazo no escala).
//
// Primera mitad: entra por arriba en el 35 % del ancho (donde Niveles la
// soltó), baja por el hueco entre la columna del título y la pila, se abre
// hacia abajo POR DEBAJO del texto (la columna termina en el contador, a
// ~65 % del alto), cruza el pie del escenario y se va por abajo en el 53 %
// del ancho, que es exactamente donde el espejo la vuelve a tomar. NUNCA
// pasa por detrás de texto: el navy sobre el azul medio no se lee.
// Espejo: NO es el trazo dado vuelta, porque el texto no es simétrico —va
// alineado a la izquierda, y en el espejo ese borde recto cae del lado de
// la víbora—. Entra en el mismo 53 %, baja por el centro del hueco (la
// pila termina en el 37 %, el texto arranca en el 58 %), pasa por debajo
// del contador con aire, hace el pie hacia la derecha y vuelve para
// TERMINAR debajo de la pila, donde cae Techint.
export const CINTA =
  "M 500 -60 C 560 140 720 240 700 420 C 680 580 420 640 280 700 C 150 760 300 840 640 815 C 760 806 800 900 760 1000";
export const CINTA_ESPEJO =
  "M 760 -60 C 730 140 660 260 700 420 C 710 660 940 720 1120 730 C 1300 740 1330 880 1120 870 C 900 866 520 800 300 850";
export const GROSOR = 54;
export const LAZO_SEG = 0.3; // largo de la víbora (fracción del recorrido)
export const PUNTO_SEG = 0.035; // largo de la cápsula perseguidora
export const PUNTO_GAP = 0.05; // aire entre la cola y la cápsula
// Largo de la cápsula cuando se detiene sobre la cabeza: con las puntas
// redondas queda un punto del grosor de la víbora. Y dónde frena la
// cabeza: un pelo ANTES de la punta del trazo, porque Chrome no pinta un
// guion que toque el final del path (probado: a 20 px del final sí).
export const PUNTO_FINAL = 0.006;
export const CABEZA_FIN = 0.985;
// La primera mitad: la cola termina de irse por abajo este margen antes de
// que el escenario se suelte, así nunca hay dos víboras en pantalla.
export const SALIDA_MARGEN = 0.2;

// Dónde está la cabeza (fracción del recorrido) en cada hito. Durante la
// pantalla en que la mitad sube, la cabeza asoma por el borde de arriba a
// mitad de la subida y baja a la misma velocidad con que sube la sección:
// en pantalla queda QUIETA, a media altura, mientras lo de arriba se va y
// el escenario se acomoda alrededor. Cuando se clava, arranca el solo: la
// cabeza dispara hasta el pie del escenario.
export const CABEZA_AL_CLAVAR = 0.23;
export const CABEZA_FIN_SOLO = 0.62;
export const CABEZA_FIN_SOLO_ESPEJO = 0.55;
// La estela del solo: un trazo ancho y tenue que arranca casi en la cola y
// se extiende bastante hacia atrás, como un halo que la víbora deja.
export const ESTELA_SEG = 0.32;
export const ESTELA_ATRASO = 0.02;
export const ESTELA_ALPHA = 0.08;

/**
 * Los hitos de una mitad, en unidades de la timeline, y el alto de su
 * zona en svh. La timeline corre desde que la zona asoma por abajo hasta
 * que su pie llega al pie de la pantalla: `entrada` es la pantalla de
 * subida, `inicio` cuando cae la primera ficha, `fin` cuando se suelta.
 */
export function ritmo(fichas: number, espejo: boolean) {
  const solo = espejo ? SOLO_ESPEJO : SOLO;
  const respiro = espejo ? RESPIRO_FIN : RESPIRO;
  const entrada = ENTRADA_SVH / SVH_POR_UNIDAD;
  const inicio = entrada + solo;
  const fin = inicio + fichas * PASO + respiro;
  const alto = ENTRADA_SVH + (fin - entrada) * SVH_POR_UNIDAD;
  return { solo, respiro, entrada, inicio, fin, alto };
}

export type Ritmo = ReturnType<typeof ritmo>;
