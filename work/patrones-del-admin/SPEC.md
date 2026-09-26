# SPEC — Los patrones del admin

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con un cambio: las pestañas
  no llevan número en esta lane (DECISIONS.md)
- **Aprueba:** el padre (`work/mapa-del-admin/`): esta lane no crea tablas, no
  migra y no suma dependencias.
- **Tier:** L · lane 1 de 12 del XL `work/mapa-del-admin/` (SPEC §5.3, §6, §7,
  §9) · rama `mateo/patrones-del-admin` · dev server en el puerto 3011 · base
  `ed` compartida.
- **Diseño:** el brief del padre. Este SPEC lo formaliza y deja escritas las
  lecturas que el brief no cerraba (§9), para que el padre las vea antes del
  PLAN.

---

## 1. Qué se quiere

El admin pasa a ser una consola de ocho módulos. Antes de que las lanes
siguientes construyan Métricas, Cuentas o Novedades, esta lane estrena los
patrones que todos van a repetir, **cada uno con su primer consumidor real**:
título de pestaña, pestañas, índice de tarjetas, lista y estado vacío. Y cierra
las dos críticas visuales que quedaron del rework: la lista de páginas y las
pantallas de acceso.

Las piezas que no saben de ED van a `apps/sitio/src/admin/armazon/`; lo que sí
sabe (qué pestañas tiene Contenido, qué dicen sus tarjetas) queda en su
consumidor.

## 2. Qué se entrega

### 2.1. Título de pestaña

- El layout raíz del admin (`app/(admin)/layout.tsx`) declara
  `title: { template: "%s · Admin ED", default: "Admin ED" }`. Cubre a las
  pantallas de acceso y a las protegidas: no hace falta repetirlo en el layout
  protegido.
- Cada pantalla da solo su nombre:

  | Ruta | Título |
  | --- | --- |
  | `/admin` | Inicio · Admin ED |
  | `/admin/contenido` | Contenido · Admin ED |
  | `/admin/contenido/paginas` | Páginas · Admin ED |
  | `/admin/contenido/paginas/inicio` | Inicio · Páginas · Admin ED |
  | `/admin/contenido/casos` (y equipo, aliados, fotos) | Casos · Admin ED |
  | `/admin/novedades` (y cada guía de módulo) | Novedades · Admin ED |
  | `/admin/entrar` · `/olvide-mi-contrasena` · `/nueva-contrasena` | Entrar · Olvidé mi contraseña · Nueva contraseña, con el template |

- El editor suma «· Páginas» porque tres páginas del sitio se llaman como un
  módulo (Inicio, Biblioteca, Novedades): «Inicio · Admin ED» sería ambiguo.
  Las demás pantallas no repiten a su padre.

### 2.2. Pestañas

- Links, **no** el patrón ARIA de tabs, porque navegan: un `nav` con
  `aria-label`, una lista de links y la activa con `aria-current="page"`.
- **La activa sale de la ruta** (`usePathname`, como la sidebar): se enciende
  la pestaña cuya `href` es la ruta o un prefijo de ella. Así un layout de
  módulo puede ponerlas sin que cada página diga cuál es.
- **Sin número.** El número de una pestaña llega con su primer consumidor
  real, Mensajes (lane 7), que lo suma y lo escribe en §11 (DECISIONS.md).
- Van **debajo del encabezado**, pegadas a su divisor inferior.
- Primer consumidor: **Contenido**, con Páginas · Casos · Equipo · Aliados ·
  Fotos en cada una de esas cinco pantallas.

### 2.3. Índice de tarjetas

- Una grilla de tarjetas; **cada tarjeta entera es el link**, con el foco
  visible sobre la tarjeta entera. Adentro: el nombre (que es el nombre
  accesible del link), qué es en una línea y su estado.
- Primer consumidor: **`/admin/contenido`**, con las cinco del SPEC padre
  §5.3. Páginas con datos reales («7 páginas · 2 con cambios sin publicar»,
  de `listaDePaginas()`); Casos, Equipo, Aliados y Fotos con la insignia
  apagada «Por hacer», y cada una lleva a su pestaña. Ajustes lo reusa en la
  lane 10.

### 2.4. Lista

- Filas con lo principal, una línea de detalle, insignias y la acción a la
  derecha. Una fila puede ir **atenuada** (sin acción, con una nota en su
  lugar) y puede **desplegar** contenido debajo, con un `details`/`summary`
  (sin JavaScript, anunciado como botón).
