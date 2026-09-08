"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Enlace } from "@/components/ui/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useCopiar } from "@/lib/hooks/useCopiar";
import type { Persona } from "@/features/quienes-somos/data/equipo";
import { ImmersiveProfile } from "@/features/quienes-somos/components/profile/ImmersiveProfile";
import { usePortalModal } from "./overlay/usePortalModal";
import { abrirOverlay } from "./overlay/apertura-overlay";
import { cerrarOverlay, type RefsOverlay } from "./overlay/coreografia-overlay";
import { PerfilShell } from "./overlay/PerfilShell";

/**
 * TeamProfileOverlay — shell de perfil a pantalla completa, portaleado a body.
 *
 * Resuelve el fixed contra el viewport real (el modal anterior se rompía dentro
 * de una <section> transformada con overflow-clip). Aporta, para TODA persona:
 * portal · lock de scroll · foco atrapado y restaurado a la card · header tapado
 * · fondo marfil · apertura/cierre.
 *
 * Dos modos según los datos:
 *   · SHELL (Parte 1) — sin `persona.profile`: foto + nombre + rol + país. Base
 *     validada para las 11 personas sin recorrido desarrollado. FLIP-lite desde
 *     la card (`PerfilShell`).
 *   · INMERSIVO (Parte 2) — con `persona.profile`: el root se vuelve el scroller
 *     (`data-profile-scroller`, `data-lenis-prevent` para no pelear con Lenis) y
 *     renderiza <ImmersiveProfile>, que trae su propia narrativa y coreografía.
 *
 * El root es un `<dialog>` abierto con `showModal()`: el navegador pone el
 * top layer, hace inerte el resto de la página y atrapa el Tab — tres cosas
 * que antes estaban a mano (un loop de `inert` sobre los hijos de <body> y un
 * listener de teclado). No recibe `transform`, `filter` ni `will-change`:
 * crearían bloque contenedor para los `fixed` de adentro.
 *
 * Piezas (`overlay/`): `usePortalModal` (portal, lock, showModal, foco,
 * scroll), `apertura-overlay.ts` (la entrada), `coreografia-overlay.ts`
 * (tiempos, pares, clip-path y el cierre), `viaje-foto.ts` (la foto viajera).
 */
