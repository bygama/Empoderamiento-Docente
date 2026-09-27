import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { PantallaDeSeo } from "@/admin/ajustes/seo/PantallaDeSeo";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { cvAbierto } from "@/config/cv";
import { leerIndexacion } from "@/datos/consultas/indexacion";
import { listarRedirecciones } from "@/datos/consultas/redirecciones";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";
import { sesionActual } from "@/datos/sesion";

// «SEO · Ajustes»: el editor de cada página ya tiene una pestaña «SEO» (DESIGN.md §11, «Título de pestaña»).
export const metadata: Metadata = { title: "SEO · Ajustes" };

// Ajustes › SEO (work/ajustes/SPEC.md §2.3).
export default async function Seo() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: el permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarAjustes")) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  const [redirecciones, indexacion, rutas] = await Promise.all([listarRedirecciones(sesion.user.rol), leerIndexacion(sesion.user.rol), rutasDelSitio()]);
  if (!indexacion) return <SinPermiso capacidad="usarAjustes" rol={sesion.user.rol} />;
  return <PantallaDeSeo redirecciones={redirecciones} indexacion={indexacion} rutas={rutas} cvAbierto={cvAbierto()} />;
}
