# DECISIONS — Páginas: Qué hacemos, Quiénes somos y lo compartido

Append-only: fecha — decisión — por qué.

---

- 2026-09-26 — **SPEC aprobado por el padre con una condición** (orca ask,
  «SPEC aprobado con una condición. Escribí el PLAN»). Aprobado tal cual:
  1. **Lo compartido vive en Qué hacemos, la página dueña.** Las siete áreas
     son la lista de su sección `areas` y las frases del método la `idea` de
     sus verbos; Inicio las lee con la anotación `usa` del registro; se editan
     solo en Qué hacemos, con el aviso en las dos tarjetas y el link desde
     Inicio; publicar devuelve `rutas` y revalida `/que-hacemos` y `/`. **Por
     qué no una fila o una página aparte para lo compartido:** todo lo que dejó
     la 4a —borrador, versiones, «Qué cambió», el aviso de choque, restaurar,
     la vista previa— funciona por página. Una fila aparte obliga a que
     publicar una página publique otra fila, a versionar dos documentos a la
     vez y a que «Qué cambió» mezcle dos borradores: es rehacer esa base. Como
     sección de la dueña, todo eso le sirve sin una línea nueva. Editarlo
     desde las dos, con el guardado yendo a la dueña, dejaba en Inicio una
     sección que su «Publicar» no publica.
  2. **Del método se comparten solo las cinco frases idénticas.** Los nombres
     (dos verbos distintos), los textos y los alt no son lo mismo, y juntarlos
     cambiaría una de las dos páginas.
  3. **El `<head>` de las dos páginas pasa a sus propios `og:title`,
     `og:description`, `twitter:title` y `twitter:description`** (hoy heredan
     los de Inicio), y la foto 2 de Cómo trabajamos pasa su posición de la
     clase al `style`. Las dos diferencias van con el diff de comparar-render
     en PROGRESS.
  4. **Lo que queda en código** (SPEC §6), y partir `ImpulsanEd` en su propio
     paso.

  **La condición, igual que en la 4a:** donde una región tiene un título
  visible que ahora es editable, su nombre accesible sale de ese título
  (`aria-labelledby` al id del elemento), no de un `aria-label` fijo; el
  `aria-label` fijo queda solo donde no hay título editable. **El pedido:**
  probar la vista previa con un borrador de Qué hacemos que cambia un área —qué
  muestra Inicio en la vista previa y qué en el sitio publicado— y dejarlo
  escrito en PROGRESS.
- 2026-09-26 — **Cómo se aplica la condición, región por región** (lectura
  de esta lane). Hoy tienen un `aria-label` fijo y un título editable, y
  pasan a `aria-labelledby`: el hero de Qué hacemos (su `h1`), la escena del
  faro (su `h2`), el `nav` de las áreas (su `h2`), Niveles (su `h2`),
  Proyectos (su volanta), el cierre (su `h2`), el hero de Quiénes somos (su
  `h1`), Nuestra mirada y Quiénes sostienen ED (su volanta). En estas dos
  últimas el título que las nombra es la volanta —«Nuestra mirada», «Quiénes
  sostienen ED», que es también el nombre del menú—, no el `h2`, que es una
  afirmación («Una misma mirada, tres principios.»): con la volanta el nombre
  sigue siendo el de hoy (el del equipo pierde « — el equipo»). **Se queda el
  `aria-label` fijo** en el Origen («Origen, sentido y evolución»: su nombre es
  el de sus tres tiempos, que quedan en código, y no tiene un título propio) y
  en las listas que no son una región con título (los chips del hero, el
  indicador de pasos). Donde hoy no hay `aria-label` (Cómo trabajamos, Áreas)
  no se suma uno: eso volvería región algo que hoy no lo es. El cambio es de
  atributos: comparar-render no lo ve, así que PROGRESS anota el nombre
  accesible de antes y de después de cada una.
- 2026-09-26 — **El SEO de las dos páginas usa `openGraphDeLaPagina(padre)`
  de la 4c** (aviso del padre, «SEO de página hija: usá openGraphDeLaPagina
  de la 4c»). `metadataDeSeo` en una página hija pierde `og:image` y la
  tarjeta grande de X: el `openGraph` de la página reemplaza el del layout,
  imagen incluida, y la imagen del sitio vive en el segmento del layout. La
  4c suma a `config/metadata.ts` `openGraphDeLaPagina(padre:
  ResolvingMetadata)`, que hereda la imagen ya resuelta; cada
  `generateMetadata` la usa con su segundo argumento. Si la 4c no está en
  `main` al llegar al paso 9, se escribe igual —misma firma, mismo archivo,
  mismo cuerpo que el de su worktree— y concilia quien rebasee segundo; su
  test (`config/metadata.test.ts`) queda de ella, para no chocar en un
  archivo nuevo. comparar-render tiene que mostrar `og:image` y
  `twitter:image` sin cambios: cambian solo `og:title`, `og:description`,
  `twitter:title` y `twitter:description`.
