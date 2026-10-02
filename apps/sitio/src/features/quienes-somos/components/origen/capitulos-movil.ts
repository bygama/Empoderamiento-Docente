import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearIndicador, leerPiezas } from "./estados-origen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CAPITULOS = 5;
const LVH_POR_CAPITULO = 55;
const LVH_RESPIRO = 30;
/** Alto de la zona: una pantalla + un tramo por capítulo + respiro. */
export const ALTO_CAPITULOS_LVH = 100 + CAPITULOS * LVH_POR_CAPITULO + LVH_RESPIRO;

/**
 * «Origen» bajo `lg`: el PASADOR DE CAPÍTULOS. La historia de escritorio
 * superpone cinco beats en una lámina fija y los conduce con estallidos,
 * cita en 3D, tipeo y blur; en una pantalla vertical esos gestos no entran
 * y los textos se pisaban. Acá cada beat es un capítulo: entra desde abajo,
 * ocupa la pantalla mientras se lee y se va hacia arriba; el siguiente lo
 * reemplaza. Gestos propios, cortos, solo transform y opacity: las letras del
 * primer título suben, las líneas de la cita se descubren, la pregunta se
 * tipea con el scroll del capítulo, la trayectoria vertical se dibuja y el
 * remate aparece palabra por palabra. Las fotos del panel se cruzan con los
 * tres primeros capítulos: en tablet a la derecha y en celular en un marco
 * arriba, con el texto debajo, que se enciende palabra por palabra mientras
 * la muesca baja por el borde de la foto.
 */
