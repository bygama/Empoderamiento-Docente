# PLAN — Páginas: Investigación, Biblioteca y Contacto

SPEC aprobado tal cual por el padre el 2026-09-26 ([`SPEC.md`](SPEC.md),
ruling en [`DECISIONS.md`](DECISIONS.md)). Lo ejecuta esta misma sesión con
work-run, un paso por commit, y cierra con work-verify y work-handoff. Estado
en [`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Commits** Conventional, en español, imperativo, header ≤ 72, atómicos
  (`docs/COMMITS.md`), con un cuerpo corto que dice el porqué; nunca
  `git add -A` ni `git add .`; trailer `Co-Authored-By: Claude Opus 5.5
  <noreply@anthropic.com>`. Commits, push y PR sin pedir OK (padre,
  2026-09-26); **nunca merge, nunca `--no-verify`**.
- **No se tocan** (otras lanes en vuelo): `features/que-hacemos/`,
  `features/quienes-somos/`, `features/home/` (4b); `features/novedades/`,
  `admin/campos/`, `prisma/schema/` (6); `features/contacto/` y `app/api/`
  (7, hasta el paso 17); `features/biblioteca/data/` y
  `features/investigacion/data/casos.ts` (8 y 9). De `contenido/paginas.ts`,
  solo las líneas de `investigacion`, `biblioteca` y `contacto`.
  `work/mapa-del-admin/` es un anchor congelado.
- **Fronteras:** `lib/contenido/` no cambia; `app/` son rutas; `features/`
  recibe props; **un componente cliente importa de `features/*/contenido/`
  solo tipos** (DECISIONS de la 4a: un valor de ahí mete Zod en el JS de la
  página, y comparar-render lo muestra en los bytes: no pueden saltar).
- **Los seis tipos de campo no cambian:** «una parte resaltada» es un
  `textoCorto` con el `.refine()` de `resaltadoValido(…, { exactamente: 1 })`,
  como las áreas de Inicio.
- **El sitio no cambia:** cada paso se prueba con `pnpm build` y
  `node scripts/comparar-render.mjs $env:TEMP\ed-4c\antes apps/sitio`, que
  sale 0. Los pasos 8 y 16 salen 1 solo por `head` de su página
  (`og:title` y `og:description`, DECISIONS 1), con el diff en PROGRESS.
- **Topes:** componentes ≤ 200 líneas de código sin comentarios, utilidades
  ≤ 100 líneas (AGENTS.md §6). Se miden con el conteo de la preparación.
  Comentarios en español que dicen el porqué. Sin `any`.
- **Particiones:** receta de `docs/AI_GUIDELINES.md` §2 —el compositor en su
  ruta, las piezas en una subcarpeta con su nombre en kebab-case, la
  coreografía en una `crear…()` que devuelve su limpieza y la llama el mismo
  efecto, en la misma posición—. Las animaciones se mudan tal cual (los
  `scrub: true` incluidos: SPEC §11).
- **El dev server** en su pestaña de Orca, puerto 3023, con
  `NEXT_PUBLIC_SITE_URL=http://localhost:3023`; se abre por `localhost`, nunca
  `127.0.0.1`. Navegador: el de Orca. El repo es CRLF.

## Preparación (sin commit)

- **Build de referencia:** `pnpm build` sobre `48ed711` (`main`), copiado a
  `%TEMP%\ed-4c\antes\.next` sin la caché; comparado contra sí mismo da «11
  páginas, render idéntico». Es el `<antes>` de todas las comparaciones.
- **Base `ed_paginasinv`** con las migraciones de `main` y sin filas en
  `paginas`: el build muestra el contenido inicial, igual que hoy.
- **Conteo de líneas de código** (sin comentarios ni líneas vacías), el que
  dio los números de AGENTS.md §6:
  `node -e "const s=require('fs').readFileSync(process.argv[1],'utf8').replace(/\r/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\{\s*\}/g,'');console.log(s.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('//')).length)" <archivo>`

## Interfaces entre pasos

- **Paso 1 →** `features/investigacion/contenido/comunes.ts`:
  `unaResaltada({ maximo, etiqueta, ayuda })`, un `textoCorto` con el
  `.refine()` de exactamente una parte resaltada, que usan los pasos 3, 4 y
  7. `features/investigacion/components/ConResaltado.tsx`:
  `ConResaltado({ texto })`, los fragmentos con lo resaltado en `Highlight`,
  que usan los pasos 3 y 4 para sus títulos.
  `app/(sitio)/investigacion/page.tsx` pasa a `async` y lee
  `contenidoDe("investigacion")`; cada paso de Investigación suma su clave
  a esa desestructuración y su prop.
- **Paso 9 →** `app/(sitio)/biblioteca/page.tsx`, lo mismo con
  `contenidoDe("biblioteca")`.

## Pasos

1. **Investigación › Hero desde el admin.** `contenido/hero.ts` (título con
   una parte resaltada, dos botones, cuatro pasos: verbo y frase) y
   `contenido/comunes.ts`; su línea en el registro; `page.tsx` lee
   `contenidoDe`; `InvestigacionHero` y `HojaHistoria` por props, con
   `ConResaltado`; `constelacion.ts` pierde `etiqueta` y `frase`. Acepta:
   `pnpm --filter sitio test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` y
   comparar-render salen 0. *(integration · high)*
2. **Partir `LineasInvestigacion`.** Sus piezas a
   `components/lineas-investigacion/` (el papel, la carpeta, la
   coreografía); el compositor baja de 200. Acepta: build y comparar-render
   salen 0; el conteo del compositor ≤ 200; typecheck y lint salen 0; en el
   navegador, la carpeta entra inclinada, se aplana al centrarse y las filas
   caen en cascada, como antes. *(mechanical · medium)*
3. **Líneas desde el admin.** `contenido/lineas.ts` (antetítulo, título con
   una parte resaltada, bajada, botón; seis líneas: nombre y pregunta con una
   parte resaltada); `LINEAS` se va y el caso de cada línea queda por
   posición en la carpeta, con la ayuda de la lista que lo dice. Acepta:
   test, typecheck, lint, build y comparar-render salen 0.
   *(integration · medium)*
4. **Ciclo desde el admin.** `contenido/ciclo.ts` (título, dos ciclos de
   cuatro estaciones —nombre, texto, breve con una parte resaltada,
   destacado opcional—, bisagra, título de la evidencia y remate);
   `EspiralInvestigacion`, `EspiralEstatica` y `EspiralLamina` por props;
   `estaciones.ts` se borra y su `numero` queda junto a la espiral. Acepta:
   test, typecheck, lint, build y comparar-render salen 0.
   *(integration · medium)*
5. **Investigación en acción desde el admin.** `contenido/en-accion.ts` (el
   título); `InvestigacionEnAccion` y `CasosInvestigacion` lo reciben.
   Acepta: test, build y comparar-render salen 0. *(mechanical · low)*
6. **Partir `CierreInvestigacion`.** El cielo y las nubes a
   `components/cierre-investigacion/`; el compositor baja de 200. Acepta:
   build y comparar-render salen 0; el conteo ≤ 200; typecheck y lint salen
   0; en el navegador, el descenso entre nubes, el faro y el haz sobre los
   dos mensajes, como antes. *(mechanical · medium)*
7. **Cierre de Investigación desde el admin.** `contenido/cierre.ts`
   (Biblioteca: título y botón; Conversemos: antetítulo, título y botón).
   Acepta: test, build y comparar-render salen 0. *(mechanical · low)*
8. **SEO de Investigación.** `contenido/seo.ts` con lo de hoy, la línea
   `seo` y `generateMetadata` con `metadataDeSeo`. Acepta: test, typecheck y
   build salen 0; comparar-render sale 1 con `investigacion.html: DISTINTA en
   head` y nada más, y el diff de los `<meta>` muestra solo `og:title` y
   `og:description` (en PROGRESS); en el navegador, el editor de
   Investigación de punta a punta (SPEC §10) en los tres temas, a 390 y con
   teclado. *(integration · medium)*
9. **Biblioteca › Hero desde el admin.** `features/biblioteca/contenido/hero.ts`
   (las dos líneas del título y la bajada), su línea en el registro,
   `page.tsx` lee `contenidoDe("biblioteca")`, `BibliotecaHero` por props.
   Acepta: test, typecheck, lint, build y comparar-render salen 0.
   *(integration · medium)*
10. **Material destacado desde el admin.** `contenido/destacados.ts`
    (antetítulo, título con su parte verde, presentación);
    `DestacadosBiblioteca` e `IntroDestacados` por props. Acepta: test,
    build y comparar-render salen 0. *(mechanical · low)*
11. **Partir `MaterialesListado`.** Los filtros, la fila y lo de la URL a
    `components/materiales-listado/`; el compositor baja de 200. Acepta:
    build y comparar-render salen 0; el conteo ≤ 200; typecheck y lint salen
    0; en el navegador, la búsqueda, los tres grupos, `?tipo=` desde el
    menú, «Ver más», «Ver menos» y «Limpiar», como antes.
    *(mechanical · medium)*
12. **Catálogo desde el admin.** `contenido/catalogo.ts` (el aviso sin
    resultados), que el listado recibe. Acepta: test, build y comparar-render
    salen 0. *(mechanical · low)*
13. **Partir `PuenteInvestigacion`.** Los temas, el panel y la coreografía a
    `components/puente-investigacion/`; el compositor baja de 200. Acepta:
    build y comparar-render salen 0; el conteo ≤ 200; typecheck y lint salen
    0; en el navegador, los lomos esperan a la derecha y cada panel se apila
    sobre el anterior, como antes; sin movimiento, la pila vertical.
    *(mechanical · medium)*
14. **Puente a Investigación desde el admin.** `contenido/puente.ts` (título,
    dos botones; cuatro recursos: nombre, descripción, línea y foto con la
    ayuda de la foto decorativa); `CARDS` se va y el tema de cada panel sale
    de su lugar. Acepta: test, typecheck, lint, build y comparar-render salen
    0. *(integration · medium)*
15. **Cierre de Biblioteca desde el admin.** `contenido/cierre.ts` (título,
    texto, botón y enlace). Acepta: test, build y comparar-render salen 0.
    *(mechanical · low)*
16. **SEO de Biblioteca.** Como el paso 8. Acepta: test, typecheck y build
    salen 0; comparar-render sale 1 con `biblioteca.html: DISTINTA en head`
    además de la del paso 8 y nada más, con el diff en PROGRESS; en el
    navegador, el editor de Biblioteca de punta a punta en los tres temas, a
    390 y con teclado. *(integration · medium)*
17. **Rebase y Contacto.** `git rebase origin/main` con el gate otra vez
    verde. Si la lane 7 (`mensajes`) está en `main`: la lista de campos de
    Contacto cerrada contra su código, en DECISIONS, y un commit por sección
    más su SEO, cada uno con test, build y comparar-render como arriba. Si
    no, `features/contacto/` no se toca y PROGRESS lo dice. Acepta: `git log
    origin/main --oneline` muestra (o no) la 7, y lo que corresponda de
    arriba sale como se pide. *(judgment · high)*
18. **Docs.** README «Editar las páginas» (Investigación y Biblioteca
    enteras, y Contacto si entró); AGENTS.md §6 (la cuenta de los
    componentes por encima de 200, medida con el conteo de la preparación) y
    §13 (la línea de esta fase). Acepta: los números de §6 coinciden con el
    conteo; `pnpm lint` sale 0. *(mechanical · low)*
