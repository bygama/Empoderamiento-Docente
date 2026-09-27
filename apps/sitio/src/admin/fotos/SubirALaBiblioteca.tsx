"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CampoFoto, resolverCambio, type SubirFoto } from "@ed/kit-admin";
import { subirFoto } from "@/datos/acciones/fotos";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";

/**
 * Subir una foto a la biblioteca (SPEC §7.3 de `work/casos-aliados-fotos/`):
 * el mismo campo de foto que el de cualquier formulario, con su alt
 * obligatorio y su tope. Subida, lleva a su ficha.
 */
export function SubirALaBiblioteca() {
  const router = useRouter();
  const [foto, setFoto] = useState({ src: "", alt: "", foco: { x: 0.5, y: 0.5 } });
  const subir: SubirFoto = async (datos) => {
    const r = await subirFoto(datos);
    if (r.ok) router.push(`/admin/contenido/fotos/${r.foto.id}?subida=1`);
    return r;
  };
  return (
    <div className="max-w-md">
      <CampoFoto
        nombre="foto"
        etiqueta="La foto"
        ayuda="Escribí primero el texto alternativo: lo que se ve en la foto, como se lo contarías a alguien que no la ve."
        valor={foto}
        alCambiar={(v) => setFoto((actual) => resolverCambio(v, actual))}
        subir={subir}
        maximoBytes={MAXIMO_BYTES}
      />
    </div>
  );
}
