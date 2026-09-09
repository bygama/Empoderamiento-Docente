"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { MathField } from "@/components/ui/MathField";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { TEMAS, type TemaKey, type Vista } from "./experiencia/data";
import { panelDe, type Contexto, type Estado } from "./experiencia/contexto";
import { finIntro, montarIntro, saltarIntro } from "./experiencia/coreografia-intro";
import { cambiarTema, elegirTema } from "./experiencia/coreografia-paneles";
import { enviar, otraConsulta } from "./experiencia/coreografia-envio";
import { useSaltoIntro } from "./experiencia/useSaltoIntro";
import { PanelHero } from "./experiencia/PanelHero";
import { ColumnaIdentidad } from "./experiencia/ColumnaIdentidad";
import { IndiceTemas } from "./experiencia/IndiceTemas";
import { PanelFormulario } from "./experiencia/PanelFormulario";
import { PanelCierre } from "./experiencia/PanelCierre";

/**
 * Contacto como EXPERIENCIA DE UNA SOLA PANTALLA: acá no se scrollea, se
 * TRANSFORMA. Los estados viven apilados en el mismo viewport y morfean uno
 * en otro, en cadena y de ida:
 *
 *  0 · HERO — "Hablemos." gigante y EDITORIAL. La palabra sola: nada de
 *      eyebrow, bajada, botón ni hint. NO es una pantalla que haya que
 *      descartar: no pide ningún gesto, dura ~1,4s y se desarma SOLA. Antes
 *      era un peaje (scroll o "Empezar" para pasar) que cobraba un gesto y no
 *      entregaba nada nuevo — el titular repetía lo que decía la pantalla
 *      siguiente. Tampoco hay ya piezas flotantes con contenido institucional
 *      que VOLABAN y se convertían en las tarjetas de tema: era un truco lindo
 *      pero mentiroso — "Presencia · Chile, México…" no se transforma en
 *      "Formación y acompañamiento", es otro contenido disfrazado de la misma
 *      materia. Y cinco cajas iguales alrededor de una palabra son un tablero
 *      de widgets, no un hero.
 *  1 · APERTURA — el desarme: "Hablemos." NO se dispersa: VIAJA. Se achica
 *      hasta su lugar definitivo como titular del selector, y las tarjetas de
 *      tema entran en cascada a su alrededor. Por eso hay un solo titular
 *      acomodándose y no dos diciendo lo mismo — la palabra es la semilla del
 *      layout, no un cartel previo.
 *  2 · FORMULARIO — al elegir tema, el índice se disuelve y el formulario
 *      entra en cascada; el rail navy (ícono + título del tema) aparece de una,
 *      sin vuelo. "Cambiar tema" vuelve al selector sin perder lo tipeado.
 *  3 · CIERRE — al enviar: «Cada propuesta empieza con una conversación.»
 *
 * Lo secundario del sitemap (mail directo + sumarse al equipo) ya no vive en
 * una barra fija aparte: acompaña al contenido de cada estado (línea al pie
 * del índice en la apertura; fila al pie del contenedor en el formulario).
 *
 * Durante la intro el scroll queda quieto (los ghosts son position:fixed y un
 * scroll a mitad de vuelo los despega de su destino), pero NO con
 * `body.overflow = hidden`: eso saca la barra, ensancha el viewport y hace
 * saltar todo el contenido centrado al soltarlo. Lo frenan los handlers en
 * captura (useSaltoIntro). Y si alguien no la quiere mirar, el gesto la
 * SALTEA en vez de quedar tragado — la intro se muestra, no se impone.
 *
 * Envío sin backend todavía: arma un mailto: con asunto y cuerpo precargados.
 * Cuando se integre Supabase se reemplaza por un insert (confirmar schema
 * antes — AGENTS.md §12).
 *
 * Reduced-motion: se entra directo al selector, sin intro ni vuelos. El fondo
 * de nodos (MathField) queda vivo detrás siempre.
 *
 * Piezas (`experiencia/`): contenido en `data.ts`, clases en `estilos.ts`, el
 * contexto que reciben las coreografías en `contexto.ts`, la intro en
 * `coreografia-intro.ts` (+ `ghost-titulo.ts`, `useSaltoIntro.ts`), apertura ⇄
 * formulario en `coreografia-paneles.ts`, envío y vuelta en
 * `coreografia-envio.ts`; markup en PanelHero, ColumnaIdentidad, IndiceTemas,
 * PanelFormulario (RailTema + CamposContacto) y PanelCierre.
 */
