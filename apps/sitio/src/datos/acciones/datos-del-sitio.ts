"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { esquemaDeDatosDelSitio } from "@/config/datos-del-sitio";
import { CAMPOS_DEL_SITIO, ETIQUETAS, campoDe, desdeValores, type CampoDelSitio } from "@/config/formulario-del-sitio";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { guardarDatosDelSitioEnBase } from "./editar-datos-del-sitio";

// Ajustes › Datos del sitio (work/ajustes/SPEC.md §2.2): guardar es publicar,
// en un paso. Sesión, `usarAjustes`, el esquema, la fila, el sitio entero
// revalidado (el pie está en todas las páginas) y la actividad.

export type ResultadoDeDatosDelSitio =
  | { ok: true; detalle: string; cambiadoEn: string; cambiadoPor: string }
  | { ok: false; detalle: string; errores?: Partial<Record<CampoDelSitio, string>> };

// Un texto por campo, todos: con un enum de claves, el registro de Zod 4 los pide todos.
const esquemaDelPedido = z.record(z.enum(CAMPOS_DEL_SITIO), z.string().max(1000));

// El layout del sitio, con el pie y el menú: revalidarlo regenera cada página en su próxima visita.
const EL_SITIO = "/(sitio)";

export async function guardarDatosDelSitio(pedido: unknown): Promise<ResultadoDeDatosDelSitio> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para guardar." };
    if (!puede(sesion.user.rol, "usarAjustes")) return { ok: false, detalle: SIN_PERMISO };
    const escrito = esquemaDelPedido.safeParse(pedido);
    if (!escrito.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const valido = esquemaDeDatosDelSitio.safeParse(desdeValores(escrito.data));
    if (!valido.success) {
      const errores: Partial<Record<CampoDelSitio, string>> = {};
      for (const { path, message } of valido.error.issues) errores[campoDe(path)] ??= message;
      const campos = Object.keys(errores) as CampoDelSitio[];
      const cuantos = campos.length === 1 ? "Hay 1 campo para revisar" : `Hay ${campos.length} campos para revisar`;
      return { ok: false, detalle: `${cuantos}. El primero: ${ETIQUETAS[campos[0]]}.`, errores };
    }
    const cambiadoEn = await guardarDatosDelSitioEnBase(base, valido.data, sesion.user.name);
    revalidatePath(EL_SITIO, "layout");
    await registrarActividad({ tipo: "cambio-los-datos-del-sitio", quien: sesion.user.id });
    return { ok: true, detalle: "Listo: el sitio ya muestra los datos nuevos.", cambiadoEn: cambiadoEn.toISOString(), cambiadoPor: sesion.user.name };
  } catch (e) {
    console.error("guardarDatosDelSitio:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
  }
}
