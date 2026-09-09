// Geometría y ritmo del archivo de fichas de «Así se ve en la práctica».

// Alto de la zona que se clava: una pantalla de escenario, el tramo en
// solitario de la víbora, ~60svh por ficha (lo que lleva leer veinte
// palabras) y el respiro final.
export const ALTO_SVH = 680;

// Ritmo (unidades de la timeline).
export const PASO = 1; // separación entre fichas
export const SUBIDA = 0.7; // lo que tarda una ficha en caer sobre la pila

// Cuánto scroll corre la timeline ANTES de que el escenario se clave: una
// pantalla entera, la que tarda la sección en subir desde abajo. La víbora
// viene de Niveles y tiene que asomar desde el PRIMER píxel de la sección
// (Gastón, 2026-09-09: que sea una sola, continua), no cuando se clava.
export const ENTRADA_SVH = 100;
// Tramo EN SOLITARIO (unidades de timeline) con el escenario ya clavado:
// solo la víbora cruzando, la cámara la sigue con un zoom leve que se
// asienta, y recién después entran el título y la primera ficha (Gastón,
// 2026-09-09: «un amigo de un segundo en solitario y que la cámara la
// siga»).
export const SOLO = 1;
// Zoom de la cámara durante la entrada y el solo, pivotando cerca de
// donde pasa la cabeza. Vuelve a 1 antes de que aparezca cualquier texto.
export const ZOOM = 1.08;
export const PIVOTE = "42% 58%";

// Inclinación con la que cada ficha se planta sobre la pila (grados):
// alternadas y chicas, como hojas apoyadas a mano. La del remate, derecha.
export const ROT = [-1.6, 1.4, -1.2, 1.5, -1.4, 1.2, -1.5, 0];

// LA MISMA VÍBORA DE NIVELES, que sigue: mismo grosor (54, el de
// `LazoViajero`), mismo azul, la cápsula verde persiguiendo la cola, y el
// mismo modo —VIAJA: la cabeza avanza y la cola se borra, no se queda—.
// Allá sale por abajo a un 35 % del ancho bajando hacia la izquierda; acá
// reaparece por el borde de arriba en ese mismo 35 %, bajando. Recorrido
// en el viewBox 1440 x 900 (el escenario entero; el trazo no escala): baja
// por el hueco entre la columna del título y la pila, se abre hacia abajo
// a la izquierda POR DEBAJO del texto (la columna del título termina en el
// contador, a ~65 % del alto), cruza el pie del escenario y se va por abajo
// a la derecha, hacia el cierre. NUNCA pasa por detrás de texto: el navy
// sobre el azul medio no se lee. Las fichas son opacas y van encima.
export const CINTA =
  "M 500 -60 C 560 140 720 240 700 420 C 680 580 420 640 280 700 C 150 760 300 840 640 815 C 900 795 1100 850 1250 1000";
export const GROSOR = 54;
export const LAZO_SEG = 0.3; // largo de la víbora (fracción del recorrido)
export const PUNTO_SEG = 0.035; // largo de la cápsula perseguidora
export const PUNTO_GAP = 0.05; // aire entre la cola y la cápsula
// Cuándo termina de irse (unidades de timeline después de la entrada):
// entre la tercera y la cuarta ficha ya no hay víbora. Qué pasa con las
// últimas cuatro se decide después.
export const SALIDA = 3.6;

// Dónde está la cabeza (fracción del recorrido) en cada hito. Durante la
// pantalla en que la sección sube, la cabeza asoma por el borde de arriba
// a mitad de la subida y baja a la misma velocidad con que sube la
// sección: en pantalla queda QUIETA, a media altura, mientras Niveles se
// va por arriba y el escenario se acomoda alrededor. Cuando el escenario
// se clava, arranca el solo: la cabeza dispara hasta el pie del escenario.
export const CABEZA_AL_CLAVAR = 0.23;
export const CABEZA_FIN_SOLO = 0.62;
// La estela del solo: un trazo ancho y tenue que arranca casi en la cola y
// se extiende bastante hacia atrás, como un halo que la víbora deja.
export const ESTELA_SEG = 0.32;
export const ESTELA_ATRASO = 0.02;
export const ESTELA_ALPHA = 0.08;
