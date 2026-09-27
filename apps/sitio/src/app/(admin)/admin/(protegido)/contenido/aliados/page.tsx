import type { Metadata } from "next";
import { Aviso, BotonEnlace, EstadoVacio } from "@ed/kit-admin";
import { ListaDeAliados } from "@/admin/aliados/ListaDeAliados";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { listaDeAliados } from "@/datos/consultas/aliados-del-admin";

export const metadata: Metadata = { title: "Aliados" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Contenido › Aliados (SPEC §7.2 de `work/casos-aliados-fotos/`): la lista en
// el orden de la tira y «Nuevo aliado» de primario. De los tres roles: la
// guarda del layout de Contenido alcanza; la marca la chequea su acción.
export default async function Aliados({ searchParams }: Props) {
  const [{ borrado }, filas] = await Promise.all([searchParams, listaDeAliados()]);
  const nuevo = (
    <BotonEnlace variante="primario" href="/admin/contenido/aliados/nuevo">
      Nuevo aliado
    </BotonEnlace>
  );
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido
        detalle="Los logos de la tira del sitio, en su orden. Sin la marca «Autorizado», un logo no se publica."
        acciones={filas.length ? nuevo : undefined}
        avisos={borrado === "1" ? <Aviso tono="bien">Se borró el aliado.</Aviso> : undefined}
      />
      {filas.length ? (
        <ListaDeAliados filas={filas} />
      ) : (
        <EstadoVacio titulo="Todavía no hay aliados." texto="Un aliado es una organización con la que ED trabaja y que autorizó el uso de su logo." accion={nuevo} />
      )}
    </div>
  );
}
