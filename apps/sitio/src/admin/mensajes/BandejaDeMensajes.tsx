import { Buscador, EstadoVacio, Filtro } from "@ed/kit-admin";
import { cvAbierto } from "@/config/cv";
import { BANDEJAS, ESTADOS, ETIQUETA_DEL_ESTADO, type Bandeja, type EstadoDeMensaje } from "@/config/mensajes";
import { vigente } from "@/config/privacidad";
import { FILAS_POR_PANTALLA, bandejasDe, listarMensajes, nuevosPorBandeja } from "@/datos/consultas/mensajes";
import { plazosDeGuarda } from "@/datos/privacidad";
import { EncabezadoDeMensajes } from "./EncabezadoDeMensajes";
import { ListaDeMensajes } from "./ListaDeMensajes";
import { COSA, nombreDe, vacioDe } from "./textos";

type Props = { bandeja: Bandeja; estado: EstadoDeMensaje; q?: string; rol: unknown; borrado?: boolean };

/** La URL de la bandeja en un estado, con la búsqueda si hay. Nuevo es la puerta: va sin `estado`. */
function hrefDe(bandeja: Bandeja, estado: EstadoDeMensaje, q?: string): string {
  const params = new URLSearchParams({ ...(estado === "nuevo" ? {} : { estado }), ...(q ? { q } : {}) });
  return `${BANDEJAS[bandeja].href}${params.size ? `?${params}` : ""}`;
}

/**
 * Una bandeja de Mensajes (SPEC de work/mensajes/ §6): el encabezado con las
 * bandejas en pestañas, el filtro de estados con sus sin leer en Nuevo, el
 * buscador y la lista, o qué pasa si no hay nada.
 */
export async function BandejaDeMensajes({ bandeja, estado, q, rol, borrado = false }: Props) {
  const [nuevos, { filas, hayMas }, plazos] = await Promise.all([
    nuevosPorBandeja(rol),
    listarMensajes({ bandeja, estado, busqueda: q }),
    plazosDeGuarda(),
  ]);
  const nombre = nombreDe(bandeja);
  const vacio = q
    ? { titulo: `Nada coincide con «${q}» en ${ETIQUETA_DEL_ESTADO[estado]}`, texto: "Probá con otra palabra, en otro estado, o borrá la búsqueda." }
    : vacioDe(bandeja, estado, cvAbierto(), { guarda: vigente(plazos[bandeja]), spam: plazos.spam });
  const opciones = ESTADOS.map((e) => ({
    href: hrefDe(bandeja, e, q),
    etiqueta: ETIQUETA_DEL_ESTADO[e],
    numero: e === "nuevo" ? { cuantos: nuevos[bandeja] ?? 0, que: "sin leer" } : undefined,
  }));
  return (
    <div className="space-y-6">
      <EncabezadoDeMensajes
        bandejas={bandejasDe(rol)}
        nuevos={nuevos}
        aviso={borrado ? `Se borró ${COSA[bandeja].una} para siempre.` : undefined}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Filtro etiqueta={`Estado de los ${COSA[bandeja].varias}`} opciones={opciones} activa={hrefDe(bandeja, estado, q)} />
        <Buscador
          etiqueta={`Buscar en ${nombre}`}
          accion={BANDEJAS[bandeja].href}
          q={q}
          ayuda="Nombre, correo o texto"
          conservar={estado === "nuevo" ? {} : { estado }}
        />
      </div>
      {filas.length ? <ListaDeMensajes bandeja={bandeja} filas={filas} /> : <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />}
      {hayMas ? (
        <p className="text-admin-meta text-gris-texto">
          Se muestran los {FILAS_POR_PANTALLA} más recientes. Para encontrar uno más viejo, buscalo.
        </p>
      ) : null}
    </div>
  );
}
