"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

/**
 * Coreografía del archivo de casos — v2 (transiciones contra el LUGAR).
 * Cada función construye UNA timeline y la registra vía `registrar` (el
 * orquestador la mata al desmontar). Principios acordados:
 *
 * APERTURA (~2.6s, ceremonial): una sola timeline — el expediente monta
 * oculto desde el click, así EL LUGAR EMPIEZA A EXISTIR MIENTRAS LA
 * CARPETA VIAJA (rótulo y título display entran en paralelo al viaje;
 * nunca más una banda flotando en vacío gris). La física de la carpeta
 * (press → viaje → tapa que pivota → hoja que emerge y hace morph) es la
 * firma propia y se conserva.
 *
 * CIERRE (~1s, eficiente): mismo vocabulario comprimido — sin ceremonia.
 * La carpeta baja HACIA la posición real de su banda (medida) mientras el
 * archivo se re-apila solapado; la pestaña de la banda pulsa el tinte al
 * final (sin movimiento: regla de motion).
 *
 * SWITCH (~1.3s): patrón de la referencia — la banda «SIGUIENTE
 * EXPEDIENTE» (que ya está en pantalla con su color) SUBE y se convierte
 * en la carcasa del caso nuevo. Como el remount destruye el DOM viejo, la
 * banda viaja como GHOST clonado en el body y aterriza en la geometría
 * medida del shell nuevo. Desde pestañas/selector (sin banda a la vista)
 * la carcasa nueva sube desde el borde inferior, como otra carpeta del
 * cajón.
 */

type Registrar = <T extends gsap.core.Animation>(anim: T) => T;

const q = (raiz: HTMLElement, sel: string) =>
  raiz.querySelector<HTMLElement>(sel);

/* ────────────────────────────────────────────────────────────────────────
 * APERTURA — «sacar el expediente del cajón»
 * ──────────────────────────────────────────────────────────────────────── */
