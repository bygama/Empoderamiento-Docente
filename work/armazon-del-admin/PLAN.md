# PLAN — El armazón del admin

- **Spec:** [`SPEC.md`](SPEC.md) · **Progreso:** [`PROGRESS.md`](PROGRESS.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Restricciones (valen en cada paso)

- **Commits.** Un paso, un commit: Conventional en español, imperativo, ≤ 72
  caracteres (`docs/COMMITS.md`). Se commitea con el OK del owner a la lista
  de commits (AGENTS.md §9).
- **Gate.** Cada paso deja en verde `pnpm typecheck`, `pnpm lint` y
  `node scripts/verificar-react-doctor.mjs` (100/100 sin diagnósticos).
- **Tokens.** Colores, tipos y radios de `DESIGN.md`: nada de
  `bg-[#…]`. Toda combinación nueva de texto sobre fondo se mide con la
  fórmula de WCAG y pasa AA: 4,5:1 para texto, 3:1 para títulos grandes y
  bordes de controles.
- **Componentes.** 200 líneas o menos (contando código). Server Components
  por defecto; `"use client"` solo donde hay estado del navegador. Las
  piezas de un componente partido van a su subcarpeta (AI_GUIDELINES §2).
- **Alcance.** Sin dependencias nuevas. Las lanes de Facundo no se tocan.
- **Meta-docs.** `DESIGN.md` se edita solo en el paso 1 y `AGENTS.md` solo
  en el paso 8, con el OK del owner.
- **Prueba en el navegador.** En el navegador de Orca contra `pnpm dev`
  (localhost, no 127.0.0.1), con la cuenta local `prueba@example.com`.
  - No usar `orca wait`.
  - Confirmar cada clic por su efecto: un `ok` de `orca click` no prueba que
    el clic haya disparado algo.
  - El ancho de celular se fija con `orca exec --command "set viewport 390 844"`
    después del `goto`.

## Pasos

- [x] **1. El CTA en `DESIGN.md`** — §7 «Botón primario»: el texto pasa a
  `azul-principal` sobre `naranja-accion` (4,54:1), con el porqué (blanco
  da 3,00:1) y la nota de que los tres CTAs del sitio quedan para un cambio
  aparte.
  - Accept: `git grep -n "4,54" -- DESIGN.md` sale 0.
  - Accept: `git diff --stat` muestra solo `DESIGN.md`, fuera de la lane.
  - *(judgment · high)*
- [x] **2. El ojo en el set de íconos** — `Eye` y `EyeOff` en
  `apps/sitio/src/components/ui/icons/index.tsx`: trazo, `currentColor` y
  tamaño como los demás (`DESIGN.md` §5).
  - Accept: `git grep -c -E "export function Eye(Off)?\b" -- apps/sitio/src/components/ui/icons/index.tsx`
    da 2.
  - Accept: el gate sale 0.
  - *(mechanical · low)*
- [x] **3. Los primitivos del acceso con la marca** —
  `admin/armazon/Campos.tsx` con tres cambios:
  - `Campo`: foco en `azul-medio`, `aria-invalid` y `aria-describedby`;
  - `Boton`: `naranja-accion` con texto `azul-principal`;
  - `Aviso`: el error con `role="alert"`.

  Y uno nuevo: `admin/armazon/CampoContrasena.tsx` (`"use client"`), con la
  interfaz `CampoContrasena({ etiqueta, name, autoComplete, minLength?, ayuda? })`,
  un botón de ojo con `aria-pressed` y «Mostrar contraseña», y la ayuda atada
  con `aria-describedby`.
  - Accept: el script de contraste de PROGRESS da ≥ 4,5 en cada par de
    texto y ≥ 3 en el borde del input.
  - Accept: el gate sale 0.
  - *(integration · medium)*
- [x] **4. La pantalla partida** — `admin/armazon/Pantalla.tsx`:
  - a la izquierda, desde `lg`, el panel `azul-principal` con el logo en
    negativo (`next/image`, PNG de `public/brand/`), «Admin del sitio», la
    grilla de puntos blanca al 12 % y una forma `azul-medio` con
    `aria-hidden`;
  - en el celular, la franja de arriba;
  - a la derecha, el formulario sobre blanco.

  Además, un `<title>` en cada una de las tres `page.tsx` de acceso.
  - Accept: `pnpm build` sale 0.
  - Accept: en el navegador, `/admin/entrar` en escritorio muestra el panel
    y el formulario lado a lado, y a 390 px la franja arriba.
  - Accept: `document.title` es «Entrar · Admin ED».
  - Accept: el gate sale 0.
  - *(integration · medium)*
- [x] **5. Los formularios de acceso** `[batch]` —
  `FormularioEntrar`, `FormularioOlvide` y `FormularioNueva`:
  - las contraseñas pasan a `CampoContrasena` (paso 3);
  - «Nueva» lleva `minLength={12}` y la ayuda «Doce caracteres o más»;
  - los errores salen por `Aviso` con `role="alert"` y marcan el campo
    (`aria-invalid`).
  - Accept: en el navegador, entrar con `prueba@example.com` llega a
    `/admin`.
  - Accept: el ojo alterna `type` entre `password` y `text` y
    `aria-pressed`.
  - Accept: una contraseña mala muestra el aviso con `role="alert"`.
  - Accept: el gate sale 0.
  - *(integration · medium)*
- [x] **6. La sidebar en escritorio** — la sidebar y lo que la rodea:
  - **El compositor:** `admin/armazon/BarraLateral.tsx`, un Server
    Component con la interfaz `BarraLateral({ usuario: { nombre, rol } })`.
    Lee `PAGINAS`/`SLUGS` y `listaDePaginas()` dentro de un `try`: si la
    base falla, arma el árbol sin los puntos y lo deja en el log.
  - **Sus piezas,** en `admin/armazon/barra-lateral/`: `ArbolDelSitio` e
    `ItemDeNavegacion`.
  - **El layout protegido** la pone fija a la izquierda. `SalirDelAdmin` se
    restila para el fondo azul.
  - **`admin/paginas/Seccion.tsx`** suma `id="seccion-<clave>"` y un
    `scroll-margin`.
  - Accept: en el navegador, a 1280 px, la sidebar lista Inicio y las 7
    páginas en el orden del registro.
  - Accept: Inicio › Hero lleva a `/admin/paginas/inicio#seccion-hero` y el
    bloque queda a la vista.
  - Accept: las 6 páginas sin secciones se ven atenuadas y sin link.
  - Accept: después de «Guardar borrador», Inicio muestra el punto «sin
    publicar», con su texto accesible; se descarta al terminar.
  - Accept: `aria-current="page"` está en el ítem de la ruta.
  - Accept: el gate sale 0.
  - *(integration · high)*
- [x] **7. La sidebar en el celular** —
  `admin/armazon/barra-lateral/PanelMovil.tsx` (`"use client"`), con la
  interfaz `PanelMovil({ children })`: recibe como `children` el contenido de
  `BarraLateral` (paso 6).
  - Por debajo de `lg`: barra superior con el logo y el botón «Menú»
    (`aria-expanded`, `aria-controls`).
  - El panel atrapa el foco, se cierra con Escape, con el fondo o al
    navegar, devuelve el foco al botón y bloquea el scroll.
  - Con `prefers-reduced-motion`, sin animación.
  - Accept: en el navegador, a 390 px, «Menú» abre el panel y el foco queda
    adentro después de 30 Tab (`document.activeElement` medido).
  - Accept: Escape cierra el panel y el foco vuelve a «Menú».
  - Accept: tocar una página cierra el panel y navega.
  - Accept: a 1280 px, el botón no se ve y la sidebar sí.
  - Accept: el gate sale 0.
  - *(integration · high)*
- [x] **8. `AGENTS.md` §3 nombra la sidebar** — en el árbol, la línea de
  `admin/armazon/` suma «la sidebar (barra-lateral/)».
  - Accept: `git grep -n "barra-lateral" -- AGENTS.md` sale 0.
  - Accept: el diff de `AGENTS.md` es de una línea.
  - *(mechanical · low)*

## Cierre

`work-verify` corre los gates, `pnpm test` y `pnpm build`, y el recorrido
entero en el navegador. Después va la revisión de cierre: por las marcas,
un lente sobre todo el cambio más uno por cada paso `high` (1, 6 y 7). La
cantidad la decide el owner. Después, `work-handoff`.
