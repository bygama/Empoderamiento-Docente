import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Guarda } from "@/admin/armazon/Guarda";
import { FichaDelMensaje } from "@/admin/mensajes/FichaDelMensaje";
import { capacidadDe, esBandeja } from "@/config/mensajes";
import { fichaDeMensaje } from "@/datos/consultas/ficha-de-mensaje";
import { sesionActual } from "@/datos/sesion";

type Props = { params: Promise<{ bandeja: string; id: string }> };

// Sin el nombre de nadie: el título de la pestaña queda en el historial del navegador.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bandeja } = await params;
  return { title: bandeja === "cv" ? "Un CV" : "Un mensaje de Contacto" };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function PaginaDelMensaje({ params }: Props) {
  const { bandeja, id } = await params;
  if (!esBandeja(bandeja) || !UUID.test(id)) notFound();
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  return (
    <Guarda capacidad={capacidadDe(bandeja)}>
      <Ficha bandeja={bandeja} id={id} miId={sesion.user.id} />
    </Guarda>
  );
}

/** La ficha se busca adentro de la guarda: sin la capacidad, ni se pregunta a la base. */
async function Ficha({ bandeja, id, miId }: { bandeja: Parameters<typeof fichaDeMensaje>[0]; id: string; miId: string }) {
  const ficha = await fichaDeMensaje(bandeja, id);
  if (!ficha) notFound();
  return <FichaDelMensaje ficha={ficha} miId={miId} />;
}
