import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { FichaDeMaterial } from "@/admin/biblioteca/FichaDeMaterial";
import { fichaDeMaterial, vecinosDeMaterial } from "@/datos/consultas/ficha-de-material";
import { sesionActual } from "@/datos/sesion";

type Props = { params: Promise<{ id: string }> };

/** El id de la URL, si tiene la forma de uno: lo demás es un 404 sin ir a la base. */
async function idDe(params: Props["params"]): Promise<string | null> {
  const valido = z.uuid().safeParse((await params).id);
  return valido.success ? valido.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sesion = await sesionActual();
  if (!puede(sesion?.user.rol, "editarBiblioteca")) return { title: "Biblioteca" };
  const id = await idDe(params);
  const ficha = id ? await fichaDeMaterial(id) : null;
  return { title: ficha?.documento.titulo.trim() || "Nuevo material" };
}

// La ficha de un material. La guarda del layout solo oculta la interfaz: el
// permiso se corta acá, antes de leer nada.
export default async function PaginaDelMaterial({ params }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarBiblioteca")) return <SinPermiso capacidad="editarBiblioteca" rol={sesion.user.rol} />;
  const id = await idDe(params);
  const [ficha, vecinos] = await Promise.all([id ? fichaDeMaterial(id) : null, vecinosDeMaterial()]);
  if (!ficha) notFound();
  // La `key` rearma la ficha si se navega de un material a otro.
  return <FichaDeMaterial key={ficha.id} ficha={ficha} vecinos={vecinos} />;
}
