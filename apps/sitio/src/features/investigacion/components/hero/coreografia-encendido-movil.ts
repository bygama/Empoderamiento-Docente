import gsap from "gsap";
import { FOCO } from "../linterna-geometria";
import { crearGirador } from "../linterna-giro";
import { HAZ_CIELO, VIDRIO_APAGADO } from "./coreografia-encendido";

/**
 * Pose ESTÁTICA del haz del faro chico (0 = derecha, −90 = cielo, −180 =
 * izquierda): la que dibuja el SSR, o sea el primer instante antes de
 * hidratar. Queda entre los ángulos medidos hacia el titular (−114 en
 * 390×844, −120 en 375×667, −142 en 768×1024). Después el haz se posa en el
 * ángulo MEDIDO (`medirAngulo`), con coreografía o sin ella (`posarQuieto`).
 */
export const HAZ_POSE_MOVIL = -125;

/** Ángulo (grados) del centro de `a` al centro de `b`, en el rango del haz:
 *  siempre ≤ 0, porque bajar del cielo a la izquierda es RESTAR y un valor
 *  positivo mandaría al haz por la derecha. Copia de la de
 *  coreografia-encendido.ts (que no se exporta). */
function medirAngulo(a: Element, b: Element) {
  const f = a.getBoundingClientRect();
  const r = b.getBoundingClientRect();
  const grados =
    (Math.atan2(
      r.top + r.height / 2 - (f.top + f.height / 2),
      r.left + r.width / 2 - (f.left + f.width / 2),
    ) *
      180) /
    Math.PI;
  return grados > 0 ? grados - 360 : grados;
}

/**
 * El encendido del faro chico del hero, bajo `lg`: la reinterpretación del
 * de escritorio (coreografia-encendido.ts) con SOLO la luz. La lámpara se
 * enciende (chispa → cristal → halo) mientras el tambor da un cuarto de
 * vuelta, el haz nace apuntando al cielo, baja y se posa SOBRE el titular:
 * el ángulo se mide en pantalla, de la lámpara al centro del `<h1>`, como
 * en escritorio, así cae sobre el texto en cualquier viewport. Unos 2 s, sin scrub y sin bloquear el scroll. El titular, los botones y
 * las estrellas no se tocan: en celular ya están donde tienen que estar.
 *
 * Los selectores se buscan dentro de `raiz` (el `[data-hero-linterna-movil]`)
 * y no en la sección: ahí vive también la linterna de escritorio, con los
 * mismos `data-linterna-*`. Acá solo se construye el timeline; quien llama
 * es dueño del gsap.context y del cleanup (`restaurar` después del revert).
 */
