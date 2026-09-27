# PLAN — Novedades y el kit del admin

SPEC aprobado por el padre el 2026-09-26 (DECISIONS). Un paso, un commit;
cada uno con su aceptación y su marca de riesgo.

## Restricciones de todos los pasos

- **Idioma:** código, comentarios, docs y commits en español; la UI en voseo y
  con lenguaje inclusivo, nunca «alumnos». Commits Conventional según
  `docs/COMMITS.md`, atómicos, nunca `git add -A`, nunca `--no-verify`.
- **Las cuatro fronteras:** el kit no sabe nada de ED (ni un `@/`, ni
  «novedad», ni un texto de ED); `datos/` es la única puerta a la base;
  `app/` son rutas; `features/` recibe props.
- **Toda Server Action** empieza por `auth.api.getSession` y sigue con
  `puede(rol, "editarNovedades")`; la ruta de la imagen del admin, también.
- **Sin dependencias nuevas.** Solo tokens, los cuatro tamaños de tipo, un
  primario por pantalla, DESIGN.md §11. Componentes ≤ 200 líneas, utilidades
  ≤ 100.
- **Cada paso termina con `pnpm typecheck` y `pnpm lint` en verde**, además de
  su aceptación. El repo es CRLF.
- **Antes del paso 11, rebasar sobre `origin/main`** (y volver a correr
  `pnpm migrate` si `main` trae migraciones: la nuestra se regenera encima,
  nunca se edita una aplicada): así la UI consume el buscador y «volver» de la
  3b y los registros del Inicio de la 3c, si ya están, en vez de duplicarlos.

## Pasos

1. **El kit nace con los controles del editor.** `packages/kit-admin`
   (`package.json` con `react`, `react-dom` y `next` de peer, `tsconfig`,
   ESLint con React, `README.md` con el contrato de tokens, `src/index.ts` y el
   subpath `./foto`); los controles de `admin/campos/` mudados —`RutaInterna`
   pasa a `Seleccion` con `{ valor, etiqueta }`, `CampoFoto` recibe
   `maximoBytes`—; `Boton`, `claseDeBoton` y `Aviso` al kit con sus íconos, y
   `armazon/Boton.tsx`, `armazon/clases.ts` y `armazon/Campos.tsx` los
   re-exportan con el comentario de una línea de DECISIONS (A); `Campo.tsx` y
   los demás imports de la app, al kit; `lib/contenido/fotos.ts` re-exporta
   `Foco`, `ValorFoto` y `posicionDelFoco` de `@ed/kit-admin/foto`; el kit en
   `apps/sitio/package.json`, el `@source` en `globals.css` y el kit en las dos
   listas del gate. **Interfaz:** `@ed/kit-admin` exporta `TextoCorto`,
   `Parrafo`, `Seleccion`, `CampoFoto`, `SubirFoto`, `ListaFija`, `Contador`,
   `PieDelCampo`, `estadoDelLargo`, `ENTRADA`, `Cambio`, `resolverCambio`,
   `Boton`, `claseDeBoton`, `Variante`, `Aviso`, `Recomendado`;
   `@ed/kit-admin/foto` exporta `Foco`, `ValorDeFoto`, `posicionDelFoco`.
   — Aceptación: `pnpm install && pnpm typecheck && pnpm lint && pnpm test &&
   node scripts/verificar-react-doctor.mjs && pnpm build` sale 0 (el
   verificador mide cuatro proyectos); `git grep -nE "from \"@/|[Nn]ovedad|Empoderamiento" packages/kit-admin/src`
   sale 1; y `field-sizing-content` (una clase que solo usan los controles)
   está en el CSS de `apps/sitio/.next/static`. *(integration · high)*

2. **Los controles nuevos del kit.** `Casilla`, `Fecha` (año, mes y día, con
   mes y día opcionales; `partesDeFecha` y `fechaDePartes` puras, con su test)
   y `ListaVariable` (agregar, quitar, subir, bajar, con el máximo a la vista),
   y el script `test` del kit. **Interfaz:** los tres exportados de
   `@ed/kit-admin`; `Fecha` trabaja con el texto `AAAA-MM-DD` · `AAAA-MM` ·
   `AAAA` · `""`. — Aceptación: `pnpm --filter @ed/kit-admin test && pnpm
   typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs` sale 0.
   *(judgment · medium)*

3. **El esquema de una novedad.** `features/novedades/contenido/novedad.ts`:
   `CATEGORIAS`, los topes, `esquemaNovedad` (publicar), `esquemaBorrador`
   (guardar), `compararFechas` (el orden de SPEC §7.2) y `anclasDe` (las anclas
   del cuerpo con `desdeTexto`, sin repetir), con su test. **Interfaz:**
   `CATEGORIAS`, `Categoria`, `esquemaNovedad`, `Novedad`, `esquemaBorrador`,
   `BorradorDeNovedad`, `borradorVacio(hoy)`, `compararFechas`, `anclasDe`. —
   Aceptación: `pnpm --filter sitio exec tsx --test
   src/features/novedades/contenido/novedad.test.ts` sale 0.
   *(judgment · high)*

