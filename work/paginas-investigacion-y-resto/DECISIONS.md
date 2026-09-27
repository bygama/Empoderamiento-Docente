# DECISIONS — Páginas: Investigación, Biblioteca y Contacto

Append-only: fecha — decisión — por qué.

---

- 2026-09-26 — **SPEC aprobado tal cual por el padre** (orca ask, «SPEC
  aprobado tal cual. Escribí el PLAN (y commiteá el SPEC)»), con seis puntos
  aprobados de forma explícita:
  1. **`og:title` y `og:description` propios** de Investigación y Biblioteca
     (hoy heredan los del sitio desde el layout): una mejora de SEO y la única
     diferencia de render esperada. El diff de comparar-render que la muestra
     queda en PROGRESS, en esos dos commits.
  2. **Los textos de los botones se editan; los destinos no.** El caso que
     abre cada línea va por posición, en código: la estructura no se edita
     (spec del admin §1).
  3. **El catálogo edita solo su aviso sin resultados**; filtros,
     placeholders, grupos, contadores y «Ver N más» son interfaz y quedan en
     código. `MaterialesListado`, `LineasInvestigacion`,
     `CierreInvestigacion` y `PuenteInvestigacion` se parten, cada uno en su
     commit, antes de su sección.
  4. **Las cuatro fotos del puente siguen con `alt=""`** (decorativas) y el
     campo pide el alt igual, con su ayuda: el criterio del collage del hero
     de la 4a.
  5. **AGENTS.md §6 y §13** se actualizan; **DESIGN.md no se toca** (no hay
     UI nueva del admin).
  6. **Contacto solo si la lane 7 está en `main` al rebasear.**
- 2026-09-26 — **La clave de un fragmento resaltado es su posición en el
  texto.** react-doctor marcó `no-array-index-as-key` en `ConResaltado`; la
  posición de cada fragmento es única (ninguno viene vacío) y estable para un
  texto dado. Se arregla por código, como pide AGENTS.md §5.8.
- 2026-09-26 — **Una página hija hereda la imagen de redes del layout**
  (padre, orca ask: «Las dos, aprobadas»). `metadataDeSeo` en una página que
  no es la raíz hacía perder `og:image` y la tarjeta grande de X: el
  `openGraph` de la página reemplaza el del layout imagen incluida, y la
  imagen del sitio vive en el segmento del layout (en Inicio no se nota
  porque es el mismo segmento). `config/metadata.ts` suma
  `openGraphDeLaPagina(padre)`, que hereda la imagen ya resuelta con el
  segundo argumento de `generateMetadata` (`ResolvingMetadata`), sin tocar
  `metadataDeSeo`. El padre pidió un test que falle si una página hija con
  SEO pierde la imagen: `config/metadata.test.ts` (verde, y rojo si
  `/investigacion` deja de usar el helper). El padre le avisa a la 4b que use
  el mismo helper.
- 2026-09-26 — **`twitter:title` y `twitter:description` también cambian**
  (padre, mismo ask): Next los deriva del `openGraph` de la página, con los
  mismos valores. Es parte del cambio aprobado en el punto 1 de arriba.
