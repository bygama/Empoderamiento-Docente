"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import type { Profile, StageVariant } from "@/features/quienes-somos/data/equipo";
import { ACCENT, CategoryRail, StageContent } from "./profileParts";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ImmersiveProfile — MOTOR del perfil inmersivo (Parte 2, refactor editorial).
 *
 * Lógica narrativa: APERTURA FUERTE → TRANSFORMACIÓN DEL HERO → CAMINO →
 * RECORRIDO DOSIFICADO → RAMIFICACIONES → CONVERGENCIA → REGRESO LIMPIO.
 *
 *   · El NOMBRE es UN SOLO elemento (capa fija) que VIAJA: en el hero se ve
 *     grande (posición/tamaño medidos sobre un clon en flujo que reserva el
 *     espacio); con el scroll se achica y se desplaza hasta convertirse en el
 *     encabezado de la columna izquierda. Se anima font-size real (no scale)
 *     → siempre nítido.
 *   · La FIGURA recortada protagoniza la apertura (FLIP desde la foto de la
 *     card) y SE RETIRA al comenzar el recorrido (deriva + fade). Reaparece
 *     recién en la convergencia, integrada al cierre.
 *   · El CAMINO nace bajo la zona del nombre, serpentea entre etapas
 *     alternadas (los nodos quedan SIEMPRE fuera de los bloques de texto,
 *     con puntos-guía por etapa para no atravesar contenido) y converge al
 *     centro hacia el nodo ED del cierre.
 *   · La COLUMNA izquierda es un índice vivo: nace de la transformación del
 *     hero, comparte lenguaje visual con el camino (línea + nodos), marca
 *     activo + memoria de lo recorrido, y se sintetiza al llegar al cierre.
 *   · Reveals con `opacity` (NUNCA autoAlpha en contenido): todo queda en el
 *     árbol de accesibilidad. Al subir, lo ya revelado NO se esconde.
 *
 * REUTILIZABLE: todo sale de `persona.profile` — cantidad de etapas, variantes
 * de composición, categorías. Reduced-motion → layout lineal completo.
 */

const cx = (...p: Array<string | false | undefined>) => p.filter(Boolean).join(" ");

/** Catmull-Rom → cúbicas de Bézier: camino suave que pasa por cada punto. */
function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }
  return d.join(" ");
}

/** Ancho del bloque de contenido por variante (clases literales p/ Tailwind). */
const CONTENT_W: Record<StageVariant | "default", string> = {
  editorial: "max-w-[36rem]",
  ficha: "max-w-[34rem]",
  concepto: "max-w-[34rem]",
  hitos: "max-w-[36rem]",
  mapa: "max-w-[38rem]",
  ramas: "max-w-[40rem]",
  sintesis: "max-w-[36rem]",
  default: "max-w-[36rem]",
};

/* Pose final (sidebar) del bloque de identidad, en px (se anima font-size).
 * `roleMaxW` = ancho de la columna del índice (w-[14.5rem]): el cargo tiene que
 * PLEGARSE ahí. Sin ese límite, un cargo largo —«Líder de Pensamiento
 * Aritmético y Algebraico»— sigue en una sola línea y se mete por encima del
 * contenido de las etapas. En el hero no aplica: ahí el cargo tiene ancho de
 * sobra y va en una línea. */
const ID_FINAL = { line1: 15, line2: 21, role: 10.5, roleGap: 8, roleMaxW: 232 };

