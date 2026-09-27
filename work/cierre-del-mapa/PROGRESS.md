# PROGRESS — El cierre del mapa del admin

## In progress

- 2026-09-27 — **Cierre.** La revisión r1 dio PASS sobre `f7455e45`, sin
  Critical ni Important, con cuatro Minor; la ronda de cierre los arregló
  (`2d263353`, `f392f3ff`, `fe38f39d`) y la lane se cierra en este PR: el
  commit que sigue a este borra `work/cierre-del-mapa/`. Después: borrar los
  recursos de la verificación, rebasear sobre `origin/main` y correr el gate
  entero; su salida va al `worker_done` y al PR.
- 2026-09-27 — **Pausa para la revisión de cierre.** Los 11 pasos del PLAN
  están hechos y verificados (`## Verification`), sin bloqueos ni comandos
  en rojo; la rama, sobre `main` en `910dabf5`, y el PR abierto. **Lo que
  sigue:** la revisión de cierre, que lanza el padre después de
  `worker_done`; sus hallazgos vuelven a esta lane como arreglos. Con su
  PASS, el cierre en este mismo PR: el veredicto en `## Verification`, lo
  de «Abierto» que es de la lane (la copia, los worktrees de paso, el
  perfil del navegador) borrado, y el commit que borra `work/cierre-del-mapa/`.
- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado (base `ed`, esta lane no migra). Dev server en el 3032, en su
  propia pestaña de Orca. Cuentas de prueba `cierre-administra@ed.test` y
  `cierre-edita@ed.test`.
- 2026-09-27 — SPEC.md escrito desde el brief del padre, con 7 propuestas
  (§10). **Aprobado por el padre tal cual** (DECISIONS). PLAN.md escrito: 11
  pasos.
- 2026-09-27 — Para comparar: un worktree de `main` en
  `%TEMP%/ed-cierre-antes` (`910dabf5`, desacoplado), con `pnpm install`,
  `pnpm generate` y `pnpm build` en verde. Se borra al cerrar.

## Hecho

- **Paso 1 — `linkDelDoi` por segmento** (`132e9a89`): `lib/metadatos/doi.ts`
  codifica cada segmento con `encodeURIComponent` y conserva las `/`; test
  nuevo en `doi.test.ts` (`#`, `?`, `%`, espacio, y un DOI con varias
  barras). RED antes del cambio (exit 1), GREEN después: `tsx --test
  doi.test.ts metadatos.test.ts` → 8 pass, 0 fail; `buscar-datos.test.ts` y
  `cita.test.ts` → 7 pass. Los 40 DOI de `ed` salen iguales codificados (0
  cambian), así que el render no cambia.
- **Paso 2 — las dos portadas** (`8dc0d103`): `grep` de `44-resignificacion`
  y `57-juguemos` en `apps/sitio/src`, `scripts`, `docs`, `packages` y los
  `.md` de la raíz → exit 1 (nada); `pg_dump --data-only` de `ed` entero → 0
  menciones (y 55 de `biblioteca/portadas/`, así que la búsqueda anda);
  `CARPETAS_DE_FOTOS` es una regex de validación, no un listado. Borradas.
- **Paso 3 — `por-hacer/` y `[modulo]`** (`c06ea0cf`): borrados
  `admin/por-hacer/` (2 archivos), `(protegido)/[modulo]/page.tsx`, el test
  «los módulos que todavía son una guía…» de `guarda.test.ts` y `moduloDe` de
  `barra-lateral/modulos.ts`, que nació con esa ruta (`cde864cf`) y nadie más
  usaba. `grep por-hacer|guiaDe|GuiaDelModulo` → nada; `pnpm typecheck` 0;
  `guarda.test.ts` 6 pass. Con sesión: `/admin/nope` y `/admin/nope/mas` →
  404 «Página no encontrada | Empoderamiento Docente» (antes, el primero daba
  404 «Admin ED»); `/admin` y `/admin/ajustes` 200; sin sesión `/admin/nope`
  → 307 a entrar, como antes.
