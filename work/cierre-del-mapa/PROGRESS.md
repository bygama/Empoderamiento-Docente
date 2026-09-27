# PROGRESS — El cierre del mapa del admin

## In progress

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
- **Paso 5 — `admin/actividad/frase/`** (`1aa9c74f`): `index.ts` (43) y
  `comun.ts` (13: `EventoParaLeer`, `Frase`, `contraer`) más 13 módulos (el
  mayor, `cuentas.ts`, 18). Las 57 frases con siete valores de `sobre` cada
  una salen byte a byte iguales que en `main`. `frase.test.ts` y
  `actividad-reciente.test.ts` → 7 pass; `tsc` y `eslint` 0.
- **Paso 6 — `admin/cuentas/actividad/modulos/`** (`60f04a1a`): `index.ts`
  (64) y `comun.ts` (30: `MODULOS_DE_ACTIVIDAD`, `Lectura`, `Existentes`)
  más 13 módulos. `moduloDe` y `pantallaDe` iguales a `main` en los 57 tipos
  × 6 combinaciones de `sobreId` y de lo que existe; `esModuloDeActividad`
  igual (incluido `toString`). `modulos.test.ts` y `filtros.test.ts` → 3
  pass; `tsc` y `eslint` 0.
- **Paso 7 — `datos/inicio/pendientes/`** (`5dd256f0`, y `db3e257c` para dos
  comentarios que nombraban el archivo viejo): `index.ts` (31) y
  `pendiente.ts` (41: `URGENCIAS` y los tipos) más 7 módulos (el mayor,
  `mensajes.ts`, 18). Las 9 filas, en el mismo orden y con los mismos
  campos que en `main`. `pendientes.test.ts` y los cinco `de-*.test.ts` → 17
  pass; `tsc` y `eslint` 0.

## Abierto
