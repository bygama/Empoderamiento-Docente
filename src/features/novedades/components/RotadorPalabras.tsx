"use client";

import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

// Ruido en minúsculas: las palabras del rotador van en minúscula y los glifos
// mayúsculos de SplitFlap desentonan a tamaño display. Puntuación aparte para
// que el punto final gire entre signos y no entre letras.
const GLIFOS_LETRA = "abcdefghijklmnñopqrstuvwxyz";
const GLIFOS_PUNTO = "·:;,'";

const CELL_H = "1.06em";
// Filas de ruido del frenado (entrada) y del despegue (salida).
const RUIDO_ENTRADA = 10;
const RUIDO_SALIDA = 5;

function filaRuido(glifos: string): HTMLSpanElement {
  const s = document.createElement("span");
  // overflow-hidden POR FILA: el ruido es minúsculas y las colas de p/g/j/q/y
  // desbordan la caja de 1.06em — sin este recorte, la fila vecina asoma sus
  // descendentes dentro de la celda ("pedacitos" de letra).
  s.className = "block overflow-hidden text-center";
  s.style.height = CELL_H;
  s.style.lineHeight = CELL_H;
  s.textContent = glifos[Math.floor(Math.random() * glifos.length)];
  return s;
}

function fragmentoRuido(cantidad: number, finalChar: string): DocumentFragment {
  const glifos = GLIFOS_PUNTO.includes(finalChar) ? GLIFOS_PUNTO : GLIFOS_LETRA;
  const frag = document.createDocumentFragment();
  for (let k = 0; k < cantidad; k++) frag.appendChild(filaRuido(glifos));
  return frag;
}

// getBoundingClientRect por el mismo motivo que en SplitFlap: offsetHeight
// redondea a px enteros y desalinea el frenado.
function altoFila(finalSpan: HTMLElement, cell: HTMLElement): number {
  return (
    finalSpan.getBoundingClientRect().height ||
    cell.getBoundingClientRect().height
  );
}

function limpiarBobina(cell: HTMLElement) {
  const reel = cell.querySelector<HTMLElement>("[data-reel]");
  if (!reel) return;
  Array.from(reel.children).forEach((child) => {
    if (!(child as HTMLElement).hasAttribute("data-final")) child.remove();
  });
  gsap.set(reel, { clearProps: "transform,willChange" });
  delete reel.dataset.built;
  delete reel.dataset.saliendo;
}

type Props = {
  /** Palabras del ciclo. La PRIMERA es la que se ve en SSR / reduced-motion. */
  words: readonly string[];
  className?: string;
  style?: CSSProperties;
  /** Retardo (s) antes del primer frenado — para acoplarlo al barrido del faro. */
  settleDelay?: number;
  /** Pausa (ms) con la palabra resuelta antes del próximo giro. */
  holdMs?: number;
};

/**
 * Rotador de palabras split-flap: la mecánica de la bobina de <SplitFlap />
 * pero en LOOP, con la transición en tres tiempos para que nada corte seco:
 *
 *  1. DESPEGUE — la palabra resuelta sale girando hacia el ruido, acelerando
 *     desde quieta (power2.in, todas las celdas juntas: como un tablero real,
 *     los flaps arrancan a la vez).
 *  2. CORTE — con todas las celdas en pleno ruido, `key={idx}` remonta las
 *     celdas de la palabra nueva, que también nacen mostrando ruido (el
 *     layout-effect lo inserta ANTES del paint). Ruido→ruido en movimiento:
 *     el swap es invisible aunque cambien anchos y cantidad de celdas.
 *  3. FRENADO — cada celda gira y frena sobre el carácter real, escalonada
 *     izq→der (power4.out). Al frenar, la celda queda SOLO con el carácter
 *     real en y=0: sin error subpixel ni filas de ruido que asomen tinta.
 *
 * Layout anti-salto: un sizer invisible con la palabra más larga sostiene la
 * línea durante todo el ciclo; cada palabra se centra sobre él. El ciclo se
 * pausa fuera del viewport (IntersectionObserver) y retoma al volver.
 * Accesibilidad: todo el componente es aria-hidden — el padre DEBE proveer el
 * texto estable en un sr-only (sin live region a propósito: anunciar cada
 * giro al lector de pantalla es ruido, no información). Con
 * prefers-reduced-motion queda la primera palabra, quieta.
 */
