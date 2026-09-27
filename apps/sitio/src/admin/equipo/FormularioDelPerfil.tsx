"use client";

import type { VecinosDePersona } from "@/datos/consultas/ficha-de-persona";
import type { PropsDeBloque } from "./bloques";
import { BloqueDeLaTarjeta } from "./BloqueDeLaTarjeta";

type Props = PropsDeBloque & { vecinos: VecinosDePersona };

/**
 * El formulario de un perfil del Equipo (SPEC §7.2 de `work/equipo/`), escrito
 * a mano con los controles del kit, como el de una novedad (AGENTS.md §12).
 * Cada control se llama con el camino del campo en el esquema, así los
 * errores del guardado caen en su lugar.
 */
export function FormularioDelPerfil({ vecinos, ...bloque }: Props) {
  return (
    <div className="space-y-10">
      <BloqueDeLaTarjeta {...bloque} porNivel={vecinos.porNivel} />
    </div>
  );
}
