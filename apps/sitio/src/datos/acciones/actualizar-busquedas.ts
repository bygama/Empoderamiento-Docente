"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/datos/auth";
import { correrAMano } from "@/datos/tareas/a-mano";
import { copiarBusquedas, copiaDeSearchConsole } from "@/datos/tareas/busquedas-de-google";
import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";

// «Actualizar ahora» de Búsquedas: pide otra vez los últimos cinco días, por
// lo que Google cerró tarde. La sesión se verifica acá (el layout no cubre a
// las acciones); el freno de diez minutos es de `correrAMano`.

export async function actualizarBusquedasAhora(): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para actualizar." };
    // Sin conexión no hay nada que copiar, y esa corrida no se registra: no
    // tocó la API, así que no tiene por qué frenar al botón.
    if (!hayVariablesDeBusquedas()) return { ok: false, detalle: "Search Console todavía no está conectado." };

    const resultado = await correrAMano(copiaDeSearchConsole.clave, () => copiarBusquedas({ minimoDias: 5 }));
    revalidatePath("/admin/metricas/busquedas");
    return resultado;
  } catch (e) {
    console.error("actualizarBusquedasAhora:", e);
    return { ok: false, detalle: "No se pudo actualizar; probá de nuevo en un rato." };
  }
}