export function RotadorPalabras({
  words,
  className,
  style,
  settleDelay = 0,
  holdMs = 2200,
}: Props) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const primeraRonda = useRef(true);
  const timerRef = useRef<number | null>(null);
  const enViewportRef = useRef(true);
  const pendienteRef = useRef(false);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  // Pausa/reanudación por viewport — effect propio para no recrear el
  // observer en cada palabra.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        enViewportRef.current = visible;
        if (visible && pendienteRef.current) {
          pendienteRef.current = false;
          setSaliendo(true);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced]);

  // FRENADO: al montar cada palabra, las celdas llegan girando y frenan
  // sobre el carácter real. Corre en layout-effect para insertar el ruido
  // antes del paint (la palabra nueva nunca se ve resuelta de entrada).
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-cell]"));
    if (!cells.length) return;

    const tweens: gsap.core.Tween[] = [];
    const delayInicial = primeraRonda.current ? settleDelay : 0;
    primeraRonda.current = false;
    let resueltas = 0;

    cells.forEach((cell, i) => {
      const reel = cell.querySelector<HTMLElement>("[data-reel]");
      const finalSpan = reel?.querySelector<HTMLElement>("[data-final]");
      if (!reel || !finalSpan || reel.dataset.built) return;
      reel.dataset.built = "1";

      reel.insertBefore(
        fragmentoRuido(RUIDO_ENTRADA, finalSpan.textContent ?? ""),
        finalSpan,
      );
      const cellH = altoFila(finalSpan, cell);
      const n = reel.children.length;
      tweens.push(
        gsap.fromTo(
          reel,
          { y: 0 },
          {
            y: -(n - 1) * cellH,
            duration: 0.9,
            // Stagger corto: tras el despegue las celdas llegan en movimiento
            // y la de más a la derecha no puede quedar congelada esperando.
            delay: delayInicial + i * 0.02,
            ease: "power4.out",
            onComplete: () => {
              // Al frenar, la celda queda SOLO con el carácter real en y=0.
              Array.from(reel.children).forEach((child) => {
                if (!(child as HTMLElement).hasAttribute("data-final")) {
                  child.remove();
                }
              });
              // El hint muere con la bobina: cada ciclo la vuelve a pedir.
              gsap.set(reel, { clearProps: "transform,willChange" });
              resueltas += 1;
              if (resueltas !== cells.length) return;
              timerRef.current = window.setTimeout(() => {
                if (enViewportRef.current) {
                  setSaliendo(true);
                } else {
                  pendienteRef.current = true; // retoma al reentrar al viewport
                }
              }, holdMs);
            },
          },
        ),
      );
    });

    return () => {
      tweens.forEach((t) => t.kill());
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      cells.forEach(limpiarBobina); // StrictMode re-monta efectos
    };
  }, [idx, reduced, holdMs, settleDelay]);

  // DESPEGUE: la palabra resuelta sale girando hacia el ruido (acelera desde
  // quieta) y recién con todo en movimiento se pasa a la palabra siguiente.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || !saliendo) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-cell]"));
    if (!cells.length) return;

    const tweens: gsap.core.Tween[] = [];
    let enRuido = 0;

    cells.forEach((cell) => {
      const reel = cell.querySelector<HTMLElement>("[data-reel]");
      const finalSpan = reel?.querySelector<HTMLElement>("[data-final]");
      if (!reel || !finalSpan || reel.dataset.saliendo) return;
      reel.dataset.saliendo = "1";

      // Ruido DESPUÉS del real: la bobina sigue la misma dirección de giro.
      reel.appendChild(fragmentoRuido(RUIDO_SALIDA, finalSpan.textContent ?? ""));
      const cellH = altoFila(finalSpan, cell);
      tweens.push(
        gsap.fromTo(
          reel,
          { y: 0 },
          {
            y: -RUIDO_SALIDA * cellH,
            duration: 0.42,
            ease: "power2.in",
            onComplete: () => {
              enRuido += 1;
              if (enRuido !== tweens.length) return;
              // Todas las celdas en ruido: el swap ruido→ruido es invisible.
              setSaliendo(false);
              setIdx((v) => (v + 1) % words.length);
            },
          },
        ),
      );
    });

    return () => {
      tweens.forEach((t) => t.kill());
      cells.forEach(limpiarBobina);
    };
  }, [saliendo, reduced, words.length]);

  const word = reduced ? words[0] : words[idx];

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      // El display lo decide el caller (block/inline-block vía className);
      // acá solo el posicionamiento para anclar la palabra absoluta.
      className={`relative ${className ?? "block"}`}
      style={style}
    >
      {/* Sizer: la palabra más larga sostiene la altura de línea (y el ancho
          cuando el caller usa inline-block) durante todo el ciclo. */}
      <span className="invisible whitespace-nowrap">{longest}</span>
      {/* Palabra actual, centrada sobre el sizer. key remonta las celdas. */}
      <span
        key={idx}
        className="absolute inset-x-0 top-0 block text-center whitespace-nowrap"
      >
        {Array.from(word).map((ch, i) => (
          <span
            key={i}
            data-cell
            className="relative inline-block overflow-hidden align-bottom select-none"
            style={{ height: CELL_H, lineHeight: CELL_H }}
          >
            {/* Sizer de celda: fija el ancho al carácter final. */}
            <span className="invisible block">{ch}</span>
            <span
              data-reel
              className="absolute inset-x-0 top-0 block"
            >
              {/* Mismo recorte por fila que el ruido: mientras la bobina pasa,
                  el carácter real tampoco derrama tinta a las vecinas. */}
              <span
                data-final
                className="block overflow-hidden text-center"
                style={{ height: CELL_H, lineHeight: CELL_H }}
              >
                {ch}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
