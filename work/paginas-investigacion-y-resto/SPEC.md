# SPEC — Páginas: Investigación, Biblioteca y Contacto

- **Fecha:** 2026-09-26
- **Estado:** aprobado tal cual por el padre el 2026-09-26 (ruling en
  [`DECISIONS.md`](DECISIONS.md)); plan en [`PLAN.md`](PLAN.md)
- **Decide:** Mateo; aprueba el padre (`work/mapa-del-admin/DECISIONS.md`,
  2026-09-26: «procede en automatico»)
- **Tier:** L · lane 4c de 12 del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md)
  («La lane 4 se parte en tres») · rama `mateo/paginas-investigacion-y-resto`
  · worktree propio · puerto 3023 · base `ed_paginasinv`
- **Diseño:** el brief del padre (lane 4c), el SPEC padre §5.3 y §9, el
  inventario de la edición de páginas
  (`git show fa8d641^:work/edicion-de-paginas/INVENTARIO.md` §4, §5 y §7) y
  el camino que dejó la 4a en `main` (#183: `features/home/contenido/`,
  `contenido/paginas.ts`, sus DECISIONS). Este SPEC lo formaliza; no lo
  re-decide.
- **Sin tablas ni dependencias nuevas.**

---

## 1. Para qué

La 4a dejó en `main` la edición completa de Inicio —versiones, «Qué cambió»,
aviso de choque, pestaña SEO, error en el campo— y el camino para pasar una
sección al admin sin que el sitio cambie. Esta lane lo usa tal cual, sin
reinventar nada, para **Investigación** y **Biblioteca**, y al final para
**Contacto** si la lane 7 ya está en `main` (§6).

Cada sección sigue el camino de la 4a: su esquema y su contenido inicial en
`features/<pagina>/contenido/`, su línea en `contenido/paginas.ts`, su
componente lee por props, **lo que tenía los textos se borra en el mismo
commit**, un commit por sección, y **el sitio no cambia**:
`scripts/comparar-render.mjs` da idéntico después de cada una. Los máximos
llevan aire sobre el texto más largo de hoy (el criterio de la 4a).

**«Una parte resaltada»** es el resaltado de la 4a (`**así**`): un
`textoCorto` con el `.refine()` que exige exactamente una, sin tipo nuevo.
En los títulos se dibuja con el marcador (`Highlight`), en las preguntas de
Líneas con el garabato verde, en la versión breve de cada estación con el
subrayado de la lámina, y en el título de Destacados es la parte verde.

## 2. Investigación

| Clave | En el admin | Campos (máximo de caracteres) | Hoy vive en |
| --- | --- | --- | --- |
| `hero` | Hero | título, una parte resaltada (70) · botón principal (30) · botón secundario (30) · 4 pasos de la historia, lista fija: verbo (18) · frase (110) | `InvestigacionHero.tsx` (título y botones) y `constelacion.ts` (`etiqueta` y `frase` de `FIGURAS`) |
| `lineas` | Líneas de investigación | antetítulo (40) · título, una parte resaltada (60) · bajada (40) · botón (40) · 6 líneas, lista fija: nombre (80) · pregunta, una parte resaltada (190) | `LineasInvestigacion.tsx` (`LINEAS` y el JSX) |
| `ciclo` | Ciclo de investigación aplicada | título, una parte resaltada (70) · ciclo pedagógico: 4 estaciones · bisagra (110) · título de la evidencia, una parte resaltada (40) · remate (210) · ciclo de evidencia: 4 estaciones. Cada estación: nombre (40) · texto (240) · versión breve, una parte resaltada (190) · destacado, opcional (160) | `estaciones.ts` y los títulos de `EspiralEstatica`/`EspiralLamina` |
| `enAccion` | Investigación en acción | título (30) | `casos/CasosInvestigacion.tsx` |
| `cierre` | Cierre | Biblioteca: título (50) · botón (30) · Conversemos: antetítulo (35) · título (55) · botón (20) | `CierreInvestigacion.tsx` |

- **`constelacion.ts` se queda con la geometría** (los 13 puntos de cada
  figura, sus aristas y sus colores): pierde `etiqueta` y `frase`, que pasan
  al hero. Los cuatro pasos son una lista fija porque cada uno es una figura.
- **`estaciones.ts` se borra**; su `numero(i)` (lo usa `EspiralSvg`) queda al
  lado de la espiral. Las dos versiones de cada estación siguen siendo dos
  campos: el texto va en la versión sin animación (celular, sin movimiento y
  el SSR) y la breve en la lámina. La ayuda lo dice, y dice que la lámina
  está afinada para el nombre en un renglón y la breve en tres
  (`ANCHO_CH`): alargarlas puede partirlas distinto.
- **Investigación en acción** muestra los casos, que son una entidad (lane
  9): de la sección, solo su título. `data/casos.ts` y el resto de `casos/`
  no se tocan.

## 3. Biblioteca