export function aperturaLugar(opts: {
  registrar: Registrar;
  li: HTMLElement;
  otrasArriba: HTMLElement[];
  otrasAbajo: HTMLElement[];
  introEls: HTMLElement[];
  shell: HTMLElement;
  hoja: HTMLElement;
  lugar: HTMLElement;
  onFin: () => void;
}) {
  const {
    registrar,
    li,
    otrasArriba,
    otrasAbajo,
    introEls,
    shell,
    hoja,
    lugar,
    onFin,
  } = opts;
  const cuerpo = q(li, "[data-carpeta-cuerpo]");
  const front = q(li, "[data-carpeta-front]");
  const back = q(li, "[data-carpeta-back]");
  const sheet = q(li, "[data-carpeta-sheet]");
  const clip = q(li, "[data-carpeta-clip]");
  const sliver = q(li, "[data-carpeta-sliver]");
  const rotulosCarpeta = li.querySelectorAll<HTMLElement>("[data-carpeta-rotulos]");
  const entradaLugar = lugar.querySelectorAll<HTMLElement>(
    "[data-exp-entrada],[data-exp-tab-lateral]",
  );
  if (!cuerpo || !front || !back || !sheet || !clip || !sliver || !rotulosCarpeta.length) {
    gsap.set(shell, { autoAlpha: 1 });
    gsap.set(entradaLugar, { autoAlpha: 1 });
    onFin();
    return null;
  }

  const rotuloLugar = q(lugar, "[data-exp-rotulo]");
  const titulo = q(lugar, "[data-exp-titulo]");
  const ficha = q(lugar, "[data-exp-ficha]");
  const banda = q(lugar, "[data-exp-banda]");
  const tabsLaterales = lugar.querySelectorAll<HTMLElement>("[data-exp-tab-lateral]");
  const partesCarpeta = li.querySelectorAll<HTMLElement>(
    "[data-carpeta-back],[data-carpeta-front],[data-carpeta-tab],[data-carpeta-sliver],[data-carpeta-sliver2],[data-carpeta-papel]",
  );

  /* — PRE-PAINT: el lugar monta invisible POR PIEZAS (cada una tiene su
     beat; el header queda visible como contenedor de rótulo/título/ficha,
     que arrancan ocultos individualmente). Corre en el mismo layout effect
     del montaje: nada llega a pintarse. — */
  gsap.set(shell, { autoAlpha: 0 });
  gsap.set(hoja, { autoAlpha: 0 });
  if (banda) gsap.set(banda, { autoAlpha: 0 });
  if (tabsLaterales.length) gsap.set(tabsLaterales, { autoAlpha: 0 });
  if (rotuloLugar) gsap.set(rotuloLugar, { autoAlpha: 0, y: 14 });
  if (ficha) gsap.set(ficha, { autoAlpha: 0, y: 12 });
  // Título display por líneas enmascaradas (mismo recurso que RevealLines);
  // si SplitText no puede (fuente no lista, etc.), cae a bloque completo.
  let split: SplitText | null = null;
  let lineas: HTMLElement[] = [];
  if (titulo) {
    try {
      split = SplitText.create(titulo, { type: "lines", mask: "lines" });
      lineas = split.lines as HTMLElement[];
      gsap.set(lineas, { yPercent: 115 });
    } catch {
      gsap.set(titulo, { autoAlpha: 0, y: 20 });
    }
  }

  /* — Geometría del viaje — */
  const vh = window.innerHeight;
  const rLi = li.getBoundingClientRect();
  const alturaEscenario = Math.min(vh * 0.52, 540);
  const yViaje = vh * 0.4 - rLi.top;

  gsap.set(li, { height: li.offsetHeight, zIndex: 60 });
  gsap.set(front, { height: front.offsetHeight });
  // Congelar la capa CSS de hover (transition-transform vs GSAP) — ver
  // memoria del proyecto: cada write re-dispararía la transición.
  const translateHover = getComputedStyle(cuerpo).translate;
  const tab = q(li, "[data-carpeta-tab]");
  gsap.set([cuerpo, sliver, tab].filter(Boolean), { transition: "none" });
  if (translateHover && translateHover !== "none") {
    gsap.set(cuerpo, { translate: translateHover });
  }
  const expansion = q(li, "[data-carpeta-expansion]");
  if (expansion) {
    gsap.set(expansion, {
      gridTemplateRows: getComputedStyle(expansion).gridTemplateRows,
      transition: "none",
    });
  }

  const tl = gsap.timeline();

  // A — press: respuesta física inmediata.
  tl.to(li, { y: 4, duration: 0.09, ease: "power1.out" })
    .to(li, { y: -10, duration: 0.22, ease: "power2.out" }, 0.09);

  // B — el archivo cede: corto y sutil (se apaga, no "se va de viaje").
  if (introEls.length) {
    tl.to(introEls, { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, 0.1);
  }
  if (otrasArriba.length) {
    tl.to(
      otrasArriba,
      { autoAlpha: 0, y: -40, duration: 0.32, ease: "power2.in", stagger: 0.04 },
      0.12,
    );
  }
  if (otrasAbajo.length) {
    tl.to(
      otrasAbajo,
      { autoAlpha: 0, y: 56, duration: 0.32, ease: "power2.in", stagger: 0.04 },
      0.12,
    );
  }

  // C — el viaje… y EL LUGAR NACE EN PARALELO: rótulo primero, después el
  // título revelándose línea por línea. Cuando la tapa empiece a pivotar,
  // el lugar ya recibió a la carpeta.
  tl.to(li, { y: yViaje, duration: 0.75, ease: "power3.inOut" }, 0.26)
    .to(li, { rotate: -1.1, duration: 0.4, ease: "power2.out" }, 0.26)
    .to(li, { rotate: 0, duration: 0.35, ease: "power2.inOut" }, 0.66)
    .to(front, { height: alturaEscenario, duration: 0.75, ease: "power3.inOut" }, 0.26)
    .to(rotulosCarpeta, { autoAlpha: 0, duration: 0.28, ease: "power1.out" }, 0.34);
  if (rotuloLugar) {
    tl.to(rotuloLugar, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.34);
  }
  if (lineas.length) {
    tl.to(
      lineas,
      { yPercent: 0, duration: 0.68, ease: "power3.out", stagger: 0.09 },
      0.5,
    );
  } else if (titulo) {
    tl.to(titulo, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.5);
  }

  // D — apertura física LATERAL: la tapa pivota desde el lomo izquierdo.
  const sombraTapa = q(li, "[data-carpeta-front-sombra]");
  const sliver2 = q(li, "[data-carpeta-sliver2]");
  tl.set(li, { perspective: 1200, perspectiveOrigin: "38% 50%" }, 0.88)
    .set(sheet, { autoAlpha: 1 }, 0.88)
    .to(
      front,
      { rotateY: -76, duration: 0.58, ease: "power2.inOut", transformOrigin: "0% 50%" },
      0.92,
    )
    .to(li, { x: 26, rotate: 0.6, duration: 0.58, ease: "power2.inOut" }, 0.92)
    .to(li, { rotate: 0, duration: 0.25, ease: "power2.out" }, 1.42)
    .to(
      back,
      { rotateY: 2.5, duration: 0.58, ease: "power2.inOut", transformOrigin: "0% 50%" },
      0.92,
    )
    .to([sliver, sliver2].filter(Boolean), { autoAlpha: 0, duration: 0.2 }, 0.98);
  if (sombraTapa) {
    tl.to(sombraTapa, { opacity: 0.22, duration: 0.42, ease: "power1.in" }, 0.95);
  }

  // E — la hoja emerge Y ATERRIZA en un solo gesto: morph medido en el
  // momento (la geometría del li ya está quieta: x y rotate asentados).
  tl.add(() => {
    gsap.set(clip, { overflow: "visible" });
    const rSheet = sheet.getBoundingClientRect();
    const rHoja = hoja.getBoundingClientRect();
    registrar(
      gsap
        .timeline()
        .to(
          sheet,
          {
            x: `+=${rHoja.left - rSheet.left}`,
            y: `+=${rHoja.top - rSheet.top}`,
            width: rHoja.width,
            height: Math.min(rHoja.height, vh * 0.92),
            duration: 0.78,
            ease: "power3.inOut",
          },
          0,
        )
        // Deriva de rotación propia del gesto (propiedad aparte: no pelea
        // con el tween de posición).
        .to(sheet, { rotate: -2, duration: 0.32, ease: "power2.out" }, 0)
        .to(sheet, { rotate: 0, duration: 0.38, ease: "power2.inOut" }, 0.34),
    );
  }, 1.68);

  // F — la carpeta-objeto recede y el lugar se instala alrededor de la
  // hoja: cartón, ficha, pestañas y banda, en cascada corta.
  tl.to(
    partesCarpeta,
    { autoAlpha: 0, y: "+=70", duration: 0.45, ease: "power2.in" },
    1.78,
  ).fromTo(
    shell,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.4, ease: "power1.inOut" },
    2.05,
  );
  tl.fromTo(
    hoja,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.26, ease: "power1.out" },
    2.2,
  );
  tl.to(sheet, { autoAlpha: 0, duration: 0.22, ease: "power1.out" }, 2.42);
  if (ficha) {
    tl.to(ficha, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 2.1);
  }
  if (tabsLaterales.length) {
    tl.fromTo(
      tabsLaterales,
      { x: 24, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out", stagger: 0.07 },
      2.25,
    );
  }
  if (banda) {
    tl.fromTo(
      banda,
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
      2.3,
    );
  }

  // Limpieza del split (devuelve el h3 a su DOM original) y fin.
  tl.add(() => {
    split?.revert();
  }, 2.58);
  tl.add(onFin, 2.62);
  return registrar(tl);
}

