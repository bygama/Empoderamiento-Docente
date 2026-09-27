"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Boton, TextoCorto } from "@ed/kit-admin";
import { editarAltDeFoto } from "@/datos/acciones/fotos";

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo.";

/**
 * El texto alternativo de la foto en la biblioteca (SPEC §3.4 de
 * `work/casos-aliados-fotos/`): el que toma un uso nuevo al elegirla. No
 * cambia el de los lugares donde ya está, y la ayuda lo dice. «Guardar» es
 * el primario de la ficha; el aviso va entre el campo y el botón.
 */
export function FormularioDelAlt({ id, alt }: { id: string; alt: string }) {
  const router = useRouter();
  const [valor, setValor] = useState(() => alt); // Perezoso: es el punto de partida de lo que se escribe, no una copia del prop.
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [pendiente, empezar] = useTransition();

  const guardar = () =>
    empezar(async () => {
      try {
        const r = await editarAltDeFoto({ id, alt: valor });
        setAviso(r);
        if (r.ok) router.refresh();
      } catch {
        setAviso({ ok: false, detalle: SIN_RED });
      }
    });

  return (
    <section aria-labelledby="bloque-alt" className="space-y-4">
      <h2 id="bloque-alt" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Texto alternativo
      </h2>
      <TextoCorto
        nombre="alt"
        etiqueta="Qué se ve en la foto"
        ayuda="Lo que lee un lector de pantalla. Es el que toma la foto cuando se la elige en un formulario; donde ya está, cada lugar conserva el suyo."
        maximo={200}
        valor={valor}
        alCambiar={setValor}
      />
      {aviso ? (
        <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={() => setAviso(null)}>
          {aviso.detalle}
        </Aviso>
      ) : null}
      <Boton variante="primario" disabled={pendiente} aria-busy={pendiente || undefined} onClick={guardar}>
        {pendiente ? "Guardando…" : "Guardar"}
      </Boton>
    </section>
  );
}
