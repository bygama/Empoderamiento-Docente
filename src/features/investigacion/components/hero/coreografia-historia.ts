import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FIGURAS, PERSONAJE, PUNTOS, VIEWBOX } from "../constelacion";
import { HAZ_CIELO, VIDRIO_APAGADO, type Encendido } from "./coreografia-encendido";
import { ESTRELLA, ESTRELLAS } from "./estrellas";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La historia scrolleada del hero de Investigación: un timeline scrubbeado
 * sobre la sección pinneada, que arranca donde el encendido dejó la noche.
 *
 * 1. **El hero cede.** Titular, botones y cue suben y se van, y la luz los
 *    suelta: el haz vuelve al cielo.
 * 2. **El faro se apaga y se va.** La lámpara se apaga en el orden inverso
 *    al encendido (haz, halo, cristal, chispa) y el faro baja girando una
 *    vuelta —al revés que en el cierre, donde sube girando y se enciende:
 *    la página abre y cierra con el mismo gesto espejado—.
 * 3. **La hoja 01 sube** desde abajo sobre la noche mientras el faro
 *    termina de hundirse tras ella.
 * 4. **La bandada.** Las 13 estrellas que la luz tocó bajan del cielo sobre
 *    la hoja y se arman en la pregunta: cada una despega a su tiempo (el
 *    naranja lidera), pasa por un waypoint propio con arco y aterriza en
 *    su lugar tomando el tamaño de la lámina; las aristas se redibujan
 *    trazándose. Los datos sueltos que la luz alumbró se vuelven la
 *    pregunta.
 * 5. **Los cuatro beats.** Riel 01–04 con línea verde viajera, verbo que se
 *    releva y frase que se pinta palabra por palabra al ritmo del scroll
 *    (pregunta → lupa → red → espiral), con morphs continuos.
 *
 * Y a través de todo, **la chispa**: la luz de la lámpara no muere con el
 * faro. Nace del cristal cuando la lámpara se apaga, flota mientras el faro
 * se hunde, vuela con la bandada detrás del naranja, la pregunta la guarda
 * en su punto final, reaparece en el vidrio de la lupa alrededor del
 * hallazgo y se reparte al formarse la red. La luz cambia de instrumento:
 * el faro alumbra el panorama, la lupa concentra en el detalle.
 *
 * Las figuras están dibujadas en las coordenadas de las láminas (400x480)
 * y los puntos viven en el SVG de la bandada, con el viewBox del cielo:
 * todo lo que la constelación hace sobre la hoja pasa por `crearMapa`, que
 * lleva cada coordenada de lámina al lugar del cielo que cae sobre el hueco
 * de la hoja. Por eso esos valores son funciones: se miden al primer render
 * y se vuelven a medir en cada refresh (resize).
 *
 * Todo fromTo con valores explícitos e immediateRender:false: determinista
 * en las dos direcciones, sin depender de en qué estado dejó nada el
 * encendido (de eso se encarga `completar()` al tomar el control, y
 * `retomar()` al devolverlo en el tope).
 *
 * Patrón: igual que coreografia-cierre.ts, acá solo se construye el
 * timeline; el componente es dueño del gsap.context y del cleanup.
 */

/* Tinta de las palabras: azul-principal (#1f2d4d) apagado → encendido.
   GSAP no tweenea color-mix(), así que resolvemos el token a rgba acá. */
const TINTA_APAGADA = "rgba(31, 45, 77, 0.16)";
const TINTA_PRENDIDA = "rgba(31, 45, 77, 0.94)";
/* Números del riel: gris-texto (#6b7280) → azul-principal. */
const NUMERO_APAGADO = "rgba(107, 116, 128, 0.8)";
const NUMERO_PRENDIDO = "rgba(31, 45, 77, 1)";

/** Alto del recorrido pinneado en px. 5200 era el del hero viejo (~470 px
 *  por unidad); la salida del faro y la subida de la hoja suman lo suyo al
 *  mismo ritmo. */
