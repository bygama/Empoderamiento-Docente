"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Highlight } from "@/components/ui/Highlight";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { FaroEscena, CAPAS_Z, FOCO_X, FOCO_Y } from "./FaroEscena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hero de «Qué hacemos» v2 — scroll-story del faro con CÁMARA.
 *
 * La escena (FaroEscena) son seis capas con profundidad Z. Acá vive la
 * cámara: un proxy {z,x,y} animado por la timeline scrubbed; cada frame se
 * proyecta a cada capa con la fórmula de una cámara pinhole:
 *
 *   escala(Z)  = (P + Z) / (P + Z − camZ)      P = distancia focal
 *   despl.(Z)  = −camX · P / (P + Z − camZ)    (cerca se mueve más)
 *
 * Todo se expande desde el punto de fuga (transform-origin de las capas):
 * avanzar la cámara ES caminar el muelle hacia el faro. Paralaje correcto
 * sin preserve-3d (los filters/overflow no pueden aplanar nada).
 *
 * Recorrido (una sola escena que evoluciona, sin pantallas):
 *   S0 0.00–0.19  SILENCIO   plano general lejano, mundo apenas insinuado,
 *                            una chispa tenue en la linterna, una frase que
 *                            se queda hasta que el mundo empieza a entrar.
 *   S1 0.10–0.40  APROXIMACIÓN + ENCENDIDO  la cámara avanza, el muelle y
 *                            el primer plano ENTRAN por los bordes; a mitad
 *                            de camino la linterna prende (chispa → núcleo →
 *                            halo → haz) y la luz revela el mensaje central.
 *   S2 0.40–1.66  PREGUNTAS  cinco golpes, UNA pregunta por momento; el haz
 *                            dirige la lectura (izq lejos → izq alto → der →
 *                            der cerca → centro), la cámara se desplaza
 *                            lateralmente y sigue avanzando hasta el
 *                            contrapicado (faro ~55% del alto en la última).
 *                            Cada pregunta tocada deja un rastro verde en el
 *                            agua. Un beat por pregunta (PASO_PREGUNTA).
 *   S4 1.69–1.89  CIERRE     la noche no cede: el faro alumbra el titular
 *                            final y su CTA; el haz se abre y baña el plano.
 *   S5 1.84–1.93  DESLUMBRE  la linterna crece hasta dejar la pantalla en
 *                            blanco; la torre de líneas nace de ese blanco.
 *
 * Las posiciones son UNIDADES DE LA LÍNEA DE TIEMPO, no progreso 0–1: la
 * línea dura DURACION_RECORRIDO (>1) y ScrollTrigger reparte el runway
 * entero entre 0 y ese valor. Con el runway actual 1 unidad ≈ 620vh de
 * scroll. Ver el bloque de constantes de tiempo más abajo.
 *
 * Copy: 100% validado (data.ts / arquitectura de la rama de contenido
 * maestro), salvo el titular del cierre, pedido explícitamente por Gastón y
 * marcado VALIDAR con ED. Desktop-first: la coreografía corre en ≥1024px
 * sin reduced-motion (gsap.matchMedia rearma al cruzar el breakpoint); si
 * no, queda la escena estática encendida con el mensaje central (default
 * del JSX) y el runway colapsa a una pantalla (h-svh).
 */

const P = 1100; // distancia focal de la cámara imaginaria

/**
 * Las preguntas con las que empieza cada proyecto.
 *
 * ANTES esta escena mostraba los cinco VERBOS del método (Dialogamos,
 * Investigamos, Diseñamos, Implementamos, Evaluamos) bajo el rótulo «Cómo
 * trabajamos» — que es, textual, el título de una sección que viene más
 * abajo en esta misma página y cuenta lo mismo. La escena resumía el
 * contenido que la seguía.
 *
 * Ahora se queda solo con las preguntas: la escena PREGUNTA y las secciones
 * de abajo RESPONDEN. Es lo que el faro hace de verdad —alumbrar para ver
 * qué hay— y no le pisa el texto a nadie.
 */
const PREGUNTAS: ReadonlyArray<{ antes: string; clave: string; resto: string }> = [
  // La primera es la TESIS —las otras cuatro se desprenden de ella— y por
  // eso es la líder: más grande y más ancha (ver el JSX). Cada pregunta
  // lleva UNA palabra clave con el marcador de concepto del sitio (celeste
  // + subrayado verde, pintado por la luz cuando el haz la alcanza): antes
  // eran cinco bloques blancos idénticos y se leían planos.
  { antes: "¿Qué se quiere ", clave: "transformar", resto: " y por qué?" },
  { antes: "¿Qué sabemos de este problema y qué necesitamos ", clave: "comprender", resto: " mejor?" },
  { antes: "¿Qué puede producir un ", clave: "cambio real", resto: " en este contexto?" },
  { antes: "¿Qué está ocurriendo y qué necesitan ", clave: "quienes lo sostienen", resto: "?" },
  { antes: "¿Qué ", clave: "aprendimos", resto: " y qué puede sostener el equipo hacia adelante?" },
];

/** Posición del bloque de texto de cada verbo (viewport, desktop). */
const VERBO_POS: ReadonlyArray<React.CSSProperties> = [
  // La líder es más alta (dos líneas grandes): arranca más arriba para que
  // su pie quede lejos del horizonte.
  { left: "8%", top: "33%" },
  { left: "11%", top: "18%" },
  { right: "6%", top: "15%", textAlign: "right" },
  { right: "9%", top: "55%", textAlign: "right" },
  { left: "50%", bottom: "18%", transform: "translateX(-50%)", textAlign: "center" },
];

