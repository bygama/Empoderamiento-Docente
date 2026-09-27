# DECISIONS — El cierre del mapa del admin

- 2026-09-27 — **Lo que se muda al kit sale de una regla, no de la lista de
  candidatos** (brief): toda pieza de `admin/armazon/` que no importa `@/`,
  ni conoce `datos/`, roles, módulos o textos de ED. La tabla, pieza por
  pieza, en SPEC §3.2.
- 2026-09-27 — **SPEC aprobado por el padre tal cual, con las siete
  propuestas.** En sus palabras, lo que agrega a cada una:
  - **P1** — el kit lleva sus propios íconos, copiados con los mismos trazos:
    «que no cambie ningún píxel», y la comparación de HTML del admin lo
    muestra.
  - **P2** — `CampoSimple` y `BotonDeAcceso`: todos los imports se
    actualizan y no queda ningún alias viejo.
  - **P3** — DESIGN.md §11, solo las rutas.
  - **P4** — un archivo por módulo del filtro de Cuentas › Actividad, con
    Contenido partido por entidad; el índice en `<carpeta>/index.ts`, ningún
    import cambia, y cada archivo y cada índice por debajo de 100 líneas,
    contados. El orden de `TIPOS_DE_ACTIVIDAD` se conserva entero salvo lo que
    el SPEC §4.2 dice y el padre aprobó: los dos tipos del segundo factor
    pasan de entre Mensajes y Cuentas a Mi cuenta (lo lee un `IN` de SQL y
    ningún test lo fija).
  - **P5** — con sesión, `/admin/<algo>` de un segmento pasa a dar la misma
    404 que hoy ya da `/admin/<a>/<b>` (la del sitio): el mismo código, y
    coherente. **Una 404 propia del admin, con su armazón, queda como idea
    para después**: no es de esta lane.
  - **P6** — la cuenta de Mateo no se toca; la copia `ed_cierre` se borra al
    cerrar y solo apuntan a ella los servidores de esta lane.
  - **P7** — lo que depende de `lib/contenido/` se queda en la app, que es
    donde incuba (AGENTS.md §12).
  - **La comparación de HTML del admin**, pantalla por pantalla y rol por
    rol, entre el build de `main` y el de la rama contra la misma base, es la
    prueba principal de que la mudanza no cambió nada; su resumen va a
    PROGRESS.

- 2026-09-27 — **`moduloDe` de `barra-lateral/modulos.ts` se va con la ruta
  `[modulo]`** (paso 3): nació en el mismo commit que la guarda de esa ruta
  (`cde864cf`) y nadie más lo usaba. Dejarlo era un export muerto.
- 2026-09-27 — **Los registros de actividad reparten sus ayudas** (paso 4):
  `porTipo` y `tiposDe` viven en `datos/actividad/regla.ts`, al lado del
  tipo `Regla`, para que el índice quede por debajo de 100 líneas sin sacar
  de él la composición ni `registrarActividad` (sacarlos a otro archivo que
  el índice re-exporte arma un ciclo de imports, y el esquema de Zod leería
  `TIPOS_DE_ACTIVIDAD` antes de que exista).
- 2026-09-27 — **El kit exporta lo que la app usa** (paso 9): de cada pieza
  mudada sale por el índice lo que algún archivo de la app importa (los
  componentes y los tipos `Tono`, `Pestana`, `Cuenta`, `AvisoDelEditor`, y
  `diaLargo`, que usa la curva con marcas). `Volver`, `DestinoDeVolver`,
  `estaEn`, `pestanaActiva` y los tipos de la tabla quedan internos: los usa
  el kit y nadie de afuera.
- 2026-09-27 — **`Boton as BotonDelAdmin` se va** (paso 9): el alias existía
  en `FormularioCodigo.tsx` porque el `Boton` de acceso le ganaba el nombre.
  Con `BotonDeAcceso` ya no choca, así que importa `Boton` a secas (P2: «no
  queda ningún alias viejo»).
