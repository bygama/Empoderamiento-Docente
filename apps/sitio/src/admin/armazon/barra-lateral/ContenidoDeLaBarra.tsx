import Image from "next/image";
import Link from "next/link";
import { MenuDeLaCuenta, type Usuario } from "./MenuDeLaCuenta";
import { MenuDelAdmin } from "./MenuDelAdmin";
import type { Tema } from "../tema";

export type { Usuario };

type Props = {
  usuario: Usuario;
  tema: Tema;
  /** Si ve Cuentas y Ajustes. */
  conConfiguracion: boolean;
  /** Las claves de los módulos que llevan el punto de «cambios sin publicar». */
  conPunto: readonly string[];
};

/**
 * Lo que tiene la sidebar, igual en escritorio y en el panel del celular: la
 * marca, el menú y el pie con la cuenta. El isotipo es el actual de ED, el
 * del navbar y el pie del sitio (logotipo-principal-ed): no tiene margen
 * transparente, así que queda centrado en su ficha. Va a 28 px de alto (el
 * manual pide 24 como mínimo, §10), en su versión negativa en el modo
 * oscuro, y el nombre al lado, en texto: por eso la imagen no lleva `alt`.
 * Un divisor separa la marca del menú, igual que el que separa la cuenta.
 */
export function ContenidoDeLaBarra({ usuario, tema, conConfiguracion, conPunto }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm shadow-azul-principal/10">
            <Image src="/brand/logotipo-principal-ed.png" alt="" width={425} height={467} sizes="26px" className="h-7 w-auto dark:hidden" />
            <Image src="/brand/logotipo-principal-ed-negativo.png" alt="" width={395} height={433} sizes="26px" className="hidden h-7 w-auto dark:block" />
          </span>
          <span className="min-w-0">
            <span className="block text-admin-meta font-semibold text-azul-principal">Empoderamiento Docente</span>
            <span className="block text-admin-meta text-azul-medio">Admin del sitio</span>
          </span>
        </Link>
        <hr className="mx-3 mt-4 border-azul-claro/60" />
      </div>
      <MenuDelAdmin conConfiguracion={conConfiguracion} conPunto={conPunto} />
      <MenuDeLaCuenta usuario={usuario} tema={tema} />
    </div>
  );
}
