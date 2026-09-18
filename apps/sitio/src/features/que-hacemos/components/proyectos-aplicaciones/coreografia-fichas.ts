import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ENTRADA_SVH,
  GIRO,
  PASO,
  PIVOTE,
  PIVOTE_GIRO,
  ROT,
  SOLO,
  SUBIDA,
  ZOOM,
  ZOOM_GIRO,
  ritmo,
} from "./proyectos-escena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Índice (dentro del lado) de la primera ficha de cada capítulo. */
export type Escena = { capInicioA: readonly number[]; capInicioB: readonly number[] };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * El archivo de fichas, en un solo escenario con dos lados. La víbora
 * viene de Niveles: mientras la sección sube está quieta, a caballo entre
 * los dos escenarios, y con el escenario clavado hace su tramo EN
 * SOLITARIO: cruza vacío con una
 * estela, la cámara la sigue con un zoom leve que se asienta, el título
 * grande se va DEL TODO y recién entonces aparecen los textos y las fichas
 * (`coreografia-vibora.ts` tiene el viaje). Cada ficha CAE sobre la pila
 * (sube desde abajo, se endereza y se planta con su inclinación) y las
 * anteriores se hunden atrás, cada vez más chicas, con dos asomando por
 * arriba y la tercera ya oculta. Las de atrás siguen OPACAS: con
 * transparencia, el texto de una se leía a través de la otra y la pila era
 * una mancha. Cuando cae la primera ficha de un capítulo, cambia el título
 * de la columna.
 *
 * El GIRO, entre los dos lados: la pila del lado A se va por arriba y su
 * texto se apaga; la víbora sube por el costado que quedó libre y baja por
 * el centro con la cámara siguiéndola; el título del lado B llega grande a
 * la derecha, ya en su lugar definitivo, y caen las fichas de la
 * izquierda. El contador sigue la cuenta del archivo entero y se escribe
 * directo al DOM desde el onUpdate de la timeline (el scrub sigue
 * moviéndose después de que el scroll paró).
 *
 * Devuelve la limpieza (`ctx.revert()`).
 */
