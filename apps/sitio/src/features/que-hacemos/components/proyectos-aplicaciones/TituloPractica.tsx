import { PROYECTOS_INTRO } from "@/features/que-hacemos/proyectos";

/**
 * «Así se ve en la práctica.» con el arranque en azul medio: el título
 * grande sobre el gris quedaba plano de un solo color (Gastón,
 * 2026-09-10). Es el espejo de Niveles, que resalta el final de su frase
 * en verde; acá el resalte va al principio y en el otro acento. Siempre en
 * dos renglones, «Así se ve» arriba (Gastón, 2026-09-10): el span es
 * bloque. El texto no cambia.
 */
export function TituloPractica() {
  const { titulo, resaltado } = PROYECTOS_INTRO;
  return (
    <>
      <span className="text-azul-medio block">{resaltado}</span>
      {titulo.slice(resaltado.length + 1)}
    </>
  );
}
