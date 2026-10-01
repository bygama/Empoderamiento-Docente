import type { Metadata } from "next";
import { EstadoVacio } from "@ed/kit-admin";
import { ListaDeCasos } from "@/admin/casos/ListaDeCasos";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { listaDeCasos } from "@/datos/consultas/casos-del-admin";

export const metadata: Metadata = { title: "Casos" };

// Contenido › Casos (SPEC §7.1 de `work/casos-aliados-fotos/`): los de
// `CASOS_FIJOS`, sin «Nuevo»: se editan, no se crean ni se borran. De los
// tres roles: la guarda del layout de Contenido alcanza.
export default async function Casos() {
  const filas = await listaDeCasos();
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido detalle="Los dos casos de investigación. Se editan, pero no se crean ni se borran desde acá: la pila del sitio está armada para estos dos." />
      {filas.length ? (
        <ListaDeCasos filas={filas} />
      ) : (
        <EstadoVacio titulo="No hay casos en la base." texto="Los dos entran con la migración `casos`: si no están, la base no está al día." />
      )}
    </div>
  );
}
