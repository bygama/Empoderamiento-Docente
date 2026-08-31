"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { contactoSchema } from "@/features/contacto/schema";
import Image from "next/image";
import gsap from "gsap";
import { MathField } from "@/components/ui/MathField";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Lightbulb,
  School,
  TrendingUp,
  Compass,
} from "@/components/ui/icons";
import { PaisDropdown } from "./PaisDropdown";
import { siteConfig } from "@/config/site";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Contacto como EXPERIENCIA DE UNA SOLA PANTALLA: acá no se scrollea, se
 * TRANSFORMA. Los estados viven apilados en el mismo viewport y morfean uno
 * en otro, en cadena y de ida:
 *
 *  0 · HERO — "Hablemos." gigante y EDITORIAL (izquierda, ancho total, en el
 *      lenguaje del hero de Qué es ED). La palabra sola: nada de eyebrow,
 *      bajada, botón ni hint. NO es una pantalla que haya que descartar: no
 *      pide ningún gesto, dura ~1,4s y se desarma SOLA. Antes era un peaje
 *      (scroll o "Empezar" para pasar) que cobraba un gesto y no entregaba
 *      nada nuevo — el titular repetía lo que decía la pantalla siguiente.
 *
 *      Tampoco hay ya piezas flotantes con contenido institucional que VOLABAN
 *      y se convertían en las tarjetas de tema: era un truco lindo pero
 *      mentiroso — "Presencia · Chile, México…" no se transforma en "Formación
 *      y acompañamiento", es otro contenido disfrazado de la misma materia. Y
 *      cinco cajas iguales alrededor de una palabra son un tablero de
 *      post-its, no una composición. Quedan solo las tarjetas que son.
 *  1 · APERTURA — el desarme: "Hablemos." NO se dispersa: VIAJA. Se achica
 *      hasta su lugar definitivo como titular del selector, y las tarjetas de
 *      tema entran en cascada a su alrededor. Por eso hay un solo titular
 *      acomodándose y no dos diciendo lo mismo — la palabra es la semilla del
 *      layout, no un cartel previo.
 *  2 · FORMULARIO — al elegir tema, el índice se disuelve y el formulario
 *      entra en cascada; el rail navy (ícono + título del tema) aparece de una,
 *      sin vuelo. "Cambiar tema" vuelve al selector sin perder lo tipeado.
 *  3 · CIERRE — al enviar: «Cada propuesta empieza con una conversación.»
 *
 * Lo secundario del sitemap (mail directo + sumarse al equipo) ya no vive en
 * una barra fija aparte: acompaña al contenido de cada estado (línea al pie
 * del índice en la apertura; fila al pie del contenedor en el formulario).
 *
 * Durante la intro el scroll queda quieto (los ghosts son position:fixed y un
 * scroll a mitad de vuelo los despega de su destino), pero NO con
 * `body.overflow = hidden`: eso saca la barra, ensancha el viewport y hace
 * saltar todo el contenido centrado al soltarlo. Lo frenan los handlers en
 * captura. Y si alguien no la quiere mirar, el gesto la SALTEA (saltarIntro)
 * en vez de quedar tragado — la intro se muestra, no se impone.
 *
 * Envío sin backend todavía: arma un mailto: con asunto y cuerpo precargados.
 * Cuando se integre Supabase se reemplaza por un insert (confirmar schema
 * antes — AGENTS.md §12).
 *
 * Reduced-motion: se entra directo al selector, sin intro ni vuelos. El fondo
 * de nodos (MathField) queda vivo detrás siempre.
 */

const TEMAS = [
  {
    key: "formacion",
    titulo: "Formación y acompañamiento",
    detalle: "Trayectos, asesorías y trabajo con escuelas.",
    Icon: Users,
  },
  {
    key: "investigacion",
    titulo: "Investigación",
    detalle: "Líneas de estudio y colaboración académica.",
    Icon: Lightbulb,
  },
  {
    key: "alianzas",
    titulo: "Alianzas institucionales",
    detalle: "Convenios con organizaciones y gobiernos.",
    Icon: School,
  },
  {
    key: "prensa",
    titulo: "Prensa y difusión",
    detalle: "Entrevistas, notas y comunicación.",
    Icon: TrendingUp,
  },
  {
    key: "otra",
    titulo: "Otra consulta",
    detalle: "Todo lo que no entra en las anteriores.",
    Icon: Compass,
  },
] as const;

type TemaKey = (typeof TEMAS)[number]["key"];
type Vista = "hero" | "apertura" | "formulario" | "cierre";

// "Del otro lado hay personas": caras REALES del equipo (mismas fotos que la
// página de equipo), no un claim abstracto. Cuatro alcanzan para la fila de
// avatares del cartel; el resto lo dice el "+8".
const EQUIPO_FOTOS = [
  "/equipo/gabriela-buendia.jpg",
  "/equipo/ivan-perez.jpg",
  "/equipo/daniela-reyes.jpg",
  "/equipo/karla-gomez.jpg",
];
const EQUIPO_RESTO = 8;

// Grid de puntos del manual (DESIGN.md §6) para superficies navy: EXACTAMENTE
// la misma textura que la banda de stats de la home (DatosDuros), para que el
// navy del contacto sea el mismo navy y no un primo.
const DOTS_NAVY =
  "opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]";

// Un solo titular para toda la experiencia: nace gigante en el hero y aterriza
// como encabezado del selector. No hay un segundo titular.
const TITULO = "Hablemos.";

