"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CasoInvestigacion } from "./data";
import { ETIQUETA_DEMO } from "./data";
import { ROTULO_MICRO, ROTULO_SECCION, ROTULO_TAB, TINTES } from "./tintes";
import { EvidenciasCaso, QUERY_PUNTERO_FINO } from "./EvidenciasCaso";
import { LaminaCaso } from "./LaminaCaso";
import { ClipPapel, FlechaManuscrita, Pestana, SubrayadoMarcador } from "./Garabatos";
import { ArrowRight } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  caso: CasoInvestigacion;
  casos: readonly CasoInvestigacion[];
  indice: number;
  interactiva: boolean;
  /** true cuando el lugar está establecido (open/switching): fondo opaco.
   *  Durante apertura/cierre queda transparente para que el morph con la
   *  carpeta del índice (que vive en la página, debajo) sea visible. */
  telonOpaco: boolean;
  /** desdeBanda: true cuando el origen es la banda «SIGUIENTE EXPEDIENTE»
   *  (habilita la transición banda-que-sube con ghost). */
  onIr: (indice: number, desdeBanda?: boolean) => void;
  onVolver: () => void;
  refLugar: Ref<HTMLElement>;
  refShell: Ref<HTMLDivElement>;
  refTitulo: Ref<HTMLHeadingElement>;
};

/**
 * Rótulo de sección del expediente: mono + MARCADOR (como si alguien
 * hubiera resaltado la sección al leer el archivo) + regla que respira.
 * Colores parametrizados: sobre la hoja blanca o sobre el cartón tintado.
 */
function Rotulo({
  children,
  texto = "text-gris-texto",
  marcador = "text-verde-concepto/60",
  regla = "border-azul-principal/10",
}: {
  children: string;
  texto?: string;
  marcador?: string;
  regla?: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <h4 className={`${texto} ${ROTULO_SECCION} relative whitespace-nowrap`}>
        <SubrayadoMarcador
          aria-hidden="true"
          className={`absolute -bottom-2 left-0 h-2.5 w-full ${marcador}`}
        />
        {children}
      </h4>
      <span aria-hidden="true" className={`flex-1 border-t ${regla}`} />
    </div>
  );
}

/**
 * Expediente abierto v9 — DOS SUPERFICIES (gramática de la referencia):
 * la hoja blanca es el informe y es CORTA (contexto mecanografiado +
 * pregunta); donde termina, queda a la vista el CARTÓN tintado del
 * interior de la carpeta, y todo lo que sigue son recursos sueltos
 * apoyados sobre el color — collage de evidencias, análisis como hoja
 * mecanografiada con clip, aprendizaje como post-it, síntesis en placa,
 * sello ED con logo estampado directo sobre el cartón y producción como
 * etiquetas. El lugar (capa fija con scroll propio, data-lenis-prevent
 * para que Lenis no se coma la rueda) abre con título display ancho +
 * ficha catalográfica y un indicio de scroll que se apaga al recorrer.
 * Las pestañas de los otros casos son parte del objeto: asoman del canto
 * derecho de la carcasa. Tipografías de material (no de UI): manuscrita
 * para notas, máquina de escribir para el texto documental.
 */
