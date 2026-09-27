"use client";

import { useState, type FormEvent } from "react";
import { Aviso, Boton, Seleccion, TextoCorto } from "@ed/kit-admin";
import { agregarRedireccion } from "@/datos/acciones/redirecciones";

type Resultado = { ok: boolean; detalle: string; campo?: "desde" | "hacia" };

/**
 * Agregar una redirección a mano (work/ajustes/SPEC.md §5.1): la ruta vieja,
 * escrita, y la nueva, elegida entre las páginas que existen (la `Seleccion`
 * del kit), así no se puede apuntar a una que no está. Lo demás lo valida la
 * acción; su error vuelve al campo que lo causó.
 */
export function FormularioDeRedireccion({ rutas }: { rutas: readonly string[] }) {
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
  // Cambiar el campo que tenía el error lo borra (DESIGN.md §11, «Campos»).
  const alCambiar = (campo: "desde" | "hacia", poner: (v: string) => void) => (valor: string) => {
    poner(valor);
    if (errorDe(campo)) setResultado(null);
  };

  return (
    <form onSubmit={agregar} className="max-w-md space-y-4">
      <h3 className="font-medium">Agregar una redirección</h3>
      <TextoCorto
        nombre="redireccion-desde"
        etiqueta="Desde"
        ayuda="La ruta vieja, sin el dominio: /taller-2025."
        maximo={200}
        valor={desde}
        alCambiar={alCambiar("desde", setDesde)}
        error={errorDe("desde")}
      />
      <Seleccion
        nombre="redireccion-hacia"
        etiqueta="Hacia"
        ayuda="Una de las páginas que existen."
        opciones={rutas.map((ruta) => ({ valor: ruta, etiqueta: ruta }))}
        sinElegir="Elegí una página"
        valor={hacia}
        alCambiar={alCambiar("hacia", setHacia)}
        error={errorDe("hacia")}
      />
      {resultado && (resultado.ok || !resultado.campo) ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Agregando…" : "Agregar la redirección"}
      </Boton>
    </form>
  );
}
