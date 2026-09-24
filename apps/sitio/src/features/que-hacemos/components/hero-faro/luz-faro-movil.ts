import gsap from "gsap";
import type { Punto } from "./camara-faro-movil";

// Eje del cono izquierdo en reposo (medido de los polígonos de FaroEscena):
// la rotación que lo hace apuntar a un ángulo es ese ángulo menos esto.
const REPOSO_IZQ = 176.42;
/** Cuánto tarda la luz en asentarse después de destapar, en fracción de la lectura. */
const ASIENTO = 0.8;
/** Ancho del borde difuso con que la luz destapa el texto, en px. */
const DIFUSO = 56;

const suave = (p: number) => p * p * p * (p * (6 * p - 15) + 10);
const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

type Texto = {
  el: HTMLElement;
  /** El que se mueve (el texto o su contenedor): su x/y se descuenta al medir. */
  mov: HTMLElement;
  lee: number;
  dura: number;
  izq: number;
  der: number;
  medio: number;
  /** Dónde empieza el texto dentro de su caja, y cuánto mide. */
  inicio: number;
  ancho: number;
  mascara: string;
};
type Tramo = { desde: number; hasta: number; p0: () => Punto; p1: () => Punto };

/**
 * LA LUZ QUE REVELA, en celular y tablet. Cada texto tiene su momento:
 *   giro     el haz va desde donde estaba hasta el comienzo del texto;
 *   lectura  el haz lo barre de punta a punta y, con la misma curva, una
 *            máscara de borde difuso lo destapa a su paso: el texto aparece
 *            donde lo toca la luz;
 *   asiento  el haz vuelve un poco y se queda quieto sobre el texto
 *            mientras se lee (`reposo`: fracción del ancho; se elige para
 *            que la luz lo cruce en diagonal).
 * El resplandor ([data-luz-texto]) sigue al punto donde apunta el haz.
 *
 * Todo se calcula desde el progreso de la línea de tiempo, así que el
 * scrub hacia atrás deshace lo mismo. El ángulo sale de la linterna en
 * pantalla (la cámara) y de los textos medidos: sin ángulos a mano, y sin
 * leer el layout por frame (el SVG escala parejo, así que el ángulo en
 * pantalla es el del dibujo).
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

  /** Suma un texto a la secuencia: el haz gira hacia él desde `giro` y lo lee desde `lee`. */
  const agregar = (el: HTMLElement, mov: HTMLElement, giro: number, lee: number, dura: number, reposo = 0.5) => {
    const t: Texto = { el, mov, lee, dura, izq: 0, der: 0, medio: 0, inicio: 0, ancho: 0, mascara: "" };
    textos.push(t);
    const comienzo = () => punto(t, 0);
    const previo = tramos.at(-1);
    tramos.push({ desde: previo ? giro : 0, hasta: lee, p0: previo ? previo.p1 : comienzo, p1: comienzo });
    const final = () => punto(t, 1);
    tramos.push({ desde: lee, hasta: lee + dura, p0: comienzo, p1: final });
    tramos.push({ desde: lee + dura, hasta: lee + dura * (1 + ASIENTO), p0: final, p1: () => punto(t, reposo) });
  };

  const medir = () => {
    const base = escenario.getBoundingClientRect();
    for (const t of textos) {
      // El TEXTO, no la caja: en las frases alineadas a la derecha la caja
      // arranca mucho antes que los renglones.
      rango.selectNodeContents(t.el);
      const r = rango.getBoundingClientRect();
      const caja = t.el.getBoundingClientRect();
      const dx = Number(gsap.getProperty(t.mov, "x"));
      const dy = Number(gsap.getProperty(t.mov, "y"));
      t.izq = r.left - base.left - dx;
      t.der = r.right - base.left - dx;
      t.medio = (r.top + r.bottom) / 2 - base.top - dy;
      t.inicio = r.left - caja.left;
      t.ancho = r.width;
    }
  };

  const revelar = (t: Texto, ahora: number) => {
    const r = suave(clamp01((ahora - t.lee) / t.dura));
    let mascara = "none";
    if (r < 1) {
      const borde = t.inicio + r * (t.ancho + DIFUSO);
      mascara = `linear-gradient(90deg, #000 ${borde - DIFUSO}px, transparent ${borde}px)`;
    }
    if (mascara === t.mascara) return;
    t.mascara = mascara;
    t.el.style.setProperty("-webkit-mask-image", mascara);
    t.el.style.setProperty("mask-image", mascara);
  };

  // Tramo en curso la última vez que se midió. Los textos se vuelven a
  // medir cada vez que arranca un tramo (unas veinte veces en todo el
  // recorrido, no por frame): si algo los movió después del armado —una
  // fuente que terminó de cargar, un cambio de clases— la luz apuntaba a
  // donde ESTABAN y no a donde salen las palabras.
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
    const x = a.x + (b.x - a.x) * p;
    const y = a.y + (b.y - a.y) * p;
    const f = foco();
    let rot = (Math.atan2(y - f.y, x - f.x) * 180) / Math.PI - REPOSO_IZQ;
    while (rot > 180) rot -= 360;
    while (rot < -180) rot += 360;
    setRot(rot);
    setResX?.(x);
    setResY?.(y);
    for (const t of textos) revelar(t, ahora);
  };

  const limpiar = () => {
    for (const t of textos) {
      t.el.style.removeProperty("-webkit-mask-image");
      t.el.style.removeProperty("mask-image");
    }
  };

  return { agregar, medir, girar, limpiar };
}
