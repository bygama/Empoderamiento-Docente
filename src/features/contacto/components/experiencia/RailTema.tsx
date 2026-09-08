import { siteConfig } from "@/config/site";
import type { Tema } from "./data";
import { DOTS_NAVY } from "./estilos";

type Props = {
  temaActivo: Tema | undefined;
  temaIdx: number;
};

/**
 * Rail navy del formulario (idioma de la banda de stats de la home): la
 * baldosa de ícono y el número del tema, su título y detalle, y al pie los
 * datos institucionales reales (mail y oficina). Es un [data-campo]: entra y
 * sale con la cascada del formulario.
 */
export function RailTema({ temaActivo, temaIdx }: Props) {
  // Ícono del tema elegido: aterriza en la baldosa del rail (destino del vuelo).
  const ChipIcon = temaActivo?.Icon;
  return (
    <aside
      data-campo
      className="bg-azul-principal relative flex flex-col overflow-hidden rounded-t-3xl p-6 md:p-8 lg:rounded-l-3xl lg:rounded-tr-none"
    >
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${DOTS_NAVY}`} />

      {/* Cabecera del rail: la baldosa de ícono del tema y el número.
          Entra con la superficie del rail en la cascada del formulario. */}
      <div className="relative flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"
          aria-hidden="true"
        >
          {ChipIcon && <ChipIcon size={24} className="text-white" />}
        </span>
        <p className="text-verde-concepto font-mono text-[0.7rem] font-medium tracking-[0.18em] uppercase">
          Tema · 0{temaIdx + 1}
        </p>
      </div>
      {/* Título del tema elegido (aparece con la superficie del rail) */}
      <h2
        className="font-display relative mt-4 text-[1.5rem] leading-tight font-bold tracking-[-0.01em] text-white md:text-[1.75rem]"
      >
        {temaActivo?.titulo ?? "Consulta"}
      </h2>
      <p className="text-azul-claro/80 relative mt-2 font-sans text-[0.9rem] leading-relaxed">
        {temaActivo?.detalle}
      </p>

      {/* Datos institucionales reales anclados al pie del rail: canal
          directo (mail + copiar) y oficina. Reemplazan al viejo
          "Santiago · N países", que era relleno. */}
      <div className="relative mt-auto hidden border-t border-white/15 pt-5 lg:block">
        <p className="text-azul-claro/55 font-mono text-[0.6rem] font-medium tracking-[0.2em] uppercase">
          Escribinos
        </p>
        <a
          href={`mailto:${siteConfig.contacto.email}`}
          className="hover:text-verde-concepto mt-1.5 block font-sans text-[0.92rem] font-medium break-words text-white transition-colors"
        >
          {siteConfig.contacto.email}
        </a>

        <p className="text-azul-claro/55 mt-5 font-mono text-[0.6rem] font-medium tracking-[0.2em] uppercase">
          Oficina
        </p>
        <address className="text-azul-claro/80 mt-1.5 font-sans text-[0.84rem] leading-relaxed not-italic">
          {siteConfig.contacto.direccion.calle},{" "}
          {siteConfig.contacto.direccion.complemento}
          <br />
          {siteConfig.contacto.direccion.ciudad},{" "}
          {siteConfig.contacto.direccion.pais}
        </address>
      </div>
    </aside>
  );
}
