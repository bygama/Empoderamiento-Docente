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
- **Paso 5 — lo que lee el sitio** (`17de2af`). `datos/consultas/novedades.ts`:
  `novedadesVisibles` (pura), `novedadesDelSitio` (con `cache` y
  `draftMode`), `novedadPorSlug`, `redireccionDe`. El guardado de `filaDe`
  pasa a `datos/consultas/leer-sin-romper.ts`, que usan las dos (su test de
  páginas sigue 4/4). `NovedadDelSitio` en `novedad.ts`. Aceptación: `tsx
  --test src/datos/consultas/novedades.test.ts` 4/4; typecheck y lint exit 0.
- **Paso 6 — el sitio muestra las de la base** (`b84a03e`). Hero (la fecha
  de la más nueva, o sin tablero si no hay), destacadas, filtros, tarjeta,
  ficha y guía, e Inicio (`ultimasNovedades`), por props; la ficha busca
  `redireccionDe` antes del 404 y `slugsConFicha` (sin `draftMode`: corre
  fuera de un pedido) alimenta `generateStaticParams`. `fechaCorta` pasa a
  `modelo.ts`. `NovedadDestacada` (217 líneas de código) se parte al tocarla:
  `destacada/LinkNota.tsx`, `TapaDestacada.tsx`, `SegundaDestacada.tsx`. La
  ficha deja su `eslint-disable` de `exhaustive-deps`: el efecto depende de
  `secciones`, que es la referencia del prop. Los íconos de las categorías
  del `data.ts` no los usaba ningún componente: se van con él (el SPEC §4.2
  decía que se quedaban). Aceptación: typecheck, lint, `pnpm --filter sitio
  test` (186 pass, 0 fail, 1 skipped, el de A1), `pnpm build` (prerenderiza
  `/novedades/unesco-montevideo` y `/novedades/relime-2025` desde la base) y
  `node scripts/comparar-render.mjs %TEMP%\ed-novedades-base apps/sitio`:
  sale 1 con **una sola página distinta, `novedades.html` («en texto,
  imagenes»)**; las otras diez, iguales. Comparando los `<h3>` de las dos,
  la única diferencia es el orden de «Problematizar la matemática escolar,
  en Bolema» y «Los criterios de la derivada desde la variación, en AIEM»
  (SPEC §7.2, aprobado); las 33 imágenes son las mismas y el texto tiene el
  mismo largo y las mismas palabras. El JS del Inicio baja 14680 bytes: el
  `data.ts` ya no viaja. (`f31558e`, aparte: react-doctor marcó
  `only-export-components` en `destacada/LinkNota.tsx`, que exportaba el
  color; pasa a `destacada/verde-sobre-azul.ts`.)
- **Paso 7 — RSS e imagen para redes** (`e7ea8e3`). `lib/rss.ts` (+ test,
  2/2), `features/novedades/rss.ts` (el feed: link a la ficha o al listado,
  `guid` por slug, la fecha como día), `/novedades/rss.xml` (`force-static`)
  y el `<link rel="alternate">` en `/novedades`; `novedadesPublicadas()` sin
  `draftMode` para lo que corre fuera de un pedido. `features/novedades/imagen-para-redes/`:
  `generar.tsx` (`ImageResponse`, Manrope 700 latín `.woff` de
  `@fontsource/manrope` 5 con su `OFL.txt` al lado, el logo negativo como
  fondo —un `<img>` lo frena `@next/next/no-img-element` fuera de un
  `opengraph-image`—) y `tamano.ts` aparte, para que la metadata de la ficha
  no cargue `next/og`. La grilla de puntos no la dibuja Satori (probé dos
  sintaxis): el fondo va liso. `/novedades/[slug]/imagen-para-redes`
  (`force-static`, con `generateStaticParams`); la ficha pone `og:image` con
  la propia o la generada. `seoInicial` de Novedades en
  `contenido/seo.ts` (lo toma el paso 8). Aceptación: `pnpm build` exit 0,
  prerenderiza el RSS y las dos imágenes; el `.nft.json` de la ruta de la
  imagen incluye `manrope-latin-700-normal.woff` y `logo-ed-negativo.png`; el
  HTML de la ficha trae `og:image` = `…/novedades/relime-2025/imagen-para-redes`
  (1200 × 630, alt con el título). Con `next start` en su pestaña de Orca, en
  el 3024: el RSS da 9 `<item>` y `Content-Type: application/rss+xml;
  charset=utf-8`; `/novedades/relime-2025/imagen-para-redes` → `200
  image/png`; una ficha o una imagen que no existe → 404.

## Abierto

- **`publicacion` es texto hasta la lane 8** (DECISIONS, B): la lane 8
  (`biblioteca-y-equipo`) la pasa a una relación con materiales.