- **Paso 4 — `datos/actividad/`** (`784641a3`): `index.ts` (99 líneas)
  compone 13 módulos (acceso 9, mi-cuenta 10, paginas 9, mensajes 12,
  cuentas 17, novedades 11, ajustes 12, biblioteca 12, casos 8, aliados 12,
  fotos 10, metricas 10, equipo 12) y `regla.ts` (32: el tipo `Regla` y los
  dos ayudantes que recuperan las claves). Paridad contra `main` con un
  script de paso que importa los dos registros: 57/57 tipos, `QUIEN_VE` y
  `VA_AL_INICIO` iguales, el orden igual salvo los dos del segundo factor
  (P4). `tsx --test` de `actividad.test.ts`, `frase.test.ts`,
  `consultas/actividad.test.ts`, `actividad-reciente.test.ts`,
  `modulos.test.ts` y `marcas.test.ts` → 18 pass, 0 fail; `tsc` 0; `eslint`
  0; ningún test tocado. Los comentarios que nombraban `datos/actividad.ts`
  (el `.prisma` y `actividad-reciente.ts`) apuntan a la carpeta; `prisma
  validate` en verde y `migrate status` «up to date» (un comentario no es
  migración).
- **Paso 5 — `admin/actividad/frase/`** (`0d2d1500`): `index.ts` (43) y
  `comun.ts` (13: `EventoParaLeer`, `Frase`, `contraer`) más 13 módulos (el
  mayor, `cuentas.ts`, 18). Las 57 frases con siete valores de `sobre` cada
  una salen byte a byte iguales que en `main`. `frase.test.ts` y
  `actividad-reciente.test.ts` → 7 pass; `tsc` y `eslint` 0.
- **Paso 6 — `admin/cuentas/actividad/modulos/`** (`e4827d0d`): `index.ts`
  (64) y `comun.ts` (30: `MODULOS_DE_ACTIVIDAD`, `Lectura`, `Existentes`)
  más 13 módulos. `moduloDe` y `pantallaDe` iguales a `main` en los 57 tipos
  × 6 combinaciones de `sobreId` y de lo que existe; `esModuloDeActividad`
  igual (incluido `toString`). `modulos.test.ts` y `filtros.test.ts` → 3
  pass; `tsc` y `eslint` 0.
- **Paso 7 — `datos/inicio/pendientes/`** (`f47f514c`, y `e0611f8c` para dos
  comentarios que nombraban el archivo viejo): `index.ts` (31) y
  `pendiente.ts` (41: `URGENCIAS` y los tipos) más 7 módulos (el mayor,
  `mensajes.ts`, 18). Las 9 filas, en el mismo orden y con los mismos
  campos que en `main`. `pendientes.test.ts` y los cinco `de-*.test.ts` → 17
  pass; `tsc` y `eslint` 0.
- **Paso 8 — los tres puentes** (`abbfd69c`): `BotonEnlace` pasó al
  `Boton.tsx` del kit; `armazon/Boton.tsx` y `armazon/clases.ts` borrados, y
  el `export { Aviso }` de `Campos.tsx` también. 77 archivos reescritos por
  un script de paso (`%TEMP%/cierre/reescribir.mjs`, no se commitea) que
  junta los nombres en el import de `@ed/kit-admin` que ya hubiera o lo pone
  antes del primer import interno. `grep` de `armazon/Boton"`,
  `armazon/clases"` y `export { Aviso }` → nada; `pnpm typecheck` y `pnpm
  lint` 0; react-doctor **100/100 sin diagnósticos** en los cuatro
  proyectos.