export function TeamProfileOverlay({
  persona,
  originEl,
  onClose,
}: {
  persona: Persona;
  originEl: HTMLElement | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const immersive = !!persona.profile;
  // La coreografía inmersiva es desktop-only: su columna de identidad (el h2
  // real con nombre y rol) vive en un layer fijo `hidden lg:block`. Por debajo
  // de 64rem —incluye un desktop con zoom al 200%, WCAG 1.4.10— servimos la
  // variante lineal, que trae su propio h2 y todo el contenido en flujo.
  const desktopChoreo = useMediaQuery("(min-width: 64rem)");
  const staticProfile = reduced || !desktopChoreo;
  const { copiado, copiar } = useCopiar();
  const [container] = useState<HTMLDivElement | null>(() =>
    typeof document !== "undefined" ? document.createElement("div") : null,
  );
  const rootRef = useRef<HTMLDialogElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const copiarRef = useRef<HTMLButtonElement | null>(null);
  const patronRef = useRef<HTMLDivElement | null>(null);
  const inmersivoRef = useRef<HTMLDivElement | null>(null);
  const viajeraRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);
  // En el inmersivo de escritorio, la FOTO de la card viaja (la lleva este
  // overlay) y la figura recortada la releva al llegar. Se decide en render
  // porque ImmersiveProfile lo necesita como prop.
  const fotoViaja = immersive && !staticProfile && !!originEl?.querySelector("img");
  // Las piezas que animan apertura y cierre, en un solo bundle estable.
  const refs = useMemo<RefsOverlay>(
    () => ({
      backdrop: backdropRef,
      hero: heroRef,
      content: contentRef,
      back: backRef,
      copiar: copiarRef,
      patron: patronRef,
      inmersivo: inmersivoRef,
      viajera: viajeraRef,
    }),
    [],
  );

  // ── Portal + inert + ENTRADA, todo en FASE DE LAYOUT ────────────────────
  usePortalModal({
    container,
    rootRef,
    backRef,
    originEl,
    reduced,
    immersive,
    entrar: (root) => abrirOverlay({ root, originEl, reduced, immersive, fotoViaja, refs }),
  });

  // ── Cierre ───────────────────────────────────────────────────────────────
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    cerrarOverlay({ root: rootRef.current, originEl, reduced, immersive, refs, alTerminar: onClose });
  }, [originEl, onClose, reduced, immersive, refs]);

  if (!container) return null;

  return createPortal(
    <dialog
      ref={rootRef}
      aria-label={`Perfil de ${persona.profile?.fullName ?? persona.nombre}`}
      data-profile-scroller={immersive ? "" : undefined}
      data-lenis-prevent={immersive ? "" : undefined}
      // Escape: el navegador dispara `cancel` y cerraría de golpe; se lo frena
      // para que el cierre pase por la salida animada (que llama a close()).
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // `m-0 max-h-none max-w-none border-0 bg-transparent p-0` neutraliza el
      // estilo que el agente le da a un <dialog> (centrado, con borde, fondo
      // blanco y topes de tamaño) para que siga siendo full-bleed, y `h-full
      // w-full` tampoco sobra: su `width: fit-content` le gana al ancho
      // implícito del inset y dejaba el panel angosto (el retrato del shell
      // medía 254px en vez de 416). El `backdrop` propio lo pinta el lienzo.
      className={
        "invisible fixed inset-0 z-[100] m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent" +
        (immersive ? " overflow-x-hidden overflow-y-auto overscroll-contain" : "")
      }
    >
      {/* Lienzo claro (nunca negro) — fijo al viewport. En el inmersivo es
          BLANCO y limpio (el patrón de marca vive localizado dentro del hero
          y el cierre, no en toda la experiencia); en el shell, marfil + patrón. */}
      <div ref={backdropRef} className={immersive ? "fixed inset-0 bg-white" : "bg-gris-fondo fixed inset-0"} />
      {!immersive && (
        <div ref={patronRef} aria-hidden="true" className="pattern-dots pointer-events-none fixed inset-0 opacity-[0.35]" />
      )}

      {/* La foto viajera: la foto de la card, que cruza la pantalla hasta el
          lugar de la figura y se funde en ella (solo inmersivo). Es un FONDO,
          no una <img>: reutiliza la imagen que la card ya decodificó (misma
          URL, sale de caché) sin segunda descarga ni optimizador de por medio. */}
      {fotoViaja && (
        <div
          ref={viajeraRef}
          aria-hidden="true"
          className="pointer-events-none invisible fixed z-[6] overflow-hidden bg-cover bg-no-repeat shadow-[0_40px_100px_-40px_rgb(31_45_77/0.5)]"
        />
      )}

      {/* Volver al equipo — fijo (persiste durante el scroll del inmersivo) */}
      <button
        ref={backRef}
        type="button"
        onClick={requestClose}
        className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto focus-visible:outline-verde-concepto fixed top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2.5 font-sans text-[0.9rem] font-medium backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:top-8 md:left-8"
      >
        <ArrowRight size={16} className="rotate-180" />
        Volver al equipo
      </button>

      {/* Copiar link — el perfil tiene dirección propia (?persona=clave):
          sirve para mandar «mirá el perfil de X» por donde sea. */}
      <button
        ref={copiarRef}
        type="button"
        onClick={() =>
          copiar(
            `${window.location.origin}/quienes-somos?persona=${persona.key}`,
            "link",
          )
        }
        className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto focus-visible:outline-verde-concepto fixed top-6 right-6 z-10 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2.5 font-sans text-[0.9rem] font-medium backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:top-8 md:right-8"
      >
        <Enlace size={16} aria-hidden="true" />
        {copiado === "link" ? "Copiado" : "Copiar link"}
      </button>

      {immersive ? (
        <div ref={inmersivoRef}>
          <ImmersiveProfile
            profile={persona.profile!}
            reduced={staticProfile}
            originEl={originEl}
            onClose={requestClose}
            figuraDesdeCard={!fotoViaja}
          />
        </div>
      ) : (
        <PerfilShell persona={persona} refHero={heroRef} refContenido={contentRef} />
      )}
    </dialog>,
    container,
  );
}
