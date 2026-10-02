import { PERSONAJE } from "../../constelacion";
import { FOCO } from "../../linterna-geometria";
import { crearCielo } from "./cielo";
import { ubicarEstrellas } from "./encendido";
import { aFabrica, HAZ_POSE_MOVIL, partes, recordarEstrellas } from "./partes";

/**
 * La escena de celular SIN coreografía (movimiento reducido o pantallas bajas
 * bajo `lg`): nada se mueve, pero las estrellas van a su cielo de celular y el
 * haz se posa apuntando a la naranja. Se vuelve a medir cuando
 * cambia el tamaño de la sección o del titular (un ResizeObserver y no el
 * `resize` de la ventana: las unidades de viewport se resuelven después de ese
 * evento). En `lg` el faro de celular no se muestra y acá no se toca nada: el
 * frame quieto de escritorio es el que dibuja el SSR.
 */
export function posarQuieto(zona: HTMLElement) {
  const p = partes(zona);
  const nucleo = p?.linterna.querySelector("[data-linterna-nucleo]");
  const pose = p?.linterna.querySelector("[data-linterna-pose]");
  if (!p || !nucleo || !pose || p.linterna.getClientRects().length === 0) return () => {};
  aFabrica(p);
  const devolverEstrellas = recordarEstrellas(p.circulos);
  const cielo = crearCielo({ zona, titulo: p.titulo, botones: p.botones, acto: p.acto[0], destino: p.destino, hoja: p.hoja });

  const posar = () => {
    cielo.olvidar();
    ubicarEstrellas(p.circulos, cielo);
    // El ángulo se CALCULA, no se mide sobre la estrella: con movimiento
    // reducido globals.css vuelve cada cambio una transición de 0.01 ms, y
    // la estrella recién movida todavía se mide en su lugar anterior.
    const z = zona.getBoundingClientRect();
    const l = nucleo.getBoundingClientRect();
    const [ex, ey] = cielo.estrellaEnEscena(PERSONAJE);
    const grados = (Math.atan2(ey - (l.top - z.top + l.height / 2), ex - (l.left - z.left + l.width / 2)) * 180) / Math.PI;
    pose.setAttribute("transform", `rotate(${grados > 0 ? grados - 360 : grados} ${FOCO.x} ${FOCO.y})`);
  };
  posar();
  const observador = new ResizeObserver(posar);
  for (const el of [zona, p.titulo]) observador.observe(el);

  return () => {
    observador.disconnect();
    cielo.limpiar();
    devolverEstrellas();
    pose.setAttribute("transform", `rotate(${HAZ_POSE_MOVIL} ${FOCO.x} ${FOCO.y})`);
  };
}
