"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Nuestra mirada" (sección 3 del sitemap de Quiénes somos) — CONSTELACIÓN.
 *
 * Rediseño inspirado en la lógica espacial de nominal.so ("How it works"),
 * traducida al lenguaje editorial de ED: un mapa conceptual claro con
 * "NUESTRA MIRADA" como núcleo y tres nodos conectados (01 Pensamiento
 * matemático · 02 Empoderamiento desde el saber · 03 Transformación
 * educativa). El scroll conduce una cámara sobria (translate + scale del
 * escenario) que se acerca a cada nodo; su texto se revela en la zona
 * derecha de lectura y desde el nodo emergen FICHAS conceptuales que suben
 * con deriva lateral, sincronizadas con el scrub (reversibles). Al final la
 * cámara regresa al mapa completo, el núcleo se convierte en la SÍNTESIS y
 * las líneas se ramifican en una red incipiente (puntos nuevos) que hace de
 * puente hacia «La red tiene nombres» (ImpulsanEd, intacta).
 *
 * Colores del manual, solo acentos (fondo constante marfil/claro):
 *  01 verde-concepto · 02 azul-medio · 03 naranja-accion en dosis mínimas
 *  (mismo uso decorativo puntual que ya tienen el nodo "Hoy" y las cápsulas
 *  de progreso; el naranja dominante sigue reservado a CTAs).
 *
 * A11y / reduced-motion: la constelación (SVG + nodos visuales) es
 * decorativa (aria-hidden) y se oculta sin motion; el contenido real vive
 * en bloques en orden lógico del DOM que quedan apilados en flow. Las
 * fichas son <li> sin semántica de botón ni cursor pointer.
 *
 * Gate por viewport (`live`): la escena usa geometría proporcional al ancho
 * (zona de lectura en 32vw, carril de fichas en ~32vw, cámara con tx en
 * fracciones de W) pensada para desktop — en móvil/tablet los textos se
 * pisaban y recortaban contra el borde. Bajo 1024px o sin hover se sirve el
 * MISMO layout estático del fallback de reduced-motion, ahora por clases
 * condicionales además de las variantes motion-reduce.
 *
 * El CTA «Mirá cómo lo hacemos» sigue retirado de esta transición (ruta
 * /que-hacemos viva en el nav).
 */

type Perspectiva = {
  id: string;
  accent: string;
  /**
   * Color del texto de la palabra destacada. Nulo = la palabra va en navy
   * con SUBRAYADO decorativo del acento (el naranja no alcanza 3:1 como
   * texto sobre el fondo claro; como regla decorativa no necesita ratio).
   */
  acentoTexto: string | null;
  label: string;
  /** Frase principal; `tachado` es el fragmento que se tacha (si existe). */
  fraseAntes: string;
  tachado?: string;
  frasePunto: string;
  /** Frase afirmativa partida para acentuar `afirmativaAccent`. */
  afirmativaPre: string;
  afirmativaAccent: string;
  afirmativaPost: string;
  fichas: readonly string[];
};

const PERSPECTIVAS: readonly Perspectiva[] = [
  {
    id: "01",
    accent: "#1f9a78", // verde-concepto
    acentoTexto: "#1f9a78",
    label: "Pensamiento matemático",
    fraseAntes: "La matemática no es solo ",
    tachado: "resolver cuentas",
    frasePunto: ".",
    afirmativaPre: "Es una manera de ",
    afirmativaAccent: "pensar, argumentar y actuar",
    afirmativaPost: " en el mundo.",
    fichas: [
      "Construir estrategias",
      "Argumentar",
      "Tomar decisiones",
      "Resolver problemas",
      "Actuar dentro y fuera del aula",
    ],
  },
  {
    id: "02",
    accent: "#4a6fa5", // azul-medio
    // «transformar» conserva el verde ya aprobado en el lenguaje del sitio;
    // el nodo se diferencia del 01 por su acento azul-medio.
    acentoTexto: "#1f9a78",
    label: "Empoderamiento desde el saber",
    fraseAntes: "El poder no es ",
    tachado: "sobre otras personas",
    frasePunto: ".",
    afirmativaPre: "Es poder para ",
    afirmativaAccent: "transformar",
    afirmativaPost: ".",
    fichas: [
      "Saber",
      "Reflexión",
      "Experiencia",
      "Convicción para transformar",
      "Mirada no deficitaria",
    ],
  },
  {
    id: "03",
    accent: "#e07a2f", // naranja-accion (dosis mínima, señal de acento)
    acentoTexto: null, // navy + subrayado naranja (contraste AA garantizado)
    label: "Transformación educativa",
    fraseAntes: "La educación es un derecho",
    frasePunto: ".",
    afirmativaPre: "Transformarla es ",
    afirmativaAccent: "ampliar posibilidades",
    afirmativaPost: ".",
    fichas: [
      "Perspectiva de género",
      "Inclusión",
      "Justicia social",
      "Construcción colectiva del conocimiento",
      "Mirada no deficitaria del profesorado",
    ],
  },
] as const;