export function ContactoExperiencia() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [vista, setVista] = useState<Vista>("hero");
  const [tema, setTema] = useState<TemaKey | null>(null);
  const [introListo, setIntroListo] = useState(false);
  // Estado del envio del formulario. "error" deja el formulario en
  // pantalla con el mensaje puesto, en vez de mandar a la persona a la
  // pantalla de cierre a festejar algo que no pasó.
  const [envio, setEnvio] = useState<"quieto" | "enviando" | "error">("quieto");
  const [errorEnvio, setErrorEnvio] = useState("");
  const animando = useRef(false);
  const introVivo = useRef(true);
  const introTl = useRef<gsap.core.Timeline | null>(null);
  const desarmeTl = useRef<gsap.core.Timeline | null>(null);
  const ghosts = useRef<HTMLElement[]>([]);

  const temaActivo = TEMAS.find((t) => t.key === tema);
  const temaIdx = Math.max(0, TEMAS.findIndex((t) => t.key === tema));
  // Ícono del tema elegido: aterriza en la baldosa del rail (destino del vuelo).
  const ChipIcon = temaActivo?.Icon;
  // Segunda puerta del contacto: sumarse al equipo. Sin upload (todavía no hay
  // backend), el mailto precarga asunto y un cuerpo-plantilla que recuerda
  // adjuntar el CV.
  const mailtoCV = `mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent(
    "[CV] Quiero sumarme al equipo",
  )}&body=${encodeURIComponent(
    "Hola, me gustaría sumarme a Empoderamiento Docente.\n\n(Acordate de adjuntar tu CV.)\n\nNombre:\nÁrea (docencia / investigación / otra):\nPor qué me interesa:\n",
  )}`;

  const panel = (v: Vista) =>
    rootRef.current?.querySelector<HTMLElement>(`[data-panel="${v}"]`) ?? null;

  // Los ghosts viven en <body> (position:fixed), fuera del ctx de GSAP: si la
  // intro se saltea o el componente se desmonta a mitad de vuelo, nadie más
  // los saca.
  const limpiarGhosts = () => {
    ghosts.current.forEach((g) => g.remove());
    ghosts.current = [];
  };

  // Fin de la intro (por completarse o por salteo): se sueltan los listeners
  // que retenían el scroll. NO se toca `body.overflow` ni se fuerza el top —
  // ver el porqué en el efecto de entrada.
  const finIntro = () => {
    introVivo.current = false;
    animando.current = false;
    limpiarGhosts();
    setIntroListo(true);
  };

  // ── HERO → APERTURA: el desarme (viaje de ida) ──────────────────────────
  const desarmar = () => {
    if (animando.current) return;
    const root = rootRef.current;
    if (!root) return;
    setVista("apertura");

    if (reduced) {
      gsap.set(panel("hero"), { autoAlpha: 0 });
      gsap.set(panel("apertura"), { autoAlpha: 1 });
      finIntro();
      return;
    }

    animando.current = true;
    const cards = gsap.utils.toArray<HTMLElement>("[data-tema-card]");
    const head = gsap.utils.toArray<HTMLElement>("[data-ap-head]");

    // preparar la apertura: visible como capa pero con TODO oculto, para que
    // el desarme la vaya encendiendo por partes
    gsap.set(panel("apertura"), { autoAlpha: 1 });
    gsap.set(cards, { autoAlpha: 0 });
    gsap.set(head, { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(panel("hero"), { autoAlpha: 0 });
        finIntro();
      },
    });
    desarmeTl.current = tl;

    // ── "Hablemos." VIAJA (no se dispersa) ────────────────────────────────
    // Es el mismo titular: se achica y se acomoda arriba del selector. El
    // ghost se anima por SCALE (no por font-size, que es layout) desde el
    // tamaño del hero hasta el del encabezado; con la misma familia, peso,
    // tracking y line-height en los dos, la razón de font-size alcanza para
    // que el ghost calce clavado sobre ambos.
    const srcTit = root.querySelector<HTMLElement>("[data-hero-titulo]");
    const dstTit = root.querySelector<HTMLElement>("[data-ap-titulo]");
    const h2 = root.querySelector<HTMLElement>("[data-ap-h2]");

    if (srcTit && dstTit && h2) {
      const s = srcTit.getBoundingClientRect();
      const d = dstTit.getBoundingClientRect();
      const cs = getComputedStyle(dstTit);
      const fsSrc = parseFloat(getComputedStyle(srcTit).fontSize);
      const fsDst = parseFloat(cs.fontSize);
      const ratio = fsDst > 0 ? fsSrc / fsDst : 1;

      const gt = document.createElement("div");
      gt.textContent = TITULO;
      gt.setAttribute("aria-hidden", "true");
      Object.assign(gt.style, {
        position: "fixed",
        left: `${d.left}px`,
        top: `${d.top}px`,
        margin: "0",
        whiteSpace: "nowrap",
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: `${fsDst}px`,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        zIndex: "46",
        pointerEvents: "none",
        transformOrigin: "left top",
      } as unknown as CSSStyleDeclaration);
      document.body.appendChild(gt);
      ghosts.current.push(gt);

      gsap.set(h2, { autoAlpha: 0 });
      tl.set(srcTit, { autoAlpha: 0 }, 0)
        .fromTo(
          gt,
          { x: s.left - d.left, y: s.top - d.top, scale: ratio },
          { x: 0, y: 0, scale: 1, duration: 0.8 },
          0,
        )
        .set(h2, { autoAlpha: 1 }, 0.78)
        .to(gt, { autoAlpha: 0, duration: 0.12, onComplete: () => gt.remove() }, 0.78);
    } else {
      // sin medida (titular no montado): corte simple, sin viaje
      tl.to(srcTit, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
    }

    // las filas del índice entran en cascada mientras el titular todavía
    // viaja: el layout se arma ALREDEDOR de la palabra que se acomoda. Slide
    // editorial (sin bounce): son renglones de un índice, no fichas.
    tl.fromTo(
      cards,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 },
      0.35,
    );

    // eyebrow y bajada
    tl.fromTo(
      head,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 },
      0.5,
    );
  };

  // ── Saltear la intro ────────────────────────────────────────────────────
  // El gesto de scroll ya NO paga un peaje (la intro se desarma sola): saltea.
  // Se lo traga en captura para que no le llegue a Lenis — si no, acumula el
  // impulso y arrastra la página en pleno vuelo, con los ghosts fixed clavados
  // en su destino viejo.
  const saltarIntro = () => {
    if (!introVivo.current) return;
    introTl.current?.kill();
    desarmeTl.current?.kill();
    setVista("apertura");

    gsap.set(panel("hero"), { autoAlpha: 0 });
    gsap.set(panel("apertura"), { autoAlpha: 1 });
    gsap.set("[data-ap-h2]", { autoAlpha: 1 });
    gsap.set("[data-ap-head]", { autoAlpha: 1, y: 0 });
    gsap.set("[data-tema-card]", { autoAlpha: 1, x: 0, y: 0, scale: 1 });
    finIntro();
  };

  // ── Entrada inicial: el hero se arma y se desarma SOLO ──────────────────
  // Sin piezas, el hero es solo la palabra: las letras suben y listo. Se fueron
  // con ellas la deriva perpetua y el parallax de mouse, que no tenían a quién
  // moverle nada.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // estado base: solo el hero visible
      gsap.set('[data-panel="apertura"]', { autoAlpha: 0 });
      gsap.set('[data-panel="formulario"]', { autoAlpha: 0 });
      gsap.set('[data-panel="cierre"]', { autoAlpha: 0 });
      if (reduced) return;

      const chars = gsap.utils.toArray<HTMLElement>("[data-hero-char]");

      const tl = gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } });
      introTl.current = tl;
      tl.fromTo(
        chars,
        { autoAlpha: 0, yPercent: 105, rotateX: -70, transformOrigin: "50% 100%", transformPerspective: 600 },
        { autoAlpha: 1, yPercent: 0, rotateX: 0, duration: 0.7, ease: "back.out(1.5)", stagger: 0.04 },
        0,
      )
        // …y acá está el punto: NADIE tiene que hacer nada. La intro no pide un
        // gesto para pagar el peaje — se desarma sola apenas terminó de armarse
        // y de darse un beat para leerse.
        .call(() => desarmar(), undefined, 1.2);
    }, root);

    // sin intro: se entra directo al selector, ya armado
    if (reduced) desarmar();

    // NADA de `body.overflow = "hidden"` para quieto el scroll durante la
    // intro: al soltarlo reaparece la barra, el viewport se ensancha y TODO el
    // contenido centrado pega un salto de media barra (~7px) justo cuando
    // termina la intro. La barra se queda siempre; al scroll lo frenan los
    // handlers en captura de abajo, que además saltean la intro.
    return () => {
      ctx.revert();
      limpiarGhosts();
    };
  }, [reduced]);

  // Mientras la intro corre, cualquier intento de scroll la saltea. Estos
  // handlers son los que reemplazan al lock: en captura, el evento se consume
  // ANTES de llegarle a Lenis (si no, acumula el impulso y arrastra la página
  // en pleno vuelo, con los ghosts fixed clavados en su destino viejo).
  //
  // El `scroll` va aparte y sin preventDefault (no es cancelable): es la red
  // para lo que wheel/touch no cubren — arrastrar la barra, autoscroll del
  // botón del medio. Ahí no se puede evitar el desplazamiento, así que la
  // intro se saltea y el usuario sigue scrolleando, que es lo que pidió.
  //
  // Apenas termina (introListo) los listeners se van y el scroll vuelve a ser
  // scroll: el peaje no se reemplaza por otro peaje.
  useEffect(() => {
    if (reduced || introListo) return;
    const saltar = (e: Event) => {
      if (!introVivo.current) return;
      e.preventDefault();
      e.stopPropagation();
      saltarIntro();
    };
    const onScroll = () => {
      if (introVivo.current) saltarIntro();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!introVivo.current) return;
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault();
        saltarIntro();
      }
    };
    window.addEventListener("wheel", saltar, { capture: true, passive: false });
    window.addEventListener("touchmove", saltar, { capture: true, passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", saltar, { capture: true });
      window.removeEventListener("touchmove", saltar, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, introListo]);

  // ── APERTURA → FORMULARIO: crossfade limpio (sin vuelo) ─────────────────
  // El índice se disuelve y el formulario entra en cascada. El rail — con su
  // ícono y su título del tema — aparece de una, sin que nada vuele: un ícono
  // chico cruzando la pantalla se leía como adorno, y el título ya no viajaba.
  const elegirTema = (key: TemaKey, cardEl: HTMLElement) => {
    if (animando.current) return;
    setTema(key);
    setVista("formulario");

    if (reduced) {
      gsap.set(panel("apertura"), { autoAlpha: 0 });
      gsap.set(panel("formulario"), { autoAlpha: 1 });
      return;
    }

    animando.current = true;

    // esperar el re-render para que el rail ya tenga el tema elegido
    requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) {
        gsap.set(panel("apertura"), { autoAlpha: 0 });
        gsap.set(panel("formulario"), { autoAlpha: 1 });
        animando.current = false;
        return;
      }

      const otras = gsap.utils.toArray<HTMLElement>("[data-tema-card]").filter((c) => c !== cardEl);
      const campos = gsap.utils.toArray<HTMLElement>("[data-campo]");

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          animando.current = false;
          root.querySelector<HTMLInputElement>("#ct-nombre")?.focus({ preventScroll: true });
        },
      });

      tl.set(cardEl, { autoAlpha: 0 }, 0)
        // Los campos se apagan YA, en el instante 0. Sin esto el formulario
        // aparecía entero y de golpe sobre el índice todavía visible, y recién
        // a 0.34 se apagaba para volver a entrar en cascada: un doble destello.
        // El `fromTo` de abajo NO alcanza — su estado "from" recién se aplica
        // cuando el tween arranca (0.34), así que entre 0.26 y 0.34 los campos
        // seguían en autoAlpha 1.
        .set(campos, { autoAlpha: 0 }, 0)
        // El índice se va MÁS RÁPIDO que antes (0.4 → 0.28/0.26). Con la salida
        // larga, el formulario empezaba a encenderse a 0.26 mientras el índice
        // todavía estaba a media opacidad: las dos pantallas convivían ~0.14s y
        // se veía el solapamiento. Ahora la izquierda ya está prácticamente
        // afuera cuando la superficie del formulario recién arranca su fade.
        .to(otras, { autoAlpha: 0, y: 10, duration: 0.28, stagger: 0.02 }, 0)
        .to("[data-ap-head], [data-ap-h2]", { autoAlpha: 0, y: -16, duration: 0.26 }, 0)
        .set(panel("apertura"), { autoAlpha: 0 }, 0.36)
        // La superficie del formulario (el panel blanco de campos) entra con un
        // fade, no con un `set` duro: apareciendo de golpe encima del índice se
        // veía como una caja blanca cayendo sobre la pantalla anterior.
        .fromTo(
          panel("formulario"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          0.3,
        )
        .fromTo(
          campos,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 },
          0.36,
        );
    });
  };

  // ── FORMULARIO → APERTURA (cambiar de tema, sin perder lo tipeado) ──────
  // La vuelta es el ESPEJO EXACTO de la ida, no otra animación que casualmente
  // va para el otro lado. Antes no lo era y se notaba en tres cosas:
  //
  //  · No solapaba. La cadena `.to().set().fromTo()` apagaba el formulario
  //    ENTERO (0,35s) y recién después encendía la apertura: en el medio había
  //    un frame con la pantalla vacía. La ida sí solapa (el formulario entra a
  //    0,28 mientras el índice todavía se está yendo hasta 0,42), así que la
  //    vuelta enciende la apertura a 0,26 — antes de que el formulario termine
  //    de irse. Por eso ahora todo va en posiciones ABSOLUTAS y no encadenado.
  //
  //  · El formulario se iba como una sola masa (autoAlpha del panel) cuando en
  //    la ida los campos entran uno por uno. Ahora salen escalonados y hacia
  //    abajo: deshacen literalmente el gesto con el que entraron (y: 18 → 0).
  //
  //  · Duraba ~1,3s contra los ~1,08s de la ida. Ahora las dos miden ~1,02s.
  //
  // Los `y` de origen son los mismos a los que cada pieza se fue en la ida
  // (head arriba, tarjetas abajo): cada cosa vuelve por donde salió.
  const cambiarTema = () => {
    if (animando.current) return;
    const root = rootRef.current;
    setVista("apertura");

    // El foco vuelve a la tarjeta del tema que estaba elegido: el botón que se
    // apretó ("Volver a los temas") desaparece con el formulario, y sin esto el
    // foco se cae al <body> — quien navega por teclado queda en la nada y tiene
    // que tabular desde el principio. Vale para los dos caminos, con animación
    // y sin ella.
    const volverElFoco = () =>
      root
        ?.querySelectorAll<HTMLButtonElement>("[data-tema-card]")
        [temaIdx]?.focus({ preventScroll: true });

    if (reduced) {
      gsap.set(panel("formulario"), { autoAlpha: 0 });
      gsap.set(panel("apertura"), { autoAlpha: 1 });
      volverElFoco();
      return;
    }

    animando.current = true;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        animando.current = false;
        volverElFoco();
      },
    });

    tl.to(
      "[data-campo]",
      { autoAlpha: 0, y: 12, duration: 0.24, stagger: 0.02, ease: "power2.in" },
      0,
    )
      // La superficie del formulario (el panel blanco de campos) NO es un
      // [data-campo] — el rail navy sí lo es, pero la caja blanca es el
      // contenedor. Si se la apagara con un `set` duro, la superficie se
      // cortaría de golpe mientras sus campos todavía se están yendo. Por eso
      // se va con un tween propio, que arranca cuando los primeros campos ya
      // se disolvieron.
      .to(panel("formulario"), { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, 0.12)
      // El solape: la apertura ya está encendida mientras el formulario termina
      // de irse. Acá es donde antes había un frame en blanco.
      .set(panel("apertura"), { autoAlpha: 1 }, 0.2)
      // Las DOS columnas ATERRIZAN JUNTAS. Antes la izquierda (rayita,
      // "Hablemos.", frase y foto) cerraba a 0.75 y el índice de la derecha
      // recién a 1.04: casi 300ms de diferencia, que es lo que se veía como
      // "la izquierda rápido y la derecha lenta".
      //
      // No alcanza con darles el mismo arranque y la misma duración: la
      // izquierda entra SIN stagger (todas sus piezas caen a la vez) mientras
      // las tarjetas escalonan, así que la izquierda cerraría primero. Por eso
      // su duración es más larga que la de una tarjeta suelta (0.43 vs 0.35):
      // el excedente es justo el stagger acumulado del índice.
      //
      // Toda la vuelta se acortó de ~0.85 a ~0.67 (los temas aparecen antes y
      // más rápido), moviendo el conjunto en bloque para no romper ese
      // aterrizaje simultáneo.
      .fromTo(
        "[data-ap-head], [data-ap-h2]",
        { autoAlpha: 0, y: -16 },
        { autoAlpha: 1, y: 0, duration: 0.43 },
        0.24,
      )
      .fromTo(
        "[data-tema-card]",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02 },
        0.24,
      );
  };

  // ── FORMULARIO → CIERRE ─────────────────────────────────────────────────
  //
  // Manda la consulta al endpoint y recién si sale bien pasa a la pantalla
  // de cierre. Antes esto abría un `mailto:` y daba por enviada la consulta
  // sin saber nada: si la persona no tenía cliente de correo configurado
  // —el caso normal en celular— el mensaje no llegaba nunca y ella se iba
  // convencida de que sí. Ahora la confirmación significa que llegó.
  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (envio === "enviando") return;

    const data = new FormData(e.currentTarget);
    const consulta = {
      nombre: String(data.get("nombre") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      institucion: String(data.get("institucion") ?? "").trim(),
      pais: String(data.get("pais") ?? "").trim(),
      mensaje: String(data.get("mensaje") ?? "").trim(),
      tema: temaActivo?.titulo ?? "",
      website: String(data.get("website") ?? ""),
    };

    // Chequeo de este lado con el mismo schema que usa el endpoint: evita
    // el viaje de ida y vuelta cuando el error se ve a simple vista.
    const revisado = contactoSchema.safeParse(consulta);
    if (!revisado.success) {
      setErrorEnvio(revisado.error.issues[0]?.message ?? "Revisá los datos del formulario.");
      setEnvio("error");
      return;
    }

    setEnvio("enviando");
    setErrorEnvio("");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(revisado.data),
      });

      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        setErrorEnvio(
          cuerpo?.error ?? "No pudimos enviar tu consulta. Probá de nuevo en un momento.",
        );
        setEnvio("error");
        return;
      }
    } catch {
      // Se cayó la conexión o el endpoint no respondió.
      setErrorEnvio("No pudimos enviar tu consulta. Revisá tu conexión y probá de nuevo.");
      setEnvio("error");
      return;
    }

    setEnvio("quieto");
    irAlCierre();
  };

  // La animación de salida del formulario, separada del envío para que el
  // camino de error pueda dejar todo como está.
  const irAlCierre = () => {
    setVista("cierre");
    if (reduced) {
      gsap.set(panel("formulario"), { autoAlpha: 0 });
      gsap.set(panel("cierre"), { autoAlpha: 1 });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to("[data-campo]", { autoAlpha: 0, y: -12, duration: 0.3, stagger: 0.03, ease: "power2.in" })
      .to(panel("formulario"), { autoAlpha: 0, duration: 0.25 }, "-=0.1")
      .set(panel("cierre"), { autoAlpha: 1 })
      .fromTo("[data-fin-rule]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" })
      .fromTo(
        "[data-fin-bit]",
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 },
        "-=0.35",
      );
  };

  // ── CIERRE → APERTURA (otra consulta) ───────────────────────────────────
  const otraConsulta = () => {
    setVista("apertura");
    if (reduced) {
      gsap.set(panel("cierre"), { autoAlpha: 0 });
      gsap.set(panel("apertura"), { autoAlpha: 1 });
      return;
    }
    // Mismo desfasaje que tenía "Volver a los temas", en el camino hermano que
    // llega a la MISMA pantalla: la columna izquierda cerraba a 0.8 y el índice
    // de la derecha recién a 1.25. Se sincroniza igual — mismo arranque, misma
    // duración, stagger corto — para que volver al índice se sienta igual venga
    // de donde venga.
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(panel("cierre"), { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, 0)
      .set(panel("apertura"), { autoAlpha: 1 }, 0.2)
      .fromTo(
        "[data-ap-head], [data-ap-h2]",
        { autoAlpha: 0, y: -16 },
        { autoAlpha: 1, y: 0, duration: 0.43 },
        0.24,
      )
      .fromTo(
        "[data-tema-card]",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02 },
        0.24,
      );
  };

  // Campos de superficie suave: caja redondeada con relleno navy tenue y borde
  // hairline (recesados sobre el panel claro). El foco la vuelve blanca, borde
  // verde y un ring verde suave por box-shadow (no mueve layout) + caret verde.
  // Label mono arriba. El dropdown de País (PaisDropdown) comparte esta misma
  // caja para que el conjunto lea como un solo sistema.
  const inputBase =
    "w-full rounded-xl border border-azul-claro/60 bg-azul-principal/[0.03] px-3.5 py-2.5 font-sans text-[1rem] text-azul-principal caret-verde-concepto placeholder:text-gris-texto/45 transition-[border-color,background-color,box-shadow] hover:border-azul-claro focus:border-verde-concepto focus:bg-white focus:shadow-[0_0_0_3px_rgb(31_154_120/0.14)] focus:outline-none";
  const labelBase =
    "text-gris-texto mb-1.5 block font-mono text-[0.66rem] font-medium tracking-[0.14em] uppercase";

  return (
    <section
      ref={rootRef}
      className="bg-grain-light relative isolate h-[100svh] overflow-hidden bg-gradient-to-b from-white via-white to-gris-fondo/50"
      aria-label="Contacto"
    >
      {/* Fondo de nodos vivo durante toda la experiencia */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <MathField className="h-full w-full" />
      </div>

      {/* ── Escenario: los cuatro estados apilados ────────────────────────── */}
      <div className="relative z-10 mx-auto h-full w-full max-w-screen-xl px-5 md:px-10">
        {/* 0 · HERO */}
        <div
          data-panel="hero"
          aria-hidden={vista !== "hero"}
          inert={vista !== "hero"}
          className="absolute inset-x-5 top-0 bottom-0 md:inset-x-10"
        >
          {/* Titular editorial: izquierda y a ancho total, en el lenguaje del
              hero de Qué es ED. Nada más: sin eyebrow, sin bajada, sin botón,
              sin hint de scroll y sin piezas flotando alrededor. Solo la
              palabra — no hay nada que decidir todavía. */}
          <div className="flex h-full flex-col justify-center">
            <h1
              className="font-display text-azul-principal font-extrabold tracking-[-0.03em]"
              style={{ fontSize: "clamp(3.4rem, 1rem + 10vw, 9rem)", lineHeight: 0.95 }}
            >
              <span className="sr-only">{TITULO}</span>
              <span data-hero-titulo aria-hidden="true" className="inline-block whitespace-nowrap">
                {TITULO.split("").map((c, i) => (
                  <span key={i} data-hero-char className="inline-block opacity-0 will-change-transform">
                    {c}
                  </span>
                ))}
              </span>
            </h1>
          </div>
        </div>

        {/* 1 · APERTURA */}
        {/* my-auto (y no justify-center en el padre): con 5 tarjetas apiladas
            el contenido no entra en mobile, y justify-center lo recorta de los
            DOS lados — el titular se iba arriba del navbar y las tarjetas se
            metían abajo de la barra. Así se centra si entra, y si no entra
            arranca del tope y se scrollea. Mismo patrón que el formulario.
            overflow-x-hidden porque overflow-y solo ya hace que overflow-x
            compute a `auto`: en reposo no desborda nada, pero el back.out con
            que entran las tarjetas pasa apenas de scale 1 y eso alcanza para
            que parpadee un scrollbar horizontal en pleno desarme. */}
        <div
          data-panel="apertura"
          aria-hidden={vista !== "apertura"}
          inert={vista !== "apertura"}
          className="absolute inset-x-5 top-0 bottom-0 flex overflow-x-hidden overflow-y-auto pt-24 pb-24 opacity-0 md:inset-x-10 md:pt-28 md:pb-28"
        >
          {/* Composición editorial asimétrica (idioma de la home): columna de
              identidad a la izquierda (titular + equipo real) y el ÍNDICE de
              temas a la derecha — renglones numerados, no un grid de fichas. */}
          <div className="my-auto w-full lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-x-16 xl:gap-x-24">
            <div className="lg:flex lg:h-full lg:flex-col lg:justify-between">
              {/* Bloque superior: rayita + titular + bajada. */}
              <div>
                {/* Kicker: solo la rayita de marca (sin label), pegada al título
                    — mismo idioma editorial que los heros de la home, donde el
                    titular gigante manda solo. Ecoa el rule del cierre. */}
                <div data-ap-head>
                  <span
                    aria-hidden="true"
                    className="bg-verde-concepto block h-[2px] w-12 rounded-full"
                  />
                </div>
                {/* Acá ATERRIZA el titular del hero (destino del viaje). Misma
                    familia, peso, tracking y line-height que el h1: el ghost es
                    un scale exacto entre los dos. */}
                <h2
                  data-ap-h2
                  className="font-display text-azul-principal mt-4 font-extrabold tracking-[-0.03em]"
                  style={{ fontSize: "clamp(2.2rem, 1rem + 4vw, 4.2rem)", lineHeight: 0.95 }}
                >
                  <span className="sr-only">{TITULO}</span>
                  <span data-ap-titulo aria-hidden="true" className="relative inline-block whitespace-nowrap">
                    {TITULO}
                  </span>
                </h2>
              </div>

              {/* Frase-pilar de marca (contenido con sentido) en el medio de la
                  columna: refuerza el porqué del contacto — la comunidad. Copy
                  oficial verbatim (AGENTS.md §5.5). Solo desktop; el
                  justify-between la reparte entre el titular y la foto. */}
              <p
                data-ap-head
                className="font-display text-azul-principal hidden max-w-[26rem] text-[1.4rem] leading-snug font-semibold tracking-[-0.01em] lg:block"
              >
                <span className="text-verde-concepto">Comunidad docente</span> en
                torno a la Matemática Educativa.
              </p>

              {/* Foto real + cartel flotante: el idioma EXACTO de las tarjetas
                  del hero de la home (rounded-2xl + ring + sombra profunda +
                  cartel frosted con título verde) traído al contacto. Es la
                  prueba visual de "del otro lado hay personas": aula real y
                  caras reales del equipo, no un claim tipográfico. Anclada al
                  fondo de la columna (justify-between) para IGUALAR la altura
                  del índice. Solo desktop ancho — en mobile la columna ya va
                  apilada y la foto empujaría el índice fuera del viewport. */}
              <div data-ap-head className="mb-16 hidden w-full max-w-[24rem] lg:block">
                <div className="relative">
                  <div className="relative aspect-[7/5] w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40">
                    <Image
                      src="/metodo/escuchamos.webp"
                      alt="Sesión de trabajo con docentes"
                      fill
                      sizes="(min-width: 1024px) 24rem, 0px"
                      className="object-cover"
                    />
                  </div>
                  <div className="ring-azul-principal/10 absolute -bottom-6 left-4 z-10 flex items-center gap-3 rounded-xl bg-white/85 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 backdrop-blur-md">
                    <div className="flex shrink-0 -space-x-2">
                      {EQUIPO_FOTOS.map((src) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      <span className="bg-azul-principal flex h-8 w-8 items-center justify-center rounded-full border-2 border-white font-mono text-[0.6rem] font-medium text-white">
                        +{EQUIPO_RESTO}
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                        Del otro lado, personas
                      </p>
                      <p className="text-gris-texto mt-0.5 font-sans text-[0.72rem] leading-snug whitespace-nowrap">
                        Investigan y enseñan matemáticas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* En mobile el equipo queda como fila compacta (la foto grande
                  no entra sin desalojar el índice). */}
              <div data-ap-head className="mt-7 flex items-center gap-3 lg:hidden">
                <div className="flex shrink-0 -space-x-2">
                  {EQUIPO_FOTOS.map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <span className="bg-azul-principal flex h-9 w-9 items-center justify-center rounded-full border-2 border-white font-mono text-[0.62rem] font-medium text-white">
                    +{EQUIPO_RESTO}
                  </span>
                </div>
                <p className="text-gris-texto font-sans text-[0.85rem] leading-snug">
                  Del otro lado, personas que investigan y enseñan.
                </p>
              </div>
            </div>

            {/* Índice de temas: cada tema es una TARJETA-BOTÓN. Superficie clara
                con borde en reposo (lee como algo clickeable, no como una lista
                de texto), ícono de marca a la izquierda para identificar el tema
                y una flecha SIEMPRE visible a la derecha que se enciende y
                avanza en hover. */}
            <div className="mt-10 lg:mt-0" role="group" aria-label="Tema de la consulta">
              <div className="flex flex-col gap-2.5">
                {TEMAS.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    data-tema-card
                    onClick={(e) => elegirTema(t.key, e.currentTarget)}
                    className="group border-azul-claro/45 hover:border-verde-concepto/50 focus-visible:outline-verde-concepto flex items-center gap-4 rounded-xl border bg-white/55 px-4 py-3 text-left transition-all duration-300 hover:bg-white hover:shadow-[0_16px_36px_-22px_rgb(31_45_77/0.45)] focus-visible:outline-2 focus-visible:-outline-offset-2 md:gap-5 md:px-5 md:py-3.5"
                  >
                    {/* Baldosa de ícono de marca (identifica el tema). */}
                    <span
                      className="border-azul-claro/50 group-hover:border-verde-concepto/60 group-hover:bg-verde-concepto/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors duration-300"
                      aria-hidden="true"
                    >
                      <t.Icon
                        size={22}
                        className="text-azul-medio group-hover:text-verde-concepto transition-colors duration-300"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-verde-concepto/80 font-mono text-[0.66rem] font-medium tracking-[0.12em] tabular-nums">
                        0{i + 1}
                      </span>
                      <span
                        data-row-titulo
                        className="font-display text-azul-principal block text-[1.15rem] leading-snug font-bold tracking-[-0.01em] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 md:text-[1.3rem]"
                      >
                        {t.titulo}
                      </span>
                      <span className="text-gris-texto mt-0.5 block font-sans text-[0.83rem] leading-relaxed">
                        {t.detalle}
                      </span>
                    </span>
                    {/* Flecha SIEMPRE visible: la señal de que la fila es una
                        acción. Se enciende y avanza en hover. */}
                    <ArrowRight
                      size={20}
                      aria-hidden="true"
                      className="text-azul-medio/45 group-hover:text-verde-concepto shrink-0 transition-all duration-300 group-hover:translate-x-1"
                    />
                  </button>
                ))}
              </div>

              {/* Canal directo (antes en la barra fija): al pie del índice,
                  jerarquía menor. Centrado bajo la columna del índice. */}
              <p data-ap-head className="text-gris-texto mt-5 text-center font-sans text-[0.85rem]">
                ¿Preferís escribir directo?{" "}
                <a
                  href={`mailto:${siteConfig.contacto.email}`}
                  className="text-azul-principal hover:text-verde-concepto font-medium transition-colors"
                >
                  {siteConfig.contacto.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 2 · FORMULARIO */}
        <div
          data-panel="formulario"
          aria-hidden={vista !== "formulario"}
          inert={vista !== "formulario"}
          className="absolute inset-x-5 top-0 bottom-0 flex overflow-y-auto pt-24 pb-24 opacity-0 md:inset-x-10 md:pt-28 md:pb-28"
        >
          {/* my-auto (y no justify-center en el padre): si el contenido no
              entra, se scrollea desde arriba sin que el tope quede recortado
              bajo el navbar */}
          <div className="mx-auto my-auto w-full max-w-5xl">
            {/* Breadcrumb de vuelta, FUERA del contenedor (sobre el borde
                superior): navegación clara para volver a elegir el tema, más
                identificable que el link que vivía dentro del rail. */}
            <button
              type="button"
              data-campo
              onClick={cambiarTema}
              className="group text-gris-texto hover:text-verde-concepto mb-3 inline-flex items-center gap-1.5 font-mono text-[0.7rem] font-medium tracking-[0.14em] uppercase transition-colors"
            >
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="rotate-180 transition-transform group-hover:-translate-x-0.5"
              />
              Volver a los temas
            </button>
            {/* UNA sola pieza: el rail navy y el panel claro de campos son el
                MISMO contenedor (sin gap). El panel claro "sale" del navy: no
                tiene borde a la izquierda (el navy es su borde) y sí en los
                otros tres lados. En mobile la fusión es vertical (navy arriba,
                panel abajo, sin borde superior). */}
            <form
              onSubmit={enviar}
              className="w-full lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch"
            >
            {/* ── Rail navy (idioma de la banda de stats de la home) ─────── */}
            <aside
              data-campo
              className="bg-azul-principal relative flex flex-col overflow-hidden rounded-t-3xl p-6 md:p-8 lg:rounded-l-3xl lg:rounded-tr-none"
            >
              <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${DOTS_NAVY}`} />

              {/* Cabecera del rail: la baldosa de ícono del tema y el número.
                  Entra con la superficie del rail en la cascada del formulario. */}
              <div className="relative flex items-center gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"
                  aria-hidden="true"
                >
                  {ChipIcon && <ChipIcon size={24} className="text-white" />}
                </span>
                <p className="text-verde-concepto font-mono text-[0.7rem] font-medium tracking-[0.18em] uppercase">
                  Tema · 0{temaIdx + 1}
                </p>
              </div>
              {/* Título del tema elegido (aparece con la superficie del rail) */}
              <h2
                className="font-display relative mt-4 text-[1.5rem] leading-tight font-bold tracking-[-0.01em] text-white md:text-[1.75rem]"
              >
                {temaActivo?.titulo ?? "Consulta"}
              </h2>
              <p className="text-azul-claro/80 relative mt-2 font-sans text-[0.9rem] leading-relaxed">
                {temaActivo?.detalle}
              </p>

              {/* Datos institucionales reales anclados al pie del rail: canal
                  directo (mail + copiar) y oficina. Reemplazan al viejo
                  "Santiago · N países", que era relleno. */}
              <div className="relative mt-auto hidden border-t border-white/15 pt-5 lg:block">
                <p className="text-azul-claro/55 font-mono text-[0.6rem] font-medium tracking-[0.2em] uppercase">
                  Escribinos
                </p>
                <a
                  href={`mailto:${siteConfig.contacto.email}`}
                  className="hover:text-verde-concepto mt-1.5 block font-sans text-[0.92rem] font-medium break-words text-white transition-colors"
                >
                  {siteConfig.contacto.email}
                </a>

                <p className="text-azul-claro/55 mt-5 font-mono text-[0.6rem] font-medium tracking-[0.2em] uppercase">
                  Oficina
                </p>
                <address className="text-azul-claro/80 mt-1.5 font-sans text-[0.84rem] leading-relaxed not-italic">
                  {siteConfig.contacto.direccion.calle},{" "}
                  {siteConfig.contacto.direccion.complemento}
                  <br />
                  {siteConfig.contacto.direccion.ciudad},{" "}
                  {siteConfig.contacto.direccion.pais}
                </address>
              </div>
            </aside>

            {/* ── Panel claro de campos: emerge del navy (sin borde izq.) ── */}
            <div className="border-azul-claro/50 grid content-center gap-x-8 gap-y-6 rounded-b-3xl border border-t-0 bg-white/80 p-6 backdrop-blur-sm md:grid-cols-2 md:p-8 lg:rounded-r-3xl lg:rounded-bl-none lg:border-t lg:border-l-0">
              <div data-campo>
                <label htmlFor="ct-nombre" className={labelBase}>
                  Nombre y apellido *
                </label>
                <input id="ct-nombre" name="nombre" required autoComplete="name" className={inputBase} />
              </div>
              <div data-campo>
                <label htmlFor="ct-email" className={labelBase}>
                  Email *
                </label>
                <input id="ct-email" name="email" type="email" required autoComplete="email" className={inputBase} />
              </div>
              <div data-campo>
                <label htmlFor="ct-institucion" className={labelBase}>
                  Institución u organización
                </label>
                <input id="ct-institucion" name="institucion" autoComplete="organization" className={inputBase} />
              </div>
              <div data-campo>
                <label htmlFor="ct-pais" className={labelBase}>
                  País
                </label>
                {/* Dropdown propio (no <select> nativo): comparte la caja de los
                    demás campos y despliega un menú accesible con teclado. */}
                <PaisDropdown id="ct-pais" name="pais" options={[...siteConfig.paises, "Otro"]} />
              </div>
              <div data-campo className="md:col-span-2">
                <label htmlFor="ct-mensaje" className={labelBase}>
                  Mensaje *
                </label>
                <textarea
                  id="ct-mensaje"
                  name="mensaje"
                  required
                  rows={3}
                  placeholder="Contanos qué tenés en mente…"
                  className={`${inputBase} resize-none`}
                />
              </div>

              {/* Trampa para bots: fuera de pantalla y sin foco de teclado, así
                  que ninguna persona lo ve ni lo pisa tabulando. Un bot que
                  completa todos los campos que encuentra cae acá y el endpoint
                  descarta el envío en silencio. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="ct-website">No completar este campo</label>
                <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {/* CTA primaria, centrada al pie del panel. */}
              <div data-campo className="mt-1 flex flex-col items-center gap-3 pt-1 md:col-span-2">
                {/* Espejo de ButtonPrimary como <button> de submit (el componente
                    solo acepta href). Único naranja en pantalla. */}
                <button
                  type="submit"
                  disabled={envio === "enviando"}
                  className="group bg-naranja-accion hover:bg-naranja-accion/90 hover:shadow-naranja-accion/30 focus-visible:outline-naranja-accion inline-flex items-center gap-2 rounded-lg px-6 py-3 font-sans text-[0.95rem] font-medium text-white transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
                >
                  <span>{envio === "enviando" ? "Enviando…" : "Enviar consulta"}</span>
                  {envio !== "enviando" && (
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  )}
                </button>

                {/* Si el envío falla, el formulario se queda donde está con los
                    datos puestos y ofrece la salida por correo: que algo se
                    rompa de nuestro lado no puede dejar a la persona sin manera
                    de escribirnos. */}
                {envio === "error" && (
                  <p
                    role="alert"
                    className="max-w-[46ch] text-center font-sans text-[0.85rem] leading-relaxed text-red-700"
                  >
                    {errorEnvio}{" "}
                    <a
                      href={`mailto:${siteConfig.contacto.email}`}
                      className="text-azul-principal hover:text-verde-concepto font-medium underline underline-offset-2 transition-colors"
                    >
                      O escribinos directo a {siteConfig.contacto.email}
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
            </form>

            {/* Segunda puerta (sumarse al equipo): FUERA del contenedor,
                debajo y CENTRADA bajo la columna de campos — alineada justo
                debajo del botón "Enviar consulta". Reusa la misma grilla
                2fr/3fr del form para caer en el centro de la columna derecha. */}
            <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div data-campo className="flex justify-center lg:col-start-2">
                <a
                  href={mailtoCV}
                  className="group text-gris-texto hover:text-azul-principal inline-flex items-center gap-1.5 font-sans text-[0.85rem] transition-colors"
                >
                  ¿Querés estar de este lado?{" "}
                  <span className="text-azul-principal group-hover:text-verde-concepto font-medium transition-colors">
                    Sumate al equipo
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="text-verde-concepto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3 · CIERRE */}
        <div
          data-panel="cierre"
          aria-hidden={vista !== "cierre"}
          inert={vista !== "cierre"}
          className="absolute inset-x-5 top-0 bottom-0 flex flex-col items-center justify-center text-center opacity-0 md:inset-x-10"
        >
          <span
            data-fin-rule
            aria-hidden="true"
            className="bg-verde-concepto block h-[2px] w-24 origin-center rounded-full"
          />
          {/* Eco del tema elegido: el cierre confirma QUÉ conversación empezó */}
          <p
            data-fin-bit
            className="text-verde-concepto mt-6 font-mono text-[0.7rem] font-medium tracking-[0.18em] uppercase"
          >
            {temaActivo?.titulo ?? "Consulta"}
          </p>
          <p
            data-fin-bit
            className="font-display text-azul-principal mt-4 max-w-[20ch] font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.9rem, 1rem + 3vw, 3.2rem)", lineHeight: 1.12 }}
          >
            Cada propuesta empieza con una conversación.
          </p>
          <p data-fin-bit className="text-gris-texto mt-6 max-w-[52ch] font-sans text-[0.98rem] leading-relaxed">
            Dejamos tu mensaje listo en tu correo: revisalo y envialo cuando
            quieras. ¿No se abrió? Escribinos a{" "}
            <a
              href={`mailto:${siteConfig.contacto.email}`}
              className="text-azul-principal hover:text-verde-concepto font-medium transition-colors"
            >
              {siteConfig.contacto.email}
            </a>
            .
          </p>
          <button
            data-fin-bit
            type="button"
            onClick={otraConsulta}
            className="border-azul-principal/25 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto mt-9 inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-sans text-[0.95rem] font-medium transition-colors"
          >
            Hacer otra consulta
          </button>
        </div>
      </div>

    </section>
  );
}
