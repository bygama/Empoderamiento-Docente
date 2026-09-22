"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/components/ui/icons";
import { ENTRADA_DE_ACCESO } from "./Campos";

type Props = {
  etiqueta: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  /** Se lee junto con el campo (`aria-describedby`): «Doce caracteres o más». */
  ayuda?: string;
  autoFocus?: boolean;
  /** Marca el campo con `aria-invalid` cuando el formulario rechazó lo que tiene. */
  invalido?: boolean;
};

/**
 * Una contraseña con el botón de ojo para verla. El botón dice siempre
 * «Mostrar contraseña» y `aria-pressed` cuenta si está mostrándola: así el
 * lector de pantalla anuncia un solo control con dos estados, no dos botones
 * que se turnan.
 */
export function CampoContrasena({ etiqueta, name, autoComplete, minLength, ayuda, autoFocus, invalido }: Props) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-azul-principal">
        {etiqueta}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          autoFocus={autoFocus}
          aria-invalid={invalido ? true : undefined}
          aria-describedby={ayuda ? idAyuda : undefined}
          className={`${ENTRADA_DE_ACCESO} pr-12`}
        />
        <button
          type="button"
          aria-pressed={visible}
          aria-controls={id}
          aria-label="Mostrar contraseña"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gris-texto transition-colors hover:text-azul-principal focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-azul-medio"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}