- Primer consumidor: **la lista de Páginas** del SPEC padre §5.3: las siete en
  el orden del menú del sitio, cada una con
  - su insignia (Sin editar · Borrador sin publicar · Publicada), la misma que
    el editor (`admin/paginas/estado.ts`);
  - quién la tocó por última vez y cuándo, con la misma frase del encabezado
    del editor («Borrador guardado hace 3 días por Ana.» · «Publicada el 21/9
    a las 14:05 por Ana.» · «El sitio muestra el contenido inicial del
    código.»), que pasa a ser una pieza compartida;
  - «Editar», que lleva al editor;
  - sus secciones desplegables, cada una directo a
    `/admin/contenido/paginas/<slug>#seccion-<clave>`.
  - La que no tiene secciones va atenuada, con «Todavía no se edita desde acá»
    en el lugar de la acción.
- **La guía de un módulo por hacer** también pasa a esta Lista.

### 2.5. Estado vacío

- Título y una frase que dice qué hacer.
- Primer consumidor: los tres estados de `admin/metricas/` (hoy
  `admin/metricas/Estado.tsx`, que se borra). Ninguno de los tres tiene acción:
  «Actualizar ahora» ya está en la cabecera del panel. **La acción principal
  llega con su primer consumidor**, la lane 6 («Todavía no hay novedades.
  [Nueva novedad]»), por la misma regla que el número de las pestañas
  (DECISIONS.md).

### 2.6. Páginas se muda a Contenido

| Antes | Después |
| --- | --- |
| `/admin/paginas` | `/admin/contenido/paginas` |
| `/admin/paginas/[slug]` | `/admin/contenido/paginas/[slug]` |
| — (guía del módulo en `[modulo]`) | `/admin/contenido`, el índice |
| — | `/admin/contenido/[pantalla]`: la guía de Casos, Equipo, Aliados y Fotos |

- **308** desde las rutas viejas: `redirects` de `next.config.ts` con
  `permanent: true`, para `/admin/paginas` y `/admin/paginas/:slug`.
- Todos los links internos pasan a la ruta nueva: la lista, las migas del
  editor, la guía y el Inicio.
- `modulos.ts`: Contenido se enciende solo con `contenido`; el segmento
  `paginas` sale.
- **Migas del editor:** Contenido › Páginas › <Página>.
- El límite de error de Páginas (`paginas/error.tsx`) sube a `contenido/`, así
  cubre el índice, las pestañas y el editor.
- `datos/`: las acciones de páginas revalidan el layout protegido entero
  (`/(admin)/admin/(protegido)`), no una ruta de Páginas, así que no cambian.
  `listaDePaginas()` suma lo que la lista nueva necesita (§4).
- **Guías:** `admin/por-hacer/guias.ts` deja de tener la guía del módulo
  Contenido (Contenido ya existe) y suma una guía por pestaña para Casos,
  Equipo, Aliados y Fotos, sacada del SPEC padre §5.3, en un archivo propio de
  la misma carpeta para que cada lane que construya una pestaña borre la suya.

### 2.7. Las pantallas de acceso

`admin/armazon/Pantalla.tsx` y los `page.tsx` de `entrar`,
`olvide-mi-contrasena` y `nueva-contrasena`. Las críticas: el panel azul tiene
mucho vacío y «Admin del sitio» queda chico.

- Es el único momento de marca del admin: el panel se compone con la marca de
  DESIGN.md — la grilla de puntos y **una** forma plana (§6), el logo negativo
  con sus reglas de tamaño y margen (§10) y el faro como metáfora, sin exagerar
  (§9) —, con `frontend-design`, solo tokens.
- «Admin del sitio» crece hasta ocupar su lugar en la composición. Si la
  composición pide un tamaño por encima de los cuatro del admin, es **solo en
  el panel de la marca**, sale de la escala del sitio (§2) y queda escrito en
  §11 como la única excepción.
- Funciona en el celular (390 de ancho): el panel es una franja arriba, con el
  logo a 120 px como mínimo (§10).
- Los formularios (`Formulario*.tsx`) no se tocan: si lo visual necesitara
  cambiar uno, se pregunta antes.

### 2.8. DESIGN.md §11 y el README

- **DESIGN.md §11:** cada patrón nuevo — título de pestaña, pestañas, índice de
  tarjetas, lista, estado vacío y la pantalla de acceso nueva — con su regla y
  sus contrastes medidos (WCAG 2.x) en los tres temas, siguiendo
  `designing-consistently`. Lo revisa Mateo en el PR (DECISIONS del padre).
