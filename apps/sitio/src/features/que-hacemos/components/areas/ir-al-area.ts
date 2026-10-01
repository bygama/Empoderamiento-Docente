import type { MouseEvent } from "react";
import { irASeccion } from "@/lib/indice";
import { idDeArea } from "./anclas";

/**
 * Con este evento los chips del hero le piden a la sección que abra un área
 * en tablet, donde son desplegables (useDesplegableAreas; en celular el hero
 * no tiene chips). Antes lo hacía el ancla: el chip escribía `#area-…` y la
 * sección lo leía.
 */
export const EVENTO_AREA = "ed:area";

/** Bajo lg las áreas son desplegables y el índice es la franja pegada. */
export const conDesplegables = () => window.matchMedia("(max-width: 63.999rem)").matches;

/**
 * Deja el foco en el título del área, como el ancla nativa: si se queda en
 * el chip, el próximo Tab vuelve a subir hasta el hero. Desde el hero la
 * columna de las áreas sigue oculta (visibility) un momento, mientras
 * aterriza el título, y ahí focus() no hace nada: se reintenta cada frame
 * mientras el foco siga en el chip, un segundo como mucho.
 */
function enfocarArea(i: number, chip: EventTarget, frames = 60) {
  if (document.activeElement !== chip) return;
  document.querySelector<HTMLElement>(`#${idDeArea(i)} [data-area-titulo]`)?.focus({ preventScroll: true });
  if (document.activeElement === chip && frames > 0) requestAnimationFrame(() => enfocarArea(i, chip, frames - 1));
}

/**
 * onClick de un link a un área: los chips del hero y el índice de la
 * sección. Corta hasta el área (irASeccion) en vez de dejar saltar al ancla
 * nativa, que fallaba de dos maneras (Daniela, 2026-09-30):
 *
 * - Desde el hero caía casi una pantalla antes y se veía el área anterior:
 *   el navegador mide el área antes del pin del título, que al soltarse
 *   corre la columna para abajo (irASeccion lo suma, ver lib/indice.ts).
 * - Cada clic dejaba una entrada en el historial sin el estado de Next, que
 *   ignora ese popstate: el «atrás» desde Contacto cambiaba la URL y dejaba
 *   Contacto en pantalla. Por eso tampoco se escribe el ancla en la URL: al
 *   volver, AterrizajePorLink cortaría a esa área en vez de dejarte en el
 *   cierre, que es donde estabas.
 *
 * Bajo lg el índice de la franja hace lo suyo (`enLaFranja`: abrir y
 * acomodar). El href queda para sin JS y para abrir en otra pestaña.
 */
export function alClicIrAlArea(i: number, enLaFranja?: (i: number) => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const desplegables = conDesplegables();
    if (desplegables && enLaFranja) {
      enLaFranja(i);
      return;
    }
    // Se pide abrirla y se corta enseguida: si al abrirse se cierra otra más
    // arriba y la corre, irASeccion vuelve a medir y corrige.
    if (desplegables) window.dispatchEvent(new CustomEvent<number>(EVENTO_AREA, { detail: i }));
    irASeccion(idDeArea(i), { corte: true });
    enfocarArea(i, e.currentTarget);
  };
}
