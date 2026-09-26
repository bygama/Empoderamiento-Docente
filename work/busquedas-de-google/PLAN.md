# PLAN — Búsquedas de Google

SPEC aprobado por el padre el 2026-09-26, con la opción A en §9.1 y una nota
en §9.9 (DECISIONS.md). Lo ejecuta work-run en este worktree; cada paso es un
commit.

## Constraints

- **Las cuatro fronteras:** `lib/tareas/` y `lib/busquedas/` no importan nada
  de la app (ni un `@/`) y no saben de ED; `datos/` es la única puerta a la
  base; `app/` son rutas; ningún componente importa Prisma.
- **Toda Server Action empieza por `auth.api.getSession`** (lo exige
  `acciones-con-sesion.test.ts`).
- **La migración:** generada por Prisma con `--create-only`; lo único que se
  le suma, antes de su primera aplicación, es el SQL comentado que mueve el
  historial (DECISIONS.md). Nunca `db push`; nunca se toca una migración
  aplicada.
- **Sin dependencias.** El JWT, con `node:crypto`; lo externo, por `fetch`.
- **DESIGN.md §11 manda en toda UI:** solo tokens, los cuatro tamaños de
  tipo, un primario por pantalla (Búsquedas no tiene), sin verde ni naranja.
  Tres temas, 390 de ancho y teclado.
- **Archivos que no se tocan:** `packages/auth/` salvo `PUEDE` en
  `permisos.ts`; `middleware.ts`, `proxy.ts`, `datos/auth.ts`,
  `prisma/schema/auth.prisma`, los `Formulario*.tsx` de acceso,
  `admin/paginas/`, `admin/campos/`, `contenido/`, `features/`,
  `lib/contenido/`, `datos/**/paginas*`, `prisma/schema/paginas.prisma`,
  `scripts/comparar-render.mjs`, `work/mapa-del-admin/` y el Inicio
  (`(protegido)/page.tsx`).
- Componentes ≤ 200 líneas, utilidades ≤ 100; copy en voseo e inclusivo.
- El navegador: el embebido de Orca contra `http://localhost:3015`, con el dev
  server en su propia pestaña.

## Pasos

1. **El corredor de tareas, en `lib/tareas/`.** `Tarea = { clave: string;
   nombre: string; correr: () => Promise<ResultadoDeTarea> }`,
   `ResultadoDeTarea = { ok: boolean; detalle: string }` y
   `correrTareas(tareas, { registrar, limiteMs })` →
   `Promise<Array<{ clave } & ResultadoDeTarea>>`: todas a la vez, cada una
   aislada (un `throw` o pasar `limiteMs` la dejan `ok: false` con el motivo),
   `registrar` llamado una vez por tarea y sin frenar a las otras si falla, y
   un error si dos tareas comparten clave. Un test por comportamiento.
   Acceptance: `pnpm --filter sitio test` y `pnpm typecheck` salen 0.
   *(judgment · high)*

2. **La copia de Vercel pasa al cron diario y a la tabla común.** Los modelos
   `CorridaDeTarea` (`tareas.prisma`) y `BusquedaDiaria`
   (`busquedas.prisma`) del SPEC §7, sin `SincronizacionMetricas`; la
   migración `busquedas_y_tareas` con `pnpm migrate --create-only --name
   busquedas_y_tareas`, el `INSERT … SELECT` comentado antes del `DROP`, y
   `pnpm migrate`. `datos/acciones/sincronizar-metricas.ts` y su test pasan a
   `datos/tareas/metricas-de-vercel.ts` sin registrarse solos (el detalle suma
   el rango); `datos/tareas/diarias.ts` define `CLAVES_DE_TAREAS`,
   `TAREAS_DIARIAS` y `correrTareasDiarias()` con el `registrar` a
   `corridas_de_tareas`; `datos/tareas/a-mano.ts` define
   `correrAMano(clave, { minimoDias })` con el freno de 10 minutos por tarea y
   `ultimaCorrida(clave)`; `/api/cron/diario` reemplaza a
   `/api/cron/metricas`; `vercel.json` con ese único cron;
   `actualizar-metricas.ts` y `consultas/metricas.ts` leen y escriben por ahí.
   Acceptance: sembradas dos filas en `metricas_sincronizaciones` antes de
   migrar, `docker exec ed-postgres psql -U postgres -d ed_busquedas -c
   'select tarea, ok, detalle from corridas_de_tareas'` las muestra con su
   rango y `metricas_sincronizaciones` ya no existe; `pnpm typecheck` y
   `pnpm --filter sitio test` salen 0. *(integration · high)*

3. **La capacidad `configurarConexiones`.** En `PUEDE` de
   `packages/auth/src/permisos.ts`, hoy solo `administra`, con su comentario.
   Acceptance: `pnpm typecheck` sale 0 y `git diff --stat main --
   packages/auth` muestra solo `permisos.ts`. *(mechanical · low)*

