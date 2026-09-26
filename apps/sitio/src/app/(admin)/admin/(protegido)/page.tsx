import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inicio } from "@/admin/inicio/Inicio";
import { inicioPara } from "@/datos/inicio/inicio";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Inicio" };

// Sin guarda de módulo: el Inicio es de toda sesión, y lo que cada rol ve
// adentro lo filtran los registros de `datos/inicio/`. La sesión ya la
// verificó el layout protegido.
export default async function InicioDelAdmin() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  return <Inicio datos={await inicioPara(sesion)} rol={sesion.user.rol} />;
}
