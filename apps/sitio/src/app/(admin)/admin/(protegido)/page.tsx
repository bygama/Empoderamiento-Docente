import { PanelMetricas } from "@/admin/metricas/PanelMetricas";

export default function InicioDelAdmin() {
  return (
    <div className="space-y-12">
      <h1 className="sr-only">Inicio del admin</h1>
      <PanelMetricas />
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-bold">Todavía no hay nada que editar</h2>
        <p className="max-w-prose text-gris-texto">
          Estos son los cimientos: entrar, salir y elegir una contraseña. Las novedades, la
          biblioteca, los casos y el equipo llegan en las fases siguientes.
        </p>
      </section>
    </div>
  );
}