export function ImmersiveProfile({
  profile,
  reduced,
  originEl,
  onClose,
}: {
  profile: Profile;
  reduced: boolean;
  /** Card de origen (FLIP figura + nombre). Puede ser null. */
  originEl: HTMLElement | null;
  onClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const identityRef = useRef<HTMLDivElement | null>(null);
  const idLine1Ref = useRef<HTMLSpanElement | null>(null);
  const idLine2Ref = useRef<HTMLSpanElement | null>(null);
  const idRoleRef = useRef<HTMLSpanElement | null>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const cloneL1Ref = useRef<HTMLSpanElement | null>(null);
  const cloneL2Ref = useRef<HTMLSpanElement | null>(null);
  const cloneRoleRef = useRef<HTMLSpanElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroBodyRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const portraitOuterRef = useRef<HTMLDivElement | null>(null);
  const portraitMoverRef = useRef<HTMLDivElement | null>(null);
  const portraitImgRef = useRef<HTMLImageElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const closingRef = useRef<HTMLElement | null>(null);
  const closingFigRef = useRef<HTMLDivElement | null>(null);

  const [activeStage, setActiveStage] = useState(0);
  const total = profile.stages.length;
  const nombrePila = profile.fullName.split(" ")[0];
  const apellido = profile.fullName.split(" ").slice(1).join(" ") || profile.fullName;
  // Buscar por identidad (n), no por posición (motor reutilizable).
  const activeCategoryId =
    activeStage > 0 ? profile.stages.find((s) => s.n === activeStage)?.categoryId ?? null : null;
  const passedIds = new Set(
    profile.stages.filter((s) => s.n <= activeStage).map((s) => s.categoryId),
  );
  /** Tratamiento de la fotografía (ver `Profile.figura`). */
  const figura = profile.figura ?? "recorte";
  // Titular en dos tiempos (frase real, partida en oraciones para jerarquía).
  const headlineParts = profile.headline
    .split(". ")
    .map((s, i, arr) => (i < arr.length - 1 ? `${s}.` : s))
    .filter(Boolean);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const scroller = wrap?.closest<HTMLElement>("[data-profile-scroller]") ?? null;
    if (!wrap || !scroller) return;

    const ctx = gsap.context((self) => {
      const st = <T extends ScrollTrigger.Vars>(v: T) => ({ scroller, ...v });
      const identity = identityRef.current;
      const clone = cloneRef.current;

      /* ── Medición del viaje del nombre (clon en flujo = pose del hero) ──
         Los valores son FUNCIONES + invalidateOnRefresh: se recomputan en
         cada refresh (resize) compensando el scroll actual del scroller. */
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

      // ── VIAJE DEL NOMBRE: hero grande → encabezado de la columna ────────
      // font-size real (layout de un subtree mínimo y fijo) → texto siempre
      // nítido en ambos extremos, sin blur de raster por scale.
      const idTl = gsap.timeline({
        scrollTrigger: st({
          trigger: heroRef.current,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.45,
          invalidateOnRefresh: true,
        }),
      });
      idTl
        .fromTo(identity, { x: heroDx, y: heroDy }, { x: 0, y: 0, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(
          idLine1Ref.current,
          { fontSize: () => fsOf(cloneL1Ref.current, 64) },
          { fontSize: ID_FINAL.line1, ease: "power2.inOut", duration: 1 },
          0,
        )
        .fromTo(
          idLine2Ref.current,
          { fontSize: () => fsOf(cloneL2Ref.current, 64) },
          { fontSize: ID_FINAL.line2, ease: "power2.inOut", duration: 1 },
          0,
        )
        .fromTo(
          idRoleRef.current,
          { fontSize: () => fsOf(cloneRoleRef.current, 15), marginTop: 16 },
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
        const el = idRoleRef.current;
        if (el) el.style.maxWidth = idTl.progress() > 0.9 ? `${ID_FINAL.roleMaxW}px` : "";
      });

      // ── FIGURA: protagonista del hero → se retira al empezar el camino ──
      // (aria-hidden decorativa → autoAlpha ok; el nombre real vive en el h2.)
      // Sin figura (`figura: "sin"`) los refs son null y este tramo se saltea:
      // el recorrido se sostiene con el nombre, el camino y las etapas.
      if (portraitOuterRef.current) {
        gsap.to(portraitOuterRef.current, {
          x: 90,
          scale: 0.95,
          autoAlpha: 0,
          transformOrigin: "bottom right",
          ease: "power1.in",
          scrollTrigger: st({
            trigger: heroRef.current,
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
      gsap.to(heroBodyRef.current, {
        opacity: 0,
        y: -34,
        ease: "none",
        scrollTrigger: st({ trigger: heroRef.current, start: "top top", end: "30% top", scrub: true }),
      });

      // ── SIDEBAR (índice vivo): nace recién cuando el hero ya se retiró ──
      if (sidebarRef.current) {
        gsap.set(sidebarRef.current, { autoAlpha: 0, x: -14 });
        gsap.to(sidebarRef.current, {
          autoAlpha: 1,
          x: 0,
          ease: "none",
          scrollTrigger: st({ trigger: trackRef.current, start: "top 55%", end: "top 28%", scrub: true }),
        });
        // …y se SINTETIZA al llegar a la convergencia (queda solo la identidad).
        gsap.to(sidebarRef.current, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: st({ trigger: closingRef.current, start: "top 62%", end: "top 26%", scrub: true }),
        });
      }

      // ── CAMINO MAESTRO: nace bajo el nombre, serpentea, converge ────────
      const buildPath = () => {
        const track = trackRef.current;
        const svg = svgRef.current;
        const path = pathRef.current;
        if (!track || !svg || !path) return;
        const tr = track.getBoundingClientRect();
        const nodes = gsap.utils.toArray<HTMLElement>("[data-stage-node]", track);
        if (!nodes.length) return;
        const pts: Array<{ x: number; y: number }> = [];
        // Nace desde la zona donde aterrizó el nombre (izquierda, arriba).
        const firstRect = nodes[0].getBoundingClientRect();
        pts.push({
          x: Math.min(firstRect.left - tr.left + firstRect.width / 2, 120),
          y: firstRect.top - tr.top - 170,
        });
        nodes.forEach((n) => {
          const r = n.getBoundingClientRect();
          const li = n.closest("li");
          const nx = r.left - tr.left + r.width / 2;
          const ny = r.top - tr.top + r.height / 2;
          pts.push({ x: nx, y: ny });
          // Punto-guía de salida: abraza el lado del nodo hasta pasar el
          // bloque de contenido y recién ahí cruza (nunca atraviesa texto).
          if (li) {
            const lr = li.getBoundingClientRect();
            const inward = n.dataset.nodeSide === "right" ? -44 : 44;
            pts.push({ x: nx + inward, y: lr.bottom - tr.top + 46 });
          }
        });
        // Convergencia: el trazo confluye al centro, hacia el nodo ED del cierre.
        const cxTrack = tr.width / 2;
        const last = pts[pts.length - 1];
        pts.push({ x: cxTrack, y: last.y + 130 });
        pts.push({ x: cxTrack, y: tr.height - 6 });
        svg.setAttribute("viewBox", `0 0 ${tr.width.toFixed(1)} ${tr.height.toFixed(1)}`);
        path.setAttribute("d", smoothPath(pts));
      };
      // dasharray = longitud EXACTA actual (un único dash que el offset
      // revela) → se re-sincroniza en cada rebuild junto al tween de dibujo.
      const path = pathRef.current;
      let drawTween: gsap.core.Tween | null = null;
      const setupPath = () => {
        buildPath();
        if (!path) return;
        const len = path.getTotalLength();
        if (!len) return;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        drawTween?.scrollTrigger?.kill();
        drawTween?.kill();
        drawTween = gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: st({ trigger: trackRef.current, start: "top 72%", end: "bottom 82%", scrub: 0.5 }),
        });
      };
      setupPath();

      // ── ETAPAS: revelado dosificado + nodo activo (al subir NO se oculta:
      //    la memoria de lo recorrido queda en pantalla) ────────────────────
      gsap.utils.toArray<HTMLElement>("[data-stage]", trackRef.current!).forEach((el) => {
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

      // ── CIERRE: ceremonia de convergencia ───────────────────────────────
      const closeItems = gsap.utils.toArray<HTMLElement>("[data-closing-el]");
      const closeCats = gsap.utils.toArray<HTMLElement>("[data-closing-cat]");
      gsap.set(closeItems, { opacity: 0, y: 26 });
      gsap.set(closeCats, { opacity: 0, x: (i) => (i - (closeCats.length - 1) / 2) * 42 });
      ScrollTrigger.create(
        st({
          trigger: closingRef.current,
          start: "top 72%",
          onEnter: () => {
            gsap.to(closeItems, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", overwrite: true });
            // Las categorías CONVERGEN al centro (síntesis de la columna).
            gsap.to(closeCats, { opacity: 1, x: 0, duration: 0.9, stagger: 0.05, ease: "power3.out", overwrite: true });
          },
        }),
      );
      // La figura reaparece con control, integrada a la convergencia.
      if (closingFigRef.current) {
        gsap.fromTo(
          closingFigRef.current,
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: st({
              trigger: closingRef.current,
              start: "top 70%",
              end: "top 18%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            }),
          },
        );
      }

      /* ── APERTURA: la card se transforma en la historia ──────────────────
         La figura FLIPea desde la foto de la card y el nombre desde el
         caption, mientras el panel blanco (overlay) se expande desde la card.
         Estados iniciales en FASE DE LAYOUT → sin flash sobre el panel. */
      const heroEls = gsap.utils.toArray<HTMLElement>("[data-hero-el]");
      gsap.set(heroEls, { opacity: 0, y: 26 });
      gsap.set(identity, { opacity: 0 });
      if (portraitOuterRef.current) gsap.set(portraitOuterRef.current, { autoAlpha: 0 });

      const intro = gsap.timeline({ delay: 0.18, defaults: { ease: "power3.inOut" } });
      const cardImg = originEl?.querySelector("img");
      const cardName = originEl?.querySelector<HTMLElement>('[data-caption="rest"] [data-card-name]');
      const mover = portraitMoverRef.current;
      if (cardImg && mover && portraitOuterRef.current) {
        const from = cardImg.getBoundingClientRect();
        const to = portraitOuterRef.current.getBoundingClientRect();
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
      if (portraitOuterRef.current)
        intro.to(portraitOuterRef.current, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);
      if (identity && cardName) {
        const nr = cardName.getBoundingClientRect();
        const line2H = idLine2Ref.current?.getBoundingClientRect().height || 64;
        intro.fromTo(
          identity,
          {
            opacity: 0,
            x: () => nr.left - idBase().left,
            y: () => nr.top - idBase().top,
            scale: Math.max(0.2, nr.height / line2H),
            transformOrigin: "left top",
          },
          { opacity: 1, x: heroDx, y: heroDy, scale: 1, duration: 0.95 },
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

      // ── Recalcular tras layout inicial + carga de la figura + resize ────
      const rafId = requestAnimationFrame(() => self.add(() => { setupPath(); ScrollTrigger.refresh(); }));
      const img = portraitImgRef.current;
      const onImgLoad = () => self.add(() => { setupPath(); ScrollTrigger.refresh(); });
      if (img && !img.complete) img.addEventListener("load", onImgLoad, { once: true });
      let rz = 0;
      const onResize = () => {
        window.clearTimeout(rz);
        rz = window.setTimeout(() => self.add(() => { setupPath(); ScrollTrigger.refresh(); }), 180);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(rafId);
        window.clearTimeout(rz);
        img?.removeEventListener("load", onImgLoad);
        window.removeEventListener("resize", onResize);
        scroller.removeEventListener("scroll", killIntro);
      };
    }, wrapRef);

    return () => ctx.revert();
  }, [reduced, profile, originEl]);

  // ════════════════════════ REDUCED MOTION (lineal) ═══════════════════════
  if (reduced) {
    return (
      <div ref={wrapRef} className="relative mx-auto max-w-screen-lg px-6 py-20 md:px-10">
        <header className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="text-verde-concepto-texto font-mono text-[0.72rem] font-semibold tracking-[0.22em] uppercase">
              {profile.role}
            </span>
            <h2
              className="font-display text-azul-principal mt-3 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 1.4rem + 2vw, 3rem)", lineHeight: 1.05 }}
            >
              {profile.fullName}
            </h2>
            <p className="text-azul-medio mt-5 max-w-[34ch] font-display text-[1.4rem] leading-[1.15] font-semibold">
              {profile.headline}
            </p>
            <p className="text-gris-texto mt-4 max-w-[52ch] font-sans text-[1rem] leading-relaxed">{profile.intro}</p>
          </div>
          {figura === "recorte" && profile.cutout && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.cutout}
              alt={profile.fullName}
              className="mx-auto max-h-[52vh] w-auto object-contain"
              style={{ objectPosition: profile.cutoutPosition }}
            />
          )}
          {figura === "marco" && profile.cutout && (
            <div className="ring-azul-principal/10 mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-36px_rgb(31_45_77/0.45)] ring-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.cutout}
                alt={profile.fullName}
                className="h-full w-full object-cover"
                style={{ objectPosition: profile.cutoutPosition }}
              />
            </div>
          )}
        </header>

        <div className="border-azul-principal/10 mt-10 border-t pt-8">
          <CategoryRail categories={profile.categories} activeId={null} variant="inline" />
        </div>

        <ol className="border-azul-principal/12 mt-12 space-y-14 border-l-2 pl-8">
          {profile.stages.map((stage) => (
            <li key={stage.id} className="relative">
              <span
                aria-hidden="true"
                className={cx("ring-gris-fondo absolute top-1.5 -left-[41px] h-4 w-4 rounded-full ring-4", ACCENT[stage.color].bg)}
              />
              <StageContent stage={stage} />
            </li>
          ))}
        </ol>

        <section className="border-azul-principal/10 mt-16 border-t pt-10">
          <h3
            className="font-display text-azul-principal font-bold tracking-[-0.015em]"
            style={{ fontSize: "clamp(1.6rem, 1.1rem + 1.4vw, 2.2rem)", lineHeight: 1.12 }}
          >
            {profile.closing.title}
          </h3>
          <p className="text-gris-texto mt-4 max-w-[58ch] font-sans text-[1.05rem] leading-relaxed">{profile.closing.body}</p>
          {profile.closing.body2 && (
            <p className="text-azul-medio mt-3 max-w-[58ch] font-sans text-[1.05rem] leading-relaxed">{profile.closing.body2}</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto-texto focus-visible:outline-verde-concepto mt-8 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 font-sans text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowRight size={16} className="rotate-180" />
            Volver a la red
          </button>
        </section>
      </div>
    );
  }

  // ════════════════════════ INMERSIVO (desktop, con scroll) ═══════════════
  return (
    <div ref={wrapRef} className="relative">
      {/* ── IDENTIDAD (capa fija): el nombre que VIAJA del hero a la columna.
          Es el h2 real (siempre en el árbol de accesibilidad). ── */}
      <div
        ref={identityRef}
        data-identity
        className="pointer-events-none fixed top-[5rem] z-[7] hidden lg:block"
        style={{ left: "max(1.25rem, calc((100vw - 1440px)/2 + 1.5rem))" }}
      >
        <h2 className="font-display text-azul-principal font-bold tracking-[-0.02em]">
          <span ref={idLine1Ref} className="block" style={{ fontSize: ID_FINAL.line1, lineHeight: 1.06 }}>
            {nombrePila}
          </span>
          <span ref={idLine2Ref} className="block" style={{ fontSize: ID_FINAL.line2, lineHeight: 1.06 }}>
            {apellido}
          </span>
        </h2>
        <span
          ref={idRoleRef}
          className="text-verde-concepto-texto block font-mono font-semibold tracking-[0.2em] uppercase"
          style={{ fontSize: ID_FINAL.role, marginTop: ID_FINAL.roleGap }}
        >
          {profile.role}
        </span>
      </div>

      {/* ── ÍNDICE VIVO (fijo, bajo el nombre aterrizado) ── */}
      <aside
        ref={sidebarRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-[12.5rem] z-[6] hidden w-[14.5rem] flex-col lg:flex"
        style={{ left: "max(1.25rem, calc((100vw - 1440px)/2 + 1.5rem))" }}
      >
        <CategoryRail categories={profile.categories} activeId={activeCategoryId} passedIds={passedIds} variant="sidebar" />
        <div className="mt-8 pl-5">
          <div className="text-gris-texto flex items-center justify-between font-mono text-[0.62rem] tracking-[0.12em] uppercase">
            <span>Recorrido</span>
            <span>
              {String(activeStage).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <div className="bg-azul-principal/10 mt-2 h-[3px] w-full overflow-hidden rounded-full">
            <div
              className="bg-verde-concepto h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${(activeStage / total) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* ── FIGURA (capa fija): protagonista de la apertura, se retira al
          empezar el recorrido. Con recorte va parada sobre el borde inferior y
          sin rectángulo; con foto normal va enmarcada y flotando (una foto
          rectangular "apoyada en el piso" se lee como un error de recorte). ── */}
      {figura !== "sin" && profile.cutout && (
        <div
          ref={portraitOuterRef}
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 z-[5] hidden h-[min(74vh,700px)] w-[30rem] items-end justify-end lg:flex"
          style={{ right: "max(1.25rem, calc((100vw - 1440px)/2 + 2rem))" }}
        >
          <div
            ref={portraitMoverRef}
            className={cx(
              "relative flex h-full w-full items-end justify-end",
              figura === "marco" && "pb-[9vh]",
            )}
          >
            {figura === "marco" ? (
              <div className="ring-azul-principal/10 relative h-[min(58vh,520px)] w-[clamp(14rem,21vw,19rem)] overflow-hidden rounded-[1.75rem] shadow-[0_44px_90px_-44px_rgb(31_45_77/0.5)] ring-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={portraitImgRef}
                  src={profile.cutout}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: profile.cutoutPosition }}
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={portraitImgRef}
                src={profile.cutout}
                alt=""
                className="h-full w-auto object-contain object-bottom drop-shadow-[0_18px_44px_rgb(31_45_77/0.12)]"
                style={{
                  objectPosition: profile.cutoutPosition,
                  maskImage: "linear-gradient(to bottom, #000 86%, rgb(0 0 0 / 0.4) 97%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 86%, rgb(0 0 0 / 0.4) 97%, transparent 100%)",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Contenido scrolleable (banda compartida con las capas fijas) ── */}
      <div className="relative z-[4] mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,4vw,3rem)]">
        {/* HERO — apertura editorial: nombre protagonista + frase con peso */}
        <section ref={heroRef} className="relative flex min-h-[100svh] flex-col justify-center pt-24 pb-16">
          {/* Patrón de marca SOLO acá: sutil, localizado tras la figura */}
          <span
            aria-hidden="true"
            className="pattern-dots absolute top-[8%] right-[-2%] h-[64%] w-[40%] opacity-[0.05]"
            style={{
              maskImage: "radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 78%)",
            }}
          />
          <div className="max-w-[46rem] lg:pr-0">
            {/* Clon del nombre (reserva el espacio del que viaja — solo layout) */}
            <div ref={cloneRef} aria-hidden="true" className="invisible">
              <span
                ref={cloneL1Ref}
                className="font-display block font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.7rem, 1.8rem + 2.8vw, 4.4rem)", lineHeight: 1.06 }}
              >
                {nombrePila}
              </span>
              <span
                ref={cloneL2Ref}
                className="font-display block font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.7rem, 1.8rem + 2.8vw, 4.4rem)", lineHeight: 1.06 }}
              >
                {apellido}
              </span>
              <span
                ref={cloneRoleRef}
                className="block font-mono font-semibold tracking-[0.2em] uppercase"
                style={{ fontSize: "0.95rem", marginTop: 16 }}
              >
                {profile.role}
              </span>
            </div>

            <div ref={heroBodyRef}>
              <p
                data-hero-el
                className="font-display mt-8 font-semibold tracking-[-0.015em]"
                style={{ fontSize: "clamp(1.45rem, 1.05rem + 1.3vw, 2.05rem)", lineHeight: 1.22 }}
              >
                {headlineParts.map((part, i) => (
                  <span key={i} className={cx("block", i === 0 ? "text-azul-principal" : "text-azul-medio")}>
                    {part}
                  </span>
                ))}
              </p>
              <p data-hero-el className="text-gris-texto mt-5 max-w-[44ch] font-sans text-[1.02rem] leading-relaxed">
                {profile.intro}
              </p>
              <span
                data-hero-el
                className="text-azul-medio mt-10 inline-flex items-center gap-2.5 font-mono text-[0.72rem] tracking-[0.16em] uppercase"
              >
                <span
                  aria-hidden="true"
                  className="border-azul-principal/25 flex h-8 w-5 items-start justify-center rounded-full border pt-1.5"
                >
                  <span className="bg-verde-concepto h-1.5 w-1 rounded-full motion-safe:animate-[scroll-nudge_1.9s_ease-in-out_infinite]" />
                </span>
                Descubrí su recorrido
              </span>
            </div>
          </div>
        </section>

        {/* RECORRIDO — camino maestro + etapas alternadas de composición variada */}
        <div ref={trackRef} className="relative pt-8 pb-44">
          <svg
            ref={svgRef}
            aria-hidden="true"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          >
            <path
              ref={pathRef}
              d=""
              fill="none"
              stroke="#4a6fa5"
              strokeOpacity={0.45}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <ol className="relative z-10 space-y-36 lg:pl-[16rem]">
            {profile.stages.map((stage, i) => {
              const a = ACCENT[stage.color];
              const passed = stage.n <= activeStage;
              const current = stage.n === activeStage;
              const contentRight = i % 2 === 1;
              const nodeSide = contentRight ? "left" : "right";
              return (
                <li key={stage.id} data-stage data-stage-n={stage.n} className="relative">
                  {/* Nodo del camino — SIEMPRE del lado opuesto al contenido */}
                  <span
                    data-stage-node
                    data-node-side={nodeSide}
                    aria-hidden="true"
                    className="absolute top-1 flex h-10 w-10 items-center justify-center"
                    style={nodeSide === "right" ? { left: "min(42rem, 82%)" } : { left: "2.5%" }}
                  >
                    <span
                      className={cx(
                        // 14.1px bold = "texto grande" para WCAG: el numeral en
                        // blanco sobre el acento queda sobre el umbral de 3:1.
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-[0.88rem] font-bold transition-all duration-500",
                        !current && "bg-white",
                        passed ? cx(a.border, a.text) : "border-azul-principal/20 text-azul-principal/35",
                        current && cx(a.bg, a.glow, "scale-110 !text-white"),
                      )}
                    >
                      {stage.n}
                    </span>
                  </span>

                  <div className={cx("relative", CONTENT_W[stage.variant ?? "default"], contentRight && "ml-auto")}>
                    <StageContent stage={stage} side={nodeSide} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* CIERRE — la convergencia: escala, aire y ceremonia */}
        <section ref={closingRef} className="relative flex min-h-[96svh] flex-col items-center justify-center pb-24 text-center">
          <span
            aria-hidden="true"
            className="pattern-dots absolute inset-x-[22%] top-[8%] h-[52%] opacity-[0.04]"
            style={{
              maskImage: "radial-gradient(ellipse 60% 55% at 50% 40%, #000 25%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 40%, #000 25%, transparent 75%)",
            }}
          />
          {/* La figura reaparece, integrada a la convergencia */}
          {figura !== "sin" && profile.cutout && (
            <div
              ref={closingFigRef}
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute right-[3%] hidden lg:block",
                figura === "marco" ? "bottom-[9%] h-[min(36vh,320px)]" : "bottom-0 h-[min(48vh,440px)]",
              )}
            >
              {figura === "marco" ? (
                <div className="ring-azul-principal/10 h-full w-[calc(min(36vh,320px)*0.8)] overflow-hidden rounded-[1.4rem] opacity-95 shadow-[0_34px_70px_-40px_rgb(31_45_77/0.45)] ring-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.cutout}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: profile.cutoutPosition }}
                  />
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.cutout}
                  alt=""
                  className="h-full w-auto object-contain object-bottom opacity-90"
                  style={{
                    maskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
                  }}
                />
              )}
            </div>
          )}

          <div className="relative max-w-[48rem]">
            <span
              data-closing-el
              className="bg-verde-concepto mx-auto flex h-12 w-12 items-center justify-center rounded-full font-mono text-[0.9rem] font-bold text-white shadow-[0_0_0_9px_rgb(31_154_120/0.13)]"
            >
              ED
            </span>
            {/* Síntesis de la columna: las dimensiones convergen en una línea */}
            <ul aria-hidden="true" className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              {profile.categories.map((c, i) => (
                <li key={c.id} data-closing-cat className="text-gris-texto/90 flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.16em] uppercase">
                  {i > 0 && <span aria-hidden="true" className="bg-azul-principal/25 h-1 w-1 rounded-full" />}
                  {c.label}
                </li>
              ))}
            </ul>
            <h3
              data-closing-el
              className="font-display text-azul-principal mt-7 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.1rem, 1.4rem + 2.2vw, 3.2rem)", lineHeight: 1.06 }}
            >
              {profile.closing.title}
            </h3>
            <p data-closing-el className="text-gris-texto mx-auto mt-6 max-w-[52ch] font-sans text-[1.08rem] leading-relaxed">
              {profile.closing.body}
            </p>
            {profile.closing.body2 && (
              <p data-closing-el className="text-azul-medio mx-auto mt-3 max-w-[52ch] font-sans text-[1.08rem] leading-relaxed">
                {profile.closing.body2}
              </p>
            )}
            <div data-closing-el className="mt-12">
              <button
                type="button"
                onClick={onClose}
                className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto-texto focus-visible:outline-verde-concepto inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 font-sans text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <ArrowRight size={16} className="rotate-180" />
                Volver a la red
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
