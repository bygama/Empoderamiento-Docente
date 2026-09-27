import { esRobot } from "./robots";

// Qué pedido a un link corto es un clic. Sin ED.

/**
 * La cabecera con que el proxy le dice a la página de un link corto el método
 * del pedido: una página no lo ve, y un HEAD no es un clic. El proxy **la pisa
 * siempre** en los pedidos a esa página, así no se puede mandar de afuera.
 */
export const CABECERA_DEL_METODO = "x-ed-metodo";

/**
 * Si el pedido es el clic de una persona: un GET según el proxy —sin la
 * cabecera no cuenta nada: falla del lado seguro—, y ni la vista previa de una
 * red ni un robot. El `User-Agent` se lee y no se guarda.
 */
export function esUnClic(cabeceras: Headers): boolean {
  return cabeceras.get(CABECERA_DEL_METODO) === "GET" && !esRobot(cabeceras.get("user-agent"));
}
