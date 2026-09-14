"use client";

import { RevealLines } from "@/components/ui/RevealLines";
import { CASOS } from "./data";
import { CarpetaCaso } from "./CarpetaCaso";
import { ExpedienteCaso } from "./ExpedienteCaso";
import { NavegacionCasos } from "./NavegacionCasos";
import { useLugarExpediente } from "./maquina/useLugarExpediente";
import { useAccionesLugar } from "./maquina/useAccionesLugar";
import { useHistorialLugar } from "./maquina/useHistorialLugar";
import { useEntradaIndice } from "./maquina/useEntradaIndice";
import { useEscenaIndice } from "./maquina/useEscenaIndice";
import { useTransicionesExpediente } from "./maquina/useTransicionesExpediente";

/**
 * Sección «Investigación en acción» — archivo de expedientes.
 * Máquina de estados: index → opening → open → (switching|closing).
 * Las timelines viven en coreografia.ts. El expediente abierto es EL
 * LUGAR: una capa fija a viewport completo con scroll propio; la página
 * queda congelada debajo (Lenis detenido + overflow del documento oculto)
 * y el botón «atrás» del navegador cierra el expediente (pushState al
 * abrir, popstate → cierre). Durante apertura/cierre el telón del lugar es
 * transparente: la carpeta del índice (en la página) hace morph hacia la
 * hoja del expediente (en la capa) sin cortes visibles — ambos fondos son
 * gris-fondo, así el intercambio de opacidad es invisible.
 * Con prefers-reduced-motion todos los cambios son instantáneos.
 *
 * La máquina vive en `maquina/` por hook, en el orden en que se llaman:
 * `useLugarExpediente` (estado, refs, scroll-lock, limpieza),
 * `useAccionesLugar` (abrir, cerrar, irA), `useHistorialLugar` (hash,
 * Escape, atrás), `useEntradaIndice` y `useTransicionesExpediente`
 * (opening / switching / closing). Acá queda el JSX y el cableado.
 */
export function CasosInvestigacion() {
  const m = useLugarExpediente();
  const { abrir, cerrar, solicitarCierre, irA } = useAccionesLugar(m);
  useHistorialLugar(m, { abrir, cerrar, solicitarCierre });
  const { estado, activo, anuncio, introRevelado } = m;
  const { sectionRef, introRef, itemsRef, botonesRef, lugarRef, shellRef, tituloRef } = m;

  const casoActivo = activo !== null ? CASOS[activo] : null;
  const indiceVisible = activo === null || estado === "opening" || estado === "closing";

  useEntradaIndice(m);
  // Antes de las transiciones: al remontar el índice, la pista del título
  // tiene que tener su alto cuando el cierre mide la banda de destino.
  useEscenaIndice(m, indiceVisible);
  useTransicionesExpediente(m, cerrar);

  // z-40 mientras el expediente está montado: la capa fija del lugar vive
  // DENTRO de esta sección (isolate). Al desmontarse el índice el documento
  // se acorta, ScrollTrigger se refresca y una sección pinneada más abajo
  // (el cierre con el faro) pasa a position:fixed; sin z-index propio
  // ganaría por orden del DOM y taparía el expediente. Queda por debajo del
  // navbar (z-50): el expediente sigue siendo una página del sitio.
  return (
    <section
      ref={sectionRef}
      id="en-accion"
      data-indice="Casos"
      aria-label="Investigación en acción"
      // overflow-clip y no hidden: hidden haría de la sección un contenedor
      // de scroll y el sticky de la pantalla del título no pegaría.
      className={`bg-gris-fondo relative isolate overflow-clip ${
        activo !== null ? "z-40" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-screen-xl px-5 py-20 md:px-10 md:py-28">
        <p aria-live="polite" className="sr-only">
          {anuncio}
        </p>

        <div className="relative">
          {/* El índice vive en el flujo de la página; el expediente abierto
              es una capa fija encima — no compiten por el espacio. */}
          {indiceVisible && (
            <div className="relative">
              {/* La pista de la escena. En desktop con puntero
                  (maquina/useEscenaIndice.ts) mide más de una pantalla y
                  adentro la escena queda pegada (sticky) con el título
                  arriba y la pila abajo: el título llega grande al centro,
                  se achica hasta su esquina y recién entonces aparece la
                  pila. En touch y reduced-motion son divs comunes. */}
              <div data-casos-pista>
                <div data-casos-escena>
                  <div ref={introRef} data-casos-intro>
                    <div data-casos-titulo className="w-fit">
                      {/* Invitación, no lectura: el título solo, y las
                          carpetas hablan por sí mismas. Sin rótulo de
                          archivo ni regla: el andamiaje de expediente ya lo
                          pone cada carpeta. El reveal se dispara cuando el
                          título grande asoma por abajo (su caja de layout
                          va unos 300 px más arriba que donde se ve). */}
                      <RevealLines
                        as="h2"
                        enabled={!introRevelado}
                        start="top 66%"
                        className="font-display text-azul-principal max-w-3xl text-h2 font-extrabold tracking-[-0.02em]"
                      >
                        Casos de investigación
                      </RevealLines>
                    </div>
                  </div>

                  {/* La pila: en la escena arranca invisible y aparece
                      cuando el título ya está en su esquina. */}
                  <div data-casos-pila className="relative">
                    <ol
                      className={`mt-20 flex flex-col gap-5 md:block ${
                        estado === "index" ? "" : "pointer-events-none"
                      }`}
                    >
                      {CASOS.map((caso, i) => (
                        <CarpetaCaso
                          key={caso.id}
                          caso={caso}
                          indice={i}
                          esUltima={i === CASOS.length - 1}
                          interactiva={estado === "index"}
                          onAbrir={abrir}
                          refItem={(el) => {
                            itemsRef.current[i] = el;
                          }}
                          refBoton={(el) => {
                            botonesRef.current[i] = el;
                          }}
                        />
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {casoActivo !== null && (
            <ExpedienteCaso
              key={casoActivo.id}
              caso={casoActivo}
              casos={CASOS}
              indice={activo ?? 0}
              interactiva={estado === "open"}
              telonOpaco={estado === "open" || estado === "switching"}
              onIr={irA}
              onVolver={solicitarCierre}
              refLugar={lugarRef}
              refShell={shellRef}
              refTitulo={tituloRef}
            />
          )}
        </div>
      </div>

      <NavegacionCasos
        visible={activo !== null && (estado === "open" || estado === "switching")}
        casos={CASOS}
        indiceActivo={activo ?? 0}
        interactiva={estado === "open"}
        onVolver={solicitarCierre}
        onIr={irA}
      />
    </section>
  );
}
