"use client";

import { Fragment, useRef, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitChars } from "@/components/ui/SplitChars";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { acoplarLamina } from "./acople-lamina";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Origen, sentido y evolución" (sección 2 del sitemap de Qué es ED).
 * Lámina NAVY inmersiva que se ACOPLA sobre el hero (transición de sección:
 * sube con escala + esquinas redondeadas) y se CLAVA (sticky). Adentro, una
 * historia en 5 BEATS conducida 100% por el scroll (scrub — ida y vuelta):
 *
 *  0. "No nacimos de una teoría." — el pilar se ARMA mientras la lámina se
 *     acopla sobre el hero (regla que se dibuja + escalonado de etiqueta,
 *     título y cuerpo) y, al avanzar, las LETRAS ESTALLAN y se dispersan
 *     (cada char vuela con rotación propia).
 *  1. El punto de inflexión: la CITA de la profesora se LEVANTA EN 3D (flip
 *     desde el plano) y sus líneas suben por máscara.
 *  2. "¿Cómo fue tomando forma ED?" — se TIPEA carácter por carácter con el
 *     scroll (retroceder la des-tipea), con caret latiendo.
 *  3. Qué es ED: «Una convicción convertida en investigación y acción.» — el
 *     titular ES la definición (sin párrafo de apoyo); después la trayectoria
 *     se dibuja sola (línea SVG por dash-offset) y sus 5 hitos se activan al
 *     llegar el trazo: Maestría → Doctorado → México → Argentina → Hoy. En
 *     mobile la cronología es vertical (la línea crece hacia abajo).
 *  4. Remate: «Vivir para hacer vivir» — las palabras convergen desde el blur.
 *
 * Los beats 0–2 son los TRES PILARES (01 Origen · 02 Sentido · 03 Evolución)
 * y comparten una única cáscara (`Pilar`): misma grilla, misma jerarquía y
 * cajas de altura reservada. Al cruzarse cambia el contenido, nunca la
 * posición: la regla verde, la etiqueta, el título y el cuerpo caen siempre
 * en la misma línea.
 *
 * Además: TILT 3D del panel siguiendo el mouse e indicador de progreso de 5
 * puntos (cápsula naranja = beat activo, mismo idioma que el home).
 *
 * PANEL DE FOTOS (beats 0–2, solo desktop + motion): lámina redondeada en la
 * columna 2 de la misma grilla que el texto, con una foto real por beat. Se cruzan dentro de la
 * máscara (fade + blur + leve desplazamiento) en sincronía con el texto, con
 * deriva vertical continua (profundidad). Una muesca navy en el borde
 * izquierdo recorre el panel con el scroll (referencia editorial). El panel
 * despega antes del beat 3 para devolverle todo el ancho a la constelación.
 *
 * Contenido basado en los videos del cliente (resumen videos.txt §1–3). La
 * redacción exacta de la cita es una dramatización del testimonio del video 2
 * — VALIDAR con el cliente antes de publicar.
 * Reduced-motion / sin JS: los beats quedan apilados en flow, legibles.
 */

const HITOS = [
  { t: "Maestría", d: "El comienzo: observar y comprender lo que ocurría con las y los docentes." },
  { t: "Doctorado", d: "Explicaciones propias y años de investigación e intervención." },
  { t: "México", d: "Parte de procesos de desarrollo profesional docente a nivel nacional." },
  { t: "Argentina", d: "La expansión regional, sosteniendo la misma filosofía de trabajo." },
  { t: "Hoy", d: "Una línea de investigación viva y una consultora que impulsa transformación educativa." },
] as const;

// Coordenadas de los hitos sobre el viewBox 1000×220 (misma curva del path).
const NODOS = [
  { x: 60, y: 150 },
  { x: 280, y: 90 },
  { x: 500, y: 140 },
  { x: 720, y: 80 },
  { x: 940, y: 120 },
] as const;

const PATH_D =
  "M 60 150 C 133 150 207 90 280 90 C 353 90 427 140 500 140 C 573 140 647 80 720 80 C 793 80 867 120 940 120";

const PREGUNTA = "¿Cómo fue tomando forma ED?";

/**
 * Los tres pilares del relato (beats 0–2). Numerados como en «Nuestra
 * mirada»: el sitio ya usa «01 — Etiqueta» para secuencias conceptuales.
 */
const PILARES = [
  { n: "01", label: "Origen" },
  { n: "02", label: "Sentido" },
  { n: "03", label: "Evolución" },
] as const;

