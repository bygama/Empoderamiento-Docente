import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { Encabezado } from "@ed/kit-admin";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { FormularioDeInvitacion } from "@/admin/cuentas/FormularioDeInvitacion";
import { VOLVER_A_CUENTAS } from "@/admin/cuentas/pantallas";
import { sesionActual } from "@/datos/sesion";
import { HORAS_DE_LA_INVITACION } from "@/datos/sobre-cuentas";

export const metadata: Metadata = { title: "Invitar" };

// Invitar a alguien (SPEC de work/cuentas §4.2).
export default async function Invitar() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: esta página se renderiza
  // igual y viaja en el payload. El permiso se corta acá, como en las demás.
  if (!puede(sesion.user.rol, "usarCuentas")) return <SinPermiso capacidad="usarCuentas" rol={sesion.user.rol} />;
  return (
    <div className="space-y-8">
      <Encabezado
        volver={VOLVER_A_CUENTAS}
        titulo="Invitar a alguien"
        detalle={`Le llega un correo para elegir su contraseña. El enlace vence a las ${HORAS_DE_LA_INVITACION} horas.`}
      />
      <FormularioDeInvitacion correoPropio={sesion.user.email} />
    </div>
  );
}
