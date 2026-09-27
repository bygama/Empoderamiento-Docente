import { notFound, permanentRedirect } from "next/navigation";
import { redireccionDe } from "@/datos/consultas/redirecciones";
import { rutaDeSegmentos } from "@/lib/seo/redirecciones";

// La 404 del sitio vive dentro del route group `(sitio)`, así que no es la
// global de Next: cualquier URL sin ruta cae acá y sigue hasta ella. Antes,
// si esa ruta tiene una redirección (Ajustes › SEO, o un slug que cambió),
// un 308 hacia la nueva (work/ajustes/SPEC.md §5.1).
//
// Dinámica a propósito: sin esto Next guardaría la primera respuesta de cada
// ruta, y una redirección agregada después no se vería. Una 404 es rara y la
// consulta, una fila por clave.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ resto: string[] }> };

export default async function RutaInexistente({ params }: Props) {
  const { resto } = await params;
  const hacia = await redireccionDe(rutaDeSegmentos(resto));
  if (hacia) permanentRedirect(hacia);
  notFound();
}
