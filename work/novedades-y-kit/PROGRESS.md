# PROGRESS — Novedades y el kit del admin

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_novedades` con las 13 migraciones de `main` aplicadas
  (`pnpm migrate:deploy` → «All migrations have been successfully applied»;
  `pnpm migrate:status` → «Database schema is up to date!»), `.env.local`
  copiado y apuntado a ella. SPEC.md escrito desde el brief del padre (lane 6
  de `work/mapa-del-admin/`), con seis propuestas (§14).
- Lo que dejan las lanes vecinas, sin mergear todavía (leído en sus ramas):
  la 3b (`cuentas`) trae `Volver.tsx`, `Buscador.tsx` y el paginado; la 3c
  (`inicio`) trae `admin/actividad/frase.ts` y los registros de pendientes y
  de accesos rápidos. El PLAN deja la UI del módulo para después de rebasear,
  así los consume en vez de duplicarlos.
- 2026-09-26 — **SPEC aprobado por el padre** con las seis propuestas y dos
  condiciones (DECISIONS). PLAN.md escrito: 18 pasos.
- 2026-09-26 — **Build de base** para `scripts/comparar-render.mjs`: `pnpm
  build` sobre `48ed711` (el código de `main`; la base sin filas de páginas),
  exit 0, guardado en `%TEMP%\ed-novedades-base\.next` (11 páginas
  prerenderizadas).

- **Paso 1 — el kit nace** (`a4e6482`). `packages/kit-admin` (`@ed/kit-admin`,
  peer `react`/`react-dom`/`next`, dev las herramientas de los otros
  packages: el lockfile solo suma el importer y variantes de peers, ningún
  paquete nuevo). Mudados con `git mv`: `TextoCorto`, `Parrafo`,
  `PieDelCampo`, `largo`, `cambio`, `clases` (+ `claseDeBoton`), `ListaFija`
  (`ResumenDeItem` propio), `CampoFoto` (`maximoBytes` por prop) y
  `RutaInterna` → `Seleccion` (`{ valor, etiqueta }`, `sinElegir`). Nuevos:
  `Boton`, `Aviso`, `iconos` (los cuatro trazos del set) y `foto.ts` (subpath
  `./foto`). `armazon/Boton.tsx`, `clases.ts` y `Campos.tsx` re-exportan con
  el comentario de DECISIONS (A). `Campo.tsx` y los demás imports, al kit;
  `lib/contenido/fotos.ts` y `descripcion.ts` toman los tipos del kit. El kit
  en `apps/sitio/package.json`, `@source` en `globals.css`, y en el script
  `react-doctor` y `PROYECTOS`. ESLint del kit con `settings.next.rootDir`
  apuntando a la app (sin eso, `no-html-link-for-pages` avisaba que no
  encontraba `pages/`). Aceptación: `pnpm typecheck` (4 proyectos), `pnpm
  lint`, `pnpm test` (auth 28/28; sitio 177 pass, 0 fail, 1 skipped: «las
  respuestas grabadas de la API se mapean enteras — sin respuestas grabadas:
  falta correr A1», el de métricas que espera el deploy), `node scripts/verificar-react-doctor.mjs` → «100/100, sin
  diagnósticos (… packages/kit-admin/src: 14 archivos)», `pnpm build` exit 0;
  `field-sizing` está en 1 CSS de `.next/static`; grep de `from "@/`,
  «novedad» y «Empoderamiento» en `packages/kit-admin/src`: sin resultados.
- **Paso 2 — Casilla, Fecha y ListaVariable** (`3ea7eac`). `Casilla` (la
  etiqueta entera marca, 40 px), `Fecha` (año escrito, mes y día elegidos con
  «Sin mes»/«Sin día»; el día se suelta si el mes nuevo no lo tiene) con sus
  partes puras en `partesDeFecha.ts` (no `fecha.ts`: choca con `Fecha.tsx` en
  un disco sin mayúsculas), y `ListaVariable` (subir/bajar con íconos de 40
  px, «Quitar», «Agregar …», el tope explicado en vez de deshabilitar, cada
  cambio anunciado sin género —«Agregaste sección 3»—, el foco al campo nuevo,
  a «Agregar» o al botón que queda del ítem movido; `claveDe` estable por
  ítem). Íconos `ChevronArriba`, `ChevronAbajo`, `Mas`. El kit suma su script
  `test` (`tsx`, ya en el lockfile). Aceptación: `pnpm --filter @ed/kit-admin
  test` 3/3, `pnpm typecheck` y `pnpm lint` exit 0,
  `verificar-react-doctor` 100/100 (kit: 19 archivos).
- **Paso 3 — el esquema de una novedad** (`20e2581`).
  `features/novedades/contenido/novedad.ts` (`esquemaNovedad`,
  `esquemaBorrador`, los tipos) y `modelo.ts`, sin Zod (`CATEGORIAS`,
  `etiquetaDeCategoria`, `TOPES`, `compararFechas`, `anclasDe`,
  `borradorVacio`): partidos para que Zod no viaje al navegador (DECISIONS).
  `@ed/db` suma el subpath `./slug`. Aceptación: `tsx --test
  src/features/novedades/contenido/novedad.test.ts` 5/5; typecheck y lint
  exit 0.
- **Paso 4 — la tabla y las nueve** (`ba8f651`). `prisma/schema/novedades.prisma`,
  `pnpm migrate --create-only --name novedades` → `20260927002934_novedades`,
  y en ese archivo, antes de aplicarlo, el índice parcial y el `INSERT` de las
  nueve, generado por un script de `.scratch/` (sin commitear) que valida cada
  fila con `esquemaNovedad`. Ese script frenó en dos imágenes fuera de
  `public/fotos/`: el validador suma `public/novedades/` y
  `public/quienes-somos/` (DECISIONS), con test. Los alt, del repo (cuatro) o
  escritos mirando la foto (cinco). Aceptación: `pnpm migrate` aplicó;
  `pnpm migrate:status` → «Database schema is up to date!»; la consulta del
  PLAN da `9|1|1`; y marcar una segunda destacada en una transacción da
  `duplicate key value violates unique constraint
  "novedades_una_sola_destacada"`.

## Abierto

- **`publicacion` es texto hasta la lane 8** (DECISIONS, B): la lane 8
  (`biblioteca-y-equipo`) la pasa a una relación con materiales.
