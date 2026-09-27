import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La coreografía de «Quiénes sostienen ED»: el acople de la lámina, el
 * encabezado en tres tiempos, la aparición por nivel y el fallback de
 * teclado. La arma el efecto de `ImpulsanEd` (solo sin reduced-motion) y
 * devuelve su limpieza, que ese mismo efecto devuelve.
 */
export function crearCoreografiaEquipo(root: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    // Acople de la lámina navy sobre la lámina blanca previa (misma mecánica
    // que el resto de las secciones apiladas).
    const sheet = root.closest("section");
    if (sheet) {
      gsap.fromTo(
        sheet,
        { scale: 0.97, y: 36 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: sheet, start: "top 96%", end: "top 14%", scrub: true },
        },
      );
    }

    // Encabezado en tres tiempos.
    const heads = gsap.utils.toArray<HTMLElement>("[data-team-head]");
    // opacity (no autoAlpha): NO usamos visibility:hidden, así el contenido
    // sigue en el árbol de accesibilidad y es enfocable aunque no se haya
    // revelado todavía. El fallback de focusin (abajo) garantiza que también
    // sea visible para quien navega con teclado.
    gsap.set(heads, { opacity: 0, y: 24 });
    gsap.to(heads, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 78%", once: true },
    });

    // Aparición por nivel: se anima el WRAPPER de cada card (la foto es hija
    // inset-0, nunca se separa). transform+opacity, `once` — entran y se
    // quedan quietas. El orden dentro del nivel sale del DOM: encabezado,
    // después fila 1, después fila 2.
    gsap.utils.toArray<HTMLElement>("[data-team-group]").forEach((grupo) => {
      const items = gsap.utils.toArray<HTMLElement>(grupo.querySelectorAll("[data-reveal]"));
      if (!items.length) return;
      const spine = grupo.querySelector<HTMLElement>("[data-spine]");
      const y = Number(grupo.dataset.revealY ?? 28);
      const dur = Number(grupo.dataset.revealDur ?? 0.6);
      const stg = Number(grupo.dataset.revealStagger ?? 0.1);
      // El masthead no declara escala: su entrada queda exactamente como estaba.
      const sc = Number(grupo.dataset.revealScale ?? 1);

      gsap.set(items, { opacity: 0, y, scale: sc });
      if (spine) gsap.set(spine, { scaleY: 0, transformOrigin: "top center" });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: grupo, start: "top 82%", once: true },
      });
      tl.to(
        items,
        { opacity: 1, y: 0, scale: 1, duration: dur, stagger: stg, ease: "power3.out" },
        0,
      );
      // Apenas detrás del título: el trazo baja mientras entra la primera fila.
      if (spine) tl.to(spine, { scaleY: 1, duration: 0.85, ease: "power2.out" }, 0.16);
    });
  }, root);

  // Revela lo que ya esté en viewport al montar (p. ej. recarga con la página
  // scrolleada): nunca queda oculto por no haber scrolleado.
  ScrollTrigger.refresh();

  // Fallback de teclado: si el foco entra a la sección antes de que el scroll
  // revele, mostramos todo de una — el contenido no depende del movimiento.
  const revealAll = () => {
    gsap.to(gsap.utils.toArray<HTMLElement>("[data-team-head], [data-reveal]"), {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.3,
      overwrite: true,
    });
    gsap.to(gsap.utils.toArray<HTMLElement>("[data-spine]"), {
      scaleY: 1,
      duration: 0.3,
      overwrite: true,
    });
  };
  root.addEventListener("focusin", revealAll, { once: true });

  return () => {
    root.removeEventListener("focusin", revealAll);
    ctx.revert();
  };
}
