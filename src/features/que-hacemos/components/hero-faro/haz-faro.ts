import gsap from "gsap";
import { HAZ_VERBO } from "../preguntas-faro";
import { FOCO_X, FOCO_Y } from "../faro-geometria";
import { BEATS, despues, FIN_PREGUNTAS } from "../tiempos-faro";

// Giros LARGOS (0.12–0.13 ≈ 75vh de scroll, el doble que antes) con
// arranque y frenada en quíntica (ver «suave»): a 0.06 y en coseno el
// haz salía y llegaba con un tirón. Los tres «antes» valen lo mismo
// porque el tramo activo cambia en t − antesSalida (ver el while de
// girar): si un giro arrancara antes de ese cambio, el primer frame del
// tramo nuevo lo encontraría a mitad de camino y saltaría. Los tiempos
// los comparte el crossfade de opacidad de la línea de tiempo.
export const GIRO = {
  antesEntrada: 0.06,
  entrada: 0.13,
  antesSalida: 0.06,
  salida: 0.1,
  antesMismo: 0.06,
  mismo: 0.12,
  barrido: 36,
} as const;

// Encendido (S1): la óptica izquierda se asienta de −8 a −2 mientras
// prende. Cierre (S4): desde la última pregunta al ángulo que baña el
// titular. Mismos tiempos que sus tweens de opacidad.
const ENCENDIDO = { desde: 0.226, dur: 0.035, rotDesde: -8 } as const;
const REPOSO_S1 = -2; // el haz izq al final del encendido (S1)
const CIERRE = { desde: despues(0.862), dur: 0.1, rot: -46 } as const;
// Quíntica (smootherstep): velocidad Y aceleración nulas en las dos
// puntas, así el haz ni arranca ni frena de golpe. El coseno de antes
// tenía aceleración máxima justo en las puntas: ese era el tirón.
const suave = (p: number) => p * p * p * (p * (6 * p - 15) + 10);
// Cúbica para el cono que se va: parte quieto (velocidad y aceleración
// cero) y acelera mientras se apaga.
const easeIn = (p: number) => p * p * p;
const easeOut = (p: number) => 1 - (1 - p) * (1 - p);
const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

/**
 * Eje del haz en reposo: el izquierdo apunta a 176.4° desde el foco y el
 * derecho a 3.4° (medido de los polígonos de FaroEscena).
 */
const REPOSO = { izq: 176.42, der: 3.41 } as const;

/**
 * GIRO DEL HAZ, por frame — el ÚNICO DUEÑO de `rotation` de las ópticas.
 *
 * La rotación durante las preguntas NO va en tweens: el ángulo hacia cada
 * texto depende de la cámara, que se mueve mientras el haz gira (los
 * paneos laterales caen justo en los cambios de lado). Un tween congela el
 * destino al arrancar, y cuando el apuntado en vivo retomaba lo corregía
 * de golpe: el haz "se iba a otro lado y volvía" (14° medidos). Acá todo es
 * en vivo: se interpola entre el ángulo REAL del texto anterior y el del
 * actual según el avance del giro, así el final del giro coincide exacto
 * con el apuntado. No guarda estado (solo lee el tiempo de la línea y la
 * geometría), por eso no hay salto en ningún sentido del scroll.
 *
 * Cambio de lado: la luz BARRE en vez de cortarse. El cono que se va
 * sigue girando en el sentido del viaje mientras se apaga, y el que
 * llega arranca `barrido` grados más atrás en ese mismo sentido y
 * entra girando, con solape largo: se lee como una sola luz que pasa
 * por arriba del cielo. Sentido: saliendo de la izquierda, horario (+);
 * de la derecha, antihorario. Las opacidades sí son tweens (loop de
 * S2), con estos mismos tiempos.
 *
 * UN SOLO DUEÑO. Ningún tween de la línea de tiempo toca `rotation` de
 * las ópticas: ni el encendido (−8 → −2) ni el cierre (→ −46) — los
 * dos viven acá como tramos por tiempo. Cuando compartían dueño pasaba
 * esto: ScrollTrigger.refresh() re-renderiza la línea con los eventos
 * suprimidos, el tween del encendido volvía a escribir su −2 sobre el
 * haz y `girar` no corría (onUpdate suprimido): el haz "se iba a
 * otro lado" hasta el próximo tick de scroll, que lo devolvía. Por lo
 * mismo se escribe con quickSetter (sin crear un tween por frame que
 * después GSAP pueda re-renderizar por su cuenta).
 *
 * Va creado ANTES de la línea de tiempo: ScrollTrigger dispara onUpdate
 * en plena construcción, y una const declarada después explota (zona
 * muerta temporal) y tira abajo la escena entera. Mientras no haya línea
 * (`setTimeline`), el giro no hace nada.
 */
