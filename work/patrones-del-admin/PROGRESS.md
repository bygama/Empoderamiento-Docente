# PROGRESS — Los patrones del admin

## In progress

- 2026-09-26 — SPEC.md escrito desde el brief del padre (lane 1 del XL
  `work/mapa-del-admin/`) y aprobado por el padre con un cambio: sin número en
  las pestañas (DECISIONS.md). PLAN.md escrito: 10 pasos.

## Pasos

| # | Paso | Estado |
| --- | --- | --- |
| 1 | `listaDePaginas()` trae el estado y las secciones | hecho, `cb6fc19` |
| 2 | Páginas se muda a `/admin/contenido/paginas` | hecho, `5e6eabf` |
| 3 | Título de pestaña | hecho, `e8a280a` |
| 4 | El índice de tarjetas, en `/admin/contenido` | hecho, `c00384f` |
| 5 | Pestañas, en las cinco pantallas de Contenido | hecho, `7d17737` |
| 6 | La lista, en Páginas | hecho, `7c8dde8` |
| 7 | La guía de un módulo pasa a la Lista | hecho, `cc7ae4b` |
| 8 | El estado vacío, en Métricas | hecho, `9935903` |
| 9 | Las pantallas de acceso, con la marca | hecho, `95e00b7` |
| 10 | DESIGN.md §11 y el README | hecho |

## Registro

- **Paso 1** — `datos/consultas/editor-de-paginas.ts`: `EstadoDePagina`
  (compartido con `PaginaParaEditar`, armado por `estadoDe`) y `FilaDeLista =
  { slug, nombre, ruta, estado, secciones }`; `BarraLateral` lee el punto de
  `estado.borradorEn`, `ListaDePaginas` y `estado.ts` leen la forma nueva.
  `pnpm typecheck` → exit 0; `pnpm test` → exit 0 (75 tests, 74 pass, 1
  skipped de antes). Commit `cb6fc19`.
- **Paso 2** — `contenido/paginas/page.tsx` y `contenido/paginas/[slug]/page.tsx`
  movidos con `git mv`; `error.tsx` sube a `contenido/` (`ErrorDeContenido`);
  `next.config.ts` con los dos `redirects` `permanent: true`; `modulos.ts`
  sin `paginas`; links nuevos en `ListaDePaginas`, el Inicio y la guía; migas
  del editor Contenido / Páginas. `pnpm --filter sitio typecheck` → exit 0.
  `curl.exe` → `308 http://localhost:3011/admin/contenido/paginas` y
  `308 http://localhost:3011/admin/contenido/paginas/inicio`. Con sesión
  (`orca snapshot`): el editor abre en la ruta nueva con `navigation "Estás
  en"` → Contenido, Páginas; `/admin/contenido` sigue mostrando la guía por
  `[modulo]`.
  - Nota: `git mv` de la carpeta entera falla con «Permission denied»
    mientras el dev server la mira; se mueve archivo por archivo.
  Commit `5e6eabf`.
- **Paso 3** — `(admin)/layout.tsx` con `title: { template: "%s · Admin ED",
  default: "Admin ED" }`; las tres de acceso dan solo su nombre; `metadata`
  en el Inicio y en Páginas; `generateMetadata` en el editor («<Página> ·
  Páginas») y en `[modulo]` (`guia.nombre`). `pnpm --filter sitio typecheck`
  → exit 0. `document.title` (`orca eval`, con sesión): `/admin` → «Inicio ·
  Admin ED», `/admin/contenido/paginas` → «Páginas · Admin ED»,
  `/admin/contenido/paginas/inicio` → «Inicio · Páginas · Admin ED»,
  `/admin/novedades` → «Novedades · Admin ED», `/admin/contenido` →
  «Contenido · Admin ED». `<title>` por `curl.exe`: «Entrar · Admin ED»,
  «Olvidé mi contraseña · Admin ED», «Nueva contraseña · Admin ED».
  Commit `e8a280a`.
