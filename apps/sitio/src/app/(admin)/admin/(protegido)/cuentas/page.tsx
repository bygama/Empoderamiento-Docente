import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { BotonEnlace } from "@ed/kit-admin";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { EncabezadoDeCuentas } from "@/admin/cuentas/EncabezadoDeCuentas";
import { ListaDePersonas } from "@/admin/cuentas/ListaDePersonas";
import { QuePuedeCadaRol } from "@/admin/cuentas/QuePuedeCadaRol";
import { listarCuentas } from "@/datos/consultas/cuentas";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Cuentas" };

// Personas, la puerta de Cuentas (SPEC de work/cuentas §4.1).
export default async function Personas() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: esta página se renderiza
  // igual y viaja en el payload. El permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarCuentas")) return <SinPermiso capacidad="usarCuentas" rol={sesion.user.rol} />;
  return (
    <div className="space-y-10">
      <EncabezadoDeCuentas
        detalle="Quién entra al admin y qué puede hacer cada rol."
        acciones={
          <BotonEnlace variante="primario" href="/admin/cuentas/invitar">
            Invitar a alguien
          </BotonEnlace>
        }
      />
      <QuePuedeCadaRol />
      <ListaDePersonas cuentas={await listarCuentas(sesion.user.rol)} idPropia={sesion.user.id} />
    </div>
  );
}
