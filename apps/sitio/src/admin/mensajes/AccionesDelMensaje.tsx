"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Boton, claseDeBoton, Confirmacion } from "@ed/kit-admin";
import { BANDEJAS, type Bandeja, type EstadoDeMensaje } from "@/config/mensajes";
import { borrarMensaje, cerrarMensaje, marcarComoSpam, tomarMensaje } from "@/datos/acciones/mensajes";

type Accion = "tomar" | "cerrar" | "spam" | "borrar";

const ACCIONES = { tomar: tomarMensaje, cerrar: cerrarMensaje, spam: marcarComoSpam, borrar: borrarMensaje };
const CORRIENDO: Record<Accion, string> = { tomar: "Tomando…", cerrar: "Cerrando…", spam: "Marcando…", borrar: "Borrando…" };

type Props = {
  bandeja: Bandeja;
  id: string;
  estado: EstadoDeMensaje;
  /** Si lo tiene tomado otra persona: entonces «Lo tomo yo» también va en curso. */
  deOtraPersona: boolean;
  /** El `mailto:` de «Responder». */
  responder: string;
  /** «el mensaje» o «el CV». */
  cosa: string;
};

/**
 * Las acciones de la ficha (SPEC de work/mensajes/ §6), con un solo primario
 * según el estado: Nuevo, «Lo tomo yo»; En curso, «Responder»; Cerrado y
 * Spam, ninguno. De izquierda a derecha, como el editor: lo que no se deshace,
 * lo secundario y el primario. «Borrar ahora» pide confirmación en el lugar y,
 * hecho, vuelve a la bandeja.
 */
export function AccionesDelMensaje({ bandeja, id, estado, deOtraPersona, responder, cosa }: Props) {
  const router = useRouter();
  const [pendiente, setPendiente] = useState<Accion | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function correr(accion: Accion) {
    setPendiente(accion);
    setError(null);
    const r = await ACCIONES[accion](bandeja, id);
    setPendiente(null);
    if (!r.ok) return setError(r.detalle);
    if (accion === "borrar") return router.push(`${BANDEJAS[bandeja].href}?borrado=1`);
    setConfirmando(false);
    router.refresh();
  }

  const boton = (accion: Accion, variante: "primario" | "secundario" | "terciario", texto: string) => (
    <Boton variante={variante} disabled={pendiente !== null} aria-busy={pendiente === accion || undefined} onClick={() => void correr(accion)}>
      {pendiente === accion ? CORRIENDO[accion] : texto}
    </Boton>
  );
  const enlaceResponder = (primario: boolean) => (
    <a href={responder} className={claseDeBoton(primario ? "primario" : "secundario")}>
      Responder
    </a>
  );

  return (
    <>
      {confirmando ? (
        <Confirmacion
          pregunta={`¿Borrar ${cosa} para siempre? No se puede deshacer.`}
          confirmar="Sí, borrar"
          corriendo={pendiente === "borrar" ? CORRIENDO.borrar : null}
          alConfirmar={() => void correr("borrar")}
          alCancelar={() => setConfirmando(false)}
        />
      ) : (
        <>
          {estado !== "spam" ? boton("spam", "terciario", "Marcar como spam") : null}
          <Boton variante="destructivo" disabled={pendiente !== null} onClick={() => setConfirmando(true)}>
            Borrar ahora
          </Boton>
        </>
      )}
      {estado === "nuevo" || estado === "en-curso" ? boton("cerrar", "secundario", "Cerrar") : null}
      {estado === "cerrado" || estado === "spam" || (estado === "en-curso" && deOtraPersona) ? boton("tomar", "secundario", "Lo tomo yo") : null}
      {estado !== "spam" ? enlaceResponder(estado === "en-curso") : null}
      {estado === "nuevo" ? boton("tomar", "primario", "Lo tomo yo") : null}
      {error ? (
        <div className="w-full">
          <Aviso tono="error" alCerrar={() => setError(null)}>
            {error}
          </Aviso>
        </div>
      ) : null}
    </>
  );
}
