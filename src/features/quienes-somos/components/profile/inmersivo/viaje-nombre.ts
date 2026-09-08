import gsap from "gsap";
import { ID_FINAL } from "./estilos";
import type { RefsPerfil, St } from "./refs-perfil";

/**
 * Medición del viaje del nombre (clon en flujo = pose del hero). Los valores
 * son FUNCIONES + invalidateOnRefresh: se recomputan en cada refresh (resize)
 * compensando el scroll actual del scroller.
 */
export function medirNombre(r: RefsPerfil, scroller: HTMLElement) {
  const identity = r.identity.current;
  const clone = r.clone.current;
  const fsOf = (el: HTMLElement | null, fallback: number) =>
    el ? parseFloat(getComputedStyle(el).fontSize) || fallback : fallback;
  const idBase = () => {
    const cs = identity ? getComputedStyle(identity) : null;
    return { left: cs ? parseFloat(cs.left) || 0 : 0, top: cs ? parseFloat(cs.top) || 0 : 0 };
  };
  const heroDx = () => {
    if (!clone) return 0;
    return clone.getBoundingClientRect().left - idBase().left;
  };
  const heroDy = () => {
    if (!clone) return 0;
    return clone.getBoundingClientRect().top + scroller.scrollTop - idBase().top;
  };
  return { fsOf, idBase, heroDx, heroDy };
}

export type MedidasNombre = ReturnType<typeof medirNombre>;

/**
 * TRANSFORMACIÓN DEL HERO con el scroll: el nombre viaja (hero grande →
 * encabezado de la columna), la figura se retira, el cuerpo del hero se
 * disuelve y nace el índice vivo, que se sintetiza al llegar al cierre.
 */
export function crearTransformacionHero(r: RefsPerfil, st: St, m: MedidasNombre) {
  const identity = r.identity.current;

  // ── VIAJE DEL NOMBRE: hero grande → encabezado de la columna ────────
  // font-size real (layout de un subtree mínimo y fijo) → texto siempre
  // nítido en ambos extremos, sin blur de raster por scale.
  const idTl = gsap.timeline({
    scrollTrigger: st({
      trigger: r.hero.current,
      start: "top top",
      end: "bottom 30%",
      scrub: 0.45,
      invalidateOnRefresh: true,
    }),
  });
  idTl
    .fromTo(identity, { x: m.heroDx, y: m.heroDy }, { x: 0, y: 0, ease: "power2.inOut", duration: 1 }, 0)
    .fromTo(
      r.idLine1.current,
      { fontSize: () => m.fsOf(r.cloneL1.current, 64) },
      { fontSize: ID_FINAL.line1, ease: "power2.inOut", duration: 1 },
      0,
    )
    .fromTo(
      r.idLine2.current,
      { fontSize: () => m.fsOf(r.cloneL2.current, 64) },
      { fontSize: ID_FINAL.line2, ease: "power2.inOut", duration: 1 },
      0,
    )
    .fromTo(
      r.idRole.current,
      { fontSize: () => m.fsOf(r.cloneRole.current, 15), marginTop: 16 },
      { fontSize: ID_FINAL.role, marginTop: ID_FINAL.roleGap, ease: "power2.inOut", duration: 1 },
      0,
    );

  // El cargo se PLIEGA al ancho de la columna sobre el final del viaje. Va
  // escrito a mano sobre el DOM y no como propiedad del tween: acá no
  // interesa interpolar un ancho, sino el punto exacto en que el cargo deja
  // de ser una línea del hero y pasa a ser el subtítulo de la columna.
  // Antes de este pliegue, un cargo largo seguía de largo por encima del
  // contenido de las etapas.
  idTl.eventCallback("onUpdate", () => {
    const el = r.idRole.current;
    if (el) el.style.maxWidth = idTl.progress() > 0.9 ? `${ID_FINAL.roleMaxW}px` : "";
  });

  // ── FIGURA: protagonista del hero → se retira al empezar el camino ──
  // (aria-hidden decorativa → autoAlpha ok; el nombre real vive en el h2.)
  // Sin figura (`figura: "sin"`) los refs son null y este tramo se saltea:
  // el recorrido se sostiene con el nombre, el camino y las etapas.
  if (r.portraitOuter.current) {
    gsap.to(r.portraitOuter.current, {
      x: 90,
      scale: 0.95,
      autoAlpha: 0,
      transformOrigin: "bottom right",
      ease: "power1.in",
      scrollTrigger: st({
        trigger: r.hero.current,
        start: "top top",
        end: "bottom 68%",
        scrub: 0.5,
        invalidateOnRefresh: true,
      }),
    });
  }

  // ── Cuerpo del hero (frase, intro, pista) se disuelve hacia arriba ──
  // Rápido: debe estar resuelto ANTES de que el nombre aterrice y la
  // columna aparezca (si no, tres capas se pisan en la transición).
  gsap.to(r.heroBody.current, {
    opacity: 0,
    y: -34,
    ease: "none",
    scrollTrigger: st({ trigger: r.hero.current, start: "top top", end: "30% top", scrub: true }),
  });

  // ── SIDEBAR (índice vivo): nace recién cuando el hero ya se retiró ──
  if (r.sidebar.current) {
    gsap.set(r.sidebar.current, { autoAlpha: 0, x: -14 });
    gsap.to(r.sidebar.current, {
      autoAlpha: 1,
      x: 0,
      ease: "none",
      scrollTrigger: st({ trigger: r.track.current, start: "top 55%", end: "top 28%", scrub: true }),
    });
    // …y se SINTETIZA al llegar a la convergencia (queda solo la identidad).
    gsap.to(r.sidebar.current, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: st({ trigger: r.closing.current, start: "top 62%", end: "top 26%", scrub: true }),
    });
  }
}
