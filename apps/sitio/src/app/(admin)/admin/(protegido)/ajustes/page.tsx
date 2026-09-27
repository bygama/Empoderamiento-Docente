import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { IndiceDeAjustes } from "@/admin/ajustes/IndiceDeAjustes";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { resumenDeAjustes } from "@/datos/consultas/ajustes";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Ajustes" };

// El índice de Ajustes (work/ajustes/SPEC.md §2.1).
export default async function Ajustes() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: esta página se renderiza
  // igual y viaja en el payload. El permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  const resumen = await resumenDeAjustes(sesion.user.rol);
  if (!resumen) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <IndiceDeAjustes resumen={resumen} />;
}
