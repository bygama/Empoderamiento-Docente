"use client";

import { useState } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import { Tabla } from "@/admin/armazon/Tabla";
import { borrarRedireccion } from "@/datos/acciones/redirecciones";

export type RedireccionParaMostrar = { id: string; desde: string; hacia: string; aMano: boolean; creadaEn: string; seAplica: boolean };

const COLUMNAS = [{ etiqueta: "Desde" }, { etiqueta: "Hacia" }, { etiqueta: "Quién la escribió" }, { etiqueta: "Creada" }, { etiqueta: "Acción" }];

/**
 * Las redirecciones, en una `Tabla` (DESIGN.md §11). Las a mano se borran,
 * confirmando en el lugar del botón; las automáticas no, porque romperían
 * los links viejos. Una cuya ruta ya contesta el sitio lo dice en su fila, y
 * borrarla no cambia nada. La acción revalida la pantalla: la fila se va sola. Sin
 * ninguna, el estado vacío va acá adentro, así el aviso de la última borrada
 * sigue a la vista.
 */
export function TablaDeRedirecciones({ redirecciones }: { redirecciones: readonly RedireccionParaMostrar[] }) {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);

  async function borrar(id: string) {
    setBorrando(true);
    const r = await borrarRedireccion({ id });
    setBorrando(false);
    setConfirmando(null);
    setResultado(r);
  }

  const accion = (r: RedireccionParaMostrar) => {
    if (!r.aMano) return <span className="text-gris-texto">No se borra desde acá</span>;
    if (confirmando === r.id) {
      return (
        <Confirmacion
          pregunta={
            r.seAplica
              ? `¿Borrar la redirección desde ${r.desde}? Quien entre por ese link va a ver la página de error.`
              : `¿Borrar la redirección desde ${r.desde}? No se está aplicando: esa ruta la contesta el sitio, y no cambia nada.`
          }
          confirmar="Sí, borrar"
          corriendo={borrando ? "Borrando…" : null}
          alConfirmar={() => void borrar(r.id)}
          alCancelar={() => setConfirmando(null)}
        />
      );
    }
    return (
      <Boton variante="destructivo" disabled={borrando} onClick={() => setConfirmando(r.id)} aria-label={`Borrar la redirección desde ${r.desde}`}>
        Borrar
      </Boton>
    );
  };

  const filas = redirecciones.map((r) => ({
    clave: r.id,
    celdas: [
      <span key="desde" className="break-all">
        {r.desde}
        {r.seAplica ? null : (
          <>
            <span className="sr-only">,</span> <span className="block text-admin-meta text-gris-texto">No se aplica: esa ruta la contesta el sitio.</span>
          </>
        )}
      </span>,
      <span key="hacia" className="break-all">{r.hacia}</span>,
      <Insignia key="origen" tono={r.aMano ? "normal" : "apagado"}>
        {r.aMano ? "A mano" : "Automática"}
      </Insignia>,
      <Momento key="creada" iso={r.creadaEn} dia />,
      accion(r),
    ],
  }));

  return (
    <div className="space-y-3">
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} alCerrar={() => setResultado(null)}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      {filas.length ? (
        <Tabla leyenda="Las redirecciones del sitio" columnas={COLUMNAS} filas={filas} />
      ) : (
        <EstadoVacio titulo="Todavía no hay redirecciones" texto="Se escriben solas cuando cambia la URL de una novedad, y acá se agregan las de un link viejo." />
      )}
    </div>
  );
}
