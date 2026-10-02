import gsap from "gsap";

/** El viewBox del cielo del cierre (CieloCierre.tsx), que cubre la escena con `slice`. */
const CIELO = { w: 1440, h: 900 } as const;
/** Semiángulo del cono de luz (grados): lo que el haz «toca» a su paso. */
const CONO = 13;
const HAZ_CIELO = -90;
/** Tamaño y brillo de estrella por estado, como en escritorio (factor sobre su radio). */
const TAMANO = { sinTocar: 0.8, tocada: 0.95, iluminada: 1.35 } as const;
const BRILLO = { sinTocar: 0.72, tocada: 1, iluminada: 1 } as const;

/**
 * Dónde va cada estrella en un cuadro vertical: [zona, fx, fy]. Las de
 * escritorio están pensadas para un cuadro apaisado; en un celular quedan a
 * la vista cinco, todas arriba. Acá se reparten por el cielo LIBRE, medido:
 * la franja entre los dos mensajes, la tira de arriba (sobre el primero) y
 * la columna de la derecha (sobre el faro). Mismo índice y color que PUNTOS;
 * la naranja (12) va en la franja, a mitad del barrido.
 */
const LUGARES: ReadonlyArray<readonly ["franja" | "arriba" | "derecha", number, number]> = [
  ["franja", 0.06, 0.3],
  ["franja", 0.2, 0.78],
  ["franja", 0.34, 0.18],
  ["franja", 0.5, 0.72],
  ["franja", 0.64, 0.26],
  ["franja", 0.78, 0.8],
  ["franja", 0.92, 0.34],
  ["arriba", 0.4, 0.55],
  ["arriba", 0.64, 0.3],
  ["derecha", 0.45, 0.3],
  ["derecha", 0.8, 0.62],
  ["derecha", 0.25, 0.85],
  ["franja", 0.42, 0.46],
];

type Partes = {
  hoja: HTMLElement;
  nucleo: SVGCircleElement;
  bloques: HTMLElement[];
  linterna: HTMLElement;
};

/**
 * Las 13 estrellas del cierre en celular: las lleva a su cielo vertical y
 * las pinta según la luz (sin tocar → iluminada, dentro del cono → tocada),
 * como en escritorio. Todo escrito a mano sobre atributos del SVG:
 * `restaurar` devuelve lo que dibujó el SSR.
 */
export function crearEstrellasMovil({ hoja, nucleo, bloques, linterna }: Partes) {
  const circulos = Array.from(hoja.querySelectorAll<SVGCircleElement>("[data-cierre-estrella]"));
  const antes = circulos.map((c) => ({ cx: c.getAttribute("cx"), cy: c.getAttribute("cy"), r: Number(c.getAttribute("r")) }));
  const radios = antes.map((a) => a.r / TAMANO.tocada);
  let angulos: number[] | null = null;

  /** Cada estrella a su lugar, medido con los mensajes y el faro en su sitio. */
  const ubicar = () => {
    angulos = null;
    const z = hoja.getBoundingClientRect();
    const k = Math.max(z.width / CIELO.w, z.height / CIELO.h);
    const ox = (z.width - CIELO.w * k) / 2;
    const oy = (z.height - CIELO.h * k) / 2;
    const caja = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const y = Number(gsap.getProperty(el, "y"));
      return { top: r.top - z.top - y, bottom: r.bottom - z.top - y, right: r.right - z.left };
    };
    const [m1, m2] = [caja(bloques[0]), caja(bloques[1])];
    const faro = linterna.getBoundingClientRect();
    const faroTop = faro.top - z.top - Number(gsap.getProperty(linterna, "y"));
    const zonas = {
      franja: { x0: 18, x1: z.width - 18, y0: m1.bottom + 20, y1: Math.max(m1.bottom + 70, m2.top - 20) },
      arriba: { x0: 18, x1: z.width - 18, y0: 70, y1: Math.max(96, m1.top - 14) },
      derecha: { x0: Math.min(z.width - 70, m2.right + 14), x1: z.width - 14, y0: m2.top, y1: Math.max(m2.top + 40, faroTop - 24) },
    };
    circulos.forEach((c, i) => {
      const [zona, fx, fy] = LUGARES[i] ?? LUGARES[0];
      const a = zonas[zona];
      c.setAttribute("cx", String((a.x0 + fx * (a.x1 - a.x0) - ox) / k));
      c.setAttribute("cy", String((a.y0 + fy * (a.y1 - a.y0) - oy) / k));
    });
  };

  const medirAngulos = () => {
    const f = nucleo.getBoundingClientRect();
    const fx = f.left + f.width / 2;
    const fy = f.top + f.height / 2;
    return circulos.map((c) => {
      const r = c.getBoundingClientRect();
      const g = (Math.atan2(r.top + r.height / 2 - fy, r.left + r.width / 2 - fx) * 180) / Math.PI;
      return g > 90 ? g - 360 : g;
    });
  };
  const distancia = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

  /** `beta` es el ángulo del haz, o null si todavía no hay luz. El haz
   *  siempre barre del cielo hacia la izquierda: lo tocado es lo que quedó
   *  entre el cielo y donde está ahora. */
  const pintar = (beta: number | null) => {
    if (beta !== null) angulos ??= medirAngulos();
    circulos.forEach((c, i) => {
      const a = angulos?.[i] ?? 0;
      const iluminada = beta !== null && distancia(a, beta) <= CONO;
      const tocada = iluminada || (beta !== null && a >= beta - CONO && a <= HAZ_CIELO + CONO);
      const estado = iluminada ? "iluminada" : tocada ? "tocada" : "sinTocar";
      c.setAttribute("r", String(radios[i] * TAMANO[estado]));
      c.setAttribute("fill-opacity", String(BRILLO[estado]));
    });
  };

  ubicar();
  pintar(null);

  return {
    circulos,
    ubicar,
    pintar,
    restaurar: () =>
      circulos.forEach((c, i) => {
        c.setAttribute("cx", antes[i].cx ?? "0");
        c.setAttribute("cy", antes[i].cy ?? "0");
        c.setAttribute("r", String(antes[i].r));
        c.removeAttribute("fill-opacity");
      }),
  };
}
