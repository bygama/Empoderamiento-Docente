"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/ui/RevealLines";
import { getLenis } from "@/lib/lenis";
import { CASOS } from "./data";
import { ROTULO_MICRO } from "./tintes";
import { CarpetaCaso } from "./CarpetaCaso";
import { ExpedienteCaso } from "./ExpedienteCaso";
import { NavegacionCasos } from "./NavegacionCasos";
import {
  aperturaLugar,
  switchEntrada,
  switchSalida,
  transicionCierre,
} from "./coreografia";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Estado = "index" | "opening" | "open" | "switching" | "closing";

/**
 * Sección «Investigación en acción» — archivo de expedientes.
 * Máquina de estados: index → opening → open → (switching|closing).
 * Las timelines viven en coreografia.ts. El expediente abierto es EL
 * LUGAR: una capa fija a viewport completo con scroll propio; la página
 * queda congelada debajo (Lenis detenido + overflow del documento oculto)
 * y el botón «atrás» del navegador cierra el expediente (pushState al
 * abrir, popstate → cierre). Durante apertura/cierre el telón del lugar es
 * transparente: la carpeta del índice (en la página) hace morph hacia la
 * hoja del expediente (en la capa) sin cortes visibles — ambos fondos son
 * gris-fondo, así el intercambio de opacidad es invisible.
 * Con prefers-reduced-motion todos los cambios son instantáneos.
 */
