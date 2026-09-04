import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISPERSION, FIGURAS, PUNTOS } from "./constelacion";
import { RADIO_ESTAMPA } from "./FiguraConstelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía de «Nacimos de una pregunta» — la carta abierta.
 *
 * Un escenario pinneado de una pantalla, en cuatro beats:
 *
 * 1. EL WIPE. La hoja llega gris como el marco del hero, con un semicírculo
 *    navy asomando del borde inferior (la forma plana azul del manual §6) y
 *    el título en tinta arriba. Al pinnearse, el círculo crece hasta cubrir
 *    la pantalla: es la noche que llega desde abajo. El título tiene dos
 *    copias superpuestas —tinta navy fuera del campo, blanca adentro—, así
 *    el borde del círculo lo invierte a su paso sin ningún fade.
 * 2. LA CARTA SALE DEL SOBRE. El sobre sube al borde inferior y la hoja
 *    emerge de su boca, lineal con el scroll, hasta el centro de lectura,
 *    tapando el título. Las cuatro fichas esperan en las esquinas,
 *    inclinadas, cerradas (solo figura + nombre), con una deriva leve.
 * 3. LA CARTA SE VA POR ARRIBA y el sobre se hunde. Las fichas viajan de
 *    las esquinas a una grilla 2×2 en el centro y se enderezan.
 * 4. LAS FICHAS SE ABREN: la definición se despliega y la figura de cada
 *    una se forma (los puntos caen en su lugar, las aristas se trazan).
 *    Respiro y el pin suelta.
 *
 * Todo scrubbeado, con fromTo explícitos y valores en función (se remiden
 * en cada refresh). Patrón: igual que coreografia-hero.ts y
 * coreografia-cierre.ts, acá solo se construye la timeline; el componente
 * es dueño del gsap.context y del cleanup.
 */

type Escena = {
  /** El wrapper de la sección: es lo que se pinnea. */
  zona: HTMLElement;
  /** El escenario de una pantalla: de acá salen todos los actores. */
  hoja: HTMLElement;
};

/** Radio del semicírculo inicial, como fracción de la altura del escenario. */
const RADIO_INICIAL = 0.26;

/** Tamaño de los puntos de una figura desarmada (factor sobre el radio final). */
const SUELTO = 0.45;

/** Las fichas en reposo: esquinas del escenario, más chicas e inclinadas. */
const ESQUINA = {
  margenX: 0.045,
  margenArriba: 0.1,
  margenAbajo: 0.09,
  escala: 0.74,
  giros: [-5, 4, 3.5, -4],
  /** Deriva vertical mientras la carta se lee (parallax leve, scrubbeado). */
  deriva: -18,
} as const;

/** Tiempos (unidades del timeline). */
const T = {
  wipe: { desde: 0, hasta: 0.7 },
  sobreEntra: { desde: 0.45, hasta: 0.95 },
  fichasEntran: { desde: 0.6, cada: 0.08 },
  cartaSube: { desde: 1.0, hasta: 2.1 },
  tituloSeVa: { desde: 1.5, hasta: 1.85 },
  // La carta sale LINEAL y despacio (se termina de leer mientras sube) y
  // se va del todo ANTES de que las fichas viajen: nunca se pisan.
  cartaSale: { desde: 2.5, hasta: 3.7 },
  sobreSale: { desde: 2.7, hasta: 3.3 },
  fichasViajan: { desde: 3.7, dura: 0.8, cada: 0.1 },
  fichasAbren: { desde: 4.45, dura: 0.35, cada: 0.06 },
  figurasForman: { desde: 4.5, dura: 0.5, cada: 0.06 },
  fin: 5.3,
} as const;

/** Alto del recorrido pinneado en px de scroll. */
export const RECORRIDO_CARTA = 5300;

/** Largo de la arista j de una figura (para el trazado con dash). */
function largoArista(figura: (typeof FIGURAS)[number], j: number) {
  const [a, b] = figura.aristas[j];
  return Math.hypot(
    figura.puntos[b][0] - figura.puntos[a][0],
    figura.puntos[b][1] - figura.puntos[a][1],
  );
}

