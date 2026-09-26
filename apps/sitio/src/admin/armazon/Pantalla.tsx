import type { CSSProperties } from "react";
import Image from "next/image";

// El haz del faro (DESIGN.md §9 y §11): la misma idea que los puntos
// encendidos de Biblioteca (`PuntosFaro`), pero quieta. Una segunda capa de
// puntos, más brillante, recortada por una cuña que sale de la lámpara del
// logo y baja hacia el formulario. La lámpara está a 110 × 70 px de la esquina
// del panel (el logo a 240 px de ancho, con 48 px de margen). La segunda
// máscara, un círculo con centro en la lámpara, apaga el haz hasta 250 px: la
// esquina más lejana del logo queda a 201 px, así que el haz respeta el margen
// de seguridad (§10: la altura de la «E», unos 44 px) y empieza en un arco,
// como la luz que sale de la lámpara.
const MASCARA_DEL_HAZ =
  "conic-gradient(from 104deg at 110px 70px, transparent, black 4deg, black 24deg, transparent 28deg), radial-gradient(circle at 110px 70px, transparent 250px, black 340px)";
const HAZ: CSSProperties = {
  maskImage: MASCARA_DEL_HAZ,
  WebkitMaskImage: MASCARA_DEL_HAZ,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

/**
 * Las tres pantallas de acceso (entrar, olvidé y nueva contraseña): el panel
 * de la marca a la izquierda y el formulario a la derecha. Es el único momento
 * de marca del admin (DESIGN.md §11, «Pantalla de acceso»): el logo arriba, el
 * haz del faro cruzando la grilla de puntos hacia el formulario, «Admin del
 * sitio» abajo a la escala del sitio y una sola forma plana, el círculo
 * `azul-medio` que sale del borde. Todo lo decorativo va con `aria-hidden`.
 *
 * En el celular el panel es una franja arriba: el logo a 144 px (el manual
 * pide 120 como mínimo, §10) y «Admin del sitio» al lado, sin el haz.
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
      <aside className="relative flex items-center justify-between gap-4 overflow-hidden bg-azul-principal px-6 py-5 lg:w-5/12 lg:flex-col lg:items-start lg:px-12 lg:py-12">
        <div aria-hidden="true" className="pattern-dots-inverse absolute inset-0 [--dots-alpha:0.08]" />
        <div aria-hidden="true" className="pattern-dots-inverse absolute inset-0 hidden [--dots-alpha:0.34] lg:block" style={HAZ} />
        <div aria-hidden="true" className="absolute -right-24 -bottom-24 hidden size-64 rounded-full bg-azul-medio lg:block" />
        <Image
          src="/brand/logo-ed-negativo.png"
          alt="Empoderamiento Docente"
          width={1252}
          height={608}
          loading="eager"
          sizes="(min-width: 1024px) 240px, 144px"
          className="relative h-auto w-36 lg:w-60"
        />
        {/* Blanco sobre `azul-principal` (13,63:1) y, si toca el círculo, sobre `azul-medio` (5,11:1). */}
        <p className="relative font-display text-admin-seccion font-bold text-white lg:text-h1 lg:tracking-tight">
          Admin <span className="lg:block">del sitio</span>
        </p>
      </aside>
      {/* En el celular el formulario sigue a la franja, arriba; desde `lg`, centrado al lado del panel. */}
      <main className="flex flex-1 items-start justify-center px-6 py-10 lg:items-center lg:px-16 lg:py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-admin-titulo font-bold tracking-tight text-azul-principal">{titulo}</h1>
          {bajada ? <p className="mt-2 text-admin-meta text-gris-texto">{bajada}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
