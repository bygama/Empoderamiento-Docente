/**
 * Geometría de la linterna del faro de Investigación: foco, viewBox, radios de
 * los cilindros y la proyección pseudo-3D que comparten el SVG (LinternaFaro) y
 * la coreografía del cierre (coreografia-cierre). Matemática pura, sin DOM.
 */

/** Foco de la lámpara (centro del cristal), en coordenadas del viewBox. */
export const FOCO = { x: 950, y: 385 } as const;
/** El viewBox: 90 de ancho, y del remate (318) al piso (578). */
export const VIEWBOX = { x: 905, y: 318, w: 90, h: 260 } as const;

/**
 * El giro pseudo-3D: el tambor de la linterna y la galería son cilindros
 * vistos de costado. Cada barra vertical vive en un ángulo φ del cilindro y
 * se proyecta en x = cx + r·cos(φ + θ); las de atrás (sin < 0) se ven a
 * través del cristal, tenues. Con θ = 0 el SSR dibuja la pose final.
 *
 * La ÓPTICA rompe la simetría: es un rasgo único del tambor (vive en φ = 90°,
 * mirando al frente en la pose final), así una vuelta se lee como UNA vuelta
 * — con seis parantes iguales el ojo contaba seis.
 */
export const RADIO_CRISTAL = 14.5;
export const RADIO_GALERIA = 19.5;
/** Ángulos base de los parantes del cristal (6, cada 60°). */
export const PARANTES = [0, 60, 120, 180, 240, 300] as const;
/** Ángulos base de los montantes de la baranda (16, cada 22.5°). */
export const MONTANTES = Array.from({ length: 16 }, (_, k) => k * 22.5);
/** La óptica: ángulo base, radio de giro y ancho de frente. */
export const LENTE = { phi: 90, radio: 9, ancho: 10.8, y: 376.5, alto: 19 } as const;

export function proyectar(phi: number, theta: number, radio: number) {
  const a = ((phi + theta) * Math.PI) / 180;
  return { x: FOCO.x + radio * Math.cos(a), frente: Math.sin(a) };
}

/** Opacidad y grosor de una barra según su profundidad y su ángulo. */
export function aspectoBarra(frente: number, x: number, radio: number) {
  const canto = Math.abs(x - FOCO.x) / radio; // 1 = en el borde del cilindro
  // Al pasar atrás la barra se apaga en los últimos ~15° (sin escalón).
  const paso = Math.min(1, Math.max(0, (frente + 0.25) / 0.25));
  return {
    opacity: +(0.28 + 0.72 * paso).toFixed(3),
    grosor: +(1.2 + canto * 1.2).toFixed(3),
  };
}

/** La óptica proyectada: se angosta al ponerse de perfil y se apaga atrás. */
export function proyectarLente(theta: number) {
  const { x, frente } = proyectar(LENTE.phi, theta, LENTE.radio);
  const ancho = Math.max(2.4, LENTE.ancho * Math.abs(frente));
  const paso = Math.min(1, Math.max(0, (frente + 0.3) / 0.3));
  return {
    x: +(x - ancho / 2).toFixed(3),
    ancho: +ancho.toFixed(3),
    opacity: +(0.3 + 0.7 * paso).toFixed(3),
  };
}
