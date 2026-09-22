import Image from "next/image";
import Link from "next/link";
import { SalirDelAdmin } from "@/admin/armazon/SalirDelAdmin";
import type { PaginaDelArbol } from "./arbol";
import { ArbolDelSitio } from "./ArbolDelSitio";

export type Usuario = { nombre: string; rol: string };

/**
 * Lo que tiene la sidebar, igual en escritorio y en el panel del celular: el
 * logo (160 px: el manual pide 120 como mínimo para el logo completo, §10),
 * el árbol y el pie con la cuenta.
 */
export function ContenidoDeLaBarra({ usuario, arbol }: { usuario: Usuario; arbol: PaginaDelArbol[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-2">
        <Link href="/admin" className="inline-block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azul-claro">
          <Image src="/brand/logo-ed-negativo.png" alt="Empoderamiento Docente: inicio del admin" width={1252} height={608} sizes="160px" className="h-auto w-40" />
        </Link>
      </div>
      <ArbolDelSitio arbol={arbol} />
      <div className="border-t border-white/15 px-6 py-4">
        <p className="text-sm font-medium text-white">{usuario.nombre}</p>
        <p className="text-xs text-azul-claro">{usuario.rol}</p>
        <div className="mt-3">
          <SalirDelAdmin />
        </div>
      </div>
    </div>
  );
}
