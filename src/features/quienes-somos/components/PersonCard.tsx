"use client";

import Image from "next/image";
import { ArrowUpRight } from "@/components/ui/icons";
import { fotoDe, type Persona, type Tier } from "@/features/quienes-somos/data/equipo";

/**
 * PersonCard — tarjeta base ÚNICA del equipo, a cuatro escalas jerárquicas.
 *
 * Una sola arquitectura para los 12: FOTO a todo color que cubre la card + dos
 * captions PRE-APILADOS que hacen cross-fade (reposo: plate claro con tinta;
 * hover/focus: scrim navy con texto blanco). En hover la foto escala apenas y
 * "toma protagonismo" dentro de la card, SIN cambiar el tamaño exterior ni
 * generar layout shift (todo `absolute` dentro de un contenedor de tamaño fijo
 * y `overflow-hidden`). La jerarquía la comunica el TAMAÑO del contenedor y la
 * escala tipográfica — nunca color inventado ni datos de más.
 *
 * Indicador de clic: círculo con flecha diagonal ↗ + "Ver trayectoria".
 * Presencia sutil en reposo (contorno), gana peso en hover (relleno verde).
 * La card entera es un <button> accesible por teclado (Enter/Space nativos,
 * focus-visible, aria-label con nombre + rol).
 */

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

type Cfg = {
  aspect: string;
  radius: string;
  /**
   * Fondo del caption EN REPOSO. Las dos direcciones conservan el plato blanco
   * sólido; de N3 para abajo es vidrio esmerilado, así la foto respira por
   * detrás del texto en vez de quedar cortada por una losa. El desenfoque no es
   * decorativo: sin él la foto se lee como ruido detrás de los nombres y el
   * cargo chico deja de sostener contraste sobre las fotos oscuras.
   */
  plate: string;
  pad: string;
  nombre: string;
  rol: string;
  pais: string;
  label: string;
  arrow: string;
  glyph: number;
  /** El label "Ver trayectoria" ya visible en reposo (solo Dirección General). */
  labelAtRest: boolean;
  /** Mostrar el label en hover (en las compactas de N4 va solo la flecha). */
  labelOnHover: boolean;
  /** Cuerpo de las iniciales en la card sin foto (ver `SinFoto`). */
  iniciales: string;
};

/**
 * Escala por nivel. Los anchos reales a 1280 de container son 481 → 379 → 304 →
 * 232 px: una progresión sostenida (~0.79 entre niveles) en la que cada escalón
 * se nota sin que ninguno caiga a miniatura. Los cuerpos de texto acompañan esa
 * progresión — nunca al revés: primero se fija el ancho de la card, después se
 * elige el tamaño que ahí se lee sin esfuerzo.
 *
 * `labelAtRest` es exclusivo de la Dirección General: en el resto el círculo con
 * la flecha ES la señal de acceso en reposo, y el texto "Ver trayectoria" entra
 * en hover. Es lo que mantiene a los líderes por debajo de la Dirección
 * Académica también en el estado base.
 */
const CFG: Record<Tier, Cfg> = {
  1: { aspect: "aspect-[4/5]", radius: "rounded-[1.5rem]", plate: "bg-white", pad: "p-5 lg:p-6", nombre: "text-[1.55rem] lg:text-[1.85rem]", rol: "text-[0.9rem]", pais: "text-[0.66rem]", label: "text-[0.82rem]", arrow: "h-11 w-11", glyph: 18, labelAtRest: true, labelOnHover: true, iniciales: "text-[7rem]" },
  2: { aspect: "aspect-[4/5]", radius: "rounded-[1.4rem]", plate: "bg-white", pad: "p-5", nombre: "text-[1.3rem]", rol: "text-[0.82rem]", pais: "text-[0.64rem]", label: "text-[0.78rem]", arrow: "h-10 w-10", glyph: 16, labelAtRest: false, labelOnHover: true, iniciales: "text-[5.5rem]" },
  3: { aspect: "aspect-[4/5]", radius: "rounded-[1.35rem]", plate: "bg-white/82 backdrop-blur-[3px]", pad: "p-[1.15rem]", nombre: "text-[1.18rem]", rol: "text-[0.79rem]", pais: "text-[0.63rem]", label: "text-[0.76rem]", arrow: "h-10 w-10", glyph: 16, labelAtRest: false, labelOnHover: true, iniciales: "text-[4.4rem]" },
  4: { aspect: "aspect-[4/5]", radius: "rounded-[1.15rem]", plate: "bg-white/82 backdrop-blur-[3px]", pad: "p-[0.95rem]", nombre: "text-[1.02rem]", rol: "text-[0.72rem]", pais: "text-[0.59rem]", label: "text-[0.7rem]", arrow: "h-9 w-9", glyph: 15, labelAtRest: false, labelOnHover: true, iniciales: "text-[3.1rem]" },
};

/**
 * Superficie de la card cuando la persona pidió NO publicar foto.
 *
 * No es un placeholder ni un "falta la imagen": es la card resuelta con los
 * materiales de la marca — la superficie gris de la página, su trama de puntos
 * y las iniciales en tinta muy baja, del mismo tamaño y forma que las demás.
 * Vista en la grilla se lee como una pieza más del pliego, no como un hueco.
 */
