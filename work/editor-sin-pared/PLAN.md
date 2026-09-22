# PLAN — El editor sin pared

**Spec:** [`SPEC.md`](SPEC.md) (aprobado por Mateo el 2026-09-22) · estado en
[`PROGRESS.md`](PROGRESS.md) · decisiones que surjan, en `DECISIONS.md`.

**Objetivo:** que el editor de páginas se recorra sin perderse (de 12.688 px a
menos de 2.500, cualquier tarjeta a 1 clic, estado siempre a la vista), sobre
un sistema chico del admin (tokens, botones, insignias, encabezado, avisos)
que después usa la lane 2 `armazon-pulido`.

## Restricciones (valen en todos los pasos)

- **Confirmación de Mateo** (AGENTS.md §5.6) antes de cada commit (se listan
  en seco), el push, el PR y cualquier edición de `DESIGN.md`. Sin
  dependencias nuevas.
- **Commits** Conventional, en español, en imperativo, header de 72
  caracteres o menos, uno por paso, nunca `git add -A`. Trailer
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Con tildes:
  commitear desde Git Bash con `git commit -F - <<'EOF'`.
- **El gate de cada paso de código**, con los archivos del paso ya en el
  índice (react-doctor arma su lista desde el índice de git):
  `pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs`
  → exit 0 y 100/100 sin diagnósticos. Se arregla por código, nunca apagando
  reglas (§5.8).
- **No se tocan** los `Formulario*.tsx` del login, `Pantalla.tsx` (salvo el
  barrido de tamaños del paso 6), los esquemas (`features/*/contenido/`),
  `datos/`, `contenido/paginas.ts` ni las lanes de Facundo.
- **Tokens, no hardcodes.** En el admin, solo `text-admin-titulo`,
  `text-admin-seccion`, `text-admin-cuerpo` y `text-admin-meta`; títulos con
  `font-display`. Ningún par de colores sin medir: cada par nuevo se mide con
  el script de contraste y se anota en `PROGRESS.md`.
- **Un botón no se deshabilita para explicar algo:** solo mientras corre una
  acción, y la que corre lo dice.
- **Componentes de 200 líneas o menos** (al partir, subcarpeta con el nombre:
  AI_GUIDELINES §2), utilidades de 100 o menos. Server Components por
  defecto; `"use client"` solo donde hace falta el navegador. Íconos del set
  propio, trazo 1,5.
- **El repo es CRLF:** un reemplazo multilínea con `perl` o `node` normaliza
  a `\n` y vuelve a `\r\n`.
- **Probar en el navegador:** Playwright (MCP) contra `http://localhost:3003`
  (nunca `127.0.0.1`), con el dev server en su terminal de Orca y
  `NEXT_PUBLIC_SITE_URL=http://localhost:3003` pisada en esa terminal.
  Cuenta local `prueba@example.com`; el login admite 3 intentos por minuto.
  Esperar la hidratación antes de medir. Capturas en `%TEMP%`, nunca en el
  repo.
- **Todo lo que se lance** (revisores, ayudantes) va en `pegasuz`, por
  `orca terminal create --command "pegasuz"`, nunca por el Agent tool desde
  una sesión personal.

## Pasos

Marca al final: *(rol · riesgo)*. El riesgo es lo que cuesta rehacerlo y le
dice a la revisión de cierre dónde mirar.

0. **Abrir la lane**: `SPEC.md`, `PLAN.md` y `PROGRESS.md` (sin la marca de
   espera). Aceptación: `git show --stat HEAD` lista los 3 archivos bajo
   `work/editor-sin-pared/` y nada más. *(mechanical · low)*

1. **`DESIGN.md` primero** (SPEC §2): `rojo-error` en la tabla de §1 y en el
   bloque de §8; una sección nueva «Admin» con el fondo blanco, la escala
   `text-admin-*`, los bordes, las 3 insignias, las 4 variantes de botón, el
   encabezado de página y los avisos, cada par con su contraste. El diff se le
   muestra a Mateo antes de commitear. Aceptación: `grep -c "rojo-error\|text-admin-" DESIGN.md`
   da 8 o más, y el OK de Mateo al diff queda en `PROGRESS.md`.
   *(judgment · high)*