export function crearFichas(zone: HTMLElement, stage: HTMLElement, e: Escena) {
  const ctx = gsap.context(() => {
    const ladoA = stage.querySelector<HTMLElement>('[data-lado="a"]');
    const ladoB = stage.querySelector<HTMLElement>('[data-lado="b"]');
    const camara = stage.querySelector<HTMLElement>("[data-camara]");
    const tituloGrande = stage.querySelector<HTMLElement>("[data-titulo-grande]");
    if (!ladoA || !ladoB) return;
    const piezas = (lado: HTMLElement) => ({
      fichas: gsap.utils.toArray<HTMLElement>("[data-ficha]", lado),
      titulos: gsap.utils.toArray<HTMLElement>("[data-cap-titulo]", lado),
      textos: gsap.utils.toArray<HTMLElement>("[data-texto]", lado),
      columna: lado.querySelector<HTMLElement>("[data-columna]"),
      pila: lado.querySelector<HTMLElement>("[data-pila]"),
      contador: lado.querySelector<HTMLElement>("[data-contador]"),
    });
    const A = piezas(ladoA);
    const B = piezas(ladoB);
    if (!A.fichas.length || !B.fichas.length) return;
    const total = A.fichas.length + B.fichas.length;

    const r = ritmo(A.fichas.length, B.fichas.length);
    const { entrada, inicio, giro, inicio2 } = r;

    for (const lado of [A, B]) {
      gsap.set(lado.fichas, { y: 720, rotation: -7, autoAlpha: 0, transformOrigin: "50% 100%" });
      gsap.set(lado.titulos, { autoAlpha: 0, y: 18 });
      gsap.set(lado.titulos[0], { autoAlpha: 1, y: 0 });
      // Hasta que termina cada solo no hay texto: el escenario es de la víbora.
      gsap.set(lado.textos, { autoAlpha: 0, y: 18 });
      if (lado.columna) gsap.set(lado.columna, { autoAlpha: 0, y: 18 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: `top ${ENTRADA_SVH}%`,
        // Sigue una pantalla después de soltarse: la víbora se va con el
        // escenario ya yéndose.
        end: "bottom top",
        scrub: 0.6,
      },
    });

    // La cámara: quieta en 1 durante la subida (tiene que calzar con
    // Niveles en la costura), late al clavarse con la salida de la víbora y
    // se asienta antes de que aparezca el texto; y otro latido más leve en
    // el giro, pivotando por donde sube la víbora. Solo transform.
    if (camara) {
      gsap.set(camara, { transformOrigin: PIVOTE });
      tl.set(camara, { willChange: "transform" }, entrada);
      tl.to(camara, { scale: ZOOM, ease: "power2.out", duration: SOLO * 0.3 }, entrada);
      tl.to(camara, { scale: 1, ease: "power2.inOut", duration: SOLO * 0.6 }, entrada + SOLO * 0.35);
      tl.set(camara, { willChange: "auto" }, inicio);
      tl.set(camara, { transformOrigin: PIVOTE_GIRO, willChange: "transform" }, giro);
      tl.to(camara, { scale: ZOOM_GIRO, ease: "power2.inOut", duration: GIRO * 0.35 }, giro);
      tl.to(camara, { scale: 1, ease: "power2.inOut", duration: GIRO * 0.5 }, giro + GIRO * 0.5);
      tl.set(camara, { willChange: "auto" }, inicio2);
    }

    // El título en grande: llega temprano en la subida (la víbora está
    // quieta en la costura y la pantalla que sube no puede venir vacía), se
    // queda todo el solo y se disuelve encogiéndose apenas. SECUENCIA, no superposición (Gastón,
    // 2026-09-10): primero se va del todo, después entra el texto. Dos
    // copias y no un texto escalado: escalado se ve borroso.
    if (tituloGrande) {
      gsap.set(tituloGrande, { autoAlpha: 0, y: 28, transformOrigin: "0% 50%" });
      tl.to(tituloGrande, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 }, entrada * 0.35);
      tl.to(tituloGrande, { autoAlpha: 0, scale: 0.92, ease: "power2.in", duration: 0.3 }, inicio - 0.65);
    }
    tl.to(A.textos, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, inicio - 0.32);
    if (A.columna) tl.to(A.columna, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, inicio - 0.25);

    // El giro: el lado A se va (la pila por arriba, el texto apagándose) y
    // el lado B llega cuando la víbora ya bajó por el centro: primero la
    // columna, grande y en su lugar, después el encabezado con la primera
    // ficha.
    if (A.pila) tl.to(A.pila, { y: -1000, ease: "power2.in", duration: GIRO * 0.45 }, giro);
    tl.to(A.columna ? [...A.textos, A.columna] : A.textos, { autoAlpha: 0, y: -18, ease: "power2.in", duration: 0.3 }, giro);
    if (B.columna) tl.to(B.columna, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, giro + GIRO * 0.8);
    tl.to(B.textos, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, inicio2 - 0.3);

    const caer = (lado: typeof A, desde: number, arranque: number, capInicio: readonly number[]) => {
      lado.fichas.forEach((ficha, i) => {
        const t = arranque + i * PASO;
        // La ficha entra OPACA desde abajo del escenario (que la recorta):
        // si se fundiera, la anterior se vería a través mientras llega.
        tl.set(ficha, { autoAlpha: 1 }, t);
        tl.to(ficha, { y: 0, rotation: ROT[desde + i] ?? 0, ease: "power3.out", duration: SUBIDA }, t);
        // La pila se hunde: la anterior atrás, la de antes más atrás, la
        // tercera se va.
        if (i > 0) tl.to(lado.fichas[i - 1], { y: -30, scale: 0.95, ease: "power2.inOut", duration: SUBIDA }, t);
        if (i > 1) tl.to(lado.fichas[i - 2], { y: -56, scale: 0.9, ease: "power2.inOut", duration: SUBIDA }, t);
        if (i > 2) tl.to(lado.fichas[i - 3], { autoAlpha: 0, ease: "power1.in", duration: SUBIDA * 0.5 }, t);

        // Cambio de capítulo: título (sale uno, DESPUÉS entra el otro: nunca
        // se pisan).
        const c = capInicio.indexOf(i);
        if (c > 0) {
          tl.to(lado.titulos[c - 1], { autoAlpha: 0, y: -18, ease: "power2.in", duration: 0.28 }, t);
          tl.to(lado.titulos[c], { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.45 }, t + 0.3);
        }
      });
    };
    caer(A, 0, inicio, e.capInicioA);
    caer(B, A.fichas.length, inicio2, e.capInicioB);

    tl.to({}, { duration: r.salida - inicio2 - B.fichas.length * PASO }, inicio2 + B.fichas.length * PASO);

    // El contador: cambia cuando la ficha que llega ya asomó más de la
    // mitad (con su ease, a 0.2 del paso ya subió dos tercios).
    const escribir = (el: HTMLElement | null, i: number) => {
      if (!el) return;
      const texto = `${pad(i + 1)} / ${pad(total)}`;
      if (el.textContent !== texto) el.textContent = texto;
    };
    tl.eventCallback("onUpdate", () => {
      const t = tl.time();
      const nA = A.fichas.length;
      escribir(A.contador, gsap.utils.clamp(0, nA - 1, Math.floor((t - inicio) / PASO - 0.2)));
      escribir(B.contador, nA + gsap.utils.clamp(0, B.fichas.length - 1, Math.floor((t - inicio2) / PASO - 0.2)));
    });
  }, stage);

  return () => ctx.revert();
}
