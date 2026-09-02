import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISPERSION, FIGURAS, PERSONAJE, PUNTOS } from "./constelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía del hero de Investigación, en dos vidas que se prestan el
 * control de la constelación:
 *
 * 1. **Reposo** — al cargar, los puntos caen dispersos y forman la pregunta
 *    (intro), luego loopean solos entre las cuatro figuras. El loop nunca
 *    muere: cada vez que el scroll vuelve al tope, lo retoma.
 * 2. **Historia** — al primer tramo de scroll la hoja se pinnea y ocurre el
 *    gesto central del hero: la figura se DESARMA (las líneas se sueltan,
 *    los puntos rompen formación hacia la dispersión) y la bandada suelta
 *    acompaña el viaje hacia la izquierda; al llegar se REARMA en la
 *    pregunta y las líneas se redibujan trazándose. Después corren los
 *    cuatro beats (riel 01–04, verbo que se releva, frase que se pinta),
 *    con morphs continuos — el desarme pasa una sola vez.
 *
 * El pase de manos entre vidas es por tweens autónomos cortos (soltar /
 * reagrupar): así el timeline scrubbeado queda 100 % determinista (todo
 * fromTo con valores explícitos) sin importar en qué figura estaba el loop.
 *
 * Patrón: igual que casos/coreografia.ts, este módulo solo construye
 * timelines; el componente es dueño del gsap.context y del cleanup.
 */

/* Tinta de las palabras: azul-principal (#1f2d4d) apagado → encendido.
   GSAP no tweenea color-mix(), así que resolvemos el token a rgba acá. */
const TINTA_APAGADA = "rgba(31, 45, 77, 0.16)";
const TINTA_PRENDIDA = "rgba(31, 45, 77, 0.94)";
/* Números del riel: gris-texto (#6b7280) → azul-principal. */
const NUMERO_APAGADO = "rgba(107, 116, 128, 0.8)";
const NUMERO_PRENDIDO = "rgba(31, 45, 77, 1)";

const HOLD = 4.8;
const MORPH = 1.5;

type Constelacion = {
  circulos: SVGCircleElement[];
  lineas: SVGLineElement[];
};

/** Largo de la arista j de la figura (para el dibujado con dash). */
function largoArista(figura: (typeof FIGURAS)[number], j: number) {
  const [a, b] = figura.aristas[j];
  return Math.hypot(
    figura.puntos[b][0] - figura.puntos[a][0],
    figura.puntos[b][1] - figura.puntos[a][1],
  );
}

/** Estado pre-paint del reposo: puntos dispersos con r=0, aristas sin dibujar. */
export function estadoInicialConstelacion({ circulos, lineas }: Constelacion) {
  const base = FIGURAS[0];
  circulos.forEach((c, i) => {
    gsap.set(c, {
      attr: { cx: DISPERSION[i][0], cy: DISPERSION[i][1], r: 0 },
    });
  });
  lineas.forEach((l, j) => {
    if (!base.aristas[j]) {
      gsap.set(l, { autoAlpha: 0 });
      return;
    }
    const largo = largoArista(base, j);
    gsap.set(l, { strokeDasharray: largo, strokeDashoffset: largo });
  });
}

/** Entrada del reposo: los datos sueltos caen sobre la hoja y forman la pregunta. */
export function crearIntroConstelacion({ circulos, lineas }: Constelacion) {
  const base = FIGURAS[0];
  const intro = gsap.timeline();
  intro.to(circulos, {
    attr: { r: (i: number) => PUNTOS[i].r },
    duration: 0.5,
    ease: "back.out(2.2)",
    stagger: { each: 0.05, from: "random" },
  });
  intro.to(
    circulos,
    {
      attr: {
        cx: (i: number) => base.puntos[i][0],
        cy: (i: number) => base.puntos[i][1],
      },
      duration: 1.15,
      ease: "power3.inOut",
      stagger: 0.02,
    },
    0.55,
  );
  intro.to(
    lineas.slice(0, base.aristas.length),
    {
      strokeDashoffset: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.055,
    },
    1.35,
  );
  // Tras dibujar, liberar el dash para que los morphs muevan extremos.
  intro.set(lineas, { strokeDasharray: "none", strokeDashoffset: 0 });
  return intro;
}