- 2026-09-27 — **Los comentarios del kit no nombran módulos de ED** (paso 9,
  segundo commit): las piezas traían de ejemplo novedades, materiales,
  casos, Contacto, Search Console, `lib/metricas/periodos.ts` y
  `work/armazon-del-admin/`. El README del kit pone la prueba («si aparece
  "novedad" acá adentro, está mal puesto») y el `main` del kit la pasaba:
  los ejemplos pasan a ser genéricos, en un commit aparte para que el de la
  mudanza sea solo renombres e imports. Las referencias a DESIGN.md §11 se
  quedan, como en `campo-foto/ElegirYaSubida.tsx` de `main`; los datos de
  `ruta.test.ts` también (los tests no se tocan).

- 2026-09-27 — **`ed` se devolvió al estado de antes de la suite** (la
  verificación): las cuatro rondas de `main` y la rama en paralelo, que
  lancé para diagnosticar las corridas lentas, escribieron sobre filas reales
  (los chequeos de links de 11 materiales, los destacados 1 y 2, la novedad
  destacada, el orden de los aliados y 2 filas de prueba en
  `bloqueos_de_acceso`). Se restauraron desde `ed_cierre`, la copia de antes
  de correr la suite, solo en las columnas que cambiaron y con la condición
  de que siguieran como las dejó la prueba; la huella de las 24 tablas de
  contenido y de uso volvió a coincidir con la copia, y cinco corridas
  seguidas después no la movieron. Hallazgo para el padre, fuera de esta
  lane: la suite no está aislada de las filas reales cuando corren dos a la
  vez contra la misma base.
- 2026-09-27 — **El gate de verdad es el de las cinco corridas finales**:
  las primeras cinco tuvieron 3 fallas de tiempo de transacción en tests que
  la lane no tocó (PROGRESS, «Tried and failed»), y no se descartan como
  «ruido»: se comparó con `main` en las mismas condiciones y en paralelo
  hasta ubicar la clase de falla. Las cinco que cuentan corrieron seguidas,
  sin nada más contra la base, sobre `834af0d5`.

- 2026-09-27 — **Revisión r1: PASS, sin Critical ni Important, cuatro
  Minor para antes del merge** (el padre). Arreglados en la ronda de cierre.
  El Minor 2 se extendió a los otros tres comentarios del kit que ponían de
  ejemplo algo de ED (`Numero`, `Pestanas`, `ruta.ts`), por la misma regla;
  y el 3, al ADR-0014 y al spec §3, que repetían la misma lista. El test del
  Minor 4 va en `admin/actividad/` porque importa los cuatro registros, y
  `admin/` puede leer `datos/`, no al revés.

## Lo que se queda en `admin/armazon/`, y por qué

- **`BarraLateral` y `barra-lateral/`** — son los módulos de ED: su lista
  (`modulos.ts`), las consultas de `datos/` que dan los números de la sidebar,
  el logo y los roles de quien mira.
- **`Guarda` y `guarda.test.ts`** — lee la sesión de `datos/sesion` y las
  capacidades de `@ed/auth`, y el test recorre las rutas del admin de ED.
- **`SinPermiso`** — dice de quién es la sección con los roles de ED y sus
  textos («Tu rol es…», `QUE_PUEDE`).
- **`SalirDelAdmin`** — llama al cliente de sesión de la app
  (`admin/auth-cliente`) y a una acción de `datos/`.
- **`tema.ts`** — la cookie `tema-del-admin` y los tres temas de ED, cuyos
  valores define `globals.css` de la app.
- **`Pantalla`** — la marca de ED en el acceso: el logo, «Empoderamiento
  Docente», el haz del faro.
- **`Momento`** — importa `@/lib/contenido/tiempo`, que incuba en la app
  (P7).
- **`EncabezadoDeFicha`** — usa `Momento`.
- **`ComoSeVe`** — importa `@/lib/contenido/buscador` (P7).
- **`ListaDeDiferencias` y `QueCambioPlegado`** — importan el tipo
  `Diferencia` de `@/lib/contenido/comparar` (P7).
- **`useErroresDelEditor`** — conoce el generador de formularios de las
  páginas (`@/admin/campos/errores`), que es de la app (AGENTS.md §12).
