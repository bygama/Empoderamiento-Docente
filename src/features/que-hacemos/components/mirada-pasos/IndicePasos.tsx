import { MIRADA } from "@/features/que-hacemos/areas";

/**
 * Los seis verbos, en orden, al lado de la tarjeta: es lo que hace que el
 * recorrido se entienda como una secuencia aunque la tarjeta muestre un
 * paso por vez. La coreografía marca el actual (`data-activo`) y los que ya
 * pasaron (`data-pasado`); el resto queda en gris.
 *
 * Solo en desktop: en celular los seis pasos van uno debajo del otro dentro
 * de la tarjeta y el índice sobraría. Decorativo para lectores de pantalla:
 * el contenido está en la tarjeta.
 */
export function IndicePasos() {
  return (
    <ol aria-hidden="true" className="mt-9 hidden space-y-2 lg:block">
      {MIRADA.map((p, i) => (
        <li
          key={p.verbo}
          data-paso-indice
          className="group text-gris-texto data-activo:text-azul-principal data-pasado:text-azul-principal/55 flex items-baseline gap-3 font-sans text-[1rem] transition-colors duration-300"
        >
          <span className="group-data-activo:text-verde-concepto-texto font-mono text-[0.68rem] tracking-[0.16em] transition-colors duration-300">
            0{i + 1}
          </span>
          <span className="group-data-activo:font-semibold">{p.verbo}</span>
        </li>
      ))}
    </ol>
  );
}
