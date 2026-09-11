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
export const SVH_POR_UNIDAD = 60;
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

// La víbora ya no vive acá: es una sola, de Niveles al cierre, en la capa
// fija de la página (`../vibora/vibora-escena.ts`). Sus hitos en Proyectos
// salen de `ritmo()`.

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
