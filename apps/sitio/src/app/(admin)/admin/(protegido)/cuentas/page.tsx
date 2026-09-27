import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotonEnlace } from "@/admin/armazon/Boton";
import { EncabezadoDeCuentas } from "@/admin/cuentas/EncabezadoDeCuentas";
import { ListaDePersonas } from "@/admin/cuentas/ListaDePersonas";
import { QuePuedeCadaRol } from "@/admin/cuentas/QuePuedeCadaRol";
import { listarCuentas } from "@/datos/consultas/cuentas";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Cuentas" };

// Personas, la puerta de Cuentas (SPEC de work/cuentas §4.1). La guarda del
// módulo está en el layout.
export default async function Personas() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
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
      <ListaDePersonas cuentas={await listarCuentas()} idPropia={sesion.user.id} />
    </div>
  );
}
