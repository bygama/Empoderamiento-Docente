"use client";

import { resolverCambio } from "@ed/kit-admin";
import type { VecinosDePersona } from "@/datos/consultas/ficha-de-persona";
import type { CambiarRecorrido, PropsDeBloque } from "./bloques";
import { BloqueDeLaFigura } from "./BloqueDeLaFigura";
import { BloqueDeLaTarjeta } from "./BloqueDeLaTarjeta";
import { BloqueDelCierre } from "./BloqueDelCierre";
import { BloqueDelRecorrido } from "./BloqueDelRecorrido";
import { EnLaBiblioteca } from "./EnLaBiblioteca";
import { EtapasDelRecorrido } from "./EtapasDelRecorrido";

type Props = PropsDeBloque & {
  /** `null` mientras el perfil no se guardó nunca: todavía no firma nada. */
  id: string | null;
  vecinos: VecinosDePersona;
  /** El slug que está en el sitio, o `null` si nunca se publicó: cambia la ayuda de la URL. */
  slugPublicado: string | null;
};

/**
 * El formulario de un perfil del Equipo (SPEC §7.2 de `work/equipo/`), escrito
 * a mano con los controles del kit, como el de una novedad (AGENTS.md §12).
 * Cada control se llama con el camino del campo en el esquema, así los
 * errores del guardado caen en su lugar. Sin recorrido, los bloques que
 * cuelgan de él no están.
 */
export function FormularioDelPerfil({ id, vecinos, slugPublicado, ...bloque }: Props) {
  const { form, cambiar, errores } = bloque;
  const cambiarRecorrido: CambiarRecorrido = (campo, cambio) => cambiar("recorrido", (r) => (r ? { ...r, [campo]: resolverCambio(cambio, r[campo]) } : r));
  const delRecorrido = form.recorrido ? { recorrido: form.recorrido, cambiar: cambiarRecorrido, errores } : null;
  return (
    <div className="space-y-10">
      <BloqueDeLaTarjeta {...bloque} porNivel={vecinos.porNivel} slugPublicado={slugPublicado} />
      <BloqueDelRecorrido {...bloque} cambiarRecorrido={cambiarRecorrido} />
      {delRecorrido ? (
        <>
          <BloqueDeLaFigura {...delRecorrido} />
          <EtapasDelRecorrido {...delRecorrido} firmados={vecinos.firmados} />
        </>
      ) : null}
      <EnLaBiblioteca id={id} firmados={vecinos.firmados} recorrido={form.recorrido} />
      {delRecorrido ? <BloqueDelCierre {...delRecorrido} /> : null}
    </div>
  );
}
