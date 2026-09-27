import type { Metadata } from "next";
import { IndiceDeContenido } from "@/admin/contenido/IndiceDeContenido";
import { listaDeAliados } from "@/datos/consultas/aliados-del-admin";
import { listaDeCasos } from "@/datos/consultas/casos-del-admin";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";
import { listaDelEquipo } from "@/datos/consultas/equipo-del-admin";
import { cuentaDeFotos } from "@/datos/consultas/fotos";

export const metadata: Metadata = { title: "Contenido" };

export default async function Contenido() {
  const [paginas, casos, equipo, aliados, fotos] = await Promise.all([listaDePaginas(), listaDeCasos(), listaDelEquipo(), listaDeAliados(), cuentaDeFotos()]);
  return <IndiceDeContenido paginas={paginas} casos={casos} equipo={equipo} aliados={aliados} fotos={fotos} />;
}
