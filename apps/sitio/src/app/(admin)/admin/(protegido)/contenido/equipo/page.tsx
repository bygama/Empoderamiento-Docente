import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { Aviso, BotonEnlace, EstadoVacio } from "@ed/kit-admin";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { ListaDelEquipo } from "@/admin/equipo/ListaDelEquipo";
import { listaDelEquipo } from "@/datos/consultas/equipo-del-admin";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Equipo" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Contenido › Equipo (SPEC §7.1 de `work/equipo/`): los perfiles por nivel,
// en el orden de Quiénes somos, y «Nuevo perfil» de primario. La guarda del
// layout solo oculta la interfaz: el permiso se corta acá, antes de leer.
export default async function Equipo({ searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarContenido")) return <SinPermiso capacidad="editarContenido" rol={sesion.user.rol} />;
  const [{ borrado }, filas] = await Promise.all([searchParams, listaDelEquipo()]);
  const nuevo = (
    <BotonEnlace variante="primario" href="/admin/contenido/equipo/nuevo">
      Nuevo perfil
    </BotonEnlace>
  );
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido
        detalle="Los perfiles de Quiénes somos, por nivel y en el orden de la página. El orden cambia el sitio en el momento."
        acciones={filas.length ? nuevo : undefined}
        avisos={borrado === "1" ? <Aviso tono="bien">Se borró el perfil.</Aviso> : undefined}
      />
      {filas.length ? (
        <ListaDelEquipo filas={filas} />
      ) : (
        <EstadoVacio titulo="Todavía no hay perfiles." texto="Cada perfil es una tarjeta en Quiénes somos y, si tiene recorrido, su trayectoria." accion={nuevo} />
      )}
    </div>
  );
}
