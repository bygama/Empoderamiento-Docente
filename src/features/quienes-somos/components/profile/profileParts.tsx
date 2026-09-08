"use client";

import { BookOpen } from "@/components/ui/icons";
import type {
  Milestone,
  ProfileCategory,
  ProfilePublication,
  ProfileStage,
} from "@/features/quienes-somos/data/equipo";
import { ACCENT } from "./acentos";

/**
 * PIEZAS PRESENTACIONALES del perfil inmersivo (Parte 2, refactor editorial).
 *
 * Cambio de enfoque respecto de la iteración anterior: NADA de "otra card
 * blanca más". El lienzo es blanco y cada etapa tiene una COMPOSICIÓN propia
 * (`stage.variant`): bloque editorial sin chrome, ficha breve, cita destacada,
 * hitos jerarquizados, constelación territorial, ramificaciones y síntesis.
 * La información se dosifica: 1-2 piezas primarias con aire; lo secundario en
 * líneas compactas de una sola jerarquía visual.
 *
 * Puro layout + tipografía, SIN animación: los mismos bloques se usan en el
 * recorrido inmersivo (GSAP encima) y en el fallback reduced-motion (flujo
 * lineal) — contenido idéntico, comprensible sin movimiento.
 */

const cx = (...p: Array<string | false | undefined>) => p.filter(Boolean).join(" ");

type Side = "left" | "right";

/* ── Encabezado común de etapa (jerarquía por variante) ───────────────── */
const TITLE_SIZE: Record<NonNullable<ProfileStage["variant"]> | "default", string> = {
  editorial: "clamp(2rem, 1.4rem + 1.9vw, 2.9rem)",
  ficha: "clamp(1.55rem, 1.15rem + 1.1vw, 2.05rem)",
  concepto: "clamp(1.75rem, 1.25rem + 1.5vw, 2.45rem)",
  hitos: "clamp(1.6rem, 1.2rem + 1.2vw, 2.15rem)",
  mapa: "clamp(1.7rem, 1.25rem + 1.4vw, 2.3rem)",
  ramas: "clamp(1.6rem, 1.2rem + 1.2vw, 2.15rem)",
  sintesis: "clamp(1.85rem, 1.35rem + 1.6vw, 2.6rem)",
  default: "clamp(1.6rem, 1.2rem + 1.2vw, 2.15rem)",
};

function StageHeader({ stage }: { stage: ProfileStage }) {
  const a = ACCENT[stage.color];
  return (
    <>
      <div data-reveal-el className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={cx("font-mono text-[0.7rem] font-semibold tracking-[0.2em] uppercase", a.text)}>
          {stage.eyebrow}
        </span>
        {stage.period && (
          <span className="text-gris-texto/80 font-mono text-[0.7rem] tracking-[0.1em]">{stage.period}</span>
        )}
      </div>
      <h3
        data-reveal-el
        className="font-display text-azul-principal mt-3 font-bold tracking-[-0.018em]"
        style={{ fontSize: TITLE_SIZE[stage.variant ?? "default"], lineHeight: 1.08 }}
      >
        {stage.title}
      </h3>
      <p
        data-reveal-el
        className={cx(
          "text-gris-texto mt-4 font-sans leading-relaxed",
          stage.variant === "editorial" ? "max-w-[50ch] text-[1.06rem]" : "max-w-[46ch] text-[0.98rem]",
        )}
      >
        {stage.body}
      </p>
    </>
  );
}

