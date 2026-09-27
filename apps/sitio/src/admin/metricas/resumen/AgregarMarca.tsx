"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Aviso, Boton, ENTRADA, TextoCorto } from "@ed/kit-admin";
import { LARGO_DE_UNA_MARCA } from "@/config/metricas";
import { agregarMarca, type ResultadoDeMarca } from "@/datos/acciones/marcas";

/**
 * «Agregar marca» (SPEC de work/metricas-completas/ §6.1.1): un botón
 * secundario que abre, en el lugar, el día y qué pasó. Al abrir, el foco va
 * al día; al cerrar, vuelve al botón. El día es uno entero y de hoy para
 * atrás: el `input` de fecha del navegador, con la `ENTRADA` del admin.
 */
export function AgregarMarca({ hoy }: { hoy: string }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(hoy);
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ResultadoDeMarca | null>(null);
  const [guardando, empezar] = useTransition();
  const dia = useRef<HTMLInputElement>(null);
  const cerrado = useRef<HTMLDivElement>(null);
  const abrio = useRef(false);

  // El foco sigue a lo que aparece: el día al abrir, el botón al cerrar (no al cargar).
  useEffect(() => {
    if (abierto) dia.current?.focus();
    else if (abrio.current) cerrado.current?.querySelector("button")?.focus();
    abrio.current ||= abierto;
  }, [abierto]);

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    empezar(async () => {
      const r = await agregarMarca({ fecha, texto });
      setResultado(r);
      if (!r.ok) return;
      setTexto("");
      setFecha(hoy);
      setAbierto(false);
    });
  }

  if (!abierto) {
    return (
      <div ref={cerrado} className="space-y-2">
        <Boton variante="secundario" onClick={() => setAbierto(true)}>
          Agregar marca
        </Boton>
        {resultado?.ok ? <Aviso tono="bien">{resultado.detalle}</Aviso> : null}
      </div>
    );
  }

  return (
    <form onSubmit={guardar} aria-label="Agregar una marca" className="max-w-md space-y-4 rounded-xl border border-azul-claro/60 p-4">
      <div>
        <label htmlFor="marca-dia" className="block text-admin-meta font-medium">
          Día
        </label>
        <input ref={dia} id="marca-dia" type="date" required max={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} className={`mt-1 ${ENTRADA}`} />
      </div>
      <TextoCorto
        nombre="marca-texto"
        etiqueta="Qué pasó ese día"
        ayuda="Una línea que explique un salto en la curva: «Posteamos en LinkedIn»."
        maximo={LARGO_DE_UNA_MARCA}
        valor={texto}
        alCambiar={setTexto}
      />
      {resultado && !resultado.ok ? <Aviso tono="error">{resultado.detalle}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
          {guardando ? "Guardando…" : "Guardar la marca"}
        </Boton>
        <Boton variante="terciario" type="button" onClick={() => setAbierto(false)} disabled={guardando}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