- **Paso 9 — las piezas sin ED, al kit** (`cc733c4f` la mudanza, `46ea8a4e`
  los comentarios, `20ed2000` los hooks):
  - 30 archivos con `git mv` (19 renombres puros, los demás solo con sus
    imports), 136 archivos de la app reescritos con el mismo script.
    `CampoSimple` y `BotonDeAcceso` (P2) en sus 7 formularios, sin alias
    (`BotonDelAdmin` también se fue). Íconos del kit: `ChevronAbajo`,
    `Check`, y `FlechaIzquierda`, `FlechaAfuera`, `Ojo` y `OjoTachado`
    nuevos: un script compara sus trazos con los de la app y las props base
    (iguales y en el mismo orden).
  - `grep '"@/' packages/kit-admin/src` → nada; ningún módulo de ED en el
    código ni, después de `46ea8a4e`, en los comentarios.
  - **El build se frenó** la primera vez: `useFrenarSalida` y
    `useMoverEnOrden`, ahora en el índice del kit, entraban al grafo del
    servidor por cualquier import de `@ed/kit-admin`. Con `"use client"`
    (`20ed2000`) el build pasa.
  - `pnpm typecheck`, `pnpm lint` y `pnpm --filter @ed/kit-admin test` (11
    pass) en 0; react-doctor **100/100 sin diagnósticos**
    (`packages/kit-admin/src: 52 archivos`).
  - **El sitio:** `node scripts/comparar-render.mjs` contra el build de
    `main` → **12 páginas, render idéntico**. El CSS de los dos builds es el
    mismo archivo (mismo hash, 194 299 y 18 653 bytes); un chunk de JS
    compartido baja 598 bytes (nombres del minificador y reparto de chunks).
  - **El admin, por HTML** (`next start` de `main` en el 3033 y de la rama en
    el 3034, contra la misma base; `%TEMP%/cierre/comparar-admin.mjs` recorre
    todo link a `/admin/…` y cada redirección, y compara sin `<script>`,
    nonce ni URL de `/_next/`):

    | Rol (base) | Tema | Pantallas | Iguales | CSS |
    | --- | --- | --- | --- | --- |
    | administra (`ed`) | por defecto (mixto) | 695 | 695 | igual |
    | administra (`ed`) | claro | 695 | 695 | igual |
    | administra (`ed`) | oscuro | 695 | 695 | igual |
    | edita (`ed`) | por defecto | 327 | 327 | igual |
    | dirige (`ed_cierre`, P6) | por defecto | 695 | 695 | igual |

    Entre 0 y 8 pantallas por corrida dieron igual recién al volver a
    pedirlas: la metadata de Next se transmite aparte y el `<title>` cae en
    el `<head>` o después según quién resuelve primero, en cualquiera de los
    dos servidores. Controles: `/admin/nope` sale distinto (P5) y el mismo
    `/admin` en claro y oscuro también; `/admin` normalizado tiene 32 919
    caracteres y 321 etiquetas.
  - **El admin, a ojo** (navegador de Orca, perfil aislado `cierre-del-mapa`,
    sesión de quien dirige en `ed_cierre`): Inicio, Contenido, Novedades,
    Biblioteca, Mensajes, Métricas, Cuentas, Ajustes, la ficha de un
    material y la lista del Equipo, en los tres temas a 1440, y cinco
    pantallas a 390. Cada captura de `main` y de la rama se compara por
    SHA-1: **las 35 combinaciones tienen una captura byte a byte igual**. Las
    que variaban lo hacían también repitiendo el mismo servidor (658 píxeles
    de texto en Métricas, entre dos capturas seguidas de `main`).
  - **Lo de cliente, andando** en la rama: las pestañas marcan la activa
    («Contenido: Equipo»); «Bajar» y «Subir» en el Equipo mueven, anuncian
    («Karla Gómez pasó al lugar 2 de Dirección.») y devuelven el foco (el
    orden quedó como estaba); «Borrar el material» abre la confirmación en el
    lugar con el foco en «Cancelar» y su `aria-describedby`, y «Cancelar» la
    cierra; «Mostrar contraseña» pasa el campo a texto con `aria-pressed`;
    con un cambio sin guardar, un `beforeunload` sintético queda frenado, y
    al volver al valor original ya no. (En la copia, «Suspender» sobre
    `cierre-edita` suspendió sin confirmar, como en `main`: esa acción no
    pide confirmación; `ed` no se tocó.)