- **README:** «Editar las páginas» nombra la ruta nueva
  (`/admin/contenido/paginas`).

## 3. Rutas, al terminar

```
/admin/contenido                    índice de 5 tarjetas            nueva
/admin/contenido/paginas            lista de las 7 páginas          mudada (308 desde /admin/paginas)
/admin/contenido/paginas/[slug]     editor                          mudada (308 desde /admin/paginas/[slug])
/admin/contenido/[pantalla]         guía de casos · equipo · aliados · fotos   nueva, hasta que cada lane la construya
/admin/[modulo]                     guía de los demás módulos       sigue igual, sin «contenido»
```

## 4. Datos

- **Sin tablas, sin columnas, sin migraciones.** La base `ed` compartida.
- `listaDePaginas()` (`datos/consultas/editor-de-paginas.ts`) devuelve, por
  página, el mismo `estado` que `paginaParaEditar()` (borrador y publicación,
  con quién y cuándo) y sus secciones (`clave`, `nombre`), en vez de solo
  `sinPublicar` y la publicación. La sidebar lee el punto de ahí.

## 5. No es de esta lane

El buscador (lane 6); «Sin permiso» y «← volver» (lane 3, con la guarda y el
primer detalle); el número de la sidebar (lane 7; el punto de Contenido ya
existe); el Inicio nuevo (lane 3); las secciones, el SEO, «ver qué cambió» y las
versiones de las páginas (lane 4). El mapa de URLs del spec del admin
(`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` §5) queda como
está: el SPEC padre §4 lo reemplaza y el cierre del XL lo pone al día.

## 6. Archivos que no se tocan

Los tiene la lane 2 (`seguridad-del-acceso`) en vuelo: los `Formulario*.tsx`
de las pantallas de acceso, `packages/auth/`, `middleware.ts`,
`datos/auth.ts` y `prisma/`. `work/mapa-del-admin/` es un anchor congelado.

## 7. Meta-docs que cambian

- **DESIGN.md §11**, con los patrones de §2.8 (AGENTS.md §5.6: lo revisa Mateo
  en el PR, antes de su OK al merge).
- **README.md**, la ruta de Páginas.
- AGENTS.md y CLAUDE.md no cambian.

## 8. Criterio de hecho

- El gate, con la salida en `PROGRESS.md`: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100 sin diagnósticos),
  `pnpm test` y `pnpm build`. Componentes ≤ 200 líneas, utilidades ≤ 100.
- `/admin/paginas` y `/admin/paginas/inicio` contestan **308** con `Location`
  en `/admin/contenido/paginas` y `/admin/contenido/paginas/inicio`.
- Capturas de Contenido, la lista de Páginas, el editor y las tres de acceso,
  a escritorio y a 390 de ancho; las del admin con sesión, en los tres temas.
- El foco se ve con teclado en pestañas, tarjetas y filas (el «Editar» y el
  desplegable de secciones).
- El título de cada pantalla del §2.1, leído del navegador.
- Ningún contraste nuevo sin medir: cada uno escrito en §11.

## 9. Lecturas que el brief no cerraba

Escritas acá para que el padre las corrija antes del PLAN si no son las suyas.

1. **El `h1` de una pantalla con pestañas es el módulo**, y la pestaña dice en
   qué pantalla estás: `/admin/contenido/paginas` abre con «Contenido» y la
   pestaña Páginas encendida. Es lo que repiten Novedades (Borradores ·
   Publicadas), Mensajes, Métricas y Cuentas, con las acciones de cada
   pantalla en el mismo encabezado. El título de la pestaña del navegador sí
   dice la pantalla («Páginas · Admin ED»).
2. **Las pestañas van en las cinco pantallas de Contenido, no en el índice ni
   en el editor.** El índice ya son las cinco, en tarjetas; el editor es el
   tercer nivel y lo ubican sus migas (SPEC padre §6: «Migas solo en el
   editor»), con su encabezado fijo.
3. **Las pestañas no llevan número en esta lane** (cambiado por el padre al
   aprobar: construirlo sin consumidor es código muerto). §11 lo dice en una
   línea: «el número de una pestaña llega con Mensajes».
4. **Las pantallas de acceso no llevan tema** (DESIGN.md §11: «Solo el admin
   con sesión lleva tema»): sus capturas van en su único tema, a escritorio y
   a 390; las del admin con sesión, en los tres.
5. **El estado vacío se estrena sin acción** (§2.5): ninguno de los tres de
   Métricas la tiene, y la lane 6 la suma con «Nueva novedad».
