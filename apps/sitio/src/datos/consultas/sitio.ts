import { cache } from "react";
import { puede } from "@ed/auth";
import type { DatosDelSitio as Fila } from "@/../prisma/generado/client";
import { DATOS_INICIALES, esquemaDeDatosDelSitio, type DatosDelSitio } from "@/config/datos-del-sitio";
import { aValores, type ValoresDelSitio } from "@/config/formulario-del-sitio";
import { base } from "@/datos/cliente";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que lee el sitio de sus datos institucionales (work/ajustes/SPEC.md §3):
// la fila de `datos_del_sitio`, validada, con `leerSinRomper`: sin
// DATABASE_URL o si la consulta tira en una visita, los valores iniciales, así
// el sitio compila y sirve sin base; durante `next build`, con base
// configurada, un error tira. Sin fila o con una que no pasa el esquema,
// también los iniciales, y el log lo dice.

/** Las columnas de la fila, con la forma que usa el sitio. */
export function deLaFila(fila: Fila): unknown {
  const { correo, whatsapp, calle, complemento, ciudad, region, pais, paises, instagram, facebook, linkedin } = fila;
  return { correo, whatsapp, direccion: { calle, complemento, ciudad, region, pais }, paises, redes: { instagram, facebook, linkedin } };
}

/** `consultar` se inyecta para probar esto sin una base; el default es la fila de verdad. */
export async function leerDatosDelSitio(consultar: () => Promise<Fila | null> = () => base.datosDelSitio.findUnique({ where: { id: 1 } })): Promise<DatosDelSitio> {
  // `undefined`: no hay base, o no contestó. `null`: hay base, y no tiene la fila.
  const fila = await leerSinRomper<Fila | null | undefined>("datosDelSitio", consultar, undefined);
  if (fila === undefined) return DATOS_INICIALES;
  if (fila === null) {
    console.error("datosDelSitio: no hay fila en datos_del_sitio; van los valores iniciales.");
    return DATOS_INICIALES;
  }
  const valido = esquemaDeDatosDelSitio.safeParse(deLaFila(fila));
  if (valido.success) return valido.data;
  console.error("datosDelSitio: la fila no pasa el esquema; van los valores iniciales:", valido.error.issues[0]?.message);
  return DATOS_INICIALES;
}

/**
 * Los datos institucionales del sitio. Con `cache` de React: el layout, la
 * página y su metadata los piden en el mismo pedido, y la base se consulta una
 * vez.
 */
export const datosDelSitio = cache(() => leerDatosDelSitio());

export type DatosParaEditar = { valores: ValoresDelSitio; cambiadoEn: Date | null; cambiadoPor: string | null };

/**
 * Lo que muestra Ajustes › Datos del sitio: la fila tal cual está, como texto,
 * aunque no pase el esquema (el formulario dice qué corregir al guardar), y
 * sin respaldo: si la base no contesta, la pantalla lo dice. Sin fila, los
 * datos iniciales. Sin `usarAjustes`, `null`.
 */
export async function datosDelSitioParaEditar(rol: unknown): Promise<DatosParaEditar | null> {
  if (!puede(rol, "usarAjustes")) return null;
  const fila = await base.datosDelSitio.findUnique({ where: { id: 1 } });
  if (!fila) return { valores: aValores(DATOS_INICIALES), cambiadoEn: null, cambiadoPor: null };
  const texto = (valor: string | null) => valor ?? "";
  const valores: ValoresDelSitio = {
    correo: fila.correo,
    whatsapp: texto(fila.whatsapp),
    calle: fila.calle,
    complemento: texto(fila.complemento),
    ciudad: fila.ciudad,
    region: texto(fila.region),
    pais: fila.pais,
    paises: fila.paises.join(", "),
    instagram: texto(fila.instagram),
    facebook: texto(fila.facebook),
    linkedin: texto(fila.linkedin),
  };
  return { valores, cambiadoEn: fila.cambiadoEn, cambiadoPor: fila.cambiadoPor };
}