export function crearEncendidoMovil(raiz: Element, titulo: Element) {
  const q = gsap.utils.selector(raiz);
  const vidrio = q<SVGGElement>("[data-linterna-vidrio]")[0];
  const nucleo = q<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const halo = q<SVGCircleElement>("[data-linterna-halo]")[0];
  const pose = q<SVGGElement>("[data-linterna-pose]")[0];
  const haces = q<SVGGElement>("[data-linterna-haces]")[0];
  const origen = `${FOCO.x} ${FOCO.y}`;

  const { giro, girar } = crearGirador(raiz, 90);
  /** Dónde se posa el haz. Se mide al crear y otra vez en cada refresh
   *  (`remedir`): una rotación o un resize mueven el titular. */
  let posado = medirAngulo(nucleo, titulo);

  // ── Estado pre-paint: lámpara apagada. La pose estática del haz (SSR) se
  //    anula: de acá en más lo apunta GSAP, y el grupo de la pose queda
  //    libre para la entrega (coreografia-entrega-movil.ts).
  gsap.set(pose, { attr: { transform: `rotate(0 ${origen})` } });
  gsap.set(vidrio, { opacity: VIDRIO_APAGADO });
  gsap.set([nucleo, halo], { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(haces, { autoAlpha: 0, rotation: HAZ_CIELO, svgOrigin: origen });
  girar();

  const tl = gsap.timeline({ defaults: { ease: "none" }, delay: 0.25 });

  // ── El encendido: chispa → cristal → halo, con el tambor dando un cuarto
  //    de vuelta hasta mirar de frente (los mismos tiempos que escritorio).
  tl.fromTo(
    nucleo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1.3, duration: 0.12, ease: "power2.out" },
    0,
  );
  tl.to(nucleo, { scale: 1, duration: 0.2, ease: "power1.inOut" }, 0.12);
  tl.fromTo(vidrio, { opacity: VIDRIO_APAGADO }, { opacity: 1, duration: 0.3 }, 0.08);
  tl.to(giro, { theta: 0, duration: 1.2, ease: "power2.out", onUpdate: girar }, 0);
  tl.fromTo(
    halo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    0.2,
  );

  // ── El haz nace apuntando al cielo, baja por la izquierda y se posa.
  tl.fromTo(haces, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.4);
  tl.fromTo(
    haces,
    { rotation: HAZ_CIELO },
    { rotation: () => posado, duration: 1.3, ease: "power2.inOut" },
    0.45,
  );

  /** El scroll tomó el control antes de tiempo: saltar al frame final (luz
   *  posada), que es de donde la entrega levanta el haz. */
  const completar = () => {
    if (tl.progress() < 1) tl.progress(1);
  };

  /** El giro del tambor se escribe a mano (atributos): ctx.revert() no lo
   *  conoce. Y la pose la tweenean dos dueños (este `set` y la entrega):
   *  el revert no garantiza en qué orden los deshace, y el último puede
   *  dejarla en 0 —el haz apuntando a la derecha—. Volver al frame final,
   *  el que dibuja el SSR, escribiéndolo. */
  const restaurar = () => {
    giro.theta = 0;
    girar();
    pose.setAttribute("transform", `rotate(${HAZ_POSE_MOVIL} ${origen})`);
  };

  /** Volver a medir (tras un refresh). Si la luz ya está posada, se la
   *  re-apunta; si el encendido sigue en curso, termina donde ya iba. */
  const remedir = () => {
    posado = medirAngulo(nucleo, titulo);
    if (tl.progress() === 1) gsap.set(haces, { rotation: posado, svgOrigin: origen });
  };

  return { tl, completar, restaurar, remedir, posado: () => posado };
}

/**
 * El faro chico SIN coreografía (movimiento reducido o pantallas bajas bajo
 * `lg`): nada se mueve, pero el haz se posa en el ángulo medido hacia el
 * titular con un `set`, así el frame estático también lo alumbra. Se vuelve
 * a medir cuando cambia el tamaño de la sección, del titular (fuentes que
 * cargan, otro corte de líneas) o del faro: un ResizeObserver y no el
 * `resize` de la ventana, porque las unidades de viewport de la sección se
 * resuelven DESPUÉS de ese evento y el ángulo salía corrido. El cleanup
 * vuelve a la pose del SSR.
 */
export function posarQuieto(zona: HTMLElement) {
  const raiz = zona.querySelector("[data-hero-linterna-movil]");
  const titulo = zona.querySelector("[data-hero-titulo]");
  const nucleo = raiz?.querySelector("[data-linterna-nucleo]");
  const pose = raiz?.querySelector("[data-linterna-pose]");
  if (!raiz || !titulo || !nucleo || !pose) return () => {};

  const posar = () => {
    // En `lg` el faro chico no se muestra: no hay nada que medir.
    if (raiz.getClientRects().length === 0) return;
    gsap.set(pose, { attr: { transform: `rotate(${medirAngulo(nucleo, titulo)} ${FOCO.x} ${FOCO.y})` } });
  };
  posar();
  const observador = new ResizeObserver(posar);
  for (const el of [zona, titulo, raiz]) observador.observe(el);

  return () => {
    observador.disconnect();
    pose.setAttribute("transform", `rotate(${HAZ_POSE_MOVIL} ${FOCO.x} ${FOCO.y})`);
  };
}
