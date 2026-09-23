# SPEC — El editor sin pared: tokens, piezas y el editor de páginas

- **Fecha:** 2026-09-22
- **Estado:** aprobado por Mateo el 2026-09-22 (el diseño, en conversación:
  shaping, secciones 1 a 5; después, este SPEC)
- **Decide:** Mateo
- **Tier:** L · rama `mateo/rework-visual-admin`, en el worktree de Orca
  `rework-visual-admin`, apilada sobre el PR #173 (`mateo/armazon-del-admin`).
  Criterio de aislamiento: **horizonte** (la implementación la sigue una
  sesión `pegasuz` en este mismo worktree, no la que escribió esto) y
  **checkout ocupado** (el principal está en `mateo/armazon-del-admin`).
- **Lane 1 de 2 del rework visual.** La lane 2, `armazon-pulido` (sidebar,
  portada, lista de páginas y lo visual del login), se abre cuando esta
  cierre, con las piezas de acá. Su diseño general ya está aprobado; los
  detalles se confirman con mockups al abrirla.

---

## 1. Qué se quiere

Mateo miró el admin del PR #173 y dijo «deja mucho que desear». La prioridad
que eligió: **editar sin perderse**. Quien lo usa es el equipo de ED, no
técnico, unas pocas veces por mes: pesa más la claridad que la velocidad.

La auditoría (capturas a 1440 × 900 y 390 × 844, Playwright, 2026-09-22)
midió esto en el editor de Inicio › Hero:

| Qué | Hoy |
| --- | --- |
| Alto del editor | **12.688 px** a 1440, 13.181 a 390 |
| Lo que ocupan las 19 tarjetas | 11.418 px (90 %), de 526 a 730 px cada una |
| Controles en un solo formulario | 67 |
| Título visible | ninguno (`h1` sr-only) |
| Barra fija a 390 | 159 px (19 % de la pantalla) |
| Borde de los inputs | `azul-claro`: **1,77:1** sobre blanco (WCAG 1.4.11 pide 3:1) |
| Texto secundario | `gris-texto` sobre `gris-fondo`: **4,39:1** (pide 4,5:1) |
| Textos de 12 px (ayudas y contadores) | 57 |
| Botones al entrar | «Guardar borrador» y «Publicar» deshabilitados sin explicación (Publicar, a 1,76:1) |
| Estilos de botón secundario | 3 distintos; ninguno sigue `DESIGN.md` §7 |

## 2. Tokens y reglas del admin (`DESIGN.md` primero)

`DESIGN.md` se edita **antes** que el código (AGENTS.md §5.2). El OK al
diseño cubre el contenido; el diff se le muestra a Mateo con la lista de
commits, como cualquier cambio a un meta-doc (§5.6).

- **`rojo-error` #B42318**, en la tabla de §1 y en el `@theme`: solo errores
  y acciones destructivas, nunca decorativo. 6,57:1 sobre blanco, 5,75:1
  sobre su tinte al 8 %. El naranja queda solo para la acción.
