import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { FichaDelPerfil } from "@/admin/equipo/FichaDelPerfil";
import { vecinosDePersona } from "@/datos/consultas/ficha-de-persona";
import { sesionActual } from "@/datos/sesion";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";

export const metadata: Metadata = { title: "Nuevo perfil · Equipo" };

const ESTADO_NUEVO = { publicado: false, publicadoEn: null, publicadoPor: null, borradorEn: null, borradorPor: null };

// «Nuevo perfil»: la ficha vacía, sin fila todavía: el primer guardado la
// crea. Un GET que creara filas lo dispararía el prefetch de cualquier link.
// La guarda del layout solo oculta la interfaz: el permiso se corta acá.
export default async function NuevoPerfil() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, "editarContenido")) return <SinPermiso capacidad="editarContenido" rol={sesion.user.rol} />;
  return <FichaDelPerfil ficha={{ id: null, documento: personaVacia(), publicado: null, estado: ESTADO_NUEVO }} vecinos={await vecinosDePersona(null)} />;
}
