import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { acoplarLamina } from "../acople-lamina";
import { crearIndicador, leerPiezas, prepararEstados } from "./estados-origen";
import { animarPanel, prepararPanel } from "./panel-fotos";
import { crearTimelineOrigen } from "./timeline-origen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Entrada del beat 0. Los beats 1–4 entran con el timeline maestro; el 0 es
 * el estado inicial de la sección y quedaba clavado. Ahora se ARMA mientras
 * la lámina se acopla sobre el hero: la regla se dibuja y regla, etiqueta,
 * título y cuerpo suben escalonados. Termina bastante antes de "top top"
 * (donde arranca la historia), así el pilar ya está montado cuando empieza
 * el pin y el estallido de letras no lo pisa.
 *
 * No toca los [data-char] —el estallido es dueño de ellos—: anima el h2
 * como caja. Y arranca en "top 72%", no antes: la sección ASOMA sobre el
 * hero desde scroll 0 (el "peek"), y con un start más temprano el texto ya
 * habría entrado sin que nadie lo viera.
 */
function armarBeat0(root: HTMLElement, q: (sel: string) => HTMLElement | null) {
  const introRule = q("[data-beat='0'] [data-pilar-rule]");
  const introBits = [
    q("[data-beat='0'] [data-pilar-eyebrow]"),
    q("[data-beat='0'] h2"),
    q("[data-beat='0'] p"),
  ].filter((el): el is HTMLElement => Boolean(el));
  const introST = { trigger: root, start: "top 72%", end: "top 25%", scrub: true };
  if (introRule) {
    gsap.fromTo(
      introRule,
      { scaleX: 0 },
      { scaleX: 1, ease: "power2.out", duration: 0.6, scrollTrigger: introST },
    );
  }
  if (introBits.length) {
    gsap.fromTo(
      introBits,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        stagger: 0.22,
        ease: "power3.out",
        scrollTrigger: introST,
      },
    );
  }
}

/**
 * Coreografía completa de «Origen»: acople de la lámina, capas superpuestas,
 * estados iniciales, entrada del beat 0, timeline maestro con el panel de
 * fotos encima y TILT 3D del panel con el mouse. Devuelve el cleanup
 * (cancela el RAF del tilt, saca el listener y revierte el contexto).
 */
export function crearOrigen(root: HTMLElement, zone: HTMLElement) {
  let raf = 0;
  let removeMove: (() => void) | undefined;

  const ctx = gsap.context(() => {
    const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
    const tilt = root.querySelector<HTMLElement>("[data-story-tilt]");
    const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]");
    if (beats.length !== 5 || !tilt) return;

    // ── Acople de la lámina sobre el hero (transición de sección) ────────
    // Origen arriba: la lámina se ancla por el borde que toca el hero y crece
    // hacia abajo, y así deja asomar su cabecera en el hero (el "peek" que
    // invita a scrollear). Detalle del porqué en acople-lamina.
    acoplarLamina(root, { escala: 0.955, y: 44, fin: "top 12%", origen: "50% 0%" });

    // ── Capas: pasan a superponerse (en flow quedan apiladas sin motion) ─
    gsap.set(beats, { position: "absolute", inset: 0 });
    gsap.set(beats.slice(1), { autoAlpha: 0 });

    const piezas = leerPiezas(root);
    prepararEstados(piezas);
    prepararPanel(root, piezas);
    armarBeat0(root, piezas.q);

    const setDot = crearIndicador(dots);
    const tl = crearTimelineOrigen(zone, beats, piezas, setDot);
    animarPanel(tl, piezas);

    // ── TILT 3D del panel con el mouse (suave, solo pointer fino) ────────
    if (window.matchMedia("(pointer: fine)").matches) {
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      const onMove = (e: MouseEvent) => {
        tx = (e.clientX / window.innerWidth) * 2 - 1;
        ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const loop = () => {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        gsap.set(tilt, { rotateY: cx * 1.8, rotateX: -cy * 1.4, transformPerspective: 1100 });
        raf = requestAnimationFrame(loop);
      };
      window.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(loop);
      removeMove = () => window.removeEventListener("mousemove", onMove);
    }
  }, root);

  return () => {
    cancelAnimationFrame(raf);
    removeMove?.();
    ctx.revert();
  };
}
