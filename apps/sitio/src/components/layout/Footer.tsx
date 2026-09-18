import Image from "next/image";
import { Instagram, Linkedin, Facebook } from "@/components/ui/icons";
import type { DatosDelSitio, Redes } from "@/config/datos-del-sitio";
import { siteConfig } from "@/config/site";
import { LogoDeAliado } from "@/features/aliados/components/LogoDeAliado";
import { altoDe, type AliadoDelSitio } from "@/features/aliados/contenido/modelo";
import { NAV_LINKS, CTA_LINK, HOME_LINK } from "@/config/nav";
import { CreditoSitio } from "./footer/CreditoSitio";
import { LinkPie } from "./footer/LinkPie";

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
 * Por debajo de `lg` (celular y tablet) no hay dos columnas: todo se apila
 * sobre un solo eje centrado, que es el que ya tenían los aliados, el crédito
 * y el wordmark de la foto.
 *
 * Datos nunca hardcodeados: la marca desde @/config/site, y las redes y los
 * países de Ajustes › Datos del sitio, que le pasa el layout. Una red sin URL
 * no se muestra (no inventar URLs).
 * Server component: sin JS; los estados de hover dan el sentido "diseñado".
 */

// Las 7 rutas del sitemap: logo (Inicio) + nav principal + Contacto (acción).
const FOOTER_NAV = [HOME_LINK, ...NAV_LINKS, CTA_LINK] as const;

// Redes a mostrar. El href sale de las redes de Ajustes › Datos del sitio: sin
// URL el ícono no se muestra (un ícono que lleva a «#» es un link muerto). Al
// cargar la URL en el admin aparece solo.
const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const satisfies ReadonlyArray<{
  key: keyof Redes;
  label: string;
  Icon: typeof Instagram;
}>;

// Aliados: los publicados y autorizados de la base, que le pasa el layout
// (misma tira que la home; acá el renglón es un poco más bajo, por eso el
// alto `pie` de su tamaño).
const { name } = siteConfig;

type Props = { sitio: Pick<DatosDelSitio, "redes" | "paises">; aliados: readonly AliadoDelSitio[] };

