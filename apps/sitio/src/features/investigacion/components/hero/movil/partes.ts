import gsap from "gsap";
import { PUNTOS } from "../../constelacion";
import { FOCO } from "../../linterna-geometria";
import { crearGirador } from "../../linterna-giro";
import { ESTRELLA } from "../estrellas";

/**
 * Pose ESTÁTICA del haz del faro de celular (0 = derecha, −90 = cielo, −180 =
 * izquierda): la que dibuja el SSR, el primer instante antes de hidratar.
 * Queda cerca de los ángulos medidos hacia la estrella naranja; después el haz
 * se posa en el ángulo MEDIDO, con coreografía o sin ella.
 */
export const HAZ_POSE_MOVIL = -162;

/** Las piezas del hero que usa la escena de celular; `null` si falta alguna. */
export function partes(zona: HTMLElement) {
  const q = gsap.utils.selector(zona);
  const linterna = q<HTMLElement>("[data-hero-linterna-movil]")[0];
  const titulo = q<HTMLElement>("[data-hero-titulo]")[0];
  const botones = q<HTMLElement>("[data-hero-botones]")[0];
  const hoja = q<HTMLElement>("[data-hero-hoja]")[0];
  const destino = q<HTMLElement>("[data-historia-destino]")[0];
  const acto = q<HTMLElement>("[data-hero-acto]");
  const circulos = q<SVGCircleElement>("[data-hero-estrella]");
  if (!linterna || !titulo || !botones || !hoja || !destino || !acto[0] || circulos.length !== 13) return null;
  return { q, linterna, titulo, botones, hoja, destino, acto, circulos };
}

export type Partes = NonNullable<ReturnType<typeof partes>>;

/** Guarda dónde dibujó el SSR cada estrella (el cielo de escritorio) y lo devuelve. */
export function recordarEstrellas(circulos: SVGCircleElement[]) {
  const antes = circulos.map((c) => [c.getAttribute("cx"), c.getAttribute("cy")] as const);
  return () =>
    circulos.forEach((c, i) => {
      c.setAttribute("cx", antes[i][0] ?? "0");
      c.setAttribute("cy", antes[i][1] ?? "0");
    });
}

/**
 * Deja las piezas como las dibuja el SSR, antes de armar un modo de celular.
 * No alcanza con el `revert` del modo anterior: la página tiene otros
 * gsap.context que llaman a `ScrollTrigger.refresh()` adentro (el índice de
 * casos, la espiral), y un tween de esta escena que se inicializa durante ESE
 * refresh queda anotado en el contexto ajeno; cuando ese contexto se revierte
 * —después del nuestro— devuelve la lámpara a apagada y las estrellas a su
 * tamaño de «sin tocar». Los reverts corren todos antes de que se arme el modo
 * siguiente, así que empezar de fábrica los vuelve inofensivos.
 */
export function aFabrica(p: Partes) {
  const ql = gsap.utils.selector(p.linterna);
  const qh = gsap.utils.selector(p.hoja);
  gsap.set(
    [
      p.linterna,
      ...ql("[data-linterna-haces], [data-linterna-halo], [data-linterna-nucleo], [data-linterna-vidrio]"),
      ...p.acto,
      p.botones,
      p.hoja,
      ...p.q("[data-hero-chispa], [data-hero-arista]"),
      ...qh("[data-riel], [data-riel-numero], [data-riel-relleno], [data-verbo], [data-frase], [data-palabra]"),
    ],
    { clearProps: "all" },
  );
  // El titular lleva estilos propios en línea (tamaño, interlineado): solo lo nuestro.
  gsap.set(p.titulo, { clearProps: "color,textShadow" });
  ql("[data-linterna-pose]")[0]?.setAttribute("transform", `rotate(${HAZ_POSE_MOVIL} ${FOCO.x} ${FOCO.y})`);
  crearGirador(p.linterna, 0).girar();
  p.circulos.forEach((c, i) => {
    c.setAttribute("r", String(PUNTOS[i].r * ESTRELLA.tocada));
    c.removeAttribute("fill-opacity");
  });
}