export function crearHaces(root: HTMLElement) {
  /**
   * Rotación que hace que el haz APUNTE al bloque de texto i.
   *
   * Antes los ángulos estaban a mano (HAZ_VERBO), calibrados para el copy
   * anterior: al cambiar las frases por preguntas los bloques cambiaron de
   * alto y de posición, y el haz quedó señalando "por ahí cerca" en vez de
   * al texto. Ahora se mide de verdad: se toma el centro del bloque en
   * pantalla, se lo pasa a coordenadas del SVG (getScreenCTM) y se calcula
   * el ángulo desde el foco de la linterna. La evalúa `girar` en cada
   * frame, así sigue a la cámara mientras se mueve.
   */
  const anguloHacia = (i: number, lado: "izq" | "der") => {
    const el = root.querySelector<HTMLElement>(`[data-verbo-txt='${i}']`);
    const svg = root.querySelector("svg");
    if (!el || !svg) return HAZ_VERBO[i].rot;
    const ctm = (svg as SVGSVGElement).getScreenCTM();
    if (!ctm) return HAZ_VERBO[i].rot;
    const r = el.getBoundingClientRect();
    const pt = new DOMPoint(r.left + r.width / 2, r.top + r.height / 2)
      .matrixTransform(ctm.inverse());
    const ang = (Math.atan2(pt.y - FOCO_Y, pt.x - FOCO_X) * 180) / Math.PI;
    // Normaliza a (-180, 180] para que no pegue vueltas de más.
    let delta = ang - REPOSO[lado];
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  };

  const setters = {
    izq: gsap.quickSetter("[data-haz='izq']", "rotation", "deg"),
    der: gsap.quickSetter("[data-haz='der']", "rotation", "deg"),
  };
  const setRot = (lado: "izq" | "der", rotation: number) => setters[lado](rotation);
  let tlActual: gsap.core.Timeline | null = null;
  const setTimeline = (tl: gsap.core.Timeline) => {
    tlActual = tl;
  };

  const girar = () => {
    if (!tlActual) return;
    const ahora = tlActual.time();
    if (ahora < BEATS[0] - GIRO.antesSalida) {
      const p = clamp01((ahora - ENCENDIDO.desde) / ENCENDIDO.dur);
      setRot("izq", ENCENDIDO.rotDesde + (REPOSO_S1 - ENCENDIDO.rotDesde) * easeOut(p));
      return;
    }
    if (ahora > FIN_PREGUNTAS) {
      const ultimo = HAZ_VERBO.length - 1;
      const desde = anguloHacia(ultimo, "izq");
      const p = clamp01((ahora - CIERRE.desde) / CIERRE.dur);
      setRot("izq", desde + (CIERRE.rot - desde) * suave(p));
      return;
    }
    let i = 0;
    while (i + 1 < BEATS.length && ahora >= BEATS[i + 1] - GIRO.antesSalida) i++;
    const t = BEATS[i];
    const { lado } = HAZ_VERBO[i];
    const prev = i > 0 ? HAZ_VERBO[i - 1] : null;
    const objetivo = anguloHacia(i, lado);
    if (prev && prev.lado !== lado) {
      const sentido = lado === "der" ? 1 : -1;
      const pIn = clamp01((ahora - (t - GIRO.antesEntrada)) / GIRO.entrada);
      setRot(lado, objetivo - sentido * GIRO.barrido * (1 - suave(pIn)));
      const pOut = clamp01((ahora - (t - GIRO.antesSalida)) / GIRO.salida);
      setRot(prev.lado, anguloHacia(i - 1, prev.lado) + sentido * GIRO.barrido * easeIn(pOut));
    } else {
      const p = clamp01((ahora - (t - GIRO.antesMismo)) / GIRO.mismo);
      const desde = prev ? anguloHacia(i - 1, lado) : REPOSO_S1;
      setRot(lado, desde + (objetivo - desde) * suave(p));
    }
  };

  return { girar, setTimeline };
}
