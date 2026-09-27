import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { ListaDeConexiones } from "@/admin/ajustes/conexiones/ListaDeConexiones";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { estadoDeLasConexiones } from "@/datos/conexiones";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Conexiones" };

// Ajustes › Conexiones (work/ajustes/SPEC.md §2.6).
export default async function Conexiones() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <ListaDeConexiones conexiones={await estadoDeLasConexiones(sesion.user.rol)} />;
}
