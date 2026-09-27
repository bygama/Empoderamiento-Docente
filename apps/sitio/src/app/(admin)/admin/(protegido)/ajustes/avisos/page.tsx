import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { PantallaDeAvisos } from "@/admin/ajustes/avisos/PantallaDeAvisos";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { avisosDeTodas } from "@/datos/avisos";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Avisos" };

// Ajustes › Avisos (work/ajustes/SPEC.md §2.4).
export default async function Avisos() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá,
  // antes de leer los nombres y los correos de las cuentas.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <PantallaDeAvisos avisos={await avisosDeTodas(sesion.user.rol)} />;
}