/* ────────────────────────────────────────────────────────────────────────
 * CIERRE — «devolver el expediente» (vocabulario comprimido, sin ceremonia)
 * ──────────────────────────────────────────────────────────────────────── */
export function transicionCierre(opts: {
  registrar: Registrar;
  shell: HTMLElement;
  items: HTMLElement[];
  introEls: HTMLElement[];
  /** Capa del lugar: sus piezas fuera del shell se apagan primero. */
  lugar?: HTMLElement;
  /** Banda del archivo a la que "vuelve" la carpeta: dirige la caída y
   *  recibe el pulso de tinte final. */
  liDestino?: HTMLElement | null;
  onFin: () => void;
}) {
  const { registrar, shell, items, introEls, lugar, liDestino, onFin } = opts;
  const tl = gsap.timeline();

  // 1 — el lugar se apaga primero: queda solo la carpeta-objeto.
  if (lugar) {
    const piezasLugar = [
      ...lugar.querySelectorAll<HTMLElement>(
        "[data-exp-entrada],[data-exp-tab-lateral]",
      ),
    ].filter((el) => !shell.contains(el));
    if (piezasLugar.length) {
      tl.to(piezasLugar, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0);
    }
  }

  // 2 — la carpeta se devuelve: baja HACIA la posición real de su banda
  // (medida en el momento), encogiéndose apenas. Dirección con sentido,
  // no una caída a ciegas.
  tl.add(() => {
    const rShell = shell.getBoundingClientRect();
    let deltaY = 110;
    if (liDestino) {
      const rLi = liDestino.getBoundingClientRect();
      deltaY = Math.max(40, Math.min(rLi.top - rShell.top, 220));
    }
    registrar(
      gsap.to(shell, {
        y: `+=${deltaY}`,
        scale: 0.96,
        rotate: -1.2,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.in",
        transformOrigin: "50% 15%",
      }),
    );
  }, 0.1);

  // 3 — el archivo la recibe: re-apilado desde abajo, SOLAPADO con la
  // caída (no después), con el intro reapareciendo encima.
  tl.fromTo(
    [...items].reverse(),
    { autoAlpha: 0, y: 64 },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 },
    0.22,
  );
  if (introEls.length) {
    tl.fromTo(
      introEls,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
      0.38,
    );
  }

  // Estado limpio + pulso de tinte en la pestaña de la banda que estuvo
  // abierta («acá estabas») — brillo, nunca movimiento.
  tl.set(items, { clearProps: "transform,opacity,visibility" });
  if (introEls.length) {
    tl.set(introEls, { clearProps: "transform,opacity,visibility" });
  }
  if (liDestino) {
    const tabDestino = q(liDestino, "[data-carpeta-tab]");
    if (tabDestino) {
      tl.fromTo(
        tabDestino,
        { filter: "brightness(1.45)" },
        {
          filter: "brightness(1)",
          duration: 0.55,
          ease: "power2.out",
          clearProps: "filter",
        },
        0.88,
      );
    }
  }
  tl.add(onFin, 1.0);
  return registrar(tl);
}

