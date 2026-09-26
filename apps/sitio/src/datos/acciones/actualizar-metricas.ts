"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { SIN_PERMISO, puede } from "@ed/auth";
import { auth } from "@/datos/auth";
import { correrAMano } from "@/datos/tareas/a-mano";
import { copiaDeVercel, copiarMetricas } from "@/datos/tareas/metricas-de-vercel";
import { hayVariablesDeMetricas } from "@/lib/metricas/entorno";

// Una Server Action corre antes de que se renderice el layout protegido, así
// que el layout no la cubre y el proxy solo mira que la cookie exista:
// la sesión se verifica acá. El freno de diez minutos es de `correrAMano`.

export async function actualizarMetricasAhora(): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para actualizar." };
    if (!puede(sesion.user.rol, "verMetricas")) return { ok: false, detalle: SIN_PERMISO };
    // Sin variables no hay nada que copiar, y esa corrida no se registra: no
    // tocó la API, así que no tiene por qué frenar al botón.
    if (!hayVariablesDeMetricas()) return { ok: false, detalle: "Faltan las variables de Vercel: ver el README." };

    const resultado = await correrAMano(copiaDeVercel.clave, () => copiarMetricas({ minimoDias: 3 }));
    revalidatePath("/admin");
    revalidatePath("/admin/metricas");
    return resultado;
  } catch (e) {
    // Si esto tira sin capturar, Next reemplaza toda la pantalla por su error
    // genérico: mejor un aviso en el panel, como el resto. El mensaje al panel
    // es en llano; el detalle va al log del servidor.
    console.error("actualizarMetricasAhora:", e);
    return { ok: false, detalle: "No se pudo actualizar; probá de nuevo en un rato." };
  }
}
