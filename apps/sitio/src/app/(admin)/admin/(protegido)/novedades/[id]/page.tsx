import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FichaDeNovedad } from "@/admin/novedades/FichaDeNovedad";
import { opcionesDePublicacion } from "@/admin/novedades/publicaciones";
import { fichaDeNovedad, vecinasDe } from "@/datos/consultas/ficha-de-novedad";

type Props = { params: Promise<{ id: string }> };

/** El id de la URL, si tiene la forma de uno: lo demás es un 404 sin ir a la base. */
async function idDe(params: Props["params"]): Promise<string | null> {
  const valido = z.uuid().safeParse((await params).id);
  return valido.success ? valido.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await idDe(params);
  const ficha = id ? await fichaDeNovedad(id) : null;
  return { title: ficha?.documento.titulo.trim() || "Nueva novedad" };
}

export default async function PaginaDeLaNovedad({ params }: Props) {
  const id = await idDe(params);
  const [ficha, vecinas] = await Promise.all([id ? fichaDeNovedad(id) : null, vecinasDe()]);
  if (!ficha) notFound();
  // La `key` rearma la ficha si se navega de una novedad a otra.
  return <FichaDeNovedad key={ficha.id} ficha={ficha} vecinas={vecinas} publicaciones={opcionesDePublicacion()} />;
}