/**
 * GRILLA COMPARTIDA. La columna de texto y la lámina de fotos nacen del
 * MISMO contenedor que el resto del sitio (`max-w-screen-xl` + `px-5/px-10`,
 * igual que DistintoEd, RedEd o el footer): el borde izquierdo del texto cae
 * en la misma línea que los títulos de las otras secciones y el borde derecho
 * de la foto cierra sobre el mismo margen. 7fr/6fr da a la lectura algo más
 * de aire que a la imagen sin romper el equilibrio de la doble página.
 */
const GRILLA =
  "mx-auto max-w-screen-xl px-5 md:grid md:grid-cols-[7fr_6fr] md:gap-x-10 md:px-10 lg:gap-x-14";

/**
 * Tipografía de los tres pilares: un solo tamaño para los tres títulos y un
 * solo tamaño para los tres cuerpos. El título RESERVA 3 líneas (`min-height`
 * = 3 × line-height): así el cuerpo arranca siempre a la misma altura y, al
 * cruzarse los beats, lo único que cambia es el contenido — no la caja.
 */
// El tope de 3.2vw / 2.7rem está calibrado sobre la línea más larga de la
// cita ("Estaba a punto de jubilarme." ≈ 13.1em): entra en una sola línea en
// toda la escala md+ con ~6% de aire. Si la cita cambia, revisar este número.
const PILAR_TITULO =
  "font-display mt-5 font-bold tracking-[-0.02em] text-white [font-size:clamp(1.6rem,6vw,2.4rem)] [line-height:1.12] md:mt-6 md:[font-size:clamp(1.4rem,3.2vw,2.7rem)] md:[min-height:3.36em]";

// La reserva del cuerpo es de 4 líneas en tablet y 3 en desktop: a 768px la
// columna se angosta y el párrafo más largo (03) necesita la cuarta. Si se
// quedara en 3, ese beat desbordaría la caja y correría el bloque entero
// ~14px respecto de los otros dos (el bloque va centrado).
const PILAR_CUERPO =
  "text-azul-claro/85 mx-auto mt-6 max-w-[46ch] font-sans text-[1rem] leading-[1.65] md:mx-0 md:mt-7 md:text-[1.06rem] md:[min-height:6.6em] lg:[min-height:4.95em]";

// Fotos del recorrido (una por beat 0–2). Viven en el panel derecho tipo
// "dock" y se cruzan en sincronía con el cambio de texto. En mobile y con
// reduced-motion el panel no se muestra (la experiencia actual se preserva).
const FOTOS = [
  {
    src: "/quienes-somos/origen-01-aulas.webp",
    alt: "Trabajo con estudiantes en el patio de una escuela",
  },
  {
    src: "/quienes-somos/origen-02-inflexion.webp",
    alt: "Encuentro de formación docente frente a la pizarra",
  },
  {
    src: "/quienes-somos/origen-03-pregunta.webp",
    alt: "Exposición ante la comunidad educativa en un auditorio",
  },
] as const;

/**
 * Cáscara común de los pilares 01–03. Los tres beats comparten grilla,
 * anclaje vertical y jerarquía (regla verde → etiqueta numerada → título →
 * cuerpo); solo cambian el título y el cuerpo que reciben. Que la estructura
 * viva en un único componente es lo que garantiza que no se desfasen.
 */
function Pilar({
  i,
  titulo,
  cuerpo,
}: {
  i: 0 | 1 | 2;
  titulo: ReactNode;
  cuerpo: ReactNode;
}) {
  const { n, label } = PILARES[i];
  return (
    <div
      data-beat={i}
      className={`flex h-full items-center motion-reduce:h-auto motion-reduce:py-24 ${GRILLA}`}
    >
      <div className="text-center md:text-left">
        <span
          data-pilar-rule
          aria-hidden="true"
          className="bg-verde-concepto mx-auto mb-4 block h-[3px] w-8 rounded-full md:mx-0"
        />
        <span
          data-pilar-eyebrow
          className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase"
        >
          {n} — {label}
        </span>
        {titulo}
        {cuerpo}
      </div>
    </div>
  );
}

/** El remate, palabra por palabra: la primera y la última van en verde. */
const PALABRAS_REMATE = ["Vivir", "para", "hacer", "vivir."] as const;

