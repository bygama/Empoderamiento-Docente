import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { puede, quienPuede } from "@ed/auth";
import { FichaDeAliado } from "@/admin/aliados/FichaDeAliado";
import { fichaDeAliado } from "@/datos/consultas/aliados-del-admin";
import { sesionActual } from "@/datos/sesion";

type Props = { params: Promise<{ id: string }> };

// Una foto de 4 MB a Blob puede tardar más que el default: la subida corre en la función de esta página.
export const maxDuration = 60;

/** El id de la URL, si tiene la forma de uno: lo demás es un 404 sin ir a la base. */
async function idDe(params: Props["params"]): Promise<string | null> {
  const valido = z.uuid().safeParse((await params).id);
  return valido.success ? valido.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await idDe(params);
  const ficha = id ? await fichaDeAliado(id) : null;
  return { title: `${ficha?.documento.nombre.trim() || "Aliado"} · Aliados` };
}

// La ficha de un aliado (SPEC §7.2). La marca la ve todo el que edita el
// contenido; ponerla es de quien puede `autorizarAliados`, y la acción lo
// vuelve a chequear.
export default async function PaginaDelAliado({ params }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  const id = await idDe(params);
  const ficha = id ? await fichaDeAliado(id) : null;
  if (!ficha) notFound();
  // La `key` rearma la ficha si se navega de un aliado a otro.
  return <FichaDeAliado key={ficha.id} ficha={ficha} puedeAutorizar={puede(sesion.user.rol, "autorizarAliados")} quienPuede={quienPuede("autorizarAliados")} />;
}
