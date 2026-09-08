import type { Metadata } from "next";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ArrowUpRight } from "@/components/ui/icons";
import { CTA_LINK, HOME_LINK, NAV_LINKS } from "@/config/nav";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "Esta dirección no existe en Empoderamiento Docente.",
};

/**
 * 404 propia. Sin ella, Next muestra su pantalla gris en inglés, que no
 * parece parte del sitio y no da por dónde seguir. Acá: qué pasó en una
 * línea, las siete rutas que sí existen y el contacto.
 */
export default function NotFound() {
  return (
    <main>
      <section
        data-footer-dock-tint="gris"
        aria-label="Página no encontrada"
        className="bg-gris-fondo bg-grain-light relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pt-36 pb-24 md:px-12"
      >
        <div className="mx-auto w-full max-w-screen-xl">
          <p className="text-verde-concepto font-mono text-[0.72rem] font-medium tracking-[0.24em] uppercase">
            Error 404
          </p>
          <h1
            className="font-display text-azul-principal mt-5 max-w-[16ch] font-extrabold tracking-[-0.025em] text-balance"
            style={{ fontSize: "clamp(2.4rem, 1rem + 4.6vw, 5rem)", lineHeight: 1.02 }}
          >
            Esta página no está en el mapa.
          </h1>
          <p className="text-gris-texto mt-6 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
            Puede que el link esté mal escrito o que la página haya cambiado de
            lugar. Estas son las que existen:
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[HOME_LINK, ...NAV_LINKS].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group border-azul-principal/10 text-azul-principal hover:border-azul-principal/40 font-display flex items-center justify-between rounded-2xl border bg-white px-5 py-4 text-[1.1rem] font-bold transition-colors"
                >
                  {link.label}
                  <ArrowUpRight
                    size={18}
                    className="text-azul-principal/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ButtonPrimary href={CTA_LINK.href}>Hablemos</ButtonPrimary>
          </div>
        </div>
      </section>
    </main>
  );
}
