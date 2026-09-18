import gsap from "gsap";
import { TAMBORES } from "../../data";
import type { EstadoTorre } from "./pintar-torre";
import type { RefsTorre } from "./refs-torre";

/**
 * Las capas que no son la torre: velo, apoyo, rieles, superficie, nieblas y
 * rótulo. Opacidades escritas a mano en cada frame del scrub.
 *
 * `salida` es la cola de la zona (0→1) y `uiSalida` su recíproco acelerado:
 * tarjeta y rieles se apagan en la primera mitad de la cola, el tubo se va
 * solo, sin UI colgada.
 */
export function pintarCapas(refs: RefsTorre, { build }: EstadoTorre, salida: number, uiSalida: number) {
  // El velo blanco lo disuelve el armado (por tiempo): la superficie
  // gris y su trama EMERGEN del blanco en que terminó el faro.
  if (refs.velo.current) refs.velo.current.style.opacity = String(build.velo);
  if (refs.apoyo.current) refs.apoyo.current.style.opacity = String(build.apoyo * uiSalida);
  if (refs.nav.current) refs.nav.current.style.opacity = String(uiSalida);
  if (refs.rielDer.current) refs.rielDer.current.style.opacity = String(uiSalida);
  // La superficie y las nieblas se van con la cola: la sección siguiente
  // sube por detrás del tubo.
  if (refs.superficie.current) refs.superficie.current.style.opacity = String(1 - salida);
  for (const nb of refs.niebla.current) if (nb) nb.style.opacity = String(1 - salida);
  // El RÓTULO ("Siete líneas de acción") presenta la lista una sola vez:
  // se enciende con la línea legible, quieto, y se va en cuanto la línea
  // empieza a enrollarse. Después el marco queda en el encabezado del
  // riel. Sin esto el usuario salía del faro a "DESARROLLO PROFESIONAL"
  // en letras de 150px sin saber de qué era la lista.
  if (refs.rotulo.current) {
    const seVa = Math.min(1, build.rollo / 0.35);
    refs.rotulo.current.style.opacity = String(build.linea * (1 - seVa));
    refs.rotulo.current.style.transform = `translate(-50%, ${-14 * seVa}px)`;
  }
}

/**
 * Llegó otra estación: se marca en el riel y se CRUZAN los textos de apoyo
 * (crossfade + textContent, sin re-render de React).
 *
 * (Acá había un "latido": el tambor que llegaba se agrandaba 5% y volvía con
 * un elástico, que pasa por debajo de 1 y oscila — medido: escala 1,05 →
 * 0,983 → 1 en medio segundo. A la vista era un rebote/vibración en cada
 * estación, no un acento, así que fuera. La llegada la marcan el riel y el
 * cruce del apoyo.)
 */
export function cruzarApoyo(refs: RefsTorre, act: number) {
  refs.rail.current.forEach((el, i) => {
    if (el) el.dataset.active = String(i === act);
  });
  const t = TAMBORES[act];
  gsap
    .timeline()
    .to("[data-torre-slot]", { autoAlpha: 0, y: -10, duration: 0.22, ease: "power2.in" })
    .add(() => {
      if (refs.titulo.current) refs.titulo.current.textContent = t.titulo;
      if (refs.frase.current) refs.frase.current.textContent = t.frase;
      if (refs.detalle.current) refs.detalle.current.textContent = t.detalle;
    })
    .to("[data-torre-slot]", { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" });
}
