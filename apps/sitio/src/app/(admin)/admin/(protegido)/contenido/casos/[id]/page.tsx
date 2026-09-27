import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FichaDeCaso } from "@/admin/casos/FichaDeCaso";
import { fichaDeCaso } from "@/datos/consultas/casos-del-admin";

type Props = { params: Promise<{ id: string }> };

// Subir una lámina corre en la función de esta página: una foto de 4 MB a Blob puede tardar más que el default.
export const maxDuration = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await fichaDeCaso((await params).id);
  return { title: ficha ? `Caso ${ficha.numero} · Casos` : "Casos" };
}

// La ficha de un caso (SPEC §7.1). El id es uno de los cuatro fijos
// (`caso-01`…): cualquier otro es un 404 sin ir a la base.
export default async function PaginaDelCaso({ params }: Props) {
  const ficha = await fichaDeCaso((await params).id);
  if (!ficha) notFound();
  // La `key` rearma la ficha si se navega de un caso a otro.
  return <FichaDeCaso key={ficha.id} ficha={ficha} />;
}
