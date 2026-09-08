import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Facebook } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { NAV_LINKS, CTA_LINK, HOME_LINK } from "@/config/nav";

/**
 * Footer institucional de Empoderamiento Docente.
 *
 * Composición inspirada en el footer de Wolverine Worldwide, traducida a la
 * marca de ED:
 *
 *  1. Bloque oscuro (azul-principal), esquinas superiores redondeadas: a la
 *     izquierda el logo del navbar sobre chip blanco + descripción (centrada) +
 *     redes al pie; a la
 *     derecha la navegación grande apilada con hairlines entre ítems. Debajo,
 *     la tira de logos de aliados (centrada, sin título) y la barra legal.
 *  2. Banda de imagen debajo, enmarcada por el azul (padding sup./laterales),
 *     con el wordmark "EMPODERAMIENTO DOCENTE | ED" superpuesto (eco del
 *     "WOLVERINE WORLDWIDE | W").
 *
 * Datos siempre desde @/config (nunca hardcodear). Redes: el href sale de
 * siteConfig.redes; sin handle oficial cae a "#" (no inventar URLs).
 * Server component: sin JS; los estados de hover dan el sentido "diseñado".
 */

// Las 7 rutas del sitemap: logo (Inicio) + nav principal + Contacto (acción).
const FOOTER_NAV = [HOME_LINK, ...NAV_LINKS, CTA_LINK] as const;

// Redes a mostrar. El href sale de siteConfig.redes; mientras no haya handle
// oficial cae a "#" (no inventar URLs). Se muestran siempre para ocupar la
// columna de marca — al cargar los handles reales quedan enlazadas solas.
const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const satisfies ReadonlyArray<{
  key: keyof typeof siteConfig.redes;
  label: string;
  Icon: typeof Instagram;
}>;

// Aliados con logo AUTORIZADO (negro sobre transparente → en el navy se
// renderizan en blanco monocromo vía filtro). NO agregar un aliado sin su
// archivo real ni sin OK.
// Science Up va más alto que el resto (h-10 contra h-7/h-9) porque es un
// lockup de dos líneas: su wordmark ocupa la mitad de la caja, así que a la
// altura de los demás quedaría ópticamente la mitad de presente. Es un punto
// menos que en DatosDuros (h-11) porque acá el <li> mide h-11 y no h-12.
const ALIADOS = [
  { src: "/aliados/techint.png", alt: "Techint", cls: "h-7" },
  { src: "/aliados/roberto-rocca.svg", alt: "Roberto Rocca", cls: "h-7" },
  { src: "/aliados/buenos-aires.png", alt: "Buenos Aires Ciudad", cls: "h-9" },
  {
    src: "/aliados/science-up.png",
    alt: "Science Up — Consorcio Ciencia 2030 PUCV, USACH, UCN",
    cls: "h-10",
  },
] as const;

const { name, paises } = siteConfig;