export function CasosInvestigacion() {
  const [estado, setEstadoReact] = useState<Estado>("index");
  const [activo, setActivo] = useState<number | null>(null);
  const [anuncio, setAnuncio] = useState("");
  // true tras la primera apertura: el intro no vuelve a correr su reveal
  // SplitText en los remontajes del cierre (RevealLines enabled=false).
  const [introRevelado, setIntroRevelado] = useState(false);

  const estadoRef = useRef<Estado>("index");
  const sectionRef = useRef<HTMLElement | null>(null);
  const lugarRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const tituloRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const remateRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const ultimaAbiertaRef = useRef<number | null>(null);
  const entradaHechaRef = useRef(false);
  const regresoPendienteRef = useRef(false);
  const lenisDetenidoRef = useRef(false);
  // true si la apertura registró una entrada en el historial (pushState):
  // cerrar desde la UI pasa por history.back() para consumirla.
  const historialRef = useRef(false);
  // back presionado a mitad de transición: cerrar al llegar a "open".
  const cierrePendienteRef = useRef(false);
  // Ghost de la banda durante el switch (clon fijo en el body que
  // sobrevive al remount); se limpia al aterrizar o al desmontar.
  const ghostRef = useRef<HTMLElement | null>(null);
  const animsRef = useRef<gsap.core.Animation[]>([]);
  const reduced = useReducedMotion();

  const setEstado = (e: Estado) => {
    estadoRef.current = e;
    setEstadoReact(e);
  };

  /** Registra una animación para matarla si la sección se desmonta. */
  const registrar = useCallback(<T extends gsap.core.Animation>(anim: T): T => {
    animsRef.current = animsRef.current.filter((a) => a.isActive());
    animsRef.current.push(anim);
    return anim;
  }, []);

  /** Alineación INSTANTÁNEA de la página congelada con la sección: se usa
   *  en el cierre, antes del primer paint del índice remontado y con el
   *  telón todavía opaco — el salto de reflow nunca llega a verse. */
  const alinearConSeccion = useCallback((offset: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const y = window.scrollY + section.getBoundingClientRect().top - offset;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(y, { immediate: true, force: true });
    } else {
      window.scrollTo(0, y);
    }
  }, []);

  /** Scroll-lock durante las transiciones: la coreografía mide y posiciona
   *  contra el viewport; un wheel a mitad de camino rompería el staging.
   *  (Mismo patrón que TeamProfileOverlay.) */
  const detenerScroll = useCallback(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.stop();
      lenisDetenidoRef.current = true;
    }
  }, []);
  const reanudarScroll = useCallback(() => {
    if (lenisDetenidoRef.current) {
      getLenis()?.start();
      lenisDetenidoRef.current = false;
    }
  }, []);

  /* ── Cleanup global: nada sobrevive a la navegación ───────────────── */
  useEffect(() => {
    return () => {
      animsRef.current.forEach((a) => a.kill());
      animsRef.current = [];
      ghostRef.current?.remove();
      ghostRef.current = null;
      gsap.killTweensOf(window);
      // Si se navega a mitad de una transición: cancelar el scrollTo de
      // Lenis en vuelo (snap a la posición actual) y devolver el control.
      if (lenisDetenidoRef.current) {
        const lenis = getLenis();
        lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
        lenis?.start();
        lenisDetenidoRef.current = false;
      }
    };
  }, []);

  /* ── Entrada del índice (primera vez en viewport) ─────────────────── */
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || activo !== null) return;
    if (reduced || entradaHechaRef.current) return;
    const ctx = gsap.context(() => {
      // Entrada tipo cajón: las carpetas caen desde arriba y se asientan
      // una sobre otra, la del fondo primero (from: "end").
      gsap.fromTo(
        "[data-carpeta-item]",
        { autoAlpha: 0, y: -64, rotate: -1 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          duration: 0.75,
          ease: "back.out(1.05)",
          stagger: { each: 0.14, from: "end" },
          clearProps: "opacity,visibility,transform",
          onComplete: () => {
            entradaHechaRef.current = true;
          },
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        },
      );
      gsap.fromTo(
        "[data-casos-remate]",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.5,
          delay: 0.6,
          ease: "power1.out",
          clearProps: "opacity,visibility",
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        },
      );
    }, section);
    // Cleanup SIN revert una vez que el archivo ya se mostró: este efecto
    // se limpia justo cuando setActivo(i) monta el expediente, y un
    // ctx.revert() ahí restauraría el estado pre-entrada de TODAS las
    // bandas (resucitando en pleno morph las que la apertura escondió).
    return () => {
      if (entradaHechaRef.current) ctx.kill();
      else ctx.revert();
    };
  }, [reduced, activo]);

  /* ── Página congelada mientras el lugar está establecido: sin
     scrollbar de ventana (el scroll vive en la capa del expediente). El
     cambio ocurre siempre con el telón opaco: el reflow es invisible. ── */
  useEffect(() => {
    if (estado !== "open" && estado !== "switching") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [estado]);

  /* ── Acciones ─────────────────────────────────────────────────────── */
  const abrir = (i: number) => {
    if (estadoRef.current !== "index") return;
    ultimaAbiertaRef.current = i;
    entradaHechaRef.current = true;
    setIntroRevelado(true);
    setEstado("opening");
    setAnuncio(`Expediente abierto. Caso ${CASOS[i].numero}: ${CASOS[i].pregunta}`);
    // Entrada en el historial: el lugar se comporta como página nueva y el
    // botón «atrás» del navegador lo cierra (popstate → cerrar).
    try {
      window.history.pushState({ edExpediente: CASOS[i].id }, "", `#${CASOS[i].slug}`);
      historialRef.current = true;
    } catch {
      historialRef.current = false;
    }
    const li = itemsRef.current[i];
    if (reduced || !li) {
      setActivo(i);
      return;
    }
    detenerScroll();
    // Si la entrada del índice sigue en vuelo (click muy temprano), no
    // puede quedar peleándole las mismas propiedades a la apertura.
    itemsRef.current.forEach((el) => el && gsap.killTweensOf(el));
    // El expediente monta YA (oculto por piezas): la apertura es UNA sola
    // timeline y el lugar nace mientras la carpeta viaja (aperturaLugar,
    // disparada por el efecto de entrada con estado "opening").
    setActivo(i);
  };

  const cerrar = useCallback(() => {
    if (estadoRef.current !== "open") return;
    setAnuncio("Expediente cerrado. Índice de casos de investigación.");
    if (reduced) {
      regresoPendienteRef.current = true;
      reanudarScroll();
      setActivo(null);
      setEstado("index");
      return;
    }
    detenerScroll();
    setEstado("closing");
  }, [reduced, detenerScroll, reanudarScroll]);

  /** Cierre pedido por la UI (botones, banda, Escape): si la apertura
   *  registró historial, se cierra consumiéndolo — history.back() dispara
   *  popstate → cerrar(). Así el estado del navegador nunca se desfasa. */
  const solicitarCierre = useCallback(() => {
    if (historialRef.current) {
      window.history.back();
      return;
    }
    cerrar();
  }, [cerrar]);

  const irA = (j: number, desdeBanda = false) => {
    if (estadoRef.current !== "open" || j === activo) return;
    ultimaAbiertaRef.current = j;
    setEstado("switching");
    setAnuncio(`Expediente abierto. Caso ${CASOS[j].numero}: ${CASOS[j].pregunta}`);
    if (historialRef.current) {
      try {
        window.history.replaceState(
          { edExpediente: CASOS[j].id },
          "",
          `#${CASOS[j].slug}`,
        );
      } catch {
        /* sin historial no hay nada que sincronizar */
      }
    }
    const shell = shellRef.current;
    const lugar = lugarRef.current;
    if (reduced || !shell || !lugar) {
      setActivo(j);
      return;
    }
    // Desde la banda «siguiente», la banda misma sube como ghost y se
    // convierte en la carcasa nueva (aterriza en switchEntrada).
    ghostRef.current?.remove();
    ghostRef.current = switchSalida({
      registrar,
      lugar,
      shell,
      desdeBanda,
      onListo: () => setActivo(j),
    });
  };

  /* ── Escape cierra el expediente ──────────────────────────────────── */
  useEffect(() => {
    if (activo === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") solicitarCierre();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo, solicitarCierre]);

  /* ── «Atrás» del navegador cierra el lugar ────────────────────────── */
  useEffect(() => {
    if (activo === null && estado === "index") return;
    const onPop = () => {
      historialRef.current = false;
      if (estadoRef.current === "open") {
        cerrar();
      } else if (estadoRef.current === "opening" || estadoRef.current === "switching") {
        cierrePendienteRef.current = true;
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [activo, estado, cerrar]);

  /* ── Entrada del expediente (tras abrir o cambiar de caso) ────────── */
  useIsomorphicLayoutEffect(() => {
    if (activo === null) return;
    const lugar = lugarRef.current;
    const shell = shellRef.current;
    const fase = estadoRef.current;
    const finalizar = () => {
      // La página queda CONGELADA debajo del lugar (Lenis detenido): el
      // scroll del expediente vive en su propia capa.
      detenerScroll();
      setEstado("open");
      ScrollTrigger.refresh();
      tituloRef.current?.focus({ preventScroll: true });
      // Back presionado a mitad de la transición: cerrar recién ahora.
      if (cierrePendienteRef.current) {
        cierrePendienteRef.current = false;
        cerrar();
      }
    };
    if (reduced || !lugar || !shell || (fase !== "opening" && fase !== "switching")) {
      finalizar();
      return;
    }
    if (fase === "opening") {
      const i = ultimaAbiertaRef.current ?? 0;
      const li = itemsRef.current[i];
      const hoja = lugar.querySelector<HTMLElement>("[data-exp-hoja]");
      if (!li || !hoja) {
        gsap.set(shell, { autoAlpha: 1 });
        finalizar();
        return;
      }
      // UNA sola timeline: pre-paint por piezas + física de la carpeta +
      // nacimiento del lugar en paralelo + morph medido. (Sin desplazar:
      // la hoja destino vive en la capa fija; mover la página correría a
      // la carpeta de origen y rompería el aterrizaje.)
      aperturaLugar({
        registrar,
        li,
        otrasArriba: itemsRef.current.filter(
          (el, j): el is HTMLLIElement => j < i && el !== null,
        ),
        otrasAbajo: itemsRef.current.filter(
          (el, j): el is HTMLLIElement => j > i && el !== null,
        ),
        introEls: [introRef.current, remateRef.current].filter(
          (el): el is HTMLDivElement => el !== null,
        ),
        shell,
        hoja,
        lugar,
        onFin: finalizar,
      });
    } else {
      // Pre-paint del switch: el lugar nuevo monta invisible; si hay ghost
      // de la banda, aterriza sobre la geometría real del shell.
      gsap.set(shell, { autoAlpha: 0 });
      gsap.set(
        lugar.querySelectorAll("[data-exp-entrada],[data-exp-tab-lateral]"),
        { autoAlpha: 0 },
      );
      const ghost = ghostRef.current;
      ghostRef.current = null;
      switchEntrada({ registrar, lugar, shell, ghost, onFin: finalizar });
    }

  }, [activo]);

  /* ── Cierre: el expediente vuelve al cajón, el archivo se re-apila ── */
  useIsomorphicLayoutEffect(() => {
    if (estado !== "closing") return;
    const section = sectionRef.current;
    const shell = shellRef.current;
    const items = itemsRef.current.filter((el): el is HTMLLIElement => el !== null);
    const alTerminar = () => {
      reanudarScroll();
      regresoPendienteRef.current = true;
      setActivo(null);
      setEstado("index");
    };
    if (!section || !shell || !items.length) {
      alTerminar();
      return;
    }
    // Pre-paint: el índice recién montado arranca oculto Y la página se
    // alinea con la sección de forma instantánea — todo antes del primer
    // paint, con el telón recién transparentado: el reflow no se ve.
    const introEls = [introRef.current, remateRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    gsap.set(items, { autoAlpha: 0 });
    if (introEls.length) gsap.set(introEls, { autoAlpha: 0 });
    alinearConSeccion(72);
    transicionCierre({
      registrar,
      shell,
      items,
      introEls,
      lugar: lugarRef.current ?? undefined,
      liDestino: itemsRef.current[ultimaAbiertaRef.current ?? 0] ?? null,
      onFin: alTerminar,
    });

  }, [estado]);

  /* ── Al volver al índice: foco en la carpeta que estaba abierta ───── */
  useIsomorphicLayoutEffect(() => {
    if (activo !== null || estado !== "index" || !regresoPendienteRef.current) return;
    regresoPendienteRef.current = false;
    const ultima = ultimaAbiertaRef.current;
    if (ultima === null) return;
    // Con reduced-motion el focus repone el viewport (el documento se
    // acortó de golpe); con motion el scroll del cierre ya está alineado.
    if (reduced) {
      botonesRef.current[ultima]?.focus();
    } else {
      botonesRef.current[ultima]?.focus({ preventScroll: true });
    }

  }, [activo, estado]);

  const casoActivo = activo !== null ? CASOS[activo] : null;
  const indiceVisible = activo === null || estado === "opening" || estado === "closing";

  return (
    <section
      ref={sectionRef}
      id="en-accion"
      aria-label="Investigación en acción"
      className="bg-gris-fondo relative isolate overflow-hidden"
    >
      <div className="mx-auto w-full max-w-screen-xl px-5 py-20 md:px-10 md:py-28">
        <p aria-live="polite" className="sr-only">
          {anuncio}
        </p>

        <div className="relative">
          {/* El índice vive en el flujo de la página; el expediente abierto
              es una capa fija encima — no compiten por el espacio. */}
          {indiceVisible && (
            <div className="relative">
              <div ref={introRef} data-casos-intro>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div className="max-w-3xl">
                    <Eyebrow>Investigación en acción</Eyebrow>
                    <RevealLines
                      as="h2"
                      enabled={!introRevelado}
                      className="font-display text-azul-principal mt-4 text-h2 font-extrabold tracking-[-0.02em]"
                    >
                      Casos de investigación
                    </RevealLines>
                    <RevealLines
                      as="p"
                      delay={0.12}
                      enabled={!introRevelado}
                      className="text-azul-principal/80 mt-5 font-sans text-body leading-relaxed"
                    >
                      La investigación toma forma cuando las preguntas se
                      encuentran con contextos, evidencias y decisiones reales.
                      Abrimos algunos procesos para mostrar cómo Empoderamiento
                      Docente investiga, aprende y transforma junto con las
                      comunidades educativas.
                    </RevealLines>
                  </div>
                  <p
                    className={`text-azul-principal/70 hidden shrink-0 items-center gap-3 pb-2 lg:flex ${ROTULO_MICRO}`}
                  >
                    ARCHIVO · {CASOS.length.toString().padStart(2, "0")} EXPEDIENTES
                  </p>
                </div>
                <div className="border-azul-principal/10 mt-10 border-t" />
              </div>

              <ol
                className={`mt-20 flex flex-col gap-5 md:block ${
                  estado === "index" ? "" : "pointer-events-none"
                }`}
              >
                {CASOS.map((caso, i) => (
                  <CarpetaCaso
                    key={caso.id}
                    caso={caso}
                    indice={i}
                    esUltima={i === CASOS.length - 1}
                    interactiva={estado === "index"}
                    onAbrir={abrir}
                    refItem={(el) => {
                      itemsRef.current[i] = el;
                    }}
                    refBoton={(el) => {
                      botonesRef.current[i] = el;
                    }}
                  />
                ))}
              </ol>

              {/* Remate del archivo: cierra la ficha, espejo de la línea
                  «ARCHIVO · 03 EXPEDIENTES» de arriba. */}
              <div
                ref={remateRef}
                data-casos-remate
                className="border-azul-principal/10 mt-10 flex items-baseline justify-between gap-6 border-t pt-4"
              >
                <p className={`text-azul-principal/70 ${ROTULO_MICRO}`}>
                  ARCHIVO ED — INVESTIGACIÓN EN ACCIÓN
                </p>
                <p className={`text-gris-texto ${ROTULO_MICRO}`}>
                  {CASOS.length.toString().padStart(2, "0")} CARPETAS
                </p>
              </div>
            </div>
          )}

          {casoActivo !== null && (
            <ExpedienteCaso
              key={casoActivo.id}
              caso={casoActivo}
              casos={CASOS}
              indice={activo ?? 0}
              interactiva={estado === "open"}
              telonOpaco={estado === "open" || estado === "switching"}
              onIr={irA}
              onVolver={solicitarCierre}
              refLugar={lugarRef}
              refShell={shellRef}
              refTitulo={tituloRef}
            />
          )}
        </div>
      </div>

      <NavegacionCasos
        visible={activo !== null && (estado === "open" || estado === "switching")}
        casos={CASOS}
        indiceActivo={activo ?? 0}
        interactiva={estado === "open"}
        onVolver={solicitarCierre}
        onIr={irA}
      />
    </section>
  );
}
