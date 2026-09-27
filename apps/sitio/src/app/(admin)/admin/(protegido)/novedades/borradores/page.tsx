import type { Metadata } from "next";
import { PantallaDeNovedades } from "@/admin/novedades/PantallaDeNovedades";

// «Borradores» solo es ambiguo (DESIGN.md §11, «Título de pestaña»): lleva el módulo.
export const metadata: Metadata = { title: "Borradores · Novedades" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Las que no están en el sitio: las que nunca se publicaron y las despublicadas.
export default async function PaginaDeBorradores({ searchParams }: Props) {
  const { q } = await searchParams;
  return <PantallaDeNovedades pestana="borradores" q={typeof q === "string" && q.trim() ? q.trim().slice(0, 100) : undefined} />;
}
