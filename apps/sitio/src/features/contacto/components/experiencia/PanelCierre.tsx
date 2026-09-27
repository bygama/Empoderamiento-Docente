import type { CierreDeContacto } from "@/features/contacto/contenido/cierre";
import { CanalDirecto } from "../CanalDirecto";

type Props = {
  activo: boolean;
  /** Título del tema elegido (eco de qué conversación empezó). */
  titulo: string;
  /** Los textos del cierre, de `features/contacto/contenido/cierre.ts` o de la base. */
  contenido: CierreDeContacto;
  onOtra: () => void;
};

/** 3 · CIERRE — al enviar: «Cada propuesta empieza con una conversación.» */
export function PanelCierre({ activo, titulo, contenido, onOtra }: Props) {
  return (
    <div
      data-panel="cierre"
      aria-hidden={!activo}
      inert={!activo}
      className="absolute inset-x-5 top-0 bottom-0 flex flex-col items-center justify-center text-center opacity-0 md:inset-x-10"
    >
      <span
        data-fin-rule
        aria-hidden="true"
        className="bg-verde-concepto block h-[2px] w-24 origin-center rounded-full"
      />
      {/* Eco del tema elegido: el cierre confirma QUÉ conversación empezó */}
      <p
        data-fin-bit
        className="text-verde-concepto mt-6 font-mono text-[0.7rem] font-medium tracking-[0.18em] uppercase"
      >
        {titulo}
      </p>
      <p
        data-fin-bit
        className="font-display text-azul-principal mt-4 max-w-[20ch] font-bold tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.9rem, 1rem + 3vw, 3.2rem)", lineHeight: 1.12 }}
      >
        {contenido.titulo}
      </p>
      <p data-fin-bit className="text-gris-texto mt-6 max-w-[52ch] font-sans text-[0.98rem] leading-relaxed">
        {contenido.texto}
      </p>
      <div data-fin-bit className="mt-5">
        <CanalDirecto />
      </div>
      <button
        data-fin-bit
        type="button"
        onClick={onOtra}
        className="border-azul-principal/25 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto mt-9 inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-sans text-[0.95rem] font-medium transition-colors"
      >
        {contenido.boton}
      </button>
    </div>
  );
}
