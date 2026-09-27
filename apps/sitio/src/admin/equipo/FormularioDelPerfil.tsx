"use client";

import { resolverCambio } from "@ed/kit-admin";
import type { VecinosDePersona } from "@/datos/consultas/ficha-de-persona";
import type { CambiarRecorrido, PropsDeBloque } from "./bloques";
import { BloqueDeLaFigura } from "./BloqueDeLaFigura";
import { BloqueDeLaTarjeta } from "./BloqueDeLaTarjeta";
import { BloqueDelCierre } from "./BloqueDelCierre";
import { BloqueDelRecorrido } from "./BloqueDelRecorrido";

type Props = PropsDeBloque & { vecinos: VecinosDePersona };

/**
 * El formulario de un perfil del Equipo (SPEC §7.2 de `work/equipo/`), escrito
 * a mano con los controles del kit, como el de una novedad (AGENTS.md §12).
 * Cada control se llama con el camino del campo en el esquema, así los
 * errores del guardado caen en su lugar. Sin recorrido, los bloques que
 * cuelgan de él no están.
 */
export function FormularioDelPerfil({ vecinos, ...bloque }: Props) {
  const { form, cambiar, errores } = bloque;
  const cambiarRecorrido: CambiarRecorrido = (campo, cambio) => cambiar("recorrido", (r) => (r ? { ...r, [campo]: resolverCambio(cambio, r[campo]) } : r));
  const delRecorrido = form.recorrido ? { recorrido: form.recorrido, cambiar: cambiarRecorrido, errores } : null;
  return (
    <div className="space-y-10">
      <BloqueDeLaTarjeta {...bloque} porNivel={vecinos.porNivel} />
      <BloqueDelRecorrido {...bloque} cambiarRecorrido={cambiarRecorrido} />
      {delRecorrido ? (
        <>
          <BloqueDeLaFigura {...delRecorrido} />
          <BloqueDelCierre {...delRecorrido} />
        </>
      ) : null}
    </div>
  );
}
