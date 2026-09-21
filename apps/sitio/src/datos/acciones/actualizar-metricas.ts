"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { clienteDesdeEntorno } from "@/lib/metricas/entorno";
import { sincronizarMetricas } from "./sincronizar-metricas";

// Una Server Action corre antes de que se renderice el layout protegido, así
// que el layout no la cubre y el middleware solo mira que la cookie exista:
// la sesión se verifica acá. Y tiene freno: es el único disparador a mano de
// un token que abre toda la cuenta de Vercel.
const FRENO_MS = 10 * 60 * 1000;

export async function actualizarMetricasAhora(): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para actualizar." };

    const ultima = await base.sincronizacionMetricas.findFirst({ orderBy: { corridaEn: "desc" } });
    const hace = ultima ? Date.now() - ultima.corridaEn.getTime() : Infinity;
    if (hace < FRENO_MS) {
      const minutos = Math.max(1, Math.floor(hace / 60_000));
      return { ok: false, detalle: `La última corrida fue hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}; esperá un rato.` };
    }

    const cliente = clienteDesdeEntorno();
    if (!cliente) return { ok: false, detalle: "Faltan las variables de Vercel: ver el README." };

    const resultado = await sincronizarMetricas({ cliente, base, minimoDias: 3 });
    revalidatePath("/admin");
    return resultado;
  } catch {
    // Si esto tira sin capturar, Next reemplaza toda la portada del admin por
    // su pantalla de error genérica: mejor un aviso en el panel, como el resto.
    return { ok: false, detalle: "No se pudo actualizar; probá de nuevo en un rato." };
  }
}