/* ────────────────────────────────────────────────────────────────────────
 * SWITCH — «la banda sube y se convierte en el lugar»
 * ──────────────────────────────────────────────────────────────────────── */

/** Salida del caso actual. Si viene de la banda «SIGUIENTE EXPEDIENTE»,
 *  clona la banda como GHOST fijo en el body (sobrevive al remount) y la
 *  hace subir; devuelve el ghost para que la entrada lo aterrice. */
export function switchSalida(opts: {
  registrar: Registrar;
  lugar: HTMLElement;
  shell: HTMLElement;
  desdeBanda: boolean;
  onListo: () => void;
}): HTMLElement | null {
  const { registrar, lugar, shell, desdeBanda, onListo } = opts;
  const piezas = [
    shell,
    ...[
      ...lugar.querySelectorAll<HTMLElement>(
        "[data-exp-entrada],[data-exp-tab-lateral]",
      ),
    ].filter((el) => !shell.contains(el)),
  ];

  let ghost: HTMLElement | null = null;
  const vh = window.innerHeight;
  const tl = gsap.timeline();

  if (desdeBanda) {
    const obj = q(lugar, "[data-exp-banda-obj]");
    if (obj) {
      const r = obj.getBoundingClientRect();
      ghost = obj.cloneNode(true) as HTMLElement;
      ghost.setAttribute("data-exp-ghost", "");
      ghost.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:80;pointer-events:none;`;
      document.body.appendChild(ghost);
      gsap.set(obj, { autoAlpha: 0 });
      // El contenido de la banda se retira; queda el CARTÓN de color puro
      // viajando hacia su lugar de carcasa.
      const contenido = ghost.querySelectorAll<HTMLElement>(":scope > *");
      if (contenido.length) {
        tl.to(contenido, { autoAlpha: 0, duration: 0.22, ease: "power1.in" }, 0.06);
      }
      tl.to(
        ghost,
        { y: vh * 0.3 - r.top, duration: 0.6, ease: "power3.inOut" },
        0.05,
      );
    }
  }

  if (ghost) {
    // Con banda: el resto del lugar se archiva hacia arriba mientras el
    // cartón de la banda sube a convertirse en la carcasa nueva.
    tl.to(
      piezas,
      { y: -60, autoAlpha: 0, duration: 0.4, ease: "power2.in", stagger: 0.02 },
      0,
    );
  } else {
    // Sin banda (pestañas/selector): MINI-CIERRE — la carpeta actual se
    // devuelve rápido hacia abajo y el resto del lugar se apaga.
    const piezasSinShell = piezas.filter((el) => el !== shell);
    if (piezasSinShell.length) {
      tl.to(
        piezasSinShell,
        { y: -30, autoAlpha: 0, duration: 0.3, ease: "power2.in" },
        0,
      );
    }
    tl.to(
      shell,
      {
        y: 90,
        rotate: -1.2,
        scale: 0.97,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        transformOrigin: "50% 15%",
      },
      0.05,
    );
  }
  tl.add(onListo, ghost ? 0.55 : 0.48);
  registrar(tl);
  return ghost;
}

/** Entrada del caso nuevo — MINI-APERTURA narrada: la carcasa llega VACÍA
 *  (aterrizando el ghost de la banda, o subiendo del cajón), la hoja
 *  blanca emerge desde adentro, el título se revela por líneas y el cartón
 *  y las piezas del lugar entran en cascada corta. La gramática de la
 *  apertura, en miniatura — nunca más un expediente que "solo aparece". */
export function switchEntrada(opts: {
  registrar: Registrar;
  lugar: HTMLElement;
  shell: HTMLElement;
  ghost?: HTMLElement | null;
  onFin: () => void;
}) {
  const { registrar, lugar, shell, ghost, onFin } = opts;
  const hoja = q(lugar, "[data-exp-hoja]");
  const carton = q(lugar, "[data-exp-carton]");
  const header = q(lugar, "[data-exp-header]");
  const rotulo = q(lugar, "[data-exp-rotulo]");
  const titulo = q(lugar, "[data-exp-titulo]");
  const ficha = q(lugar, "[data-exp-ficha]");
  const banda = q(lugar, "[data-exp-banda]");
  const tabsLaterales = lugar.querySelectorAll<HTMLElement>("[data-exp-tab-lateral]");

  // Pre-paint fino sobre el pre-paint genérico del orquestador: la carcasa
  // llega vacía (cartón oculto) y el header revela por partes.
  if (carton) gsap.set(carton, { autoAlpha: 0 });
  if (header) gsap.set(header, { autoAlpha: 1 });
  if (rotulo) gsap.set(rotulo, { autoAlpha: 0, y: 12 });
  if (ficha) gsap.set(ficha, { autoAlpha: 0, y: 10 });
  let split: SplitText | null = null;
  let lineas: HTMLElement[] = [];
  if (titulo) {
    try {
      split = SplitText.create(titulo, { type: "lines", mask: "lines" });
      lineas = split.lines as HTMLElement[];
      gsap.set(lineas, { yPercent: 115 });
    } catch {
      gsap.set(titulo, { autoAlpha: 0, y: 16 });
    }
  }

  const tl = gsap.timeline();
  if (ghost) {
    const rGhost = ghost.getBoundingClientRect();
    const rShell = shell.getBoundingClientRect();
    tl.to(
      ghost,
      { y: `+=${rShell.top - rGhost.top}`, duration: 0.4, ease: "power2.inOut" },
      0,
    )
      .fromTo(
        shell,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power1.inOut" },
        0.2,
      )
      .to(ghost, { autoAlpha: 0, duration: 0.26, ease: "power1.out" }, 0.4)
      .add(() => ghost.remove(), 0.7);
  } else {
    tl.fromTo(
      shell,
      { y: 140, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
      0,
    );
  }

  // La hoja emerge desde adentro de la carcasa recién asentada.
  const tHoja = ghost ? 0.48 : 0.4;
  if (hoja) {
    tl.fromTo(
      hoja,
      { autoAlpha: 0, y: 34 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
      tHoja,
    );
  }
  // El título se revela por líneas mientras la hoja se asienta.
  if (rotulo) {
    tl.to(rotulo, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, tHoja);
  }
  if (lineas.length) {
    tl.to(
      lineas,
      { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 },
      tHoja + 0.05,
    );
  } else if (titulo) {
    tl.to(titulo, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, tHoja + 0.05);
  }
  if (ficha) {
    tl.to(ficha, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, tHoja + 0.3);
  }
  // El cartón y las piezas del lugar, en cascada corta.
  if (carton) {
    tl.fromTo(
      carton,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
      tHoja + 0.32,
    );
  }
  if (banda) {
    tl.fromTo(
      banda,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
      tHoja + 0.5,
    );
  }
  if (tabsLaterales.length) {
    tl.fromTo(
      tabsLaterales,
      { x: 24, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out", stagger: 0.07 },
      tHoja + 0.55,
    );
  }
  tl.add(() => {
    split?.revert();
  }, tHoja + 1.1);
  tl.add(onFin, tHoja + 1.15);
  return registrar(tl);
}