| Clave | En el admin | Campos (máximo de caracteres) | Hoy vive en |
| --- | --- | --- | --- |
| `hero` | Hero | título en dos líneas: primera (16) · segunda, en verde (16) · bajada (110) | `BibliotecaHero.tsx` |
| `destacados` | Material destacado | antetítulo (25) · título, una parte en verde (60) · presentación (180) | `destacados/IntroDestacados.tsx` |
| `catalogo` | Catálogo | el aviso cuando no hay resultados (130) | `MaterialesListado.tsx` |
| `puente` | Puente a Investigación | título (55) · botón principal (25) · botón secundario (25) · 4 recursos, lista fija: nombre (18) · descripción (170) · línea de la que nace (64) · foto | `PuenteInvestigacion.tsx` (`CARDS`) |
| `cierre` | Cierre | título (30) · texto (150) · botón (32) · enlace (20) | `CierreBiblioteca.tsx` |

- **Destacados y el catálogo muestran materiales** (lane 8): el rótulo, la
  frase y el detalle de cada destacado, las filas, los tipos del riel del
  hero y las portadas son de `data/materiales.ts`, que no se toca. De esas
  secciones, solo sus textos propios.
- **Las fotos del puente son decorativas** (`alt=""` hoy, y se queda: la
  tarjeta ya dice todo). El campo pide el texto alternativo igual, porque es
  de la foto y sirve donde la foto aporta, con una línea de ayuda que lo dice
  en llano: la misma decisión que la 4a tomó con el collage del hero.

## 4. Lo que queda en código, a propósito

- **Los folios y rótulos del archivo** («Archivo ED · Hoja 02 · Líneas de
  investigación», «02 · Líneas de investigación», «Recurso 01 / 04», «Nace
  de la línea») y los números: son la estructura de la página, como los
  números de Inicio.
- **Los destinos de los botones.** En estas dos páginas cada botón lleva
  adonde la sección existe para llevar: anclas de la misma página que la
  coreografía conoce (`#lineas`, `#en-accion`), el puente a Investigación,
  Novedades, y Contacto con su tema ya elegido (`/contacto?tema=…`, que
  `RUTAS_INTERNAS` no tiene). Se edita el texto; el destino no.
- **Qué caso abre cada línea** («Ver en acción»): va por su lugar en la
  lista, en código. Es un cruce con los casos, una entidad de la lane 9, y
  se decide allá cuando Casos llegue al admin; la ayuda de la lista lo dice.
- **La geometría y las coreografías**: los puntos de la constelación, las
  anotaciones de la lámina, los lomos del puente. Nada de eso cambia.
- **Los textos de interfaz**, que nombran controles cuyo comportamiento está
  en el código: «Seguí bajando», los buscadores (su placeholder dice qué
  campos busca), «Filtros», «Limpiar todo», los nombres de los grupos de
  filtro, «Todos», los contadores, «Ver N más», «Limpiar filtros», el
  «Destacados» del índice y los `aria-label` de las secciones.

## 5. SEO, una línea cada página

Cada página suma su `seo` al registro con lo de hoy: el título que se ve en la
pestaña («Investigación | Empoderamiento Docente», «Biblioteca |
Empoderamiento Docente»; el esquema lo guarda entero), su descripción y sin
imagen propia. Cada `page.tsx` pasa a un `generateMetadata` que lee
`contenidoDe(slug).seo` con `metadataDeSeo`, como Inicio.

**La única diferencia de render de la lane, a propósito:** hoy estas dos
páginas no dan su `openGraph`, así que Next les pone el del layout
(`og:title` y `og:description` del sitio entero). Con el SEO, `og:title` y
`og:description` pasan a ser los de la página —el mismo título y la misma
descripción que ya tienen—, que es como la 4a diseñó el esquema (el título y
la descripción valen para Google y para redes). `<title>`, `description` y la
imagen no cambian. comparar-render lo muestra en `head`, en el commit del SEO
de cada página, y la salida queda en PROGRESS.

## 6. Contacto, al final y con una condición

La lane 7 (`mensajes`) está conectando el envío del formulario en
`features/contacto/`. Antes de empezar Contacto, esta lane rebasea sobre
`main`:

- **Si la 7 ya está mergeada:** los textos de Contacto y su SEO, sobre lo que
  dejó. La lista exacta se cierra en ese momento contra su código y se anota
  en DECISIONS antes del primer commit de Contacto. Hoy sería, del
  inventario §7: el titular («Hablemos.»), la frase pilar con su parte en
  verde, el cartel del equipo (título y bajada), la foto del equipo con su
  alt, «¿Preferís escribir directo?», los cinco temas (título y detalle; la
  clave de cada tema viaja en `?tema=` y queda en código, como su ícono) y el
  cierre (título, texto y botón). Los rótulos del formulario y lo que diga el
  envío son de la 7. Las fotos de las caras son del equipo (lane 8).
- **Si no:** `features/contacto/` no se toca, la lane cierra sin Contacto y
  lo dice en su `worker_done`; el padre lo asigna después.

## 7. Los componentes que pasan el tope y se tocan, se parten

