"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ArrowRight, Enlace } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useCopiar } from "@/lib/hooks/useCopiar";
import { getLenis } from "@/lib/lenis";
import { fotoDe, TIER_ROTULO, type Persona } from "@/features/quienes-somos/data/equipo";
import { ImmersiveProfile } from "@/features/quienes-somos/components/profile/ImmersiveProfile";

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
 *     la card.
 *   · INMERSIVO (Parte 2) — con `persona.profile`: el root se vuelve el scroller
 *     (`data-profile-scroller`, `data-lenis-prevent` para no pelear con Lenis) y
 *     renderiza <ImmersiveProfile>, que trae su propia narrativa y coreografía.
 */

/** Tiempos de la transformación card → perfil (y su reverso). */
const APERTURA = 0.95;
const CIERRE = 0.55;
/** La foto viajera se apoya y se queda QUIETA un instante antes de fundirse
 *  en la figura recortada: primero llega, después cambia de piel. */
const PAUSA_APOYO = 0.15;
const LLEGADA_FOTO = APERTURA + PAUSA_APOYO;
/** Espera máxima a que cargue la imagen del perfil antes de viajar (para
 *  medir su recuadro real, no la caja que lo reserva). */
const ESPERA_IMAGEN = 300;
/** Arranca decidido y frena largo: "despacio" en la curva, no en la duración. */
const EASE_VIAJE = "power3.inOut";

/** Rectángulo de la card como recorte del lienzo (con su radio). */
function clipDe(r: DOMRect) {
  return `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 1.5rem)`;
}

