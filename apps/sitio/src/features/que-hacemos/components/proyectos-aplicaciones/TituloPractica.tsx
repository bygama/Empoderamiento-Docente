import { partirResaltado } from "@/lib/contenido/resaltado";

/**
 * «Así se ve en la práctica.» con el arranque en azul medio: el título
 * grande sobre el gris quedaba plano de un solo color (Gastón,
 * 2026-09-10). Es el espejo de Niveles, que resalta el final de su frase
 * en verde; acá el resalte va al principio y en el otro acento. Siempre en
 * dos renglones, «Así se ve» arriba (Gastón, 2026-09-10): el span es
 * bloque, y lo que sigue arranca sin el espacio del medio: el renglón lo
 * corta el bloque.
 */
export function TituloPractica({ titulo }: { titulo: string }) {
  const { antes, clave, despues } = partirResaltado(titulo);
  return (
    <>
      {antes === "" ? null : antes}
      <span className="text-azul-medio block">{clave}</span>
      {despues.trimStart()}
    </>
  );
}