4. **La tabla `novedades`, con las nueve de hoy.** `prisma/schema/novedades.prisma`,
   `pnpm migrate --create-only --name novedades`, y en ese archivo, antes de
   aplicarlo, el índice parcial `novedades_una_sola_destacada` y el SQL de
   datos generado desde `novedades.ts` (el script que lo genera valida cada
   fila con `esquemaNovedad` y no se commitea), comentados; los alt de las
   nueve imágenes; `pnpm migrate`. — Aceptación: `pnpm migrate:status` dice
   «Database schema is up to date!» y `docker exec ed-postgres psql -U postgres
   -d ed_novedades -tAc "select count(*) filter (where publicada), count(*)
   filter (where destacada), (select count(*) from pg_indexes where indexname =
   'novedades_una_sola_destacada') from novedades"` da `9|1|1`.
   *(integration · high)*

5. **Lo que lee el sitio.** `datos/consultas/novedades.ts`:
   `novedadesDelSitio()` (las publicadas, o las de la vista previa de SPEC
   §5.4, validadas con `esquemaNovedad` y ordenadas con `compararFechas`),
   `novedadPorSlug(slug)` y `redireccionDe(ruta)`, con el guardado de `filaDe`
   y la lectura inyectable; test con filas inyectadas (el orden, la vista
   previa y una fila rota que no llega). **Interfaz:** `NovedadDelSitio`
   (`Novedad` con el cuerpo anclado), lo que reciben los componentes. —
   Aceptación: `pnpm --filter sitio exec tsx --test
   src/datos/consultas/novedades.test.ts` sale 0. *(integration · medium)*

6. **El sitio muestra las novedades de la base.** Los componentes de
   `features/novedades/` y `BibliotecaNovedades` reciben `NovedadDelSitio[]`
   por props; `/novedades`, `/novedades/[slug]` (su metadata, y el 308 de
   `redireccionDe` antes del 404) y `/` leen de `datos/consultas/novedades.ts`;
   del `data.ts` se van las novedades, las categorías y sus tipos. —
   Aceptación: `pnpm build` sale 0 y `node scripts/comparar-render.mjs
   <build de base> apps/sitio` informa una sola diferencia: el orden del
   listado de `/novedades` (SPEC §7.2), anotada en PROGRESS.
   *(integration · high)*

7. **El RSS y la imagen para redes de cada novedad.** `lib/rss.ts` (sin ED,
   con test), `/novedades/rss.xml` estático y su `<link rel="alternate">`;
   `features/novedades/imagen-para-redes.tsx` con Manrope (`.woff`) y su
   `OFL.txt` al lado, `/novedades/[slug]/imagen-para-redes` y el `og:image` de
   la ficha (la propia o la generada). — Aceptación: `pnpm --filter sitio exec
   tsx --test src/lib/rss.test.ts && pnpm build` sale 0; con `next start` en
   su pestaña de Orca, `/novedades/rss.xml` trae nueve `<item>` y
   `/novedades/relime-2025/imagen-para-redes` contesta `200 image/png`.
   *(integration · medium)*

8. **La página Novedades se edita desde el admin.** Las seis secciones y el
   SEO de SPEC §8 en `features/novedades/contenido/` (esquema e inicial con los
   textos de hoy, `MOVIMIENTO` y `LANZAMIENTOS` incluidos), la línea de
   `novedades` en `contenido/paginas.ts`, `/novedades` lee
   `contenidoDe("novedades")` y cada sección recibe el suyo; el `data.ts` se
   borra. — Aceptación: `pnpm test && pnpm build` sale 0, `git ls-files
   apps/sitio/src/features/novedades/data` no imprime nada y
   `comparar-render` da lo mismo que en el paso 6. *(integration · medium)*

9. **Guardar, publicar y lo demás, en la base.**
   `datos/acciones/editar-novedades.ts` (crear, guardar con el aviso de
   choque, descartar cambios, borrar) y `publicar-novedades.ts` (publicar con
   la destacada única y el 308, despublicar), con el cliente inyectado;
   `choque.ts` con el sujeto de la frase como parámetro. **Interfaz:**
   `crearNovedadEnBase`, `guardarNovedadEnBase`, `descartarCambiosEnBase`,
   `borrarNovedadEnBase`, `publicarNovedadEnBase` (devuelve las rutas a
   revalidar y la que dejó de ser destacada), `despublicarNovedadEnBase`. —
   Aceptación: `pnpm --filter sitio exec tsx --test
   src/datos/acciones/editar-novedades.test.ts
   src/datos/acciones/publicar-novedades.test.ts` sale 0 sin tests salteados.
   *(judgment · high)*

