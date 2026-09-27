"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { IDS_DE_CASOS } from "@/features/investigacion/contenido/modelo-de-casos";
import type { Fallo } from "./choque";
import { descartarCambiosDeCasoEnBase, guardarCasoEnBase, type ResultadoDeGuardarCaso } from "./editar-casos";
import { publicarCasoEnBase, type ResultadoDePublicarCaso } from "./publicar-casos";

// Guardar, publicar y descartar un caso desde su ficha (SPEC §6 de
// `work/casos-aliados-fotos/`); la vista previa está en vista-previa.ts.
// Toda acción empieza por la sesión y sigue con `editarContenido` (AGENTS.md
// §12). Guardar un borrador no queda en la actividad (no cambia el sitio) ni
// revalida; publicar y descartar, sí.

const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };
const esquemaPedido = z.object({ id: z.enum(IDS_DE_CASOS), borradorEnVisto: z.string().nullable() });
type Pedido = z.input<typeof esquemaPedido>;

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

/** Lo que el sitio muestra de un caso, y las pantallas del admin que lo listan. */
function revalidarCasos(): void {
  revalidatePath("/investigacion");
  revalidatePath("/admin/contenido", "layout");
}

export async function guardarCaso(pedido: Pedido & { contenido: unknown }): Promise<ResultadoDeGuardarCaso> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    return await guardarCasoEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("guardarCaso", e);
  }
}

export async function publicarCaso(pedido: Pedido): Promise<ResultadoDePublicarCaso> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await publicarCasoEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (!r.ok) return r;
    revalidarCasos();
    await registrarActividad({ tipo: "publico-un-caso", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return r;
  } catch (e) {
    return fallo("publicarCaso", e);
  }
}

export async function descartarCambiosDeCaso(pedido: Pedido): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await descartarCambiosDeCasoEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidatePath("/admin/contenido", "layout");
    if (r.descarto) await registrarActividad({ tipo: "descarto-cambios-de-un-caso", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true, detalle: r.detalle };
  } catch (e) {
    return fallo("descartarCambiosDeCaso", e);
  }
}