/** Ángulo del haz por verbo (izq = óptica izquierda, der = derecha). */
const HAZ_VERBO: ReadonlyArray<{ lado: "izq" | "der"; rot: number }> = [
  { lado: "izq", rot: -21 },
  { lado: "izq", rot: -13 },
  { lado: "der", rot: 42 },
  { lado: "der", rot: 59 },
  { lado: "izq", rot: -58 },
];

/* ── Escala de tiempo de la coreografía ────────────────────────────────────
 *
 * Las preguntas (S2) se ESTIRARON. Con beats de ~0.062 cada pregunta quedaba
 * plenamente legible apenas 0.01 (≈6vh, dos muescas de rueda) y el tramo
 * pasaba entero en un envión: era imposible scrollear sin que se fuera todo.
 * Ahora cada beat dura PASO_PREGUNTA y lo que viene después (cierre y
 * deslumbre) corre CORRIMIENTO en bloque, sin cambiar de velocidad.
 *
 * Para que S0 y S1 no se hagan más lentos, el runway (h-[…vh] del <section>)
 * crece en la misma proporción: alto = DURACION_RECORRIDO · 620vh + 200vh
 * (los 200 son la pantalla que corre detrás del hero y la del viewport).
 * Si se toca una cosa, se toca la otra. */
const INICIO_PREGUNTAS = 0.4;
// 0.30 ≈ 1.8 pantallas por pregunta. Con 0.15 un scroll chico sin querer
// pasaba dos títulos de largo.
const PASO_PREGUNTA = 0.3;
/** Un beat por pregunta. */
const BEATS = PREGUNTAS.map((_, i) => INICIO_PREGUNTAS + i * PASO_PREGUNTA);
/** La última pregunta se va poco después de su beat, como en el original. */
const FIN_PREGUNTAS = BEATS[BEATS.length - 1] + 0.06;
/** En la coreografía original S2 terminaba en 0.73; de ahí el corrimiento. */
const CORRIMIENTO = FIN_PREGUNTAS - 0.73;
/** Posición original (post-S2) → posición actual. */
const despues = (t: number) => t + CORRIMIENTO;
/**
 * Duración total de la línea de tiempo. Quien convierta una posición a
 * progreso del runway (por ejemplo el viaje del botón del hero) divide por
 * esto.
 */
export const DURACION_RECORRIDO = despues(1);