export function crearCapitulosMovil(root: HTMLElement, zone: HTMLElement) {
  const ctx = gsap.context(() => {
    const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
    const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]", root);
    if (beats.length !== CAPITULOS) return;
    const p = leerPiezas(root);

    gsap.set(beats, { position: "absolute", inset: 0, willChange: "transform, opacity" });
    gsap.set(beats.slice(1), { autoAlpha: 0 });
    gsap.set(p.chars0, { yPercent: 100, opacity: 0 });
    gsap.set(p.quoteLines, { yPercent: 115 });
    if (p.quoteMark) gsap.set(p.quoteMark, { autoAlpha: 0 });
    if (p.quoteSub) gsap.set(p.quoteSub, { autoAlpha: 0, y: 12 });
    gsap.set(p.typeChars, { opacity: 0.13 });
    if (p.sub2) gsap.set(p.sub2, { autoAlpha: 0, y: 12 });
    if (p.constTitle) gsap.set(p.constTitle, { autoAlpha: 0, y: 16 });
    if (p.constvLine) gsap.set(p.constvLine, { scaleY: 0 });
    gsap.set(p.constvNodes, { scale: 0.35, autoAlpha: 0.35, transformOrigin: "50% 50%" });
    gsap.set(p.constvCopies, { autoAlpha: 0.16, x: -10 });
    gsap.set(p.finWords, { autoAlpha: 0, y: 18 });
    if (p.finRule) gsap.set(p.finRule, { scaleX: 0 });
    if (p.finSub) gsap.set(p.finSub, { autoAlpha: 0, y: 12 });
    const finPalabras = p.qa("[data-fin-sub] [data-palabra]");
    gsap.set(finPalabras, { opacity: 0.28 });
    // El cuerpo de cada pilar espera tenue y se enciende palabra por palabra.
    const cuerpos = [0, 1, 2].map((k) => p.qa(`[data-beat='${k}'] [data-palabra]`));
    cuerpos.forEach((palabras) => gsap.set(palabras, { opacity: 0.28 }));
    // El panel de fotos: una foto por capítulo 0–2, después se apaga.
    if (p.panel) gsap.set(p.panel, { autoAlpha: 1 });
    p.photoFrames.forEach((f, i) => gsap.set(f, { autoAlpha: i === 0 ? 1 : 0 }));
    // La lámina asoma sobre el hero desde scroll 0 y la foto no: entra con los
    // primeros pasos del scroll, antes de que la escena quede fija. Anima la
    // lámina interna; el panel de afuera es del timeline (su salida).
    if (p.lamina) {
      gsap.fromTo(
        p.lamina,
        { autoAlpha: 0, y: 56, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 68%", end: "top 12%", scrub: 0.5 },
        },
      );
    }

    const setDot = crearIndicador(dots);
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => setDot(self.progress),
      },
    });

    // Capítulo k ocupa [k, k+1): entra en los primeros 0.3, se va en los últimos 0.25.
    // Contiguos a propósito: la salida de k termina exactamente en k+1 (sale(k) +
    // su duración), que es donde arranca la entrada de k+1 — sin hueco sin
    // capítulo visible y sin superponer dos a la vez por encima de 0.5 de opacidad.
    const entra = (k: number) => k;
    const sale = (k: number) => k + 0.75;
    beats.forEach((beat, k) => {
      if (k > 0) tl.fromTo(beat, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.3 }, entra(k));
      if (k < CAPITULOS - 1) tl.to(beat, { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" }, sale(k));
    });

    // 0 · las letras del título suben (el capítulo 0 ya está visible al pinnear)
    tl.to(p.chars0, { yPercent: 0, opacity: 1, duration: 0.35, stagger: 0.012 }, 0.02);
    // 1 · la cita se descubre línea por línea
    tl.to(p.quoteLines, { yPercent: 0, duration: 0.3, stagger: 0.08 }, entra(1) + 0.1);
    if (p.quoteMark) tl.to(p.quoteMark, { autoAlpha: 1, duration: 0.2 }, entra(1) + 0.1);
    if (p.quoteSub) tl.to(p.quoteSub, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(1) + 0.35);
    // 2 · la pregunta se tipea con el scroll del capítulo
    tl.to(p.typeChars, { opacity: 1, duration: 0.02, stagger: 0.012, ease: "none" }, entra(2) + 0.1);
    if (p.sub2) tl.to(p.sub2, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(2) + 0.45);
    // 3 · definición + trayectoria vertical que se dibuja
    if (p.constTitle) tl.to(p.constTitle, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(3) + 0.05);
    // El trazo entra y termina de encenderse ANTES de la mitad del capítulo:
    // con el spread original (0.4 tl) el último hito («Hoy») seguía tenue a
    // mitad de capítulo y salía cortado del viewport — acá solo se ajusta
    // el timing interno del capítulo, la coreografía de escritorio no se toca.
    const DIB = entra(3) + 0.05;
    if (p.constvLine) tl.to(p.constvLine, { scaleY: 1, duration: 0.3, ease: "none" }, DIB);
    p.constvNodes.forEach((n, i) => {
      const at = DIB + (i / Math.max(p.constvNodes.length - 1, 1)) * 0.15;
      tl.to(n, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "back.out(3)" }, at);
      if (p.constvCopies[i]) tl.to(p.constvCopies[i], { autoAlpha: 1, x: 0, duration: 0.12 }, at + 0.02);
    });
    // 4 · el remate: cada palabra cae en su renglón, y después se enciende
    // el párrafo.
    tl.to(p.finWords, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.1 }, entra(4) + 0.08);
    if (p.finRule) tl.to(p.finRule, { scaleX: 1, duration: 0.2 }, entra(4) + 0.4);
    if (p.finSub) tl.to(p.finSub, { autoAlpha: 1, y: 0, duration: 0.2 }, entra(4) + 0.5);
    tl.to(finPalabras, { opacity: 1, duration: 0.06, stagger: { amount: 0.28 }, ease: "none" }, entra(4) + 0.58);
    cuerpos.forEach((palabras, k) => {
      const desde = entra(k) + (k === 0 ? 0.2 : 0.32);
      tl.to(palabras, { opacity: 1, duration: 0.06, stagger: { amount: 0.3 }, ease: "none" }, desde);
    });
    // Fotos: cruce con cada capítulo 0–2 y salida antes del 3. La muesca baja
    // por el borde de la foto: deriva apenas mientras se lee y cae un tercio
    // con cada cambio de capítulo (repartida pareja en toda la zona no se
    // notaba que se movía).
    if (p.notchRail) {
      tl.fromTo(p.notchRail, { yPercent: 4 }, { yPercent: 12, ease: "none", duration: sale(0) }, 0);
      [1, 2].forEach((k) => {
        const llega = 4 + k * 32;
        tl.to(p.notchRail, { yPercent: llega, duration: 0.5, ease: "power2.inOut" }, sale(k - 1));
        tl.to(p.notchRail, { yPercent: llega + 6, duration: 0.5, ease: "none" }, sale(k - 1) + 0.5);
      });
    }
    p.photoFrames.forEach((f, i) => {
      if (i > 0) tl.to(f, { autoAlpha: 1, duration: 0.2 }, entra(i));
      if (i > 0 && p.photoFrames[i - 1]) tl.to(p.photoFrames[i - 1], { autoAlpha: 0, duration: 0.2 }, entra(i));
    });
    if (p.panel) tl.to(p.panel, { autoAlpha: 0, duration: 0.25 }, sale(2));
    tl.set({}, {}, CAPITULOS);
    setDot(0);
  }, root);

  return () => ctx.revert();
}