/** Posiciones (en % del escenario) de los tres nodos. */
const NODOS = [
  { x: 24, y: 30 },
  { x: 76, y: 36 },
  { x: 40, y: 74 },
] as const;

/**
 * Geometría SVG en viewBox 0 0 160 90 (misma proporción que los desktops
 * objetivo): así el estirado de preserveAspectRatio="none" es casi uniforme
 * y el draw-in por dasharray funciona SIN vector-effect (con non-scaling-
 * stroke, Chromium dashea en espacio de pantalla y el truco de
 * getTotalLength se rompe: las líneas "ocultas" quedaban como guiones).
 * Coordenadas = (x% * 1.6, y% * 0.9) de las posiciones de los nodos.
 */
const LINEAS = [
  "M 80 41.4 Q 57.6 36 38.4 27",
  "M 80 41.4 Q 102.4 38.7 121.6 32.4",
  "M 80 41.4 Q 70.4 55.8 64 66.6",
] as const;

/** Arcos tenues entre nodos (el sistema, siempre insinuado). */
const ARCOS = [
  "M 38.4 27 Q 80 19.8 121.6 32.4",
  "M 121.6 32.4 Q 99.2 54 64 66.6",
  "M 64 66.6 Q 41.6 48.6 38.4 27",
] as const;

/** Ramificaciones finales: de cada nodo nacen conexiones nuevas (fase red). */
const RAMAS = [
  { d: "M 38.4 27 L 22.4 18.9", fin: { x: 22.4, y: 18.9 } },
  { d: "M 38.4 27 L 24 35.1", fin: { x: 24, y: 35.1 } },
  { d: "M 38.4 27 L 49.6 15.3", fin: { x: 49.6, y: 15.3 } },
  { d: "M 121.6 32.4 L 139.2 24.3", fin: { x: 139.2, y: 24.3 } },
  { d: "M 121.6 32.4 L 140.8 40.5", fin: { x: 140.8, y: 40.5 } },
  { d: "M 121.6 32.4 L 112 19.8", fin: { x: 112, y: 19.8 } },
  { d: "M 64 66.6 L 46.4 75.6", fin: { x: 46.4, y: 75.6 } },
  { d: "M 64 66.6 L 81.6 76.5", fin: { x: 81.6, y: 76.5 } },
  { d: "M 64 66.6 L 43.2 61.2", fin: { x: 43.2, y: 61.2 } },
] as const;

/** Zoom de cámara y punto de pantalla donde aterriza cada nodo activo. */
const CAMARA = [
  { scale: 1.5, tx: 0.25, ty: 0.46 },
  { scale: 1.5, tx: 0.23, ty: 0.42 },
  { scale: 1.5, tx: 0.24, ty: 0.46 },
] as const;

