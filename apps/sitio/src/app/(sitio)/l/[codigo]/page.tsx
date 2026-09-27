import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { destinoDelEnlace } from "@/datos/abrir-enlace";

// Un link corto no se indexa: lo que se indexa es la página a la que lleva.
export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ codigo: string }> };

// El link corto para compartir (work/metricas-completas/SPEC.md §6.4): cuenta
// el clic y lleva a la página con un 307, sin caché (una página que lee
// cabeceras es dinámica). Un código que no es de ningún link da el 404 del
// sitio: es una página y no una ruta de API justamente por eso. Solo delega:
// contar y buscar es de `datos/`.
export default async function LinkCorto({ params }: Props) {
  const [{ codigo }, cabeceras] = await Promise.all([params, headers()]);
  const destino = await destinoDelEnlace(cabeceras, codigo);
  if (!destino) notFound();
  redirect(destino);
}
