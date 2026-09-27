"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { descartarCambiosEnBase } from "./editar-novedades";
import { despublicarNovedadEnBase, publicarNovedadEnBase, type ResultadoDePublicar } from "./publicar-novedades";
import { refrescarAdmin, revalidarSitio } from "./revalidar-novedades";

// Lo que cambia qué muestra el sitio de una novedad —publicar, despublicar,
// descartar los cambios— (SPEC §5.3 de `work/novedades-y-kit/`); crear,
// guardar y borrar están en novedades.ts, y la vista previa en
// vista-previa.ts. Cada una empieza por la sesión y sigue con
// `editarNovedades`, y queda en la actividad con el título y el id.

const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });
type Pedido = z.input<typeof esquemaPedido>;
const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

export async function publicarNovedad(pedido: Pedido): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await publicarNovedadEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (!r.ok) return r;
    revalidarSitio(r.slugs);
    await registrarActividad({ tipo: "publico-una-novedad", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return r;
  } catch (e) {
    return fallo("publicarNovedad", e);
  }
}

export async function despublicarNovedad(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await despublicarNovedadEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidarSitio(r.slugs);
    await registrarActividad({ tipo: "despublico-una-novedad", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("despublicarNovedad", e);
  }
}

export async function descartarCambiosDeNovedad(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await descartarCambiosEnBase(base, valido.data);
    if (!r.ok) return r;
    refrescarAdmin();
    if (r.descarto) await registrarActividad({ tipo: "descarto-cambios-de-una-novedad", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("descartarCambiosDeNovedad", e);
  }
}
