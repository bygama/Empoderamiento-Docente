import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VIEWBOX } from "../../constelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** El viewBox de la bandada (Bandada.tsx), que cubre la escena con `slice`. */
const CIELO = { w: 1440, h: 900 } as const;
/** Aire entre la franja de las estrellas y lo que la limita (px). */
const AIRE = { titular: 26, botones: 30, lados: 22 } as const;

/**
 * Dónde vive cada estrella bajo `lg`: [fx, fy] dentro de la FRANJA libre del
 * cielo, la que queda entre el titular (arriba) y los botones (abajo). Las de
 * escritorio (estrellas.ts) están pensadas para un cuadro apaisado: en un
 * celular la mitad cae fuera y el resto, encima del titular. Mismo índice y
 * mismo color que PUNTOS. La naranja (12) va en el centro del haz posado: es
 * adonde apunta la luz. Las de `fy` negativa suben al costado derecho del
 * titular, donde sus renglones cortos dejan cielo; las de abajo se quedan a
 * la izquierda, lejos del faro.
 */
const ESTRELLAS_MOVIL: ReadonlyArray<readonly [number, number]> = [
  [0.08, 0.14],
  [0.36, 0.04],
  [0.6, 0.2],
  [0.84, 0.06],
  [0.14, 0.44],
  [0.52, 0.4],
  [0.68, 0.68],
  [0.05, 0.8],
  [0.3, 0.9],
  [0.54, 0.86],
  [0.95, -0.3],
  [0.74, -0.12],
  [0.34, 0.58],
];

type Partes = {
  /** La escena (la sección del hero): la bandada la cubre entera. */
  zona: HTMLElement;
  titulo: HTMLElement;
  botones: HTMLElement;
  /** El bloque del titular, que el scroll hace subir: se descuenta. */
  acto: HTMLElement;
  /** El hueco de la lámina en la hoja (aspecto 400/480). */
  destino: HTMLElement;
  /** La hoja, que sube con el scroll: su destino se mide como si estuviera puesta. */
  hoja: HTMLElement;
};

/**
 * La medida del cielo en celular: lleva píxeles de la escena y coordenadas de
 * lámina (400x480) a unidades de la bandada. Sin `getScreenCTM`: la escena es
 * pegajosa y la bandada la cubre con `slice`, así que la cuenta sale del
 * tamaño de la sección y no depende de dónde esté el scroll. Se cachea y se
 * tira en cada `refreshInit`; los tweens que la usan llevan valores función.
 */
export function crearCielo({ zona, titulo, botones, acto, destino, hoja }: Partes) {
  type Par = [number, number];
  type Medida = { k: number; ox: number; oy: number; s: number; tx: number; ty: number; estrellas: Par[]; enEscena: Par[] };
  let medida: Medida | null = null;
  const medir = () => {
    if (medida) return medida;
    const z = zona.getBoundingClientRect();
    const k = Math.max(z.width / CIELO.w, z.height / CIELO.h);
    const ox = (z.width - CIELO.w * k) / 2;
    const oy = (z.height - CIELO.h * k) / 2;
    // La franja: del pie del titular al tope de los botones, con el bloque
    // en su lugar (se descuenta lo que el scroll o la entrada lo corrieron).
    const corrido = Number(gsap.getProperty(acto, "y"));
    const arriba = titulo.getBoundingClientRect().bottom - z.top - corrido + AIRE.titular;
    const abajo =
      botones.getBoundingClientRect().top - z.top - corrido - Number(gsap.getProperty(botones, "y")) - AIRE.botones;
    const ancho = z.width - AIRE.lados * 2;
    const alto = Math.max(120, abajo - arriba);
    const enEscena = ESTRELLAS_MOVIL.map(([fx, fy]) => [AIRE.lados + fx * ancho, arriba + fy * alto] as Par);
    const estrellas = enEscena.map(([x, y]) => [(x - ox) / k, (y - oy) / k] as Par);
    const d = destino.getBoundingClientRect();
    const subida =
      (Number(gsap.getProperty(hoja, "yPercent")) / 100) * hoja.offsetHeight + Number(gsap.getProperty(hoja, "y"));
    medida = {
      k,
      ox,
      oy,
      s: d.width / VIEWBOX.w / k,
      tx: (d.left - z.left - ox) / k,
      ty: (d.top - z.top - subida - oy) / k,
      estrellas,
      enEscena,
    };
    return medida;
  };
  const olvidar = () => {
    medida = null;
  };
  ScrollTrigger.addEventListener("refreshInit", olvidar);
  return {
    /** Lámina → cielo. */
    x: (px: number) => medir().tx + px * medir().s,
    y: (py: number) => medir().ty + py * medir().s,
    escala: () => medir().s,
    /** La estrella i, en unidades del cielo. */
    estrella: (i: number) => medir().estrellas[i],
    /** La estrella i, en píxeles desde la esquina de la escena. */
    estrellaEnEscena: (i: number) => medir().enEscena[i],
    /** Un punto de pantalla, en unidades del cielo. */
    desdePantalla: (px: number, py: number) => {
      const { k, ox, oy } = medir();
      const z = zona.getBoundingClientRect();
      return { x: (px - z.left - ox) / k, y: (py - z.top - oy) / k };
    },
    olvidar,
    limpiar: () => ScrollTrigger.removeEventListener("refreshInit", olvidar),
  };
}

export type Cielo = ReturnType<typeof crearCielo>;
