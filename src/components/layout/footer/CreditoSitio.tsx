import { CREDITOS } from "@/config/creditos";

const LINK =
  "text-azul-claro/75 hover:text-white underline decoration-azul-claro/30 underline-offset-[3px] transition-colors hover:decoration-white/60";

function Credito({ nombre, url }: { nombre: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={LINK}>
      {nombre}
    </a>
  );
}

/**
 * El crédito del sitio: segundo renglón de la barra legal del footer, con
 * la misma mono chica y el mismo gris apagado que el ©, y los nombres como
 * links que se aclaran al pasar. Centrado y separado del © por la misma
 * hairline de la barra, y con el mismo aire arriba (su padding) que abajo
 * (el borde azul que enmarca la foto): queda al medio entre la línea y la
 * foto. No toca los países ni la banda (Gastón, 2026-09-11).
 */
export function CreditoSitio() {
  const [a, b] = CREDITOS.colaboradores;
  return (
    <p className="border-azul-medio/15 text-azul-claro/55 border-t pt-8 pb-3 text-center font-mono text-[0.72rem] tracking-[0.14em] uppercase">
      Sitio web hecho por <Credito {...CREDITOS.estudio} />, en colaboración con{" "}
      <Credito {...a} /> y <Credito {...b} />
    </p>
  );
}
