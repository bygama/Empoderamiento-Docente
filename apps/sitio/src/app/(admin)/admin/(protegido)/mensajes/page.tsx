import { redirect } from "next/navigation";
import { BANDEJAS } from "@/config/mensajes";
import { bandejaConMasNuevos } from "@/datos/consultas/mensajes";
import { sesionActual } from "@/datos/sesion";

// /admin/mensajes no es una pantalla: lleva a la bandeja con más sin leer de
// las que tu rol ve (SPEC del mapa del admin §5.6).
export default async function Mensajes() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  const bandeja = await bandejaConMasNuevos(sesion.user.rol);
  redirect(bandeja ? BANDEJAS[bandeja].href : "/admin");
}
