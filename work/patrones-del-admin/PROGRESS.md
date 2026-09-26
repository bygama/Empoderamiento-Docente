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
| 4 | El índice de tarjetas, en `/admin/contenido` | hecho |
| 5 | Pestañas, en las cinco pantallas de Contenido | pendiente |
| 6 | La lista, en Páginas | pendiente |
| 7 | La guía de un módulo pasa a la Lista | pendiente |
| 8 | El estado vacío, en Métricas | pendiente |
| 9 | Las pantallas de acceso, con la marca | pendiente |
| 10 | DESIGN.md §11 y el README | pendiente |

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
  la tarjeta entera.