- **Paso 4** — `admin/armazon/IndiceDeTarjetas.tsx` (el link es el nombre y
  su `::after` cubre la tarjeta; lo demás va como `aria-describedby`; el foco
  con `has-[a:focus-visible]` en el `li`), `admin/contenido/pantallas.ts` (las
  cinco pantallas, una lista para pestañas y tarjetas), `IndiceDeContenido`,
  `admin/paginas/resumen.ts` con su test, y `contenido/page.tsx`. La guía del
  módulo Contenido sale de `guias.ts`. `pnpm --filter sitio typecheck` → exit
  0; `pnpm --filter sitio test` → exit 0 (78 tests, 77 pass, 1 skipped). En
  `/admin/contenido` (`orca snapshot` + captura): cinco tarjetas, links
  «Páginas» y «Casos» con su nombre solo; Páginas dice «7 páginas» (la base
  `ed` no tiene borradores hoy) y las otras cuatro «Por hacer»; con Tab desde
  el `h1`, el foco cae en «Páginas» (`:focus-visible` true) y el anillo rodea
  la tarjeta entera. Commit `c00384f`.
- **Paso 5** — `admin/armazon/Pestanas.tsx` (cliente por `usePathname`;
  `nav` + lista de links, la activa con `aria-current="page"` y una barra de
  2 px; foco por dentro para que no lo corte el scroll horizontal),
  `admin/armazon/ruta.ts` (`estaEn`) con su test, el slot `pestanas` de
  `Encabezado` (fila propia, `-mb-3` para quedar sobre el divisor),
  `admin/contenido/EncabezadoDeContenido.tsx`, la lista de Páginas con ese
  encabezado, `por-hacer/guias-de-contenido.ts` (Casos, Equipo, Aliados, Fotos;
  nombre y «qué es» salen de `pantallas.ts`), `por-hacer/GuiaDeContenido.tsx`,
  `LoQueVaATener` exportado de `GuiaDelModulo`, y `contenido/[pantalla]/page.tsx`
  con `generateMetadata`. `pnpm --filter sitio typecheck` → exit 0; `pnpm
  --filter sitio test` → exit 0 (80 tests, 79 pass, 1 skipped). Con sesión:
  en `/admin/contenido/paginas` las pestañas dan `Páginas:page Casos:-
  Equipo:- Aliados:- Fotos:-`, en `/admin/contenido/fotos` `… Fotos:page`;
  `/admin/contenido/otra` → «404: This page could not be found.» El texto de
  la primera pestaña queda alineado con el `h1` (x = 440 los dos). Commit
  `7d17737`.
- **Paso 6** — `admin/armazon/Lista.tsx` (`Lista` + `Fila`: principal,
  detalle, insignias, acción; `atenuada` con su nota; `desplegable` con
  `details`/`summary`), `admin/paginas/Cuando.tsx` (sacado del encabezado del
  editor, que ahora lo importa) y `ListaDePaginas` reescrita: insignia de
  `insigniaDelEstado`, «quién y cuándo», «Editar» (secundario, con el nombre
  de la página para el lector) y «1 sección» desplegable con links a
  `…/paginas/<slug>#seccion-<clave>`; las seis sin secciones, atenuadas con
  «Todavía no se edita desde acá» y sin insignia (DECISIONS.md). `pnpm
  --filter sitio typecheck` → exit 0; `pnpm --filter sitio lint` → exit 0.
  Con sesión: clic en «Hero» → `/admin/contenido/paginas/inicio#seccion-hero`,
  la sección a 112 px del borde (debajo del encabezado fijo), título «Inicio ·
  Páginas · Admin ED». Commit `7c8dde8`.
- **Paso 7** — `LoQueVaATener` (`por-hacer/GuiaDelModulo.tsx`) dibuja sus
  pantallas con `Lista`/`Fila`: nombre y ruta como principal, «qué» como
  detalle, «Por hacer» como insignia o el link de hoy como acción
  (`BotonEnlace` secundario). `pnpm --filter sitio typecheck` → exit 0. Con
  sesión: `/admin/metricas` lista sus cinco pantallas (Resumen con «Hoy, en el
  Inicio», las otras «Por hacer») y `/admin/contenido/casos` sus dos, con la
  pestaña Casos encendida. Commit `cc7ae4b`.
