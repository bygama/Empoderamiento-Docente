"use client";

import type { Pestana } from "@ed/kit-admin";
import type { PaginaEnRevision, VersionEnLista } from "@/datos/consultas/historial-de-paginas";
import { ListaDeVersiones } from "./ListaDeVersiones";
import { PantallaDeRevision } from "./PantallaDeRevision";

type Props = { pagina: PaginaEnRevision; pestanas: readonly Pestana[]; versiones: readonly VersionEnLista[]; cambios: string };

/**
 * La pestaña «Versiones»: sin acciones en el encabezado, y la lista abajo con
 * las acciones de la página a mano, así restaurar actualiza el estado y el
 * aviso del encabezado. Es del navegador solo para pasar esa función.
 */
export function PantallaDeVersiones({ pagina, pestanas, versiones, cambios }: Props) {
  return (
    <PantallaDeRevision pagina={pagina} pestanas={pestanas} conAcciones={false}>
      {(acciones) => <ListaDeVersiones slug={pagina.slug} versiones={versiones} cambios={cambios} acciones={acciones} />}
    </PantallaDeRevision>
  );
}
