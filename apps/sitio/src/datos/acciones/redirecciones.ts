"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";
import { agregarRedireccionEnBase, borrarRedireccionEnBase, type ResultadoDeAgregar } from "./editar-redirecciones";

// Las redirecciones a mano de Ajustes › SEO (work/ajustes/SPEC.md §5.1).
// Sesión, `usarAjustes`, la validación contra las rutas del sitio, la ruta
// vieja revalidada (por si su 404 quedó guardado) y la actividad.

const PANTALLA = "/admin/ajustes/seo";
const esquemaDeAgregar = z.object({ desde: z.string().max(300), hacia: z.string().max(300) });
const esquemaDeBorrar = z.object({ id: z.string().min(1).max(100) });

const flecha = ({ desde, hacia }: { desde: string; hacia: string }) => `${desde} → ${hacia}`;

export async function agregarRedireccion(pedido: { desde: string; hacia: string }): Promise<ResultadoDeAgregar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para agregar una redirección." };
    if (!puede(sesion.user.rol, "usarAjustes")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeAgregar.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const resultado = await agregarRedireccionEnBase(base, valido.data, await rutasDelSitio());
    if (resultado.ok) {
      revalidatePath(resultado.redireccion.desde);
      revalidatePath(PANTALLA);
      await registrarActividad({ tipo: "agrego-una-redireccion", quien: sesion.user.id, sobre: flecha(resultado.redireccion) });
    }
    return resultado;
  } catch (e) {
    console.error("agregarRedireccion:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo agregar; probá de nuevo en un rato." };
  }
}

export async function borrarRedireccion(pedido: { id: string }): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para borrar una redirección." };
    if (!puede(sesion.user.rol, "usarAjustes")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeBorrar.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const resultado = await borrarRedireccionEnBase(base, valido.data.id);
    if (!resultado.ok) return resultado;
    revalidatePath(resultado.redireccion.desde);
    revalidatePath(PANTALLA);
    await registrarActividad({ tipo: "borro-una-redireccion", quien: sesion.user.id, sobre: flecha(resultado.redireccion) });
    return { ok: true, detalle: `Se borró la redirección desde ${resultado.redireccion.desde}: esa ruta vuelve a dar la página de error.` };
  } catch (e) {
    console.error("borrarRedireccion:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo borrar; probá de nuevo en un rato." };
  }
}
