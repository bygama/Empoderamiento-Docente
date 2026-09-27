"use client";

import { useState } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import { CANALES_DE_ENLACE, esCanalDeEnlace } from "@/config/metricas";
import { borrarEnlaceDesdeElAdmin } from "@/datos/acciones/enlaces";
import type { EnlaceConCifras } from "@/datos/consultas/enlaces";
import { cuantas } from "../formato";
import { Copiar } from "./Copiar";

/** «12 clics · 8 visitas · 1 CV»; cuando las visitas no se miden, «12 clics · 1 CV» (el porqué va una vez, arriba). */
function cifras(e: EnlaceConCifras): string {
  const visitas = e.visitas === null ? [] : [cuantas(e.visitas, "visita", "visitas")];
  return [cuantas(e.clics, "clic", "clics"), ...visitas, cuantas(e.cv, "CV", "CV")].join(" · ");
}

/**
 * Tus links (SPEC de work/metricas-completas/ §6.4): del más nuevo al más
 * viejo, con dónde se comparte, a qué página lleva, quién lo creó y sus
 * cifras de todo el tiempo. «Copiar» y «Borrar», que confirma en el lugar: un
 * link borrado deja de andar donde ya se compartió.
 */
export function ListaDeEnlaces({ enlaces }: { enlaces: readonly EnlaceConCifras[] }) {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);

  async function borrar(id: string) {
    setBorrando(true);
    const r = await borrarEnlaceDesdeElAdmin({ id });
    setBorrando(false);
    setConfirmando(null);
    setResultado(r);
  }

  const acciones = (e: EnlaceConCifras) =>
    confirmando === e.id ? (
      <Confirmacion
        pregunta={`¿Borrar el link «${e.nombre}»? Si ya lo compartiste, deja de andar.`}
        confirmar="Sí, borrar"
        corriendo={borrando ? "Borrando…" : null}
        alConfirmar={() => void borrar(e.id)}
        alCancelar={() => setConfirmando(null)}
      />
    ) : (
      <>
        <Copiar texto={e.link} que={`«${e.nombre}»`} />
        <Boton variante="destructivo" disabled={borrando} onClick={() => setConfirmando(e.id)} aria-label={`Borrar el link «${e.nombre}»`}>
          Borrar
        </Boton>
      </>
    );

  return (
    <div className="space-y-3">
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} alCerrar={() => setResultado(null)}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      {enlaces.length ? (
        <Lista>
          {enlaces.map((e) => (
            <Fila
              key={e.id}
              principal={e.nombre}
              detalle={
                <>
                  <span className="block break-all">
                    {e.link.replace(/^https?:\/\//, "")} → {e.destinoNombre ?? e.destino}
                  </span>
                  <span className="block">
                    {cifras(e)} · lo creó {e.creadoPor} el <Momento iso={e.creadoEn} dia />
                  </span>
                </>
              }
              insignias={<Insignia tono="normal">{esCanalDeEnlace(e.canal) ? CANALES_DE_ENLACE[e.canal] : e.canal}</Insignia>}
              accion={<div className="flex flex-wrap items-center gap-2">{acciones(e)}</div>}
            />
          ))}
        </Lista>
      ) : (
        <EstadoVacio titulo="Todavía no hay links" texto="Un link corto cuenta cuánta gente llega por un posteo, sin cookies. Creá el primero arriba." />
      )}
    </div>
  );
}
