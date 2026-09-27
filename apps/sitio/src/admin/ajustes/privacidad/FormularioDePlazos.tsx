"use client";

import { useState, type FormEvent } from "react";
import { ENTRADA } from "@ed/kit-admin";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { PLAZOS, TOPES, type Plazo, type Plazos } from "@/config/privacidad";
import { guardarPlazos, type ResultadoDePlazos } from "@/datos/acciones/privacidad";

const DESDE: Record<Plazo, string> = { cv: "que llegó", contacto: "que llegó", spam: "que se marcó" };

/**
 * Los tres plazos (work/ajustes/SPEC.md §2.5): un número con su unidad al lado
 * y sus topes en la ayuda. Si acortar borra algo, la acción no guarda: cuenta
 * cuánto, y la pregunta aparece en el lugar del botón (DESIGN.md §11,
 * «Confirmar lo que no se deshace»).
 */
export function FormularioDePlazos({ inicial, rige }: { inicial: Plazos; rige: Record<Plazo, string> }) {
  const [valores, setValores] = useState<Record<Plazo, string>>({ cv: String(inicial.cv), contacto: String(inicial.contacto), spam: String(inicial.spam) });
  const [resultado, setResultado] = useState<ResultadoDePlazos | null>(null);
  const [guardando, setGuardando] = useState(false);
  const pregunta = resultado && !resultado.ok && resultado.seBorrarian ? resultado.detalle : null;
  const errores = resultado && !resultado.ok ? (resultado.errores ?? {}) : {};

  async function guardar(confirmado: boolean) {
    setGuardando(true);
    setResultado(await guardarPlazos({ cv: Number(valores.cv), contacto: Number(valores.contacto), spam: Number(valores.spam), confirmado }));
    setGuardando(false);
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void guardar(false);
  }

  return (
    <form onSubmit={alEnviar} className="max-w-md space-y-5" noValidate>
      {PLAZOS.map((p) => {
        const { nombre, minimo, maximo, unidad } = TOPES[p];
        const id = `plazo-${p}`;
        return (
          <div key={p}>
            <label htmlFor={id} className="text-admin-meta font-medium">
              {nombre}
            </label>
            <p id={`${id}-ayuda`} className="mt-1 text-admin-meta text-gris-texto">
              Contados desde {DESDE[p]}. De {minimo} a {maximo} {unidad}. {rige[p]}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={minimo}
                max={maximo}
                step={1}
                value={valores[p]}
                onChange={(e) => {
                  setValores((v) => ({ ...v, [p]: e.target.value }));
                  setResultado(null);
                }}
                aria-invalid={errores[p] ? true : undefined}
                aria-describedby={errores[p] ? `${id}-ayuda ${id}-error` : `${id}-ayuda`}
                className={`${ENTRADA} w-24`}
              />
              <span className="text-gris-texto">{unidad}</span>
            </div>
            {errores[p] ? (
              <p id={`${id}-error`} className="mt-1 text-admin-meta text-rojo-error">
                {errores[p]}
              </p>
            ) : null}
          </div>
        );
      })}
      {resultado && !pregunta ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      {pregunta ? (
        <Confirmacion
          pregunta={pregunta}
          confirmar="Sí, guardar los plazos"
          corriendo={guardando ? "Guardando…" : null}
          alConfirmar={() => void guardar(true)}
          alCancelar={() => setResultado(null)}
        />
      ) : (
        // El único naranja de la pantalla: es la acción.
        <Boton variante="primario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
          {guardando ? "Guardando…" : "Guardar los plazos"}
        </Boton>
      )}
    </form>
  );
}