AGENTS.md §6: un componente por encima de 200 líneas de código (sin
comentarios) se parte cuando se toca la página que lo usa. Esta lane toca
cuatro, y cada uno se parte **antes** de recibir sus props, en su propio
commit, con la receta de `docs/AI_GUIDELINES.md` §2 (el compositor en su
ruta, las piezas en una subcarpeta con su nombre, la coreografía en una
`crear…()` que devuelve su limpieza y la llama el mismo efecto), sin cambiar
qué se ve ni cómo se mueve:

| Componente | Líneas de código hoy |
| --- | --- |
| `investigacion/components/LineasInvestigacion.tsx` | 287 |
| `investigacion/components/CierreInvestigacion.tsx` | 257 |
| `biblioteca/components/MaterialesListado.tsx` | 348 |
| `biblioteca/components/PuenteInvestigacion.tsx` | 285 |

Los demás que se tocan están por debajo (el hero de Investigación, 109; la
lámina, 107; los casos, 121; el hero de Biblioteca, 111).

## 8. Dónde vive el código

```
apps/sitio/src/
├── contenido/paginas.ts                    investigacion y biblioteca: cinco secciones y seo cada una
├── app/(sitio)/investigacion/page.tsx      contenidoDe("investigacion") y generateMetadata
├── app/(sitio)/biblioteca/page.tsx         contenidoDe("biblioteca") y generateMetadata
├── features/investigacion/
│   ├── contenido/                          hero, lineas, ciclo, en-accion, cierre, seo (.ts);
│   │                                       comunes.ts con el campo de una parte resaltada
│   ├── components/                         leen por props; estaciones.ts se borra,
│   │   ├── lineas-investigacion/           constelacion.ts queda con la geometría
│   │   └── cierre-investigacion/           las piezas de los dos que se parten
│   └── casos/CasosInvestigacion.tsx        recibe su título
└── features/biblioteca/
    ├── contenido/                          hero, destacados, catalogo, puente, cierre, seo (.ts)
    └── components/                         leen por props
        ├── materiales-listado/             las piezas de los dos que se parten
        └── puente-investigacion/
```

Las cuatro fronteras siguen: `lib/contenido/` no cambia; `app/` son rutas;
`features/` recibe props, y **un componente cliente importa de
`features/*/contenido/` solo tipos** (DECISIONS de la 4a: un valor de ahí
mete Zod en el JS de la página; lo vigila comparar-render en los bytes).
Nada en `datos/`, `admin/` ni `prisma/`: el editor, las pestañas, las
versiones y el SEO son los de la 4a, y una página nueva los hereda con su
línea en el registro. **No hay UI nueva del admin, así que DESIGN.md no se
toca.**

## 9. Docs

- **README «Editar las páginas»:** Investigación y Biblioteca enteras (y
  Contacto, si entra).
- **AGENTS.md** (lo revisa Mateo en el PR): §6, la cuenta de componentes por
  encima de 200 medida otra vez —`MaterialesListado.tsx`, que el párrafo
  nombra, y los otros tres salen—; §13, la línea de esta fase.

## 10. Pruebas

- **Unitarias** (`pnpm test`): el test del registro
  (`contenido/paginas.test.ts`) ya recorre cada parte de cada página —pasa su
  esquema con su inicial y su formulario se puede dibujar—, así que cubre
  cada sección nueva y cada `seo` sin tocarlo.
- **Render:** `node scripts/comparar-render.mjs <antes> apps/sitio` contra un
  build de referencia de `main`, idéntico después de cada sección y de cada
  partición; en los dos commits del SEO, la diferencia de §5 y nada más.
- **En el navegador** (Orca, `localhost:3023`): de cada página, editar un
  campo de cada sección, guardar, «Qué cambió», vista previa, publicar y
  verlo en el sitio; una versión y restaurarla; la pestaña SEO con su vista
  previa y el `<title>`; un resaltado sin cerrar marcado en su campo. El
  editor de las dos páginas en los tres temas, a 390 de ancho y con teclado.
  Y el sitio de los cuatro que se parten, igual que antes: la carpeta de
  Líneas, el ascenso del cierre, los filtros del catálogo (con `?tipo=` y
  «Ver más») y la pila del puente, con y sin `prefers-reduced-motion`.
- **El gate** (typecheck, lint, react-doctor 100/100, test y build) antes
  del PR, con la salida en PROGRESS.

## 11. Fuera de alcance

- Qué hacemos y Quiénes somos (4b); Novedades y sus textos (lane 6).
- Los casos, los materiales y el equipo como entidades (lanes 8 y 9):
  `features/biblioteca/data/` y `features/investigacion/data/casos.ts` no se
  tocan.
- Cambiar geometría o animaciones. Los dos `scrub: true` que quedan en estas
  páginas (la carpeta de Líneas y la entrada del cierre de Biblioteca, un
  anti-patrón de AGENTS.md §8) se mudan tal cual al partir y quedan anotados
  para después.
- Los destinos de los botones y el cruce línea → caso (§4).