/** Las demás cards del equipo (las que no se abrieron): se alejan y vuelven. */
function paresDe(originEl: HTMLElement | null): HTMLElement[] {
  const seccion = originEl?.closest("#equipo");
  if (!seccion) return [];
  const propia = originEl?.closest("[data-reveal]");
  return Array.from(seccion.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el !== propia);
}

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
  const rootRef = useRef<HTMLDivElement | null>(null);
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

  useLockScroll(true);

  // ── Portal + inert + ENTRADA, todo en FASE DE LAYOUT ────────────────────
  // Adjuntamos el container al document EN FASE DE LAYOUT y ANTES de medir o
  // enfocar. Si viviera en un useEffect pasivo, el hero mediría 0 (FLIP → fade)
  // y focus() sobre un botón desconectado sería no-op (foco perdido).
  useIsomorphicLayoutEffect(() => {
    if (!container) return;
    // Congelar el smooth scroll de la página y recordar el punto EXACTO: al
    // cerrar, Lenis + ScrollTrigger.refresh() recalculan con alturas
    // transitorias y sin esto la página "deriva" hacia otra sección.
    const savedY = window.scrollY;
    getLenis()?.stop();
    container.setAttribute("data-team-portal", "");
    document.body.appendChild(container);
    const siblings = Array.from(document.body.children).filter((c) => c !== container) as HTMLElement[];
    siblings.forEach((s) => {
      s.setAttribute("aria-hidden", "true");
      s.setAttribute("inert", "");
    });

    // Root VISIBLE antes de enfocar: `invisible` (visibility:hidden) impide foco.
    const root = rootRef.current;
    if (root) gsap.set(root, { autoAlpha: 1 });
    backRef.current?.focus();

    let ctx: gsap.Context | undefined;
    // Las otras cards se alejan mientras la elegida se convierte en el perfil;
    // se restauran al cerrar (cleanup) — viven fuera del portal, así que no
    // entran en el gsap.context del root.
    const pares = paresDe(originEl);
    if (root && !reduced) {
      if (pares.length) gsap.to(pares, { opacity: 0.4, scale: 0.98, duration: 0.45, ease: "power2.out" });
      ctx = gsap.context((self) => {
        const backdrop = backdropRef.current;
        const from = originEl?.getBoundingClientRect();
        const desdeCard = !!(from && from.width > 0);
        const originImg = originEl?.querySelector("img");
        const f = originImg?.getBoundingClientRect();
        const hero = heroRef.current;
        const viajera = viajeraRef.current;
        // Destino: la caja de la figura recortada; lo que se revela es su
        // MOVER (la caja la gobierna la coreografía de scroll del perfil).
        const figura = root.querySelector<HTMLElement>("[data-portrait-mover]");
        // El destino es el recuadro de la IMAGEN recortada (no su caja, que
        // tiene aire a la izquierda): así el fundido cambia de foto a figura
        // sobre el mismo lugar.
        const cajaFigura = root.querySelector<HTMLElement>("[data-portrait-outer]");
        const imgFigura = figura?.querySelector("img");
        // El DESTINO se mide recién al arrancar el viaje, con la imagen del
        // perfil ya cargada: su recuadro real (alineado a la derecha dentro
        // de la caja que lo reserva). Medirlo antes daba la caja entera y la
        // foto aterrizaba corrida respecto de la figura.
        const medirDestino = () => {
          const dImg = imgFigura?.getBoundingClientRect();
          if (!dImg || dImg.width === 0) return cajaFigura?.getBoundingClientRect();
          return dImg;
        };
        const viaja = !!(immersive && fotoViaja && viajera && f && f.width > 0 && (imgFigura || cajaFigura));
        const imgViajera = viajera?.querySelector("img") ?? null;
        const heroFlip = !!(!immersive && hero && f && f.width > 0);
        const lineas = contentRef.current ? Array.from(contentRef.current.children) : [];

        // ── ESTADOS INICIALES, YA: todo arranca en la card (el lienzo
        //    recortado a su rectángulo, la foto sobre su foto), así el primer
        //    frame no muestra el perfil terminado.
        if (backdrop && desdeCard) gsap.set(backdrop, { clipPath: clipDe(from) });
        else if (backdrop) gsap.set(backdrop, { autoAlpha: 0 });
        if (patronRef.current) gsap.set(patronRef.current, { autoAlpha: 0 });
        gsap.set([backRef.current, copiarRef.current], { opacity: 0, y: -8 });
        if (viaja && viajera && f) {
          if (imgViajera && originImg) {
            imgViajera.src = originImg.currentSrc || originImg.src;
            imgViajera.style.objectPosition = getComputedStyle(originImg).objectPosition;
          }
          gsap.set(viajera, { left: f.left, top: f.top, width: f.width, height: f.height, autoAlpha: 1, borderRadius: "1.25rem" });
          if (figura) gsap.set(figura, { autoAlpha: 0 });
        }
        if (heroFlip && hero && f) {
          const to = hero.getBoundingClientRect();
          gsap.set(hero, {
            x: f.left - to.left,
            y: f.top - to.top,
            scaleX: f.width / to.width,
            scaleY: f.height / to.height,
            transformOrigin: "top left",
          });
        }
        if (!immersive) gsap.set(lineas, { opacity: 0, x: -22 });

        // ── EL VIAJE arranca dos frames después: el montaje del perfil (y
        //    la decodificación de sus imágenes) traba el primer frame, y con
        //    lagSmoothing(0) —que fija Lenis— GSAP no perdona esa pausa: los
        //    tweens saltarían al final. Con los estados ya puestos no se ve
        //    nada raro mientras tanto.
        const arrancar = () => {
          // El fondo nace de la card.
          if (backdrop && desdeCard) {
            gsap.to(backdrop, {
              clipPath: "inset(0px 0px 0px 0px round 0rem)",
              duration: APERTURA,
              ease: EASE_VIAJE,
              onComplete: () => gsap.set(backdrop, { clearProps: "clipPath" }),
            });
          } else if (backdrop) {
            gsap.to(backdrop, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
          }
          if (patronRef.current)
            gsap.to(patronRef.current, { autoAlpha: 0.35, duration: 0.5, delay: 0.35 });
          gsap.to([backRef.current, copiarRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay: APERTURA * 0.75,
            ease: "power2.out",
          });

          // La foto viaja (inmersivo): hasta el recuadro exacto de la figura
          // recortada, creciendo; se apoya, queda quieta un instante y recién
          // ahí se funde en ella. Nada se mueve durante el fundido.
          const d = viaja ? medirDestino() : undefined;
          if (viaja && viajera && d && d.width > 0) {
            gsap.to(viajera, {
              left: d.left,
              top: d.top,
              width: d.width,
              height: d.height,
              borderRadius: "1.75rem",
              duration: APERTURA,
              ease: EASE_VIAJE,
            });
            // Se apoya, queda quieta un instante y recién ahí se funde en la figura.
            gsap.to(viajera, { autoAlpha: 0, duration: 0.3, delay: LLEGADA_FOTO, ease: "power2.inOut" });
            if (figura) gsap.to(figura, { autoAlpha: 1, duration: 0.3, delay: LLEGADA_FOTO, ease: "power2.out" });
          } else if (immersive && fotoViaja) {
            // Sin destino medible la foto no viaja; la figura no puede quedar
            // escondida (ImmersiveProfile la dejó en 0 esperando a este overlay).
            if (viajera) gsap.set(viajera, { autoAlpha: 0 });
            if (figura) gsap.to(figura, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
          }

          // La foto viaja (shell): el retrato mismo, desde la card.
          if (heroFlip && hero) {
            gsap.to(hero, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: APERTURA, ease: EASE_VIAJE });
          }
          // El texto llega último, desde la izquierda, escalonado.
          if (!immersive && lineas.length) {
            gsap.to(lineas, { opacity: 1, x: 0, duration: 0.55, delay: APERTURA * 0.55, stagger: 0.08, ease: "power3.out" });
          }
        };
        // ...y si la imagen del perfil todavía no cargó, la espera (hasta
        // ESPERA_IMAGEN) para conocer el destino exacto. La card ya la
        // precargó al pasar el mouse, así que casi siempre está lista.
        let raf = 0;
        let timer = 0;
        let arrancado = false;
        const arrancarUnaVez = () => {
          if (arrancado) return;
          arrancado = true;
          imgFigura?.removeEventListener("load", arrancarUnaVez);
          self.add(arrancar);
        };
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => {
            if (imgFigura && !imgFigura.complete && viaja) {
              imgFigura.addEventListener("load", arrancarUnaVez, { once: true });
              timer = window.setTimeout(arrancarUnaVez, ESPERA_IMAGEN);
            } else {
              arrancarUnaVez();
            }
          });
        });
        return () => {
          cancelAnimationFrame(raf);
          window.clearTimeout(timer);
          imgFigura?.removeEventListener("load", arrancarUnaVez);
        };
      }, root);
    } else if (root && reduced) {
      gsap.set(root, { autoAlpha: 1 });
    }

    return () => {
      ctx?.revert();
      if (pares.length) gsap.set(pares, { clearProps: "opacity,transform" });
      siblings.forEach((s) => {
        s.removeAttribute("aria-hidden");
        s.removeAttribute("inert");
      });
      if (container.parentNode) container.parentNode.removeChild(container);
      // Restaurar foco a la card DESPUÉS de quitar inert (un elemento inert no
      // puede recibir foco). preventScroll conserva el punto de scroll.
      originEl?.focus?.({ preventScroll: true });
      // Restauración DETERMINÍSTICA del scroll: sync inmediato de ventana y
      // Lenis al punto guardado, y re-aserciones tras los refresh async
      // (ResizeObserver del provider → lenis.resize + ScrollTrigger.refresh)
      // que antes hacían derivar la página hacia la sección anterior.
      window.scrollTo(0, savedY);
      const lenis = getLenis();
      lenis?.scrollTo(savedY, { immediate: true, force: true });
      lenis?.start();
      const reassert = () => {
        if (Math.abs(window.scrollY - savedY) <= 1) return;
        window.scrollTo(0, savedY);
        getLenis()?.scrollTo(savedY, { immediate: true, force: true });
      };
      requestAnimationFrame(() => {
        reassert();
        requestAnimationFrame(reassert);
      });
      window.setTimeout(reassert, 180);
    };
  }, [container, originEl, reduced, immersive]);

  // ── Cierre ───────────────────────────────────────────────────────────────
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const finish = () => onClose();
    if (reduced || !rootRef.current) {
      finish();
      return;
    }
    // LO MISMO AL REVÉS, MÁS RÁPIDO: la foto vuelve a la card, el lienzo se
    // contrae hasta su rectángulo y la sección recupera su opacidad.
    const from = originEl?.getBoundingClientRect();
    const desdeCard = !!(from && from.width > 0);
    const pares = paresDe(originEl);
    const tl = gsap.timeline({ onComplete: finish });
    if (pares.length) tl.to(pares, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0.15);
    tl.to([backRef.current, copiarRef.current], { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" }, 0);
    if (immersive) {
      // El scroller no puede llevar la figura de vuelta: su contenido se
      // disuelve mientras el lienzo se contrae hacia la card.
      if (inmersivoRef.current)
        tl.to(inmersivoRef.current, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
    } else {
      const hero = heroRef.current;
      const originImg = originEl?.querySelector("img");
      if (hero && originImg) {
        const f = originImg.getBoundingClientRect();
        const to = hero.getBoundingClientRect();
        if (f.width > 0 && to.width > 0) {
          tl.to(
            hero,
            {
              x: f.left - to.left,
              y: f.top - to.top,
              scaleX: f.width / to.width,
              scaleY: f.height / to.height,
              duration: CIERRE,
              ease: EASE_VIAJE,
            },
            0,
          );
        }
      }
      tl.to(contentRef.current, { autoAlpha: 0, x: -12, duration: 0.25, ease: "power2.in" }, 0);
    }
    if (patronRef.current) tl.to(patronRef.current, { autoAlpha: 0, duration: 0.25 }, 0);
    if (backdropRef.current && desdeCard) {
      tl.fromTo(
        backdropRef.current,
        { clipPath: "inset(0px 0px 0px 0px round 0rem)" },
        { clipPath: clipDe(from), duration: CIERRE, ease: EASE_VIAJE },
        0.05,
      );
      tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.15 }, 0.05 + CIERRE - 0.1);
    } else {
      tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0.05);
    }
  }, [originEl, onClose, reduced, immersive]);

  // ── Teclado: ESC cierra · Tab atrapado ─────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key === "Tab" && rootRef.current) {
        // Solo focusables REALMENTE enfocables (visibles): en el inmersivo el
        // botón de cierre puede estar aún oculto por el revelado; si lo dejáramos
        // como `last`, el navegador lo saltearía y el foco escaparía del diálogo.
        const focusables = Array.from(
          rootRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  if (!container) return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${persona.profile?.fullName ?? persona.nombre}`}
      data-profile-scroller={immersive ? "" : undefined}
      data-lenis-prevent={immersive ? "" : undefined}
      className={
        immersive
          ? "invisible fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto overscroll-contain"
          : "invisible fixed inset-0 z-[100]"
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
          lugar de la figura recortada y se funde en ella (solo inmersivo). */}
      {fotoViaja && (
        <div
          ref={viajeraRef}
          aria-hidden="true"
          className="pointer-events-none invisible fixed z-[6] overflow-hidden shadow-[0_40px_100px_-40px_rgb(31_45_77/0.5)] will-change-[left,top,width,height]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- clon animado de la foto ya cargada en la card */}
          <img alt="" className="h-full w-full object-cover" />
        </div>
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
        <div className="relative z-[1] mx-auto flex h-full max-w-screen-xl items-center px-6 md:px-12">
          <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <div
              ref={heroRef}
              className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-[1.8rem] shadow-[0_40px_100px_-40px_rgb(31_45_77/0.5)] ring-1 ring-black/5 will-change-transform"
            >
              {/* Quien pidió no publicar retrato lleva la misma superficie
                  tipográfica que en su card, no un hueco (ver Persona.sinFoto). */}
              {persona.sinFoto ? (
                <span aria-hidden="true" className="bg-gris-fondo absolute inset-0 block">
                  <span className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
                  <span className="font-display text-azul-principal/12 absolute inset-0 flex items-center justify-center text-[7rem] font-extrabold tracking-[-0.04em] select-none">
                    {persona.nombre
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                </span>
              ) : (
                <Image
                  src={fotoDe(persona.key)}
                  alt={persona.nombre}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  style={{ objectPosition: persona.imagePosition }}
                  priority
                  className="object-cover"
                />
              )}
            </div>

            <div ref={contentRef}>
              <span className="text-verde-concepto font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
                {TIER_ROTULO[persona.tier]}
              </span>
              <h2
                className="font-display text-azul-principal mt-3 font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.2rem, 1.4rem + 2.4vw, 3.4rem)", lineHeight: 1.05 }}
              >
                {persona.nombre}
              </h2>
              <p className="text-azul-medio mt-3 font-sans text-[1.05rem] font-medium">{persona.rol}</p>
              <p className="text-gris-texto mt-1 font-mono text-[0.78rem] tracking-[0.16em] uppercase">{persona.pais}</p>

              <div aria-hidden="true" className="border-azul-principal/10 mt-8 max-w-[16rem] border-t" />
            </div>
          </div>
        </div>
      )}
    </div>,
    container,
  );
}
