import {
  aspectoBarra,
  proyectar,
  proyectarLente,
  RADIO_CRISTAL,
  RADIO_GALERIA,
} from "./linterna-geometria";

/**
 * El giro pseudo-3D de la linterna, para quien la anime (el cierre la hace
 * subir girando; el hero le da un cuarto de vuelta al encenderse). Un proxy
 * `{ theta }` que el timeline tweenea y `girar()`, que re-proyecta parantes,
 * montantes y óptica para el θ actual con escrituras directas de atributos
 * (por eso `ctx.revert()` no lo deshace: quien lo usa restaura el θ final).
 */
export function crearGirador(raiz: Element, thetaInicial: number) {
  const parantes = Array.from(
    raiz.querySelectorAll<SVGLineElement>("[data-linterna-parante]"),
  );
  const montantes = Array.from(
    raiz.querySelectorAll<SVGLineElement>("[data-linterna-montante]"),
  );
  const lente = raiz.querySelector<SVGRectElement>("[data-linterna-lente]")!;

  const giro = { theta: thetaInicial };
  const girar = () => {
    parantes.forEach((l) => {
      const phi = Number(l.dataset.linternaParante);
      const { x, frente } = proyectar(phi, giro.theta, RADIO_CRISTAL);
      const { opacity, grosor } = aspectoBarra(frente, x, RADIO_CRISTAL);
      l.setAttribute("x1", String(x));
      l.setAttribute("x2", String(x));
      l.setAttribute("stroke-opacity", String(opacity));
      l.setAttribute("stroke-width", String(grosor));
    });
    montantes.forEach((l) => {
      const phi = Number(l.dataset.linternaMontante);
      const { x, frente } = proyectar(phi, giro.theta, RADIO_GALERIA);
      const { opacity, grosor } = aspectoBarra(frente, x, RADIO_GALERIA);
      l.setAttribute("x1", String(x));
      l.setAttribute("x2", String(x));
      l.setAttribute("stroke-opacity", String(0.5 * opacity));
      l.setAttribute("stroke-width", String(0.55 + grosor * 0.35));
    });
    const optica = proyectarLente(giro.theta);
    lente.setAttribute("x", String(optica.x));
    lente.setAttribute("width", String(optica.ancho));
    lente.setAttribute("opacity", String(optica.opacity));
  };

  return { giro, girar };
}
