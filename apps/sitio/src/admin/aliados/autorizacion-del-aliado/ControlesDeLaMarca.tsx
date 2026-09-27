import { Aviso, Boton } from "@ed/kit-admin";

/** La casilla «Autorizado»: deshabilitada para quien no la puede poner, con la explicación como descripción. */
export function CasillaDeLaMarca({ marcado, bloqueada, pendiente, alCambiar }: { marcado: boolean; bloqueada: boolean; pendiente: boolean; alCambiar: (marcado: boolean) => void }) {
  return (
    <label className={`flex min-h-10 items-center gap-3 text-admin-meta font-medium ${bloqueada ? "text-gris-texto" : ""}`}>
      <input
        type="checkbox"
        checked={marcado}
        disabled={bloqueada || pendiente}
        aria-describedby="autorizacion-explicacion"
        onChange={(e) => alCambiar(e.target.checked)}
        className="size-4 accent-azul-principal"
      />
      Autorizado
    </label>
  );
}

type PropsDelPie = {
  aviso: { ok: boolean; detalle: string } | null;
  alCerrarAviso: () => void;
  /** El texto del botón, o `null` si no hay nada que hacer. */
  accion: string | null;
  pendiente: boolean;
  /** Si todavía no se puede: el botón queda deshabilitado. */
  falta: string | null;
  alGuardar: () => void;
};

/** Lo que contestó la última acción y el botón que la dispara. */
export function PieDeLaMarca({ aviso, alCerrarAviso, accion, pendiente, falta, alGuardar }: PropsDelPie) {
  return (
    <>
      {aviso ? (
        <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={alCerrarAviso}>
          {aviso.detalle}
        </Aviso>
      ) : null}
      {accion ? (
        <Boton variante="secundario" disabled={pendiente || Boolean(falta)} aria-busy={pendiente || undefined} onClick={alGuardar}>
          {pendiente ? "Guardando…" : accion}
        </Boton>
      ) : null}
    </>
  );
}
