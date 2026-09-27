"use server";

import { headers } from "next/headers";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { almacenDesdeEntorno } from "@/lib/contenido/almacen";
import { subirFotoEnBase, type ResultadoDeSubida } from "./subir-foto";

// Subir una foto, desde la biblioteca o desde el campo de foto de cualquier
// formulario (SPEC §3.4 de `work/casos-aliados-fotos/`). Empieza por la
// sesión, como toda Server Action del admin (AGENTS.md §12); lo demás está en
// subir-foto.ts. Queda en la actividad aunque todavía no cambie el sitio: la
// foto ya está en la biblioteca (SPEC §9; `VA_AL_INICIO` la deja fuera del
// Inicio).

export async function subirFoto(datos: FormData): Promise<ResultadoDeSubida> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para subir fotos." };
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const r = await subirFotoEnBase(base, almacenDesdeEntorno(), { archivo: datos.get("archivo"), alt: datos.get("alt"), quien: sesion.user.name });
    if (r.ok) await registrarActividad({ tipo: "subio-una-foto", quien: sesion.user.id, sobre: r.foto.alt, sobreId: r.foto.id });
    return r;
  } catch (e) {
    // Si esto tira sin capturar, Next reemplaza el editor por su pantalla de error: mejor un aviso en el campo.
    console.error("subirFoto:", e instanceof Error ? e.name : "error");
    return { ok: false, detalle: "No se pudo guardar la foto; probá de nuevo en un rato." };
  }
}
