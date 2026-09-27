"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Boton, claseDeBoton } from "@ed/kit-admin";
import { reemplazarFoto } from "@/datos/acciones/fotos";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";

type Props = {
  id: string;
  /** Lo que contestó el reemplazo, para el aviso de la sección. */
  alAvisar: (aviso: { ok: boolean; detalle: string }) => void;
  sinRed: string;
};

/** Elegir el archivo nuevo y reemplazar: el control de la fila «Reemplazar el archivo» de `SalidaDeLaFoto`. */
export function ReemplazarElArchivo({ id, alAvisar, sinRed }: Props) {
  const router = useRouter();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [pendiente, empezar] = useTransition();
  const refArchivo = useRef<HTMLInputElement>(null);

  const reemplazar = () => {
    if (!archivo) return;
    if (archivo.size > MAXIMO_BYTES) return alAvisar({ ok: false, detalle: "La foto pesa más de 4 MB: achicala antes de subirla." });
    const datos = new FormData();
    datos.append("id", id);
    datos.append("archivo", archivo);
    empezar(async () => {
      try {
        const r = await reemplazarFoto(datos);
        alAvisar(r);
        if (!r.ok) return;
        setArchivo(null);
        if (refArchivo.current) refArchivo.current.value = "";
        router.refresh();
      } catch {
        alAvisar({ ok: false, detalle: sinRed });
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* El input nativo, oculto pero enfocable; su label hace de botón, como en el campo de foto. */}
      <input
        ref={refArchivo}
        id="reemplazo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={pendiente}
        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        className="peer sr-only"
      />
      <label
        htmlFor="reemplazo"
        className={`${claseDeBoton("secundario")} cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul-medio peer-disabled:cursor-not-allowed peer-disabled:opacity-60`}
      >
        {archivo ? archivo.name : "Elegir el archivo nuevo…"}
      </label>
      {archivo ? (
        <Boton variante="secundario" disabled={pendiente} aria-busy={pendiente || undefined} onClick={reemplazar}>
          {pendiente ? "Reemplazando…" : "Reemplazar"}
        </Boton>
      ) : null}
    </div>
  );
}
