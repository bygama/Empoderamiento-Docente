"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { descartarCambiosEnBase } from "./editar-materiales";
import { ocultarMaterialEnBase, publicarMaterialEnBase, type ResultadoDePublicar } from "./publicar-materiales";
import { refrescarAdmin, revalidarSitio } from "./revalidar-materiales";

// Lo que cambia qué muestra el sitio de un material —publicar, ocultar,
// descartar los cambios— (SPEC §7 de `work/biblioteca/`); crear, guardar y
// borrar están en materiales.ts. Cada una empieza por la sesión y sigue con
// `editarBiblioteca`, y queda en la actividad con el título y el id.

const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });
type Pedido = z.input<typeof esquemaPedido>;
const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

export async function publicarMaterial(pedido: Pedido): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await publicarMaterialEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (!r.ok) return r;
    revalidarSitio(valido.data.id, r.novedades);
    await registrarActividad({ tipo: "publico-un-material", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return r;
  } catch (e) {
    return fallo("publicarMaterial", e);
  }
}

export async function ocultarMaterial(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await ocultarMaterialEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidarSitio(valido.data.id, r.novedades);
    await registrarActividad({ tipo: "oculto-un-material", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("ocultarMaterial", e);
  }
}

export async function descartarCambiosDeMaterial(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await descartarCambiosEnBase(base, valido.data);
    if (!r.ok) return r;
    refrescarAdmin();
    if (r.descarto) await registrarActividad({ tipo: "descarto-cambios-de-un-material", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("descartarCambiosDeMaterial", e);
  }
}