- **Paso 8** — `admin/armazon/EstadoVacio.tsx` (`{ titulo, texto }`, sin
  acción: DECISIONS.md) reemplaza a `admin/metricas/Estado.tsx` (borrado con
  `git rm`) en los tres estados de `PanelMetricas`. `pnpm --filter sitio
  typecheck` → exit 0; la búsqueda de `metricas/Estado`, `<Estado ` y
  `./Estado` en `apps/sitio/src` no encuentra nada. Con sesión, el Inicio
  muestra «Faltan las variables de Vercel» (la base local no tiene el token)
  con el borde punteado. Commit `9935903`.
- **Paso 9** — `admin/armazon/Pantalla.tsx` recompuesto con
  `frontend-design`: grilla de puntos (`--dots-alpha` 0,08) en todo el panel,
  el **haz del faro** —una segunda capa de puntos (0,34) recortada por una cuña
  cónica que sale de la lámpara del logo (110 × 70 px) y baja hacia el
  formulario, apagada por un círculo de 250 px alrededor de la lámpara para
  respetar el margen de seguridad del logo— solo desde `lg`, «Admin del
  sitio» en blanco a `text-h1` del sitio (48 px, en dos líneas) abajo a la
  izquierda, y un círculo `azul-medio` de 256 px que sale de la esquina de
  abajo. En el celular: franja con puntos, logo a 144 px y «Admin del sitio»
  en `text-admin-seccion` negrita blanca; el formulario va arriba. Los `page.tsx`
  de acceso no cambian en este paso (su título ya se tocó en el paso 3) y los
  `Formulario*.tsx` no se tocan. Iteraciones mirando capturas: el haz
  horizontal se leía como una franja → en diagonal hacia el formulario; el
  corte recto → arco centrado en la lámpara; a 1024 el círculo de 320 px
  rozaba el título → 256 px. `pnpm --filter sitio typecheck` → exit 0; `pnpm
  --filter sitio lint` → exit 0. A 390 × 844 (`orca exec "set viewport"`):
  `scrollWidth` 390 en `entrar`, `olvide-mi-contrasena` y `nueva-contrasena`.
  Capturas a 1568 × 921, 1024 × 768 y 390 × 844. Commit `95e00b7`.
- **Paso 10** — DESIGN.md §11: la fecha de lo sumado y la nota «mixto = claro
  en el contenido», la excepción de tipo en «Tipo», las migas en «Encabezado de
  página», y seis secciones nuevas: Título de pestaña, Pestañas (con «el
  número de una pestaña llega con Mensajes»), Índice de tarjetas, Lista,
  Estado vacío (con «la acción principal llega con Novedades») y Pantalla de
  acceso. README: «Editar las páginas» nombra `/admin/contenido/paginas`.
  Contrastes medidos con un script descartable (fórmula WCAG 2.x):
  `azul-principal` 13,63 (claro) · 13,59 (oscuro); `gris-texto` 4,83 · 7,08;
  `azul-medio` 5,11 · 7,14; `azul-claro` 1,77 · 1,71 (solo bordes
  decorativos); acceso: blanco sobre `azul-principal` 13,63, sobre un punto al
  8 % 10,66, sobre el haz al 34 % 4,68 (no hay texto ahí), sobre
  `azul-medio` 5,11. La búsqueda de `/admin/paginas` como ruta en `README.md`
  y `apps/sitio/src` no encuentra nada (los `@/admin/paginas/…` que quedan son
  imports de la carpeta de componentes). Capturas de Contenido, Páginas y el
  editor en claro, mixto y oscuro, a 1568 y a 390: sin desborde
  (`scrollWidth` 1568 y 375 —la barra vertical— contra `innerWidth` 1568 y
  390); a 390 las cinco pestañas entran sin scroll (`nav` 366 / 366).