- **Una sección nueva «Admin»** en `DESIGN.md` con:
  - **Fondo blanco** en el contenido del admin. `gris-fondo` queda solo como
    relleno sin texto gris encima (hover, miniatura vacía). Arregla el
    4,39:1 sin tocar `gris-texto`, que también usa el sitio público.
  - **La escala de tipo, cerrada, de 4 tamaños**, como tokens del `@theme`:
    `text-admin-titulo` (1,5 rem, Manrope 700), `text-admin-seccion`
    (1,125 rem, Manrope 700), `text-admin-cuerpo` (1 rem, Inter) y
    `text-admin-meta` (0,875 rem, Inter). Nada más en el admin: se van los
    `text-xs`, `text-xl`, `text-2xl`, `text-3xl` y los
    `font-[family-name:var(--font-manrope)]` (pasan a `font-display`). La
    jerarquía sale de bajar lo secundario: la etiqueta va en meta medium
    `azul-principal`; la ayuda y el contador, en meta regular `gris-texto`
    (4,83:1). El cuerpo va en 16 px para que iOS no haga zoom en los inputs.
  - **Bordes:** los de un control, `gris-texto` (4,83:1, como ya tiene el
    login); los divisores decorativos, `azul-claro/60`.
  - **Insignias de estado, sin verde ni naranja** (conviven con «Publicar»:
    §1, regla 4). La jerarquía sale del contraste y siempre llevan texto:
    - **fuerte**: relleno `azul-principal`, texto blanco (13,63:1);
    - **normal**: borde y punto `azul-medio`, texto `azul-principal`;
    - **apagada**: borde y texto `gris-texto`.
  - **Botones, 4 variantes de 40 px de alto**, texto meta medium:
    - **primario**: `naranja-accion` con texto `azul-principal` (4,54:1;
      5,07:1 en hover), uno solo por pantalla (§7);
    - **secundario**: como §7, borde y texto `azul-principal`, hover
      `azul-claro/30` (11,63:1);
    - **terciario**: sin borde, texto `azul-medio` (5,11:1);
    - **destructivo**: terciario en `rojo-error`.
    Un botón **no se deshabilita para explicar algo**: solo mientras corre
    una acción, y la que corre lo dice («Guardando…», `aria-busy`).
  - **El encabezado de página:** título visible (`h1`), estado, una línea de
    detalle y las acciones, con una sola primaria.
  - **Los avisos:** banner, nunca toast. Error en `rojo-error` con
    `role="alert"`; confirmación en azul con `role="status"`. El verde de
    hoy se va: al lado de «Publicar» rompe la regla 4.

## 3. Las piezas

Van en `admin/armazon/` y no importan nada de ED, así pasan a
`packages/kit-admin` en la fase 2 sin cambios (AGENTS.md §12).

| Pieza | Qué hace |
| --- | --- |
| `Encabezado.tsx` | Migas opcionales, `h1` en `text-admin-titulo`, un espacio para el estado, una línea de detalle en meta `gris-texto`, las acciones a la derecha y un espacio para los avisos. Con `fijo` queda `sticky`. |
| `Boton.tsx` | Las 4 variantes, para `<button>` y para `Link` (`BotonEnlace`), con una sola función de clases. |
| `Insignia.tsx` | Una pastilla con `tono` fuerte, normal o apagado, y texto. No sabe de páginas. |
| `Aviso` (en `Campos.tsx`) | Se restila en su lugar: error rojo con el ícono `Alerta`, confirmación azul con `Check`, y un × opcional (`alCerrar`). |
| `ENTRADA` | Una sola clase de caja de texto, en `admin/campos/clases.ts`: borde `gris-texto`, foco `azul-medio`, `aria-invalid` en `rojo-error`. `ENTRADA_DE_ACCESO` desaparece; `Campo` y `CampoContrasena` usan esta. |
| Íconos | `Alerta` y `Subir` en `components/ui/icons/index.tsx`, trazo 1,5 y `currentColor` (`DESIGN.md` §5). |

**Los `Formulario*.tsx` del login no se tocan** (los toma la lane 2 de
seguridad). Por eso `Campos.tsx` conserva sus exportaciones y firmas
(`Campo`, `Boton`, `Aviso`, `ENLACE_DE_ACCESO`): su `Boton` pasa a ser el
primario a todo el ancho armado sobre `Boton.tsx`, y el `Aviso` se restila
ahí mismo. Lo visual del login cambia solo por esas piezas compartidas.

`BOTON_SECUNDARIO` desaparece: sus usos (la barra del editor, `CampoFoto`,
`paginas/error.tsx`) pasan a `Boton`. Los botones sueltos de la portada, la
lista y las métricas se rehacen en la lane 2, con sus pantallas.

## 4. El editor: encabezado, guardado y estado

- **Encabezado fijo (desde `lg`):** `Páginas /` **Inicio** (el `h1`) con la
  insignia del documento. Debajo, el detalle: cuándo y quién publicó o
  guardó el borrador, y «Descartar borrador» (destructivo, solo si hay
  borrador, con el `confirm` de hoy). A la derecha: **[Guardar borrador]
  [Vista previa ↗] [Publicar]**, secundario, secundario y primario. Unos
  96 px.
