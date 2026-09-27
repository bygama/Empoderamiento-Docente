import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { AgregarMaterial } from "@/admin/biblioteca/AgregarMaterial";
import { personaParaAutoria } from "@/datos/consultas/equipo-del-admin";
import { vecinosDeMaterial } from "@/datos/consultas/ficha-de-material";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Agregar material" };

type Props = { searchParams: Promise<{ persona?: string | string[] }> };

// «Agregar material»: primero el DOI, el ISBN o el link, y después la ficha,
// sin fila todavía: el primer guardado la crea. Un GET que creara filas lo
// dispararía el prefetch de cualquier link. La guarda del layout solo oculta
// la interfaz: el permiso se corta acá, antes de leer nada. Desde el perfil de
// una persona del Equipo llega `?persona=<id>`: la trae elegida como autora
// (work/equipo/SPEC.md §7.3); una que no existe se ignora.
export default async function NuevoMaterial({ searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarBiblioteca")) return <SinPermiso capacidad="editarBiblioteca" rol={sesion.user.rol} />;
  const id = z.uuid().safeParse((await searchParams).persona);
  const [vecinos, persona] = await Promise.all([vecinosDeMaterial(), id.success ? personaParaAutoria(id.data) : null]);
  return <AgregarMaterial vecinos={vecinos} persona={persona} />;
}
