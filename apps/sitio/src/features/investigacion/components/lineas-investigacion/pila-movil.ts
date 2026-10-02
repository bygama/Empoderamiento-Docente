import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LVH_POR_PASO = 40;
const LVH_RESPIRO = 30;
/** Cuántos papeles llegan después del primero. */
const LLEGAN = 5;
/** Alto de la pista: una pantalla + el paso del título + un paso por papel que llega + respiro. */
export const ALTO_PILA_LINEAS_LVH = 100 + (LLEGAN + 1) * LVH_POR_PASO + LVH_RESPIRO;
/** Cuántas pestañas de papeles ya leídos quedan a la vista, como mucho. */
const PESTANAS = 3;
/** Aire entre el título y el primer papel, mientras el título está. */
const AIRE_TITULO = 16;

/**
 * Las Líneas de investigación en celular: EL FICHERO. La carpeta queda fija
 * con su folio («Hoja 02 · Líneas de investigación», que releva a la solapa
 * cuando esta se va) y un contador, y las
 * seis preguntas salen de a una. Primero el título de la sección cede su
 * lugar y el papel 01 sube al tope; después cada papel sube desde abajo y
 * tapa al anterior, del que queda la PESTAÑA (número y nombre de la línea):
 * lo que se acumula se lee. A la vista quedan como mucho tres pestañas; las
 * más viejas se van por arriba, y el contador dice por cuál se va.
 *
 * Todos los papeles miden lo que queda de carpeta bajo sus pestañas; si la
 * pregunta no entra, su interior se escala (encajar): nada se corta. Solo transform y opacity, en una línea atada al
 * scroll de la pista.
 */
export function crearPilaLineas(root: HTMLElement) {
  const pista = root.querySelector<HTMLElement>("[data-lineas-pista]");
  const escena = root.querySelector<HTMLElement>("[data-lineas-escena]");
  const pila = root.querySelector<HTMLElement>("[data-lineas-pila]");
  const titulo = root.querySelector<HTMLElement>("[data-lineas-titulo]");
  const contador = root.querySelector<HTMLElement>("[data-lineas-contador]");
  const cartas = gsap.utils.toArray<HTMLElement>("[data-linea]", root);
  const lomoDe = cartas[0]?.querySelector<HTMLElement>("[data-linea-lomo]");
  if (!pista || !escena || !pila || !titulo || !lomoDe || cartas.length < 2) return () => {};

  const lomo = () => lomoDe.offsetHeight;
  /** Cuántas pestañas tiene encima el papel k cuando es el de adelante. */
  const encima = (k: number) => Math.min(k, PESTANAS);
  /** Dónde espera el papel 01 mientras el título está: justo debajo de él. */
  const bajoElTitulo = () => titulo.offsetTop + titulo.offsetHeight - pila.offsetTop + AIRE_TITULO;

  // `scale` no reduce la caja del papel (transform no participa del layout):
  // sin fijar también su alto, el borde inferior seguía en el alto natural y
  // se salía de pantalla aunque el contenido ya se viera achicado. Piso de
  // 0.6: por debajo la pregunta deja de leerse. Lecturas y escrituras en
  // pasadas propias (reset → medir → aplicar), para no forzar un reflow por
  // papel.
  const ESCALA_MIN = 0.6;
  const encajar = () => {
    const cuerpos = cartas.map((c) => c.querySelector<HTMLElement>("[data-linea-cuerpo]"));
    cartas.forEach((c, k) => {
      gsap.set(c, { height: "auto" });
      const cuerpo = cuerpos[k];
      if (cuerpo) gsap.set(cuerpo, { scale: 1 });
    });
    const medidas = cartas.map((c, k) => {
      const cuerpo = cuerpos[k];
      if (!cuerpo) return null;
      const disponible = pila.clientHeight - encima(k) * lomo();
      const natural = c.offsetHeight;
      const restoLomo = natural - cuerpo.offsetHeight;
      const escala = Math.max(ESCALA_MIN, Math.min(1, (disponible - restoLomo) / cuerpo.offsetHeight));
      return { cuerpo, disponible, natural, escala };
    });
    cartas.forEach((c, k) => {
      const m = medidas[k];
      if (!m) return;
      gsap.set(m.cuerpo, { scale: m.escala, transformOrigin: "50% 0%" });
      // Todos llegan hasta el pie de la carpeta: el de adelante tapa entero al
      // de atrás, y de este solo asoma la pestaña.
      gsap.set(c, { height: Math.max(0, m.disponible) });
    });
  };

  const ctx = gsap.context(() => {
    encajar();
    ScrollTrigger.addEventListener("refreshInit", encajar);

    gsap.set(cartas, { willChange: "transform" });
    gsap.set(cartas[0], { y: bajoElTitulo });
    gsap.set(cartas.slice(1), { y: () => escena.clientHeight });

    const total = cartas.length;
    const tramo = 1 / total;
    /** Cuándo termina de llegar el papel k (el 0 «llega» cuando el título cede). */
    const llega = (k: number) => k * tramo + tramo * 0.75;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: tramo * 0.6 },
      scrollTrigger: { trigger: pista, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true },
      onUpdate: () => {
        if (!contador) return;
        const p = tl.progress();
        let actual = 1;
        for (let k = 1; k < total; k++) if (p >= llega(k)) actual = k + 1;
        const texto = String(actual).padStart(2, "0");
        if (contador.textContent !== texto) contador.textContent = texto;
      },
    });

    // ── El título cede y el papel 01 sube al tope de la carpeta.
    tl.fromTo(titulo, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: tramo * 0.45, ease: "power2.in", immediateRender: false }, tramo * 0.1);
    tl.fromTo(cartas[0], { y: bajoElTitulo }, { y: 0, immediateRender: false }, tramo * 0.2);

    for (let k = 1; k < total; k++) {
      const t = k * tramo + tramo * 0.15;
      // El papel k descansa bajo las pestañas de los anteriores (tres, como mucho).
      tl.to(cartas[k], { y: () => encima(k) * lomo() }, t);
      for (let j = 0; j < k; j++) {
        // Los de atrás suben un lugar cuando ya hay tres pestañas; el que
        // queda fuera del tope se va.
        const lugar = j - Math.max(0, k - PESTANAS);
        tl.to(cartas[j], { y: () => lugar * lomo(), autoAlpha: lugar < 0 ? 0 : 1, duration: tramo * 0.5 }, t + tramo * 0.05);
      }
    }
    tl.set({}, {}, 1);

    // El rótulo de la sección releva a la solapa: entra mientras ella sale
    // por arriba, así el nombre no se lee dos veces.
    gsap.fromTo(
      root.querySelector("[data-lineas-rotulo]"),
      { autoAlpha: 0, y: -8 },
      { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: pista, start: "top 64px", end: "top top", scrub: 0.4 } },
    );

    gsap.fromTo(
      [pila, root.querySelector("[data-lineas-folio]")],
      { y: 0, autoAlpha: 1 },
      { y: -40, autoAlpha: 0, ease: "power2.in", scrollTrigger: { trigger: pista, start: "bottom bottom", end: "bottom 55%", scrub: 0.8 } },
    );
  }, root);

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", encajar);
    ctx.revert();
    if (contador) contador.textContent = "01";
  };
}