function SinFoto({ persona, cfg }: { persona: Persona; cfg: Cfg }) {
  const iniciales = persona.nombre
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <span aria-hidden="true" className="bg-gris-fondo absolute inset-0 block">
      <span className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
      {/* Las iniciales suben respecto del centro: abajo vive el caption y, si
          quedaran centradas de verdad, se leerían pegadas al nombre. */}
      <span
        className={cx(
          "font-display text-azul-principal/12 absolute inset-0 flex items-center justify-center pb-[26%] font-extrabold tracking-[-0.04em] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none group-hover:scale-[1.045] group-focus-visible:scale-[1.045]",
          cfg.iniciales,
        )}
      >
        {iniciales}
      </span>
    </span>
  );
}

/** Un caption (reposo o hover). Los dos son estructuralmente idénticos para
 *  que el texto quede exactamente en la misma posición y el cross-fade no salte. */
function Caption({
  persona,
  cfg,
  variant,
}: {
  persona: Persona;
  cfg: Cfg;
  variant: "rest" | "hover";
}) {
  const hover = variant === "hover";
  const showLabel = hover ? cfg.labelOnHover : cfg.labelAtRest;
  return (
    <span
      aria-hidden="true"
      data-caption={variant}
      className={cx(
        "pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end transition-opacity duration-500 ease-out",
        cfg.pad,
        hover
          ? "from-azul-principal/95 via-azul-principal/55 to-transparent bg-gradient-to-t pt-20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          : cx(cfg.plate, "opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0"),
      )}
    >
      <span
        data-card-name
        className={cx("font-display block leading-tight font-bold", cfg.nombre, hover ? "text-white" : "text-azul-principal")}
      >
        {persona.nombre}
      </span>
      <span className={cx("mt-0.5 line-clamp-2 font-sans leading-snug", cfg.rol, hover ? "text-white/85" : "text-azul-principal/75")}>
        {persona.rol}
      </span>
      <span className="mt-2 flex items-center justify-between gap-2">
        {/* El país cede antes que el CTA: en las compactas "Colombia" + "Ver
            trayectoria" van al límite del ancho útil y el acceso no puede ser
            lo que se recorte. */}
        <span className={cx("min-w-0 truncate font-mono tracking-[0.16em] uppercase", cfg.pais, hover ? "text-azul-claro" : "text-azul-medio")}>
          {persona.pais}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {showLabel && (
            <span className={cx("font-sans font-medium whitespace-nowrap", cfg.label, hover ? "text-white" : "text-azul-principal/80")}>
              Ver trayectoria
            </span>
          )}
          <span
            className={cx(
              "inline-flex items-center justify-center rounded-full border transition-colors",
              cfg.arrow,
              hover ? "border-verde-concepto bg-verde-concepto text-white" : "border-azul-principal/30 text-azul-principal",
            )}
          >
            <ArrowUpRight size={cfg.glyph} />
          </span>
        </span>
      </span>
    </span>
  );
}

export function PersonCard({
  persona,
  onOpen,
}: {
  persona: Persona;
  /** Abre el perfil full-screen; recibe la persona y el botón (para restaurar foco). */
  onOpen: (persona: Persona, el: HTMLButtonElement) => void;
}) {
  const cfg = CFG[persona.tier];
  return (
    <button
      type="button"
      data-persona-card
      data-persona-key={persona.key}
      onClick={(e) => onOpen(persona, e.currentTarget)}
      aria-label={`Ver la trayectoria de ${persona.nombre}, ${persona.rol}`}
      className={cx(
        "group relative block w-full cursor-pointer overflow-hidden text-left ring-1 ring-white/10 transition-shadow duration-500",
        "hover:shadow-[0_28px_70px_-26px_rgb(31_154_120/0.45)] focus-visible:shadow-[0_28px_70px_-26px_rgb(31_154_120/0.45)]",
        "focus-visible:outline-verde-concepto focus-visible:outline-2 focus-visible:outline-offset-2",
        cfg.aspect,
        cfg.radius,
      )}
    >
      {/* Foto — cubre toda la card, color pleno, encuadre por persona. Quien
          pidió no publicar retrato lleva la superficie tipográfica. */}
      {persona.sinFoto ? (
        <SinFoto persona={persona} cfg={cfg} />
      ) : (
        <Image
          src={fotoDe(persona.key)}
          alt={persona.nombre}
          fill
          sizes={persona.tier <= 2 ? "(max-width: 1024px) 90vw, 640px" : persona.tier === 3 ? "(max-width: 1024px) 45vw, 320px" : "(max-width: 1024px) 30vw, 240px"}
          style={
            {
              objectPosition: persona.imagePosition,
              "--foto-zoom": persona.imageZoom ?? 1,
            } as React.CSSProperties
          }
          /* El acercamiento de hover se multiplica por el zoom propio de la foto,
             así el gesto es el mismo para todos sin importar de qué encuadre parta. */
          className="scale-[var(--foto-zoom)] object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[calc(var(--foto-zoom)*1.045)] group-hover:will-change-transform group-focus-visible:scale-[calc(var(--foto-zoom)*1.045)] group-focus-visible:will-change-transform"
        />
      )}
      {/* Captions pre-apilados: reposo (plate claro) ↔ hover (scrim navy) */}
      <Caption persona={persona} cfg={cfg} variant="rest" />
      <Caption persona={persona} cfg={cfg} variant="hover" />
    </button>
  );
}
