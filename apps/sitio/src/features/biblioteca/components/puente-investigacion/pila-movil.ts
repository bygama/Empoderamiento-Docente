import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LVH_POR_PASO = 62;
const LVH_RESPIRO = 40;
/** Alto de la pista: una pantalla + un paso por tarjeta que llega + respiro. */
export const ALTO_PILA_LVH = 100 + 3 * LVH_POR_PASO + LVH_RESPIRO;

/**
 * El puente a Investigación bajo `lg`: la PILA, el mismo gesto que Cómo
 * trabajamos en celular (y que la pila de lomos de escritorio, en vertical).
 * Cada panel sube desde abajo y tapa al anterior; del tapado queda el lomo
 * (número y tipo de recurso) arriba. Si un panel no entra en lo que queda de
 * pantalla, su interior se escala (encajar): nada se corta. Solo transform y
 * opacity, en una línea atada al scroll de la pista.
 */
export function crearPilaPuente(root: HTMLElement) {
  const pista = root.querySelector<HTMLElement>("[data-puente-pista]");
  const escena = root.querySelector<HTMLElement>("[data-puente-escena]");
  const pila = root.querySelector<HTMLElement>("[data-puente-pila]");
  const cartas = gsap.utils.toArray<HTMLElement>("[data-puente-card]", root);
  const lomoDe = cartas[0]?.querySelector<HTMLElement>("[data-puente-lomo]");
  if (!pista || !escena || !pila || !lomoDe || cartas.length < 2) return () => {};

  // Fuera del ctx: la limpieza necesita la misma referencia para poder
  // sacar el listener (un () => {} nuevo no quita nada).
  const lomo = () => lomoDe.offsetHeight;
  // `scale` no reduce la caja de la carta (transform no participa del layout):
  // sin fijar también su alto, el borde inferior seguía en el alto natural y
  // se salía de pantalla aunque el contenido ya se viera achicado.
  // Piso de 0.35: si `disponible` diera negativo (pantalla muy baja), la
  // escala no puede invertirse ni achicar el contenido a ilegible.
  // Lecturas y escrituras separadas en pasadas propias: reset → medir →
  // aplicar, para no forzar un reflow por cada tarjeta.
  //
  // En celular, antes de achicar el texto cede la FOTO, que es decorativa:
  // se acorta lo que falte y, si quedara en una tira, no va. Recién lo que
  // siga sin entrar se escala. (En tablet la foto va al lado del texto:
  // acortarla no le saca alto a la carta.)
  const ESCALA_MIN = 0.35;
  const FOTO_MIN = 72;
  const celular = window.matchMedia("(max-width: 47.999rem)");
  const encajar = () => {
    const cuerpos = cartas.map((c) => c.querySelector<HTMLElement>("[data-puente-cuerpo]"));
    const fotos = cartas.map((c) => c.querySelector<HTMLElement>("figure"));
    cartas.forEach((c, k) => {
      gsap.set(c, { height: "auto" });
      const cuerpo = cuerpos[k];
      if (cuerpo) gsap.set(cuerpo, { scale: 1 });
      const foto = fotos[k];
      if (foto) gsap.set(foto, { clearProps: "height,display" });
    });
    if (celular.matches) {
      const sobras = cartas.map((c, k) => ({ falta: c.offsetHeight - (pila.clientHeight - k * lomo()), alto: fotos[k]?.offsetHeight ?? 0 }));
      sobras.forEach(({ falta, alto }, k) => {
        const foto = fotos[k];
        if (!foto || falta <= 0) return;
        if (alto - falta >= FOTO_MIN) gsap.set(foto, { height: alto - falta });
        else gsap.set(foto, { display: "none" });
      });
    }
    const medidas = cartas.map((c, k) => {
      const cuerpo = cuerpos[k];
      if (!cuerpo) return null;
      const disponible = pila.clientHeight - k * lomo();
      const natural = c.offsetHeight;
      const restoLomo = natural - cuerpo.offsetHeight;
      const escala = Math.max(ESCALA_MIN, Math.min(1, (disponible - restoLomo) / cuerpo.offsetHeight));
      return { cuerpo, disponible, natural, escala };
    });
    cartas.forEach((c, k) => {
      const m = medidas[k];
      if (!m) return;
      gsap.set(m.cuerpo, { scale: m.escala, transformOrigin: "50% 0%" });
      gsap.set(c, { height: Math.max(0, Math.min(m.disponible, m.natural)) });
    });
  };

  const ctx = gsap.context(() => {
    encajar();
    ScrollTrigger.addEventListener("refreshInit", encajar);

    gsap.set(cartas, { willChange: "transform" });
    gsap.set(cartas.slice(1), { y: () => escena.clientHeight });

    const total = cartas.length;
    const tramo = 1 / total;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: tramo * 0.6 },
      scrollTrigger: { trigger: pista, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
    });
    for (let k = 1; k < total; k++) {
      // La carta k descansa a k lomos del tope: los lomos de las tapadas quedan a la vista.
      tl.to(cartas[k], { y: () => k * lomo() }, (k - 1) * tramo + tramo * 0.4);
      for (let j = 0; j < k; j++) {
        tl.to(cartas[j].querySelector("[data-puente-cuerpo]") as HTMLElement, { autoAlpha: 0.35, duration: tramo * 0.3 }, (k - 1) * tramo + tramo * 0.5);
      }
    }
    tl.set({}, {}, 1);

    gsap.fromTo(
      pila,
      { y: 0, scale: 1, autoAlpha: 1 },
      { y: -56, scale: 0.97, autoAlpha: 0, ease: "power2.in", scrollTrigger: { trigger: pista, start: "bottom bottom", end: "bottom 45%", scrub: 1 } },
    );
  }, root);

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", encajar);
    ctx.revert();
  };
}
