"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { descartarCambiosEnBase } from "./editar-equipo";
import { despublicarPersonaEnBase, publicarPersonaEnBase, type ResultadoDePublicar } from "./publicar-equipo";
import { refrescarAdmin, revalidarSitio } from "./revalidar-equipo";

// Lo que cambia qué muestra el sitio de un perfil —publicar, despublicar,
// descartar los cambios— (SPEC §6.1 de `work/equipo/`); crear, guardar,
// borrar y mover están en equipo.ts. Cada una empieza por la sesión y sigue
// con `editarContenido`, y queda en la actividad con el nombre y el id.

const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });
type Pedido = z.input<typeof esquemaPedido>;
const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

export async function publicarPersona(pedido: Pedido): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await publicarPersonaEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (!r.ok) return r;
    revalidarSitio();
    await registrarActividad({ tipo: "publico-un-perfil", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return r;
  } catch (e) {
    return fallo("publicarPersona", e);
  }
}

export async function despublicarPersona(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await despublicarPersonaEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidarSitio();
    await registrarActividad({ tipo: "despublico-un-perfil", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("despublicarPersona", e);
  }
}

export async function descartarCambiosDePersona(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await descartarCambiosEnBase(base, valido.data);
    if (!r.ok) return r;
    refrescarAdmin();
    if (r.descarto) await registrarActividad({ tipo: "descarto-cambios-de-un-perfil", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("descartarCambiosDePersona", e);
  }
}
