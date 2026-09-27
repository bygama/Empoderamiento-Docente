import type { Metadata } from "next";
import { FichaDeNovedad } from "@/admin/novedades/FichaDeNovedad";
import { opcionesDePublicacion } from "@/admin/novedades/publicaciones";
import { hoy, vecinasDe } from "@/datos/consultas/ficha-de-novedad";
import { borradorVacio } from "@/features/novedades/contenido/modelo";

export const metadata: Metadata = { title: "Nueva novedad" };

// La ficha vacía, sin fila todavía: el primer guardado la crea (SPEC §6.2).
// Un GET que creara filas lo dispararía el prefetch de cualquier link.
export default async function NuevaNovedad() {
  const vecinas = await vecinasDe();
  const estado = { publicada: false, publicadaEn: null, publicadaPor: null, borradorEn: null, borradorPor: null };
  return <FichaDeNovedad ficha={{ id: null, documento: borradorVacio(hoy()), publicado: null, estado }} vecinas={vecinas} publicaciones={opcionesDePublicacion()} />;
}
