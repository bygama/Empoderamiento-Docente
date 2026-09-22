import Image from "next/image";

/**
 * Las tres pantallas de acceso (entrar, olvidé y nueva contraseña): el panel
 * de la marca a la izquierda y el formulario a la derecha. En el celular el
 * panel queda como una franja arriba, con el logo chico y sin el patrón.
 *
 * El patrón es el del manual (DESIGN.md §6): la grilla de puntos blanca sobre
 * azul y UNA forma plana azul-medio que sale del borde. Es decorativo: va
 * con `aria-hidden`. «Admin del sitio» va en azul-claro sobre el azul
 * (7,68:1).
 */
export function Pantalla({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white lg:flex-row">
      {/* «Admin del sitio» va pegado al logo, arriba, y el círculo abajo: si el texto quedaba al pie, entre 1024 y ~1090 px caía sobre el círculo (azul-claro sobre azul-medio: 2,88:1). */}
      <aside className="relative flex items-center justify-between gap-4 overflow-hidden bg-azul-principal px-6 py-5 lg:w-5/12 lg:flex-col lg:items-start lg:justify-start lg:px-12 lg:py-12">
        <div aria-hidden="true" className="pattern-dots-inverse absolute inset-0 hidden lg:block" />
        <div aria-hidden="true" className="absolute -right-24 -bottom-32 hidden size-96 rounded-full bg-azul-medio lg:block" />
        {/* 144 px en el celular: el manual pide 120 como mínimo para el logo completo (§10). */}
        <Image
          src="/brand/logo-ed-negativo.png"
          alt="Empoderamiento Docente"
          width={1252}
          height={608}
          loading="eager"
          sizes="(min-width: 1024px) 240px, 144px"
          className="relative h-auto w-36 lg:w-60"
        />
        <p className="relative font-display text-sm font-medium text-azul-claro lg:text-lg">Admin del sitio</p>
      </aside>
      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold tracking-tight text-azul-principal">{titulo}</h1>
          {bajada ? <p className="mt-2 text-sm text-gris-texto">{bajada}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
