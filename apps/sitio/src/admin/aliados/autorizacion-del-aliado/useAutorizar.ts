import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { autorizarAliado } from "@/datos/acciones/ciclo-de-aliados";
import type { Autorizacion } from "@/datos/consultas/aliados-del-admin";
import type { Aliado } from "@/features/aliados/contenido/aliado";

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo.";

/**
 * La casilla, la nota y guardar la marca. Al marcar manda el logo, el nombre y
 * el texto del logo que se mostraron (`visto`): si lo guardado ya es otro, el
 * servidor no autoriza. Con éxito, refresca la página para leer la marca nueva.
 */
export function useAutorizar(id: string | null, autorizacion: Autorizacion, aAutorizar: Aliado | null) {
  const router = useRouter();
  const [marcado, setMarcado] = useState(() => autorizacion.autorizado);
  const [nota, setNota] = useState(() => autorizacion.nota);
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [pendiente, empezar] = useTransition();

  const guardar = () =>
    empezar(async () => {
      if (!id) return;
      const visto = marcado && aAutorizar ? { logo: aAutorizar.logo.src, nombre: aAutorizar.nombre, alt: aAutorizar.logo.alt } : null;
      try {
        const r = await autorizarAliado({ id, autorizado: marcado, nota, visto });
        setAviso(r);
        if (r.ok) router.refresh();
      } catch {
        setAviso({ ok: false, detalle: SIN_RED });
      }
    });

  return { marcado, setMarcado, nota, setNota, aviso, setAviso, pendiente, guardar };
}
