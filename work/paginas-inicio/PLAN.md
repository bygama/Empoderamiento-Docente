# PLAN — Páginas: Inicio completo y la base de la edición

SPEC aprobado por el padre el 2026-09-26 con cuatro cambios, ya escritos en
el SPEC ([`SPEC.md`](SPEC.md), rulings en [`DECISIONS.md`](DECISIONS.md)). Lo
ejecuta esta misma sesión con work-run, un paso por commit, y cierra con
work-verify y work-handoff. Estado en [`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Commits** Conventional, en español, imperativo, header ≤ 72, atómicos
  (`docs/COMMITS.md`), con un cuerpo corto que dice el porqué; nunca
  `git add -A` ni `git add .`; trailer `Co-Authored-By: Claude Opus 5.5
  <noreply@anthropic.com>`. Commits, push y PR sin pedir OK (padre,
  2026-09-26); **nunca merge, nunca `--no-verify`**.
- **No se tocan** (otras lanes en vuelo): `packages/auth/`,
  `middleware.ts`/`proxy.ts`, `datos/auth.ts`, `prisma/schema/auth.prisma`,
  los `Formulario*.tsx` de acceso (seguridad-del-acceso); `admin/metricas/`,
  `datos/**/metricas*`, `lib/metricas/`, `prisma/schema/metricas.prisma`,
  `app/api/cron/`, `vercel.json` (busquedas-de-google). `work/mapa-del-admin/`
  es un anchor congelado.
- **Fronteras:** `lib/contenido/` no sabe de ED ni importa nada con `@/`;
  `datos/` es la única puerta a la base y ningún componente importa Prisma;
  `app/` son rutas; `features/` recibe props. Toda Server Action empieza por
  `auth.api.getSession` (lo exige `acciones-con-sesion.test.ts`).
- **Los seis tipos de campo no cambian** (AGENTS.md §12): el resaltado y la
  cifra son `.refine()` de la sección; `recomendado` es parte del largo de un
  `textoCorto`.
- **El sitio no cambia:** cada paso que toca `features/home/` o la metadata de
  `/` se prueba con `node scripts/comparar-render.mjs <antes> apps/sitio`
  contra el build de referencia (abajo), y sale 0.
- **Migraciones** con `pnpm migrate` contra `ed_paginasinicio` (nunca
  `db push`, nunca a mano); se commitean. Si al rebasear otra quedó después,
  se regenera la nuestra sobre el `main` nuevo.
- **Topes:** componentes ≤ 200 líneas de código, utilidades ≤ 100 líneas
  totales (AGENTS.md §6). Un componente que los pasa se parte con la receta
  de `docs/AI_GUIDELINES.md` §2 en el mismo paso. Comentarios en español que
  dicen el porqué. Sin `any`.
- **UI del admin:** DESIGN.md §11 manda (skill `designing-consistently`): solo
  tokens, los cuatro tamaños de tipo, un primario por pantalla, sin verde ni
  naranja fuera de su regla, contrastes medidos. Cada paso con UI se mira en
  los tres temas (cookie `tema-del-admin`), a 390 de ancho y con teclado.
- **El dev server** en su pestaña de Orca, puerto 3014, con
  `NEXT_PUBLIC_SITE_URL=http://localhost:3014`; se abre por `localhost`, nunca
  `127.0.0.1`. Navegador: el de Orca. El repo es CRLF.

## Preparación (sin commit)

- **Build de referencia:** `pnpm build` sobre `93b1caa` y copia de
  `apps/sitio/.next` a `%TEMP%\ed-paginas-inicio\antes\.next`. Es el `<antes>`
  de todas las comparaciones de render. La base `ed_paginasinicio` sin filas
  en `paginas`: el build muestra el contenido inicial, igual que ahora.

## Interfaces entre pasos

- **Paso 2 →** `apps/sitio/src/lib/contenido/resaltado.ts`: `type Fragmento =
  { texto: string; resaltado: boolean }`, `fragmentos(texto): Fragmento[]`,
  `parrafos(texto): string[]`, `resaltadoValido(texto, { exactamente? }):
  boolean` y los mensajes `RESALTADO_SIN_CERRAR` y `resaltadoExacto(n)`.
  `apps/sitio/src/contenido/paginas.test.ts`: cada parte de cada página pasa
  su esquema con su inicial (los pasos 3 a 7 y 12 no lo repiten).
- **Paso 10 →** `datos/acciones/editar-paginas.ts`: los fallos de choque son
  `{ ok: false; detalle: string; choque: true }`; guardar, publicar y
  descartar reciben `borradorEnVisto: string | null`.
- **Paso 11 →** `datos/acciones/publicar-paginas.ts`: `publicarEnBase(base,
  { slug, quien, borradorEnVisto }, registro?)` guarda la versión y poda en
  una transacción; `MAXIMO_DE_VERSIONES = 10`. Modelo `VersionDePagina`
  (`base.versionDePagina`).
- **Paso 12 →** `lib/contenido/seo.ts`: `esquemaSeo`, `type Seo`, `CLAVE_SEO =
  "seo"`, `metadataDeSeo(seo, comunes): Metadata`;
  `lib/contenido/documento.ts`: `PaginaRegistrada.seo?: unknown` y
  `partesDe(pagina): Array<[string, SeccionRegistrada]>` (las secciones y,
  si hay, `seo`), que usan `completarPagina`, publicar y el editor;
  `textoCorto({ maximo, recomendado?: { largo, aviso } })` y la
  `Descripcion` `textoCorto` con `recomendado?`.
- **Paso 13 →** guardar devuelve `errores: Array<{ camino: string; mensaje:
  string }>`; `lib/contenido/descripcion.ts`: `caminoLegible(descripcion,
  camino: ReadonlyArray<string | number>): string[]`; `admin/campos/`: el
  contexto de errores que lee `Campo.tsx`, y `error?: string` en cada control.
- **Paso 14 →** `admin/armazon/ruta.ts`: `pestanaActiva(ruta, hrefs):
  string | undefined` (la `href` más larga que es prefijo de la ruta en un
  límite de segmento); `admin/paginas/PestanasDeLaPagina.tsx` con la lista de
  pestañas a la que los pasos 15 y 16 suman la suya;
  `paginaParaEditar(slug, parte: "secciones" | "seo")`.
- **Paso 15 →** `lib/contenido/comparar.ts`: `type Legible`, `type
  Diferencia = { donde: string[]; antes: Legible; despues: Legible }`,
  `compararSeccion(descripcion, antes, despues): Diferencia[]`;
  `datos/consultas/historial-de-paginas.ts`: `cambiosDe(slug)`.

## Pasos

1. **Partir `HeroQuienes`.** La coreografía (relleno, barrido e indicador) a
   `features/home/components/hero-quienes/` (`coreografia-quienes.ts`,
   `progreso-quienes.ts`, `IndicadorQuienes.tsx`), llamada desde el mismo
   efecto, en la misma posición; el compositor baja de 200 líneas de código.
   Acepta: `pnpm build` y `node scripts/comparar-render.mjs
   $env:TEMP\ed-paginas-inicio\antes apps/sitio` salen 0; `pnpm typecheck`,
   `pnpm lint` y `node scripts/verificar-react-doctor.mjs` salen 0; en el
   navegador, el relleno, el barrido verde y el indicador en las mismas
   posiciones de scroll que antes (capturas antes y después), y con
   `prefers-reduced-motion` las dos capas apiladas. *(mechanical · high)*
2. **¿Quiénes somos? desde el admin.** `lib/contenido/resaltado.ts` (+ test),
   `features/home/contenido/quienes-somos.ts` (título, cuerpo con resaltado,
   botón, foto), su línea en el registro, `Manifiesto` lee por props (los
   fragmentos pasan a `FillSeg`), `QS_PARAGRAPHS` y lo pegado en el JSX se van;
   `contenido/paginas.test.ts`. Acepta: `pnpm --filter sitio test` sale 0;
   build y comparar-render salen 0. *(integration · high)*
3. **Misión desde el admin.** `features/home/contenido/mision.ts` con el mismo
   cuerpo con resaltado; `MisionPanel` lee por props; `MISION_PARAGRAPHS` se
   va. Acepta: test, build y comparar-render salen 0. *(mechanical · low)*
4. **En números desde el admin.** `features/home/contenido/en-numeros.ts`:
   cuatro datos con la cifra como se lee y su `.refine()`, y `partirCifra`
   (+ test); `DatosDuros` lee por props; `DATOS` se va. Acepta: test, build y
   comparar-render salen 0. *(integration · medium)*
5. **Cómo trabajamos desde el admin.** `features/home/contenido/como-trabajamos.ts`
   (cinco pasos: título, frase, detalle, foto; el número sale del índice);
   `ComoTrabajamos`, `PasoMetodo` e `IndicadorPasos` leen por props;
   `como-trabajamos/data.ts` se borra. Acepta: test, build y comparar-render
   salen 0. *(integration · medium)*
6. **Áreas desde el admin.** `features/home/contenido/areas.ts` (título,
   bajada, enlace; siete áreas con un resaltado exacto en el detalle);
   `LineasAccion` y `CartaArea` leen por props, los íconos quedan en código
   por índice; `lineas-accion/data.ts` se borra. Acepta: test, build y
   comparar-render salen 0. *(integration · medium)*
7. **Biblioteca y Novedades desde el admin.**
   `features/home/contenido/biblioteca-y-novedades.ts` (dos títulos, dos
   bajadas); `BibliotecaNovedades` los lee por props. Acepta: test, build y
   comparar-render salen 0. *(mechanical · low)*
8. **La ayuda que dice que las fotos del hero son decorativas.** Una línea de
   `ayuda` en el campo de foto de las dos listas de `hero.ts` (SPEC §8).
   Acepta: `pnpm --filter sitio test` y comparar-render salen 0.
   *(mechanical · low)*
9. **[batch] Bajar del tope de 100 líneas:** `apps/sitio/src/config/nav.ts`
   (104) y `scripts/comparar-render.mjs` (117), apretando comentarios y código
   sin perder el porqué ni cambiar la salida. Acepta: `(Get-Content
   <archivo>).Count` ≤ 100 en los dos; `pnpm typecheck` sale 0; comparar-render
   contra la referencia sigue saliendo 0 con la misma salida.
   *(mechanical · low)*
10. **El choque en las escrituras del borrador y el alta en la base.** Guardar,
    publicar y descartar reciben `borradorEnVisto` y contestan `choque: true`;
    el alta de la fila pasa a `createMany` con `skipDuplicates`; el editor
    muestra «Recargar» adentro del aviso de choque (pregunta antes de tirar lo
    no guardado). Tests de integración: choque en las tres y la lectura vieja
    del alta (contesta choque, no tira). Acepta: `pnpm --filter sitio test`
    sale 0; typecheck, lint y react-doctor salen 0; en el navegador, dos
    pestañas del editor: la segunda que guarda ve «… guardó este borrador
    hace …» con «Recargar». *(integration · high)*
11. **Versiones al publicar.** `VersionDePagina` en `paginas.prisma` y la
    migración `versiones_de_paginas`; `publicarEnBase` se muda a
    `publicar-paginas.ts` y guarda la versión y poda a 10 en una transacción.
    Test de integración: once publicaciones dejan diez versiones, la más nueva
    igual a `publicado`. Acepta: `pnpm migrate:status` al día, `pnpm --filter
    sitio test` sale 0, typecheck sale 0. *(integration · high)*
12. **El SEO en el documento y en la metadata de `/`.** `lib/contenido/seo.ts`
    (+ test), `recomendado` en `textoCorto` y `describir` (+ test),
    `partesDe` en `documento.ts` (y quien completaba o validaba secciones lo
    usa), el `seo` inicial de Inicio en `features/home/contenido/seo.ts`, el
    `generateMetadata` de `/`, `contenidoDe` con `cache()`, y «editable» es
    tener secciones o `seo`. Acepta: test, build y comparar-render (con
    `head`) salen 0. *(integration · high)*
13. **El error en el campo mismo.** Guardar devuelve todos los errores con su
    camino; `caminoLegible` (+ test); el contexto de errores, `error` en
    `TextoCorto`, `Parrafo`, `RutaInterna` y `CampoFoto`; en `ListaFija`, el
    ítem con error lo marca y el primero se abre; el aviso del encabezado con
    etiquetas. Acepta: test, typecheck, lint y react-doctor salen 0; en el
    navegador, un resaltado sin cerrar en «¿Quiénes somos?» muestra el error
    en su campo, el aviso con etiquetas, y se borra al editarlo.
    *(integration · high)*
14. **Las pestañas del editor y la de SEO.** `pestanaActiva` (+ test) y
    `Pestanas` la usa; `PestanasDeLaPagina` (Secciones · SEO); la ruta
    `[slug]/seo` con el formulario de `seo` y `VistaPreviaSeo` (Google y
    redes, en vivo); `TextoCorto` muestra el aviso de largo recomendado; los
    títulos de pestaña. Acepta: test, typecheck, lint y react-doctor salen 0;
    en el navegador, las pestañas se encienden de a una, el título de 72
    muestra «72/60» con su aviso y guarda igual, la vista previa corta con
    «…», y la vista previa del sitio muestra el `<title>` del borrador.
    *(judgment · high)*
15. **Qué cambió.** `lib/contenido/comparar.ts` (+ test), `cambiosDe` en
    `datos/consultas/historial-de-paginas.ts`, la ruta `[slug]/cambios` con la
    comparación por sección (antes y ahora, fotos con su alt), Vista previa ·
    Publicar · Descartar, y su pestaña. Acepta: test, typecheck, lint y
    react-doctor salen 0; en el navegador, guardar un cambio en dos secciones
    y verlos con sus etiquetas; sin borrador, el estado vacío.
    *(judgment · high)*
16. **Versiones en el editor.** `versionesDe` en `historial-de-paginas.ts`;
    `restaurarVersionEnBase` en `datos/acciones/versiones-de-paginas.ts` (+
    test de integración: mete lo que pasa, avisa lo que no, choque) y su
    Server Action con sesión; la ruta `[slug]/versiones` con la `Lista`, «En
    el sitio» y «Restaurar como borrador», el estado vacío y su pestaña.
    Acepta: test, typecheck, lint y react-doctor salen 0; en el navegador,
    publicar dos veces, restaurar la primera y verla en «Qué cambió».
    *(integration · high)*
17. **DESIGN.md §11.** Las pestañas de una página y la activa más específica,
    «Qué cambió», la vista previa de buscador y redes, el aviso con una
    acción, el error debajo del campo y el aviso de largo, con sus contrastes
    medidos. Acepta: `pnpm lint` sale 0 y cada contraste nuevo tiene su número
    escrito. *(judgment · medium)*
18. **README y spec del admin.** «Editar las páginas» con Inicio entero, las
    cuatro pestañas, el resaltado, las versiones y el choque; el spec del
    admin §11 saca versiones de «fuera de alcance». Acepta: los links
    relativos nuevos resuelven (`Test-Path` de cada uno). *(mechanical · low)*
19. **AGENTS.md §3 y §13.** Los archivos nuevos de `datos/consultas/` y
    `datos/acciones/` en el árbol; la línea de esta fase en el estado.
    Acepta: `node scripts/verificar-react-doctor.mjs` y `pnpm lint` salen 0
    (el gate sigue entero). *(mechanical · low)*
