import { TAMBORES } from "../../data";

export const SEP = "  •  ";
const ANCHO_CHAR = 0.62; // ancho promedio (em) de Manrope extrabold mayúsculas
const F_MAX = 148;
const SVH_POR_TAMBOR = 130; // cuánto scroll dura cada estación de la torre
// ARRANQUE del viaje: los primeros ARRANQUE_SVH de scroll de la zona no
// mueven la torre. Es el respiro entre que el tambor cierra y empieza a
// viajar: quien viene empujando la rueda durante el armado no se lo lleva
// girando en el mismo frame en que se suelta el bloqueo. Corto a propósito
// (dos o tres muescas): con 100svh se sentía como si el scroll siguiera
// trabado ("tarda en dejarme scrollear"); sin nada, el tambor se iba a la
// izquierda antes de verse quieto (Mateo, 2026-09-02).
const ARRANQUE_SVH = 40;
// SALIDA: cola al final de la zona en la que la última estación se va como
// se fueron las otras. Sin esto el 07 se asentaba y, al soltarse el sticky,
// lo que subía era una foto congelada del tubo. En la cola la torre sigue
// subiendo y girando (por scroll, nunca por tiempo: Mateo sacó la deriva en
// reposo para que el nombre no se escape) y tarjeta y rieles se apagan; el
// sticky se suelta con el tubo ya en movimiento y saliendo por arriba.
// Durante la cola la SUPERFICIE gris (y las nieblas) se vuelven
// transparentes: la sección siguiente se mete media pantalla por debajo
// (62svh, ver el -mt en page.tsx) y sube por detrás del tubo que se va. Sin esto
// quedaban casi dos pantallas de gris vacío entre la torre y lo siguiente.
const SALIDA_SVH = 40;
export const ZONA_SVH = TAMBORES.length * SVH_POR_TAMBOR + ARRANQUE_SVH + SALIDA_SVH;
/** Fracción del recorrido de la zona (alto − 100svh) que ocupa el arranque. */
export const ARRANQUE = ARRANQUE_SVH / (ZONA_SVH - 100);
/** Ídem para la cola de salida. */
export const SALIDA = SALIDA_SVH / (ZONA_SVH - 100);
// Cuánto sube (en estaciones) y cuánto gira (grados) la torre durante la
// cola: el 07 sale de cuadro por arriba a ritmo de página, sin acelerón.
export const SUBIDA_SALIDA = 1.3;
export const GIRO_SALIDA = 40;
/** Ángulos de los chips de frase sobre la banda (3 por tambor, repartidos). */
export const CHIP_ANGS = [40, 160, 280];
// Giro total de la torre a lo largo del recorrido. Antes 560°: un scroll
// rápido volvía molinete el texto. Con 300° cada estación gira ~50°.
export const GIRO_TOTAL = 300;
// SIN deriva en reposo. Había un giro continuo en sentido de lectura
// (2.5°/s, "letrero luminoso"); con el scroll frenado durante el armado uno
// se queda mirando el tambor y la deriva se llevaba el principio del nombre
// hacia la izquierda: a los pocos segundos se leía «…OLLO PROFESIONAL».
// Ahora el tambor gira SOLO con el scroll y se queda donde lo dejás, con el
// nombre alineado (pedido de Mateo, 2026-09-02).
// Ángulo donde se planta la PRIMERA letra del nombre cuando llegás a una
// estación: al borde izquierdo del arco legible, para leer desde el
// principio. Al scrollear, el resto del nombre entra por la derecha.
export const ALINEA = -46;
// Cantidad de líneas en letras para el rótulo de presentación ("Siete
// líneas de acción"): sale del dato, así si vuelven a cambiar la cantidad
// se actualiza solo. Fuera de rango cae al número.
export const NUMEROS = ["", "Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"];

/** `angs[j]` = ángulo de la rebanada j (no hay paso uniforme, ver abajo). */
export type GeoTambor = { f: number; angs: number[]; slices: string[] };
export type Geo = { r: number; sp: number; alto: number; drums: GeoTambor[] };

/**
 * Ancho real de cada carácter, medido con la tipografía de verdad.
 *
 * Antes el ángulo entre letras era UNIFORME (360/n) y el tamaño de fuente
 * salía de un ancho promedio. Pero las mayúsculas de Manrope no miden lo
 * mismo: en palabras con muchas letras anchas —"SISTEMAS EDUCATIVOS" es casi
 * toda S, M, E, D, U, C, A, O— cada glifo pide más arco del que le tocaba y
 * se solapan; en las angostas, al revés, quedan huecos.
 *
 * Se mide una vez por sesión y se cachea. Si la fuente todavía no cargó, el
 * fallback promedio deja el comportamiento anterior y `document.fonts.ready`
 * dispara un recálculo (ver `limpiarCacheAnchos`).
 */
const anchoCache = new Map<string, number>();
function medirChar(ch: string): number {
  const hit = anchoCache.get(ch);
  if (hit !== undefined) return hit;
  let ancho = ANCHO_CHAR;
  if (typeof document !== "undefined") {
    const cv = (medirChar as { _cv?: HTMLCanvasElement })._cv ??
      ((medirChar as { _cv?: HTMLCanvasElement })._cv = document.createElement("canvas"));
    const cx = cv.getContext("2d");
    if (cx) {
      cx.font = '800 100px Manrope, system-ui, sans-serif';
      ancho = cx.measureText(ch).width / 100;
    }
  }
  anchoCache.set(ch, ancho);
  return ancho;
}

export const limpiarCacheAnchos = () => anchoCache.clear();

export function calcularGeo(w: number, h: number): Geo {
  const r = Math.min(w * 0.36, 540);
  const circ = 2 * Math.PI * r;
  const drums = TAMBORES.map((t) => {
    const base = (t.tambor + SEP).toUpperCase();
    const anchoBase = Array.from(base).reduce((acc, ch) => acc + medirChar(ch), 0);
    // Repeticiones para que la letra no pase de F_MAX al cerrar la vuelta.
    const k = Math.max(1, Math.ceil(circ / (F_MAX * anchoBase)));
    const slices = Array.from(base.repeat(k));
    const anchos = slices.map(medirChar);
    const total = anchos.reduce((a2, b2) => a2 + b2, 0);
    const f = Math.min(F_MAX, circ / total);
    // Cada rebanada se lleva el arco que su glifo necesita: se le asigna el
    // ángulo del CENTRO de su tramo, así ninguna pisa a la vecina.
    let acum = 0;
    const angs = anchos.map((an) => {
      const centro = acum + an / 2;
      acum += an;
      return (centro / total) * 360;
    });
    return { f, angs, slices };
  });
  // Separación entre tambores: lo justo para que el siguiente asome desde
  // abajo mientras el activo está al frente — a mitad de viaje los dos se
  // ven a la vez, sin vacío entre medio (continuidad de torre).
  return { r, sp: Math.max(370, h * 0.46), alto: h, drums };
}