export function OrigenEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone || reduced) return;

    let raf = 0;
    let removeMove: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
      const tilt = root.querySelector<HTMLElement>("[data-story-tilt]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]");
      if (beats.length !== 5 || !tilt) return;

      // ── Acople de la lámina sobre el hero (transición de sección) ────────
      // Origen arriba: la lámina se ancla por el borde que toca el hero y crece
      // hacia abajo, y así deja asomar su cabecera en el hero (el "peek" que
      // invita a scrollear). Detalle del porqué en acople-lamina.
      acoplarLamina(root, { escala: 0.955, y: 44, fin: "top 12%", origen: "50% 0%" });

      // ── Capas: pasan a superponerse (en flow quedan apiladas sin motion) ─
      gsap.set(beats, { position: "absolute", inset: 0 });
      gsap.set(beats.slice(1), { autoAlpha: 0 });

      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      // Scope a root: sin él, toArray barre todo el documento y cualquier
      // data-attr homónimo de otra sección se colaría en silencio.
      const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

      const chars0 = qa("[data-beat='0'] [data-char]");
      const quoteCard = q("[data-quote-card]");
      const quoteLines = qa("[data-quote-line]");
      const quoteMark = q("[data-quote-mark]");
      const quoteSub = q("[data-quote-sub]");
      const typeChars = qa("[data-type] [data-char]");
      const sub2 = q("[data-beat='2'] [data-sub]");
      const path = root.querySelector<SVGPathElement>("[data-const-path]");
      const nodos = gsap.utils.toArray<SVGCircleElement>("[data-const-node]");
      const labels = qa("[data-const-label]");
      const finWords = qa("[data-fin-word]");
      const finRule = q("[data-fin-rule]");
      const finSub = q("[data-fin-sub]");
      const constTitle = q("[data-const-title]");
      const constvLine = q("[data-constv-line]");
      const constvNodes = qa("[data-constv-node]");
      const constvCopies = qa("[data-constv-copy]");
      const panel = q("[data-photo-panel]");
      const lamina = q("[data-photo-lamina]");
      const photoFrames = qa("[data-photo]");
      const photoImgs = qa("[data-photo-img]");
      const notchRail = q("[data-notch-rail]");

      // Estados iniciales de piezas internas (solo con motion)
      if (quoteCard) {
        gsap.set(quoteCard, {
          rotateX: -72,
          y: 80,
          autoAlpha: 0,
          transformPerspective: 1000,
          transformOrigin: "center bottom",
        });
      }
      gsap.set(quoteLines, { yPercent: 115 });
      // La comilla y la atribución viven FUERA de las máscaras: sin esto
      // aparecerían antes que la cita (la tarjeta que las contenía ya no
      // está) y se leería la firma antes que la frase.
      if (quoteMark) gsap.set(quoteMark, { autoAlpha: 0 });
      if (quoteSub) gsap.set(quoteSub, { autoAlpha: 0, y: 16 });
      gsap.set(typeChars, { opacity: 0.13 });
      if (sub2) gsap.set(sub2, { autoAlpha: 0, y: 18 });
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      }
      nodos.forEach((n) => gsap.set(n, { attr: { r: 0 } }));
      // Hitos futuros: presentes como expectativa (tenues), no invisibles.
      gsap.set(labels, { autoAlpha: 0.16, y: 14 });
      gsap.set(finWords, { autoAlpha: 0, scale: 1.7, filter: "blur(10px)" });
      if (finRule) gsap.set(finRule, { scaleX: 0 });
      if (finSub) gsap.set(finSub, { autoAlpha: 0, y: 18 });

      // ── Panel de fotos: se acopla a la derecha junto con la lámina ──────
      // La ENTRADA anima el wrapper externo (panel) y la SALIDA —dentro del
      // timeline maestro— anima la lámina interna (lamina). Cada ScrollTrigger
      // es dueño exclusivo de su elemento: no dependemos del orden de render
      // de GSAP cuando ambos escriben las mismas propiedades.
      if (panel) {
        gsap.set(photoFrames.slice(1), { autoAlpha: 0 });
        if (notchRail) gsap.set(notchRail, { yPercent: 8 });
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 170, x: 46, rotate: 1.4 },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            rotate: 0,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top 82%", end: "top top", scrub: true },
          },
        );
      }

      // ── ENTRADA DEL BEAT 0 ───────────────────────────────────────────────
      // Los beats 1–4 entran con el timeline maestro; el 0 es el estado
      // inicial de la sección y quedaba clavado. Ahora se ARMA mientras la
      // lámina se acopla sobre el hero: la regla se dibuja y regla, etiqueta,
      // título y cuerpo suben escalonados. Termina bastante antes de "top
      // top" (donde arranca la historia), así el pilar ya está montado cuando
      // empieza el pin y el estallido de letras no lo pisa.
      //
      // No toca los [data-char] —el estallido es dueño de ellos—: anima el h2
      // como caja. Y arranca en "top 72%", no antes: la sección ASOMA sobre
      // el hero desde scroll 0 (el "peek"), y con un start más temprano el
      // texto ya habría entrado sin que nadie lo viera.
      const introRule = q("[data-beat='0'] [data-pilar-rule]");
      const introBits = [
        q("[data-beat='0'] [data-pilar-eyebrow]"),
        q("[data-beat='0'] h2"),
        q("[data-beat='0'] p"),
      ].filter((el): el is HTMLElement => Boolean(el));
      const introST = { trigger: root, start: "top 72%", end: "top 25%", scrub: true };
      if (introRule) {
        gsap.fromTo(
          introRule,
          { scaleX: 0 },
          { scaleX: 1, ease: "power2.out", duration: 0.6, scrollTrigger: introST },
        );
      }
      if (introBits.length) {
        gsap.fromTo(
          introBits,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: 0.22,
            ease: "power3.out",
            scrollTrigger: introST,
          },
        );
      }

      // ── Indicador de 5 puntos (definido ANTES del timeline: su onUpdate
      //    puede dispararse apenas se crea el ScrollTrigger) ─────────────────
      let lastIdx = -1;
      const setDot = (p: number) => {
        // umbrales = inicio de cada beat sobre la duración total (11.5)
        const bounds = [0.13, 0.35, 0.57, 0.85];
        let idx = 0;
        for (let i = 0; i < bounds.length; i++) if (p >= bounds[i]) idx = i + 1;
        if (idx === lastIdx) return;
        lastIdx = idx;
        dots.forEach((d, i) => {
          gsap.to(d, {
            width: i === idx ? 26 : 8,
            backgroundColor: i === idx ? "#e07a2f" : "rgba(255,255,255,0.25)",
            duration: 0.35,
            ease: "power2.out",
          });
        });
      };

      // ── Timeline maestro (≈11.5 unidades repartidas en toda la zona) ─────
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => setDot(self.progress),
        },
      });

      // BEAT 0 → estallido de letras
      chars0.forEach((c, i) => {
        tl.to(
          c,
          {
            x: Math.sin(i * 3.7) * 190,
            y: -70 - ((i * 37) % 110),
            rotation: Math.sin(i * 1.3) * 55,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.in",
          },
          0.6 + (i % 7) * 0.05,
        );
      });
      tl.to(beats[0], { autoAlpha: 0, duration: 0.4 }, 1.3);

      // BEAT 1 — la cita (tarjeta 3D)
      tl.to(beats[1], { autoAlpha: 1, duration: 0.3 }, 1.5)
        .to(quoteCard, { rotateX: 0, y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 1.6)
        .to(quoteLines, { yPercent: 0, duration: 0.6, stagger: 0.14, ease: "power3.out" }, 2.1);
      if (quoteMark) tl.to(quoteMark, { autoAlpha: 1, duration: 0.35 }, 2.15);
      if (quoteSub) tl.to(quoteSub, { autoAlpha: 1, y: 0, duration: 0.45 }, 2.8);
      tl.to(beats[1], { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.6 }, 3.6);

      // BEAT 2 — la pregunta se tipea con el scroll
      tl.to(beats[2], { autoAlpha: 1, duration: 0.3 }, 4.0)
        .to(typeChars, { opacity: 1, duration: 0.02, stagger: 0.055, ease: "none" }, 4.2);
      if (sub2) tl.to(sub2, { autoAlpha: 1, y: 0, duration: 0.5 }, 5.6);
      tl.to(beats[2], { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.6 }, 6.2);

      // BEAT 3 — qué es ED (definición institucional)
      // Secuencia: título grande → la línea se dibuja y cada hito se activa
      // cuando el trazo llega a su posición. Todo scrubbed: avanza y retrocede
      // con el usuario, sin estados one-shot.
      tl.to(beats[3], { autoAlpha: 1, duration: 0.3 }, 6.55);
      if (constTitle) {
        tl.fromTo(
          constTitle,
          { autoAlpha: 0, y: 26, filter: "blur(6px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
          6.6,
        );
      }
      // Trazo: horizontal (desktop) y vertical (mobile) comparten timing.
      const DRAW_AT = 7.1;
      const DRAW_DUR = 2.05;
      if (path) tl.to(path, { strokeDashoffset: 0, duration: DRAW_DUR, ease: "none" }, DRAW_AT);
      if (constvLine) {
        tl.fromTo(
          constvLine,
          { scaleY: 0 },
          { scaleY: 1, duration: DRAW_DUR, ease: "none" },
          DRAW_AT,
        );
      }
      nodos.forEach((n, i) => {
        const at = DRAW_AT + (i / (nodos.length - 1)) * (DRAW_DUR - 0.2);
        tl.to(n, { attr: { r: 8 }, duration: 0.25, ease: "back.out(3)" }, at);
        if (labels[i]) tl.to(labels[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.08);
      });
      constvNodes.forEach((n, i) => {
        const at = DRAW_AT + (i / Math.max(constvNodes.length - 1, 1)) * (DRAW_DUR - 0.2);
        // Futuros tenues y chicos (expectativa) → activos plenos al llegar.
        tl.fromTo(
          n,
          { scale: 0.35, autoAlpha: 0.35 },
          { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(3)" },
          at,
        );
        if (constvCopies[i]) {
          tl.fromTo(
            constvCopies[i],
            { autoAlpha: 0.16, x: -10 },
            { autoAlpha: 1, x: 0, duration: 0.35 },
            at + 0.08,
          );
        }
      });
      tl.to(beats[3], { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.5 }, 9.45);

      // BEAT 4 — «Vivir para hacer vivir» (corrido +0.25: el beat 3 ahora
      // respira al completarse; el respiro final del pin no cambia)
      tl.to(beats[4], { autoAlpha: 1, duration: 0.3 }, 9.75);
      tl.to(
        finWords,
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.55, stagger: 0.16, ease: "power3.out" },
        9.85,
      );
      if (finRule) tl.to(finRule, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 10.4);
      if (finSub) tl.to(finSub, { autoAlpha: 1, y: 0, duration: 0.5 }, 10.55);
      tl.to({}, { duration: 0.6 }, 10.9); // respiro final antes de soltar el pin
      setDot(0);

      // ── PANEL DE FOTOS (beats 0–2) ───────────────────────────────────────
      // Las fotos se revelan DENTRO de la máscara (fade + blur + leve
      // desplazamiento), en sincronía con las transiciones de texto. La
      // muesca del borde izquierdo recorre el panel con el progreso de la
      // historia. El panel despega antes de la constelación (beat 3).
      if (panel && photoFrames.length === 3) {
        const SWAPS = [
          { out: 0, entra: 1, at: 1.35 }, // con la transición beat 0 → 1
          { out: 1, entra: 2, at: 3.65 }, // con la transición beat 1 → 2
        ] as const;
        SWAPS.forEach(({ out, entra, at }) => {
          tl.to(
            photoFrames[out],
            {
              autoAlpha: 0,
              yPercent: -6,
              scale: 1.04,
              filter: "blur(9px)",
              duration: 0.5,
              ease: "power2.in",
            },
            at,
          ).fromTo(
            photoFrames[entra],
            { autoAlpha: 0, yPercent: 8, scale: 1.06, filter: "blur(9px)" },
            {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power3.out",
            },
            at + 0.18,
          );
        });
        // Deriva vertical continua de la foto activa (profundidad sutil).
        // Cada deriva arranca cuando su frame empieza a entrar (at + 0.18).
        tl.fromTo(photoImgs[0], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 1.85 }, 0);
        tl.fromTo(photoImgs[1], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 2.3 }, 1.53);
        tl.fromTo(photoImgs[2], { yPercent: 2.6 }, { yPercent: -2.6, ease: "none", duration: 2.4 }, 3.83);
        // Muesca deslizante (guiño editorial de la referencia). El rail mide
        // la altura del panel, así que yPercent 8→74 = top 8%→74% pero por
        // transform (composited): sin reflow por frame y a prueba de resize.
        if (notchRail) {
          tl.fromTo(notchRail, { yPercent: 8 }, { yPercent: 74, ease: "none", duration: 5.3 }, 0.7);
        }
        // Salida del panel antes del beat 3 (la constelación usa todo el
        // ancho). Anima la lámina interna: la entrada es dueña del wrapper
        // externo y acá nadie pisa propiedades de nadie.
        if (lamina) {
          tl.to(lamina, { autoAlpha: 0, x: 80, y: 46, scale: 0.965, duration: 0.55, ease: "power2.in" }, 6.05);
        }
      }

      // ── TILT 3D del panel con el mouse (suave, solo pointer fino) ────────
      if (window.matchMedia("(pointer: fine)").matches) {
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        const onMove = (e: MouseEvent) => {
          tx = (e.clientX / window.innerWidth) * 2 - 1;
          ty = (e.clientY / window.innerHeight) * 2 - 1;
        };
        const loop = () => {
          cx += (tx - cx) * 0.06;
          cy += (ty - cy) * 0.06;
          gsap.set(tilt, { rotateY: cx * 1.8, rotateX: -cy * 1.4, transformPerspective: 1100 });
          raf = requestAnimationFrame(loop);
        };
        window.addEventListener("mousemove", onMove);
        raf = requestAnimationFrame(loop);
        removeMove = () => window.removeEventListener("mousemove", onMove);
      }
    }, root);

    return () => {
      cancelAnimationFrame(raf);
      removeMove?.();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="origen"
      data-indice="Origen"
      className="bg-azul-principal relative z-20 -mt-[5svh] overflow-clip rounded-t-[2.5rem] text-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.45)]"
      aria-label="Origen, sentido y evolución"
    >
      {/* Textura de puntos blanca muy sutil (motivo de marca sobre navy) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:24px_24px]"
      />
      {/* Glow verde de fondo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[8%] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(31_154_120/0.14)_0%,transparent_65%)]"
      />

      <div ref={zoneRef} className="relative h-[560svh] motion-reduce:h-auto">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto">
          <div
            data-story-tilt
            className="relative h-full w-full will-change-transform [transform-style:preserve-3d] motion-reduce:h-auto"
          >
            {/* ── Panel de fotos (beats 0–2): lámina acoplada a la derecha.
                Vive en la MISMA grilla que la columna de texto (columna 2),
                así su borde derecho cierra sobre el margen del sitio. Las
                fotos se revelan dentro de la máscara y la muesca del borde
                izquierdo viaja con el scroll (reinterpretación sobria de la
                referencia editorial). Solo desktop + motion. ── */}
            <div
              data-photo-panel
              className="absolute inset-0 z-0 hidden will-change-transform md:block motion-reduce:hidden"
            >
              <div className={`h-full ${GRILLA}`}>
                <div className="col-start-2 mt-[13svh] h-[74svh]">
                  <div
                    data-photo-lamina
                    className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-white/[0.04] shadow-[0_60px_140px_-50px_rgb(0_0_0/0.7)] will-change-transform"
                  >
                    {FOTOS.map((f, i) => (
                      <div
                        key={f.src}
                        data-photo={i}
                        className={`absolute inset-0 will-change-transform ${i === 0 ? "" : "opacity-0"}`}
                      >
                        {/* Bleed del 7% para la deriva vertical sin descubrir bordes */}
                        <div data-photo-img className="absolute -inset-[7%]">
                          <Image
                            src={f.src}
                            alt={f.alt}
                            fill
                            sizes="(max-width: 767px) 1px, (min-width: 1280px) 560px, 44vw"
                            className="object-cover"
                          />
                        </div>
                        {/* Velos navy: integran la foto al sistema visual de la lámina */}
                        <div
                          aria-hidden="true"
                          className="bg-azul-principal/25 absolute inset-0 mix-blend-multiply"
                        />
                        <div
                          aria-hidden="true"
                          className="from-azul-principal/30 absolute inset-0 bg-gradient-to-r via-transparent to-transparent"
                        />
                        <div
                          aria-hidden="true"
                          className="from-azul-principal/55 absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t to-transparent"
                        />
                      </div>
                    ))}
                    {/* Muesca deslizante del borde izquierdo (chaflán suave).
                        Filo de luz + tick naranja para que se lea sobre la
                        foto (navy puro desaparecía contra los velos). El rail
                        mide la altura del panel: GSAP lo desliza con yPercent
                        (transform composited, sin reflow) y el % sigue al
                        panel en resize. */}
                    <div
                      data-notch-rail
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-px z-10 w-[22px] will-change-transform"
                    >
                      <svg
                        viewBox="0 0 18 144"
                        preserveAspectRatio="none"
                        className="text-azul-principal absolute top-0 left-0 h-36 w-[22px]"
                      >
                        <path
                          d="M0 0 C 0 14, 13 18, 13 34 L 13 110 C 13 126, 0 130, 0 144 Z"
                          fill="currentColor"
                        />
                        <path
                          d="M0 0 C 0 14, 13 18, 13 34 L 13 110 C 13 126, 0 130, 0 144"
                          fill="none"
                          stroke="rgb(255 255 255 / 0.16)"
                          strokeWidth="1.25"
                        />
                        <rect
                          x="4"
                          y="56"
                          width="3"
                          height="32"
                          rx="1.5"
                          fill="var(--color-naranja-accion)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BEAT 0 · 01 Origen ──────────────────────────────────────── */}
            <Pilar
              i={0}
              titulo={
                <h2 className={`${PILAR_TITULO} mx-auto md:mx-0 md:max-w-[13ch]`}>
                  <SplitChars text="No nacimos de una teoría." />
                </h2>
              }
              cuerpo={
                <p className={PILAR_CUERPO}>
                  Nacimos en aulas reales, discutiendo la matemática a fondo con
                  docentes de distintos estados de México.
                </p>
              }
            />

            {/* ── BEAT 1 · 02 Sentido — la cita de la profesora ─────────────
                Misma caja tipográfica que los otros dos pilares: la cita ES el
                título del beat (no una tarjeta aparte). La comilla cuelga en el
                margen para que las tres líneas alineen su filo izquierdo con
                los títulos vecinos. Dramatización del testimonio (video 2) —
                validar con cliente. ── */}
            <Pilar
              i={1}
              titulo={
                <blockquote
                  data-quote-card
                  className={`${PILAR_TITULO} relative will-change-transform`}
                >
                  {/* Comilla: marca centrada sobre la cita en mobile y volada
                      al margen en desktop, para que las tres líneas alineen
                      su filo izquierdo con los títulos de los otros pilares. */}
                  <span
                    data-quote-mark
                    aria-hidden="true"
                    className="text-verde-concepto block [font-size:1.7em] [line-height:0.72] md:absolute md:top-[0.04em] md:right-full md:mr-[0.1em] md:[font-size:1em] md:[line-height:1]"
                  >
                    “
                  </span>
                  <span className="block overflow-hidden">
                    <span data-quote-line className="block">
                      Estaba a punto de jubilarme.
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span data-quote-line className="block">
                      Ahora quiero volver:
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span data-quote-line className="text-verde-concepto block">
                      quiero transformar el aula.
                    </span>
                  </span>
                </blockquote>
              }
              cuerpo={
                <p data-quote-sub className={PILAR_CUERPO}>
                  — Una profesora, al cerrar uno de los primeros encuentros de
                  formación docente en México.
                </p>
              }
            />

            {/* ── BEAT 2 · 03 Evolución (typewriter por scroll) ───────────── */}
            <Pilar
              i={2}
              titulo={
                <h3
                  data-type
                  className={`${PILAR_TITULO} mx-auto md:mx-0 md:max-w-[15ch]`}
                >
                  <SplitChars text={PREGUNTA} />
                  <span
                    data-caret
                    aria-hidden="true"
                    className="bg-verde-concepto ml-2 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] animate-pulse rounded-full"
                  />
                </h3>
              }
              cuerpo={
                <p data-sub className={PILAR_CUERPO}>
                  Esa convicción se volvió maestría, doctorado e investigación, y
                  después procesos de desarrollo profesional en México y
                  Argentina.
                </p>
              }
            />

            {/* ── BEAT 3: qué es ED (definición institucional) ────────────────
                Título grande (≈70% del titular de apertura) y la trayectoria
                con protagonismo: la definición la da el titular, sin párrafo
                de apoyo. Desktop: recorrido horizontal. Mobile: cronología
                vertical. ── */}
            <div
              data-beat="3"
              className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24"
            >
              <span className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
                Qué es Empoderamiento Docente
              </span>
              <h3
                data-const-title
                className="font-display mt-5 max-w-[26ch] text-balance font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.7rem, 1rem + 2vw, 2.75rem)", lineHeight: 1.12 }}
              >
                Una convicción convertida en{" "}
                <span className="text-verde-concepto">investigación y acción</span>.
              </h3>

              {/* Recorrido horizontal (desktop). El aire que dejó el párrafo
                  de apoyo se conserva acá: el bloque va centrado, así que sin
                  este margen el titular caía ~38px al sacarlo. Con él, titular
                  y trayectoria quedan donde estaban. */}
              <div className="relative mt-28 hidden w-full max-w-6xl md:mt-32 md:block">
                <svg viewBox="0 0 1000 220" className="h-auto w-full" aria-hidden="true">
                  <path
                    d={PATH_D}
                    fill="none"
                    stroke="rgba(169,197,232,0.25)"
                    strokeWidth="2"
                    strokeDasharray="3 7"
                  />
                  <path
                    data-const-path
                    d={PATH_D}
                    fill="none"
                    stroke="#1f9a78"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {NODOS.map((n, i) => (
                    <Fragment key={i}>
                      <circle cx={n.x} cy={n.y} r="13" fill="rgba(31,154,120,0.15)" />
                      <circle
                        data-const-node
                        cx={n.x}
                        cy={n.y}
                        r="8"
                        fill={i === NODOS.length - 1 ? "#e07a2f" : "#1f9a78"}
                        className="origin-center [transform-box:fill-box]"
                      />
                    </Fragment>
                  ))}
                </svg>
                {/* Etiquetas HTML sobre la misma grilla del viewBox. El <li>
                    EXTERNO posiciona (transform estático); el interno anima
                    (así GSAP no pisa el offset de posicionamiento). */}
                <ol className="absolute inset-0 m-0 list-none p-0">
                  {HITOS.map((h, i) => (
                    <li
                      key={h.t}
                      className="absolute w-44 md:w-52"
                      style={{
                        left: `${(NODOS[i].x / 1000) * 100}%`,
                        top: `${(NODOS[i].y / 220) * 100}%`,
                        // Los hitos extremos se descentran para no cortarse
                        // contra los bordes del viewport (Maestría / Hoy).
                        transform: `translate(${
                          i === 0 ? "-28%" : i === HITOS.length - 1 ? "-72%" : "-50%"
                        }, ${i % 2 === 0 ? "20px" : "calc(-100% - 20px)"})`,
                      }}
                    >
                      <div data-const-label>
                        <p className="font-display text-[1.02rem] font-bold text-white md:text-[1.12rem]">
                          {h.t}
                        </p>
                        <p className="text-azul-claro/80 mt-1 font-sans text-[0.85rem] leading-snug">
                          {h.d}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Cronología vertical (mobile): misma historia, recorrido de
                  arriba hacia abajo. La línea verde crece con el scroll. */}
              <div className="relative mt-16 w-full max-w-[26rem] text-left md:hidden">
                <span
                  aria-hidden="true"
                  className="bg-azul-claro/20 absolute top-1 bottom-1 left-[7px] w-[2px] rounded-full"
                />
                <span
                  data-constv-line
                  aria-hidden="true"
                  className="bg-verde-concepto absolute top-1 bottom-1 left-[7px] w-[2px] origin-top rounded-full"
                />
                <ol className="m-0 list-none p-0">
                  {HITOS.map((h, i) => (
                    <li key={h.t} className="relative flex gap-4 pb-6 last:pb-0">
                      <span
                        data-constv-node
                        aria-hidden="true"
                        className={`mt-[3px] block h-4 w-4 shrink-0 rounded-full ${
                          i === HITOS.length - 1 ? "bg-naranja-accion" : "bg-verde-concepto"
                        }`}
                      />
                      <div data-constv-copy>
                        <p className="font-display text-[1.02rem] font-bold text-white">
                          {h.t}
                        </p>
                        <p className="text-azul-claro/80 mt-0.5 font-sans text-[0.84rem] leading-snug">
                          {h.d}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ── BEAT 4: «Vivir para hacer vivir» ────────────────────────── */}
            <div
              data-beat="4"
              className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24"
            >
              <h3
                className="font-display font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.6rem, 1rem + 5.6vw, 5.4rem)", lineHeight: 1.05 }}
              >
                {PALABRAS_REMATE.map((w, i) => (
                  <Fragment key={w}>
                    <span
                      data-fin-word
                      className={`inline-block will-change-transform ${
                        i === 0 || i === 3 ? "text-verde-concepto" : "text-white"
                      }`}
                    >
                      {w}
                    </span>
                    {i < 3 ? " " : null}
                  </Fragment>
                ))}
              </h3>
              <span
                data-fin-rule
                aria-hidden="true"
                className="bg-verde-concepto mt-8 block h-[2px] w-24 origin-center rounded-full"
              />
              <p
                data-fin-sub
                className="text-azul-claro/85 mt-7 max-w-[50ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.15rem]"
              >
                Para transformar el aprendizaje, el cuerpo docente necesita
                primero vivir una nueva relación con la matemática.
              </p>
            </div>

            {/* Indicador de progreso de la historia (5 beats) */}
            <div
              className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5 motion-reduce:hidden"
              aria-hidden="true"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} data-story-dot className="h-2 w-2 rounded-full bg-white/25" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
