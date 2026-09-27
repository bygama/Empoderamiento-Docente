"use client";

import type { Pestana } from "@ed/kit-admin";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { CLAVE_SEO } from "@/lib/contenido/buscador";
import { EditorDePagina } from "./EditorDePagina";
import { VistaPreviaSeo } from "./VistaPreviaSeo";

/**
 * La pestaña SEO: el editor con la parte `seo` sola y, abajo, cómo se ve con
 * lo que está en pantalla. Es un componente del navegador solo para pasarle
 * al editor esa vista previa: una función no viaja del servidor.
 */
export function EditorDeSeo({ pagina, pestanas }: { pagina: PaginaParaEditar; pestanas: readonly Pestana[] }) {
  return <EditorDePagina pagina={pagina} pestanas={pestanas} aparte={(contenidos) => <VistaPreviaSeo valor={contenidos[CLAVE_SEO]} ruta={pagina.ruta} />} />;
}
