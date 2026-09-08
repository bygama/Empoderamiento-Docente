import { Eyebrow } from "@/components/ui/Eyebrow";
import { ALIADOS } from "@/config/aliados";
import { INTERLOCUTORES } from "@/features/que-hacemos/areas";

/**
 * Con quién trabaja ED: los cuatro tipos de interlocutor y, debajo, los
 * logos autorizados sobre una banda navy (los archivos se pintan de blanco
 * con el mismo filtro que en la home y el pie; sobre blanco no se verían).
 */
export function ConQuienTrabajamos() {
  return (
    <section
      id="con-quien"
      data-indice="Con quién"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <header className="max-w-[62ch]">
          <Eyebrow>Con quién trabajamos</Eyebrow>
          <h2
            className="font-display mt-5 text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem]"
            style={{ lineHeight: 1.1 }}
          >
            Trabajamos con quienes deciden y sostienen la enseñanza
          </h2>
          <p className="text-gris-texto mt-5 font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
            Cada proyecto se arma con la institución que lo va a sostener y,
            adentro de cada uno, con docentes, coordinaciones y líderes
            pedagógicos.
          </p>
        </header>

        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {INTERLOCUTORES.map((it) => (
            <li key={it.quien} className="border-azul-principal/10 border-t pt-5">
              <h3 className="font-display text-[1.2rem] font-bold tracking-[-0.01em]">{it.quien}</h3>
              <p className="text-gris-texto mt-2 font-sans text-[0.98rem] leading-relaxed">{it.que}</p>
            </li>
          ))}
        </ul>

        <div className="bg-azul-principal mt-14 rounded-[1.75rem] px-6 py-10 md:px-12">
          <p className="text-azul-claro/80 text-center font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
            Nos acompañan
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
            {ALIADOS.map((a) => (
              <li key={a.src} className="flex h-12 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.src}
                  alt={a.alt}
                  draggable={false}
                  className={`${a.alto.home} w-auto opacity-75 [filter:brightness(0)_invert(1)]`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