export function MiradaEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  // La escena solo con puntero fino y ancho desktop real: a 768 los labels
  // de los nodos ya se montaban sobre la zona de lectura.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone) return;

    // Los tweens del indicador nacen en onUpdate (async): quedan fuera del
    // registro de gsap.context, así que se matan a mano en el cleanup.
    let dotEls: HTMLElement[] = [];

    const ctx = gsap.context(() => {
      // Scope a root: evita colisiones con data-attrs de otras secciones.
      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

      const stage = q("[data-stage]");
      const centro = q("[data-centro]");
      const sintesis = q("[data-sintesis]");
      const puentes = qa("[data-puente]");
      const dots = qa("[data-mirada-dot]");
      dotEls = dots;
      const nodoCores = qa("[data-nodo-core]");
      const nodoHalos = qa("[data-nodo-halo]");
      const nodoNums = qa("[data-nodo-num]");
      const nodoLabels = qa("[data-nodo-label]");
      const detalles = qa("[data-detalle]");
      const strikes = qa("[data-strike]");
      const fichaGrupos = qa("[data-fichas]");
      const lineas = gsap.utils.toArray<SVGPathElement>("[data-linea]", root);
      const arcos = gsap.utils.toArray<SVGPathElement>("[data-arco]", root);
      const ramas = gsap.utils.toArray<SVGPathElement>("[data-rama]", root);
      const ramdots = gsap.utils.toArray<SVGCircleElement>("[data-ramdot]", root);
      if (!stage || !centro || !sintesis || detalles.length !== 3) return;

      // clientWidth (sin scrollbar): la cámara aterriza donde el usuario ve.
      const W = () => document.documentElement.clientWidth;
      const H = () => window.innerHeight;

      // ── Acople de la lámina clara sobre el navy de Origen (se conserva) ──
      // El origin va en un set previo: en un fromTo con scrub GSAP no lo
      // aplica en el frame 0 si viaja solo en el "to" (pitfall documentado
      // en OrigenEd). Sin esto, escalar una sección de 780svh desde el
      // centro abre una banda de fondo crudo sobre el navy anterior.
      gsap.set(root, { transformOrigin: "50% 0%" });
      gsap.fromTo(
        root,
        { scale: 0.97, y: 36 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 96%", end: "top 14%", scrub: true },
        },
      );

      // ── Estados iniciales (solo con motion) ──────────────────────────────
      gsap.set(stage, { transformOrigin: "0 0" });
      gsap.set([centro, sintesis], { position: "absolute", inset: 0 });
      gsap.set(sintesis, { autoAlpha: 0 });
      const fogInit = q("[data-sintesis-fog]");
      if (fogInit) gsap.set(fogInit, { autoAlpha: 0 });
      gsap.set(qa("[data-centro-bit]"), { autoAlpha: 0, y: 22 });
      gsap.set(puentes, { autoAlpha: 0, y: 18 });

      // Detalles: zona de lectura derecha (viewport-anclada, no escala).
      detalles.forEach((d) => {
        gsap.set(d, { position: "absolute", inset: 0, pointerEvents: "none" });
        const inner = d.querySelector<HTMLElement>("[data-detalle-inner]");
        if (inner) {
          gsap.set(inner, {
            position: "absolute",
            left: "auto",
            right: "6vw",
            top: "50%",
            yPercent: -50,
            width: "min(32vw, 26rem)",
            textAlign: "left",
            margin: 0,
            autoAlpha: 0,
          });
        }
      });
      gsap.set(strikes, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(qa("[data-afirma-underline]"), { scaleX: 0, transformOrigin: "left center" });

      // Capas: el sistema (stage) por encima de las fichas —las fichas
      // pasan POR DETRÁS del label del nodo, nunca lo tapan— y las zonas
      // de contenido siempre arriba de todo.
      gsap.set(stage, { zIndex: 10 });
      gsap.set(fichaGrupos, { zIndex: 5 });
      gsap.set([...detalles, centro, sintesis], { zIndex: 20 });

      // Fichas: capas absolutas en el CARRIL central-izquierdo (zona B),
      // entre el nodo activo y la zona de lectura derecha. Un solo carril
      // con desfasajes fijos por índice (nada aleatorio): las variaciones
      // son chicas para que la corriente no se vea rígida, pero nunca tan
      // grandes como para que dos fichas se choquen de costado.
      const LANE_VW = [31, 33.6, 32.2, 34.4, 31.6];
      fichaGrupos.forEach((g) => {
        gsap.set(g, { position: "absolute", inset: 0, pointerEvents: "none" });
        const items = gsap.utils.toArray<HTMLElement>("[data-ficha]", g);
        items.forEach((f, k) => {
          gsap.set(f, {
            position: "absolute",
            left: `${LANE_VW[k] ?? 32}vw`,
            top: 0,
            maxWidth: "11.5rem",
            rotation: k % 2 === 0 ? -0.8 : 1,
            y: H() * 0.86,
            scale: 0.94,
            autoAlpha: 0,
          });
        });
      });
      // RESPIRACIÓN: deriva vertical sutil e infinita de cada capa de fichas,
      // independiente del scrub. Al ritmo real de lectura (una muesca de
      // rueda + pausa) las fichas pasan buena parte del tiempo detenidas;
      // sin esto se sienten "muertas". Anima al grupo padre (no al `y` de
      // cada ficha), así no pelea con la corriente scrubbed.
      fichaGrupos.forEach((g, i) => {
        gsap.fromTo(
          g,
          { y: -5 },
          { y: 5, duration: 3.2 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
      });

      // Nodos: nacen apagados y chicos; líneas sin dibujar; ramas ocultas.
      // El origin va en el centro del PUNTO (7px): al escalar, el punto
      // queda clavado al extremo de su línea y el label crece hacia afuera.
      gsap.set(nodoCores, { autoAlpha: 0, scale: 0.6, transformOrigin: "7px 50%" });
      gsap.set(nodoHalos, { autoAlpha: 0 });
      [...lineas, ...ramas].forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(arcos, { autoAlpha: 0 });
      gsap.set(ramdots, { scale: 0, transformOrigin: "center", autoAlpha: 0 });

      // ── Aire para leer el título del núcleo ──────────────────────────────
      // Las rayas hacia los tres nodos salían encima de la entrada del texto
      // (0.35 contra un título que termina de entrar recién en 0.67): el
      // titular nunca quedaba solo. Todo lo que va DESPUÉS de esa entrada se
      // corre este tanto, y la zona crece en proporción (780 × 14/12 = 910svh)
      // para que el aire sea scroll real y el resto conserve su ritmo.
      //
      // Con 2 unidades el titular queda solo de 0.67 a 2.35 ≈ 97svh de scroll:
      // casi una pantalla entera de rueda antes de que aparezca la primera
      // raya. Subir o bajar SOLO este número (y la altura de la zona, que es
      // 780 × TOTAL/12): fases, umbrales del indicador y ritmo se reacomodan.
      const AIRE_TITULO = 2;
      const TOTAL = 12 + AIRE_TITULO;

      // ── Indicador de progreso (5 momentos, color = principio activo) ─────
      const FASE_COLOR = ["#4a6fa5", "#1f9a78", "#4a6fa5", "#e07a2f", "#1f2d4d"];
      // Umbrales = arranque de cada fase sobre la duración total.
      const BOUNDS = [1.3, 3.45, 5.6, 7.75].map((t) => (t + AIRE_TITULO) / TOTAL);
      let lastIdx = -1;
      const setDot = (p: number) => {
        let idx = 0;
        for (let i = 0; i < BOUNDS.length; i++) if (p >= BOUNDS[i]) idx = i + 1;
        if (idx === lastIdx) return;
        lastIdx = idx;
        dots.forEach((d, i) => {
          gsap.to(d, {
            width: i === idx ? 26 : 8,
            backgroundColor: i === idx ? FASE_COLOR[idx] : "rgba(31,45,77,0.18)",
            duration: 0.35,
            ease: "power2.out",
          });
        });
      };

      // ── Timeline maestro (14 unidades sobre toda la zona) ────────────────
      // scrub NUMÉRICO: cada muesca de rueda avanza el scroll a saltos
      // discretos; con scrub:true la timeline saltaba con él (el "trabado").
      // 1s de catch-up convierte cada muesca en un deslizamiento largo y
      // untuoso sin desconectar del usuario.
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setDot(self.progress),
        },
      });

      // FASE 0 — el mapa se presenta: núcleo, líneas, nodos.
      // Clamp global de fichas al entrar a la zona (misma autocura que el
      // clamp por fase, para el tramo del mapa antes de la fase 1).
      tl.set(qa("[data-ficha]"), { autoAlpha: 0 }, 0.06);
      tl.to(qa("[data-centro-bit]"), { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" }, 0.1);
      lineas.forEach((p, i) => {
        tl.to(
          p,
          { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" },
          0.35 + AIRE_TITULO + i * 0.12,
        );
      });
      tl.to(
        nodoCores,
        { autoAlpha: 0.6, scale: 1, duration: 0.4, stagger: 0.12, ease: "power3.out" },
        0.55 + AIRE_TITULO,
      );
      tl.to(arcos, { autoAlpha: 0.12, duration: 0.35 }, 0.85 + AIRE_TITULO);

      // Núcleo se retira antes del primer acercamiento.
      tl.to(centro, { autoAlpha: 0, duration: 0.28 }, 1.02 + AIRE_TITULO);

      // FASES 1-5 — acercamiento, revelado y salida de cada principio.
      PERSPECTIVAS.forEach((p, i) => {
        const S = 1.3 + AIRE_TITULO + i * 2.15;
        const cam = CAMARA[i];
        const nodo = NODOS[i];

        // Cámara: el nodo activo aterriza en la zona izquierda de lectura.
        tl.to(
          stage,
          {
            scale: cam.scale,
            x: () => cam.tx * W() - cam.scale * (nodo.x / 100) * W(),
            y: () => cam.ty * H() - cam.scale * (nodo.y / 100) * H(),
            duration: 0.55,
          },
          S,
        );

        // Estados del sistema: el activo manda; los recorridos quedan como
        // memoria tenue y los futuros apenas insinuados (no compiten con la
        // zona de lectura). El color solo no identifica al activo.
        nodoCores.forEach((core, j) => {
          const target = j === i ? 1 : j < i ? 0.38 : 0.12;
          tl.to(core, { autoAlpha: target, scale: j === i ? 1.08 : 1, duration: 0.3 }, S + 0.22);
        });
        // Nodo activo: halo pre-pintado (solo opacity, compositado) + número.
        if (nodoHalos[i]) tl.to(nodoHalos[i], { autoAlpha: 1, duration: 0.3 }, S + 0.22);
        tl.to(nodoNums[i], { color: p.accent, duration: 0.3 }, S + 0.22);
        tl.to(lineas[i], { stroke: p.accent, opacity: 1, duration: 0.35 }, S + 0.22);
        // Las líneas ajenas casi se apagan: que no crucen la lectura.
        lineas.forEach((l, j) => {
          if (j !== i) tl.to(l, { opacity: j < i ? 0.28 : 0.12, duration: 0.3 }, S + 0.22);
        });
        tl.to(arcos, { autoAlpha: 0.07, duration: 0.3 }, S + 0.22);

        // Zona de lectura (derecha).
        const inner = detalles[i].querySelector<HTMLElement>("[data-detalle-inner]");
        if (inner) {
          tl.fromTo(
            inner,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" },
            S + 0.5,
          );
        }
        if (strikes[i]) {
          tl.to(strikes[i], { scaleX: 1, duration: 0.4, ease: "power2.out" }, S + 0.85);
        }
        // Subrayado editorial (03): se dibuja izq→der con el scroll.
        const under = detalles[i].querySelector<HTMLElement>("[data-afirma-underline]");
        if (under) tl.to(under, { scaleX: 1, duration: 0.45, ease: "power2.out" }, S + 0.9);

        // Fichas — CORRIENTE ASCENDENTE GUIADA. Una sola trayectoria
        // continua en tres tramos CONTIGUOS de la misma propiedad (nunca
        // solapados → posición continua, reversible y determinista):
        //   1. nace cerca del nodo (0.86H) y sube desacelerando (power1.out
        //      termina con pendiente 0: empalma suave con el tramo lento);
        //   2. carril de lectura (0.58H→0.44H): avance casi horizontal, es
        //      la meseta legible — se frena solo si el scroll se frena;
        //   3. sale acelerando hacia arriba-izquierda (power1.in arranca
        //      con pendiente 0) mientras decae la opacidad.
        // El paso entre fichas mantiene 1 legible + 1 entrando + 1 en
        // disolución, nunca dos con alpha 1 (meseta = STEP, se tocan justo
        // en el borde).
        //
        // CORREDOR ANCHO (24-jul): la meseta recorría 0.55H→0.50H, apenas 45px
        // — menos que el alto de una ficha. Cuando la siguiente aterrizaba en
        // 0.55H, la anterior seguía a 0.50H y se PISABAN (se veía como bug).
        // Ahora el tramo de lectura baja hasta 0.44H: en el peor cruce quedan
        // ~0.17H de separación y ninguna se monta sobre otra.
        //
        // La HUELLA de cada principio no sale: estaciona tenue (0.10) junto al
        // nodo y se apaga antes del cambio de cámara. Estacionaba en 0.56H —
        // es decir, JUSTO donde aterriza cada ficha nueva—, así que quedaba
        // debajo de todas las que venían después. Ahora baja a 0.66H y se
        // corre más a la izquierda (-0.13W): queda fuera del carril, abajo del
        // nodo. Todo termina antes de S+2.15.
        // Calibrado para RITMO DE LECTURA (una muesca de rueda + pausa), no
        // solo scroll continuo: vidas largas (0.68 u ≈ 3 muescas) y salida
        // como disolución lenta (D3 0.33) en vez de látigo. La meseta de
        // alpha plena (0.24) sigue siendo ≤ STEP: solo una legible a la vez.
        const E0 = 0.4;
        const STEP = 0.24;
        const D1 = 0.14;
        const D2 = 0.21;
        const D3 = 0.33; // VIDA = D1+D2+D3 = 0.68
        const HUELLA_K = [0, 3, 2]; // Construir estrategias · Convicción para transformar · Justicia social
        const items = gsap.utils.toArray<HTMLElement>("[data-ficha]", fichaGrupos[i]);
        // CLAMP de pre-nacimiento: al abrirse la fase se re-asegura el estado
        // oculto de TODAS sus fichas. El set inicial del mount puede ser
        // pisado por agentes externos (Fast Refresh en dev, hidratación);
        // sin este clamp, las fichas que esperan turno quedaban VISIBLES,
        // clavadas en su punto de nacimiento (el síntoma "trabado" del
        // 23-jul). Dentro del timeline es reversible y se auto-cura.
        tl.set(items, { autoAlpha: 0, x: 0, scale: 0.94, y: () => H() * 0.86 }, S + 0.02);
        items.forEach((f, k) => {
          const e = S + E0 + k * STEP;
          const esHuella = k === HUELLA_K[i];
          // Tramo 1 — nacimiento: sube desacelerando hacia el carril.
          tl.fromTo(
            f,
            { y: () => H() * 0.86 },
            { y: () => H() * 0.58, duration: D1, ease: "power1.out" },
            e,
          );
          // Tramo 2 — lectura: casi una pausa, sin detenerse de golpe.
          tl.to(f, { y: () => H() * 0.44, duration: D2, ease: "none" }, e + D1);
          // Tramo 3 — salida (la huella estaciona ABAJO del nodo, fuera del
          // carril: si estaciona en el carril, todas las que siguen le caen
          // encima).
          tl.to(
            f,
            {
              y: () => H() * (esHuella ? 0.66 : 0.1),
              duration: D3,
              ease: esHuella ? "power1.out" : "power1.in",
            },
            e + D1 + D2,
          );
          // Deriva lateral: entra hacia la derecha, sale hacia la izquierda.
          tl.to(f, { x: () => W() * 0.02, duration: D1 + D2, ease: "power1.out" }, e);
          tl.to(
            f,
            { x: () => W() * (esHuella ? -0.13 : -0.025), duration: D3, ease: "power1.in" },
            e + D1 + D2,
          );
          // Presencia: escala y opacidad en rampas disjuntas (sin saltos).
          tl.fromTo(f, { scale: 0.94 }, { scale: 1, duration: D1, ease: "power1.out" }, e);
          tl.to(f, { autoAlpha: 1, duration: 0.11, ease: "none" }, e);
          if (esHuella) {
            tl.to(f, { autoAlpha: 0.1, duration: D3, ease: "none" }, e + D1 + D2);
            tl.to(f, { autoAlpha: 0, duration: 0.1, ease: "none" }, S + 2.02);
          } else {
            tl.to(f, { scale: 0.97, duration: D3, ease: "power1.in" }, e + D1 + D2);
            tl.to(f, { autoAlpha: 0, duration: D3, ease: "none" }, e + D1 + D2);
          }
        });

        // Salida: lectura se repliega; el halo del activo se apaga y el nodo
        // queda como memoria (recorrido).
        if (inner) tl.to(inner, { autoAlpha: 0, y: -16, duration: 0.24 }, S + 1.9);
        if (nodoHalos[i]) tl.to(nodoHalos[i], { autoAlpha: 0, duration: 0.25 }, S + 1.92);
        tl.to(nodoCores[i], { autoAlpha: 0.78, scale: 1, duration: 0.25 }, S + 1.92);
        tl.to(lineas[i], { opacity: 0.55, duration: 0.25 }, S + 1.92);
      });

      // FASE 6 — MOMENTO A: regreso al mapa y la síntesis SOLA, con foco
      // absoluto. El sistema queda como huella: puntos con su acento,
      // labels casi apagados, líneas finísimas (la naranja no cruza más el
      // texto a plena intensidad).
      tl.to(stage, { x: 0, y: 0, scale: 1, duration: 0.6 }, 7.75 + AIRE_TITULO);
      tl.to(nodoCores, { autoAlpha: 0.8, duration: 0.35 }, 8.05 + AIRE_TITULO);
      tl.to(nodoLabels, { autoAlpha: 0.18, duration: 0.35 }, 8.05 + AIRE_TITULO);
      tl.to(nodoNums, { autoAlpha: 0.35, duration: 0.35 }, 8.05 + AIRE_TITULO);
      tl.to(lineas, { opacity: 0.22, duration: 0.35 }, 8.05 + AIRE_TITULO);
      tl.to(arcos, { autoAlpha: 0.1, duration: 0.35 }, 8.05 + AIRE_TITULO);
      tl.to(sintesis, { autoAlpha: 1, duration: 0.45 }, 8.5 + AIRE_TITULO);
      tl.fromTo(
        q("[data-sintesis-frase]"),
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
        8.55 + AIRE_TITULO,
      );

      // FASE 7 — MOMENTO B: el sistema cede aún más (niebla marfil detrás
      // del texto), la síntesis achica apenas su presencia y recién entonces
      // entra el puente. Las ramas dibujan la red incipiente ALREDEDOR del
      // campo de lectura (la niebla protege el centro).
      const fog = q("[data-sintesis-fog]");
      if (fog) tl.to(fog, { autoAlpha: 1, duration: 0.45 }, 9.6 + AIRE_TITULO);
      tl.to(q("[data-sintesis-frase]"), { scale: 0.97, y: -14, duration: 0.45 }, 9.6 + AIRE_TITULO);
      tl.to(nodoCores, { autoAlpha: 0.35, duration: 0.4 }, 9.6 + AIRE_TITULO);
      tl.to(nodoLabels, { autoAlpha: 0.08, duration: 0.4 }, 9.6 + AIRE_TITULO);
      tl.to(lineas, { opacity: 0.12, duration: 0.4 }, 9.6 + AIRE_TITULO);
      ramas.forEach((r, k) => {
        tl.to(
          r,
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          9.75 + AIRE_TITULO + k * 0.04,
        );
      });
      tl.to(
        ramdots,
        { scale: 1, autoAlpha: 1, duration: 0.25, stagger: 0.03, ease: "power2.out" },
        9.95 + AIRE_TITULO,
      );
      // Sin indices: el puente quedo en un solo parrafo y targetear puentes[1]
      // dejaria a GSAP buscando un elemento que ya no existe.
      tl.to(puentes, { autoAlpha: 1, y: 0, duration: 0.4 }, 10.3 + AIRE_TITULO);
      tl.to({}, { duration: 0.85 }, 11.15 + AIRE_TITULO); // respiro antes de soltar el pin
      setDot(0);
    }, root);

    return () => {
      gsap.killTweensOf(dotEls);
      ctx.revert();
    };
  }, [live]);

  return (
    <section
      ref={rootRef}
      id="mirada"
      className="bg-grain-light to-gris-fondo/60 relative z-30 -mt-[4svh] overflow-clip rounded-t-[2.5rem] bg-gradient-to-b from-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.35)]"
      aria-label="Nuestra mirada"
    >
      <div
        ref={zoneRef}
        className={"relative motion-reduce:h-auto " + (live ? "h-[910svh]" : "h-auto")}
      >
        <div
          className={
            "w-full motion-reduce:static motion-reduce:h-auto " +
            (live ? "sticky top-0 h-[100svh] overflow-hidden" : "")
          }
        >
          {/* ── Escenario decorativo: constelación (líneas + nodos) ─────────
              Es la capa que la "cámara" recorre. Decorativa: el contenido
              real vive en los bloques de texto de abajo. ── */}
          <div
            data-stage
            aria-hidden="true"
            className={
              "absolute inset-0 will-change-transform motion-reduce:hidden" +
              (live ? "" : " hidden")
            }
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 160 90"
              preserveAspectRatio="none"
            >
              {ARCOS.map((d, i) => (
                <path
                  key={`arco-${i}`}
                  data-arco
                  d={d}
                  fill="none"
                  stroke="#1f2d4d"
                  strokeWidth="0.12"
                  strokeDasharray="0.35 0.95"
                />
              ))}
              {LINEAS.map((d, i) => (
                <path
                  key={`linea-${i}`}
                  data-linea
                  d={d}
                  fill="none"
                  stroke="rgba(31,45,77,0.32)"
                  strokeWidth="0.16"
                  strokeLinecap="round"
                />
              ))}
              {RAMAS.map((r, i) => (
                <path
                  key={`rama-${i}`}
                  data-rama
                  d={r.d}
                  fill="none"
                  stroke="rgba(31,45,77,0.35)"
                  strokeWidth="0.13"
                  strokeLinecap="round"
                />
              ))}
              {RAMAS.map((r, i) => (
                <circle
                  key={`ramdot-${i}`}
                  data-ramdot
                  cx={r.fin.x}
                  cy={r.fin.y}
                  r="0.5"
                  fill="#4a6fa5"
                />
              ))}
            </svg>

            {/* Nodos (wrapper posiciona; el core anima — GSAP no pisa el
                translate de centrado) */}
            {/* Anclaje IZQUIERDO: el punto queda sobre la coordenada del nodo
                y el label crece hacia la derecha. Así, al hacer zoom sobre un
                principio, los labels vecinos no asoman sobre la zona de
                lectura (el 02 quedaba cruzando el texto del 01). */}
            {PERSPECTIVAS.map((p, i) => (
              <div
                key={p.id}
                className="absolute"
                style={{
                  left: `${NODOS[i].x}%`,
                  top: `${NODOS[i].y}%`,
                  transform: "translate(-9px, -50%)",
                }}
              >
                <div
                  data-nodo-core={i}
                  className="flex items-center gap-3 will-change-transform"
                >
                  <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {/* Halo pre-pintado: solo se anima su opacidad */}
                    <span
                      data-nodo-halo
                      className="absolute -inset-[7px] rounded-full"
                      style={{ backgroundColor: `${p.accent}1f` }}
                    />
                    {/* Identidad cromática suave desde la apertura */}
                    <span
                      className="relative block h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: p.accent }}
                    />
                  </span>
                  <span
                    data-nodo-num
                    className="text-azul-principal/60 font-mono text-[0.8rem] font-medium tracking-[0.18em]"
                  >
                    {p.id}
                  </span>
                  <span
                    data-nodo-label
                    className="font-display text-azul-principal text-[1.02rem] font-semibold whitespace-nowrap md:text-[1.15rem]"
                  >
                    {p.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Núcleo: apertura del mapa ─────────────────────────────────── */}
          <div
            data-centro
            className={
              "flex flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 " +
              (live ? "h-full" : "h-auto py-24")
            }
          >
            <span
              data-centro-bit
              className="text-gris-texto font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase"
            >
              Nuestra mirada
            </span>
            <h2
              data-centro-bit
              className="font-display text-azul-principal mt-5 max-w-[16ch] text-balance font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.1rem, 1rem + 3.6vw, 3.6rem)", lineHeight: 1.08 }}
            >
              Una misma mirada, tres{" "}
              <span className="text-verde-concepto">principios</span>.
            </h2>
          </div>

          {/* ── Zonas de lectura + fichas por principio ───────────────────── */}
          {PERSPECTIVAS.map((p, i) => (
            <div key={p.id} className="contents">
              <div
                data-detalle={i}
                className={"motion-reduce:py-14" + (live ? "" : " py-14")}
              >
                <div
                  data-detalle-inner
                  className={
                    "mx-auto max-w-xl text-center " + (live ? "px-0" : "px-6")
                  }
                >
                  {/* Barra de acento decorativa: el color identifica al
                      principio sin comprometer el contraste del texto. Queda
                      sola —sin la etiqueta «01 — Pensamiento matemático»—:
                      ese dato ya lo dice el nodo del mapa, al que la cámara
                      está apuntando mientras se lee este bloque. */}
                  <span
                    aria-hidden="true"
                    className={
                      "mb-5 block h-[3px] w-8 rounded-full " +
                      (live ? "mx-0" : "mx-auto")
                    }
                    style={{ backgroundColor: p.accent }}
                  />
                  <h3
                    className="font-display text-azul-principal font-bold tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.7rem, 1rem + 1.6vw, 2.4rem)", lineHeight: 1.14 }}
                  >
                    {p.fraseAntes}
                    {p.tachado ? (
                      <span className="relative inline-block whitespace-nowrap">
                        <span className="text-azul-principal/70">{p.tachado}</span>
                        <span
                          data-strike
                          aria-hidden="true"
                          className="bg-azul-principal/60 absolute top-1/2 left-0 h-[0.07em] w-full -translate-y-1/2 rounded-full"
                        />
                      </span>
                    ) : null}
                    {p.frasePunto}
                  </h3>
                  <p
                    className="font-display text-azul-principal mt-3 font-semibold"
                    style={{ fontSize: "clamp(1.25rem, 0.9rem + 1vw, 1.7rem)", lineHeight: 1.25 }}
                  >
                    {p.afirmativaPre}
                    {p.acentoTexto ? (
                      <span style={{ color: p.acentoTexto }}>{p.afirmativaAccent}</span>
                    ) : (
                      <span className="relative inline-block">
                        {p.afirmativaAccent}
                        {/* Subrayado editorial: se dibuja izq→der con el scroll */}
                        <span
                          data-afirma-underline
                          aria-hidden="true"
                          className="absolute -bottom-[0.05em] left-0 h-[0.06em] w-full rounded-full"
                          style={{ backgroundColor: p.accent }}
                        />
                      </span>
                    )}
                    {p.afirmativaPost}
                  </p>
                </div>
              </div>

              {/* Fichas conceptuales: capas de pensamiento que nacen del nodo
                  activo y suben. Sin semántica interactiva. Fondo sólido: si
                  una línea del mapa cruza por detrás, la ficha la tapa limpia
                  (con /90 se transparentaba). */}
              <ul
                data-fichas={i}
                className={
                  "m-0 flex list-none flex-wrap items-center justify-center gap-3 px-6 pb-10 motion-reduce:mx-auto motion-reduce:max-w-xl" +
                  (live ? "" : " mx-auto max-w-xl")
                }
              >
                {p.fichas.map((f, k) => (
                  <li
                    key={f}
                    data-ficha
                    className="border-azul-principal/12 rounded-xl border bg-white px-5 py-3 font-sans text-[0.95rem] font-medium shadow-[0_10px_30px_-18px_rgb(31_45_77/0.35)] will-change-transform"
                    style={{
                      color: "#1f2d4d",
                      borderLeft: `3px solid ${p.accent}`,
                      transitionDelay: `${k * 40}ms`,
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Síntesis + puente hacia la red ────────────────────────────── */}
          <div
            data-sintesis
            className={
              "flex flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 " +
              (live ? "h-full" : "h-auto py-24")
            }
          >
            {/* Niebla marfil del MOMENTO B: campo de foco detrás del texto
                (el sistema y las ramas quedan alrededor, no encima). */}
            <span
              data-sintesis-fog
              aria-hidden="true"
              className={
                "pointer-events-none absolute inset-0 motion-reduce:hidden" +
                (live ? "" : " hidden")
              }
              style={{
                background:
                  "radial-gradient(ellipse 58% 52% at 50% 48%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.78) 46%, rgba(255,255,255,0) 74%)",
              }}
            />
            <p
              data-sintesis-frase
              className="font-display text-azul-principal relative max-w-[24ch] text-balance font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.8rem, 1rem + 2.4vw, 3rem)", lineHeight: 1.16 }}
            >
              Pensamiento matemático, saber y transformación forman{" "}
              <span className="text-verde-concepto">una misma mirada</span>.
            </p>
            <p
              data-puente
              className="text-azul-principal/80 relative mt-7 max-w-[40ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.1rem]"
            >
              Se sostiene en una red de especialistas, trayectorias y
              experiencias diversas.
            </p>
          </div>

          {/* Indicador de progreso: mapa · 01 · 02 · 03 · síntesis */}
          <div
            className={
              "absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 motion-reduce:hidden" +
              (live ? "" : " hidden")
            }
            aria-hidden="true"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} data-mirada-dot className="bg-azul-principal/18 h-2 w-2 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
