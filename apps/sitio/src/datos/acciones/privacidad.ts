"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { TOPES, enPalabras, esquemaDePlazos, type Plazo } from "@/config/privacidad";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { cuantoSeBorraria, ponerPlazos, type Cambio } from "./editar-plazos";

// Ajustes › Privacidad (work/ajustes/SPEC.md §2.5): los plazos de retención.
// Sesión, `usarAjustes` y los topes; **acortar con algo que borrar pide
// confirmación**: sin `confirmado`, la acción cuenta cuánto se borraría y no
// guarda nada. Guardar revalida las páginas que dicen el plazo y anota la
// actividad.

export type ResultadoDePlazos =
  | { ok: true; detalle: string }
  | { ok: false; detalle: string; errores?: Partial<Record<Plazo, string>>; seBorrarian?: { contacto: number; cv: number } };

const esquemaDelPedido = esquemaDePlazos.extend({ confirmado: z.boolean() });

const cuantos = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** «CV, de 12 meses a 6 meses»: lo que va a la actividad. */
const comoCambio = ({ que, antes, ahora }: Cambio) => `${TOPES[que].nombre}, de ${enPalabras(que, antes)} a ${enPalabras(que, ahora)}`;

export async function guardarPlazos(pedido: { cv: number; contacto: number; spam: number; confirmado: boolean }): Promise<ResultadoDePlazos> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para cambiar los plazos." };
    if (!puede(sesion.user.rol, "usarAjustes")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDelPedido.safeParse(pedido);
    if (!valido.success) {
      const errores: Partial<Record<Plazo, string>> = {};
      for (const { path, message } of valido.error.issues) if (path[0] === "cv" || path[0] === "contacto" || path[0] === "spam") errores[path[0]] ??= message;
      return { ok: false, detalle: "Hay plazos fuera de sus topes.", errores };
    }
    const { confirmado, ...nuevos } = valido.data;
    if (!confirmado) {
      const seBorrarian = await cuantoSeBorraria(base, nuevos);
      if (seBorrarian.contacto || seBorrarian.cv) {
        const que = [seBorrarian.contacto ? cuantos(seBorrarian.contacto, "mensaje de Contacto", "mensajes de Contacto") : "", seBorrarian.cv ? cuantos(seBorrarian.cv, "CV", "CV") : ""];
        return { ok: false, detalle: `Con estos plazos, la próxima limpieza diaria borra ${que.filter(Boolean).join(" y ")}. No se puede deshacer.`, seBorrarian };
      }
    }
    const cambios = await ponerPlazos(base, nuevos, sesion.user.name);
    if (!cambios.length) return { ok: true, detalle: "No cambió ningún plazo." };
    for (const ruta of ["/contacto", "/sumate-al-equipo"]) revalidatePath(ruta);
    revalidatePath("/admin", "layout");
    await registrarActividad({ tipo: "cambio-los-plazos-de-guarda", quien: sesion.user.id, sobre: cambios.map(comoCambio).join("; ") });
    return { ok: true, detalle: `Listo: ${cambios.map(comoCambio).join("; ")}. Los formularios del sitio ya lo dicen.` };
  } catch (e) {
    console.error("guardarPlazos:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudieron guardar los plazos; probá de nuevo en un rato." };
  }
}