2. **Los tokens en el `@theme`** de `apps/sitio/src/app/globals.css`:
   `--color-rojo-error` y los 4 `--text-admin-*` con su `--line-height`, con
   los valores exactos de `DESIGN.md`. Aceptación: el gate da exit 0, y una
   página de prueba descartable (o `curl` de la hoja servida) muestra
   `.text-admin-titulo` con `font-size: 1.5rem`. *(mechanical · medium)*

3. **Una sola caja de texto:** `ENTRADA` en `admin/campos/clases.ts` pasa a
   borde `gris-texto`, foco `azul-medio` y `aria-invalid` en `rojo-error`;
   `ENTRADA_DE_ACCESO` desaparece y `Campo` y `CampoContrasena` usan
   `ENTRADA`. Aceptación: el gate; `grep -rn ENTRADA_DE_ACCESO apps/sitio/src`
   no encuentra nada (exit 1); Playwright mide el borde de un input del editor
   en 4,83:1 sobre blanco. *(mechanical · medium)*

4. **Los botones en 4 variantes:** `admin/armazon/Boton.tsx` exporta
   `claseDeBoton(variante)`, `Boton` y `BotonEnlace` (primario, secundario,
   terciario y destructivo; 40 px; `aria-busy` mientras corre). El `Boton` de
   `Campos.tsx` pasa a ser el primario a todo el ancho armado sobre eso, con la
   misma firma. `BOTON_SECUNDARIO` desaparece y sus usos (`BarraDeAcciones`,
   `CampoFoto`, `paginas/error.tsx`) pasan a `Boton`. Aceptación: el gate;
   `grep -rn BOTON_SECUNDARIO apps/sitio/src` sale con exit 1;
   `git diff --stat` no incluye ningún `Formulario*.tsx`; «Entrar» sigue
   entrando (Playwright). *(integration · high)*

5. **Los avisos en rojo y azul:** el `Aviso` de `Campos.tsx` se restila en
   su lugar (error: `rojo-error` con el ícono nuevo `Alerta` y `role="alert"`;
   confirmación: azul con `Check` y `role="status"`; un × opcional por
   `alCerrar`). `Alerta` se suma a `components/ui/icons/index.tsx`.
   Aceptación: el gate; Playwright provoca el error del login (una contraseña
   mala, un solo intento) y mide el texto del aviso en 4,5:1 o más; ningún
   `verde-concepto` queda en `Campos.tsx` (`grep` con exit 1).
   *(integration · medium)*

6. **Fondo blanco y escala cerrada en el resto del admin** `[batch]`: el
   armazón protegido (`app/(admin)/admin/(protegido)/layout.tsx`) pasa a
   `bg-white`, y en un solo barrido los tamaños sueltos pasan a `text-admin-*`
   y los `font-[family-name:var(--font-manrope)]` a `font-display` en la
   portada (`(protegido)/page.tsx`), `paginas/page.tsx`, `ListaDePaginas`,
   `metricas/*`, `barra-lateral/*`, `SalirDelAdmin`, `Pantalla`,
   `CampoContrasena` y `paginas/error.tsx`, 1 a 1 y sin rediseñar (eso es la
   lane 2). Aceptación: el gate; Playwright mide el texto secundario de la
   lista de páginas en 4,83:1 (antes 4,39). *(mechanical · low)*

