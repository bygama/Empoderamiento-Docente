import gsap from "gsap";
import {
  CABEZA_AL_CLAVAR,
  CABEZA_FIN,
  CABEZA_FIN_SOLO,
  CABEZA_FIN_SOLO_ESPEJO,
  ESTELA_ALPHA,
  ESTELA_ATRASO,
  ESTELA_SEG,
  LAZO_SEG,
  PASO,
  PUNTO_FINAL,
  PUNTO_GAP,
  PUNTO_SEG,
  SALIDA_MARGEN,
  SUBIDA,
  type Ritmo,
} from "./proyectos-escena";

/**
 * La víbora de una mitad, exactamente como en Niveles: una ventana visible
 * que se desliza a lo largo del recorrido vía dashoffset, y la cápsula
 * corrida detrás de la cola sobre el mismo path. Lo que se anima es la
 * CABEZA (fracción del recorrido): asoma a mitad de la subida y baja al
 * ritmo con que sube la sección; con el escenario clavado dispara en
 * solitario hasta el pie, con la estela; y después, con las fichas:
 *
 * - En la primera mitad SE VA por abajo, y la cola termina de irse justo
 *   antes de que el escenario se suelte, para que la segunda la retome.
 * - En el espejo TERMINA: la cabeza frena en la punta del recorrido cuando
 *   cae la última ficha, la cola la alcanza, y la cápsula verde llega y se
 *   queda como punto final. El animal que corrió tres secciones se detiene
 *   sobre el remate.
 */
export function animarVibora(
  tl: gsap.core.Timeline,
  stage: HTMLElement,
  r: Ritmo,
  espejo: boolean,
  fichas: number,
) {
  const cinta = stage.querySelector<SVGPathElement>("[data-cinta]");
  const capsula = stage.querySelector<SVGPathElement>("[data-capsula]");
  const estela = stage.querySelector<SVGPathElement>("[data-estela]");
  if (!cinta || !capsula) return;

  const L = cinta.getTotalLength();
  const estelaSeg = L * ESTELA_SEG;
  const atraso = L * ESTELA_ATRASO;
  // Todo lo que cambia con el tiempo: dónde está la cabeza y, al final del
  // espejo, cuánto queda de cuerpo, de aire y de cápsula.
  const st = { f: 0, seg: L * LAZO_SEG, gap: L * PUNTO_GAP, dot: L * PUNTO_SEG };
  if (estela) gsap.set(estela, { strokeDasharray: `${estelaSeg} ${L * 2}` });
  const colocar = () => {
    const cabeza = st.f * L;
    // Con el cuerpo ya cerrado, el trazo se oculta del todo: Chrome no
    // pinta un guion de largo cero pero sí le deja la sombra.
    gsap.set(cinta, {
      strokeDasharray: `${st.seg} ${L * 2}`,
      strokeDashoffset: st.seg - cabeza,
      autoAlpha: st.seg > 1 ? 1 : 0,
    });
    gsap.set(capsula, {
      strokeDasharray: `${st.dot} ${L * 2}`,
      strokeDashoffset: st.seg + st.gap + st.dot - cabeza,
    });
    if (estela) gsap.set(estela, { strokeDashoffset: st.seg * 2 - cabeza - estelaSeg + atraso });
  };
  colocar();

  const { entrada, solo, inicio, fin } = r;
  const finSolo = espejo ? CABEZA_FIN_SOLO_ESPEJO : CABEZA_FIN_SOLO;
  tl.to(st, { f: CABEZA_AL_CLAVAR, ease: "none", duration: entrada * 0.5, onUpdate: colocar }, entrada * 0.5);
  tl.to(st, { f: finSolo, ease: "power1.inOut", duration: solo, onUpdate: colocar }, entrada);
  // La estela solo existe en el solo.
  if (estela) {
    tl.to(estela, { autoAlpha: ESTELA_ALPHA, duration: solo * 0.25 }, entrada);
    tl.to(estela, { autoAlpha: 0, duration: solo * 0.3 }, inicio - solo * 0.3);
  }

  if (!espejo) {
    const fFinal = 1 + (st.seg + st.gap + st.dot + L * 0.02) / L;
    tl.to(st, { f: fFinal, ease: "none", duration: fin - inicio - SALIDA_MARGEN, onUpdate: colocar }, inicio);
    return;
  }

  // Llega frenando a la punta justo cuando cae la última ficha.
  const tCae = inicio + (fichas - 1) * PASO + SUBIDA;
  tl.to(st, { f: CABEZA_FIN, ease: "power1.out", duration: tCae - inicio, onUpdate: colocar }, inicio);
  // La cola la alcanza (acelerando) y el cuerpo se cierra en un punto…
  tl.to(st, { seg: 0, ease: "power2.in", duration: SUBIDA * 1.2, onUpdate: colocar }, tCae);
  // …y la cápsula cierra el aire y se posa encima: punto final.
  tl.to(
    st,
    { gap: 0, dot: L * PUNTO_FINAL, ease: "power2.inOut", duration: 0.5, onUpdate: colocar },
    tCae + SUBIDA * 0.9,
  );
}
