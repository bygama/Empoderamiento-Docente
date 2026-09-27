import { useEffect, useState } from "react";

/** Cuánto espera quieto lo escrito antes de pedir la imagen de nuevo. */
const ESPERA_MS = 600;

type Datos = { titulo: string; categoria: string; fecha: string };

function direccionDe({ titulo, categoria, fecha }: Datos): string {
  return `/admin/novedades/imagen-para-redes?${new URLSearchParams({ titulo: titulo.trim(), categoria, fecha })}`;
}

/**
 * La dirección de la imagen para redes generada con lo que está en pantalla.
 * Se pide de nuevo cuando lo escrito queda quieto un momento, no con cada
 * letra: cada pedido dibuja una imagen en el servidor.
 */
export function useImagenGenerada(datos: Datos): string {
  const direccion = direccionDe(datos);
  const [quieta, setQuieta] = useState(direccion);
  useEffect(() => {
    if (direccion === quieta) return;
    const espera = window.setTimeout(() => setQuieta(direccion), ESPERA_MS);
    return () => window.clearTimeout(espera);
  }, [direccion, quieta]);
  return quieta;
}