const RECORRIDO = 5900;
/** Cuándo arranca cada tramo (unidades del timeline). */
const HAZ_SUBE = 0.15;
const APAGADO = 0.55;
const FARO_BAJA = 0.95;
const HOJA = 1.5;
const BANDADA = 1.55;
const TRAZO = 3.7;
const APARATO = 3.95;
const BEAT_1 = 4.15;
/** Cuánto baja el faro: su alto y un poco más. */
const AIRE_OCULTO = 60;
/** Grosor de las aristas en unidades de lámina (el de las láminas ED). */
const GROSOR_ARISTA = 1.5;
/** La chispa nace cuando se apaga la lámpara y despega justo detrás del
 *  naranja (que lidera la bandada). */
const NACE = APAGADO + 0.3;
const SALIDA_CHISPA = BANDADA + 0.11;
/** El hallazgo: el punto de la lupa que está en el centro del vidrio
 *  (constelacion.ts → LUPA; 0–8 son el aro, 10–12 el mango). */
const HALLAZGO = 9;

export type Constelacion = {
  circulos: SVGCircleElement[];
  lineas: SVGLineElement[];
};

type Historia = Constelacion & {
  /** La sección completa del hero: es lo que se pinnea. */
  zona: HTMLElement;
  /** La hoja 01, que sube sobre la noche. */
  hoja: HTMLElement;
  /** Wrapper de la linterna, que baja girando. */
  linterna: HTMLElement;
  /** El SVG de la bandada (viewBox del cielo), donde viven los puntos. */
  bandada: SVGSVGElement;
  /** El hueco de la lámina en la hoja (aspecto 400/480). */
  destino: HTMLElement;
  /** El encendido: se le pide la luz al tomar el control y se le devuelve
   *  al soltarlo en el tope. */
  encendido: Encendido;
};

/** Largo de la arista j de la figura (en unidades de lámina). */
function largoArista(figura: (typeof FIGURAS)[number], j: number) {
  const [a, b] = figura.aristas[j];
  return Math.hypot(
    figura.puntos[b][0] - figura.puntos[a][0],
    figura.puntos[b][1] - figura.puntos[a][1],
  );
}

/**
 * El mapa lámina → cielo. Mide en pantalla el hueco de la hoja y la matriz
 * del SVG de la bandada, y descuenta el desplazamiento actual de la hoja
 * (que sube al ritmo del scroll): el destino es siempre el de la hoja
 * PUESTA, sin importar en qué progreso se mida. Un punto de lámina p va a
 * `tx + p · s` en unidades del cielo. La medición se cachea y se tira en
 * cada `refreshInit` de ScrollTrigger: los tweens que la usan llevan
 * valores función y `invalidateOnRefresh`, así que se reevalúan ahí.
 */
function crearMapa(bandada: SVGSVGElement, destino: HTMLElement, hoja: HTMLElement) {
  let medida: { s: number; tx: number; ty: number; m: DOMMatrix } | null = null;
  const medir = () => {
    if (medida) return medida;
    const m = bandada.getScreenCTM()!;
    const d = destino.getBoundingClientRect();
    const subida =
      (Number(gsap.getProperty(hoja, "yPercent")) / 100) * hoja.offsetHeight +
      Number(gsap.getProperty(hoja, "y"));
    const aPantalla = d.width / VIEWBOX.w;
    medida = {
      s: aPantalla / m.a,
      tx: (d.left - m.e) / m.a,
      ty: (d.top - subida - m.f) / m.d,
      m,
    };
    return medida;
  };
  const olvidar = () => {
    medida = null;
  };
  ScrollTrigger.addEventListener("refreshInit", olvidar);
  return {
    x: (px: number) => medir().tx + px * medir().s,
    y: (py: number) => medir().ty + py * medir().s,
    escala: () => medir().s,
    /** Un punto de pantalla, en unidades del cielo. */
    desdePantalla: (px: number, py: number) => {
      const { m } = medir();
      return { x: (px - m.e) / m.a, y: (py - m.f) / m.d };
    },
    limpiar: () => ScrollTrigger.removeEventListener("refreshInit", olvidar),
  };
}