7. **El encabezado del editor:** `admin/armazon/Encabezado.tsx` (migas, `h1`,
   estado, detalle, acciones y avisos; `fijo` = `sticky`) e
   `Insignia.tsx` (tonos fuerte, normal y apagado); el mapeo del estado de la
   página a su insignia y a su detalle vive en `admin/paginas/`, y
   reemplaza a `BarraDeAcciones`. «Guardar borrador» y «Publicar» dejan de
   deshabilitarse y contestan con un aviso; «Descartar borrador» pasa al
   detalle como destructivo; los avisos van adentro del encabezado; se va el
   `h1` sr-only de `paginas/[slug]/page.tsx`. Aceptación: el gate; Playwright
   a 1440: un `h1` visible «Inicio», 1 insignia, 1 solo botón primario,
   ningún botón `disabled` al entrar, y «Guardar borrador» sin cambios muestra
   «No hay cambios para guardar.». *(integration · high)*

8. **Cambios sin guardar:** el modo navy del encabezado (insignias y
   secundarios invertidos, «Publicar» sigue naranja), `beforeunload` y un
   `confirm` al tocar un link que sale del editor (no los de una sección de la
   misma página ni los de otra pestaña), en un hook cliente de
   `admin/paginas/`. Aceptación: el gate; Playwright: al escribir, el
   encabezado pasa a `azul-principal` y vuelve a blanco al guardar; un clic en
   «Todas las páginas» con cambios dispara el diálogo (capturado con
   `page.on('dialog')`, sin bloquear el navegador) y uno en «Hero» no.
   *(judgment · high)*

9. **Las acciones abajo en el celular:** por debajo de `lg`, las acciones y
   los avisos del encabezado van en una barra fija abajo (con el área segura
   del iPhone), el título y el detalle hacen scroll, y el formulario deja
   lugar abajo. `Seccion.tsx` recalcula su `scroll-margin`. Aceptación: el
   gate; Playwright a 390 × 844: la barra mide 72 px o menos, está pegada
   abajo, no tapa el último campo al final del scroll, y el link «Hero» de la
   sidebar deja la sección a la vista. *(integration · medium)*

10. **El resumen de un ítem de lista**, escrito con test primero: una función
    pura en `lib/contenido/` que, dada la `Descripcion` de un ítem y su valor,
    devuelve la primera foto (src, alt y foco) y el texto (el primer texto
    corto no vacío o, si no hay, el alt). Sin nada propio del hero y sin
    importar nada de `@/`. Aceptación: `pnpm test` en verde con un test nuevo
    que primero falló (una tarjeta con cartel, una sin cartel, una sin foto y
    una de celular); el gate. *(judgment · medium)*

11. **Las tarjetas en grilla:** `ListaFija` dibuja un `<details>` por ítem con
    `name` de la lista (6 columnas desde `lg`, 3 por debajo); el `summary`
    cerrado es la miniatura con el número y el resumen del paso 10 (que
    `Campo.tsx` le pasa por prop: `ListaFija` no conoce `Descripcion`), y
    abierto es la cabecera del panel con «Cerrar»; el abierto ocupa su propia
    fila a todo el ancho, sin reordenar. El título lleva la cantidad y se va
    «Son N ítems.». Comprobar primero que React 19 pasa `name` al
    `<details>` (SPEC §8). Aceptación: el gate; Playwright a 1440 con todo
    cerrado: `scrollHeight` menor a 2.500, y la tarjeta 7 visible sin scroll;
    abrir la 7 cierra la 3 si estaba abierta; Enter sobre un `summary` abre y
    cierra; el orden de Tab sigue al DOM. *(judgment · high)*

12. **Secciones y grupos sin cajas anidadas:** `Seccion` deja la tarjeta (el
    título con un divisor, sigue plegable y con su `id`); `CampoGrupo` que no
    es raíz pierde el borde del `fieldset` y pone sus campos en 2 columnas con
    `@container` cuando su propio ancho lo permite. Aceptación: el gate;
    Playwright: 0 elementos con borde entre un input y `main`, salvo el panel
    de la tarjeta abierta (1); Texto y Adónde lleva de cada botón, lado a lado
    a 1440 y apilados a 390. *(integration · medium)*

