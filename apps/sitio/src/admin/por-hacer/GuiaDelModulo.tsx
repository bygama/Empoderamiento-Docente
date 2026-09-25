import Link from "next/link";
import { claseDeBoton } from "@/admin/armazon/clases";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import type { Guia } from "./guias";

/** La pantalla de un módulo que todavía no existe: qué va a tener, pantalla por pantalla. */
export function GuiaDelModulo({ guia }: { guia: Guia }) {
  const hechas = guia.pantallas.filter((p) => p.hoy).length;
  return (
    <div className="space-y-8">
      <Encabezado
        titulo={guia.nombre}
        estado={
          hechas ? (
            <Insignia tono="normal">
              {hechas} de {guia.pantallas.length} ya están
            </Insignia>
          ) : (
            <Insignia tono="apagado">Por hacer</Insignia>
          )
        }
        detalle={guia.para}
      />
      <section aria-labelledby="lo-que-va-a-tener" className="space-y-4">
        <h2 id="lo-que-va-a-tener" className="font-display text-admin-seccion font-bold">
          Lo que va a tener
        </h2>
        <ul className="divide-y divide-azul-claro/60 rounded-xl border border-azul-claro/60">
          {guia.pantallas.map((p) => (
            <li key={p.ruta} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {p.nombre} <span className="text-admin-meta font-normal text-gris-texto">{p.ruta}</span>
                </p>
                <p className="text-admin-meta text-gris-texto">{p.que}</p>
              </div>
              {p.hoy ? (
                <Link href={p.hoy.href} className={claseDeBoton("secundario")}>
                  {p.hoy.etiqueta}
                </Link>
              ) : (
                <Insignia tono="apagado">Por hacer</Insignia>
              )}
            </li>
          ))}
        </ul>
        <p className="text-admin-meta text-gris-texto">Sale del mapa del admin aprobado el 23 de septiembre de 2026.</p>
      </section>
    </div>
  );
}