export function crearCarta({ zona, hoja }: Escena) {
  const q = gsap.utils.selector(hoja);
  const campo = q<HTMLElement>("[data-carta-campo]")[0];
  const tituloLuz = q<HTMLElement>("[data-carta-titulo-luz]")[0];
  const sobre = q<HTMLElement>("[data-carta-sobre]")[0];
  const carta = q<HTMLElement>("[data-carta-hoja]")[0];
  const grilla = q<HTMLElement>("[data-carta-fichas]")[0];
  const fichas = q<HTMLElement>("[data-ficha]");
  const textos = q<HTMLElement>("[data-ficha-texto]");

  const alto = () => hoja.clientHeight;
  const ancho = () => hoja.clientWidth;
  const circulo = (r: number) => `circle(${r}px at 50% 100%)`;
  const radioInicial = () => alto() * RADIO_INICIAL;
  const radioTotal = () => Math.hypot(ancho() / 2, alto()) + 4;

  // ── Geometría de la carta, sin transforms (offsets de layout): el sobre
  //    es hijo posicionado de la hoja y la carta, hija posicionada del sobre.
  const topCarta = () => sobre.offsetTop + carta.offsetTop;
  /** Posición de lectura: centrada, pero nunca con el encabezado de la
   *  carta fuera de pantalla (en viewports bajos la hoja es más alta que
   *  el escenario: se lee el arranque acá y el resto mientras sube). */
  const yLectura = () =>
    Math.max((alto() - carta.offsetHeight) / 2, alto() * 0.07) - topCarta();
  /** El sobre se hunde bajo el piso con solapa y todo (la solapa asoma
   *  9rem por arriba de su caja). */
  const hundidoSobre = () => sobre.offsetHeight + 200;
  /** La carta es hija del sobre: al salir por arriba tiene que compensar
   *  el hundimiento del sobre, que la arrastra hacia abajo. */
  const ySalida = () => -(topCarta() + carta.offsetHeight + 40 + hundidoSobre());

  // ── Geometría de las fichas: de su celda en la grilla a su esquina. La
  //    caja escalada queda centrada en la caja de layout, así que el borde
  //    visible se corrige por (1 − escala) / 2.
  const layoutFicha = (li: HTMLElement) => ({
    left: grilla.offsetLeft + li.offsetLeft,
    top: grilla.offsetTop + li.offsetTop,
    w: li.offsetWidth,
    h: li.offsetHeight,
  });
  const esquinaX = (i: number) => {
    const { left, w } = layoutFicha(fichas[i]);
    const margen = ancho() * ESQUINA.margenX;
    const sangria = (w * (1 - ESQUINA.escala)) / 2;
    const derecha = i % 2 === 1;
    const visibleLeft = derecha ? ancho() - margen - w * ESQUINA.escala : margen;
    return visibleLeft - sangria - left;
  };
  const esquinaY = (i: number) => {
    const { top, h } = layoutFicha(fichas[i]);
    const sangria = (h * (1 - ESQUINA.escala)) / 2;
    const abajo = i >= 2;
    const visibleTop = abajo
      ? alto() - alto() * ESQUINA.margenAbajo - h * ESQUINA.escala
      : alto() * ESQUINA.margenArriba;
    return visibleTop - sangria - top;
  };

  // ── Las figuras de cada ficha: puntos y aristas por estampa.
  const estampas = fichas.map((li) => {
    const svg = li.querySelector<SVGSVGElement>("[data-figura]")!;
    const figura = FIGURAS.find((f) => f.id === svg.dataset.figura) ?? FIGURAS[0];
    return {
      figura,
      puntos: Array.from(svg.querySelectorAll<SVGCircleElement>("[data-figura-punto]")),
      aristas: Array.from(svg.querySelectorAll<SVGLineElement>("[data-figura-arista]")),
    };
  });

  // ── Estado pre-paint: semicírculo asomando, título en tinta, sobre bajo
  //    el piso, carta adentro, fichas en sus esquinas y cerradas, figuras
  //    desarmadas.
  gsap.set(campo, { clipPath: circulo(radioInicial()) });
  gsap.set(tituloLuz, { autoAlpha: 1 });
  gsap.set(sobre, { y: hundidoSobre });
  gsap.set(carta, { y: 0 });
  fichas.forEach((li, i) => {
    gsap.set(li, {
      x: esquinaX(i),
      y: esquinaY(i) + 30,
      rotation: ESQUINA.giros[i],
      scale: ESQUINA.escala,
      autoAlpha: 0,
      transformOrigin: "50% 50%",
    });
  });
  gsap.set(textos, { gridTemplateRows: "0fr" });
  estampas.forEach(({ figura, puntos, aristas }) => {
    // Desarmada: puntos sueltos y chicos (datos antes de formar figura).
    puntos.forEach((c, i) => {
      gsap.set(c, {
        attr: { cx: DISPERSION[i][0], cy: DISPERSION[i][1], r: PUNTOS[i].r * RADIO_ESTAMPA * SUELTO },
      });
    });
    aristas.forEach((l, j) => {
      const largo = largoArista(figura, j);
      gsap.set(l, { strokeDasharray: largo, strokeDashoffset: largo });
    });
  });

  const sinRender = { immediateRender: false } as const;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: `+=${RECORRIDO_CARTA}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Este trigger nace DESPUÉS que los de las secciones de abajo (live se
      // decide en un layout effect). ScrollTrigger procesa los pins en orden
      // de creación salvo que algún trigger declare refreshPriority: con eso
      // ordena por posición en la página y el spacer de la carta se suma bien
      // al inicio de los pins siguientes (si no, el cierre pinneaba 4400px
      // antes de tiempo).
      refreshPriority: 0,
      onUpdate: (self) => {
        // Progreso expuesto para QA (scripts de scroll leen data-progreso).
        zona.dataset.progreso = self.progress.toFixed(3);
      },
    },
  });

  // ── 1. El wipe: la noche llega desde abajo y el título se invierte a su paso.
  tl.fromTo(
    campo,
    { clipPath: () => circulo(radioInicial()) },
    {
      clipPath: () => circulo(radioTotal()),
      duration: T.wipe.hasta - T.wipe.desde,
      ease: "power2.inOut",
      ...sinRender,
    },
    T.wipe.desde,
  );

  // El sobre sube al borde inferior.
  tl.fromTo(
    sobre,
    { y: hundidoSobre },
    {
      y: 0,
      duration: T.sobreEntra.hasta - T.sobreEntra.desde,
      ease: "power2.out",
      ...sinRender,
    },
    T.sobreEntra.desde,
  );

  // Las fichas aparecen en sus esquinas, subiendo apenas.
  fichas.forEach((li, i) => {
    tl.fromTo(
      li,
      { y: () => esquinaY(i) + 30, autoAlpha: 0 },
      { y: () => esquinaY(i), autoAlpha: 1, duration: 0.35, ease: "power2.out", ...sinRender },
      T.fichasEntran.desde + i * T.fichasEntran.cada,
    );
  });

  // ── 2. La carta sale del sobre hasta el centro de lectura (lineal: es el
  //    scroll el que la saca) y tapa el título, que se apaga a su paso.
  //    Las fichas derivan un poco mientras tanto.
  tl.fromTo(
    carta,
    { y: 0 },
    { y: yLectura, duration: T.cartaSube.hasta - T.cartaSube.desde, ...sinRender },
    T.cartaSube.desde,
  );
  tl.to(
    tituloLuz,
    { autoAlpha: 0, duration: T.tituloSeVa.hasta - T.tituloSeVa.desde },
    T.tituloSeVa.desde,
  );
  fichas.forEach((li, i) => {
    tl.fromTo(
      li,
      { y: () => esquinaY(i) },
      {
        y: () => esquinaY(i) + ESQUINA.deriva,
        duration: T.fichasViajan.desde - T.cartaSube.desde,
        ...sinRender,
      },
      T.cartaSube.desde,
    );
  });

  // ── 3. La carta se va por arriba, el sobre se hunde y las fichas viajan
  //    de las esquinas a la grilla.
  tl.fromTo(
    carta,
    { y: yLectura },
    { y: ySalida, duration: T.cartaSale.hasta - T.cartaSale.desde, ...sinRender },
    T.cartaSale.desde,
  );
  tl.fromTo(
    sobre,
    { y: 0 },
    { y: hundidoSobre, duration: T.sobreSale.hasta - T.sobreSale.desde, ease: "power1.in", ...sinRender },
    T.sobreSale.desde,
  );
  fichas.forEach((li, i) => {
    tl.fromTo(
      li,
      {
        x: () => esquinaX(i),
        y: () => esquinaY(i) + ESQUINA.deriva,
        rotation: ESQUINA.giros[i],
        scale: ESQUINA.escala,
      },
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: T.fichasViajan.dura,
        ease: "power2.inOut",
        ...sinRender,
      },
      T.fichasViajan.desde + i * T.fichasViajan.cada,
    );
  });

  // ── 4. Las fichas se abren y sus figuras se forman.
  textos.forEach((texto, i) => {
    tl.fromTo(
      texto,
      { gridTemplateRows: "0fr" },
      { gridTemplateRows: "1fr", duration: T.fichasAbren.dura, ease: "power2.out", ...sinRender },
      T.fichasAbren.desde + i * T.fichasAbren.cada,
    );
  });
  estampas.forEach(({ figura, puntos, aristas }, k) => {
    const inicio = T.figurasForman.desde + k * T.figurasForman.cada;
    puntos.forEach((c, i) => {
      tl.fromTo(
        c,
        { attr: { cx: DISPERSION[i][0], cy: DISPERSION[i][1], r: PUNTOS[i].r * RADIO_ESTAMPA * SUELTO } },
        {
          attr: { cx: figura.puntos[i][0], cy: figura.puntos[i][1], r: PUNTOS[i].r * RADIO_ESTAMPA },
          duration: T.figurasForman.dura * 0.7,
          ease: "power3.out",
          ...sinRender,
        },
        inicio + i * 0.012,
      );
    });
    aristas.forEach((l, j) => {
      const largo = largoArista(figura, j);
      tl.fromTo(
        l,
        { strokeDashoffset: largo },
        { strokeDashoffset: 0, duration: T.figurasForman.dura * 0.5, ease: "power2.out", ...sinRender },
        inicio + T.figurasForman.dura * 0.45 + j * 0.02,
      );
    });
  });

  // Respiro final antes de soltar el pin (fija el largo total del timeline).
  tl.to({}, { duration: 0.01 }, T.fin - 0.01);

  return tl;
}