export function Footer({ sitio: { redes, paises }, aliados }: Props) {
  const year = 2026;

  return (
    <footer
      data-section="footer"
      className="bg-azul-principal relative isolate overflow-hidden rounded-t-[var(--footer-radio)] text-white"
    >
      {/* ── Bloque principal ─────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-screen-xl gap-x-10 gap-y-8 px-5 pt-11 pb-0 md:px-10 md:pt-14 lg:grid-cols-12">
        {/* Columna marca */}
        <div className="flex flex-col items-center gap-7 text-center lg:col-span-4 lg:items-start lg:gap-0 lg:text-left">
          <LinkPie
            href={HOME_LINK.href}
            aria-label={name}
            className="focus-visible:outline-azul-claro inline-flex w-fit rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 lg:mt-14"
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
                className="h-16 w-auto md:h-20 lg:h-28"
              />
            </span>
          </LinkPie>

          {/* Descripción centrada verticalmente (al medio de la columna),
              alineada a la izquierda en escritorio. */}
          <div className="flex items-center lg:flex-1">
            <p className="text-azul-claro/85 max-w-xs font-sans text-[0.92rem] leading-relaxed text-balance md:max-w-md lg:max-w-xs lg:text-wrap">
              Consultora especializada en la transformación del aprendizaje
              matemático. Investigación, materiales didácticos, desarrollo
              profesional docente, acompañamiento, currículo y evaluación.
            </p>
          </div>

          {/* Redes al pie de la columna: solo las que tienen URL confirmada. */}
          {REDES.some(({ key }) => redes[key]) && (
            <ul className="flex items-center gap-6 lg:gap-4">
              {REDES.map(({ key, label, Icon }) => {
                const url = redes[key];
                if (!url) return null;
                return (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} en ${label}`}
                      className="text-azul-claro/70 hover:text-white -m-3 inline-flex p-3 transition-colors lg:-m-2.5 lg:p-2.5"
                    >
                      <Icon size={20} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Columna navegación + sub-columnas */}
        <div className="lg:col-span-8 lg:pl-8">
          {/* Navegación grande apilada con hairlines (silueta Wolverine). */}
          {/* Apilado, el ancho se acota: en tablet una hairline de borde a
              borde con el texto al centro se lee vacía. */}
          <nav aria-label="Navegación del pie" className="mx-auto max-w-lg lg:max-w-none">
            <ul>
              {FOOTER_NAV.map((link) => {
                const esAccion = link.href === CTA_LINK.href;
                return (
                  <li key={link.href}>
                    {/* LinkPie: desde otra página navega y aterriza en el
                        hero; en la misma, sube al hero deslizando. */}
                    <LinkPie
                      href={link.href}
                      className="group border-azul-medio/30 hover:text-azul-claro focus-visible:outline-azul-claro flex items-center justify-center gap-2 border-t py-2.5 lg:justify-between transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:py-3"
                    >
                      <span className="font-display text-[clamp(1.2rem,0.85rem+1.1vw,1.7rem)] font-bold tracking-[-0.01em]">
                        {link.label}
                      </span>
                      {/* Sin hover (táctil) la flecha de los ítems no se vería
                          nunca: apilado solo la lleva Contacto, pegada al texto. */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 transition-[opacity,translate] duration-300 ${
                          esAccion
                            ? "opacity-100"
                            : "hidden -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70 lg:block"
                        }`}
                      >
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </LinkPie>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Tira de aliados (logos autorizados) — centrada, sin título. */}
        <div className="lg:col-span-12">
          <div className="border-azul-medio/15 relative border-t pt-8">
            <span className="bg-verde-concepto absolute top-0 left-1/2 h-px w-20 -translate-x-1/2" />
            {/* Celular: grilla de dos columnas, así los logos comparten eje
                aunque midan distinto, y el que queda solo cierra al centro.
                Desde tablet, una sola tira. */}
            <ul className="grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-6 md:flex md:flex-wrap md:justify-center md:gap-x-8 md:gap-y-5 lg:gap-x-12">
              {aliados.map((aliado) => (
                <li key={aliado.id} className="flex h-11 items-center last:odd:col-span-2">
                  <LogoDeAliado
                    aliado={aliado}
                    className={`${altoDe(aliado.tamano).pie} w-auto opacity-70 transition-opacity duration-300 hover:opacity-100 [filter:brightness(0)_invert(1)]`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra legal: dos renglones. Arriba ©, países y lema; abajo el
            crédito del sitio (`footer/CreditoSitio`). */}
        <div className="border-azul-medio/15 flex flex-col gap-4 border-t pt-5 lg:col-span-12">
          <div className="text-azul-claro/55 flex flex-col items-center gap-2 text-center font-mono text-[0.72rem] tracking-[0.14em] uppercase lg:flex-row lg:justify-between lg:text-left">
            <p>
              © {year} {name}
            </p>
            {/* El espacio duro ata cada «·» al país anterior: si la lista
                parte en dos renglones, ninguno arranca con el punto. */}
            <p className="text-balance">{paises.join(" · ")}</p>
            <p className="font-sans normal-case tracking-normal italic">
              Investigamos lo que hacemos, hacemos lo que investigamos.
            </p>
          </div>
          <CreditoSitio />
        </div>
      </div>

      {/* ── Banda de imagen + wordmark. Contenedor azul con padding sup./laterales
            → el azul enmarca la foto en los bordes; esquinas superiores
            redondeadas (eco del "borde de color" de la referencia). ── */}
      <div className="bg-azul-principal w-full px-3 pt-3 md:px-5 md:pt-5">
        <div className="relative h-[clamp(190px,26vw,360px)] w-full overflow-hidden rounded-t-[1.25rem] md:rounded-t-[2rem]">
          <Image
            src="/fotos/auditorio-panoramica.webp"
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