export function crearHistoria({
  zona,
  hoja,
  linterna,
  bandada,
  destino,
  circulos,
  lineas,
  encendido,
}: Historia) {
  const q = gsap.utils.selector(zona);
  const acto = q<HTMLElement>("[data-hero-acto]");
  const haces = q<SVGGElement>("[data-linterna-haces]")[0];
  const halo = q<SVGCircleElement>("[data-linterna-halo]")[0];
  const vidrio = q<SVGGElement>("[data-linterna-vidrio]")[0];
  const nucleo = q<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const resplandor = q<HTMLElement>("[data-hero-resplandor]")[0];
  const numeros = q<HTMLElement>("[data-riel-numero]");
  const rellenos = q<HTMLElement>("[data-riel-relleno]");
  const verbos = q<HTMLElement>("[data-verbo]");
  const frases = q<HTMLElement>("[data-frase]");
  const chispa = q<SVGGElement>("[data-hero-chispa]")[0];
  const { haz, apuntar, posado, giro, girar, reposo } = encendido.luz;
  const mapa = crearMapa(bandada, destino, hoja);
  const base = FIGURAS[0];
  /** Coordenadas de lámina → cielo, como funciones para los tweens. */
  const X = (p: readonly [number, number]) => () => mapa.x(p[0]);
  const Y = (p: readonly [number, number]) => () => mapa.y(p[1]);
  /** El foco de la lámpara en unidades del cielo, con el faro en su lugar
   *  (se descuenta cuánto bajó): de ahí nace la chispa. */
  const lampara = () => {
    const r = nucleo.getBoundingClientRect();
    const hundido = Number(gsap.getProperty(linterna, "y"));
    return mapa.desdePantalla(r.left + r.width / 2, r.top + r.height / 2 - hundido);
  };

  // ── Estado pre-paint: la hoja esperando bajo el piso (la canaleta son
  //    10px; 12 la deja fuera del cuadro), aristas sin dibujar, aparato de
  //    la historia oculto, chispa sin nacer. Los puntos ya están: son las
  //    estrellas.
  gsap.set(hoja, { autoAlpha: 1, yPercent: 100, y: 12 });
  gsap.set(lineas, { autoAlpha: 0 });
  gsap.set(chispa, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
  gsap.set(q("[data-riel]"), { autoAlpha: 0 });
  // `y: 0` explícito, y no es redundante: si la coreografía se monta dos
  // veces sobre el mismo DOM (StrictMode en desarrollo, o un cambio de
  // `live`), el revert deja el transform en píxeles y GSAP, al releer el
  // elemento, lo guarda como `y: 66px` ADEMÁS del `yPercent`. Cada verbo
  // quedaba corrido un alto entero: los que salían a -110% volvían a 0 y se
  // pisaban, y el último entraba a 0% pero quedaba escondido (el usuario,
  // 2026-09-11: «se pegan»). Con `y: 0` la caché arranca limpia.
  gsap.set(verbos, { yPercent: 110, y: 0 });
  gsap.set(frases, { autoAlpha: 0 });
  gsap.set(rellenos, { scaleX: 0 });

  let tomado = false;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: `+=${RECORRIDO}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!tomado && self.progress > 0.001) {
          tomado = true;
          encendido.completar();
        } else if (tomado && self.progress <= 0.001) {
          tomado = false;
          encendido.retomar();
        }
      },
    },
  });

  const sinRender = { immediateRender: false } as const;

  // ── Tras un refresh de ScrollTrigger (invalidateOnRefresh reinicia los
  //    tweens), lo que se dibuja a mano desde un proxy —el ángulo del haz,
  //    el giro del tambor— queda con el valor del `from`: GSAP renderiza el
  //    startAt disparando onUpdate y después el estado actual sin
  //    dispararlo. Los proxies sí quedan bien; se vuelve a proyectar desde
  //    ellos cuando el refresh termina.
  const reproyectar = () => {
    apuntar();
    girar();
  };
  ScrollTrigger.addEventListener("refresh", reproyectar);

  // ── 1. El hero cede: titular, botones y cue suben y se van, y la luz los
  //    suelta: el haz vuelve al cielo desde donde estaba posado.
  tl.fromTo(
    acto,
    { autoAlpha: 1, y: 0 },
    { autoAlpha: 0, y: -36, duration: 0.7, ease: "power1.in", ...sinRender },
    0,
  );
  tl.fromTo(
    haz,
    { beta: posado },
    { beta: HAZ_CIELO, duration: 0.6, ease: "power2.inOut", onUpdate: apuntar, ...sinRender },
    HAZ_SUBE,
  );

  // ── 2. El faro se apaga —haz, resplandor, halo, cristal y al final la
  //    chispa: el encendido al revés— y baja girando una vuelta entera, al
  //    revés que en el cierre. El giro comparte el ease de la bajada, así
  //    la vuelta se reparte sobre todo el descenso.
  tl.fromTo(haces, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, ...sinRender }, APAGADO + 0.05);
  tl.fromTo(resplandor, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, ...sinRender }, APAGADO);
  tl.fromTo(
    halo,
    { autoAlpha: 1, scale: 1 },
    { autoAlpha: 0, scale: 0.3, duration: 0.25, ease: "power2.in", ...sinRender },
    APAGADO + 0.1,
  );
  tl.fromTo(vidrio, { opacity: 1 }, { opacity: VIDRIO_APAGADO, duration: 0.2, ...sinRender }, APAGADO + 0.2);
  tl.fromTo(
    nucleo,
    { autoAlpha: 1, scale: 1 },
    { autoAlpha: 0, scale: 0.3, duration: 0.1, ease: "power2.in", ...sinRender },
    APAGADO + 0.35,
  );
  tl.fromTo(
    linterna,
    { y: 0 },
    {
      y: () => linterna.offsetHeight + AIRE_OCULTO,
      duration: 1.2,
      ease: "power1.in",
      ...sinRender,
    },
    FARO_BAJA,
  );
  tl.fromTo(
    giro,
    { theta: 0 },
    { theta: 360, duration: 1.2, ease: "power1.in", onUpdate: girar, ...sinRender },
    FARO_BAJA,
  );

  // ── La chispa nace del cristal mientras la lámpara se apaga, y flota
  //    (sube apenas, deriva hacia la hoja) mientras el faro se hunde.
  //    Los SALTOS de posición van en un `set` aparte: un valor que solo está
  //    en el `from` de un fromTo se aplica la primera vez y no vuelve a
  //    aplicarse en la segunda pasada (la chispa se apagaba en la red donde
  //    la pregunta la guardó, no en el vidrio); un set se reaplica cada vez
  //    que el playhead lo cruza, en cualquier dirección.
  const LX = () => lampara().x;
  const LY = () => lampara().y;
  const FX = () => lampara().x - 30;
  const FY = () => lampara().y - 50;
  tl.set(chispa, { x: LX, y: LY }, NACE);
  tl.fromTo(
    chispa,
    { autoAlpha: 0, scale: 0.4 },
    { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out", ...sinRender },
    NACE,
  );
  tl.fromTo(
    chispa,
    { x: LX, y: LY },
    { x: FX, y: FY, duration: SALIDA_CHISPA - (NACE + 0.2), ease: "sine.inOut", ...sinRender },
    NACE + 0.2,
  );

  // ── 3. La hoja sube sobre la noche mientras el faro termina de hundirse
  //    tras ella.
  tl.fromTo(
    hoja,
    { yPercent: 100, y: 12 },
    { yPercent: 0, y: 0, duration: 1.2, ease: "power2.out", ...sinRender },
    HOJA,
  );

  // ── 4. La bandada: cada estrella despega a su tiempo (el naranja
  //    lidera), pasa por un waypoint propio con arco (desvío determinista
  //    por índice) y aterriza en su lugar de la pregunta, ya con el tamaño
  //    de la lámina. El stagger grande deforma la nube en el aire — nada
  //    viaja rígido. Cada estrella despega del tamaño y brillo que tenía
  //    cuando la luz se cedió (tocada o no: encendido.luz.reposo), así al
  //    volver recupera exactamente lo suyo; en el aire se emparejan.
  circulos.forEach((c, i) => {
    const orden = i === PERSONAJE ? 0 : i + 1;
    const salida = BANDADA + orden * 0.055;
    const [sx, sy] = ESTRELLAS[i];
    const punto = base.puntos[i];
    const rEstrella = PUNTOS[i].r * ESTRELLA.tocada;
    const wx = () => (sx + mapa.x(punto[0])) / 2 + (((i * 17 + 3) % 7) - 3) * 12;
    const wy = () => (sy + mapa.y(punto[1])) / 2 + (((i * 29 + 5) % 11) - 5) * 10;
    // Despegue: hacia el waypoint, encogiéndose apenas (aire, distancia).
    tl.fromTo(
      c,
      {
        attr: {
          cx: sx,
          cy: sy,
          r: () => reposo.r[i] ?? rEstrella,
          "fill-opacity": () => reposo.brillo[i] ?? 1,
        },
      },
      {
        attr: { cx: wx, cy: wy, r: rEstrella * 0.85, "fill-opacity": 1 },
        duration: 0.65,
        ease: "power1.in",
        ...sinRender,
      },
      salida,
    );
    // Aterrizaje: a su lugar en la pregunta, frenando suave.
    tl.fromTo(
      c,
      { attr: { cx: wx, cy: wy, r: rEstrella * 0.85 } },
      {
        attr: { cx: X(punto), cy: Y(punto), r: () => PUNTOS[i].r * mapa.escala() },
        duration: 0.7,
        ease: "power3.out",
        ...sinRender,
      },
      salida + 0.65,
    );
  });

  // ...la chispa vuela detrás del naranja, con su propio arco, hasta el punto
  //    final de la pregunta, que la guarda: se encoge y se apaga en él.
  {
    const guarda = base.puntos[PERSONAJE];
    const wx = () => (FX() + mapa.x(guarda[0])) / 2 - 36;
    const wy = () => (FY() + mapa.y(guarda[1])) / 2 + 30;
    tl.fromTo(
      chispa,
      { x: FX, y: FY },
      { x: wx, y: wy, duration: 0.65, ease: "power1.in", ...sinRender },
      SALIDA_CHISPA,
    );
    tl.fromTo(
      chispa,
      { x: wx, y: wy },
      { x: X(guarda), y: Y(guarda), duration: 0.7, ease: "power3.out", ...sinRender },
      SALIDA_CHISPA + 0.65,
    );
    tl.fromTo(
      chispa,
      { autoAlpha: 1, scale: 1 },
      { autoAlpha: 0, scale: 0.15, duration: 0.25, ease: "power2.in", ...sinRender },
      SALIDA_CHISPA + 1.2,
    );
  }

  // ...y las aristas se redibujan trazándose sobre la figura recién formada.
  lineas.forEach((l, j) => {
    const arista = base.aristas[j];
    if (!arista) return;
    const [a, b] = arista;
    const largo = () => largoArista(base, j) * mapa.escala();
    tl.fromTo(
      l,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        strokeDasharray: largo,
        strokeDashoffset: largo,
        attr: {
          "stroke-width": () => GROSOR_ARISTA * mapa.escala(),
          x1: X(base.puntos[a]),
          y1: Y(base.puntos[a]),
          x2: X(base.puntos[b]),
          y2: Y(base.puntos[b]),
        },
        duration: 0.02,
        ...sinRender,
      },
      TRAZO,
    );
    tl.fromTo(
      l,
      { strokeDashoffset: largo },
      { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", ...sinRender },
      TRAZO + 0.06 + j * 0.05,
    );
  });
  // Liberar el dash para que los morphs de los beats muevan extremos.
  tl.set(lineas, { strokeDasharray: "none", strokeDashoffset: 0 }, TRAZO + 1.25);

  // ── 5. Entra el aparato de la historia y el beat 1.
  tl.fromTo(
    q("[data-riel]"),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.4, ...sinRender },
    APARATO,
  );
  tl.fromTo(
    numeros[0],
    { color: NUMERO_APAGADO },
    { color: NUMERO_PRENDIDO, duration: 0.3, ...sinRender },
    BEAT_1,
  );
  tl.fromTo(
    verbos[0],
    { yPercent: 110 },
    { yPercent: 0, duration: 0.5, ease: "power2.out", ...sinRender },
    BEAT_1,
  );
  agregarFrase(tl, frases[0], BEAT_1 + 0.25);

  tl.to({}, { duration: 0.35 }); // dwell: la pregunta respira antes del beat 2

  // ── Beats 2..4: línea verde viaja, verbo se releva, puntos morfean en
  //    continuo (el rearme pasa UNA vez; acá el lenguaje es la reorganización).
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

    // Morph de la constelación, determinista.
    circulos.forEach((c, i) => {
      tl.fromTo(
        c,
        { attr: { cx: X(desde.puntos[i]), cy: Y(desde.puntos[i]) } },
        {
          attr: { cx: X(hacia.puntos[i]), cy: Y(hacia.puntos[i]) },
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
            x1: X(origen.puntos[a0]),
            y1: Y(origen.puntos[a0]),
            x2: X(origen.puntos[b0]),
            y2: Y(origen.puntos[b0]),
          },
        },
        {
          autoAlpha: despues ? 1 : 0,
          attr: {
            x1: X(meta.puntos[a1]),
            y1: Y(meta.puntos[a1]),
            x2: X(meta.puntos[b1]),
            y2: Y(meta.puntos[b1]),
          },
          duration: 1,
          ease: "power2.inOut",
          ...sinRender,
        },
        inicio + 0.15,
      );
    });

    // La luz cambia de instrumento: cuando el aro de la lupa se cierra, la
    // chispa reaparece en el vidrio, alrededor del hallazgo; cuando la lupa
    // se vuelve red, se reparte y se apaga.
    if (hacia.id === "lupa") {
      const vidrio = hacia.puntos[HALLAZGO];
      tl.set(chispa, { x: X(vidrio), y: Y(vidrio) }, inicio + 0.85);
      tl.fromTo(
        chispa,
        { autoAlpha: 0, scale: 0.3 },
        { autoAlpha: 1, scale: 1.5, duration: 0.4, ease: "power2.out", ...sinRender },
        inicio + 0.85,
      );
    }
    if (desde.id === "lupa") {
      tl.fromTo(
        chispa,
        { autoAlpha: 1, scale: 1.5 },
        { autoAlpha: 0, scale: 2.6, duration: 0.5, ease: "power1.out", ...sinRender },
        inicio + 0.1,
      );
    }

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

  // Solo dev: `#qa=0.42` clava el timeline en ese progreso sin scroll (el
  // screenshot headless no respeta scrollTo). Primero toma el control como
  // lo haría el scroll (la intro salta a su final y suelta la luz; si no,
  // sigue corriendo y pisa la lámpara), y se reafirma unos frames: un
  // disparo único pierde la carrera contra el refresh de ScrollTrigger.
  if (process.env.NODE_ENV === "development") {
    const m = window.location.hash.match(/qa=([\d.]+)/);
    if (m) {
      const p = Math.min(1, Math.max(0, parseFloat(m[1])));
      let frames = 0;
      const clavar = () => {
        if (frames === 0) encendido.completar();
        tl.scrollTrigger?.disable(false);
        tl.progress(p);
        if (++frames < 30) requestAnimationFrame(clavar);
      };
      requestAnimationFrame(clavar);
    }
  }

  /** Lo que el gsap.context no conoce: los oídos en ScrollTrigger. */
  const limpiar = () => {
    mapa.limpiar();
    ScrollTrigger.removeEventListener("refresh", reproyectar);
  };

  return { tl, limpiar };
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
