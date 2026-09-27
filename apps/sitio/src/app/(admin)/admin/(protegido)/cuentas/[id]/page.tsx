import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { queSePuede } from "@ed/auth";
import { AvisoDeDireccion, AvisoDeInvitacion, FichaDeLaCuenta } from "@/admin/cuentas/FichaDeLaCuenta";
import { cuentaParaActuar, unaCuenta } from "@/datos/consultas/cuentas";
import { sesionActual } from "@/datos/sesion";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ invitacion?: string; direccion?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cuenta = await cuentaParaActuar((await params).id);
  return cuenta ? { title: cuenta.nombre } : {};
}

// Una cuenta (SPEC de work/cuentas §4.3). La guarda de Cuentas está en el
// layout; lo que se le puede hacer lo dice `queSePuede`, la misma regla que
// cada acción vuelve a verificar.
export default async function UnaCuenta({ params, searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  const cuenta = await unaCuenta((await params).id);
  if (!cuenta?.rol) notFound();
  const conRol = { ...cuenta, rol: cuenta.rol };
  const esLaPropia = cuenta.id === sesion.user.id;
  const { invitacion, direccion } = await searchParams;
  // Lo que dejó la pantalla anterior: Invitar, o haberle pasado la dirección.
  const aviso =
    invitacion === "salio" || invitacion === "no-salio" ? (
      <AvisoDeInvitacion salio={invitacion === "salio"} correo={cuenta.correo} />
    ) : direccion === "pasada" ? (
      <AvisoDeDireccion nombre={cuenta.nombre} />
    ) : null;
  return (
    <FichaDeLaCuenta
      cuenta={conRol}
      se={queSePuede(sesion.user.rol, { rol: cuenta.rol, estado: cuenta.estado, esLaPropia })}
      esLaPropia={esLaPropia}
      correoPropio={sesion.user.email}
      aviso={aviso}
    />
  );
}
