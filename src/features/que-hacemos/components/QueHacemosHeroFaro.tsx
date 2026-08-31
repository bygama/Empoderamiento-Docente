"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Eyebrow } from "@/components/ui/Eyebrow";
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
 *   S0 0.00–0.10  SILENCIO   plano general lejano, mundo apenas insinuado,
 *                            una chispa tenue en la linterna, una frase.
 *   S1 0.10–0.40  APROXIMACIÓN + ENCENDIDO  la cámara avanza, el muelle y
 *                            el primer plano ENTRAN por los bordes; a mitad
 *                            de camino la linterna prende (chispa → núcleo →
 *                            halo → haz) y la luz revela el mensaje central.
 *   S2 0.40–0.73  PREGUNTAS  cinco golpes, UNA pregunta por momento; el haz
 *                            dirige la lectura (izq lejos → izq alto → der →
 *                            der cerca → centro), la cámara se desplaza
 *                            lateralmente y sigue avanzando hasta el
 *                            contrapicado (faro ~55% del alto en Evaluamos).
 *                            Cada verbo tocado deja un rastro verde en el
 *                            agua. Vacío breve como conector.
 *   S3 0.74–0.86  ESCALAS    el plano SE ABRE (pull-back): «Del sistema al
 *                            aula» pide plano general; cinco estaciones a lo
 *                            largo del muelle, encendidas por el barrido.
 *   S4 0.86–1.00  AMANECER   la noche cede en dos velos (alba → día), las
 *                            estrellas se apagan, el haz ya no hace falta
 *                            (la lámpara queda en mínima), y el cielo
 *                            termina EXACTAMENTE en gris-fondo: la sección
 *                            siguiente es la continuación literal del cielo.
 *
 * Copy: 100% validado (data.ts / arquitectura de la rama de contenido
 * maestro), salvo el titular del cierre, pedido explícitamente por Gastón y
 * marcado VALIDAR con ED. Desktop-first: la coreografía corre en ≥1024px
 * sin reduced-motion (gsap.matchMedia rearma al cruzar el breakpoint); si
 * no, queda la escena estática encendida con el mensaje central (default
 * del JSX) y el runway colapsa a una pantalla (h-svh).
 */

const P = 1100; // distancia focal de la cámara imaginaria
const ORIGEN_FOCO = `${FOCO_X} ${FOCO_Y}`;

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
const PREGUNTAS = [
  "¿Qué se quiere transformar y por qué?",
  "¿Qué sabemos de este problema y qué necesitamos comprender mejor?",
  "¿Qué puede producir un cambio real en este contexto?",
  "¿Qué está ocurriendo y qué necesitan quienes lo sostienen?",
  "¿Qué aprendimos y qué puede sostener el equipo hacia adelante?",
] as const;

