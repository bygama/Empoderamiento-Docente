import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * «Cómo trabajamos»: UNA sola tarjeta clavada a pantalla completa y, con el
 * scroll, cambia lo de adentro. Las letras del verbo se arman subiendo una
 * por una y se desarman igual; el número, la idea y la explicación entran y
 * salen palabra por palabra. Al lado, el índice con los seis verbos marca en
 * qué paso se está (Facundo, 2026-09-10: «una sola card y a medida que
 * hacemos scroll no cambia la card sino el contenido»).
 *
 * El primer paso llega armado: es lo que se ve mientras la sección entra,
 * así el pin no arranca con la tarjeta vacía. El último se queda armado un
 * rato (COLA) antes de soltar la sección.
 *
 * Solo en desktop y sin reduced-motion. Si no, o si el JS no corre, los
 * seis pasos se leen en flujo dentro de la misma tarjeta, uno debajo del
 * otro con un filete entre medio: nada arranca escondido por CSS. Acá se
 * sacan de flujo, se apilan y el marco toma el alto del más alto, así nada
 * salta entre un paso y otro.
 *
 * Todo transform y opacidad. `scrub` con demora, nunca `true` (AGENTS §8).
 */

/** Cuánto scroll se lleva cada paso, en px. */
const RECORRIDO_POR_PASO = 600;
/** Cuánto se queda el último paso armado antes de soltar la sección, en pasos. */
const COLA = 0.5;
/** Duración de la entrada de cada pieza, en pasos. */
const ENTRADA = 0.25;
/** En qué punto del paso empieza a desarmarse. */
const SALIDA = 0.8;
/**
 * Cuánto antes de su turno empieza a entrar el paso siguiente: se solapa
 * con la salida del anterior (las letras nuevas suben mientras las viejas
 * se van) para que la tarjeta nunca quede vacía entre uno y otro.
 */
const SOLAPE = 0.14;

export function crearPasos(root: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 1024px)",
      reducido: "(prefers-reduced-motion: reduce)",
    },
    (contexto) => {
      const { desktop, reducido } = contexto.conditions as {
        desktop: boolean;
        reducido: boolean;
      };
      if (!desktop || reducido) return;

      const marco = root.querySelector<HTMLElement>("[data-marco]");
      const contenidos = gsap.utils.toArray<HTMLElement>("[data-paso]", root);
      const indice = gsap.utils.toArray<HTMLElement>("[data-paso-indice]", root);
      if (!marco || contenidos.length < 2) return;
      const n = contenidos.length;

      // 1) Letras y palabras. Se parte ANTES de medir: las piezas quedan
      //    inline-block y eso puede mover algún corte de línea.
      const instancias: SplitText[] = [];
      const partir = (c: HTMLElement, sel: string, type: "chars" | "words") => {
        const el = c.querySelector<HTMLElement>(sel);
        if (!el) return [];
        const s = SplitText.create(el, { type });
        instancias.push(s);
        return type === "chars" ? s.chars : s.words;
      };
      const piezas = contenidos.map((c) => ({
        letras: partir(c, "[data-paso-verbo]", "chars"),
        palabras: [
          ...partir(c, "[data-paso-num]", "words"),
          ...partir(c, "[data-paso-idea]", "words"),
          ...partir(c, "[data-paso-texto]", "words"),
        ],
      }));

      // 2) Un solo marco: los contenidos dejan el flujo (sin el filete ni el
      //    aire que los separa cuando van uno debajo del otro) y se apilan,
      //    cada uno centrado a lo alto. El marco no baja del más alto.
      gsap.set(contenidos, { marginTop: 0, paddingTop: 0, borderTopWidth: 0 });
      const alto = Math.max(...contenidos.map((c) => c.offsetHeight));
      const est = getComputedStyle(marco);
      const minimo = alto + parseFloat(est.paddingTop) + parseFloat(est.paddingBottom);
      if (marco.offsetHeight < minimo) marco.style.minHeight = `${minimo}px`;
      gsap.set(contenidos, {
        position: "absolute",
        top: "50%",
        yPercent: -50,
        left: est.paddingLeft,
        right: est.paddingRight,
      });
      contenidos.forEach((c, i) => {
        if (i > 0) gsap.set(c, { autoAlpha: 0 });
      });

      const marcar = (activo: number) => {
        indice.forEach((el, k) => {
          el.toggleAttribute("data-activo", k === activo);
          el.toggleAttribute("data-pasado", k < activo);
        });
      };
      marcar(0);

      // 3) La línea de tiempo, en unidades de paso: el paso i vive entre i e
      //    i+1. Entra hasta ~0.48, se queda armado, a partir de SALIDA se
      //    desarma, y el siguiente ya viene entrando SOLAPE antes de i+1.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${(n - 1 + COLA) * RECORRIDO_POR_PASO}`,
          pin: true,
          scrub: 0.6,
        },
      });
      // El índice cambia a mitad de la transición, no al final.
      tl.eventCallback("onUpdate", () => {
        marcar(Math.min(n - 1, Math.max(0, Math.floor(tl.time() + SOLAPE - 0.04))));
      });

      piezas.forEach(({ letras, palabras }, i) => {
        if (i > 0) {
          const entra = i - SOLAPE;
          tl.set(contenidos[i], { autoAlpha: 1 }, entra);
          tl.fromTo(
            letras,
            { yPercent: 70, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: ENTRADA, ease: "power2.out", stagger: 0.15 / Math.max(1, letras.length) },
            entra,
          );
          tl.fromTo(
            palabras,
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: ENTRADA, ease: "power2.out", stagger: 0.18 / Math.max(1, palabras.length) },
            entra + 0.05,
          );
        }
        if (i < n - 1) {
          tl.to(
            letras,
            { yPercent: -50, opacity: 0, duration: 0.14, ease: "power2.in", stagger: 0.06 / Math.max(1, letras.length) },
            i + SALIDA,
          );
          tl.to(
            palabras,
            { y: -10, opacity: 0, duration: 0.14, ease: "power2.in", stagger: 0.06 / Math.max(1, palabras.length) },
            i + SALIDA,
          );
          tl.set(contenidos[i], { autoAlpha: 0 }, i + 1);
        }
      });
      // Cierra la línea en su duración total: es lo que el scrub reparte
      // sobre el recorrido del pin.
      tl.set({}, {}, n - 1 + COLA);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        instancias.forEach((s) => s.revert());
        gsap.set(contenidos, { clearProps: "all" });
        marco.style.minHeight = "";
        indice.forEach((el) => {
          el.removeAttribute("data-activo");
          el.removeAttribute("data-pasado");
        });
      };
    },
  );

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