export function ExpedienteCaso({
  caso,
  casos,
  indice,
  interactiva,
  telonOpaco,
  onIr,
  onVolver,
  refLugar,
  refShell,
  refTitulo,
}: Props) {
  const cuerpoRef = useRef<HTMLDivElement | null>(null);
  const [recorrido, setRecorrido] = useState(false);
  const reduced = useReducedMotion();
  const tinte = TINTES[caso.tinte];
  const oscuro = caso.tinte !== "claro";
  const siguiente = indice < casos.length - 1 ? casos[indice + 1] : null;

  /* Colores del cartón (texto directo sobre el interior tintado). */
  const cartonTexto = oscuro ? "text-white/85" : "text-azul-principal/85";
  const cartonMarcador = oscuro ? "text-white/35" : "text-azul-medio/60";
  const cartonRegla = oscuro ? "border-white/15" : "border-azul-principal/15";

  /* Indicio de scroll: se apaga al primer recorrido del lugar. */
  useEffect(() => {
    const lugar = cuerpoRef.current?.closest<HTMLElement>("[data-exp-lugar]");
    if (!lugar) return;
    const alScroll = () => {
      if (lugar.scrollTop > 40) setRecorrido(true);
    };
    lugar.addEventListener("scroll", alScroll, { passive: true });
    return () => lugar.removeEventListener("scroll", alScroll);
  }, [caso.id]);

  /* Reveal por scroll de los bloques (una vez). El scroll vive en la capa
     del lugar, no en la ventana: todos los triggers usan ese scroller.
     (La capa se resuelve por closest: el ref del padre viaja directo al
     <article> y acá no se mutan props — regla react-hooks/immutability.) */
  useIsomorphicLayoutEffect(() => {
    const cuerpo = cuerpoRef.current;
    const lugar = cuerpo?.closest<HTMLElement>("[data-exp-lugar]");
    if (!cuerpo || !lugar || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-exp-bloque]").forEach((bloque) => {
        gsap.fromTo(
          bloque,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bloque,
              scroller: lugar,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
      // Piezas que se ASIENTAN: llegan con una rotación extra que se
      // acomoda al entrar (la rotación final la pone su clase CSS).
      gsap.utils.toArray<HTMLElement>("[data-exp-asienta]").forEach((pieza) => {
        gsap.fromTo(
          pieza,
          { rotation: -2.6 },
          {
            rotation: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pieza,
              scroller: lugar,
              start: "top 90%",
              once: true,
            },
          },
        );
      });
      // El ÚNICO momento teatral del lugar: el sello se estampa.
      const sello = cuerpo.querySelector<HTMLElement>("[data-exp-sello]");
      if (sello) {
        gsap.fromTo(
          sello,
          { scale: 1.7, opacity: 0, rotation: 10 },
          {
            scale: 1,
            opacity: 0.75,
            rotation: 0,
            duration: 0.55,
            ease: "back.out(2.2)",
            scrollTrigger: {
              trigger: sello,
              scroller: lugar,
              start: "top 82%",
              once: true,
            },
          },
        );
      }
    }, lugar);
    return () => ctx.revert();
  }, [reduced, caso.id]);

  /* Micro-parallax de piezas sueltas (lámina, notas, sello): puntero fino. */
  useIsomorphicLayoutEffect(() => {
    const cuerpo = cuerpoRef.current;
    if (!cuerpo || reduced) return;
    if (!window.matchMedia(QUERY_PUNTERO_FINO).matches) return;
    const piezas = gsap.utils.toArray<HTMLElement>(
      cuerpo.querySelectorAll("[data-pieza-parallax]"),
    );
    if (!piezas.length) return;
    const movimientos = piezas.map((el) => ({
      x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
      profundidad: parseFloat(el.dataset.profundidad ?? "5"),
    }));
    const alMover = (e: MouseEvent) => {
      const r = cuerpo.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / Math.min(r.height, window.innerHeight) - 0.5;
      movimientos.forEach((m) => {
        m.x(nx * m.profundidad * 2);
        m.y(ny * m.profundidad * 1.5);
      });
    };
    cuerpo.addEventListener("mousemove", alMover);
    return () => {
      cuerpo.removeEventListener("mousemove", alMover);
      gsap.killTweensOf(piezas);
      gsap.set(piezas, { x: 0, y: 0 });
    };
  }, [reduced, caso.id]);

  return (
    <article
      ref={refLugar}
      data-exp-lugar
      data-lenis-prevent
      id="expediente-caso"
      aria-label={`Expediente del caso ${caso.numero}`}
      className={`fixed inset-0 z-50 overflow-x-hidden overflow-y-auto overscroll-contain ${
        telonOpaco ? "bg-gris-fondo" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto w-[min(96vw,94rem)] px-4 pt-14 pb-24 lg:px-8 lg:pt-16 lg:pb-28">
        {/* ── Cabecera del lugar: identidad del expediente, FUERA de la
            carpeta (como el rótulo de sala de un archivo) ─────────────── */}
        <header data-exp-entrada data-exp-header className="relative z-10">
          <p
            data-exp-rotulo
            className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${ROTULO_MICRO} text-azul-principal/70`}
          >
            <span>EXPEDIENTE Nº {caso.numero}</span>
            <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
            <span>{caso.eje.toUpperCase()}</span>
            {caso.esDemo && (
              <span className="border-azul-principal/25 text-gris-texto rounded-full border px-2.5 py-0.5">
                DEMO
              </span>
            )}
          </p>
          <h3
            ref={refTitulo}
            data-exp-titulo
            tabIndex={-1}
            className="font-display text-azul-principal mt-5 max-w-[27ch] text-display font-extrabold tracking-[-0.025em] outline-none"
          >
            {caso.pregunta}
          </h3>
          {/* Ficha catalográfica: el documento de identidad del caso */}
          <p
            data-exp-ficha
            className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 ${ROTULO_MICRO} text-azul-principal/70`}
          >
            <span>PERÍODO {caso.ficha.periodo}</span>
            <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
            <span>{caso.ficha.ambito.toUpperCase()}</span>
            <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
            <span>
              {caso.evidencias.length.toString().padStart(2, "0")} EVIDENCIAS
            </span>
            <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
            <span>ESTADO: {caso.ficha.estado}</span>
          </p>
        </header>

        {/* ── La carpeta: carcasa tintada = INTERIOR de cartón. La hoja
            blanca (el informe) es corta; el resto del recorrido son
            recursos sueltos apoyados directamente sobre el color ──────── */}
        <div className="relative mt-12 lg:mt-14">
          <div
            ref={refShell}
            className={`${tinte.carpeta} ${tinte.grano} relative rounded-[1.6rem] p-3 pt-12 shadow-[0_44px_110px_-42px_rgb(31_45_77/0.6)] will-change-transform md:p-5 md:pt-14 lg:p-9 lg:pt-16`}
          >
            {/* Pestaña de la carpeta, presente también en el lugar */}
            <span
              aria-hidden="true"
              className={`${tinte.tinta} absolute -top-9 right-[4%] block h-10 w-56`}
            >
              <Pestana className="h-full w-full">
                <span className={`${ROTULO_TAB} whitespace-nowrap ${tinte.texto}`}>
                  CASO {caso.numero}
                </span>
              </Pestana>
            </span>

            {/* Pestañas de los OTROS casos: parte del objeto — asoman del
                canto derecho de la carcasa, como separadores del archivo */}
            <nav
              aria-label="Otros casos"
              className="absolute top-28 -right-[2.15rem] z-[5] hidden w-10 flex-col gap-5 lg:flex"
            >
              {casos.map(
                (otro, i) =>
                  otro.id !== caso.id && (
                    <button
                      key={otro.id}
                      type="button"
                      data-exp-tab-lateral
                      onClick={() => interactiva && onIr(i)}
                      title={otro.pregunta}
                      className="group/tab focus-visible:outline-verde-concepto relative block h-44 w-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {/* El hit-area (botón) NUNCA se mueve — solo el visual
                          se asoma e ilumina: feedback sin hover-jitter. El
                          corrimiento va dentro del calc para no pisar el
                          -translate-x-1/2 del centrado. */}
                      <span
                        aria-hidden="true"
                        className={`${TINTES[otro.tinte].tinta} absolute top-1/2 left-1/2 block h-10 w-44 -translate-x-1/2 -translate-y-1/2 rotate-90 transition-[translate,filter] duration-300 ease-out group-hover/tab:brightness-110 group-focus-visible/tab:brightness-110 motion-safe:group-hover/tab:translate-x-[calc(-50%+0.3rem)] motion-safe:group-focus-visible/tab:translate-x-[calc(-50%+0.3rem)]`}
                      >
                        <Pestana className="h-full w-full">
                          <span
                            className={`${ROTULO_TAB} whitespace-nowrap ${TINTES[otro.tinte].texto}`}
                          >
                            CASO {otro.numero}
                          </span>
                        </Pestana>
                      </span>
                      <span className="sr-only">Caso {otro.numero}</span>
                    </button>
                  ),
              )}
            </nav>

            <div ref={cuerpoRef} className="relative">
              {/* ── SUPERFICIE 1: la hoja blanca — el informe, corto ──── */}
              <div
                data-exp-hoja
                data-exp-entrada
                className="bg-grain-light renglones-papel relative rounded-[1.2rem] bg-white px-6 py-12 shadow-[0_30px_60px_-26px_rgb(10_16_30/0.5)] md:px-10 lg:px-24 lg:py-16"
              >
                {/* Margen de hoja + perforación + anilla (lg+) */}
                <span
                  aria-hidden="true"
                  className="border-azul-principal/10 pointer-events-none absolute top-0 bottom-0 left-16 hidden border-r lg:block"
                />
                {["30%", "72%"].map((top) => (
                  <span key={top} aria-hidden="true" className="hidden lg:block">
                    <span
                      className={`absolute left-7 h-4 w-4 -translate-y-1/2 rounded-full ${tinte.carpeta} shadow-[inset_0_2px_3px_rgb(0_0_0/0.4)]`}
                      style={{ top }}
                    />
                    <span
                      className="border-gris-texto/50 absolute -left-3 z-10 h-14 w-7 -translate-y-1/2 rotate-[-4deg] rounded-full border-[3px] shadow-sm"
                      style={{ top }}
                    />
                  </span>
                ))}

                {/* Apertura: la lámina LIDERA y el contexto mecanografiado
                    la acompaña */}
                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
                  <section
                    data-exp-bloque
                    aria-label="Lámina del caso"
                    className="lg:-mt-2 lg:-ml-32"
                  >
                    <LaminaCaso lamina={caso.lamina} tinte={caso.tinte} esDemo={caso.esDemo} />
                  </section>
                  <section data-exp-bloque aria-label="Contexto" className="lg:pt-4">
                    <Rotulo>CONTEXTO</Rotulo>
                    <p className="font-typewriter text-azul-principal/90 mt-7 max-w-[48ch] text-[1rem] leading-[1.95]">
                      {caso.contexto}
                    </p>
                    <div className="mt-8 hidden items-end gap-3 lg:flex">
                      <FlechaManuscrita className="text-azul-medio/80 h-9 w-24 scale-x-[-1] rotate-[-6deg]" />
                      <span className="font-hand text-azul-medio text-[1.35rem] leading-none">
                        el registro de la sesión
                      </span>
                    </div>
                  </section>
                </div>

                {/* Cierre del informe: la pregunta de investigación */}
                <section
                  data-exp-bloque
                  aria-label="Pregunta de investigación"
                  className={`border-t ${tinte.borde} mt-14 pt-10 pb-2 text-center lg:mt-16 lg:pt-12`}
                >
                  <h4 className={`text-gris-texto ${ROTULO_SECCION} relative inline-block`}>
                    <SubrayadoMarcador
                      aria-hidden="true"
                      className="text-verde-concepto/60 absolute -bottom-2 left-0 h-2.5 w-full"
                    />
                    PREGUNTA DE INVESTIGACIÓN
                  </h4>
                  <p
                    className={`font-display mx-auto mt-6 max-w-3xl text-[1.3rem] leading-snug font-bold tracking-[-0.015em] md:text-[1.6rem] ${tinte.acentoTexto}`}
                  >
                    {caso.preguntaInvestigacion}
                  </p>
                </section>
              </div>

              {/* ── SUPERFICIE 2: el cartón — recursos sueltos sobre el
                  interior tintado de la carpeta ───────────────────────── */}
              <div data-exp-carton className="relative px-1 pt-14 pb-2 lg:px-6 lg:pt-20 lg:pb-4">
                {/* Evidencias: el collage pegado al cartón */}
                <section data-exp-bloque aria-label="Evidencias">
                  <Rotulo
                    texto={cartonTexto}
                    marcador={cartonMarcador}
                    regla={cartonRegla}
                  >{`EVIDENCIAS — ${caso.evidencias.length} DOCUMENTOS`}</Rotulo>
                  <div className={`mt-10 ${cartonTexto}`}>
                    <EvidenciasCaso evidencias={caso.evidencias} tinte={caso.tinte} />
                  </div>
                </section>

                {/* Lectura: análisis como hoja mecanografiada suelta +
                    aprendizaje como post-it celeste */}
                <div className="mt-16 grid items-start gap-10 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
                  <section data-exp-bloque aria-label="Análisis">
                    <div
                      data-exp-asienta
                      className="bg-grain-light relative rotate-[-0.7deg] rounded-md bg-white p-7 pt-9 shadow-[0_24px_55px_-24px_rgb(10_16_30/0.55)] lg:p-10 lg:pt-11"
                    >
                      <ClipPapel className="text-gris-texto absolute -top-4 left-8 h-12 w-auto rotate-[4deg] drop-shadow-sm" />
                      <Rotulo>ANÁLISIS</Rotulo>
                      <p className="font-typewriter text-azul-principal/90 mt-6 max-w-[58ch] text-[1rem] leading-[1.95]">
                        {caso.analisis}
                      </p>
                    </div>
                  </section>
                  <aside data-exp-bloque aria-label="Aprendizaje" className="lg:pt-8">
                    <div
                      data-pieza-parallax
                      data-exp-asienta
                      data-profundidad="5"
                      className="bg-azul-claro relative rotate-[1.6deg] rounded-lg p-6 pt-8 shadow-[0_18px_40px_-20px_rgb(10_16_30/0.5)] will-change-transform"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -top-2.5 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-2deg] border border-white/60 bg-white/55 shadow-sm"
                      />
                      <h4 className={`text-azul-principal/75 ${ROTULO_MICRO}`}>
                        APRENDIZAJE
                      </h4>
                      <p className="font-hand text-azul-principal mt-3 text-[1.6rem] leading-[1.25] font-medium">
                        “{caso.aprendizaje}”
                      </p>
                    </div>
                  </aside>
                </div>

                {/* Síntesis: placa blanca sujeta al cartón + sello ED con
                    logo estampado DIRECTO sobre el color */}
                <section
                  data-exp-bloque
                  aria-label="Qué cambió"
                  className="relative mt-16 lg:mt-24"
                >
                  <div
                    data-exp-asienta
                    className="bg-grain-light relative max-w-3xl rotate-[0.5deg] rounded-2xl bg-white px-8 py-10 shadow-[0_26px_60px_-26px_rgb(10_16_30/0.55)] lg:px-12 lg:py-12"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-azul-claro/45 absolute -top-3 left-10 h-6 w-24 rotate-[-3deg] border border-white/60 shadow-sm"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-azul-claro/45 absolute -right-4 -bottom-3 h-6 w-24 rotate-[5deg] border border-white/60 shadow-sm"
                    />
                    <Rotulo>QUÉ CAMBIÓ</Rotulo>
                    <p className="font-display text-azul-principal mt-5 max-w-[34ch] text-[1.3rem] leading-snug font-bold md:text-[1.55rem]">
                      {caso.queCambio}
                    </p>
                  </div>

                  <span
                    data-exp-sello
                    data-pieza-parallax
                    data-profundidad="3"
                    className={`absolute -bottom-8 hidden rotate-[4deg] items-center gap-3.5 rounded-lg border-2 px-5 py-3.5 opacity-75 will-change-transform lg:right-6 lg:flex ${
                      oscuro
                        ? "border-white/70 text-white/90"
                        : "border-azul-principal/70 text-azul-principal/90"
                    }`}
                  >
                    <Image
                      src={
                        oscuro
                          ? "/brand/logotipo-principal-ed-negativo.png"
                          : "/brand/logotipo-principal-ed.png"
                      }
                      alt=""
                      aria-hidden="true"
                      width={395}
                      height={433}
                      className="h-11 w-auto select-none"
                    />
                    <span className={ROTULO_MICRO}>
                      ARCHIVO DE
                      <br />
                      INVESTIGACIÓN
                    </span>
                  </span>
                </section>

                {/* Pie sobre el cartón: producción como etiquetas */}
                <footer data-exp-bloque className="mt-20 space-y-6 lg:mt-24">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <span className={`${cartonTexto} ${ROTULO_MICRO}`}>
                      PRODUCCIÓN RELACIONADA
                    </span>
                    {caso.produccionRelacionada.map((recurso, i) => (
                      <Link
                        key={recurso.titulo}
                        href={recurso.href}
                        className={`border-azul-principal/15 text-azul-principal hover:text-verde-concepto-texto bg-grain-light rounded-md border bg-white px-4 py-2 font-mono text-[0.72rem] tracking-[0.08em] shadow-[0_10px_24px_-14px_rgb(10_16_30/0.5)] transition-colors ${
                          i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1.2deg]"
                        }`}
                      >
                        {recurso.titulo}
                      </Link>
                    ))}
                  </div>
                  {caso.esDemo && (
                    <p className={`${cartonTexto} font-sans text-[0.78rem] italic opacity-90`}>
                      {ETIQUETA_DEMO}
                      {caso.aclaracion ? ` — ${caso.aclaracion}` : ""}
                    </p>
                  )}
                </footer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Remate del lugar: el siguiente expediente asoma como la MISMA
            banda-carpeta del archivo (o el retorno, en el último caso) ── */}
        <div data-exp-entrada data-exp-banda className="mt-20 lg:mt-24">
          {siguiente ? (
            <button
              type="button"
              onClick={() => interactiva && onIr(indice + 1, true)}
              className="group focus-visible:outline-verde-concepto relative block w-full pt-9 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span
                aria-hidden="true"
                className={`absolute top-0 left-[3%] block h-10 w-56 ${TINTES[siguiente.tinte].tinta}`}
              >
                <Pestana className="h-full w-full">
                  <span className={`${ROTULO_TAB} ${TINTES[siguiente.tinte].texto}`}>
                    CASO {siguiente.numero}
                  </span>
                </Pestana>
              </span>
              <span
                data-exp-banda-obj
                className={`${TINTES[siguiente.tinte].carpeta} ${TINTES[siguiente.tinte].grano} ${TINTES[siguiente.tinte].texto} relative block rounded-2xl px-8 py-9 shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55)] transition-[background-color] duration-500 lg:px-14 lg:py-12`}
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
                <span className={ROTULO_MICRO}>SIGUIENTE EXPEDIENTE</span>
                <span className="font-display mt-4 block max-w-[26ch] text-[1.5rem] leading-[1.15] font-extrabold tracking-[-0.015em] lg:text-[1.9rem]">
                  {siguiente.pregunta}
                </span>
                <span
                  className={`mt-6 inline-flex items-center gap-2.5 ${ROTULO_TAB} underline-offset-4 group-hover:underline`}
                >
                  ABRIR CASO {siguiente.numero}
                  <ArrowRight
                    size={16}
                    className="transition-transform motion-safe:group-hover:translate-x-1"
                  />
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => interactiva && onVolver()}
              className="group focus-visible:outline-verde-concepto bg-azul-principal bg-grain-dark relative block w-full rounded-2xl px-8 py-9 text-left text-white shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 lg:px-14 lg:py-12"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
              <span className={`${ROTULO_MICRO} relative`}>
                FIN DEL ARCHIVO — {casos.length.toString().padStart(2, "0")} EXPEDIENTES
              </span>
              <span className="font-display relative mt-4 block text-[1.5rem] leading-[1.15] font-extrabold tracking-[-0.015em] lg:text-[1.9rem]">
                La investigación sigue abierta.
              </span>
              <span
                className={`relative mt-6 inline-flex items-center gap-2.5 ${ROTULO_TAB} underline-offset-4 group-hover:underline`}
              >
                <span aria-hidden="true">←</span> VOLVER AL ARCHIVO
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Indicio de scroll: la primera pantalla muestra solo el borde de
          la carpeta; esto avisa que hay recorrido. Se apaga al scrollear. */}
      <p
        aria-hidden="true"
        className={`${ROTULO_MICRO} text-azul-principal/70 fixed bottom-8 left-8 z-[55] hidden items-center gap-2.5 transition-opacity duration-500 lg:flex ${
          telonOpaco && !recorrido ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        SEGUIR LEYENDO
        <span className="motion-safe:animate-bounce">↓</span>
      </p>
    </article>
  );
}
