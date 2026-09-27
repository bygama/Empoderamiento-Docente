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
