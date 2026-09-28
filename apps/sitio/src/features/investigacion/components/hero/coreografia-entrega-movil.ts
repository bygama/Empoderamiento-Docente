import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOCO } from "../linterna-geometria";
import { crearEncendidoMovil } from "./coreografia-encendido-movil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Adónde apunta el haz al final de la entrega: abajo a la izquierda (−210,
 * o sea +150), hacia donde entra la historia. Desde el ángulo posado (arriba
 * a la izquierda, medido) baja RESTANDO: el camino corto, por la izquierda
 * (−180).
 */
const HAZ_ENTREGA = -210;
/** Desde qué fracción del tramo el haz se desvanece: la luz «pasa». */
const DESVANECE = 0.8;

/**
 * El faro chico del hero bajo `lg`: se enciende al cargar
 * (coreografia-encendido-movil.ts) y, al scrollear, su haz ENTREGA la
 * historia: desde que el hero empieza a subir hasta que la escena de la
 * historia (`[data-historia-movil]`, hermana del hero) llega arriba, el haz
 * suelta el titular, baja por la izquierda hacia ella y en el último tramo
 * se desvanece.
 *
 * El encendido y la entrega no se pisan: el encendido anima el grupo de los
 * haces y la entrega el de la pose, que lo envuelve (los giros se suman y
 * las opacidades se multiplican). Igual, si el scroll arranca antes de que
 * la luz termine de posarse, el encendido salta a su frame final: el haz
 * baja desde un estado conocido.
 */
export function crearEntregaMovil(zona: HTMLElement) {
  const raiz = zona.querySelector("[data-hero-linterna-movil]");
  const pose = raiz?.querySelector<SVGGElement>("[data-linterna-pose]");
  const titulo = zona.querySelector("[data-hero-titulo]");
  const historia = zona.parentElement?.querySelector<HTMLElement>("[data-historia-movil]");
  if (!raiz || !pose || !titulo || !historia) return () => {};

  const rotar = (grados: number) => `rotate(${grados} ${FOCO.x} ${FOCO.y})`;
  let restaurar = () => {};
  let remedir = () => {};

  const ctx = gsap.context(() => {
    const encendido = crearEncendidoMovil(raiz, titulo);
    restaurar = encendido.restaurar;
    /** El giro de la entrega va en un proxy (0 → 1) y se escribe a mano
     *  sobre la pose: el tramo depende del ángulo medido, que un refresh
     *  puede cambiar a mitad de camino, y un tween sobre el atributo
     *  quedaría con el punto de partida viejo. */
    const giro = { p: 0 };
    const aplicar = () =>
      pose.setAttribute("transform", rotar(giro.p * (HAZ_ENTREGA - encendido.posado())));
    remedir = () => {
      encendido.remedir();
      if (giro.p > 0) aplicar();
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: zona,
        start: "top top",
        endTrigger: historia,
        end: "top top",
        scrub: 0.6,
        onUpdate: (self) => {
          if (self.progress > 0.001) encendido.completar();
        },
      },
    });

    // `to` y no `fromTo`: el `from` de un fromTo que no se renderiza al
    // crearse nace recién en su primer render, y si eso pasa durante el
    // refresh que dispara OTRO gsap.context (useEntradaIndice), queda
    // anotado en ese y su revert le pisa la pose a este faro. El punto de
    // partida es el mismo: la pose en 0 (y opaca) que dejó el encendido.
    tl.to(giro, { p: 1, duration: 1, ease: "sine.inOut", onUpdate: aplicar }, 0);
    tl.to(pose, { opacity: 0, duration: 1 - DESVANECE, ease: "power1.in" }, DESVANECE);
  }, zona);

  // Un refresh (resize, rotación, fuentes) puede mover el titular: se
  // vuelve a medir dentro del contexto, así lo que escriba lo revierte.
  const alRefrescar = () => ctx.add(remedir);
  ScrollTrigger.addEventListener("refresh", alRefrescar);

  return () => {
    ScrollTrigger.removeEventListener("refresh", alRefrescar);
    ctx.revert();
    restaurar();
  };
}
