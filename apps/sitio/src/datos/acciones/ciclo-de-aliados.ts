"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { autorizarAliadoEnBase } from "./autorizar-aliados";
import type { Fallo } from "./choque";
import { descartarCambiosDeAliadoEnBase } from "./editar-aliados";
import { despublicarAliadoEnBase, publicarAliadoEnBase, type ResultadoDePublicarAliado } from "./publicar-aliados";
import { refrescarAdminDeAliados, revalidarTira } from "./revalidar-aliados";

// Lo que cambia qué muestra el sitio de un aliado —publicar, despublicar,
// descartar los cambios y la marca «Autorizado»— (SPEC §5.1 y §6 de
// `work/casos-aliados-fotos/`). Cada una empieza por la sesión y sigue con su
// capacidad: `editarContenido`, y `autorizarAliados` para la marca, que solo
// tienen quien dirige y quien administra. Queda en la actividad.

const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });
type Pedido = z.input<typeof esquemaPedido>;
const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };

function fallo(accion: string, e: unknown): Fallo {
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

export async function publicarAliado(pedido: Pedido): Promise<ResultadoDePublicarAliado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await publicarAliadoEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (!r.ok) return r;
    revalidarTira();
    await registrarActividad({ tipo: "publico-un-aliado", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return r;
  } catch (e) {
    return fallo("publicarAliado", e);
  }
}

export async function despublicarAliado(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await despublicarAliadoEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidarTira();
    await registrarActividad({ tipo: "despublico-un-aliado", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("despublicarAliado", e);
  }
}

export async function descartarCambiosDeAliado(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await descartarCambiosDeAliadoEnBase(base, valido.data);
    if (r.ok) refrescarAdminDeAliados();
    return r;
  } catch (e) {
    return fallo("descartarCambiosDeAliado", e);
  }
}

/** Al marcar, `visto` es el logo y el nombre que se le mostraron a quien autoriza. */
type PedidoDeAutorizar = { id: string; autorizado: boolean; nota: string; visto: { logo: string; nombre: string } | null };

/**
 * Marca o quita «Autorizado», con la nota de dónde consta. Solo quien dirige o
 * administra. Si lo guardado ya no es lo que se le mostró, no se autoriza.
 */
export async function autorizarAliado(pedido: PedidoDeAutorizar): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "autorizarAliados")) return { ok: false, detalle: SIN_PERMISO };
    const visto = z.object({ logo: z.string().max(1000), nombre: z.string().max(200) });
    const valido = z.object({ id: z.uuid(), autorizado: z.boolean(), visto: visto.nullable() }).safeParse(pedido);
    if (!valido.success || (valido.data.autorizado && !valido.data.visto)) return MAL_PEDIDO;
    const { id, autorizado } = valido.data;
    const r = await autorizarAliadoEnBase(base, { id, autorizado, visto: valido.data.visto ?? undefined, nota: pedido.nota, rol: sesion.user.rol, quien: sesion.user.name });
    if (!r.ok) return r;
    if (!r.cambio) return { ok: true, detalle: r.detalle };
    revalidarTira();
    const tipo = valido.data.autorizado ? "autorizo-un-aliado" : "quito-la-autorizacion-de-un-aliado";
    await registrarActividad({ tipo, quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("autorizarAliado", e);
  }
}
