import { EstadoVacio } from "@ed/kit-admin";
import { ListaDeDiferencias } from "@/admin/armazon/ListaDeDiferencias";
import type { CambiosDeUnaParte } from "@/datos/consultas/historial-de-paginas";

/**
 * «Qué cambió» (SPEC §4 de `work/paginas-inicio/`): el borrador contra lo
 * publicado, por parte y campo por campo. Sin diferencias, el estado vacío
 * dice por qué: no hay borrador, o el borrador es igual a lo publicado.
 */
export function ListaDeCambios({ cambios, hayBorrador }: { cambios: readonly CambiosDeUnaParte[]; hayBorrador: boolean }) {
  if (cambios.length === 0) {
    return hayBorrador ? (
      <EstadoVacio titulo="El borrador es igual a lo publicado" texto="Se guardó sin cambiar nada: publicarlo deja el sitio como está." />
    ) : (
      <EstadoVacio titulo="No hay cambios sin publicar" texto="Lo que guardes como borrador se compara acá con lo publicado, campo por campo." />
    );
  }
  return (
    <div className="space-y-8">
      {cambios.map((parte) => (
        <section key={parte.clave} aria-labelledby={`cambios-${parte.clave}`}>
          <h2 id={`cambios-${parte.clave}`} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
            {parte.nombre}
          </h2>
          <ListaDeDiferencias diferencias={parte.diferencias} />
        </section>
      ))}
    </div>
  );
}
