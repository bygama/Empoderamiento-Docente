# DECISIONS — El editor sin pared

Rulings tomados durante la ejecución. Formato: fecha — decisión — por qué.

- 2026-09-22 — Interlineados del admin: 32/28/24/20 px (los de `text-2xl`,
  `text-lg`, `text-base` y `text-sm` de Tailwind), y el cuerpo en 1,5 en vez
  del 1,6 de §2 — el barrido del paso 6 cambia clases sin mover el layout, y
  el cuerpo del admin son controles y textos cortos, no lectura. Mostrado a
  Mateo con el diff de `DESIGN.md` y aprobado.
- 2026-09-22 — Variantes sobre `azul-principal` (modo navy): foco, terciario
  y destructivo en `azul-claro`; el hover del primario subraya — `rojo-error`
  sobre navy da 2,07:1, `azul-medio` 2,67:1 y `naranja/90` sobre navy 3,93:1.
  Aprobado con el diff.
- 2026-09-22 — El hover del terciario subraya en vez de pintar
  `azul-claro/30` — con ese fondo, `azul-medio` da 4,36:1. Aprobado con el
  diff.
- 2026-09-22 — La sección del admin es §11, al final de `DESIGN.md` — así no
  se renumeran §8 a §10 (nada las cita, pero el orden quedó como estaba).
- 2026-09-22 — `claseDeBoton` vive en `admin/armazon/clases.ts`, no en
  `Boton.tsx` como decía el PLAN (paso 4) — react-doctor frena
  (`only-export-components`) una función exportada desde un `.tsx` que no es
  un componente, y el gate se arregla por código. Mismo patrón que
  `admin/campos/clases.ts`. Mateo lo vio al dar el OK del commit.
- 2026-09-22 — `Boton` usa `min-h-10` + `py-2` en vez de `h-10` — mide 40 px
  igual (comprobado) y, si el texto se parte en un ancho chico, crece en vez
  de recortarse.
- 2026-09-22 — El área segura va con `env(safe-area-inset-bottom)` en la
  barra y no con `viewport-fit=cover` en el layout — sin `cover` Safari ya
  deja la barra fija por encima del indicador y `env()` vale 0; con `cover`,
  el `max()` lo suma. Tocar el `viewport` del layout raíz del admin no está
  en el SPEC.
- 2026-09-22 — En el celular, «Guardar borrador» se ve «Guardar» (el resto
  es `max-lg:sr-only`) — los tres botones no entran en 390 px con el texto
  entero (≈ 433 px medidos a mano); el nombre accesible sigue completo.
- 2026-09-22 — La barra del celular mide 65 px y no 64 — el borde superior
  de 1 px suma; el SPEC pide 72 o menos.
- 2026-09-22 — **Enmienda al SPEC §5 (Mateo, herramienta de preguntas,
  «Sección en 2 columnas»)**: la raíz de una sección también va en 2
  columnas cuando hay lugar, con las listas y los párrafos a todo el ancho.
  Por qué: con el paso 11 la tarjeta 7 empezaba en y=1090 a 1440 × 900, y
  aun con los grupos del paso 12 en 2 columnas se estimaba y≈900: el
  criterio 2 del SPEC §6 no se cumplía. La otra opción era bajar la meta a
  «la primera fila sin scroll». Escrita en el SPEC §5.
- 2026-09-22 — La medición «la tarjeta 7 visible sin scroll» pasa del paso 11
  al 12 — depende del layout de las secciones y los grupos, que es el paso
  12. El resto de la aceptación del paso 11 se midió en el 11.
- 2026-09-22 — Las miniaturas cerradas usan `group/item` (grupo con nombre) —
  la sección también es un `<details>` abierto, y un `group-open:` sin nombre
  escondería todas las miniaturas si la sección llevara `group`.
- 2026-09-22 — La raíz de un ítem de lista va en 2 columnas por una prop
  `columnas` de `Campo` (solo la pasa `ListaFija` vía `porItem`) y el
  `@container` es el panel del ítem — así el cartel, que también es una raíz
  (la de su opcional), no se parte en columnas dentro de la mitad derecha.
