import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FichaDeFoto } from "@/admin/fotos/FichaDeFoto";
import { tituloDeLaFoto } from "@/admin/fotos/formato";
import { fichaDeFoto } from "@/datos/consultas/fotos";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

// Reemplazar el archivo corre en la función de esta página: una foto de 4 MB a Blob puede tardar más que el default.
export const maxDuration = 60;

/** El id de la URL, si tiene la forma de uno: lo demás es un 404 sin ir a la base. */
async function idDe(params: Props["params"]): Promise<string | null> {
  const valido = z.uuid().safeParse((await params).id);
  return valido.success ? valido.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await idDe(params);
  const ficha = id ? await fichaDeFoto(id) : null;
  return { title: ficha ? `${tituloDeLaFoto(ficha.alt, 40)} · Fotos` : "Fotos" };
}

// La ficha de una foto (SPEC §7.3). De los tres roles: la guarda del layout
// de Contenido alcanza. `?subida=1`, de volver de subirla.
export default async function PaginaDeLaFoto({ params, searchParams }: Props) {
  const id = await idDe(params);
  const ficha = id ? await fichaDeFoto(id) : null;
  if (!ficha) notFound();
  const { subida } = await searchParams;
  return <FichaDeFoto key={ficha.id} ficha={ficha} subida={subida === "1"} />;
}