/* ── Lista mínima (editorial): renglones sin chrome, un solo nivel ────── */
function MiniList({ items, color }: { items: Milestone[]; color: ProfileStage["color"] }) {
  const a = ACCENT[color];
  return (
    <ul className="mt-7 space-y-2.5">
      {items.map((m, i) => (
        <li key={i} data-reveal-el className="flex items-baseline gap-3">
          <span aria-hidden="true" className={cx("h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full", a.bg)} />
          <span className="font-sans text-[0.95rem] leading-snug">
            <span className="text-azul-principal font-medium">{m.title}</span>
            {m.detail && <span className="text-gris-texto"> — {m.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Renglón compacto (secundarios): período + título en una línea ────── */
function CompactRow({ m, color }: { m: Milestone; color: ProfileStage["color"] }) {
  const a = ACCENT[color];
  return (
    <li data-reveal-el className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      {m.period && (
        <span className={cx("shrink-0 font-mono text-[0.66rem] font-medium tracking-[0.1em]", a.text)}>{m.period}</span>
      )}
      <span className="text-azul-principal font-sans text-[0.9rem] leading-snug font-medium">{m.title}</span>
      {m.detail && <span className="text-gris-texto font-sans text-[0.8rem]">· {m.detail}</span>}
    </li>
  );
}

/* ── Hito primario: renglón con aire y borde de acento ────────────────── */
function PrimaryRow({ m, color }: { m: Milestone; color: ProfileStage["color"] }) {
  const a = ACCENT[color];
  return (
    <li data-reveal-el className={cx("border-l-2 py-1 pl-5", a.border)}>
      {m.period && (
        <span className={cx("font-mono text-[0.68rem] font-semibold tracking-[0.12em] uppercase", a.text)}>
          {m.period}
        </span>
      )}
      <p className="text-azul-principal mt-1 font-display text-[1.12rem] leading-snug font-bold">{m.title}</p>
      {m.detail && <p className="text-gris-texto mt-0.5 font-sans text-[0.86rem] leading-snug">{m.detail}</p>}
    </li>
  );
}

/* ── VARIANTE ficha: panel breve + ramas satélite (estancias) ─────────── */
function FichaPanel({ stage }: { stage: ProfileStage }) {
  const a = ACCENT[stage.color];
  return (
    <div className="mt-7">
      <div
        data-reveal-el
        className="border-azul-principal/10 bg-gris-fondo/60 max-w-[30rem] rounded-2xl border p-5"
      >
        <ul className="space-y-4">
          {stage.milestones?.map((m, i) => (
            <li key={i}>
              {m.period && (
                <span className={cx("font-mono text-[0.66rem] font-semibold tracking-[0.12em] uppercase", a.text)}>
                  {m.period}
                </span>
              )}
              <p className="text-azul-principal mt-0.5 font-sans text-[0.96rem] leading-snug font-semibold">{m.title}</p>
              {m.detail && <p className="text-gris-texto mt-0.5 font-sans text-[0.82rem]">{m.detail}</p>}
            </li>
          ))}
        </ul>
      </div>
      {stage.branches && stage.branches.length > 0 && (
        <div className="mt-5">
          <span data-reveal-el className="text-gris-texto/90 font-mono text-[0.62rem] tracking-[0.18em] uppercase">
            Ramificaciones · estancias
          </span>
          <ul className="mt-2.5 flex flex-wrap gap-3">
            {stage.branches.map((b, i) => (
              <li
                key={i}
                data-reveal-el
                className="border-azul-principal/15 relative rounded-lg border border-dashed px-3.5 py-2"
              >
                <span className="flex items-center gap-2">
                  <span className={cx("h-1.5 w-1.5 rounded-full", a.bg)} aria-hidden="true" />
                  <span className="text-azul-principal font-mono text-[0.66rem] font-medium tracking-[0.14em] uppercase">
                    {b.place}
                  </span>
                  {b.period && <span className="text-gris-texto font-mono text-[0.66rem]">· {b.period}</span>}
                </span>
                <p className="text-gris-texto mt-1 max-w-[24ch] font-sans text-[0.78rem] leading-snug">{b.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── VARIANTE concepto: cita destacada + línea sostenida + pieza clave ── */
function ConceptoBlock({ stage }: { stage: ProfileStage }) {
  const a = ACCENT[stage.color];
  const featured = stage.publications?.find((p) => p.featured) ?? stage.publications?.[0];
  return (
    <div className="mt-8">
      {stage.quote && (
        <blockquote data-reveal-el className={cx("relative max-w-[44ch] border-l-2 pl-6", a.border)}>
          <span aria-hidden="true" className={cx("font-display absolute -top-3 left-2 text-[2.6rem] leading-none font-bold opacity-25", a.text)}>
            “
          </span>
          <p className="font-display text-azul-principal text-[1.28rem] leading-[1.3] font-semibold tracking-[-0.01em]">
            {stage.quote}
          </p>
        </blockquote>
      )}
      {stage.milestones && (
        <div className="mt-7">
          <span data-reveal-el className="text-gris-texto/90 font-mono text-[0.62rem] tracking-[0.18em] uppercase">
            Una línea sostenida
          </span>
          <ul className="mt-2.5 space-y-1.5">
            {stage.milestones.map((m, i) => (
              <CompactRow key={i} m={{ period: m.period, title: m.title }} color={stage.color} />
            ))}
          </ul>
        </div>
      )}
      {featured && (
        <div data-reveal-el className={cx("mt-7 inline-flex max-w-[30rem] items-start gap-3.5 rounded-2xl border bg-white p-4.5 ring-1", a.border, a.ring)}>
          <span className={cx("mt-0.5 shrink-0", a.text)} aria-hidden="true">
            <BookOpen size={18} />
          </span>
          <span>
            <span className={cx("font-mono text-[0.64rem] font-semibold tracking-[0.16em] uppercase", a.text)}>
              {featured.kind} · {featured.year}
            </span>
            <span className="text-azul-principal mt-0.5 block font-display text-[1rem] leading-snug font-bold">
              {featured.title}
            </span>
            {featured.meta && <span className="text-gris-texto mt-0.5 block font-sans text-[0.8rem]">{featured.meta}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── VARIANTE hitos: primarios con aire + secundarios compactos ───────── */
function HitosBlock({ stage }: { stage: ProfileStage }) {
  const primarios = stage.milestones?.filter((m) => m.primary) ?? [];
  const resto = stage.milestones?.filter((m) => !m.primary) ?? [];
  return (
    <div className="mt-7">
      {primarios.length > 0 && <ul className="space-y-5">{primarios.map((m, i) => <PrimaryRow key={i} m={m} color={stage.color} />)}</ul>}
      {resto.length > 0 && (
        <div className="mt-6">
          <span data-reveal-el className="text-gris-texto/90 font-mono text-[0.62rem] tracking-[0.18em] uppercase">
            También en esos años
          </span>
          <ul className="mt-2.5 space-y-1.5">
            {resto.map((m, i) => (
              <CompactRow key={i} m={m} color={stage.color} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── VARIANTE mapa: constelación de territorios (no lista) ────────────── */
function MapaBlock({ stage }: { stage: ProfileStage }) {
  const a = ACCENT[stage.color];
  const offsets = [0, 14, -8, 18, 4];
  return (
    <ul className="mt-8 flex max-w-[38rem] flex-wrap items-start gap-x-4 gap-y-5">
      {stage.tags?.map((t, i) => (
        <li
          key={i}
          data-reveal-el
          className="border-azul-principal/12 rounded-full border bg-white px-4 py-2 font-sans text-[0.86rem] font-medium text-azul-principal shadow-[0_10px_28px_-20px_rgb(31_45_77/0.35)]"
          style={{ transform: `translateY(${offsets[i % offsets.length]}px)` }}
        >
          <span className={cx("mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle", a.bg)} aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ── Pieza editorial (publicación) como ramificación del camino ───────── */
function PubPiece({
  pub,
  color,
  side,
}: {
  pub: ProfilePublication;
  color: ProfileStage["color"];
  side: Side;
}) {
  const a = ACCENT[color];
  return (
    <article
      data-reveal-el
      className={cx(
        "relative rounded-2xl border p-5",
        pub.featured
          ? cx("bg-white ring-1 shadow-[0_22px_54px_-38px_rgb(31_45_77/0.45)]", a.border, a.ring)
          : "border-azul-principal/12 bg-white/0",
      )}
    >
      {/* Tallo hacia el camino: dot en el borde del lado del nodo */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute top-6 h-2 w-2 rounded-full ring-4 ring-white",
          a.bg,
          side === "right" ? "-right-1" : "-left-1",
        )}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={cx("font-mono text-[0.64rem] font-semibold tracking-[0.16em] uppercase", a.text)}>
          {pub.kind}
        </span>
        {pub.year && <span className="text-gris-texto font-mono text-[0.7rem] tracking-[0.1em]">{pub.year}</span>}
      </div>
      <h4 className="font-display text-azul-principal mt-2 text-[1.02rem] leading-snug font-bold">{pub.title}</h4>
      {pub.meta && <p className="text-gris-texto mt-1.5 font-sans text-[0.8rem] leading-snug">{pub.meta}</p>}
      {pub.concepts && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pub.concepts.map((c) => (
            <li key={c} className={cx("rounded-md px-2 py-0.5 font-mono text-[0.64rem] tracking-[0.08em] text-azul-principal", a.soft)}>
              {c}
            </li>
          ))}
        </ul>
      )}
      {pub.featured && (
        <span className={cx("mt-3.5 inline-flex items-center gap-1.5 font-sans text-[0.72rem] font-medium", a.text)}>
          <BookOpen size={14} /> Pieza destacada
        </span>
      )}
    </article>
  );
}

/* ── VARIANTE ramas: piezas escalonadas colgando del camino ───────────── */
function RamasBlock({ stage, side }: { stage: ProfileStage; side: Side }) {
  const pubs = stage.publications ?? [];
  return (
    <div className="mt-8 grid max-w-[40rem] gap-5 sm:grid-cols-2">
      {pubs.map((p, i) => (
        <div key={i} className={cx(i % 2 === 1 && "sm:translate-y-8")}>
          <PubPiece pub={p} color={stage.color} side={side} />
        </div>
      ))}
    </div>
  );
}

/* ── VARIANTE sintesis: rol protagonista + roles actuales compactos ───── */
function SintesisBlock({ stage }: { stage: ProfileStage }) {
  const a = ACCENT[stage.color];
  const principal = stage.milestones?.find((m) => m.primary);
  const resto = stage.milestones?.filter((m) => !m.primary) ?? [];
  return (
    <div className="mt-8">
      {principal && (
        <div data-reveal-el className={cx("max-w-[32rem] rounded-2xl p-6", a.soft)}>
          <span className={cx("font-mono text-[0.66rem] font-semibold tracking-[0.16em] uppercase", a.text)}>
            {principal.period}
          </span>
          <p className="text-azul-principal mt-1.5 font-display text-[1.4rem] leading-[1.15] font-bold tracking-[-0.01em]">
            {principal.title}
          </p>
        </div>
      )}
      {resto.length > 0 && (
        <div className="mt-6">
          <span data-reveal-el className="text-gris-texto/90 font-mono text-[0.62rem] tracking-[0.18em] uppercase">
            En paralelo, hoy
          </span>
          <ul className="mt-2.5 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {resto.map((m, i) => (
              <CompactRow key={i} m={m} color={stage.color} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Cuerpo completo de una etapa según su variante ───────────────────── */
export function StageContent({ stage, side = "left" }: { stage: ProfileStage; side?: Side }) {
  const v = stage.variant ?? "editorial";
  return (
    <div>
      <StageHeader stage={stage} />
      {v === "editorial" && stage.milestones && <MiniList items={stage.milestones} color={stage.color} />}
      {v === "ficha" && <FichaPanel stage={stage} />}
      {v === "concepto" && <ConceptoBlock stage={stage} />}
      {v === "hitos" && <HitosBlock stage={stage} />}
      {v === "mapa" && <MapaBlock stage={stage} />}
      {v === "ramas" && <RamasBlock stage={stage} side={side} />}
      {v === "sintesis" && <SintesisBlock stage={stage} />}
    </div>
  );
}

/* ── Riel de categorías: índice vivo del recorrido ────────────────────── */
export function CategoryRail({
  categories,
  activeId,
  passedIds,
  variant = "sidebar",
}: {
  categories: ProfileCategory[];
  activeId: string | null;
  /** Categorías ya recorridas (memoria visual del camino). */
  passedIds?: Set<string>;
  variant?: "sidebar" | "inline";
}) {
  if (variant === "inline") {
    return (
      <ul className="flex flex-wrap gap-2.5">
        {categories.map((c) => {
          const a = ACCENT[c.color];
          return (
            <li key={c.id}>
              <span className="border-azul-principal/12 flex items-center gap-2.5 rounded-full border bg-white/70 px-3 py-1.5 text-[0.8rem]">
                <span aria-hidden="true" className={cx("block h-2 w-2 shrink-0 rounded-full", a.bg)} />
                <span className="text-azul-principal/80 font-sans leading-snug font-medium">{c.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="relative space-y-3.5 pl-5">
      {/* Mini-camino del índice: misma familia visual que el trazo central */}
      <span aria-hidden="true" className="bg-azul-principal/12 absolute top-1 bottom-1 left-[3px] w-[2px] rounded-full" />
      {categories.map((c) => {
        const active = c.id === activeId;
        const passed = passedIds?.has(c.id) ?? false;
        const a = ACCENT[c.color];
        return (
          <li key={c.id} className="relative">
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-[0.42rem] left-[-1.25rem] block rounded-full transition-all duration-500",
                active
                  ? cx(a.bg, "h-2.5 w-2.5 translate-x-[-0.5px]", a.glow)
                  : passed
                    ? cx(a.bg, "h-2 w-2")
                    : "bg-azul-principal/25 h-2 w-2",
              )}
            />
            <span
              className={cx(
                "font-sans text-[0.85rem] leading-snug transition-colors duration-500",
                active ? cx("font-semibold", a.text) : passed ? "text-azul-principal/80 font-medium" : "text-azul-principal/50 font-medium",
              )}
            >
              {c.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
// nota: en el fallback reduced-motion el riel se muestra como contenido real
// (variant="inline", sin estados) — contraste AA garantizado con /80.
