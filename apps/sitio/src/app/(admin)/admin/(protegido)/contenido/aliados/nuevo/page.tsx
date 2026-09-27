import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede, quienPuede } from "@ed/auth";
import { FichaDeAliado } from "@/admin/aliados/FichaDeAliado";
import { aliadoVacio } from "@/datos/consultas/aliados-del-admin";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Nuevo aliado" };

// Una foto de 4 MB a Blob puede tardar más que el default: la subida corre en la función de esta página.
export const maxDuration = 60;

// La ficha vacía, sin fila todavía: el primer guardado la crea, al final de
// la tira y sin autorizar. Un GET que creara filas lo dispararía el prefetch.
export default async function NuevoAliado() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  const estado = { publicado: false, publicadoEn: null, publicadoPor: null, borradorEn: null, borradorPor: null };
  const autorizacion = { autorizado: false, nota: "", en: null, por: null, logo: null, nombre: null, alt: null };
  return (
    <FichaDeAliado
      ficha={{ id: null, documento: aliadoVacio(), publicado: null, estado, autorizacion }}
      puedeAutorizar={puede(sesion.user.rol, "autorizarAliados")}
      quienPuede={quienPuede("autorizarAliados")}
    />
  );
}