- **Paso 10 — los documentos de la mudanza** (`8186a892`): el README del
  kit con las piezas de una pantalla, qué sabe de Next y el cuarto tamaño de
  tipo que espera (`text-admin-titulo`); cada token del README aparece en
  `packages/kit-admin/src` y no hay en el kit ninguno fuera de la lista. El
  ADR-0014 anota la mudanza hecha. DESIGN.md §11: las 16 rutas de las piezas
  mudadas apuntan a `packages/kit-admin/src/` (existen todas) y la línea de
  dónde viven dice qué quedó en `admin/armazon/`; `grep admin/armazon/
  DESIGN.md` nombra solo la sidebar, «Sin permiso», la guarda, la pantalla de
  acceso, «Qué cambió» y «Cómo se ve».
- **Paso 11 — los documentos del cierre** (`c9fddbe3`, y `c0864f9e` para
  cuatro comentarios de código que decían «del armazón» de piezas que ya son
  del kit): AGENTS.md §3 (el kit, lo que queda en el armazón, los registros
  como carpetas, sin `por-hacer/`), §12 (las rutas de los registros) y §13
  (la fase 3 hecha, con una línea por módulo, y la 4 sin el `sitemap.xml` ni
  las redirecciones, que ya hizo Ajustes); el spec del admin en §3 (el kit),
  §7 (la actividad), §9 (la fase 3) y §11 (lo que sigue afuera, con el §10 del
  SPEC padre); AI_GUIDELINES §2 con ejemplos que existen; el README con el
  estado del admin. `grep` de `por-hacer`, `datos/actividad.ts`,
  `actividad/frase.ts` y `lineas-accion/data.ts` en esos cuatro → nada (la
  única mención de `quienes-somos/data/equipo`, en el spec §6, dice que se
  borró); ninguna ruta de una pieza mudada queda nombrada en un `.md` ni en
  el código.
- **Encabezados de commit:** cuatro pasaban los 72 caracteres de
  `docs/COMMITS.md`; se reescribieron antes del primer push con un filtro
  de mensajes (el árbol, idéntico), y los hashes de acá, al día.

## Verification

### 2026-09-27 — Close review r1 — PASS (Opus 5.5, medium, «el cambio entero contra su SPEC»)

Lo que el padre trasladó del revisor, sobre `f7455e45`: «PASS en r1, sin
Critical ni Important». Midió el gate, cinco corridas de `pnpm test`, los
cuatro registros exportados de `main` y de la rama (idénticos salvo el orden
aprobado en P4), el HTML del admin con los tres roles y los tres temas (igual
salvo la 404 de P5), lo que corre del lado del cliente en el navegador,
`comparar-render` de las 12 páginas, los 40 DOI de la base con el mismo
link, lo borrado sin referencias, la frontera del kit con 0 imports de `@/`
y las rutas que citan los documentos. Cuatro Minor, arreglados:

1. El spec §11 decía que Métricas «no depende del kit», y usa sus piezas →
   dice lo que hay (`f392f3ff`).
2. Comentarios del kit con ejemplos de Mensajes (`Volver`, `Encabezado`,
   `Buscador`, `Confirmacion`) → ejemplos neutros, y de paso los de
   `Numero`, `Pestanas` y `ruta.ts` (`2d263353`).
3. `useErroresDelEditor` faltaba en la lista de lo que queda en el armazón →
   sumado en AGENTS.md, DESIGN.md §11, el README del kit, el ADR-0014 y el
   spec §3 (`f392f3ff`).
