"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { CANALES_DE_ENLACE, type CanalDeEnlace } from "@/config/metricas";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";
import { borrarEnlace, crearEnlace } from "@/datos/enlaces";
import { urlDelSitio } from "@/lib/url-del-sitio";

// Los links para compartir de Métricas (work/metricas-completas/SPEC.md §6.4):
// sesión, `verMetricas`, Zod —la página tiene que ser una de las que el sitio
// muestra hoy— y la actividad.

const PANTALLA = "/admin/metricas/enlaces";

const esquemaDeCrear = z.object({
  nombre: z.string().trim().min(3, "El nombre tiene que tener al menos 3 caracteres.").max(60, "El nombre puede tener hasta 60 caracteres."),
  destino: z.string().max(300),
  canal: z.enum(Object.keys(CANALES_DE_ENLACE) as [CanalDeEnlace, ...CanalDeEnlace[]], "Elegí dónde lo vas a compartir."),
});
const esquemaDeBorrar = z.object({ id: z.string().min(1).max(100) });

export type ResultadoDeEnlace = { ok: true; detalle: string; link: string } | { ok: false; detalle: string };

export async function crearEnlaceDesdeElAdmin(pedido: { nombre: string; destino: string; canal: string }): Promise<ResultadoDeEnlace> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para crear un link." };
    if (!puede(sesion.user.rol, "verMetricas")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeCrear.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: valido.error.issues[0]?.message ?? "Revisá los datos del link." };
    const { nombre, destino, canal } = valido.data;
    if (!(await rutasDelSitio()).includes(destino)) return { ok: false, detalle: "Esa página no está en el sitio: elegí otra." };
    const enlace = await crearEnlace({ nombre, destino, canal, creadoPor: sesion.user.name });
    revalidatePath(PANTALLA);
    await registrarActividad({ tipo: "creo-un-enlace", quien: sesion.user.id, sobre: nombre });
    const link = `${urlDelSitio()}/l/${enlace.codigo}`;
    return { ok: true, detalle: `Listo: tu link es ${link}`, link };
  } catch (e) {
    console.error("crearEnlaceDesdeElAdmin:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo crear el link; probá de nuevo en un rato." };
  }
}

export async function borrarEnlaceDesdeElAdmin(pedido: { id: string }): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para borrar un link." };
    if (!puede(sesion.user.rol, "verMetricas")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeBorrar.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const borrado = await borrarEnlace(valido.data.id);
    if (!borrado) return { ok: false, detalle: "Ese link ya no estaba." };
    revalidatePath(PANTALLA);
    await registrarActividad({ tipo: "borro-un-enlace", quien: sesion.user.id, sobre: borrado.nombre });
    return { ok: true, detalle: `Se borró el link «${borrado.nombre}».` };
  } catch (e) {
    console.error("borrarEnlaceDesdeElAdmin:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo borrar el link; probá de nuevo en un rato." };
  }
}