- **Estado del documento:** borrador → «Borrador sin publicar» (fuerte);
  publicado sin borrador → «Publicada» (normal); ninguno → «Sin editar»
  (apagada). El mapeo vive en `admin/paginas/`.
- **Cambios sin guardar → modo navy:** todo el encabezado pasa a
  `azul-principal` con «Cambios sin guardar» en blanco (13,63:1) y vuelve a
  blanco al guardar. Las insignias y los secundarios se invierten para
  seguir legibles; «Publicar» sigue naranja.
- **Frenar la pérdida:** con cambios sin guardar, `beforeunload` al cerrar o
  recargar, y un `confirm` al tocar un link que sale del editor (la sidebar;
  Next no avisa al navegar adentro). Un link a una sección de la misma
  página no pregunta.
- **Nada deshabilitado para explicar:** «Guardar borrador» sin cambios
  responde con el aviso «No hay cambios para guardar.»; «Publicar» sin nada
  nuevo, con «La página ya está publicada así.». Mientras corre una acción,
  las cuatro esperan, como hoy.
- **Avisos adentro del encabezado:** se ven aunque estés en la última
  tarjeta; se cierran con × y el siguiente reemplaza al anterior.
- **Celular (menos de `lg`):** el título, la insignia y el detalle hacen
  scroll normal. Las acciones y los avisos van en una **barra fija abajo**
  (unos 64 px, 8 % de 844), con el mismo modo navy, respetando el área
  segura del iPhone; el formulario deja lugar abajo para que la barra no
  tape lo último.
- **El `h1` sr-only** de `paginas/[slug]/page.tsx` se va: el título es el
  del encabezado.

## 5. El editor: el cuerpo

- **Menos cajas:** la sección («Hero») deja de ser una tarjeta: título en
  `text-admin-seccion` con un divisor, plegable como hoy (`<details>`, con
  el `id` `seccion-<clave>` que usa la sidebar y su `scroll-margin`
  recalculado). Un grupo que no es raíz pierde el borde del `fieldset`
  (queda su `legend`) y pone sus campos en 2 columnas cuando su propio
  ancho lo permite (`@container`, igual para cualquier grupo: nada por
  campo, AGENTS.md §12). De 2 niveles de caja alrededor de un input a 0.
- **La raíz de la sección también, en 2 columnas** (enmienda de Mateo del
  2026-09-22, en el paso 11: sin esto la grilla de computadora no entraba
  en la primera pantalla): cuando hay lugar, sus campos van de a dos
  (Título | Bajada, Botón principal | Botón secundario) y las listas y los
  párrafos ocupan todo el ancho. Es la misma regla para cualquier sección.
- **Tarjetas (`ListaFija`) en grilla:** una miniatura por ítem con su
  número y un resumen de una línea, en 6 columnas desde `lg` y 3 por
  debajo. Cada ítem es un `<details>` con el `name` de la lista, así se abre
  uno solo a la vez sin JS. El abierto pasa a su propia fila a todo el
  ancho, **sin reordenar** (el orden de lectura y de Tab es el del DOM), y
  adentro va el ítem en 2 columnas cuando hay lugar: la foto a la
  izquierda y el resto a la derecha. Su `summary` pasa a ser la cabecera
  del panel («7 · Sin cartel», con «Cerrar»).
- **El resumen de un ítem** sale de su descripción y su valor, sin nada
  propio del hero: la miniatura es la primera foto del ítem (con su foco);
  el texto, el primer texto corto no vacío o, si no hay, el alt de esa
  foto. Es una función pura en `lib/contenido/`, con tests.
- **El título de la lista lleva la cantidad** («Tarjetas (computadora) ·
  11») y se va el «Son N ítems.» de `ListaFija`, que duplica la ayuda del
  esquema.
- **Foto (`CampoFoto`):** un botón «Cambiar foto…» con el estilo del admin
  (el input nativo queda oculto pero enfocable) y, al elegir, «archivo.jpg
  · [Subir foto] [Cancelar]». Formatos y peso, una vez al lado del botón.
  La ayuda del foco pasa a una línea. Sigue pidiendo el alt antes de subir.
