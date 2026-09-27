"use client";

import { useId, useState, type FormEvent } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { ENTRADA } from "@/admin/campos/clases";
import { TextoCorto } from "@/admin/campos/TextoCorto";
import { agregarRedireccion } from "@/datos/acciones/redirecciones";

type Resultado = { ok: boolean; detalle: string; campo?: "desde" | "hacia" };

/**
 * Agregar una redirección a mano (work/ajustes/SPEC.md §5.1): la ruta vieja,
 * escrita, y la nueva, elegida entre las páginas que existen, así no se puede
 * apuntar a una que no está. Lo demás lo valida la acción; su error vuelve al
 * campo que lo causó.
 */
export function FormularioDeRedireccion({ rutas }: { rutas: readonly string[] }) {
  const idHacia = useId();
  const [desde, setDesde] = useState("");
  const [hacia, setHacia] = useState(rutas[0] ?? "/");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function agregar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setGuardando(true);
    const r = await agregarRedireccion({ desde, hacia });
    setGuardando(false);
    if (r.ok) {
      setResultado({ ok: true, detalle: `Listo: ${r.redireccion.desde} lleva a ${r.redireccion.hacia}.` });
      setDesde("");
      return;
    }
    setResultado(r);
  }

  const errorDe = (campo: "desde" | "hacia") => (resultado && !resultado.ok && resultado.campo === campo ? resultado.detalle : undefined);

  return (
    <form onSubmit={agregar} className="max-w-md space-y-4">
      <h3 className="font-medium">Agregar una redirección</h3>
      <TextoCorto
        nombre="redireccion-desde"
        etiqueta="Desde"
        ayuda="La ruta vieja, sin el dominio: /taller-2025."
        maximo={200}
        valor={desde}
        alCambiar={(v) => {
          setDesde(v);
          if (errorDe("desde")) setResultado(null);
        }}
        error={errorDe("desde")}
      />
      <div>
        <label htmlFor={idHacia} className="text-admin-meta font-medium">
          Hacia
        </label>
        <select
          id={idHacia}
          value={hacia}
          onChange={(e) => {
            setHacia(e.target.value);
            if (errorDe("hacia")) setResultado(null);
          }}
          aria-invalid={errorDe("hacia") ? true : undefined}
          aria-describedby={errorDe("hacia") ? `${idHacia}-error` : undefined}
          className={`mt-1 ${ENTRADA}`}
        >
          {rutas.map((ruta) => (
            <option key={ruta} value={ruta}>
              {ruta}
            </option>
          ))}
        </select>
        {errorDe("hacia") ? (
          <p id={`${idHacia}-error`} className="mt-1 text-admin-meta text-rojo-error">
            {errorDe("hacia")}
          </p>
        ) : null}
      </div>
      {resultado && (resultado.ok || !resultado.campo) ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Agregando…" : "Agregar la redirección"}
      </Boton>
    </form>
  );
}
