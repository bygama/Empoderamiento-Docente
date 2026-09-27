import type { Metadata } from "next";
import { IndiceDeContenido } from "@/admin/contenido/IndiceDeContenido";
import { listaDeAliados } from "@/datos/consultas/aliados-del-admin";
import { listaDeCasos } from "@/datos/consultas/casos-del-admin";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";
import { cuentaDeFotos } from "@/datos/consultas/fotos";

export const metadata: Metadata = { title: "Contenido" };

export default async function Contenido() {
  const [paginas, casos, aliados, fotos] = await Promise.all([listaDePaginas(), listaDeCasos(), listaDeAliados(), cuentaDeFotos()]);
  return <IndiceDeContenido paginas={paginas} casos={casos} aliados={aliados} fotos={fotos} />;
}