4. **El cliente de Search Console, en `lib/busquedas/`.** `tokenDeGoogle({
   correo, clave, alcance, fetchImpl, ahora })` firma el JWT RS256 con
   `node:crypto` y lo canjea en `oauth2.googleapis.com/token`;
   `crearClienteDeBusquedas({ correo, clave, propiedad, fetchImpl? })` →
   `ClienteDeBusquedas = { porDia(rango, dimension): Promise<FilaDeBusqueda[]> }`
   con `FilaDeBusqueda = { fecha, dimension, valor, clics, impresiones,
   sumaDePosiciones }` y `DimensionDeBusqueda = "total" | "consulta" |
   "pagina" | "pais"`; pagina con `startRow`, explica en llano 403, 429,
   `invalid_grant` y una clave ilegible; `entorno.ts` con
   `hayVariablesDeBusquedas()` y `clienteDeBusquedasDesdeEntorno()`. Tests con
   `__fixtures__` de la forma documentada y una clave RSA generada en el test.
   Acceptance: `pnpm --filter sitio test` y `pnpm typecheck` salen 0;
   `rg -n "from \"@/" apps/sitio/src/lib/busquedas` no devuelve nada.
   *(judgment · high)*

5. **Leer las búsquedas: posición, «Casi nos encuentran» y países.** En
   `lib/busquedas/`: `posicionPromedio(sumaDePosiciones, impresiones)`,
   `casiNosEncuentran(filas)` con los umbrales del SPEC §4.1 como constantes
   con nombre y el motivo en llano de cada fila, y `nombreDelPais(alfa3)` con
   la tabla alfa-3 → alfa-2 de CLDR compacta y comentada (versión y cómo
   regenerarla) sobre `Intl.DisplayNames`. Acceptance: `pnpm --filter sitio
   test` y `pnpm typecheck` salen 0; `paises.ts` ≤ 100 líneas.
   *(judgment · medium)*

6. **La copia diaria de Search Console.** `datos/tareas/busquedas-de-google.ts`
   con `sincronizarBusquedas({ cliente, base, hoy, minimoDias })`: del día
   siguiente al último `total` hasta ayer (90 días la primera vez y como
   máximo), upserts por clave, `total` al final; sin variables, `ok: false`
   con el motivo. Suma la tarea a `TAREAS_DIARIAS` y las tres variables a
   `apps/sitio/.env.example`. Test contra la base con un cliente falso:
   idempotente y sin avanzar la marca si una dimensión falla. Acceptance:
   `pnpm --filter sitio test` y `pnpm typecheck` salen 0; `curl.exe -s -H
   "Authorization: Bearer <CRON_SECRET local>"
   http://localhost:3015/api/cron/diario` devuelve las dos tareas y deja dos
   filas nuevas en `corridas_de_tareas`; sin el header, 401.
   *(integration · medium)*

7. **El módulo Métricas con pestañas.** `admin/metricas/pantallas.ts`
   (`METRICAS`, `PANTALLAS_DE_METRICAS`), `EncabezadoDeMetricas`; las rutas
   `metricas/page.tsx` (Resumen con `PanelMetricas`),
   `metricas/[pantalla]/page.tsx` (las guías de Origen, Qué hace la gente y
   Links para compartir, con `guias-de-metricas.ts` y `GuiaDeMetricas.tsx`) y
   `metricas/error.tsx`; la entrada `metricas` sale de `guias.ts`.
   `Pestanas` suma `exacta` (la lógica en `ruta.ts`, con test) y DESIGN.md
   §11 lo registra. Acceptance: `pnpm typecheck` y `pnpm --filter sitio test`
   salen 0; en el navegador, con sesión, `/admin/metricas` enciende solo
   Resumen, `/admin/metricas/origen` solo Origen, y el título dice «Métricas ·
   Admin ED» y «Origen · Admin ED». *(integration · medium)*

8. **Las consultas de Búsquedas.** `datos/consultas/busquedas.ts`:
   `estadoDeBusquedas()` → `{ conectado, hastaDia, ultima }` y
   `resumenDeBusquedas()` → el período de 28 días, los totales contra los 28
   anteriores (`Tarjeta` necesita `variacion`), las tres listas y «Casi nos
   encuentran», todo con `groupBy` y `posicionPromedio`. Test contra la base
   con filas sembradas: la posición sale ponderada por impresiones.
   Acceptance: `pnpm --filter sitio test` y `pnpm typecheck` salen 0.
   *(integration · medium)*

9. **La pantalla de Búsquedas.** `metricas/busquedas/page.tsx` (lee la sesión
   para `PUEDE.configurarConexiones`), `admin/busquedas/` con el panel, las
   listas y «Conectá Search Console»; `EstadoVacio` acepta pasos y
   `ActualizarAhora` recibe su acción por prop; la acción nueva
   `datos/acciones/actualizar-busquedas.ts` sobre `correrAMano`; `Tarjeta`
   con `variacion` opcional; DESIGN.md §11 registra el estado vacío con pasos.
   Acceptance: `pnpm typecheck` y `pnpm --filter sitio test` salen 0; en el
   navegador, los seis estados del SPEC §4.2 (sembrados en `ed_busquedas` y
   con las variables puestas y sacadas), con `administra` y con `edita`, en
   los tres temas, a 390 de ancho y con el foco por teclado.
   *(judgment · medium)*

10. **Los docs.** ADR-0011 (con la sección de la migración que el padre pidió)
    y su fila en `docs/architecture/adrs/README.md`; el README (las tres
    variables, los cuatro pasos de ED, «Las métricas» con el cron diario y sus
    tareas); la línea de AGENTS.md §12 precisada (DECISIONS.md). Acceptance:
    `rg -n "api/cron/metricas|metricas_sincronizaciones" README.md AGENTS.md
    apps/sitio/src apps/sitio/vercel.json` no devuelve nada, y cada link nuevo
    de los docs apunta a un archivo que existe. *(judgment · medium)*
