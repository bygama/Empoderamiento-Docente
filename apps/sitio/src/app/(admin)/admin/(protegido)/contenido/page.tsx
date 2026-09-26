import type { Metadata } from "next";
import { IndiceDeContenido } from "@/admin/contenido/IndiceDeContenido";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";

export const metadata: Metadata = { title: "Contenido" };

export default async function Contenido() {
  return <IndiceDeContenido paginas={await listaDePaginas()} />;
}
