import { useEffect, useState } from "react";
import { firmaDe } from "@/features/biblioteca/contenido/modelo";
import type { MaterialEnElFormulario } from "./formulario";

/** Cuánto espera quieto lo escrito antes de pedir la portada de nuevo. */
const ESPERA_MS = 600;

function direccionDe(f: MaterialEnElFormulario): string {
  const firma = firmaDe({ autores: f.autores || null, autorias: f.autorias });
  return `/admin/biblioteca/portada?${new URLSearchParams({ titulo: f.titulo.trim(), firma, tipo: f.tipo, fuente: f.fuente.trim(), anio: f.fecha.slice(0, 4) })}`;
}

/**
 * La dirección de la portada tipográfica generada con lo que está en
 * pantalla. Se pide de nuevo cuando lo escrito queda quieto un momento, no
 * con cada letra: cada pedido dibuja una imagen en el servidor (como la
 * imagen para redes de una novedad).
 */
export function usePortadaGenerada(form: MaterialEnElFormulario): string {
  const direccion = direccionDe(form);
  const [quieta, setQuieta] = useState(direccion);
  useEffect(() => {
    if (direccion === quieta) return;
    const espera = window.setTimeout(() => setQuieta(direccion), ESPERA_MS);
    return () => window.clearTimeout(espera);
  }, [direccion, quieta]);
  return quieta;
}