4. Los índices con spreads perdieron el error por clave repetida → un test
   (`admin/actividad/registros.test.ts`, `fe38f39d`) recorre los cuatro
   registros y exige que la suma de las claves de sus módulos dé la cuenta
   del índice. Probado a mano: con `entro` repetido en `mi-cuenta.ts` de
   actividad, de frase y de módulos, y una fila de aliados repetida en
   `pendientes/fotos.ts`, `tsc` da 0 y el test, 1 en los cuatro («claves en
   dos módulos»); sin el cambio, pasa.

### 2026-09-27 — L DoD — PASS (la revisión de cierre, pendiente: la lanza el padre)

Todo sobre `834af0d5`, en un worktree limpio de ese commit
(`%TEMP%/ed-cierre-limpio`: sin `.next` ni `next-env.d.ts`, `pnpm install
--frozen-lockfile` y `pnpm generate`).

- L1 static: `pnpm typecheck` → exit 0 (los cuatro proyectos); `pnpm lint`
  → exit 0; `node scripts/verificar-react-doctor.mjs` → exit 0,
  «react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 1196 archivos ·
  packages/db/src: 3 · packages/auth/src: 27 · packages/kit-admin/src: 52)».
- L2 behavioral: `pnpm test` **cinco veces seguidas → exit 0 las cinco**
  (20, 21, 21, 21 y 20 s; 627 tests, 625 pass, 0 fail, 2 skipped, los mismos
  627 y los mismos 2 saltados que `main`: «ya hay quien dirige en esta base»
  y «sin respuestas grabadas: falta correr A1»). `pnpm build` → exit 0
  (68 páginas). Arranca: `next start` del build en el 3034 → `/admin/entrar`
  200.
- L3 end-to-end:
  - `node scripts/comparar-render.mjs <main> <limpio>` → exit 0, «12
    páginas, render idéntico»; el CSS, los mismos dos archivos por hash.
  - El admin por HTML, build de `main` (3033) contra el de `834af0d5`
    (3034), los dos sobre `ed_cierre`, con la sesión de quien dirige: 695
    pantallas, 695 iguales, CSS igual, 0 sin visitar. Las de administra
    (695 × tres temas) y edita (327) sobre `ed`, en el paso 9, con el mismo
    código: desde entonces solo cambiaron comentarios y documentos.
  - A ojo y lo de cliente: paso 9 (35 combinaciones de pantalla, tema y
    ancho con una captura byte a byte igual; pestañas, mover, confirmar, ver
    la contraseña y frenar la salida, andando).
- Después de las cinco corridas, las 24 tablas de contenido y de uso de `ed`
  tienen la misma huella que la copia `ed_cierre` (de antes de correr la
  suite): las corridas seguidas no tocan filas reales.
- Close review: la lanza el padre al recibir `worker_done` (1 revisor Opus
  5.5, effort medium, lente «el cambio entero contra su SPEC»). **Todavía no
  corrió**: la lane no se cierra sin su veredicto.

## Tried and failed

- 2026-09-27 — **`pnpm test`, primeras cinco corridas sobre el árbol
  limpio: 3 con exit 1.** Fallaron `bloqueos-de-acceso.test.ts` («diez
  fallos al mismo tiempo cuentan diez», en las corridas 1, 3 y 4) y
  `mover-equipo.test.ts` («un perfil que ya no existe…», en la 1), las dos
  con `PrismaClientKnownRequestError: Transaction API error: Unable to start
  a transaction in the given time`; eran las corridas lentas (49, 57 y 97 s
  contra 23 y 24 s). Código que esta lane no tocó. Lo que se probó:
  - `main` en su worktree, tres corridas en ese momento: 3 exit 0.
  - `main` en un worktree recién instalado, cinco corridas: 5 exit 0 (así
    que la instalación fresca sola no lo explica).
  - La rama, cinco corridas más: 5 exit 0 (21–22 s).
  - `main` y la rama **a la vez**, cuatro rondas: las dos fallan las cuatro,
    con decenas de tests de base cada una. La suite no aguanta correr en
    paralelo con otra contra la misma base: la clase de falla de las
    corridas 1, 3 y 4. Qué otra carga hubo en ese momento no se pudo saber.
  - **Esas rondas en paralelo escribieron sobre filas reales de `ed`**: los
    chequeos de links de 11 materiales, los destacados 1 y 2 de la
    Biblioteca, la novedad destacada, el orden de los 5 aliados (de 1–5 a
    6–10) y 2 filas de prueba en `bloqueos_de_acceso`. Se vio porque el build
    de la rama perdía dos destacados en Inicio y Biblioteca. Se restauró todo
    desde `ed_cierre` (copia de antes de correr la suite), en una
    transacción, columna por columna, y la huella de las 24 tablas volvió a
    coincidir (DECISIONS).