export function ContactoExperiencia() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [vista, setVista] = useState<Vista>("hero");
  const [tema, setTema] = useState<TemaKey | null>(null);
  const [introListo, setIntroListo] = useState(false);
  // Texto que armó el formulario: en el cierre se puede copiar tal cual y
  // mandar por donde sea, por si el correo no se abrió.
  const [mensajeListo, setMensajeListo] = useState("");
  // Timelines en curso, intro viva y ghosts: mutable, sin renders.
  const estado = useRef<Estado>({ animando: false, introVivo: true, introTl: null, desarmeTl: null, ghosts: [] });

  const temaActivo = TEMAS.find((t) => t.key === tema);
  const temaIdx = Math.max(0, TEMAS.findIndex((t) => t.key === tema));

  // El contexto de las coreografías se arma al usarlo (handlers y efectos):
  // así las refs se leen fuera del render, como pide el compilador.
  const contexto = (): Contexto => ({
    root: rootRef.current,
    estado: estado.current,
    reduced,
    temaIdx,
    temaActivo,
    setVista,
    setTema,
    setIntroListo,
    setMensajeListo,
  });

  // ── Entrada inicial: el hero se arma y se desarma SOLO ──────────────────
  useIsomorphicLayoutEffect(() => montarIntro(contexto()), [reduced]);

  // ── Tema por URL (?tema=formacion|investigacion|alianzas|prensa|otra) ──
  // Quien llega desde un CTA que ya dice de qué quiere hablar no tiene que
  // pasar por el hero ni volver a elegir el tema: aterriza en el formulario.
  // Va un frame después del montaje, cuando la intro ya se armó, para
  // matarla limpia.
  useEffect(() => {
    const pedido = new URLSearchParams(window.location.search).get("tema");
    const key = TEMAS.find((t) => t.key === pedido)?.key;
    if (!key) return;
    const raf = requestAnimationFrame(() => {
      const c = contexto();
      c.estado.introTl?.kill();
      c.estado.desarmeTl?.kill();
      setTema(key);
      setVista("formulario");
      gsap.set(panelDe(c, "hero"), { autoAlpha: 0 });
      gsap.set(panelDe(c, "apertura"), { autoAlpha: 0 });
      gsap.set(panelDe(c, "formulario"), { autoAlpha: 1 });
      gsap.set("[data-campo]", { autoAlpha: 1, y: 0 });
      finIntro(c);
    });
    return () => cancelAnimationFrame(raf);
    // Solo al montar: lee la URL una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mientras la intro corre, cualquier intento de scroll la saltea.
  useSaltoIntro(reduced, introListo, estado, () => saltarIntro(contexto()));

  return (
    <section
      ref={rootRef}
      className="bg-grain-light relative isolate h-[100svh] overflow-hidden bg-gradient-to-b from-white via-white to-gris-fondo/50"
      aria-label="Contacto"
    >
      {/* Fondo de nodos vivo durante toda la experiencia */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <MathField className="h-full w-full" />
      </div>

      {/* ── Escenario: los cuatro estados apilados ────────────────────────── */}
      <div className="relative z-10 mx-auto h-full w-full max-w-screen-xl px-5 md:px-10">
        {/* 0 · HERO */}
        <PanelHero activo={vista === "hero"} />

        {/* 1 · APERTURA */}
        {/* my-auto (y no justify-center en el padre): con 5 tarjetas apiladas
            el contenido no entra en mobile, y justify-center lo recorta de los
            DOS lados — el titular se iba arriba del navbar y las tarjetas se
            metían abajo de la barra. Así se centra si entra, y si no entra
            arranca del tope y se scrollea. Mismo patrón que el formulario.
            overflow-x-hidden porque overflow-y solo ya hace que overflow-x
            compute a `auto`: en reposo no desborda nada, pero el back.out con
            que entran las tarjetas pasa apenas de scale 1 y eso alcanza para
            que parpadee un scrollbar horizontal en pleno desarme.
            PANTALLAS BAJAS (laptop a 125%, 1366×768): con 112px de padding
            abajo los cinco temas no entraban y el panel scrolleaba por dentro
            —doble barra, y un índice que hay que descubrir scrolleando—. En
            alto ≤ 860px el padding de abajo baja a 32px y las filas se
            compactan (IndiceTemas), así entra todo en la pantalla. */}
        <div
          data-panel="apertura"
          aria-hidden={vista !== "apertura"}
          inert={vista !== "apertura"}
          className="absolute inset-x-5 top-0 bottom-0 flex overflow-x-hidden overflow-y-auto pt-24 pb-8 opacity-0 md:inset-x-10 md:pt-28 md:pb-28 [@media(max-height:860px)_and_(min-height:761px)]:md:pt-24 [@media(max-height:860px)_and_(min-height:761px)]:md:pb-8 [@media(max-height:760px)]:md:pt-[5.5rem] [@media(max-height:760px)]:md:pb-6"
        >
          {/* Composición editorial asimétrica (idioma de la home): columna de
              identidad a la izquierda (titular + equipo real) y el ÍNDICE de
              temas a la derecha — renglones numerados, no un grid de fichas. */}
          <div className="my-auto w-full lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-x-16 xl:gap-x-24">
            <ColumnaIdentidad />
            <IndiceTemas onElegir={(key, el) => elegirTema(contexto(), key, el)} />
          </div>
        </div>

        {/* 2 · FORMULARIO */}
        <PanelFormulario
          activo={vista === "formulario"}
          temaActivo={temaActivo}
          temaIdx={temaIdx}
          onCambiar={() => cambiarTema(contexto())}
          onEnviar={(e: FormEvent<HTMLFormElement>) => enviar(contexto(), e)}
        />

        {/* 3 · CIERRE */}
        <PanelCierre
          activo={vista === "cierre"}
          titulo={temaActivo?.titulo ?? "Consulta"}
          mensaje={mensajeListo}
          onOtra={() => otraConsulta(contexto())}
        />
      </div>

    </section>
  );
}
