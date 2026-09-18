import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QUERY_PUNTERO_FINO } from "../EvidenciasCaso";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Reveal por scroll de los bloques (una vez). El scroll vive en la capa del
 * lugar, no en la ventana: todos los triggers usan ese scroller. Devuelve el
 * revert del contexto.
 */
export function crearReveals(cuerpo: HTMLElement, lugar: HTMLElement) {
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-exp-bloque]").forEach((bloque) => {
      gsap.fromTo(
        bloque,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bloque,
            scroller: lugar,
            start: "top 88%",
            once: true,
          },
        },
      );
    });
    // Piezas que se ASIENTAN: llegan con una rotación extra que se
    // acomoda al entrar (la rotación final la pone su clase CSS).
    gsap.utils.toArray<HTMLElement>("[data-exp-asienta]").forEach((pieza) => {
      gsap.fromTo(
        pieza,
        { rotation: -2.6 },
        {
          rotation: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pieza,
            scroller: lugar,
            start: "top 90%",
            once: true,
          },
        },
      );
    });
    // El ÚNICO momento teatral del lugar: el sello se estampa.
    const sello = cuerpo.querySelector<HTMLElement>("[data-exp-sello]");
    if (sello) {
      gsap.fromTo(
        sello,
        { scale: 1.7, opacity: 0, rotation: 10 },
        {
          scale: 1,
          opacity: 0.75,
          rotation: 0,
          duration: 0.55,
          ease: "back.out(2.2)",
          scrollTrigger: {
            trigger: sello,
            scroller: lugar,
            start: "top 82%",
            once: true,
          },
        },
      );
    }
  }, lugar);
  return () => ctx.revert();
}

/**
 * Micro-parallax de piezas sueltas (lámina, notas, sello): solo con puntero
 * fino. Sin piezas o sin puntero fino no instala nada (devuelve undefined).
 */
export function crearParallax(cuerpo: HTMLElement) {
  if (!window.matchMedia(QUERY_PUNTERO_FINO).matches) return;
  const piezas = gsap.utils.toArray<HTMLElement>(
    cuerpo.querySelectorAll("[data-pieza-parallax]"),
  );
  if (!piezas.length) return;
  // El hint dura lo que dura el parallax: se pone acá (con el gate de puntero
  // fino ya pasado) y se limpia en la misma limpieza que devuelve x/y a cero.
  gsap.set(piezas, { willChange: "transform" });
  const movimientos = piezas.map((el) => ({
    x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
    profundidad: parseFloat(el.dataset.profundidad ?? "5"),
  }));
  const alMover = (e: MouseEvent) => {
    const r = cuerpo.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / Math.min(r.height, window.innerHeight) - 0.5;
    movimientos.forEach((m) => {
      m.x(nx * m.profundidad * 2);
      m.y(ny * m.profundidad * 1.5);
    });
  };
  cuerpo.addEventListener("mousemove", alMover);
  return () => {
    cuerpo.removeEventListener("mousemove", alMover);
    gsap.killTweensOf(piezas);
    gsap.set(piezas, { x: 0, y: 0, clearProps: "willChange" });
  };
}
