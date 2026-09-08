import Image from "next/image";
import { EQUIPO_FOTOS, EQUIPO_RESTO, TITULO } from "./data";
import { TITULO_TIPO } from "./estilos";

/**
 * Columna de identidad de la apertura (izquierda): rayita, el titular que
 * ATERRIZA desde el hero, la frase-pilar y el equipo real (foto + cartel en
 * desktop, fila compacta en mobile). Composición editorial asimétrica, idioma
 * de la home.
 */
export function ColumnaIdentidad() {
  return (
    <div className="lg:flex lg:h-full lg:flex-col lg:justify-between">
      {/* Bloque superior: rayita + titular + bajada. */}
      <div>
        {/* Kicker: solo la rayita de marca (sin label), pegada al título
            — mismo idioma editorial que los heros de la home, donde el
            titular gigante manda solo. Ecoa el rule del cierre. */}
        <div data-ap-head>
          <span
            aria-hidden="true"
            className="bg-verde-concepto block h-[2px] w-12 rounded-full"
          />
        </div>
        {/* Acá ATERRIZA el titular del hero (destino del viaje). Misma
            familia, peso, tracking y line-height que el h1: el ghost es
            un scale exacto entre los dos. */}
        <h2
          data-ap-h2
          className={`${TITULO_TIPO.familia} mt-4 ${TITULO_TIPO.peso}`}
          style={{ fontSize: "clamp(2.2rem, 1rem + 4vw, 4.2rem)", lineHeight: 0.95 }}
        >
          <span className="sr-only">{TITULO}</span>
          <span data-ap-titulo aria-hidden="true" className="relative inline-block whitespace-nowrap">
            {TITULO}
          </span>
        </h2>
      </div>

      {/* Frase-pilar de marca (contenido con sentido) en el medio de la
          columna: refuerza el porqué del contacto — la comunidad. Copy
          oficial verbatim (AGENTS.md §5.5). Solo desktop; el
          justify-between la reparte entre el titular y la foto. */}
      <p
        data-ap-head
        className="font-display text-azul-principal hidden max-w-[26rem] text-[1.4rem] leading-snug font-semibold tracking-[-0.01em] lg:block"
      >
        <span className="text-verde-concepto">Comunidad docente</span> en
        torno a la Matemática Educativa.
      </p>

      {/* Foto real + cartel flotante: el idioma EXACTO de las tarjetas
          del hero de la home (rounded-2xl + ring + sombra profunda +
          cartel frosted con título verde) traído al contacto. Es la
          prueba visual de "del otro lado hay personas": aula real y
          caras reales del equipo, no un claim tipográfico. Anclada al
          fondo de la columna (justify-between) para IGUALAR la altura
          del índice. Solo desktop ancho — en mobile la columna ya va
          apilada y la foto empujaría el índice fuera del viewport. */}
      <div data-ap-head className="mb-16 hidden w-full max-w-[24rem] lg:block">
        <div className="relative">
          <div className="relative aspect-[7/5] w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40">
            <Image
              src="/metodo/escuchamos.webp"
              alt="Sesión de trabajo con docentes"
              fill
              sizes="(min-width: 1024px) 24rem, 0px"
              className="object-cover"
            />
          </div>
          <div className="ring-azul-principal/10 absolute -bottom-6 left-4 z-10 flex items-center gap-3 rounded-xl bg-white/85 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 backdrop-blur-md">
            <div className="flex shrink-0 -space-x-2">
              {EQUIPO_FOTOS.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
              ))}
              <span className="bg-azul-principal flex h-8 w-8 items-center justify-center rounded-full border-2 border-white font-mono text-[0.66rem] font-medium text-white">
                +{EQUIPO_RESTO}
              </span>
            </div>
            <div>
              <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                Del otro lado, personas
              </p>
              <p className="text-gris-texto mt-0.5 font-sans text-[0.72rem] leading-snug whitespace-nowrap">
                Investigan y enseñan matemáticas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* En mobile el equipo queda como fila compacta (la foto grande
          no entra sin desalojar el índice). */}
      <div data-ap-head className="mt-7 flex items-center gap-3 lg:hidden">
        <div className="flex shrink-0 -space-x-2">
          {EQUIPO_FOTOS.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border-2 border-white object-cover"
            />
          ))}
          <span className="bg-azul-principal flex h-9 w-9 items-center justify-center rounded-full border-2 border-white font-mono text-[0.62rem] font-medium text-white">
            +{EQUIPO_RESTO}
          </span>
        </div>
        <p className="text-gris-texto font-sans text-[0.85rem] leading-snug">
          Del otro lado, personas que investigan y enseñan.
        </p>
      </div>
    </div>
  );
}
