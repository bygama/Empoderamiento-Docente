"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { PaisDropdown } from "../PaisDropdown";
import { INPUT_BASE } from "./estilos";
import { MQ_MOVIL } from "./movil";

type Props = { id: string; name: string; options: readonly string[]; placeholder?: string };

/**
 * País: en computadora el dropdown propio (misma caja que los otros campos,
 * teclado completo); bajo `lg` el `<select>` nativo, que abre el picker del
 * sistema (la rueda de iOS, la hoja de Android): no se corta contra el borde
 * de la pantalla ni pelea con el teclado, y es lo que la mano espera. Un
 * solo `name="pais"` en el DOM en cada caso, así el FormData no se duplica.
 *
 * El valor vive en un estado propio (no en el DOM de cada variante): si la
 * pantalla cruza los 1024px mientras el campo está elegido —girar el celu,
 * abrir/cerrar el teclado en un tablet plegable—, `movil` cambia y React
 * desmonta un elemento y monta el otro; sin este estado compartido lo
 * elegido se perdía en el cruce.
 */
export function PaisCampo({ id, name, options, placeholder = "Elegir…" }: Props) {
  const movil = useMediaQuery(MQ_MOVIL);
  const [valor, setValor] = useState("");
  if (!movil)
    return (
      <PaisDropdown
        id={id}
        name={name}
        options={options}
        placeholder={placeholder}
        value={valor}
        onChange={setValor}
      />
    );
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        aria-label="País"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="text-azul-principal/50 pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
      />
    </div>
  );
}