export function Footer() {
  const year = 2026;

  return (
    <footer
      data-section="footer"
      className="bg-azul-principal relative isolate overflow-hidden rounded-t-[var(--footer-radio)] text-white"
    >
      {/* ── Bloque principal ─────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-screen-xl gap-x-10 gap-y-8 px-5 pt-11 pb-8 md:grid-cols-12 md:px-10 md:pt-14">
        {/* Columna marca */}
        <div className="flex flex-col gap-8 md:col-span-5 md:gap-0 lg:col-span-4">
          <Link
            href={HOME_LINK.href}
            aria-label={name}
            className="focus-visible:outline-azul-claro inline-flex w-fit rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 md:mt-10 lg:mt-14"
          >
            {/* MISMO logo que el navbar (logotipo-principal-ed). Como está hecho
                para fondo claro, va sobre un chip blanco para leerse en el navy.
                Más grande y bajado a la zona central de la columna → más presencia. */}
            <span className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3.5">
              <Image
                src="/brand/logotipo-principal-ed.png"
                alt={name}
                width={425}
                height={467}
                priority={false}
                className="h-20 w-auto md:h-24 lg:h-28"
              />
            </span>
          </Link>

          {/* Descripción centrada verticalmente (al medio de la columna),
              alineada a la izquierda. */}
          <div className="flex items-center md:flex-1">
            <p className="text-azul-claro/85 max-w-xs font-sans text-[0.92rem] leading-relaxed">
              Investigamos, diseñamos y acompañamos procesos educativos situados
              junto a comunidades, instituciones y equipos docentes.
            </p>
          </div>

          {/* Redes al pie de la columna. */}
          <ul className="flex items-center gap-4">
            {REDES.map(({ key, label, Icon }) => {
              const url = siteConfig.redes[key];
              return (
                <li key={key}>
                  <a
                    href={url ?? "#"}
                    {...(url
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    aria-label={`${name} en ${label}`}
                    className="text-azul-claro/70 hover:text-white -m-2.5 inline-flex p-2.5 transition-colors"
                  >
                    <Icon size={20} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Columna navegación + sub-columnas */}
        <div className="md:col-span-7 lg:col-span-8 lg:pl-8">
          {/* Navegación grande apilada con hairlines (silueta Wolverine). */}
          <nav aria-label="Navegación del pie">
            <ul>
              {FOOTER_NAV.map((link) => {
                const esAccion = link.href === CTA_LINK.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group border-azul-medio/30 hover:text-azul-claro focus-visible:outline-azul-claro flex items-center justify-between border-t py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:py-3"
                    >
                      <span className="font-display text-[clamp(1.2rem,0.85rem+1.1vw,1.7rem)] font-bold tracking-[-0.01em]">
                        {link.label}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 transition-all duration-300 ${
                          esAccion
                            ? "opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                        }`}
                      >
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Tira de aliados (logos autorizados) — centrada, sin título. */}
        <div className="md:col-span-12">
          <div className="border-azul-medio/15 relative border-t pt-8">
            <span className="bg-verde-concepto absolute top-0 left-1/2 h-px w-20 -translate-x-1/2" />
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
              {ALIADOS.map((aliado) => (
                <li key={aliado.src} className="flex h-11 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aliado.src}
                    alt={aliado.alt}
                    draggable={false}
                    className={`${aliado.cls} w-auto opacity-70 transition-opacity duration-300 hover:opacity-100 [filter:brightness(0)_invert(1)]`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra legal */}
        <div className="border-azul-medio/15 text-azul-claro/55 flex flex-col gap-2 border-t pt-5 font-mono text-[0.72rem] tracking-[0.14em] uppercase md:col-span-12 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {name}
          </p>
          <p>{paises.join(" · ")}</p>
          <p className="font-sans normal-case tracking-normal italic">
            Investigamos lo que hacemos, hacemos lo que investigamos.
          </p>
        </div>
      </div>

      {/* ── Banda de imagen + wordmark. Contenedor azul con padding sup./laterales
            → el azul enmarca la foto en los bordes; esquinas superiores
            redondeadas (eco del "borde de color" de la referencia). ── */}
      <div className="bg-azul-principal w-full px-3 pt-3 md:px-5 md:pt-5">
        <div className="relative h-[clamp(190px,26vw,360px)] w-full overflow-hidden rounded-t-[1.25rem] md:rounded-t-[2rem]">
          <Image
            src="/hero/hero-5.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Overlay navy: liga la foto a la marca y asegura contraste del wordmark. */}
          <div
            aria-hidden="true"
            className="bg-azul-principal/55 absolute inset-0"
          />
          <div
            aria-hidden="true"
            className="from-azul-principal/80 to-azul-principal/55 absolute inset-0 bg-gradient-to-t via-transparent"
          />

          <div className="absolute inset-0 flex items-center justify-center px-5">
            <p className="font-display flex flex-wrap items-center justify-center gap-x-[0.35em] gap-y-1 text-center text-[clamp(1.3rem,5vw,3.8rem)] leading-none tracking-[0.02em] text-white [text-shadow:0_2px_24px_rgba(15,21,40,0.55)]">
              {/* Versión NEGATIVA (blanca) del mark del navbar — se lee limpio
                  sobre la foto oscura, sin chip. */}
              <Image
                src="/brand/logotipo-principal-ed-negativo.png"
                alt=""
                width={395}
                height={433}
                className="mr-[0.1em] inline-block h-[1.15em] w-auto"
              />
              <span aria-hidden="true" className="text-azul-claro/45 font-light">
                |
              </span>
              <span className="font-bold">EMPODERAMIENTO</span>
              <span className="text-azul-claro font-medium">DOCENTE</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
