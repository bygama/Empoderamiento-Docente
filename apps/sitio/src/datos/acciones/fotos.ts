"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { paraElegir, type FotoParaElegir } from "@/datos/consultas/fotos";
import { almacenDesdeEntorno } from "@/lib/contenido/almacen";
import { borrarFotoEnBase, editarAltEnBase } from "./editar-fotos";
import { reemplazarFotoEnBase } from "./reemplazar-foto";
import { refrescarAdminDeFotos, regenerarSitio } from "./revalidar-fotos";
import { subirFotoEnBase, type ResultadoDeSubida } from "./subir-foto";

// Lo que se hace con una foto (SPEC §3.4 de `work/casos-aliados-fotos/`):
// subirla —desde la biblioteca o desde el campo de foto de cualquier
// formulario—, editar su alt, reemplazar su archivo, borrarla y listar las
// que se pueden elegir. Toda acción empieza por la sesión y sigue con
// `editarContenido` (AGENTS.md §12); lo de la base está en subir-foto.ts,
// editar-fotos.ts y reemplazar-foto.ts. Subir, reemplazar y borrar quedan
// en la actividad; editar el alt, no (SPEC §9).

type Resultado = { ok: true; detalle: string } | { ok: false; detalle: string };

const SIN_SESION = { ok: false as const, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO = { ok: false as const, detalle: "El pedido no tiene la forma esperada." };

function fallo(accion: string, e: unknown) {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false as const, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

export async function subirFoto(datos: FormData): Promise<ResultadoDeSubida> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para subir fotos." };
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const r = await subirFotoEnBase(base, almacenDesdeEntorno(), { archivo: datos.get("archivo"), alt: datos.get("alt"), quien: sesion.user.name });
    // Sin revalidar: se sube también desde un formulario a medio escribir, y un refresco lo rearmaría.
    if (r.ok) await registrarActividad({ tipo: "subio-una-foto", quien: sesion.user.id, sobre: r.foto.alt, sobreId: r.foto.id });
    return r;
  } catch (e) {
    // Si esto tira sin capturar, Next reemplaza el editor por su pantalla de error: mejor un aviso en el campo.
    return { ...fallo("subirFoto", e), detalle: "No se pudo guardar la foto; probá de nuevo en un rato." };
  }
}

export async function editarAltDeFoto(pedido: { id: string; alt: string }): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const id = z.uuid().safeParse(pedido?.id);
    if (!id.success) return MAL_PEDIDO;
    const r = await editarAltEnBase(base, { id: id.data, alt: pedido.alt });
    if (!r.ok) return r;
    refrescarAdminDeFotos();
    return { ok: true, detalle: "Texto alternativo guardado. Los lugares donde ya está la foto conservan el suyo." };
  } catch (e) {
    return fallo("editarAltDeFoto", e);
  }
}

export async function reemplazarFoto(datos: FormData): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const id = z.uuid().safeParse(datos.get("id"));
    if (!id.success) return MAL_PEDIDO;
    const r = await reemplazarFotoEnBase(base, almacenDesdeEntorno(), { id: id.data, archivo: datos.get("archivo") });
    if (!r.ok) return r;
    regenerarSitio(r.regenerar);
    await registrarActividad({ tipo: "reemplazo-una-foto", quien: sesion.user.id, sobre: r.alt || undefined, sobreId: id.data });
    return { ok: true, detalle: "Archivo reemplazado: cada lugar que usaba la foto ya muestra el nuevo." };
  } catch (e) {
    return fallo("reemplazarFoto", e);
  }
}

export async function borrarFoto(pedido: { id: string }): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const id = z.uuid().safeParse(pedido?.id);
    if (!id.success) return MAL_PEDIDO;
    const r = await borrarFotoEnBase(base, almacenDesdeEntorno(), { id: id.data });
    if (!r.ok) return r;
    refrescarAdminDeFotos();
    await registrarActividad({ tipo: "borro-una-foto", quien: sesion.user.id, sobre: r.alt || undefined, sobreId: id.data });
    return { ok: true, detalle: r.delRepositorio ? "Se borró de la biblioteca. El archivo es del repositorio y queda ahí." : "Se borró la foto." };
  } catch (e) {
    return fallo("borrarFoto", e);
  }
}

/** Las fotos que el campo de foto de un formulario deja elegir. Sin sesión o sin permiso, ninguna. */
export async function fotosParaElegir(): Promise<FotoParaElegir[]> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return [];
  if (!puede(sesion.user.rol, "editarContenido")) return [];
  return paraElegir();
}
