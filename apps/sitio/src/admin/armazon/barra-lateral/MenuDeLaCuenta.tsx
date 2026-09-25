"use client";

import Link from "next/link";
import { useId } from "react";
import { SalirDelAdmin } from "@/admin/armazon/SalirDelAdmin";
import { ArrowUpRight, Persona, Selector } from "@/components/ui/icons";
import type { Tema } from "../tema";
import { SelectorDeTema } from "./SelectorDeTema";

export type Usuario = { nombre: string; rol: string };

const OPCION =
  "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-admin-meta text-azul-principal transition-colors hover:bg-gris-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

/**
 * El pie de la sidebar: quién sos y, al tocarlo, Mi cuenta · Ver el sitio ·
 * el tema · Salir. El menú es un `popover` nativo: se cierra con Escape o tocando
 * afuera sin JS propio, y queda por encima del panel del celular. Va fijo
 * arriba del pie porque la sidebar y el panel están los dos pegados abajo a
 * la izquierda. El id sale de `useId` porque la barra se dibuja dos veces
 * (escritorio y celular).
 */
export function MenuDeLaCuenta({ usuario, tema }: { usuario: Usuario; tema: Tema }) {
  const id = useId();
  // Navegar no lo cierra: el layout persiste, y el popover con él.
  const cerrar = () => document.getElementById(id)?.hidePopover();
  return (
    <div className="px-4 pb-4">
      <hr className="mx-3 mb-3 border-azul-claro/60" />
      <button
        type="button"
        popoverTarget={id}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
      >
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-azul-principal text-admin-meta font-medium text-white">
          {iniciales(usuario.nombre)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-admin-meta font-medium text-azul-principal">{usuario.nombre}</span>
          <span className="block text-admin-meta text-azul-medio">{usuario.rol}</span>
        </span>
        <Selector size={16} className="shrink-0 text-azul-medio" />
      </button>
      <div
        id={id}
        popover="auto"
        className="inset-auto bottom-20 left-4 m-0 w-64 rounded-xl border border-azul-claro/60 bg-white p-1.5 shadow-lg shadow-azul-principal/10"
      >
        <Link href="/admin/mi-cuenta" onClick={cerrar} className={OPCION}>
          <Persona size={18} className="shrink-0" />
          Mi cuenta
        </Link>
        <a href="/" target="_blank" rel="noreferrer" onClick={cerrar} className={OPCION}>
          <ArrowUpRight size={18} className="shrink-0" />
          Ver el sitio
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
        <hr className="my-1.5 border-azul-claro/60" />
        <SelectorDeTema tema={tema} />
        <hr className="my-1.5 border-azul-claro/60" />
        <SalirDelAdmin className={OPCION} />
      </div>
    </div>
  );
}
