import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { leerFiltros } from "@/admin/biblioteca/filtros";
import { PantallaDeBiblioteca } from "@/admin/biblioteca/PantallaDeBiblioteca";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Biblioteca" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La lista de materiales, la puerta del módulo. Los filtros y lo buscado
// llegan en la URL; `?borrado=1`, de volver de borrar un material.
export default async function PaginaDeLaBiblioteca({ searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "editarBiblioteca")) return <SinPermiso capacidad="editarBiblioteca" rol={sesion.user.rol} />;
  const parametros = await searchParams;
  return <PantallaDeBiblioteca filtros={leerFiltros(parametros)} borrado={parametros.borrado === "1"} />;
}