- 2026-09-22 — El barrido final del paso 15 excluye los `Formulario*.tsx` —
  el SPEC §7 y las restricciones del PLAN no dejan tocarlos (son de la lane
  de seguridad), y son los únicos que quedan con tamaños sueltos
  (`FormularioEntrar.tsx:78` y `FormularioOlvide.tsx:46`, `text-sm` en el
  párrafo del link). Pendiente para esa lane: pasarlos a `text-admin-meta`.
- 2026-09-22 — El contador de un texto al tope va en `azul-principal` medium
  y pasado el tope en `rojo-error` (antes, `naranja-accion-texto` al tope) —
  DESIGN.md §1 regla 2 (naranja solo para la acción) y §11 (rojo para el
  error, igual que el borde con `aria-invalid`).
- 2026-09-22 — Revisión de cierre: **1 revisor, Opus, lente «corrección
  contra el SPEC»**, sobre `ac3f325..1ac5c0f`, con foco en los pasos `high`
  (1, 4, 7, 8 y 11). Elección de Mateo (herramienta de preguntas, «1
  revisor, Opus (Recommended)»), frente a 2 o 3 lentes o Sonnet; las marcas
  `high` habrían propuesto más lentes.
- 2026-09-22 — El PR de la lane va contra `mateo/armazon-del-admin` (el #173,
  abierto y sin mergear) y se re-apunta a `main` cuando el #173 entre —
  elección de Mateo (herramienta de preguntas, «Contra el #173»); así el diff
  muestra solo los 16 commits de esta lane.
- 2026-09-22 — **Los hallazgos de la revisión de cierre quedan diferidos por
  decisión del owner.** Con el triage propuesto (arreglar 1 a 4, diferir 5,
  aclarar 6), Mateo contestó «perfecto pr merge» y después eligió «Todo a
  main» en la herramienta de preguntas. Quedan pendientes, para la lane 2
  (`armazon-pulido`) o un cambio chico aparte:
  1. **Important:** «Salir» (`admin/armazon/SalirDelAdmin.tsx`, un `<button>`
     que desloguea y hace `router.push`) tira los cambios sin guardar sin
     preguntar: `admin/paginas/useFrenarSalida.ts` solo ataja `a[href]`.
     Propuesta: una marca para los controles que salen de la pantalla, que
     el freno también ataje.
  2. Minor: el foco de `ENTRADA` (`admin/campos/clases.ts`) no es el outline
     de 2 px `azul-medio` de DESIGN.md §11; el anillo `azul-medio/30` da
     ~1,5:1.
  3. Minor: `admin/paginas/Seccion.tsx` `lg:scroll-mt-28` (112) queda corto
     con un aviso abierto (el encabezado mide 129) → 144.
  4. Minor: «Publicar» en una página nunca publicada responde «La página ya
     está publicada así.»; mejor «No hay cambios para publicar: el sitio ya
     muestra este contenido.».
  5. Minor: el botón Atrás del navegador no frena la salida (Next no da un
     gancho; el SPEC no lo pedía).
  6. Minor, alcance: el criterio 2 del SPEC §6 vale para la grilla de
     computadora; las 8 tarjetas de celular empiezan en y=901 a 1440 × 900.
  - Fuera de la lente, previos a la lane: el punto de foco `verde-concepto`
    de `CampoFoto` convive con «Publicar» (DESIGN.md §1, regla 4); el
    `role="status"` del `Aviso` nace junto con su texto y algunos lectores
    no anuncian la primera confirmación.
- 2026-09-22 — Salida a `main`: el #173 se mergea primero (rebase and merge)
  y esta rama se rebasea sobre `main` antes del PR, que va contra `main` —
  elección de Mateo («Todo a main»); reemplaza la decisión anterior de abrir
  el PR contra `mateo/armazon-del-admin`.
