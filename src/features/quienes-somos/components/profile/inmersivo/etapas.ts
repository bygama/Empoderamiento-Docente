import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefsPerfil, St } from "./refs-perfil";

/**
 * ETAPAS: revelado dosificado + nodo activo (al subir NO se oculta: la
 * memoria de lo recorrido queda en pantalla).
 */
export function crearEtapas(r: RefsPerfil, st: St, setActiveStage: (n: number) => void) {
  gsap.utils.toArray<HTMLElement>("[data-stage]", r.track.current!).forEach((el) => {
    const n = Number(el.dataset.stageN);
    const items = gsap.utils.toArray<HTMLElement>("[data-reveal-el]", el);
    gsap.set(items, { opacity: 0, y: 28 });
    ScrollTrigger.create(
      st({
        trigger: el,
        start: "top 76%",
        end: "bottom 45%",
        onEnter: () => {
          gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out", overwrite: true });
          setActiveStage(n);
        },
        onEnterBack: () => setActiveStage(n),
        onLeaveBack: () => setActiveStage(n - 1),
      }),
    );
  });
}

/** CIERRE: ceremonia de convergencia (y la figura que reaparece con control). */
export function crearCierre(r: RefsPerfil, st: St) {
  const closeItems = gsap.utils.toArray<HTMLElement>("[data-closing-el]");
  const closeCats = gsap.utils.toArray<HTMLElement>("[data-closing-cat]");
  gsap.set(closeItems, { opacity: 0, y: 26 });
  gsap.set(closeCats, { opacity: 0, x: (i) => (i - (closeCats.length - 1) / 2) * 42 });
  ScrollTrigger.create(
    st({
      trigger: r.closing.current,
      start: "top 72%",
      onEnter: () => {
        gsap.to(closeItems, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", overwrite: true });
        // Las categorías CONVERGEN al centro (síntesis de la columna).
        gsap.to(closeCats, { opacity: 1, x: 0, duration: 0.9, stagger: 0.05, ease: "power3.out", overwrite: true });
      },
    }),
  );
  // La figura reaparece con control, integrada a la convergencia.
  if (r.closingFig.current) {
    gsap.fromTo(
      r.closingFig.current,
      { opacity: 0, y: 70 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: st({
          trigger: r.closing.current,
          start: "top 70%",
          end: "top 18%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        }),
      },
    );
  }
}
