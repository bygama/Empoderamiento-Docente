"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

/**
 * Las transiciones del archivo de casos en pantallas COMPACTAS (táctiles o
 * más angostas que `lg`). Las de escritorio (coreografia.ts) son ceremonia:
 * 2.6 s de carpeta que viaja, pivota y se transforma. En un celular eso es
 * espera, la carpeta tapaba el título que nacía detrás y por abajo asomaba
 * la sección siguiente (Gastón, 2026-10-02). Acá el mismo relato, corto:
 *
 * - APERTURA (~1.4 s): el telón tapa la página, la carpeta tocada va a su
 *   lugar, la tapa se abre y queda la carcasa; el título entra DESPUÉS.
 * - SIGUIENTE EXPEDIENTE: la banda sube entera y su pregunta viaja hasta
 *   donde va el título, que la releva. Antes subía un rectángulo vacío.
 *
 * Cada función arma una timeline y la registra; el orquestador la mata al
 * desmontar, como en coreografia.ts.
 */

type Registrar = <T extends gsap.core.Animation>(anim: T) => T;

const q = (raiz: ParentNode, sel: string) => raiz.querySelector<HTMLElement>(sel);

/** Táctil o bajo `lg`: ahí corren estas transiciones y no las de escritorio. */
export const esCompacto = () => window.matchMedia("(hover: none), (max-width: 63.999rem)").matches;

/** Esconde las piezas de la cabecera y devuelve cómo revelarlas: el botón de
 *  copiar, el título por líneas (o entero, si SplitText no puede) y la ficha. */
