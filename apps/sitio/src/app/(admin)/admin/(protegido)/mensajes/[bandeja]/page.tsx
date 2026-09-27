import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Guarda } from "@/admin/armazon/Guarda";
import { BandejaDeMensajes } from "@/admin/mensajes/BandejaDeMensajes";
import { BANDEJAS, capacidadDe, esBandeja, esEstado } from "@/config/mensajes";
import { sesionActual } from "@/datos/sesion";

type Props = { params: Promise<{ bandeja: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bandeja } = await params;
  return esBandeja(bandeja) ? { title: BANDEJAS[bandeja].nombre } : {};
}

// Contacto y CV son la misma pantalla con otra bandeja. La del módulo es la
// guarda de Contacto; esta suma la de cada bandeja, así quien edita y escribe
// /admin/mensajes/cv ve «Sin permiso».
export default async function PaginaDeLaBandeja({ params, searchParams }: Props) {
  const { bandeja } = await params;
  if (!esBandeja(bandeja)) notFound();
  const { estado, q, borrado } = await searchParams;
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  return (
    <Guarda capacidad={capacidadDe(bandeja)}>
      <BandejaDeMensajes
        bandeja={bandeja}
        estado={esEstado(estado) ? estado : "nuevo"}
        q={typeof q === "string" && q.trim() ? q.trim().slice(0, 100) : undefined}
        rol={sesion.user.rol}
        borrado={borrado === "1"}
      />
    </Guarda>
  );
}
