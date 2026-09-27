import type { Metadata } from "next";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { ListaDeCasos } from "@/admin/casos/ListaDeCasos";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { listaDeCasos } from "@/datos/consultas/casos-del-admin";

export const metadata: Metadata = { title: "Casos" };

// Contenido › Casos (SPEC §7.1 de `work/casos-aliados-fotos/`): los cuatro,
// sin «Nuevo»: se editan, no se crean ni se borran. De los tres roles: la
// guarda del layout de Contenido alcanza.
export default async function Casos() {
  const filas = await listaDeCasos();
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido detalle="Los cuatro casos de investigación. Se editan, pero no se crean ni se borran: la pila del sitio está armada para cuatro." />
      {filas.length ? (
        <ListaDeCasos filas={filas} />
      ) : (
        <EstadoVacio titulo="No hay casos en la base." texto="Los cuatro entran con la migración `casos`: si no están, la base no está al día." />
      )}
    </div>
  );
}