- **Campos de texto:** etiqueta (meta medium) → ayuda (meta `gris-texto`,
  **antes** del campo) → campo (cuerpo). El contador se ve **desde el 80 %**
  del máximo y para el lector de pantalla sigue estando siempre
  (`aria-describedby`). La casilla de «Lleva cartel» toma el color de la
  marca (`accent-*`).
- **Un texto corto con máximo de más de 80** (hoy, la bajada: 140) se ve en
  2 renglones que crecen con el texto, sin permitir saltos de línea (ni
  tecleados ni pegados). Sigue siendo un `textoCorto`: el esquema no cambia.

## 6. Definición de terminado

Medido con Playwright contra el dev server, antes y después, a 1440 × 900 y
390 × 844. Las capturas quedan fuera del repo; los números, en `PROGRESS.md`.

1. **Alto del editor del hero, con todo cerrado: menos de 2.500 px** a 1440 y
   a 390 (hoy 12.688 y 13.181).
2. **Cualquier tarjeta a 1 clic desde arriba del editor a 1440**, sin scroll
   (la grilla de computadora entra en la primera pantalla).
3. **El editor tiene título visible, estado y una sola acción primaria.**
   La barra fija del celular mide 72 px o menos.
4. **0 pares por debajo de AA** en el admin (texto 4,5:1; controles y texto
   grande 3:1), medidos con la fórmula de WCAG; cada par nuevo, anotado.
5. **Teclado y lector de pantalla, con Playwright:** abrir y cerrar una
   tarjeta con Enter; el orden de Tab sigue al DOM; el foco de la foto
   con flechas; «Cambiar foto…» alcanzable con Tab; los avisos anuncian su
   rol; el modo navy y el `confirm` al salir con cambios.
6. **Nada se rompe:** guardar, vista previa, publicar, descartar y subir una
   foto funcionan como hoy, comprobado de punta a punta (el borrador de
   prueba se descarta y la fila vacía se borra al final).
7. **Gates en verde:** `pnpm typecheck`, `pnpm lint`, `pnpm react-doctor`
   (100/100 sin diagnósticos), `pnpm test` y `pnpm build`.
8. **Revisión de cierre** hecha, en `pegasuz`, y sus hallazgos resueltos o
   anotados.

## 7. Fuera de alcance

- **La lane 2 (`armazon-pulido`):** sidebar, portada, lista de páginas,
  métricas y `Pantalla.tsx` del login. Acá solo cambian por el fondo blanco
  y por las piezas compartidas.
- **Los `Formulario*.tsx` del login** y todo lo de la lane 2 de seguridad
  (mails, bloqueo, cookies, Argon2id, nonce, `middleware` → `proxy`).
- **Esquemas, acciones y registro** (`features/*/contenido/`, `datos/`,
  `contenido/paginas.ts`): el rework es de presentación. Si un cambio pide
  datos nuevos, se le pregunta a Mateo.
- **El sitio público**, incluidos sus 3 CTAs en blanco sobre naranja.
- **Las lanes de Facundo** (`work/edicion-de-paginas/`, `work/metricas/`,
  `work/primer-deploy/`).
- **Dependencias nuevas.**

## 8. Riesgos a comprobar en el primer paso que los use

- **`<details name>`** (acordeón exclusivo): Chrome 120, Safari 17.2 y
  Firefox 130 en adelante. Donde no exista, se abren varios a la vez: se
  degrada sin romper. Comprobar que React 19 pasa `name` al `<details>` y
  que los tipos lo aceptan.
- **Los 2 renglones que crecen** (`field-sizing: content`): donde no exista,
  quedan 2 renglones fijos. Se degrada sin romper.
- **El `confirm` al salir** intercepta clics en links en la fase de
  captura: no tiene que atrapar los links a una sección de la misma página
  ni los que abren otra pestaña.
- **Un ítem abierto a todo el ancho** deja huecos en la fila de la que sale
  (a propósito, para no reordenar): verificar que se lee bien con la
  tarjeta 3 y con la 6 abiertas.
