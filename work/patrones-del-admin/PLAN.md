# PLAN — Los patrones del admin

SPEC aprobado por el padre el 2026-09-26, con un cambio (DECISIONS.md). Lo
ejecuta work-run en este worktree; cada paso es un commit.

## Constraints

- **Las piezas de `admin/armazon/` no saben de ED**: reciben textos, links y
  estados por props. Lo que sabe de Contenido o de las páginas queda en su
  consumidor (`admin/contenido/`, `admin/paginas/`, `app/`).
- **DESIGN.md §11 manda en toda UI:** solo tokens, cuatro tamaños de tipo, un
  primario por pantalla, sin verde ni naranja fuera de su regla. Cada color
  nuevo se mide (WCAG 2.x) en los tres temas antes del paso 10.
- **No se tocan** los `Formulario*.tsx` de acceso, `packages/auth/`,
  `middleware.ts`, `datos/auth.ts`, `prisma/` ni `work/mapa-del-admin/`.
- **Sin prop sin consumidor:** ni número en las pestañas ni acción en el estado
  vacío (DECISIONS.md).
- Componentes ≤ 200 líneas, utilidades ≤ 100; copy en voseo e inclusivo.
- Acceptance del navegador: el embebido de Orca contra
  `http://localhost:3011` (nunca `127.0.0.1`), con sesión.

## Pasos

1. **`listaDePaginas()` trae el estado y las secciones.** En
   `datos/consultas/editor-de-paginas.ts`: un tipo `EstadoDePagina`
   (`borradorEn`, `borradorPor`, `publicadoEn`, `publicadoPor`) compartido con
   `PaginaParaEditar`, y `FilaDeLista = { slug, nombre, ruta, estado:
   EstadoDePagina, secciones: { clave, nombre }[] }`. `BarraLateral` lee el
   punto de `estado.borradorEn`; `ListaDePaginas` sigue igual por fuera.
   Acceptance: `pnpm typecheck` y `pnpm test` salen 0. *(integration · medium)*

2. **Páginas se muda a `/admin/contenido/paginas`.** Las rutas `paginas/` y
   `paginas/[slug]/` pasan a `contenido/paginas/`, el `error.tsx` sube a
   `contenido/`, `next.config.ts` suma los dos `redirects` con `permanent:
   true`, `modulos.ts` saca `paginas` de los segmentos, y los links pasan a la
   ruta nueva: la lista, el Inicio, la guía (`hoy`) y las migas del editor
   (Contenido › Páginas › <Página>). `/admin/contenido` sigue mostrando la
   guía por `[modulo]` hasta el paso 4. Acceptance: `pnpm typecheck` sale 0;
   `curl.exe -s -o NUL -w "%{http_code} %{redirect_url}"` contra
   `/admin/paginas` y `/admin/paginas/inicio` da `308` hacia
   `/admin/contenido/paginas` y `/admin/contenido/paginas/inicio`; el editor
   abre en la ruta nueva. *(integration · high)*

3. **Título de pestaña.** El layout raíz del admin declara `title: { template:
   "%s · Admin ED", default: "Admin ED" }`; las tres de acceso pasan a
   «Entrar», «Olvidé mi contraseña» y «Nueva contraseña»; el Inicio,
   «Páginas», el editor (`generateMetadata`: «<Página> · Páginas») y cada guía
   (`generateMetadata` con `guia.nombre`) dan su nombre. Acceptance: `pnpm
   typecheck` sale 0; `document.title` leído con `orca eval` da los títulos
   del SPEC §2.1 en `/admin/entrar`, `/admin`, `/admin/contenido/paginas`,
   `/admin/contenido/paginas/inicio` y `/admin/novedades`. *(mechanical · low)*

4. **El índice de tarjetas, en `/admin/contenido`.**
   `admin/armazon/IndiceDeTarjetas.tsx` (cada tarjeta entera es el link:
   `{ href, nombre, que, estado: ReactNode }[]`, foco en la tarjeta entera) y
   `app/…/contenido/page.tsx` con las cinco del SPEC padre §5.3: Páginas con
   el resumen de `listaDePaginas()` («7 páginas · 2 con cambios sin
   publicar», un helper puro con su test), las otras cuatro con la insignia
   apagada «Por hacer». La guía del módulo Contenido sale de
   `por-hacer/guias.ts`; título «Contenido». Acceptance: `pnpm typecheck` y
   `pnpm test` salen 0; `/admin/contenido` muestra las cinco tarjetas y
   `/admin/contenido/casos` todavía da 404 (llega en el paso 5).
   *(judgment · high)*

