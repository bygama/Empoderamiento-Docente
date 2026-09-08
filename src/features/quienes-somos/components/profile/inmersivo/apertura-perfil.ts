import gsap from "gsap";
import type { RefsPerfil } from "./refs-perfil";
import type { MedidasNombre } from "./viaje-nombre";

type Apertura = {
  scroller: HTMLElement;
  /** Card de origen (FLIP figura + nombre). Puede ser null. */
  originEl: HTMLElement | null;
  /** false = la FOTO de la card la lleva el overlay; la figura no FLIPea. */
  figuraDesdeCard: boolean;
  medidas: MedidasNombre;
};

/**
 * APERTURA: la card se transforma en la historia. La figura FLIPea desde la
 * foto de la card y el nombre desde el caption, mientras el panel blanco
 * (overlay) se expande desde la card. Estados iniciales en FASE DE LAYOUT →
 * sin flash sobre el panel. Devuelve la limpieza del listener de scroll.
 */
export function crearApertura(r: RefsPerfil, { scroller, originEl, figuraDesdeCard, medidas }: Apertura) {
  const identity = r.identity.current;
  const heroEls = gsap.utils.toArray<HTMLElement>("[data-hero-el]");
  gsap.set(heroEls, { opacity: 0, y: 26 });
  gsap.set(identity, { opacity: 0 });
  // El OUTER lo gobierna la coreografía de scroll (tween scrubbeado que
  // lo retira): en el modo sin FLIP propio queda visible y es el MOVER
  // el que arranca oculto, para que el overlay lo revele cuando llega
  // la foto viajera sin pelear con ese tween.
  if (r.portraitOuter.current) gsap.set(r.portraitOuter.current, { autoAlpha: figuraDesdeCard ? 0 : 1 });
  if (!figuraDesdeCard && r.portraitMover.current) gsap.set(r.portraitMover.current, { autoAlpha: 0 });

  const intro = gsap.timeline({ delay: 0.18, defaults: { ease: "power3.inOut" } });
  const cardImg = figuraDesdeCard ? originEl?.querySelector("img") : null;
  const cardName = originEl?.querySelector<HTMLElement>('[data-caption="rest"] [data-card-name]');
  const mover = r.portraitMover.current;
  if (cardImg && mover && r.portraitOuter.current) {
    const from = cardImg.getBoundingClientRect();
    const to = r.portraitOuter.current.getBoundingClientRect();
    if (from.width > 0 && to.width > 0) {
      const s = Math.max(0.2, from.height / to.height);
      intro.fromTo(
        mover,
        {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scale: s,
          opacity: 0,
          transformOrigin: "50% 50%",
        },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.0 },
        0,
      );
    }
  }
  // Sin FLIP propio, la figura la revela el overlay cuando la foto
  // viajera llega (la releva con un fundido): acá no se toca.
  if (r.portraitOuter.current && figuraDesdeCard)
    intro.to(r.portraitOuter.current, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);
  if (identity && cardName) {
    const nr = cardName.getBoundingClientRect();
    const line2H = r.idLine2.current?.getBoundingClientRect().height || 64;
    intro.fromTo(
      identity,
      {
        opacity: 0,
        x: () => nr.left - medidas.idBase().left,
        y: () => nr.top - medidas.idBase().top,
        scale: Math.max(0.2, nr.height / line2H),
        transformOrigin: "left top",
      },
      { opacity: 1, x: medidas.heroDx, y: medidas.heroDy, scale: 1, duration: 0.95 },
      0.05,
    );
  } else {
    intro.to(identity, { opacity: 1, duration: 0.6 }, 0.1);
  }
  intro.to(heroEls, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" }, 0.5);
  // Si el usuario scrollea durante la apertura, la coreografía de scroll
  // toma el mando de inmediato (sin pelear dos tweens por el transform).
  const killIntro = () => {
    if (intro.isActive()) intro.progress(1);
  };
  scroller.addEventListener("scroll", killIntro, { once: true });
  return () => scroller.removeEventListener("scroll", killIntro);
}
