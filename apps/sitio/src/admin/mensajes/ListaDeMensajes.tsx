import { BotonEnlace, Fila, Insignia, Lista } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import type { FilaDeMensaje } from "@/datos/consultas/mensajes";
import { COSA } from "./textos";

/**
 * Una bandeja en un estado (`Lista` de DESIGN.md §11): el nombre, y debajo
 * de qué se trata, el país y cuándo llegó; a la derecha quién lo tomó y
 * «Abrir», con el nombre para el lector («Abrir el mensaje de Ana Pérez»).
 */
export function ListaDeMensajes({ bandeja, filas }: { bandeja: Bandeja; filas: readonly FilaDeMensaje[] }) {
  return (
    <Lista>
      {filas.map((f) => (
        <Fila
          key={f.id}
          principal={f.nombre}
          detalle={
            <span className="flex flex-wrap gap-x-2">
              {f.resumen ? <span>{f.resumen} ·</span> : null}
              {f.pais ? <span>{f.pais} ·</span> : null}
              <Momento iso={f.recibidoEn} relativo />
            </span>
          }
          insignias={f.tomadoPor ? <Insignia tono="normal">Tomado por {f.tomadoPor}</Insignia> : null}
          accion={
            <BotonEnlace variante="secundario" href={`${BANDEJAS[bandeja].href}/${f.id}`} aria-label={`Abrir ${COSA[bandeja].una} de ${f.nombre}`}>
              Abrir
            </BotonEnlace>
          }
        />
      ))}
    </Lista>
  );
}
