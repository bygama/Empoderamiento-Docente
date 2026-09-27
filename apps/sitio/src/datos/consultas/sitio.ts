import { cache } from "react";
import type { DatosDelSitio as Fila } from "@/../prisma/generado/client";
import { DATOS_INICIALES, esquemaDeDatosDelSitio, type DatosDelSitio } from "@/config/datos-del-sitio";
import { base } from "@/datos/cliente";

// Lo que lee el sitio de sus datos institucionales (work/ajustes/SPEC.md §3):
// la fila de `datos_del_sitio`, validada. Con las reglas de `contenidoDe`: sin
// DATABASE_URL, sin fila o si la consulta tira en una visita, los valores
// iniciales, así el sitio compila y sirve sin base; durante `next build`, con
// base configurada, un error tira: `/` y las demás son estáticas, y lo que no
// se leyó quedaría horneado en el HTML hasta el próximo guardado.

/** Las columnas de la fila, con la forma que usa el sitio. */
export function deLaFila(fila: Fila): unknown {
  const { correo, whatsapp, calle, complemento, ciudad, region, pais, paises, instagram, facebook, linkedin } = fila;
  return { correo, whatsapp, direccion: { calle, complemento, ciudad, region, pais }, paises, redes: { instagram, facebook, linkedin } };
}

/** `consultar` se inyecta para probar esto sin una base; el default es la fila de verdad. */
export async function leerDatosDelSitio(consultar: () => Promise<Fila | null> = () => base.datosDelSitio.findUnique({ where: { id: 1 } })): Promise<DatosDelSitio> {
  if (!process.env.DATABASE_URL) return DATOS_INICIALES;
  try {
    const fila = await consultar();
    if (!fila) {
      console.error("datosDelSitio: no hay fila en datos_del_sitio; van los valores iniciales.");
      return DATOS_INICIALES;
    }
    const valido = esquemaDeDatosDelSitio.safeParse(deLaFila(fila));
    if (valido.success) return valido.data;
    console.error("datosDelSitio: la fila no pasa el esquema; van los valores iniciales:", valido.error.issues[0]?.message);
    return DATOS_INICIALES;
  } catch (e) {
    if (process.env.NEXT_PHASE === "phase-production-build") throw e;
    console.error("datosDelSitio:", e instanceof Error ? e.message : e);
    return DATOS_INICIALES;
  }
}

/**
 * Los datos institucionales del sitio. Con `cache` de React: el layout, la
 * página y su metadata los piden en el mismo pedido, y la base se consulta una
 * vez.
 */
export const datosDelSitio = cache(() => leerDatosDelSitio());