13. **Cambiar foto con un botón del admin:** `CampoFoto` oculta el input
    nativo (queda enfocable) detrás de «Cambiar foto…» con el ícono nuevo
    `Subir`; al elegir: nombre del archivo, «Subir foto» y «Cancelar»; formatos
    y peso una vez, al lado del botón; la ayuda del foco en una línea; sigue
    pidiendo el alt antes de subir. Aceptación: el gate; Playwright sube una
    foto real (`setInputFiles`) de punta a punta, la miniatura cambia y el foco
    vuelve al centro; «Cambiar foto…» se alcanza con Tab; no queda ningún
    texto «Choose File». *(integration · medium)*

14. **La anatomía de los campos** `[batch]`: en `TextoCorto`, `Parrafo`,
    `RutaInterna` y la casilla de `CampoOpcional`: etiqueta en meta medium →
    ayuda en meta `gris-texto` antes del campo → campo en cuerpo; el contador,
    visible desde el 80 % del máximo y siempre en el `aria-describedby`; la
    casilla con `accent-azul-principal`. Aceptación: el gate; Playwright: 0
    textos de 12 px en `main`; un campo al 50 % no muestra contador y al 90 %
    sí; `aria-describedby` apunta al contador en los dos casos.
    *(mechanical · medium)*

15. **Textos cortos largos en 2 renglones:** `TextoCorto` con máximo de más
    de 80 dibuja un `textarea` de 2 renglones que crece
    (`field-sizing-content`), sin saltos de línea tecleados ni pegados.
    Aceptación: el gate; Playwright: la bajada se ve entera a 1440 y a 390;
    Enter no agrega renglón; pegar «a\nb» deja «a b»; `maxLength` sigue en
    140. Y el barrido final: `grep -rnE "text-(xs|sm|base|lg|xl|2xl|3xl)\b|font-\[family-name" apps/sitio/src/admin "apps/sitio/src/app/(admin)"`
    no encuentra nada (exit 1). *(integration · medium)*

## Después del último paso (no son pasos del PLAN)

- **work-verify:** la DoD del SPEC §6 completa, con capturas después a 1440 y
  390 y todos los números en `PROGRESS.md`; `pnpm test` y `pnpm build`; la
  revisión de cierre con los revisores que elija Mateo, lanzados en
  `pegasuz`. Las marcas `high` (pasos 1, 4, 7, 8 y 11) son donde mira.
- **work-handoff:** el commit de la evidencia, el push y el PR contra
  `mateo/armazon-del-admin` (o contra `main`, si el #173 ya entró), cada uno
  con el OK de Mateo.

## Commits en seco

| # | Commit |
| --- | --- |
| 0 | `docs(work): abrir la lane del editor sin pared` |
| 1 | `docs(design): sumar el rojo de error y las reglas del admin` |
| 2 | `style(admin): sumar el rojo de error y la escala del admin al tema` |
| 3 | `refactor(admin): unificar la caja de texto con borde gris-texto` |
| 4 | `refactor(admin): los botones del admin en cuatro variantes` |
| 5 | `style(admin): avisos en rojo y azul, con ícono y cierre` |
| 6 | `style(admin): fondo blanco y escala cerrada en el resto del admin` |
| 7 | `feat(admin): el encabezado del editor con título, estado y acciones` |
| 8 | `feat(admin): avisar los cambios sin guardar y frenar la salida` |
| 9 | `feat(admin): las acciones del editor abajo en el celular` |
| 10 | `feat(contenido): resumir un ítem de lista por su foto y su texto` |
| 11 | `feat(admin): las tarjetas en una grilla que se abre en el lugar` |
| 12 | `refactor(admin): secciones y grupos sin cajas anidadas` |
| 13 | `feat(admin): cambiar la foto con un botón del admin` |
| 14 | `style(admin): la ayuda antes del campo y el contador desde el 80 %` |
| 15 | `feat(admin): los textos cortos largos en dos renglones` |
| — | después de la revisión: `docs(work): la evidencia de la lane` |
