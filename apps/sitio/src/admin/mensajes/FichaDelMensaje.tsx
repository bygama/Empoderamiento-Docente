import { claseDeBoton, Encabezado, Insignia, type Tono } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import { BANDEJAS, ETIQUETA_DEL_ESTADO, type EstadoDeMensaje } from "@/config/mensajes";
import type { FichaDeMensaje } from "@/datos/consultas/ficha-de-mensaje";
import { AccionesDelMensaje } from "./AccionesDelMensaje";
import { mailtoDeRespuesta, peso } from "./formato";
import { COSA } from "./textos";

/** Nuevo pide atención; En curso es el estado estable; Cerrado y Spam ya no piden nada. */
const TONO: Record<EstadoDeMensaje, Tono> = { nuevo: "fuerte", "en-curso": "normal", cerrado: "apagado", spam: "apagado" };

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-admin-meta text-gris-texto">{etiqueta}</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  );
}

/**
 * La ficha de un mensaje o de un CV (SPEC de work/mensajes/ §6): «← Contacto»,
 * el nombre en el `h1` con su estado, cuándo llegó, cuándo se borra y quién
 * lo tomó; los datos, el mensaje entero y, en un CV, el archivo, que se baja
 * por una ruta con sesión y nunca tiene URL pública.
 */
export function FichaDelMensaje({ ficha, miId }: { ficha: FichaDeMensaje; miId: string }) {
  const bandeja = BANDEJAS[ficha.bandeja];
  const tomadoPor = ficha.tomadoPor ? (ficha.tomadoPor.id === miId ? "vos" : ficha.tomadoPor.nombre) : null;
  return (
    <div className="space-y-8">
      <Encabezado
        titulo={ficha.nombre}
        volver={{ href: bandeja.href, etiqueta: bandeja.nombre }}
        estado={<Insignia tono={TONO[ficha.estado]}>{ETIQUETA_DEL_ESTADO[ficha.estado]}</Insignia>}
        detalle={
          <>
            <span>
              Llegó el <Momento iso={ficha.recibidoEn} />
            </span>
            <span>
              Se borra el <Momento iso={ficha.seBorraEl} dia />
            </span>
            {tomadoPor ? <span>Tomado por {tomadoPor}</span> : null}
          </>
        }
        acciones={
          <AccionesDelMensaje
            bandeja={ficha.bandeja}
            id={ficha.id}
            estado={ficha.estado}
            deOtraPersona={Boolean(ficha.tomadoPor && ficha.tomadoPor.id !== miId)}
            responder={mailtoDeRespuesta(ficha.bandeja, ficha.correo, ficha.tema)}
            cosa={COSA[ficha.bandeja].una}
          />
        }
      />
      <dl className="grid max-w-3xl gap-x-10 gap-y-5 sm:grid-cols-2">
        <Dato etiqueta="Correo">
          <a href={`mailto:${ficha.correo}`} className="rounded-sm text-azul-medio underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio">
            {ficha.correo}
          </a>
        </Dato>
        {ficha.pais ? <Dato etiqueta="País">{ficha.pais}</Dato> : null}
        {ficha.tema ? <Dato etiqueta="Tema">{ficha.tema}</Dato> : null}
        {ficha.datos.map((d) => (
          <Dato key={d.etiqueta} etiqueta={d.etiqueta}>
            {d.valor}
          </Dato>
        ))}
      </dl>
      {ficha.mensaje ? (
        <section aria-labelledby="ficha-mensaje" className="max-w-prose space-y-2">
          <h2 id="ficha-mensaje" className="font-display text-admin-seccion font-bold">
            Mensaje
          </h2>
          <p className="whitespace-pre-line">{ficha.mensaje}</p>
        </section>
      ) : null}
      {ficha.archivoBytes !== null ? (
        <section aria-labelledby="ficha-archivo" className="space-y-3">
          <h2 id="ficha-archivo" className="font-display text-admin-seccion font-bold">
            El CV
          </h2>
          <p className="text-admin-meta text-gris-texto">PDF · {peso(ficha.archivoBytes)}. Lo ven solo quienes dirigen y administran; se borra con la ficha.</p>
          {/* Un <a> y no un Link: es un archivo, no una pantalla, y no hay nada que precargar. */}
          <a href={`${bandeja.href}/${ficha.id}/archivo`} className={claseDeBoton("secundario")}>
            Descargar el CV
          </a>
        </section>
      ) : null}
    </div>
  );
}