10. **Las acciones del admin.** `datos/acciones/novedades.ts` («use server»:
    sesión, `editarNovedades`, la actividad y la revalidación de SPEC §7.3),
    los cuatro tipos nuevos en `datos/actividad.ts` y la vista previa de una
    novedad (el Draft Mode de las páginas, con la cookie acotada en un módulo
    que comparten las dos). — Aceptación: `pnpm --filter sitio exec tsx --test
    src/datos/acciones/acciones-con-sesion.test.ts src/datos/actividad.test.ts`
    sale 0. *(integration · high)*

11. **La lista de novedades.** `app/(admin)/admin/(protegido)/novedades/`
    (layout con la guarda, Publicadas de puerta, `borradores/`),
    `admin/novedades/ListaDeNovedades.tsx`, la consulta de la lista, el
    buscador (el de la 3b, o nace en `armazon/`), `EstadoVacio` con su acción y
    la guía de `por-hacer` borrada. — Aceptación: `pnpm --filter sitio exec tsx
    --test src/admin/armazon/guarda.test.ts && node
    scripts/verificar-react-doctor.mjs` sale 0; en el navegador de Orca,
    `/admin/novedades` lista nueve y `?q=relime` una (en PROGRESS).
    *(integration · medium)*

12. **La ficha: el formulario y guardar.** `/admin/novedades/nueva` y
    `/[id]`, `admin/novedades/FormularioDeNovedad.tsx` con los controles del
    kit, el encabezado con «← Novedades», la insignia y las acciones, el slug
    que sigue al título hasta publicarse, el primer guardado que crea la fila
    y pasa a `/[id]`, y el aviso de cambios sin guardar. — Aceptación: `node
    scripts/verificar-react-doctor.mjs` sale 0; en el navegador, una novedad
    nueva se guarda y sigue ahí al recargar (en PROGRESS). *(judgment · high)*

13. **La ficha: publicar, despublicar, descartar, borrar y qué cambió.** Las
    acciones con sus confirmaciones, el aviso de la destacada y
    `admin/novedades/cambios.ts` (la comparación escrita a mano, con su test)
    con la lista de «Qué cambió». — Aceptación: `pnpm --filter sitio exec tsx
    --test src/admin/novedades/cambios.test.ts && node
    scripts/verificar-react-doctor.mjs` sale 0; en el navegador, publicar con
    otro slug deja el viejo en 308 (en PROGRESS). *(integration · high)*

14. **El panel lateral.** Cómo se ve (la vista previa de buscador y redes, con
    la imagen generada), `/admin/novedades/imagen-para-redes` (sesión y
    `editarNovedades` adentro), «Usar otra», «Se ve en» y «Ver en el sitio». —
    Aceptación: `node scripts/verificar-react-doctor.mjs` sale 0; sin cookie,
    `curl -s -o NUL -w "%{http_code}"
    "http://localhost:3024/admin/novedades/imagen-para-redes?titulo=x"` no da
    200; con sesión, la imagen se ve en el panel (en PROGRESS).
    *(integration · medium)*

15. **Novedades en el Inicio.** Si la 3c está en `main`: el pendiente de los
    borradores de más de 7 días, el acceso rápido «Nueva novedad» y la frase y
    quién ve cada uno de los cuatro tipos; si no, la nota en PROGRESS y ningún
    commit. — Aceptación: `pnpm test && pnpm typecheck` sale 0.
    *(mechanical · low)*

16. **Los patrones de Novedades en DESIGN.md §11.** El estado vacío con
    acción, `Casilla`, `Fecha`, `ListaVariable`, `Seleccion`, la ficha de una
    entidad con su panel y «Se ve en», y dónde viven los controles, con sus
    contrastes en los tres temas. — Aceptación: `git grep -c -E
    "ListaVariable|Casilla|Seleccion|Se ve en" -- DESIGN.md` da 4 o más.
    *(mechanical · medium)*

17. **El ADR del kit y del modelo de entidad, y el spec del admin.** El ADR
    con el número libre (SPEC §12) y su fila en el índice de ADRs; el spec del
    admin §3, §6 y §9. — Aceptación: `git grep -l "kit-admin" --
    docs/architecture/adrs docs/architecture/specs` lista el ADR nuevo y el
    spec. *(judgment · medium)*

18. **AGENTS.md y el README.** §3 (el árbol), §12 y §13 de AGENTS.md; el kit,
    el módulo Novedades y el RSS en el README. — Aceptación: `git grep -c
    "Lo único que todavía no existe es" -- AGENTS.md` sale 1 (no está) y `git
    grep -c "kit-admin" -- AGENTS.md README.md` da más de una línea por
    archivo. *(mechanical · low)*
