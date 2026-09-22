import Link from "next/link";
import { PanelMetricas } from "@/admin/metricas/PanelMetricas";

export default function InicioDelAdmin() {
  return (
    <div className="space-y-12">
      <h1 className="sr-only">Inicio del admin</h1>
      <PanelMetricas />
      <section className="space-y-3">
        <h2 className="font-display text-admin-seccion font-bold">Páginas</h2>
        <p className="max-w-prose text-gris-texto">
          Los textos y las fotos de las siete páginas del sitio. Por ahora se edita el hero de Inicio; las
          demás secciones se van sumando. Las novedades, la biblioteca, los casos y el equipo llegan en las
          fases siguientes.
        </p>
        <Link href="/admin/paginas" className="inline-block rounded-lg border border-azul-claro px-3 py-1.5 text-admin-meta text-azul-medio transition-opacity hover:opacity-80">
          Ir a Páginas
        </Link>
      </section>
    </div>
  );
}