function prepararCabecera(lugar: HTMLElement, conLineas: boolean) {
  const rotulo = q(lugar, "[data-exp-rotulo]");
  const titulo = q(lugar, "[data-exp-titulo]");
  const ficha = q(lugar, "[data-exp-ficha]");
  if (rotulo) gsap.set(rotulo, { autoAlpha: 0, y: 10 });
  if (ficha) gsap.set(ficha, { autoAlpha: 0, y: 10 });
  let split: SplitText | null = null;
  let lineas: HTMLElement[] = [];
  if (titulo && conLineas) {
    try {
      split = SplitText.create(titulo, { type: "lines", mask: "lines" });
      lineas = split.lines as HTMLElement[];
      gsap.set(lineas, { yPercent: 115 });
    } catch {
      gsap.set(titulo, { autoAlpha: 0, y: 16 });
    }
  } else if (titulo) {
    gsap.set(titulo, { autoAlpha: 0, y: 16 });
  }
  return {
    titulo,
    revelar: (tl: gsap.core.Timeline, t: number) => {
      if (rotulo) tl.to(rotulo, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      if (lineas.length) tl.to(lineas, { yPercent: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 }, t + 0.04);
      else if (titulo) tl.to(titulo, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, t + 0.04);
      if (ficha) tl.to(ficha, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, t + 0.28);
      tl.add(() => split?.revert(), t + 0.95);
    },
  };
}

/** El resto del lugar, en cascada corta: hoja, cartón, pestañas y banda. */
function instalar(tl: gsap.core.Timeline, lugar: HTMLElement, t: number) {
  const hoja = q(lugar, "[data-exp-hoja]");
  const carton = q(lugar, "[data-exp-carton]");
  const banda = q(lugar, "[data-exp-banda]");
  const tabs = lugar.querySelectorAll<HTMLElement>("[data-exp-tab-lateral]");
  if (hoja) tl.fromTo(hoja, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, t);
  if (carton) tl.fromTo(carton, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, t + 0.2);
  if (tabs.length) tl.fromTo(tabs, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 0.3);
  if (banda) tl.fromTo(banda, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, t + 0.35);
}

/* ── APERTURA ─────────────────────────────────────────────────────────── */
export function aperturaCompacta(opts: {
  registrar: Registrar;
  li: HTMLElement;
  otrasArriba: HTMLElement[];
  otrasAbajo: HTMLElement[];
  introEls: HTMLElement[];
  shell: HTMLElement;
  lugar: HTMLElement;
  onFin: () => void;
}) {
  const { registrar, li, otrasArriba, otrasAbajo, introEls, shell, lugar, onFin } = opts;
  const cuerpo = q(li, "[data-carpeta-cuerpo]");
  const front = q(li, "[data-carpeta-front]");
  if (!cuerpo || !front) {
    gsap.set(shell, { autoAlpha: 1 });
    onFin();
    return null;
  }

  // ── Pre-paint: el lugar monta invisible por piezas.
  gsap.set(shell, { autoAlpha: 0 });
  gsap.set(lugar.querySelectorAll("[data-exp-hoja],[data-exp-carton],[data-exp-banda],[data-exp-tab-lateral]"), { autoAlpha: 0 });
  const cabecera = prepararCabecera(lugar, true);
  gsap.set(li, { zIndex: 60, perspective: 900 });
  gsap.set([cuerpo, front, ...li.querySelectorAll<HTMLElement>("[data-carpeta-back],[data-carpeta-tab]")], { transition: "none" });

  // El telón: el fondo del lugar pasa de transparente a opaco, así lo que
  // queda detrás (el resto de la pila, la sección de abajo) se apaga con él.
  // La carpeta tocada va por encima (z 60 contra el 50 del lugar).
  const fondo = getComputedStyle(lugar.closest("section") ?? document.body).backgroundColor;
  const claro = /^rgb\(/.test(fondo) ? fondo.replace("rgb(", "rgba(").replace(")", ", 0)") : null;

  const rCuerpo = cuerpo.getBoundingClientRect();
  const rShell = shell.getBoundingClientRect();
  const tl = gsap.timeline();

  tl.to(li, { scale: 0.985, duration: 0.08, ease: "power1.out" }).to(li, { scale: 1, duration: 0.18, ease: "power2.out" }, 0.08);
  if (claro) tl.fromTo(lugar, { backgroundColor: claro }, { backgroundColor: fondo, duration: 0.3, ease: "power1.out" }, 0.02);
  else tl.set(lugar, { backgroundColor: fondo }, 0.28);
  if (introEls.length) tl.to(introEls, { autoAlpha: 0, y: -10, duration: 0.24, ease: "power2.in" }, 0.04);
  if (otrasArriba.length) tl.to(otrasArriba, { autoAlpha: 0, y: -30, duration: 0.26, ease: "power2.in", stagger: 0.03 }, 0.04);
  if (otrasAbajo.length) tl.to(otrasAbajo, { autoAlpha: 0, y: 48, duration: 0.26, ease: "power2.in", stagger: 0.03 }, 0.04);

  // La carpeta va a donde va a quedar la carcasa del expediente.
  tl.to(
    li,
    { x: rShell.left - rCuerpo.left, y: rShell.top - rCuerpo.top, duration: 0.55, ease: "power3.inOut" },
    0.12,
  );
  tl.to(li.querySelectorAll("[data-carpeta-rotulos]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 0.2);

  // La pestaña viaja con la carpeta, pero hasta donde la carcasa tiene la
  // suya (a la derecha). Sin esto, al aparecer la carcasa se veían dos
  // pestañas con el mismo «Caso 0N» mientras la de la carpeta se apagaba.
  const tab = q(li, "[data-carpeta-tab]");
  const pestana = q(shell, "[data-exp-pestana]");
  const rTab = tab?.getBoundingClientRect();
  const rPestana = pestana?.getBoundingClientRect();
  if (tab && rTab && rPestana && rPestana.width > 0) {
    tl.to(
      tab,
      {
        x: rPestana.left - rTab.left - (rShell.left - rCuerpo.left),
        y: rPestana.top - rTab.top - (rShell.top - rCuerpo.top),
        duration: 0.55,
        ease: "power3.inOut",
      },
      0.12,
    );
    tl.set(tab, { clearProps: "transform" }, 1.1);
  }

  // Llega, y la tapa se abre: debajo ya está la carcasa, del mismo color.
  tl.set(shell, { autoAlpha: 1 }, 0.64);
  tl.to(front, { rotateX: -72, autoAlpha: 0, duration: 0.32, ease: "power2.in", transformOrigin: "50% 0%" }, 0.64);
  tl.to(li, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 0.84);

  // Recién ahora el título, y el lugar se instala.
  cabecera.revelar(tl, 0.74);
  instalar(tl, lugar, 0.8);

  tl.add(() => {
    onFin();
    // El fondo en línea se suelta cuando el estado «abierto» ya pintó el
    // telón por clase: si se soltara antes habría un cuadro transparente.
    requestAnimationFrame(() => requestAnimationFrame(() => gsap.set(lugar, { clearProps: "backgroundColor" })));
  }, 1.75);
  return registrar(tl);
}

/* ── SIGUIENTE EXPEDIENTE: la salida ──────────────────────────────────── */
/** Clona la banda ENTERA (solapa, cartón y pregunta) como fantasma fijo en el
 *  body, que sobrevive al remount, y apaga el resto. Devuelve el fantasma, o
 *  null si no hay banda (ahí corre la salida de escritorio). */
export function salidaCompacta(opts: {
  registrar: Registrar;
  lugar: HTMLElement;
  shell: HTMLElement;
  onListo: () => void;
}): HTMLElement | null {
  const { registrar, lugar, shell, onListo } = opts;
  const boton = q(lugar, "[data-exp-banda] button");
  if (!boton || !q(boton, "[data-banda-pregunta]")) return null;

  const r = boton.getBoundingClientRect();
  const ghost = boton.cloneNode(true) as HTMLElement;
  ghost.setAttribute("data-exp-ghost", "compacto");
  ghost.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;margin:0;z-index:80;pointer-events:none;`;
  document.body.appendChild(ghost);
  gsap.set(boton, { autoAlpha: 0 });

  const piezas = [
    shell,
    ...[...lugar.querySelectorAll<HTMLElement>("[data-exp-entrada],[data-exp-tab-lateral]")].filter(
      (el) => !shell.contains(el) && !el.contains(boton),
    ),
  ];
  const tl = gsap.timeline();
  // Del fantasma queda la pregunta; «siguiente expediente» y «abrir» ya cumplieron.
  tl.to(ghost.querySelectorAll("[data-banda-resto]"), { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0);
  tl.to(piezas, { y: -40, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
  tl.add(onListo, 0.32);
  registrar(tl);
  return ghost;
}

/* ── SIGUIENTE EXPEDIENTE: la entrada ─────────────────────────────────── */
/** El fantasma de la banda sube hasta la carcasa nueva, y su pregunta viaja
 *  —creciendo— hasta donde va el título, que la releva línea por línea. */
export function entradaCompactaDesdeBanda(opts: {
  registrar: Registrar;
  lugar: HTMLElement;
  shell: HTMLElement;
  ghost: HTMLElement;
  onFin: () => void;
}) {
  const { registrar, lugar, shell, ghost, onFin } = opts;
  const header = q(lugar, "[data-exp-header]");
  if (header) gsap.set(header, { autoAlpha: 1 });
  const cabecera = prepararCabecera(lugar, true);
  const obj = q(ghost, "[data-exp-banda-obj]") ?? ghost;
  const pregunta = q(ghost, "[data-banda-pregunta]");

  const rObj = obj.getBoundingClientRect();
  const rShell = shell.getBoundingClientRect();
  const dx = rShell.left - rObj.left;
  const dy = rShell.top - rObj.top;
  const VUELO = { duration: 0.6, ease: "power3.inOut" } as const;
  const tl = gsap.timeline();

  tl.to(ghost, { x: dx, y: dy, ...VUELO }, 0);
  if (pregunta && cabecera.titulo) {
    const rPreg = pregunta.getBoundingClientRect();
    const rTit = cabecera.titulo.getBoundingClientRect();
    const cuerpoTit = parseFloat(getComputedStyle(cabecera.titulo).fontSize);
    const cuerpoPreg = parseFloat(getComputedStyle(pregunta).fontSize) || cuerpoTit;
    // Crece hacia el cuerpo del título, sin pasarse del ancho de pantalla.
    const escala = Math.min(cuerpoTit / cuerpoPreg, (window.innerWidth - rTit.left * 2) / rPreg.width);
    tl.to(
      pregunta,
      {
        x: rTit.left - rPreg.left - dx,
        y: rTit.top - rPreg.top - dy,
        scale: Math.max(1, escala),
        color: getComputedStyle(cabecera.titulo).color,
        transformOrigin: "0% 0%",
        ...VUELO,
      },
      0,
    );
    // El relevo: la pregunta se apaga en el tramo final mientras el título
    // de verdad se revela en el mismo lugar.
    tl.to(pregunta, { autoAlpha: 0, duration: 0.22, ease: "power1.in" }, 0.42);
  }
  tl.fromTo(shell, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power1.inOut" }, 0.4);
  tl.to(ghost, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 0.62).add(() => ghost.remove(), 0.85);

  cabecera.revelar(tl, 0.44);
  instalar(tl, lugar, 0.62);
  tl.add(onFin, 1.6);
  return registrar(tl);
}