export function QueHacemosHeroFaro() {
  const rootRef = useRef<HTMLElement | null>(null);
  const altoRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const alto = altoRef.current;
    if (!root || !alto || reduced) return;

    // gsap.matchMedia rearma/desarma la coreografía al cruzar el breakpoint
    // (el gate evaluado una sola vez dejaba el estado congelado al resize).
    const mm = gsap.matchMedia(root);

    mm.add("(min-width: 1024px)", () => {
      let rafQa = 0;

      /* ── La cámara ──────────────────────────────────────────────────── */
      const cam = { z: -340, x: 0, y: 0 };
      // Entradas del mundo (S0→S1): offset vertical extra por capa, se suma
      // a la proyección para que el foreground ENTRE por el borde inferior.
      // El muelle NO desliza: está unido al faro y aparece con el mundo
      // (solo fade) — un muelle que viaja solo rompe la lectura espacial.
      const entrada = { foreground: 150, marMedio: 50 };

      // quickSetters cacheados: cero allocs por frame en el scrub.
      const capas = Array.from(
        root.querySelectorAll<HTMLElement>("[data-capa]"),
      ).map((el) => ({
        el,
        nombre: el.dataset.capa as keyof typeof CAPAS_Z,
        Z: CAPAS_Z[el.dataset.capa as keyof typeof CAPAS_Z],
        setX: gsap.quickSetter(el, "x", "px"),
        setY: gsap.quickSetter(el, "y", "px"),
        setS: gsap.quickSetter(el, "scale"),
        setSkX: gsap.quickSetter(el, "skewX", "deg"),
        setSY: gsap.quickSetter(el, "scaleY"),
      }));

      // El muelle atraviesa profundidades (su punta toca el islote, su borde
      // cercano casi pisa la cámara), pero la capa tiene UN solo Z: si se
      // traslada en bloque, la punta se despega de la torre con cada lateral
      // (paralaje de capa plana). Solución: la capa recibe el translate del
      // FARO (punta soldada a la base, siempre) y el paralaje extra del
      // tramo cercano lo pone una DEFORMACIÓN anclada en el punto de fuga
      // (skewX para laterales, scaleY para verticales): el borde cercano
      // barre, la punta no se mueve ni un píxel respecto del faro.
      const MEZCLA_PARALAJE = 0.65; // cuánto del paralaje propio conserva el tramo cercano
      const NEAR_Y = ((940 - 522) / 900) * 1.28; // borde cercano→fuga, en alturas de viewport

      const aplicarCamara = () => {
        const fFaro = P / (P + CAPAS_Z.faro - cam.z);
        const nearPx = NEAR_Y * window.innerHeight;
        for (const { nombre, Z, setX, setY, setS, setSkX, setSY } of capas) {
          const d = P + Z - cam.z;
          const f = P / d;
          setS((P + Z) / d);
          if (nombre === "muelle") {
            const dif = (f - fFaro) * MEZCLA_PARALAJE;
            setX(-cam.x * fFaro);
            setSkX((Math.atan2(-cam.x * dif, nearPx) * 180) / Math.PI);
            setY(-cam.y * fFaro);
            setSY(1 - (cam.y * dif) / nearPx);
          } else {
            setX(-cam.x * f);
            setY(-cam.y * f + ((entrada as Record<string, number>)[nombre] ?? 0) * f);
          }
        }
      };

      // El apuntado del haz a las preguntas se resuelve POR FRAME en
      // `girarHaces` (más abajo, junto a `anguloHacia`), después de los
      // tweens de cada tick: los bloques de texto son HTML por fuera del SVG
      // y la cámara transforma el SVG en cada frame, así que el ángulo
      // correcto cambia constantemente.


      // Promoción a GPU solo mientras la coreografía existe (el fallback
      // estático no paga las texturas de 6 capas full-viewport).
      gsap.set(capas.map((c) => c.el), { willChange: "transform" });

      // El CTA del cierre es alcanzable solo cuando la coreografía corre
      // (en el fallback el bloque está invisible: inert lo saca del foco).
      const cierreEl = root.querySelector("[data-esc='cierre']");
      cierreEl?.removeAttribute("inert");

      /* ── Estados iniciales = S0 (el JSX por defecto es el fallback S1
            encendido; acá se apaga y se aleja todo) ─────────────────────── */
      // PIVOTES DE LA LUZ — nunca svgOrigin: su parse salía corrupto
      // (medido: xOrigin −2003 en vez de 950, derivando con los refreshes)
      // y todo transform pivotaba desde cualquier lado. En su lugar,
      // transformOrigin en el espacio del BBOX de cada elemento, declarado
      // UNA vez (los tweens usan el caché y ningún refresh lo recalcula):
      // - halo/núcleo: círculos centrados EXACTO en el foco → "50% 50%".
      // - haces: el foco (950,388) relativo al bbox de sus conos. Cono izq:
      //   x −360..946, y 288..644 → (950−(−360), 388−288) = 1310px, 100px.
      //   Cono der: x 954..2260 → (950−954, 388−288) = −4px, 100px.
      //   (Si cambia la geometría de los conos en FaroEscena, recalcular.)
      gsap.set("[data-haz='izq']", { autoAlpha: 0, transformOrigin: "1310px 100px" });
      gsap.set("[data-haz='der']", { autoAlpha: 0, transformOrigin: "-4px 100px" });
      gsap.set("[data-halo]", { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
      gsap.set("[data-nucleo]", { autoAlpha: 0.16, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set("[data-linterna]", { opacity: 0.2 });
      gsap.set("[data-espejo]", { autoAlpha: 0 });
      gsap.set("[data-capa='marMedio']", { autoAlpha: 0.35 });
      gsap.set("[data-mensaje]", {
        autoAlpha: 0,
        clipPath: "inset(-8% 100% -8% 0)",
      });
      aplicarCamara();

      /**
       * Rotación que hace que el haz APUNTE al bloque de texto i.
       *
       * Antes los ángulos estaban a mano (HAZ_VERBO), calibrados para el copy
       * anterior: al cambiar las frases por preguntas los bloques cambiaron de
       * alto y de posición, y el haz quedó señalando "por ahí cerca" en vez de
       * al texto. Ahora se mide de verdad: se toma el centro del bloque en
       * pantalla, se lo pasa a coordenadas del SVG (getScreenCTM) y se calcula
       * el ángulo desde el foco de la linterna. La evalúa `girarHaces` en
       * cada frame, así sigue a la cámara mientras se mueve.
       *
       * Eje del haz en reposo: el izquierdo apunta a 176.4° desde el foco y el
       * derecho a 3.4° (medido de los polígonos de FaroEscena).
       */
      const REPOSO = { izq: 176.42, der: 3.41 } as const;
      const anguloHacia = (i: number, lado: "izq" | "der") => {
        const el = root.querySelector<HTMLElement>(`[data-verbo-txt='${i}']`);
        const svg = root.querySelector("svg");
        if (!el || !svg) return HAZ_VERBO[i].rot;
        const ctm = (svg as SVGSVGElement).getScreenCTM();
        if (!ctm) return HAZ_VERBO[i].rot;
        const r = el.getBoundingClientRect();
        const pt = new DOMPoint(r.left + r.width / 2, r.top + r.height / 2)
          .matrixTransform(ctm.inverse());
        const ang = (Math.atan2(pt.y - FOCO_Y, pt.x - FOCO_X) * 180) / Math.PI;
        // Normaliza a (-180, 180] para que no pegue vueltas de más.
        let delta = ang - REPOSO[lado];
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        return delta;
      };

      /**
       * GIRO DEL HAZ, por frame.
       *
       * La rotación de las ópticas durante las preguntas NO va en tweens: el
       * ángulo hacia cada texto depende de la cámara, que se mueve mientras
       * el haz gira (los paneos laterales caen justo en los cambios de lado).
       * Un tween congela el destino al arrancar, y cuando el apuntado en vivo
       * retomaba lo corregía de golpe: el haz "se iba a otro lado y volvía"
       * (14° medidos). Acá todo es en vivo: se interpola entre el ángulo REAL
       * del texto anterior y el del actual según el avance del giro, así el
       * final del giro coincide exacto con el apuntado. No guarda estado
       * (solo lee el tiempo de la línea y la geometría), por eso no hay salto
       * en ningún sentido del scroll.
       *
       * Cambio de lado: la luz BARRE en vez de cortarse. El cono que se va
       * sigue girando en el sentido del viaje mientras se apaga, y el que
       * llega arranca `barrido` grados más atrás en ese mismo sentido y
       * entra girando, con solape largo: se lee como una sola luz que pasa
       * por arriba del cielo. Sentido: saliendo de la izquierda, horario (+);
       * de la derecha, antihorario. Las opacidades sí son tweens (loop de
       * S2), con estos mismos tiempos.
       *
       * UN SOLO DUEÑO. Ningún tween de la línea de tiempo toca `rotation` de
       * las ópticas: ni el encendido (−8 → −2) ni el cierre (→ −46) — los
       * dos viven acá como tramos por tiempo. Cuando compartían dueño pasaba
       * esto: ScrollTrigger.refresh() re-renderiza la línea con los eventos
       * suprimidos, el tween del encendido volvía a escribir su −2 sobre el
       * haz y `girarHaces` no corría (onUpdate suprimido): el haz "se iba a
       * otro lado" hasta el próximo tick de scroll, que lo devolvía. Por lo
       * mismo se escribe con quickSetter (sin crear un tween por frame que
       * después GSAP pueda re-renderizar por su cuenta).
       *
       * Va declarado ANTES de la línea de tiempo: ScrollTrigger dispara
       * onUpdate en plena construcción, y una const declarada después
       * explota (zona muerta temporal) y tira abajo la escena entera.
       */
      const GIRO = {
        antesEntrada: 0.03,
        entrada: 0.07,
        antesSalida: 0.035,
        salida: 0.05,
        antesMismo: 0.025,
        mismo: 0.06,
        barrido: 36,
      } as const;
      // Encendido (S1): la óptica izquierda se asienta de −8 a −2 mientras
      // prende. Cierre (S4): desde la última pregunta al ángulo que baña el
      // titular. Mismos tiempos que sus tweens de opacidad.
      const ENCENDIDO = { desde: 0.226, dur: 0.035, rotDesde: -8 } as const;
      const REPOSO_S1 = -2; // el haz izq al final del encendido (S1)
      const CIERRE = { desde: despues(0.862), dur: 0.06, rot: -46 } as const;
      const easeInOut = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);
      const easeIn = (p: number) => 1 - Math.cos((p * Math.PI) / 2);
      const easeOut = (p: number) => 1 - (1 - p) * (1 - p);
      const clamp01 = (p: number) => Math.min(1, Math.max(0, p));
      const setters = {
        izq: gsap.quickSetter("[data-haz='izq']", "rotation", "deg"),
        der: gsap.quickSetter("[data-haz='der']", "rotation", "deg"),
      };
      const setRot = (lado: "izq" | "der", rotation: number) => setters[lado](rotation);
      // Se asigna recién creada la línea de tiempo (ver abajo): mientras no
      // exista, el giro no hace nada.
      let tlActual: gsap.core.Timeline | null = null;
      const girarHaces = () => {
        if (!tlActual) return;
        const ahora = tlActual.time();
        if (ahora < BEATS[0] - GIRO.antesSalida) {
          const p = clamp01((ahora - ENCENDIDO.desde) / ENCENDIDO.dur);
          setRot("izq", ENCENDIDO.rotDesde + (REPOSO_S1 - ENCENDIDO.rotDesde) * easeOut(p));
          return;
        }
        if (ahora > FIN_PREGUNTAS) {
          const ultimo = HAZ_VERBO.length - 1;
          const desde = anguloHacia(ultimo, "izq");
          const p = clamp01((ahora - CIERRE.desde) / CIERRE.dur);
          setRot("izq", desde + (CIERRE.rot - desde) * easeInOut(p));
          return;
        }
        let i = 0;
        while (i + 1 < BEATS.length && ahora >= BEATS[i + 1] - GIRO.antesSalida) i++;
        const t = BEATS[i];
        const { lado } = HAZ_VERBO[i];
        const prev = i > 0 ? HAZ_VERBO[i - 1] : null;
        const objetivo = anguloHacia(i, lado);
        if (prev && prev.lado !== lado) {
          const sentido = lado === "der" ? 1 : -1;
          const pIn = clamp01((ahora - (t - GIRO.antesEntrada)) / GIRO.entrada);
          setRot(lado, objetivo - sentido * GIRO.barrido * (1 - easeInOut(pIn)));
          const pOut = clamp01((ahora - (t - GIRO.antesSalida)) / GIRO.salida);
          setRot(prev.lado, anguloHacia(i - 1, prev.lado) + sentido * GIRO.barrido * easeIn(pOut));
        } else {
          const p = clamp01((ahora - (t - GIRO.antesMismo)) / GIRO.mismo);
          const desde = prev ? anguloHacia(i - 1, lado) : REPOSO_S1;
          setRot(lado, desde + (objetivo - desde) * easeInOut(p));
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onUpdate: () => {
          aplicarCamara();
          girarHaces();
        },
        scrollTrigger: {
          trigger: alto,
          // +100svh: el runway ahora empieza una pantalla antes (detrás del
          // hero), pero la coreografía tiene que seguir arrancando donde
          // arrancaba. Ese primer tramo muestra la escena quieta, en su
          // estado inicial, detrás del hero.
          start: () => `top+=${window.innerHeight} top`,
          end: "bottom bottom",
          scrub: 0.85,
          // Los ángulos del haz se calculan midiendo dónde quedó cada bloque
          // de texto: sin esto GSAP los evaluaría una sola vez y volverían a
          // desfasarse en cuanto cambie el layout (resize, fuente, copy).
          invalidateOnRefresh: true,
          // Un refresh de ScrollTrigger re-renderiza la línea pasando por el
          // progreso 0 CON eventos y vuelve al progreso actual SIN eventos:
          // cámara y haz quedaban en su estado inicial hasta el próximo tick
          // de scroll ("el haz se va a otro lado y vuelve"; medido: −8° tras
          // un resize a mitad de las preguntas). Se re-aplican al terminar.
          onRefresh: () => {
            aplicarCamara();
            girarHaces();
          },
        },
      });
      tlActual = tl;

      /* ── Detrás del hero: solo cielo ────────────────────────────────
         En el tramo que corre bajo el hero el faro queda HUNDIDO bajo el
         borde inferior y sube a su lugar mientras el hero se va. Así el
         titular se lee sobre el cielo estrellado sin que la torre se le
         cruce, y la aparición del faro sigue siendo la llegada de la cámara
         (la narrativa original de la escena).
         Se anima el wrapper interno, no [data-capa]: esa la escribe la
         cámara en cada frame y pisaría cualquier cosa que pongamos acá.

         LA LLEGADA FRENA, NO SE CLAVA. Antes la subida era lineal y
         terminaba justo en una pantalla: el mundo entero (torre, horizonte,
         estrellas) venía pegado al scroll y a 1vh se detenía en seco
         mientras la página seguía — y encima quedaba quieto casi una
         pantalla hasta que la cámara arrancaba (p=0.1). Ese cambio de
         velocidad era la "junta" que se sentía entre el hero y la escena,
         aunque el cielo fuera el mismo. Ahora la subida se reparte en
         LLEGADA_VH pantallas con freno en coseno: arranca al MISMO ritmo
         que antes (con sine.out la velocidad inicial es π/2 · 0.86 /
         LLEGADA_VH = 0.86× el scroll, así el tramo del hero no cambia) y
         desacelera hasta detenerse con la primera frase todavía en
         pantalla, un pelo antes de que la cámara empiece a avanzar. */
      const LLEGADA_VH = Math.PI / 2;
      gsap.fromTo(
        "[data-faro-shift]",
        { y: () => window.innerHeight * 0.86 },
        {
          y: 0,
          ease: "sine.out",
          scrollTrigger: {
            trigger: alto,
            start: "top top",
            end: () => `top+=${window.innerHeight * LLEGADA_VH} top`,
            scrub: 0.85,
            invalidateOnRefresh: true,
          },
        },
      );

      /* ── S0 · Silencio ──────────────────────────────────────────────── */
      // La frase SE QUEDA. Entraba en 0.012 y ya se iba en 0.078: plena
      // apenas 0.044 (≈27vh, un envión de rueda) y casi nadie la leía.
      // Ahora vive hasta 0.15 —el mundo empieza a entrar (S1, 0.1) con la
      // frase todavía en pantalla— y se va antes del encendido (0.21).
      tl.fromTo("[data-esc='0']", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: "sine.out" }, 0.012)
        .to("[data-esc='0']", { autoAlpha: 0, y: -16, duration: 0.035, ease: "sine.in" }, 0.15);

      /* ── S1 · Aproximación + encendido ──────────────────────────────── */
      tl.to(cam, { z: 80, duration: 0.2, ease: "power1.inOut" }, 0.1);
      // El mundo entra por los bordes mientras avanzamos.
      tl.to("[data-capa='marMedio']", { autoAlpha: 1, duration: 0.08, ease: "none" }, 0.1)
        .to(entrada, { marMedio: 0, duration: 0.1, ease: "power2.out" }, 0.1)
        .to(entrada, { foreground: 0, duration: 0.12, ease: "power2.out" }, 0.16);
      // Encendido con peso: chispa → núcleo → halo → haz → espejo.
      tl.to("[data-nucleo]", { autoAlpha: 1, scale: 1.6, duration: 0.008, ease: "power3.in" }, 0.21)
        .to("[data-nucleo]", { scale: 1, duration: 0.015 }, 0.218)
        .to("[data-linterna]", { opacity: 1, duration: 0.012 }, 0.212)
        .to("[data-halo]", { autoAlpha: 1, scale: 1, duration: 0.028 }, 0.216)
        // (Solo la opacidad: la rotación del haz, también su asentado de −8
        // a −2 al prender, la pone `girarHaces`. Ver ahí por qué.)
        .fromTo("[data-haz='izq']", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.035, ease: "power1.out" }, 0.226)
        .to("[data-espejo]", { autoAlpha: 1, duration: 0.04 }, 0.235);
      // La luz atraviesa la zona del titular y el mensaje emerge con ella.
      tl.to("[data-mensaje]", { autoAlpha: 1, duration: 0.012, ease: "none" }, 0.262)
        .to("[data-mensaje]", { clipPath: "inset(-8% 0% -8% 0)", duration: 0.05, ease: "power1.inOut" }, 0.262)
        // …y deja el concepto encendido: el subrayado verde de «procesos».
        .fromTo("[data-mensaje] mark", { backgroundSize: "0% 0.14em" }, { backgroundSize: "100% 0.14em", duration: 0.022, ease: "power1.inOut" }, 0.318)
        .to("[data-mensaje]", { autoAlpha: 0, y: -26, duration: 0.028, ease: "power2.in" }, 0.372);

      /* ── S2 · Método: un verbo por momento ──────────────────────────── */
      const beats = BEATS;
      // Desplazamientos laterales de cámara: el encuadre respira y el faro
      // cambia de lado del cuadro. Van atados a los beats (se mueve justo
      // antes de la pregunta que cambia de lado) con la misma duración de
      // siempre: al estirar S2 se alargan las lecturas, no los paneos.
      tl.to(cam, { x: -70, duration: 0.06, ease: "power1.inOut" }, beats[0] - 0.005)
        .to(cam, { x: 120, duration: 0.08, ease: "power1.inOut" }, beats[2] - 0.024)
        .to(cam, { x: 60, duration: 0.06, ease: "power1.inOut" }, beats[3] + 0.002)
        .to(cam, { x: 0, duration: 0.06, ease: "power1.inOut" }, beats[4] + 0.005)
        // …y sigue avanzando, repartido a lo largo del tramo, hasta el
        // contrapicado que llega con la última pregunta.
        .to(cam, { z: 380, duration: beats[3] - beats[0] - 0.06, ease: "power1.inOut" }, beats[0] + 0.04)
        .to(cam, { z: 600, duration: PASO_PREGUNTA + 0.03, ease: "power1.inOut" }, beats[3] + 0.002);

      // `anguloHacia` y `girarHaces` (la rotación del haz hacia cada
      // pregunta) viven arriba, antes de crear la línea de tiempo.
      beats.forEach((t, i) => {
        const { lado } = HAZ_VERBO[i];
        const otro = lado === "izq" ? "der" : "izq";
        const prev = i > 0 ? HAZ_VERBO[i - 1] : null;
        // La rotación la pone `girarHaces` por frame; acá solo el crossfade
        // de opacidad cuando la luz cambia de óptica, con los tiempos de GIRO.
        if (prev && prev.lado !== lado) {
          tl.to(`[data-haz='${otro}']`, { autoAlpha: 0, duration: GIRO.salida, ease: "sine.in" }, t - GIRO.antesSalida)
            .to(`[data-haz='${lado}']`, { autoAlpha: 1, duration: GIRO.entrada, ease: "sine.inOut" }, t - GIRO.antesEntrada);
        }
        // Consecuencia: el agua se enciende donde el haz llega…
        tl.to(`[data-verbo-punto='${i}']`, { autoAlpha: 1, duration: 0.02 }, t + 0.018)
          // …la pregunta toma la escena (entrada y salida de 0.03: con
          // 0.016 un scroll rápido las hacía parpadear)…
          .fromTo(`[data-verbo-txt='${i}'] [data-v]`, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: "sine.out" }, t + 0.02)
          // …y la luz pinta el concepto: el subrayado verde de la palabra
          // clave se dibuja cuando el haz ya está sobre ella. Largo (0.12 ≈
          // 74vh de scroll): con 0.04 se pintaba en un parpadeo.
          .fromTo(`[data-verbo-txt='${i}'] mark`, { backgroundSize: "0% 0.12em" }, { backgroundSize: "100% 0.12em", duration: 0.12, ease: "sine.inOut" }, t + 0.05);
        // …y al ceder deja una idea encendida (rastro verde) en el agua.
        const fin = i < 4 ? beats[i + 1] - 0.03 : FIN_PREGUNTAS;
        tl.to(`[data-verbo-txt='${i}'] [data-v]`, { autoAlpha: 0, y: -16, duration: 0.03, ease: "sine.in" }, fin)
          .to(`[data-verbo-punto='${i}']`, { autoAlpha: 0.22, duration: 0.02 }, fin)
          .to(`[data-rastro='${i}']`, { autoAlpha: 0.6, duration: 0.014 }, fin + 0.004);
      });
      /* ── S4 · Cierre EN LA NOCHE ────────────────────────────────────────
         Antes acá amanecía (dos velos de alba, estrellas apagándose y el haz
         retirándose) y el plano final quedaba sobre fondo marfil. Ahora la
         noche NO cede: es el faro el que ilumina el cierre, igual que en el
         resto de las ilustraciones del sitio. Los velos y la bruma quedan en
         el DOM pero no se animan; el haz se queda encendido barriendo el
         primer plano y la lámpara sube a plena en vez de bajar a mínima. */
      // Posiciones de acá en adelante: las originales, corridas por
      // `despues` (ver CORRIMIENTO).
      tl.to(cam, { z: -260, duration: 0.1, ease: "power1.inOut" }, despues(0.862))
        .to(cam, { y: 0, duration: 0.08, ease: "power1.inOut" }, despues(0.862));
      tl.to("[data-verbo-punto]", { autoAlpha: 0, duration: 0.03, ease: "none" }, despues(0.866))
        // El haz sigue vivo: abre un poco y baña la zona del titular (el
        // giro a −46° lo hace `girarHaces`; acá solo la opacidad).
        .to("[data-haz='izq']", { autoAlpha: 1, duration: 0.04, ease: "none" }, despues(0.862))
        // La linterna queda a plena: es la única fuente de luz del plano.
        .to("[data-halo]", { autoAlpha: 1, duration: 0.05 }, despues(0.88))
        .to("[data-nucleo]", { autoAlpha: 1, duration: 0.05 }, despues(0.88));
      // Entra apenas se va la ultima pregunta (0.73). Al retirar el bloque
      // de niveles quedaba un hueco de ~0.14 sin nada — casi una pantalla de
      // scroll muerto antes del remate.
      tl.fromTo("[data-esc='cierre']", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.03 }, despues(0.762))
        .fromTo("[data-esc='cierre'] [data-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.022 }, despues(0.79));

      /* ── S5 · Deslumbre → puente con la torre ────────────────────────────
         El faro gira hacia la cámara: el haz se abre y viene de frente, la
         linterna crece y el foco radial tapa la escena hasta dejar la
         pantalla en blanco. La torre de líneas (fondo claro) se arma desde
         ese blanco, así el corte noche→día deja de ser un salto seco.
         El titular sale ANTES de que el blanco lo alcance: leerlo mientras
         se lava daría un gris ilegible a mitad de camino. */
      // El RAYO se apaga en cuanto el titular terminó de aparecer: ya cumplió
      // su función de guiar la lectura. La luz no desaparece — se concentra
      // en la linterna, y de ahí sale el flash.
      tl.to("[data-haz='izq'], [data-haz='der']", { autoAlpha: 0, duration: 0.05, ease: "power2.in" }, despues(0.906))
        // El titular sale antes de que el blanco lo alcance.
        .to("[data-esc='cierre']", { autoAlpha: 0, duration: 0.035, ease: "none" }, despues(0.958))
        // ── La luz que CRECE es la del propio faro ──────────────────────
        // No se agregan luces nuevas: se escala el halo y el núcleo que la
        // linterna ya tiene. Están dibujados en el SVG, en la punta exacta,
        // así que nacen del lugar correcto por construcción — con capas
        // aparte había que adivinar la posición (y quedaban como manchas
        // sueltas al costado del faro, además de sumar luces que no existen).
        // svgOrigin en el foco: crecen desde la lámpara, no desde su centro.
        .to(
          "[data-halo]",
          { scale: 46, duration: 0.088, ease: "power2.in" },
          despues(0.912),
        )
        .to(
          "[data-nucleo]",
          { scale: 30, duration: 0.084, ease: "power2.in" },
          despues(0.916),
        )
        // El mar del frente SE QUEMA con la luz: está DELANTE del faro
        // (Z 300 contra 620), así que el halo crece por detrás y quedaría
        // recortado sobre el blanco. Sobreexponerlo es lo que pasa de verdad
        // cuando una fuente inunda el cuadro.
        // (El muelle y el foreground ya no existen — ver FaroEscena.)
        .to(
          "[data-capa='marMedio']",
          { autoAlpha: 0, duration: 0.072, ease: "power2.in" },
          despues(0.924),
        );

      // VELO BLANCO. El halo y el núcleo crecen desde la lámpara, pero su
      // gradiente radial nunca llega a blanco en los bordes: a p=1 el cuadro
      // quedaba en una bruma gris azulada con la torre, el horizonte y un
      // punto brillante todavía visibles, y la torre de líneas se fundía
      // encima de eso. El velo es uniforme y va sobre la escena: remata la
      // sobreexposición para que al final del runway la pantalla SEA blanca.
      // De ese blanco nace la torre (TorreLineas arranca con su propio velo
      // blanco y lo disuelve por tiempo). Como es un plano uniforme, no
      // puede despegarse de la linterna: no vuelve la "segunda esfera".
      // Sube largo y en seno (no acelerando hasta el final): el blanco llega
      // como una sobreexposición que crece, no como un golpe.
      tl.to("[data-velo-blanco]", { opacity: 1, duration: 0.07, ease: "sine.inOut" }, despues(0.93));

      // Sin círculo de flash aparte: ESE era la "segunda esfera" que
      // aparecía corrida a la izquierda del faro. Estaba anclado a una
      // posición medida una sola vez (onStart) mientras la cámara seguía
      // moviendo la escena, así que se despegaba de la linterna. El halo y
      // el núcleo, al vivir dentro del SVG, viajan con la cámara y no
      // pueden despegarse: encandilan solos.
      // Cierra la línea en su duración total: es lo que ScrollTrigger reparte
      // sobre el runway.
      tl.set({}, {}, DURACION_RECORRIDO);

      // Solo dev: `#qa=0.42` clava el timeline en ese progreso (sin scroll:
      // el screenshot headless no respeta scrollTo). QA determinista.
      if (process.env.NODE_ENV === "development") {
        const m = window.location.hash.match(/qa=([\d.]+)/);
        if (m) {
          const p = Math.min(1, Math.max(0, parseFloat(m[1])));
          rafQa = requestAnimationFrame(() => {
            tl.scrollTrigger?.disable(false);
            tl.progress(p);
          });
        }
      }

      return () => {
        if (rafQa) cancelAnimationFrame(rafQa);
        cierreEl?.setAttribute("inert", "");
      };
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    // z-10: la torre se mete una pantalla por debajo (solape del deslumbre).
    // Esta sección tiene que pintar POR ENCIMA mientras dura el pin; si no,
    // la torre asomaría sobre la escena nocturna.
    // -mt de una pantalla: el escenario del faro arranca DETRÁS del hero, así
    // el cielo y las estrellas son literalmente los mismos para las dos
    // secciones (antes solo compartían el color de fondo). El hero va encima
    // con z mayor y sin fondo propio, así que se lee como una sola escena.
    <section
      id="faro"
      ref={rootRef}
      className="relative z-10 lg:-mt-[100svh] lg:motion-reduce:mt-0"
      aria-label="Qué hace Empoderamiento Docente"
    >
      {/* El runway solo existe donde corre la coreografía: en mobile o con
          reduced-motion colapsa a una pantalla (nada de scroll muerto).
          Alto = DURACION_RECORRIDO · 620vh + 200vh (1.93 · 620 + 200 ≈ 1397):
          si cambia la duración de la línea de tiempo, cambia este número. */}
      <div ref={altoRef} className="relative h-svh lg:h-[1397vh] lg:motion-reduce:h-svh">
        <div
          data-escenario
          // Sin fondo propio: lo pone el envoltorio compartido con el hero
          // (ver app/que-hacemos/page.tsx). El cielo es uno solo para las dos
          // secciones, así no hay junta posible.
          className="sticky top-0 isolate h-svh overflow-hidden"
        >
          <FaroEscena />

          {/* Velo blanco del deslumbre: encima de la escena, debajo de los
              textos (el titular ya salió cuando este sube). Solo la
              coreografía lo enciende; en el fallback queda en 0. */}
          <div
            data-velo-blanco
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: 0 }}
          />

          {/* Titular de la sección, siempre perceptible para AT (h2: el h1
              de la página vive en QueHacemosHero, que va primero): la
              versión visual de abajo entra y sale con la coreografía. */}
          <h2 className="sr-only">
            Diseñamos y acompañamos procesos que transforman la matemática
            escolar.
          </h2>

          {/* ══ Overlays de texto — una idea por momento ══ */}

          {/* S0 · La pregunta en la noche (principio «Singularidad», data.ts) */}
          <div data-esc="0" aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center" style={{ opacity: 0 }}>
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              <p className="text-azul-claro/90 font-display max-w-[30ch] text-[1.65rem] font-medium leading-snug md:text-[2rem]">
                Cada contexto educativo presenta actores, objetivos, tensiones
                y posibilidades diferentes.
              </p>
            </div>
          </div>

          {/* S1 · Mensaje central — el momento tipográfico principal. También
              es el fallback estático (sin JS / reduced-motion / <lg). El
              subrayado de «procesos» se pinta con la luz (background-size).
              aria-hidden: para AT el titular es el h1 sr-only de arriba. */}
          <div data-esc="1" aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              {/* Sin eyebrow: «Qué hacemos» ya es el título de la página y
                  el hero lo acaba de decir; repetirlo acá le quitaba peso al
                  momento tipográfico (pedido de Mateo, 2026-09-02). */}
              <div data-mensaje>
                <p
                  className="font-display max-w-[19ch] font-extrabold tracking-[-0.03em] text-white [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:100%_0.14em] [&_mark]:no-underline"
                  style={{ fontSize: "clamp(2.6rem, 1.2rem + 3.9vw, 4.6rem)", lineHeight: 1.06 }}
                >
                  Diseñamos y acompañamos <Highlight>procesos</Highlight> que
                  transforman la matemática escolar.
                </p>
              </div>
            </div>
          </div>

          {/* S2 sin caption: llevaba el eyebrow «Antes de proponer nada»
              arriba de las preguntas; se quitó junto con el de S1 para que
              cada momento tenga UNA sola lectura. */}

          {/* S2 · Los cinco verbos: un golpe narrativo por momento */}
          {PREGUNTAS.map(({ antes, clave, resto }, i) => {
            // La primera pregunta es la tesis: un escalón más grande y más
            // ancha que las cuatro que se desprenden de ella.
            const lider = i === 0;
            return (
              <div
                key={clave}
                data-verbo-txt={i}
                aria-hidden="true"
                // La líder cierra en dos líneas («…transformar y por qué?»
                // entera en la segunda): 44rem, pero nunca más de 54vw para
                // que en desktops angostos no se meta bajo la torre.
                className={`pointer-events-none absolute ${lider ? "max-w-[min(44rem,54vw)]" : "max-w-[26rem]"}`}
                style={VERBO_POS[i]}
              >
                {/* La palabra clave: celeste (la luz la toca) + subrayado
                    verde pintado por la coreografía (background-size 0→100%,
                    mismo mecanismo que el mensaje central). Sombra suave
                    para despegar el texto del cielo. */}
                <p
                  data-v
                  className="font-display font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_28px_rgb(6_11_25/0.6)] [&_mark]:text-azul-claro [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:0%_0.12em] [&_mark]:no-underline"
                  style={{
                    fontSize: lider
                      ? "clamp(2.2rem, 1.2rem + 2.4vw, 3.4rem)"
                      : "clamp(1.6rem, 1rem + 1.6vw, 2.4rem)",
                    lineHeight: lider ? 1.1 : 1.18,
                    opacity: 0,
                  }}
                >
                  {antes}
                  <Highlight>{clave}</Highlight>
                  {resto}
                </p>
              </div>
            );
          })}

          {/* S3 RETIRADO. Mostraba «Niveles en los que intervenimos» + «Del
              sistema al aula» con cinco estaciones — es, textual, el título y
              el contenido de una sección que viene más abajo. Además las
              estaciones se posicionaban a lo largo del muelle, que ya no
              existe, así que quedaban flotando sobre el agua. */}

          {/* S4 · Cierre sobre el amanecer. Titular pedido por Gastón
              (VALIDAR con ED); CTA real del proyecto hacia #lineas — en el
              copy validado es la acción secundaria del hero (la primaria es
              «Conversemos»), acá va naranja como única acción del plano
              final: VALIDAR jerarquía con ED. `inert` por defecto: en el
              fallback está invisible y no debe recibir foco; la coreografía
              lo quita al montar. */}
          <div data-esc="cierre" inert className="pointer-events-none absolute inset-0 flex items-center" style={{ opacity: 0 }}>
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              {/* Blanco, no navy: el cierre ya no ocurre sobre el amanecer
                  sino sobre la noche iluminada por el faro. */}
              <p
                className="font-display max-w-[19ch] font-extrabold tracking-[-0.025em] text-white"
                style={{
                  fontSize: "clamp(2.4rem, 1.2rem + 3.2vw, 4rem)",
                  lineHeight: 1.08,
                  textShadow: "0 2px 40px rgb(6 11 25 / 0.75)",
                }}
              >
                La transformación queda encendida en cada equipo.
              </p>
              <div data-cta className="pointer-events-auto mt-9" style={{ opacity: 0 }}>
                <ButtonPrimary href="#lineas">Ver líneas de acción</ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
