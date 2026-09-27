import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { FichaDeMaterial } from "@/admin/biblioteca/FichaDeMaterial";
import { vecinosDeMaterial } from "@/datos/consultas/ficha-de-material";
import { sesionActual } from "@/datos/sesion";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";

export const metadata: Metadata = { title: "Agregar material" };

// La ficha vacía, sin fila todavía: el primer guardado la crea. Un GET que
// creara filas lo dispararía el prefetch de cualquier link.
export default async function NuevoMaterial() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarBiblioteca")) return <SinPermiso capacidad="editarBiblioteca" rol={sesion.user.rol} />;
  const vecinos = await vecinosDeMaterial();
  const estado = { publicado: false, publicadoEn: null, publicadoPor: null, borradorEn: null, borradorPor: null };
  return <FichaDeMaterial ficha={{ id: null, documento: borradorVacio(), publicado: null, estado, chequeo: null, novedades: [] }} vecinos={vecinos} />;
}