5. **Pestañas, en las cinco pantallas de Contenido.**
   `admin/armazon/Pestanas.tsx` (cliente por `usePathname`; `{ etiqueta,
   pestanas: { href, etiqueta }[] }`; links con `aria-current="page"` en la
   activa, que es la de `href` igual a la ruta o prefijo de ella, con un
   helper puro y su test), un slot `pestanas` en `Encabezado` que las pega a
   su divisor inferior, y `admin/contenido/EncabezadoDeContenido.tsx` (el `h1`
   «Contenido» con las cinco pestañas), que usan la lista de Páginas y
   `app/…/contenido/[pantalla]/page.tsx`. Esa ruta muestra la guía de Casos,
   Equipo, Aliados o Fotos desde `por-hacer/guias-de-contenido.ts` (sacadas
   del SPEC padre §5.3; `notFound()` para otra clave), con su título.
   Acceptance: `pnpm typecheck` y `pnpm test` salen 0; en
   `/admin/contenido/paginas` y `/admin/contenido/fotos` la pestaña correcta
   lleva `aria-current="page"` (`orca snapshot`), y `/admin/contenido/otra`
   da 404. *(judgment · high)*

6. **La lista, en Páginas.** `admin/armazon/Lista.tsx` (filas con principal,
   detalle, insignias y acción a la derecha; `atenuada` con una nota en el
   lugar de la acción; `desplegable` con `details`/`summary`), la frase de
   «quién y cuándo» del encabezado del editor sacada a
   `admin/paginas/Cuando.tsx` y compartida, y `ListaDePaginas` reescrita: las
   siete en el orden del menú con su insignia (`insigniaDelEstado`), quién y
   cuándo, «Editar», y las secciones desplegables hacia
   `/admin/contenido/paginas/<slug>#seccion-<clave>`; la que no tiene
   secciones, atenuada con «Todavía no se edita desde acá». Acceptance: `pnpm
   typecheck` y `pnpm lint` salen 0; en `/admin/contenido/paginas` el
   desplegable de Inicio lleva a `…/paginas/inicio#seccion-hero` y la sección
   queda a la vista; Qué hacemos va atenuada. *(judgment · high)*

7. **La guía de un módulo pasa a la Lista.** `GuiaDelModulo` (y la de las
   pestañas de Contenido) dibuja sus pantallas con `Lista` en vez de su `ul`
   propio. Acceptance: `pnpm typecheck` sale 0; `/admin/novedades` y
   `/admin/contenido/casos` muestran sus pantallas con la Lista.
   *(mechanical · low)*

8. **El estado vacío, en Métricas.** `admin/armazon/EstadoVacio.tsx`
   (`{ titulo, texto }`, sin acción) reemplaza a `admin/metricas/Estado.tsx`,
   que se borra, en los tres estados de `PanelMetricas`. Acceptance: `pnpm
   typecheck` sale 0; `rg "metricas/Estado"` no encuentra nada; el Inicio
   muestra el estado vacío que corresponde a la base local.
   *(mechanical · low)*

9. **Las pantallas de acceso, con la marca.** `admin/armazon/Pantalla.tsx` (y
   lo que haga falta en los tres `page.tsx`) recompuesto con
   `frontend-design`: grilla de puntos y una forma plana (§6), logo negativo
   con sus reglas (§10), el faro sin exagerar (§9), «Admin del sitio» a la
   escala que pida la composición (si pasa los cuatro del admin, de la escala
   del sitio y solo en el panel). Sin tocar los `Formulario*.tsx`.
   Acceptance: `pnpm typecheck` y `pnpm lint` salen 0; capturas de las tres a
   escritorio y a 390 sin desborde horizontal
   (`document.documentElement.scrollWidth <= 390`). *(judgment · medium)*

10. **DESIGN.md §11 y el README.** §11 suma título de pestaña, pestañas (con
    «el número de una pestaña llega con Mensajes»), índice de tarjetas, lista,
    estado vacío (con «la acción llega con Novedades») y la pantalla de acceso
    (con la excepción de tipo si el paso 9 la usó), cada uno con su regla y
    sus contrastes medidos en los tres temas; el README nombra
    `/admin/contenido/paginas` en «Editar las páginas». Acceptance: `rg -n
    "admin/paginas" README.md apps/sitio/src` no encuentra nada; cada color
    nuevo de los pasos 4–9 tiene su contraste escrito en §11.
    *(judgment · high)*