/** Loop contemplativo del reposo: pregunta → lupa → red → espiral → pregunta. */
export function crearLoopConstelacion(
  { circulos, lineas }: Constelacion,
  onFigura: (idx: number) => void,
) {
  const loop = gsap.timeline({ repeat: -1, paused: true });
  for (let paso = 1; paso <= FIGURAS.length; paso++) {
    const idx = paso % FIGURAS.length;
    const figura = FIGURAS[idx];
    const morph = gsap.timeline({
      onStart: () => onFigura(idx),
    });
    morph.to(
      circulos,
      {
        attr: {
          cx: (i: number) => figura.puntos[i][0],
          cy: (i: number) => figura.puntos[i][1],
        },
        duration: MORPH,
        ease: "power2.inOut",
        stagger: 0.015,
      },
      0,
    );
    lineas.forEach((l, j) => {
      const arista = figura.aristas[j];
      if (!arista) {
        morph.to(l, { autoAlpha: 0, duration: MORPH * 0.4 }, 0);
        return;
      }
      const [a, b] = arista;
      morph.to(
        l,
        {
          autoAlpha: 1,
          attr: {
            x1: figura.puntos[a][0],
            y1: figura.puntos[a][1],
            x2: figura.puntos[b][0],
            y2: figura.puntos[b][1],
          },
          duration: MORPH,
          ease: "power2.inOut",
        },
        0,
      );
    });
    loop.add(morph, `+=${HOLD}`);
  }
  return loop;
}

/**
 * Pase de manos reposo → historia: la figura se suelta. Las líneas se
 * desvanecen y los puntos rompen formación hacia la dispersión — desde
 * cualquier figura (o a mitad de un morph) el gesto se ve natural, y deja
 * a la constelación exactamente en el estado `from` del rearme scrubbeado.
 */
export function soltarConstelacion({ circulos, lineas }: Constelacion) {
  const tl = gsap.timeline();
  tl.to(lineas, { autoAlpha: 0, duration: 0.22, ease: "power1.out" }, 0);
  tl.to(
    circulos,
    {
      attr: {
        cx: (i: number) => DISPERSION[i][0],
        cy: (i: number) => DISPERSION[i][1],
        r: (i: number) => PUNTOS[i].r,
      },
      duration: 0.5,
      ease: "power2.inOut",
      stagger: { each: 0.018, from: "random" },
    },
    0.04,
  );
  return tl;
}

/**
 * Pase de manos historia → reposo: la bandada vuelve a la pregunta formada
 * y el loop retoma desde el principio de su ciclo (alTerminar).
 */
export function reagruparConstelacion(
  { circulos, lineas }: Constelacion,
  alTerminar: () => void,
) {
  const base = FIGURAS[0];
  const tl = gsap.timeline({ onComplete: alTerminar });
  tl.to(
    circulos,
    {
      attr: {
        cx: (i: number) => base.puntos[i][0],
        cy: (i: number) => base.puntos[i][1],
        r: (i: number) => PUNTOS[i].r,
      },
      duration: 0.55,
      ease: "power3.inOut",
      stagger: 0.02,
    },
    0,
  );
  lineas.forEach((l, j) => {
    const arista = base.aristas[j];
    if (!arista) {
      tl.set(l, { autoAlpha: 0 }, 0);
      return;
    }
    const [a, b] = arista;
    tl.set(
      l,
      {
        strokeDasharray: "none",
        strokeDashoffset: 0,
        attr: {
          x1: base.puntos[a][0],
          y1: base.puntos[a][1],
          x2: base.puntos[b][0],
          y2: base.puntos[b][1],
        },
      },
      0.35,
    );
    tl.to(l, { autoAlpha: 1, duration: 0.3 }, 0.38);
  });
  return tl;
}

type Historia = Constelacion & {
  /** Sección pinneada (la zona completa del hero). */
  zona: HTMLElement;
  /** Wrapper de la constelación (el que viaja de derecha a izquierda). */
  viajero: HTMLElement;
  /** El scroll deja el tope: pausar el reposo y soltar la figura. */
  onTomaControl: () => void;
  /** El scroll volvió al tope: reagrupar y devolverle el mando al loop. */
  onVueltaAlReposo: () => void;
};

/** Delta de centros entre el viajero (sin transform) y su destino en la historia. */
function medirViaje(viajero: HTMLElement, destino: HTMLElement) {
  const a = viajero.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const x = Number(gsap.getProperty(viajero, "x")) || 0;
  const y = Number(gsap.getProperty(viajero, "y")) || 0;
  const escala = Number(gsap.getProperty(viajero, "scale")) || 1;
  const anchoBase = a.width / escala;
  return {
    x: b.left + b.width / 2 - (a.left + a.width / 2 - x),
    y: b.top + b.height / 2 - (a.top + a.height / 2 - y),
    scale: b.width / anchoBase,
  };
}

/**
 * La historia scrolleada: un timeline scrubbeado sobre la zona pinneada.
 * La constelación solo se anima acá vía fromTo con valores explícitos e
 * immediateRender:false — determinista en ambas direcciones, sin depender
 * de en qué figura la dejó el reposo (de eso se encarga soltarConstelacion).
 */
