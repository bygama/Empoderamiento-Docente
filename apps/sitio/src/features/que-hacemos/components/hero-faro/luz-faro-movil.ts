import gsap from "gsap";
import type { Punto } from "./camara-faro-movil";

// Eje del cono izquierdo en reposo (medido de los polígonos de FaroEscena):
// la rotación que lo hace apuntar a un ángulo es ese ángulo menos esto.
const REPOSO_IZQ = 176.42;

// Quíntica (smootherstep), la misma de escritorio (haz-faro.ts): velocidad
// y aceleración nulas en las dos puntas, así el haz ni arranca ni frena de
// golpe.
const suave = (p: number) => p * p * p * (p * (6 * p - 15) + 10);
const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

type Texto = {
  el: HTMLElement;
  /** El que se mueve (el texto o su contenedor): su x/y se descuenta al medir. */
  mov: HTMLElement;
  izq: number;
  der: number;
  medio: number;
};
type Tramo = { desde: number; hasta: number; p0: () => Punto; p1: () => Punto };

/**
 * LA LUZ EN CELULAR Y TABLET, con la regla de escritorio (haz-faro.ts): UN
 * giro largo y suave por texto, hacia su centro, que termina cuando el
 * texto aparece; después el haz se queda QUIETO mientras se lee. Nada de
 * barrer el texto ni de acomodarse después (la primera versión hacía tres
 * movimientos por frase en la mitad del scroll: se movía unas seis veces
 * más rápido que en computadora, Gastón 2026-09-24).
 *
 * El ángulo sale de la linterna en pantalla (la cámara) y del centro de
 * cada texto medido, y se calcula por frame: mientras el faro viaja, la
 * luz sigue clavada en su texto, igual que en escritorio. Sin leer el
 * layout por frame (el SVG escala parejo, así que el ángulo en pantalla es
 * el del dibujo). El resplandor ([data-luz-texto]) sigue al punto donde
 * apunta el haz.
 */
export function crearLuzMovil(root: HTMLElement, escenario: HTMLElement, foco: () => Punto) {
  const textos: Texto[] = [];
  const tramos: Tramo[] = [];
  const rango = document.createRange();
  const setRot = gsap.quickSetter(root.querySelectorAll("[data-haz='izq']"), "rotation", "deg");
  const resplandor = root.querySelector<HTMLElement>("[data-luz-texto]");
  const setResX = resplandor ? gsap.quickSetter(resplandor, "x", "px") : null;
  const setResY = resplandor ? gsap.quickSetter(resplandor, "y", "px") : null;

  const punto = (t: Texto, fx: number): Punto => ({ x: t.izq + (t.der - t.izq) * fx, y: t.medio });
  /** Ángulo en pantalla desde la linterna hasta un punto, en grados. */
  const angulo = (p: Punto) => {
    const f = foco();
    return (Math.atan2(p.y - f.y, p.x - f.x) * 180) / Math.PI;
  };

  /**
   * Suma un texto: el haz gira hacia su centro entre `desde` y `hasta`,
   * partiendo de donde quedó con el texto anterior. `hacia` cambia el
   * destino (si devuelve null, vale el centro). El primero parte de
   * `inicio` (el encendido: nace cerca de su destino y se acomoda unos
   * grados, como en escritorio).
   */
  const apuntar = (
    el: HTMLElement,
    mov: HTMLElement,
    desde: number,
    hasta: number,
    opciones: { hacia?: () => Punto | null; inicio?: (destino: Punto) => Punto } = {},
  ) => {
    const t: Texto = { el, mov, izq: 0, der: 0, medio: 0 };
    textos.push(t);
    const destino = () => opciones.hacia?.() ?? punto(t, 0.5);
    const previo = tramos.at(-1);
    const { inicio } = opciones;
    tramos.push({
      desde,
      hasta,
      p0: previo ? previo.p1 : () => (inicio ? inicio(destino()) : destino()),
      p1: destino,
    });
  };

  const medir = () => {
    const base = escenario.getBoundingClientRect();
    for (const t of textos) {
      // El TEXTO, no la caja: en las frases alineadas a la derecha la caja
      // arranca mucho antes que los renglones.
      rango.selectNodeContents(t.el);
      const r = rango.getBoundingClientRect();
      const dx = Number(gsap.getProperty(t.mov, "x"));
      const dy = Number(gsap.getProperty(t.mov, "y"));
      t.izq = r.left - base.left - dx;
      t.der = r.right - base.left - dx;
      t.medio = (r.top + r.bottom) / 2 - base.top - dy;
    }
  };

  // Tramo en curso la última vez que se midió. Los textos se vuelven a
  // medir cada vez que arranca un tramo (una vez por texto, no por frame):
  // si algo los movió después del armado —una fuente que terminó de
  // cargar, un cambio de clases— la luz apuntaba a donde ESTABAN y no a
  // donde salen las palabras.
  let medido = -1;
  const girar = (ahora: number) => {
    if (tramos.length === 0) return;
    // El último tramo que ya empezó; entre tramos, la luz queda donde
    // terminó el anterior.
    let k = 0;
    while (k + 1 < tramos.length && ahora >= tramos[k + 1].desde) k++;
    if (k !== medido) {
      medido = k;
      medir();
    }
    const { desde, hasta, p0, p1 } = tramos[k];
    const p = suave(clamp01((ahora - desde) / (hasta - desde)));
    const a = p0();
    const b = p1();
    // Se interpola el ÁNGULO, como en escritorio, no el punto: el punto
    // que va de un texto a otro puede pasar cerca de la linterna, y ahí el
    // haz pegaba un latigazo (112° en tres unidades, del último texto al
    // cierre). Por el camino corto.
    const a0 = angulo(a);
    let delta = angulo(b) - a0;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    let rot = a0 + delta * p - REPOSO_IZQ;
    while (rot > 180) rot -= 360;
    while (rot < -180) rot += 360;
    setRot(rot);
    setResX?.(a.x + (b.x - a.x) * p);
    setResY?.(a.y + (b.y - a.y) * p);
  };

  return { apuntar, medir, girar };
}
