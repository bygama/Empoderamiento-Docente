import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { FormularioDelSitio } from "@/admin/ajustes/sitio/FormularioDelSitio";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { datosDelSitioParaEditar } from "@/datos/consultas/sitio";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Datos del sitio" };

// Ajustes › Datos del sitio (work/ajustes/SPEC.md §2.2).
export default async function DatosDelSitio() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  const datos = await datosDelSitioParaEditar(sesion.user.rol);
  if (!datos) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <FormularioDelSitio inicial={datos.valores} cambiadoEn={datos.cambiadoEn?.toISOString() ?? null} cambiadoPor={datos.cambiadoPor} />;
}