export function crearHistoria({
  zona,
  viajero,
  circulos,
  lineas,
  onTomaControl,
  onVueltaAlReposo,
}: Historia) {
  const q = gsap.utils.selector(zona);
  const destino = q<HTMLElement>("[data-historia-destino]")[0];
  const numeros = q<HTMLElement>("[data-riel-numero]");
  const rellenos = q<HTMLElement>("[data-riel-relleno]");
  const verbos = q<HTMLElement>("[data-verbo]");
  const frases = q<HTMLElement>("[data-frase]");
  const base = FIGURAS[0];

  let enHistoria = false;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: "+=5200",
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!enHistoria && self.progress > 0.001) {
          enHistoria = true;
          onTomaControl();
        } else if (enHistoria && self.progress <= 0.001) {
          enHistoria = false;
          onVueltaAlReposo();
        }
      },
    },
  });

  const sinRender = { immediateRender: false } as const;

  // ── Transición, parte 1: el hero cede y la bandada suelta (la dejó así
  //    soltarConstelacion) acompaña el viaje de la hoja hacia la izquierda.
  tl.to(
    q("[data-acto-hero]"),
    { autoAlpha: 0, y: -36, duration: 0.7, ease: "power1.in" },
    0,
  );
  tl.to(q("[data-constelacion-rotulo]"), { autoAlpha: 0, duration: 0.25 }, 0);
  tl.to(
    viajero,
    {
      x: () => medirViaje(viajero, destino).x,
      y: () => medirViaje(viajero, destino).y,
      scale: () => medirViaje(viajero, destino).scale,
      duration: 1.25,
      ease: "power2.inOut",
    },
    0.15,
  );
  tl.fromTo(
    q("[data-historia]"),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.4, ...sinRender },
    1.45,
  );

  // ── Transición, parte 2: el rearme EN VUELO. La pregunta se arma mientras
  //    la bandada cruza la hoja: cada punto despega a su tiempo (el naranja
  //    lidera), pasa por un waypoint propio con arco (desvío determinista
  //    por índice) y aterriza en su lugar recuperando tamaño. El stagger
  //    grande deforma la nube en el aire — nada viaja rígido.
  circulos.forEach((c, i) => {
    const orden = i === PERSONAJE ? 0 : i + 1;
    const salida = 0.35 + orden * 0.055;
    const [dx, dy] = DISPERSION[i];
    const [px, py] = base.puntos[i];
    const wx = (dx + px) / 2 + (((i * 17 + 3) % 7) - 3) * 8;
    const wy = (dy + py) / 2 + (((i * 29 + 5) % 11) - 5) * 9;
    const r = PUNTOS[i].r;
    // Despegue: hacia el waypoint, encogiéndose apenas (aire, distancia).
    tl.fromTo(
      c,
      { attr: { cx: dx, cy: dy, r } },
      {
        attr: { cx: wx, cy: wy, r: r * 0.85 },
        duration: 0.65,
        ease: "power1.in",
        ...sinRender,
      },
      salida,
    );
    // Aterrizaje: a su lugar en la pregunta, frenando suave.
    tl.fromTo(
      c,
      { attr: { cx: wx, cy: wy, r: r * 0.85 } },
      {
        attr: { cx: px, cy: py, r },
        duration: 0.7,
        ease: "power3.out",
        ...sinRender,
      },
      salida + 0.65,
    );
  });

  // ...y las líneas se redibujan trazándose sobre la figura recién formada.
  lineas.forEach((l, j) => {
    const arista = base.aristas[j];
    if (!arista) return;
    const [a, b] = arista;
    const largo = largoArista(base, j);
    tl.fromTo(
      l,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        strokeDasharray: largo,
        strokeDashoffset: largo,
        attr: {
          x1: base.puntos[a][0],
          y1: base.puntos[a][1],
          x2: base.puntos[b][0],
          y2: base.puntos[b][1],
        },
        duration: 0.02,
        ...sinRender,
      },
      2.4,
    );
    tl.fromTo(
      l,
      { strokeDashoffset: largo },
      { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", ...sinRender },
      2.46 + j * 0.05,
    );
  });
  // Liberar el dash para que los morphs de los beats muevan extremos.
  tl.set(lineas, { strokeDasharray: "none", strokeDashoffset: 0 }, 3.65);

  // ── Transición, parte 3: entra el aparato de la historia y el beat 1.
  tl.fromTo(
    q("[data-riel]"),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.4, ...sinRender },
    2.65,
  );
  tl.fromTo(
    numeros[0],
    { color: NUMERO_APAGADO },
    { color: NUMERO_PRENDIDO, duration: 0.3, ...sinRender },
    2.85,
  );
  tl.fromTo(
    verbos[0],
    { yPercent: 110 },
    { yPercent: 0, duration: 0.5, ease: "power2.out", ...sinRender },
    2.85,
  );
  agregarFrase(tl, frases[0], 3.1);

  tl.to({}, { duration: 0.35 }); // dwell: la pregunta respira antes del beat 2

  // ── Beats 2..4: línea verde viaja, verbo se releva, puntos morfean en
  //    continuo (el desarme pasa UNA vez; acá el lenguaje es la reorganización).
  for (let idx = 1; idx < FIGURAS.length; idx++) {
    const desde = FIGURAS[idx - 1];
    const hacia = FIGURAS[idx];
    const inicio = tl.duration();

    tl.fromTo(
      rellenos[idx - 1],
      { scaleX: 0 },
      { scaleX: 1, duration: 0.45, ease: "power1.inOut", ...sinRender },
      inicio,
    );
    tl.to(
      numeros[idx - 1],
      { color: NUMERO_APAGADO, duration: 0.3 },
      inicio + 0.15,
    );
    tl.fromTo(
      numeros[idx],
      { color: NUMERO_APAGADO },
      { color: NUMERO_PRENDIDO, duration: 0.3, ...sinRender },
      inicio + 0.3,
    );

    // Morph de la constelación, calcado del loop pero determinista.
    circulos.forEach((c, i) => {
      tl.fromTo(
        c,
        { attr: { cx: desde.puntos[i][0], cy: desde.puntos[i][1] } },
        {
          attr: { cx: hacia.puntos[i][0], cy: hacia.puntos[i][1] },
          duration: 1,
          ease: "power2.inOut",
          ...sinRender,
        },
        inicio + 0.15 + i * 0.012,
      );
    });
    lineas.forEach((l, j) => {
      const antes = desde.aristas[j];
      const despues = hacia.aristas[j];
      const [a0, b0] = antes ?? despues ?? [0, 0];
      const [a1, b1] = despues ?? antes ?? [0, 0];
      const origen = antes ? desde : hacia;
      const meta = despues ? hacia : desde;
      tl.fromTo(
        l,
        {
          autoAlpha: antes ? 1 : 0,
          attr: {
            x1: origen.puntos[a0][0],
            y1: origen.puntos[a0][1],
            x2: origen.puntos[b0][0],
            y2: origen.puntos[b0][1],
          },
        },
        {
          autoAlpha: despues ? 1 : 0,
          attr: {
            x1: meta.puntos[a1][0],
            y1: meta.puntos[a1][1],
            x2: meta.puntos[b1][0],
            y2: meta.puntos[b1][1],
          },
          duration: 1,
          ease: "power2.inOut",
          ...sinRender,
        },
        inicio + 0.15,
      );
    });

    // Relevo del verbo (el anterior sube y sale, el nuevo entra desde abajo).
    tl.to(
      verbos[idx - 1],
      { yPercent: -110, duration: 0.45, ease: "power2.in" },
      inicio + 0.1,
    );
    tl.fromTo(
      verbos[idx],
      { yPercent: 110 },
      { yPercent: 0, duration: 0.5, ease: "power2.out", ...sinRender },
      inicio + 0.35,
    );

    // Relevo de la frase.
    tl.to(
      frases[idx - 1],
      { autoAlpha: 0, y: -10, duration: 0.3 },
      inicio + 0.1,
    );
    agregarFrase(tl, frases[idx], inicio + 0.45);

    tl.to({}, { duration: 0.35 }); // dwell entre beats
  }

  // Respiro final antes de despinnear hacia «Por qué investigamos».
  tl.to({}, { duration: 0.5 });

  return tl;
}

/** Entra la frase y se pinta palabra por palabra (la lectura al ritmo del scroll). */
function agregarFrase(
  tl: gsap.core.Timeline,
  frase: HTMLElement,
  inicio: number,
) {
  const palabras = gsap.utils.toArray<HTMLElement>(
    frase.querySelectorAll("[data-palabra]"),
  );
  tl.fromTo(
    frase,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false },
    inicio,
  );
  tl.fromTo(
    palabras,
    { color: TINTA_APAGADA },
    {
      color: TINTA_PRENDIDA,
      duration: 0.25,
      stagger: 0.06,
      immediateRender: false,
    },
    inicio + 0.15,
  );
}

/** La hoja respira apenas (flotación del SVG, independiente del scrub). */
export function crearRespiracion(svg: Element) {
  return gsap.to(svg, {
    y: 7,
    duration: 4.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    paused: true,
  });
}

/** Play/pausa de las timelines autónomas según visibilidad (batería). */
export function crearVigiaVisibilidad(
  wrap: Element,
  autonomas: () => (gsap.core.Timeline | gsap.core.Tween)[],
) {
  return ScrollTrigger.create({
    trigger: wrap,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      autonomas().forEach((a) => (self.isActive ? a.play() : a.pause()));
    },
  });
}
