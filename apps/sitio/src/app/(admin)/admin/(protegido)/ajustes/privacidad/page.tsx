import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { PantallaDePrivacidad } from "@/admin/ajustes/privacidad/PantallaDePrivacidad";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { plazosParaEditar } from "@/datos/privacidad";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Privacidad" };

// Ajustes › Privacidad (work/ajustes/SPEC.md §2.5).
export default async function Privacidad() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  const plazos = await plazosParaEditar(sesion.user.rol);
  if (!plazos) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <PantallaDePrivacidad plazos={plazos} />;
}
