import type { Metadata } from "next";
import { PantallaDeNovedades } from "@/admin/novedades/PantallaDeNovedades";

export const metadata: Metadata = { title: "Novedades" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Publicadas, la puerta del módulo. Lo buscado llega en `?q=`; `?borrada=1`,
// de volver de borrar una novedad.
export default async function PaginaDeNovedades({ searchParams }: Props) {
  const { q, borrada } = await searchParams;
  return <PantallaDeNovedades pestana="publicadas" q={typeof q === "string" && q.trim() ? q.trim().slice(0, 100) : undefined} borrada={borrada === "1"} />;
}
