import type { Metadata } from "next";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { FormularioDeInvitacion } from "@/admin/cuentas/FormularioDeInvitacion";
import { VOLVER_A_CUENTAS } from "@/admin/cuentas/pantallas";
import { HORAS_DE_LA_INVITACION } from "@/datos/sobre-cuentas";

export const metadata: Metadata = { title: "Invitar" };

// Invitar a alguien (SPEC de work/cuentas §4.2): la guarda es la de Cuentas.
export default function Invitar() {
  return (
    <div className="space-y-8">
      <Encabezado
        volver={VOLVER_A_CUENTAS}
        titulo="Invitar a alguien"
        detalle={`Le llega un correo para elegir su contraseña. El enlace vence a las ${HORAS_DE_LA_INVITACION} horas.`}
      />
      <FormularioDeInvitacion />
    </div>
  );
}
