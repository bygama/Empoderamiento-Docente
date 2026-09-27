import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { AgregarMaterial } from "@/admin/biblioteca/AgregarMaterial";
import { vecinosDeMaterial } from "@/datos/consultas/ficha-de-material";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Agregar material" };

// «Agregar material»: primero el DOI, el ISBN o el link, y después la ficha,
// sin fila todavía: el primer guardado la crea. Un GET que creara filas lo
// dispararía el prefetch de cualquier link. La guarda del layout solo oculta
// la interfaz: el permiso se corta acá, antes de leer nada.
export default async function NuevoMaterial() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarBiblioteca")) return <SinPermiso capacidad="editarBiblioteca" rol={sesion.user.rol} />;
  return <AgregarMaterial vecinos={await vecinosDeMaterial()} />;
}
