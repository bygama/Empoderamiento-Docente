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
- 2026-09-26 — **Contacto entra** (padre, mensaje «Contacto libre: la 7 está
  en main»): la lane 7 (`mensajes`) está en `main` (`490547f`) con el envío
  del formulario conectado en `features/contacto/`. Al llegar al paso 17 se
  rebasea sobre `main` y se hacen los textos y el SEO de Contacto sobre lo que
  dejó la 7, **sin tocar el envío** (route handler, límite por IP, trampa) **ni
  la línea de privacidad** que sumó debajo del formulario.
- 2026-09-26 — **La lista de Contacto, cerrada contra el código de la 7**
  (SPEC §6, después del rebase sobre `main` `15def2c`). Tres secciones y el
  SEO:
  - **Titular** (`titular`): «Hablemos.» (12 caracteres). Es el único
    titular de la experiencia: se arma letra por letra en el hero y viaja
    al selector. El clon que viaja copia el texto del destino en vez de la
    constante (dos líneas en `ghost-titulo.ts` y `coreografia-intro.ts`,
    sin tocar tiempos ni geometría).
  - **Apertura** (`apertura`): la frase pilar con su parte verde (80,
    una parte resaltada), el equipo —foto con su alt, título (30), bajada
    (40) y el texto que lo reemplaza en el celular (60)— y «¿Preferís
    escribir directo?» (40).
  - **Cierre** (`cierre`): título (60), texto (150) y el botón «Hacer otra
    consulta» (30).
  - **Quedan en código, y por qué:** los **cinco temas**, porque el envío de
    la 7 los usa (`datos/formularios/contacto.ts` valida la clave con
    `TEMAS` y guarda el **título** del tema en cada mensaje): editarlos acá
    haría que la bandeja muestre un título distinto del sitio, y cambiar eso
    es tocar el envío. El panel del formulario entero (rótulos, «Enviar
    consulta», «Volver a los temas», «Sumate al equipo» y la línea de
    privacidad) es de la 7. Las etiquetas del rail («Tema · 0N»,
    «Escribinos», «Oficina») y del canal directo son interfaz; el mail y la
    oficina salen de `config/site.ts`. Las caras del equipo y el «+8» son de
    la entidad Equipo (lane 8).
- 2026-09-26 — **Revisión r1 (Opus 5.5, medium, «el cambio entero contra su
  SPEC») sobre `83a332c`: PASS**, 0 Critical, 0 Important, 2 Minor y dos
  notas fuera de su lente (según el padre). Rulings del padre:
  1. **Arreglar las keys que salían de un texto editable** (el nombre de las
     líneas, de los recursos del puente y de las estaciones): dos iguales
     cargados en el admin repetían la key. Las listas son fijas y no se
     reordenan, así que la key es la posición. `key={i}` lo marca
     react-doctor (`no-array-index-as-key`) aun recorriendo una constante;
     la key pasa a ser el número visible de cada ítem —el del papel
     (`numeroDePapel`), el del recurso en su lomo (`numeroDeRecurso`) y el
     de la estación (`numero`, que ya existía)—, cada uno en su propio
     módulo porque exportarlo desde el archivo del componente lo marca
     `only-export-components`. (`d45afa1`, `7a8b7f9`)
  2. **Ordenar los imports de `contenido/paginas.ts`**: los de Contacto
     habían quedado entre los de Biblioteca. (`e2316c9`)
  3. **Quedan como están**: los hashes viejos de PROGRESS (la carpeta se
     borra al cerrar) y `constelacion.ts`, que ya estaba así.
