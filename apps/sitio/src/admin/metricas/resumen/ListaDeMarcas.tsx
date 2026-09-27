"use client";

import { useState } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { borrarMarca, type ResultadoDeMarca } from "@/datos/acciones/marcas";

export type MarcaParaMostrar = { id: string; numero: number; dia: string; texto: string; creadaPor: string | null };

/**
 * Las marcas del período, con el número que remite a la curva (SPEC de
 * work/metricas-completas/ §6.1.1). Las de a mano dicen quién y se borran,
 * confirmando en el lugar del botón; las de publicar no, porque salen de la
 * actividad. La acción revalida la pantalla: la fila se va sola y el aviso
 * queda arriba.
 */
export function ListaDeMarcas({ marcas }: { marcas: readonly MarcaParaMostrar[] }) {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDeMarca | null>(null);

  async function borrar(id: string) {
    setBorrando(true);
    const r = await borrarMarca({ id });
    setBorrando(false);
    setConfirmando(null);
    setResultado(r);
  }

  const accion = (m: MarcaParaMostrar) => {
    if (!m.creadaPor) return null;
    if (confirmando === m.id) {
      return (
        <Confirmacion
          pregunta={`¿Borrar la marca «${m.texto}»? No se puede deshacer.`}
          confirmar="Sí, borrar"
          corriendo={borrando ? "Borrando…" : null}
          alConfirmar={() => void borrar(m.id)}
          alCancelar={() => setConfirmando(null)}
        />
      );
    }
    return (
      <Boton variante="destructivo" disabled={borrando} onClick={() => setConfirmando(m.id)} aria-label={`Borrar la marca «${m.texto}»`}>
        Borrar
      </Boton>
    );
  };

  return (
    <div className="space-y-3">
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} alCerrar={() => setResultado(null)}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      {marcas.length ? (
        <Lista>
          {marcas.map((m) => (
            <Fila
              key={m.id}
              principal={
                <span>
                  <span className="text-gris-texto">{m.numero}.</span> {m.texto}
                </span>
              }
              detalle={`${m.dia} · ${m.creadaPor ? `la agregó ${m.creadaPor}` : "se agregó sola al publicar"}`}
              accion={accion(m)}
            />
          ))}
        </Lista>
      ) : (
        <p className="text-admin-meta text-gris-texto">Sin marcas en este período. Se agregan solas al publicar una página o una novedad.</p>
      )}
    </div>
  );
}
