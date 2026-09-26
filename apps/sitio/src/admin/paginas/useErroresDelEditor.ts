import { useCallback, useMemo, useState } from "react";
import { estaEn, type ErroresDelFormulario } from "@/admin/campos/errores";
import type { ErrorDeCampo } from "@/lib/contenido/errores";

/**
 * Lleva el foco al primer campo con error (SPEC §7.1 de `work/paginas-inicio/`),
 * abriendo lo que lo tape: su sección y, en una lista fija, su ítem. Busca el
 * `-campo` del camino entero y, si no está, el de su padre: un error en el alt
 * de una foto cae en el control de la foto.
 */
function enfocar(camino: string) {
  const partes = camino.split(".");
  for (let n = partes.length; n > 0; n--) {
    const campo = document.getElementById(`${partes.slice(0, n).join(".")}-campo`);
    if (!campo) continue;
    for (let d = campo.closest("details"); d; d = d.parentElement?.closest("details") ?? null) d.open = true;
    campo.focus();
    return;
  }
}

/**
 * Los errores del último guardado, por camino, listos para el contexto que lee
 * `Campo`: `mostrar` los pone y enfoca el primero; cada control borra el suyo
 * al cambiar (`limpiar`), sin volver a dibujar el editor si no tenía ninguno.
 */
export function useErroresDelEditor() {
  const [errores, setErrores] = useState<Readonly<Record<string, string>>>({});
  const limpiar = useCallback((nombre: string) => {
    setErrores((actuales) => {
      const quedan = Object.entries(actuales).filter(([camino]) => !estaEn(camino, nombre));
      return quedan.length === Object.keys(actuales).length ? actuales : Object.fromEntries(quedan);
    });
  }, []);
  const contexto = useMemo<ErroresDelFormulario>(() => ({ errores, limpiar }), [errores, limpiar]);
  const mostrar = (lista: ErrorDeCampo[]) => {
    setErrores(Object.fromEntries(lista.map((e) => [e.camino, e.mensaje])));
    // Después de dibujar: así el campo ya lleva su mensaje cuando el lector de pantalla lo anuncia.
    const [primero] = lista;
    if (primero) requestAnimationFrame(() => enfocar(primero.camino));
  };
  return { contexto, mostrar };
}
