# PLAN — Páginas: Qué hacemos, Quiénes somos y lo compartido

SPEC aprobado por el padre el 2026-09-26 con una condición y un pedido, ya
escritos en el SPEC ([`SPEC.md`](SPEC.md), rulings en
[`DECISIONS.md`](DECISIONS.md)). Lo ejecuta esta misma sesión con work-run, un
paso por commit, y cierra con work-verify y work-handoff. Estado en
[`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Commits** Conventional, en español, imperativo, header ≤ 72, atómicos
  (`docs/COMMITS.md`), con un cuerpo corto que dice el porqué; nunca
  `git add -A` ni `git add .`; trailer `Co-Authored-By: Claude Opus 5.5
  <noreply@anthropic.com>`. Commits, push y PR sin pedir OK (padre,
  2026-09-26); **nunca merge, nunca `--no-verify`**.
- **No se tocan** (otras lanes en vuelo): `admin/campos/` (lane 6 lo muda a
  `packages/kit-admin`), `features/investigacion|biblioteca|contacto|novedades/`
  (4c, 6, 7), `prisma/schema/`, `data/equipo.ts` y el perfil del equipo (lane
  8). `work/mapa-del-admin/` es un anchor congelado. En `contenido/paginas.ts`
  solo las líneas de estas tres páginas.
- **Fronteras:** `lib/contenido/` no sabe de ED ni importa nada con `@/`;
  `datos/` es la única puerta a la base; `app/` son rutas (componen, no
  transforman); `features/` recibe props. **Un componente cliente importa de
  `features/*/contenido/` solo tipos** (un valor trae Zod al bundle, DECISIONS
  de la 4a); lo que corre en el navegador va en un módulo sin imports.
- **Los seis tipos de campo no cambian** (AGENTS.md §12): lo resaltado, lo
  tachado y los renglones en verde son `**…**` o grupos de campos, con la
  ayuda que dice cómo se ven.
- **El sitio no cambia:** cada paso que toca una página corre `pnpm build` y
  `node scripts/comparar-render.mjs "$TEMP/ed-paginasqh/antes" apps/sitio`
  contra la referencia de `48ed711`, y sale 0. Las únicas excepciones son las
  tres del SPEC §7 (pasos 3, 9 y 14), con su salida en PROGRESS. Los bytes de
  activos de cada página no saltan.
- **Nombres accesibles** (condición del padre): la región con un `aria-label`
  fijo y un título editable pasa a `aria-labelledby` al id de ese título, en
  el paso de su sección (lista en DECISIONS). PROGRESS anota el nombre de
  antes y de después.
- **Topes:** componentes ≤ 200 líneas de código, utilidades ≤ 100 líneas
  totales (AGENTS.md §6); lo que se pase se parte con la receta de
  `docs/AI_GUIDELINES.md` §2 en el mismo paso. Comentarios en español que
  dicen el porqué; sin `any`. Un comentario viejo en un archivo que el paso
  toca se corrige ahí.
- **UI del admin:** DESIGN.md §11 manda (skill `designing-consistently`): solo
  tokens, los cuatro tamaños de tipo, un primario por pantalla, sin verde ni
  naranja fuera de su regla, contrastes medidos. Se mira en los tres temas
  (cookie `tema-del-admin`), a 390 de ancho y con teclado.
- **Entorno:** base `ed_paginasqh` (sin migraciones nuevas). Dev server en su
  pestaña de Orca, puerto 3022, con
  `NEXT_PUBLIC_SITE_URL=http://localhost:3022`; se abre por `localhost`, nunca
  `127.0.0.1`. Navegador: el de Orca. El repo es CRLF. Si el build tira
  `next/font/google queries have exactly one entry`, borrar `apps/sitio/.next`
  y rebuildear antes de sospechar del código.

## Preparación (sin commit) — hecha

- Build de referencia de `48ed711` en `%TEMP%\ed-paginasqh\antes\.next`,
  comparado contra sí mismo: «11 páginas, render idéntico» (PROGRESS).

## Interfaces entre pasos

- **Paso 2 →** `features/que-hacemos/contenido/areas.ts`: el esquema de la
  sección `areas` de Qué hacemos, con `areas: listaFija(7, …)` y cada área
  `{ titulo, nombreCorto, frase, detalle, teLlevas, paraQuien, foto }` (los
  nombres de Inicio para lo que es igual). `type AreaDeQueHacemos`. Los ids de
  las anclas, por posición, en `components/areas/` (estructura).
- **Paso 3 →** `features/que-hacemos/contenido/como-trabajamos.ts`: `pasos:
  listaFija(6, { verbo, idea, texto, foto })`. `type VerboDelMetodo`.
- **Paso 15 →** `lib/contenido/compartido.ts`: `type Compartido = { pagina:
  string; seccion: string; que: string }`, `rutasQueMuestran(registro, slug):
  string[]`, `quienesUsan(registro, slug, seccion): Array<{ slug: string;
  nombre: string; que: string }>`; `SeccionRegistrada.usa?: Compartido`
  (`lib/contenido/documento.ts`); `publicarEnBase(...)` devuelve `{ ok: true;
  …; rutas: string[] }` en lugar de `ruta`. `features/home/contenido/compartido.ts`:
  `areasDeInicio(areas)`.
- **Paso 16 →** `features/home/contenido/compartido.ts`:
  `ideasDelMetodo(comoTrabajamos): string[]` (las cinco primeras).
- **Paso 17 ←** consume `usa` y `quienesUsan` del paso 15:
  `PaginaParaEditar.secciones[n].compartida?: { texto: string; link?: {
  texto: string; href: string } }`.

## Pasos

1. **Partir `ImpulsanEd`.** La coreografía a
   `quienes-somos/components/impulsan-ed/coreografia-equipo.ts` (una
   `crearCoreografiaEquipo(…)` que devuelve su limpieza, llamada desde el mismo
   efecto, en la misma posición), `Nivel.tsx` y `KickerRotulo.tsx` a la misma
   carpeta; el compositor baja de 200 líneas de código. Acepta: `pnpm build` y
   comparar-render salen 0; `pnpm typecheck`, `pnpm lint` y
   `node scripts/verificar-react-doctor.mjs` salen 0; en el navegador, las
   apariciones del equipo en las mismas posiciones de scroll que antes
   (capturas antes y después) y, con `prefers-reduced-motion`, todo visible.
   *(mechanical · high)*
2. **Áreas de Qué hacemos desde el admin.** `features/que-hacemos/contenido/areas.ts`
   (título con resaltado, rótulos, las siete áreas con todos sus campos); su
   línea en el registro; `app/(sitio)/que-hacemos/page.tsx` pasa a leer
   `contenidoDe("que-hacemos")`; `AreasQueHacemos`, `IndiceAreas`,
   `PanelArea` y los chips del hero leen por props; el `nav` de las áreas por
   `aria-labelledby`; `AREAS`, `Area`, `BAJADA`, `AREAS_INTRO` y los `hechos`
   salen de `data/areas.ts`. Acepta: `pnpm test`, build y comparar-render
   salen 0. *(integration · high)*
3. **Cómo trabajamos de Qué hacemos.** `como-trabajamos.ts` (título, seis
   verbos, rótulo de aliados); `MiradaPasos`, `PanelMirada`,
   `IndicadorPasos`, `BandaAliados` y `grupos.ts` leen por props o de la
   constante de la escena; `data/areas.ts` se borra. Acepta: test y build
   salen 0; comparar-render sale 1 **solo** por `imagenes` de
   `/que-hacemos` (la foto 2, de clase a `style`), con el diff en PROGRESS.
   *(integration · medium)*
4. **Hero de Qué hacemos.** `hero.ts` (dos renglones, bajada, botón de la
   cápsula); `QueHacemosHero`, `TitularQH` y `CapsulaPortal` por props; la
   sección por `aria-labelledby` a su `h1`. Acepta: test, build y
   comparar-render salen 0. *(mechanical · low)*
5. **La escena del faro.** `faro.ts` (apertura, mensaje, cuatro frases con su
   clave, cierre); `QueHacemosHeroFaro`, `PreguntasFaro` y `CierreFaro` por
   props; `tiempos-faro.ts` cuenta con la constante de la escena;
   `PREGUNTAS` se va de `preguntas-faro.ts`; la sección por
   `aria-labelledby` a su `h2`. Acepta: test, build y comparar-render salen 0;
   en el navegador, las cuatro frases y el cierre en los mismos tiempos de
   scroll que antes. *(integration · medium)*
6. **Niveles.** `niveles.ts` (título, frase en dos renglones, bajada, cinco
   niveles); `NivelesEscala`, `NivelCard` y `coreografia-niveles.ts` por
   props o constante; `data/niveles.ts` se borra; `aria-labelledby` a su
   `h2`. Acepta: test, build y comparar-render salen 0. *(mechanical · medium)*
7. **Proyectos.** `proyectos.ts` (volanta, título, tres capítulos con nombre
   propio y sus fichas); los componentes de `proyectos-aplicaciones/` por
   props; los países, los pictogramas y `nombrarPaises` a
   `proyectos-aplicaciones/fichas.ts`; `data/proyectos.ts` se borra (y con él
   `data/`); `aria-labelledby` a su volanta. Acepta: test, build y
   comparar-render salen 0. *(integration · medium)*
8. **Cierre de Qué hacemos.** `cierre.ts` (título, texto, textos del botón y
   del link); `CierreQueHacemos` por props; `aria-labelledby` a su `h2`.
   Acepta: test, build y comparar-render salen 0. *(mechanical · low)*
9. **SEO de Qué hacemos.** `features/que-hacemos/contenido/seo.ts` con la
   metadata de hoy resuelta, su línea `seo` en el registro y un
   `generateMetadata` con `metadataDeSeo`. Acepta: test y build salen 0;
   comparar-render sale 1 **solo** por `head` de `/que-hacemos`, en
   `og:title`, `og:description`, `twitter:title` y `twitter:description`
   (listado en PROGRESS). *(mechanical · low)*
10. **Hero de Quiénes somos.** `features/quienes-somos/contenido/hero.ts` (dos
    renglones, bajada, botón); la página lee `contenidoDe("quienes-somos")`;
    `QuienesSomosHero` por props, con su `h1` sr-only armado de los dos
    renglones y la sección por `aria-labelledby`. Acepta: test, build y
    comparar-render salen 0. *(mechanical · low)*
11. **Origen.** `origen.ts` (origen, la cita, la pregunta y su respuesta, qué
    es ED con sus cinco hitos, el remate con resaltado, las tres fotos);
    `OrigenEd`, `PilaresOrigen`, `BeatRemate`, las dos trayectorias y
    `PanelFotos` por props; `origen/data.ts` se queda con la geometría.
    Acepta: test, build y comparar-render salen 0; en el navegador, la
    pregunta se escribe y la cita entra en los mismos tiempos que antes.
    *(integration · medium)*
12. **Nuestra mirada.** `mirada.ts` (volanta, título, tres principios con su
    frase sin punto, afirmación y cinco fichas, la síntesis y el puente);
    `MiradaEd`, `DetallePerspectiva`, `FichasPerspectiva`,
    `MapaConstelacion` y `SintesisMirada` por props;
    `constelacion-mirada.ts` se queda con geometría y colores;
    `aria-labelledby` a la volanta. Acepta: test, build y comparar-render
    salen 0. *(integration · medium)*
13. **Quiénes sostienen ED.** `equipo.ts` (volanta, título, bajada, rótulos de
    los cuatro niveles); `ImpulsanEd` y sus piezas por props;
    `aria-labelledby` a la volanta. Acepta: test, build y comparar-render
    salen 0. *(mechanical · low)*
14. **SEO de Quiénes somos.** Como el paso 9. Acepta: test y build salen 0;
    comparar-render sale 1 **solo** por `head` de `/quienes-somos`, en las
    mismas cuatro etiquetas. *(mechanical · low)*
15. **Las siete áreas, una sola fuente.** `lib/contenido/compartido.ts` (+
    test) y `usa` en `SeccionRegistrada`; el test del registro valida cada
    `usa`; la sección `areas` de Inicio pierde la lista y anota su `usa`;
    `areasDeInicio` (+ test); `/` lee Qué hacemos y `LineasAccion` recibe las
    áreas; `publicarEnBase` devuelve `rutas` y la acción revalida cada una
    (+ caso en `publicar-paginas.test.ts`). Acepta: `pnpm test` sale 0 (contra
    `ed_paginasqh`); build y comparar-render salen 0. *(integration · high)*
16. **Las frases del método, una sola fuente.** Los pasos de Inicio pierden
    `frase` y su sección anota su `usa`; `ideasDelMetodo` (+ test);
    `ComoTrabajamos` recibe las ideas. Acepta: test, build y comparar-render
    salen 0. *(mechanical · medium)*
17. **El aviso de sección compartida.** `paginaParaEditar` suma `compartida`
    a cada sección; el aviso en `admin/paginas/` debajo del título de la
    sección (con el link del lado de quien usa); DESIGN.md §11 «Sección
    compartida», con sus contrastes. Acepta: `pnpm test`, `pnpm typecheck`,
    `pnpm lint` y react-doctor salen 0; en el navegador (`localhost:3022`),
    el aviso en Inicio › Áreas y Cómo trabajamos y en Qué hacemos › Áreas y
    Cómo trabajamos, el link lleva a `#seccion-areas`, en los tres temas, a
    390 y con teclado. *(judgment · medium)*
18. **Docs.** README «Editar las páginas» (las dos páginas y lo compartido),
    AGENTS.md §13 (la línea de esta fase) y los punteros de `docs/content/` a
    `data/areas.ts`. Acepta: `git grep -n "que-hacemos/data" -- docs
    README.md AGENTS.md` sale 1 (sin resultados). *(mechanical · low)*