## Abierto

- **Recursos de la verificación, para borrar al cerrar** (no antes: una
  ronda de arreglos los vuelve a usar): la base `ed_cierre` (P6), los
  worktrees `%TEMP%/ed-cierre-antes` (el build de `main`) y
  `%TEMP%/ed-cierre-limpio` (el de `834af0d5`), el perfil del navegador
  `cierre-del-mapa` y los scripts de `%TEMP%/cierre/`. El dev server del
  3032 sigue en su pestaña. Los `next start` del 3033 y el 3034 ya se
  cerraron.
- Las cuentas de prueba `cierre-administra@ed.test` y
  `cierre-edita@ed.test` quedan en `ed`: tienen actividad y la clave
  foránea no deja borrarlas (como las de las lanes anteriores).
- **Para el padre, fuera de esta lane:**
  - La suite de tests no está aislada de las filas reales cuando dos corren a
    la vez contra la misma base (destacados, orden de los aliados, chequeos
    de links): «Tried and failed». Una hija que corre su gate mientras otra
    (o el gate del padre) corre el suyo sobre `ed` puede ensuciarla.
  - `README.md` todavía dice «Cuando llegue la fase 1 del admin, el build
    pasa a correr las migraciones» (sección del deploy): es del deploy
    (lane 0), no de este cierre.
  - AGENTS.md §6 cuenta los `.tsx` de `apps/sitio/src` sobre el tope,
    medidos el 2026-09-26. Esta lane sacó 27 de ahí (24 mudados al kit y 3
    borrados, ninguno sobre 200): la próxima medición cambia el total. No se
    tocó, porque la cuenta tiene fecha.
  - Una 404 propia del admin, con su armazón (P5): idea para después.

### Las líneas de lo nuevo y lo mudado

Todo por debajo de su tope (utilidades ≤ 100, componentes ≤ 200), contado
con `wc -l` sobre `834af0d5`:

| Carpeta | Archivos | El más largo |
| --- | --- | --- |
| `datos/actividad/` | 15 | `index.ts` 99, `regla.ts` 32, el mayor módulo `cuentas.ts` 17 |
| `admin/actividad/frase/` | 15 | `index.ts` 43, `cuentas.ts` 18, `mensajes.ts` 16, `comun.ts` 13 |
| `admin/cuentas/actividad/modulos/` | 15 | `index.ts` 64, `comun.ts` 30, `cuentas.ts` 23 |
| `datos/inicio/pendientes/` | 9 | `pendiente.ts` 41, `index.ts` 31, `mensajes.ts` 17 |
| `packages/kit-admin/src/` (lo mudado) | 32 | componentes: `Encabezado.tsx` 108, `Curva.tsx` 104, `Lista.tsx` 87; utilidades: `curva/calculos.ts` 54, `useFrenarSalida.ts` 54, `useMoverEnOrden.ts` 50 |
| `packages/kit-admin/src/` (lo tocado) | 3 | `iconos.tsx` 120, `index.ts` 48, `Boton.tsx` 25 |