/** Posición del bloque de texto de cada verbo (viewport, desktop). */
const VERBO_POS: ReadonlyArray<React.CSSProperties> = [
  { left: "8%", top: "38%" },
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

      /**
       * APUNTADO EN VIVO del haz al texto activo.
       *
       * Los bloques de texto son HTML por fuera del SVG, y la cámara
       * transforma el SVG en cada frame: la relación entre "dónde está el
       * texto en pantalla" y "qué ángulo es eso dentro del SVG" CAMBIA
       * constantemente. Calcular el ángulo una sola vez (como hacían los
       * valores fijos de HAZ_VERBO) daba errores de 50° a 116° medidos.
       *
       * Por eso se resuelve por frame, corriendo DESPUÉS de los tweens: se
       * busca el bloque visible, se pasa su centro a coordenadas del SVG con
       * getScreenCTM y se orienta el haz a ese ángulo. Si no hay ninguno
       * visible no se toca nada y manda la coreografía (el remate del final
       * apunta al centro por su cuenta).
       */
      const REPOSO_HAZ = { izq: 176.42, der: 3.41 } as const;
      const svgFaro = root.querySelector("svg");
      const apuntarAlTextoActivo = () => {
        if (!svgFaro) return;
        const bloques = root.querySelectorAll<HTMLElement>("[data-verbo-txt]");
        let activo: HTMLElement | null = null;
        let mejor = 0.15;
        for (const b of bloques) {
          const v = b.querySelector<HTMLElement>("[data-v]");
          const op = v ? parseFloat(getComputedStyle(v).opacity) : 0;
          if (op > mejor) { mejor = op; activo = b; }
        }
        if (!activo) return;
        const ctm = (svgFaro as SVGSVGElement).getScreenCTM();
        if (!ctm) return;
        const r = activo.getBoundingClientRect();
        const pt = new DOMPoint(r.left + r.width / 2, r.top + r.height / 2)
          .matrixTransform(ctm.inverse());
        const ang = (Math.atan2(pt.y - FOCO_Y, pt.x - FOCO_X) * 180) / Math.PI;
        const lado: "izq" | "der" = pt.x < FOCO_X ? "izq" : "der";
        let delta = ang - REPOSO_HAZ[lado];
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        gsap.set(`[data-haz='${lado}']`, { rotation: delta, svgOrigin: ORIGEN_FOCO });
      };


      // Promoción a GPU solo mientras la coreografía existe (el fallback
      // estático no paga las texturas de 6 capas full-viewport).
      gsap.set(capas.map((c) => c.el), { willChange: "transform" });

      // El CTA del cierre es alcanzable solo cuando la coreografía corre
      // (en el fallback el bloque está invisible: inert lo saca del foco).
      const cierreEl = root.querySelector("[data-esc='cierre']");
      cierreEl?.removeAttribute("inert");

      /* ── Estados iniciales = S0 (el JSX por defecto es el fallback S1
            encendido; acá se apaga y se aleja todo) ─────────────────────── */
      gsap.set("[data-haz='izq'], [data-haz='der']", { autoAlpha: 0 });
      gsap.set("[data-halo]", { autoAlpha: 0, scale: 0.3, svgOrigin: ORIGEN_FOCO });
      gsap.set("[data-nucleo]", { autoAlpha: 0.16, scale: 0.5, svgOrigin: ORIGEN_FOCO });
      gsap.set("[data-linterna]", { opacity: 0.2 });
      gsap.set("[data-espejo]", { autoAlpha: 0 });
      gsap.set("[data-capa='marMedio']", { autoAlpha: 0.35 });
      gsap.set("[data-mensaje]", {
        autoAlpha: 0,
        clipPath: "inset(-8% 100% -8% 0)",
      });
      aplicarCamara();

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onUpdate: () => {
          aplicarCamara();
          apuntarAlTextoActivo();
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
        },
      });

      /* ── Detrás del hero: solo cielo ────────────────────────────────
         En el tramo que corre bajo el hero el faro queda HUNDIDO bajo el
         borde inferior y sube a su lugar justo cuando arranca la
         coreografía. Así el titular se lee sobre el cielo estrellado sin que
         la torre se le cruce, y la aparición del faro sigue siendo la
         llegada de la cámara (la narrativa original de la escena).
         Se anima el wrapper interno, no [data-capa]: esa la escribe la
         cámara en cada frame y pisaría cualquier cosa que pongamos acá. */
      gsap.fromTo(
        "[data-faro-shift]",
        { y: () => window.innerHeight * 0.86 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: alto,
            start: "top top",
            end: () => `top+=${window.innerHeight} top`,
            scrub: 0.85,
            invalidateOnRefresh: true,
          },
        },
      );

      /* ── S0 · Silencio ──────────────────────────────────────────────── */
      tl.fromTo("[data-esc='0']", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.022 }, 0.012)
        .to("[data-esc='0']", { autoAlpha: 0, y: -16, duration: 0.02, ease: "power2.in" }, 0.078);

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
        .fromTo("[data-haz='izq']", { autoAlpha: 0, rotation: -8, svgOrigin: ORIGEN_FOCO }, { autoAlpha: 1, rotation: -2, duration: 0.035, ease: "power1.out" }, 0.226)
        .to("[data-espejo]", { autoAlpha: 1, duration: 0.04 }, 0.235);
      // La luz atraviesa la zona del titular y el mensaje emerge con ella.
      tl.to("[data-mensaje]", { autoAlpha: 1, duration: 0.012, ease: "none" }, 0.262)
        .to("[data-mensaje]", { clipPath: "inset(-8% 0% -8% 0)", duration: 0.05, ease: "power1.inOut" }, 0.262)
        // …y deja el concepto encendido: el subrayado verde de «procesos».
        .fromTo("[data-mensaje] mark", { backgroundSize: "0% 0.14em" }, { backgroundSize: "100% 0.14em", duration: 0.022, ease: "power1.inOut" }, 0.318)
        .to("[data-mensaje]", { autoAlpha: 0, y: -26, duration: 0.028, ease: "power2.in" }, 0.372);

      /* ── S2 · Método: un verbo por momento ──────────────────────────── */
      const beats = [0.4, 0.462, 0.524, 0.598, 0.667] as const;
      // Desplazamientos laterales de cámara: el encuadre respira y el faro
      // cambia de lado del cuadro.
      tl.to(cam, { x: -70, duration: 0.06, ease: "power1.inOut" }, 0.395)
        .to(cam, { x: 120, duration: 0.08, ease: "power1.inOut" }, 0.5)
        .to(cam, { x: 60, duration: 0.06, ease: "power1.inOut" }, 0.6)
        .to(cam, { x: 0, duration: 0.06, ease: "power1.inOut" }, 0.672)
        // …y sigue avanzando hasta el contrapicado de «Evaluamos».
        .to(cam, { z: 380, duration: 0.14, ease: "power1.inOut" }, 0.44)
        .to(cam, { z: 600, duration: 0.1, ease: "power1.inOut" }, 0.6);

      /**
       * Rotación que hace que el haz APUNTE al bloque de texto i.
       *
       * Antes los ángulos estaban a mano (HAZ_VERBO), calibrados para el copy
       * anterior: al cambiar las frases por preguntas los bloques cambiaron de
       * alto y de posición, y el haz quedó señalando "por ahí cerca" en vez de
       * al texto. Ahora se mide de verdad: se toma el centro del bloque en
       * pantalla, se lo pasa a coordenadas del SVG (getScreenCTM) y se calcula
       * el ángulo desde el foco de la linterna. Function-based, así se
       * recalcula en cada refresh y no se desfasa nunca más.
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

      beats.forEach((t, i) => {
        const { lado } = HAZ_VERBO[i];
        const rot = () => anguloHacia(i, lado);
        const otro = lado === "izq" ? "der" : "izq";
        const prev = i > 0 ? HAZ_VERBO[i - 1] : null;
        // La óptica gira hacia el punto (crossfade si cambia de lado). El
        // wind-up se planta con un set HIJO del timeline: al scrubbear en
        // reversa el playhead lo cruza y restaura la rotación previa (un
        // fromTo dejaría el wind-up pegado hacia atrás).
        if (prev && prev.lado !== lado) {
          tl.set(`[data-haz='${lado}']`, { rotation: () => rot() + (lado === "der" ? -14 : 14), svgOrigin: ORIGEN_FOCO }, t - 0.007)
            .to(`[data-haz='${otro}']`, { autoAlpha: 0, duration: 0.018, ease: "none" }, t - 0.006)
            .to(`[data-haz='${lado}']`, { autoAlpha: 1, rotation: rot, duration: 0.03, ease: "power1.inOut" }, t);
        } else {
          tl.to(`[data-haz='${lado}']`, { rotation: rot, svgOrigin: ORIGEN_FOCO, duration: 0.028, ease: "power1.inOut" }, t - 0.004);
        }
        // Consecuencia: el agua se enciende donde el haz llega…
        tl.to(`[data-verbo-punto='${i}']`, { autoAlpha: 1, duration: 0.014 }, t + 0.018)
          // …el verbo toma la escena…
          .fromTo(`[data-verbo-txt='${i}'] [data-v]`, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.016 }, t + 0.02)
          .fromTo(`[data-verbo-txt='${i}'] [data-q]`, { autoAlpha: 0, y: 16 }, { autoAlpha: 0.9, y: 0, duration: 0.014 }, t + 0.024);
        // …y al ceder deja una idea encendida (rastro verde) en el agua.
        const fin = i < 4 ? beats[i + 1] - 0.016 : 0.73;
        tl.to(`[data-verbo-txt='${i}'] [data-v], [data-verbo-txt='${i}'] [data-q]`, { autoAlpha: 0, y: -16, duration: 0.016, ease: "power2.in" }, fin)
          .to(`[data-verbo-punto='${i}']`, { autoAlpha: 0.22, duration: 0.02 }, fin)
          .to(`[data-rastro='${i}']`, { autoAlpha: 0.6, duration: 0.014 }, fin + 0.004);
      });
      tl.fromTo("[data-esc='cap2']", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.02 }, 0.398)
        .to("[data-esc='cap2']", { autoAlpha: 0, duration: 0.018, ease: "power2.in" }, 0.73);

      /* ── S4 · Cierre EN LA NOCHE ────────────────────────────────────────
         Antes acá amanecía (dos velos de alba, estrellas apagándose y el haz
         retirándose) y el plano final quedaba sobre fondo marfil. Ahora la
         noche NO cede: es el faro el que ilumina el cierre, igual que en el
         resto de las ilustraciones del sitio. Los velos y la bruma quedan en
         el DOM pero no se animan; el haz se queda encendido barriendo el
         primer plano y la lámpara sube a plena en vez de bajar a mínima. */
      tl.to(cam, { z: -260, duration: 0.1, ease: "power1.inOut" }, 0.862)
        .to(cam, { y: 0, duration: 0.08, ease: "power1.inOut" }, 0.862);
      tl.to("[data-verbo-punto]", { autoAlpha: 0, duration: 0.03, ease: "none" }, 0.866)
        // El haz sigue vivo: abre un poco y baña la zona del titular.
        .to("[data-haz='izq']", { rotation: -46, duration: 0.06, ease: "power1.inOut", svgOrigin: ORIGEN_FOCO }, 0.862)
        .to("[data-haz='izq']", { autoAlpha: 1, duration: 0.04, ease: "none" }, 0.862)
        // La linterna queda a plena: es la única fuente de luz del plano.
        .to("[data-halo]", { autoAlpha: 1, duration: 0.05 }, 0.88)
        .to("[data-nucleo]", { autoAlpha: 1, duration: 0.05 }, 0.88);
      // Entra apenas se va la ultima pregunta (0.73). Al retirar el bloque
      // de niveles quedaba un hueco de ~0.14 sin nada — casi una pantalla de
      // scroll muerto antes del remate.
      tl.fromTo("[data-esc='cierre']", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.03 }, 0.762)
        .fromTo("[data-esc='cierre'] [data-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.022 }, 0.79);

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
      tl.to("[data-haz='izq'], [data-haz='der']", { autoAlpha: 0, duration: 0.05, ease: "power2.in" }, 0.906)
        // El titular sale antes de que el blanco lo alcance.
        .to("[data-esc='cierre']", { autoAlpha: 0, duration: 0.035, ease: "none" }, 0.958)
        // ── La luz que CRECE es la del propio faro ──────────────────────
        // No se agregan luces nuevas: se escala el halo y el núcleo que la
        // linterna ya tiene. Están dibujados en el SVG, en la punta exacta,
        // así que nacen del lugar correcto por construcción — con capas
        // aparte había que adivinar la posición (y quedaban como manchas
        // sueltas al costado del faro, además de sumar luces que no existen).
        // svgOrigin en el foco: crecen desde la lámpara, no desde su centro.
        .to(
          "[data-halo]",
          { scale: 46, duration: 0.088, ease: "power2.in", svgOrigin: ORIGEN_FOCO },
          0.912,
        )
        .to(
          "[data-nucleo]",
          { scale: 30, duration: 0.084, ease: "power2.in", svgOrigin: ORIGEN_FOCO },
          0.916,
        )
        // El mar del frente SE QUEMA con la luz: está DELANTE del faro
        // (Z 300 contra 620), así que el halo crece por detrás y quedaría
        // recortado sobre el blanco. Sobreexponerlo es lo que pasa de verdad
        // cuando una fuente inunda el cuadro.
        // (El muelle y el foreground ya no existen — ver FaroEscena.)
        .to(
          "[data-capa='marMedio']",
          { autoAlpha: 0, duration: 0.072, ease: "power2.in" },
          0.924,
        );

      // Sin círculo de flash aparte: ESE era la "segunda esfera" que
      // aparecía corrida a la izquierda del faro. Estaba anclado a una
      // posición medida una sola vez (onStart) mientras la cámara seguía
      // moviendo la escena, así que se despegaba de la linterna. El halo y
      // el núcleo, al vivir dentro del SVG, viajan con la cámara y no
      // pueden despegarse: encandilan solos.
      tl.set({}, {}, 1);

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
      ref={rootRef}
      className="relative z-10 lg:-mt-[100svh] lg:motion-reduce:mt-0"
      aria-label="Qué hace Empoderamiento Docente"
    >
      {/* El runway solo existe donde corre la coreografía: en mobile o con
          reduced-motion colapsa a una pantalla (nada de scroll muerto). */}
      <div ref={altoRef} className="relative h-svh lg:h-[820vh] lg:motion-reduce:h-svh">
        <div
          data-escenario
          // Sin fondo propio: lo pone el envoltorio compartido con el hero
          // (ver app/que-hacemos/page.tsx). El cielo es uno solo para las dos
          // secciones, así no hay junta posible.
          className="sticky top-0 isolate h-svh overflow-hidden"
        >
          <FaroEscena />

          {/* El titular real de la página, siempre perceptible para AT: la
              versión visual de abajo entra y sale con la coreografía. */}
          <h1 className="sr-only">
            Diseñamos y acompañamos procesos que transforman la matemática
            escolar.
          </h1>

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
              <div data-mensaje>
                <Eyebrow variant="light">Qué hacemos</Eyebrow>
                <p
                  className="font-display mt-7 max-w-[19ch] font-extrabold tracking-[-0.03em] text-white [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:100%_0.14em] [&_mark]:no-underline"
                  style={{ fontSize: "clamp(2.6rem, 1.2rem + 3.9vw, 4.6rem)", lineHeight: 1.06 }}
                >
                  Diseñamos y acompañamos <Highlight>procesos</Highlight> que
                  transforman la matemática escolar.
                </p>
              </div>
            </div>
          </div>

          {/* S2 · Caption del método (eyebrow real de MetodoPasos) */}
          <div data-esc="cap2" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 pt-32" style={{ opacity: 0 }}>
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              <Eyebrow variant="light">Antes de proponer nada</Eyebrow>
            </div>
          </div>

          {/* S2 · Los cinco verbos: un golpe narrativo por momento */}
          {PREGUNTAS.map((pregunta, i) => (
            <div
              key={pregunta}
              data-verbo-txt={i}
              aria-hidden="true"
              className="pointer-events-none absolute max-w-[26rem]"
              style={VERBO_POS[i]}
            >
              <p
                data-v
                className="font-display font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.6rem, 1rem + 1.6vw, 2.4rem)", lineHeight: 1.18, opacity: 0 }}
              >
                {pregunta}
              </p>
            </div>
          ))}

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
