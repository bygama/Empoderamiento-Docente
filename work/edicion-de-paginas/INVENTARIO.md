# INVENTARIO — Textos e imágenes del sitio, sección por sección

Exploración de solo lectura de `apps/sitio` (monorepo `empoderamiento-docente-web`), pensada para que un diseñador convierta cada sección en un formulario de edición. No se tocó nada; no se leyó `src/admin/**`, `src/datos/**`, `src/lib/metricas/**` ni `packages/**`.

Convención: todas las rutas son relativas a `apps/sitio/`. "Hardcodeado" significa que el texto vive directo en el JSX del componente, no en un archivo de datos aparte.

---

## 0. Cómo está organizado el sitio

- Rutas: `src/app/(sitio)/**/page.tsx` (7 páginas + ficha de novedad `[slug]` + 404 + catch-all `[...resto]` para redirects).
- Cada página importa "secciones" desde `src/features/<pagina>/components/*.tsx`.
- El contenido vive en tres lugares distintos, y **cuál de los tres varía sección por sección** (está anotado en cada una):
  1. `src/features/<pagina>/data/*.ts` — archivo de datos "oficial", el más fácil de editar.
  2. `src/features/<pagina>/components/<seccion>/data.ts` (o `estaciones.ts`, `constelacion-mirada.ts`, etc.) — datos igual de estructurados, pero anidados dentro de la carpeta del componente en vez de en `data/`.
  3. Directo en el `.tsx` del componente, como un array `const` arriba de la función — el caso más frecuente para textos cortos (títulos de sección, 3-6 tarjetas) que nadie previó que se fueran a reusar.
- `src/config/*.ts` tiene los datos que se repiten en varias páginas (aliados, nombre/dirección/redes de ED, navegación, créditos del estudio).

---

## 1. Inicio — `/` (`src/app/(sitio)/page.tsx`)

Orden de scroll: **Hero+QuiénesSomos+Misión → En números → Cómo trabajamos → Áreas de especialización → Biblioteca y Novedades**.

### 1.1 Hero, «¿Quiénes somos?» y «Misión» — `HeroQuienes`
- Archivos: `src/features/home/components/HeroQuienes.tsx` (orquesta) + `Hero.tsx` + `hero/HeroCopy.tsx` + `hero/CampoCards.tsx` + `hero/CampoCardsMobile.tsx` + `Manifiesto.tsx` + `MisionPanel.tsx`.
- Datos: `hero/hero-cards.ts` (imágenes del hero); los textos de "¿Quiénes somos?" y "Misión" están **hardcodeados** en `Manifiesto.tsx` y `MisionPanel.tsx` (marcados "NO parafrasear", copy oficial verbatim del cliente).
- Textos:
  - Título H1 (`HeroCopy.tsx`): "La transformación educativa comienza en las matemáticas." — dividido en 7 `<span data-hero-word>` (una palabra/frase por span, para animar entrada palabra por palabra). Hand-calibrado.
  - Bajada H1: 1 párrafo, ~125 caracteres.
  - 2 botones: "Qué hacemos" / "Contactanos".
  - Panel "¿Quiénes somos?": título corto + 2 párrafos partidos en *segmentos* (`QS_PARAGRAPHS`, tipo `FillSeg[]`: cada frase se corta en fragmentos `{t, accent?}` para el efecto de relleno por scroll) + botón "Conocé al equipo". Editar este texto implica editar una lista de fragmentos, no un string simple.
  - Panel "Misión": mismo mecanismo (`MISION_PARAGRAPHS`), título + 2 párrafos segmentados, sin botón.
- Imágenes:
  - 11 tarjetas flotantes de escritorio (`CARDS` en `hero-cards.ts`), cada una con `img`, `alt`, y **5 de las 11** llevan además un cartelito `label: {title, desc}` (título 2-3 palabras + descripción 4-7 palabras, ambos cortos a propósito porque flotan sobre la foto).
  - 8 tarjetas de mobile (`MOBILE_CARDS`), casi todas repiten fotos del set de escritorio; solo 1 foto es exclusiva de mobile (`comparar-tareas-ronda.webp`).
  - 1 foto en el panel "¿Quiénes somos?" (`/fotos/formadoras-pizarra-umce.webp`, con alt) y 1 en "Misión" (`/fotos/docentes-encuentro-formacion.webp`, con alt). Ambas a `aspect-[16/9]`/`aspect-[5/4]`, `object-cover`.
  - Todas las fotos tienen `alt` descriptivo, salvo las que son puramente decorativas.
- Conteo fijo: **11 tarjetas de escritorio** y **8 de mobile** son cantidades ligadas a la coreografía de reparto (posiciones `cx/cy/w/ar` medidas a mano); agregar o sacar una tarjeta implica retocar esas posiciones.

### 1.2 En números — `DatosDuros`
- Archivo: `src/features/home/components/DatosDuros.tsx`. **Sin archivo de datos propio**: el array `DATOS` vive arriba del componente.
- Datos compartidos: `ALIADOS` de `src/config/aliados.ts` (ver §(b)).
- Textos: 4 métricas, cada una `{value, prefix, suffix, label, nota}` → título numérico + etiqueta (2-4 palabras) + nota (una frase de 4-8 palabras). Los valores son cifras reales citadas de documentos del cliente (comentario en el código: pendiente de confirmar 2 datos con Daniela).
- Imágenes: los 5 logos de aliados (compartidos, ver más abajo), sin foto propia.
- Conteo fijo: **4 métricas** en una grilla de 2×2/1×4 — agregar una quinta rompe la grilla actual.

### 1.3 Cómo trabajamos — `ComoTrabajamos`
- Archivos: `ComoTrabajamos.tsx` + `como-trabajamos/PasoMetodo.tsx` + `como-trabajamos/IndicadorPasos.tsx`.
- Datos: `src/features/home/components/como-trabajamos/data.ts` → `PASOS` (5 pasos).
- Textos por paso (×5): `titulo` (1 palabra: Dialogamos/Investigamos/Diseñamos/Implementamos/Evaluamos), `resumen` (frase destacada en verde, 4-8 palabras) y `detalle` (párrafo, 1-2 oraciones). Total 15 textos + `fotoAlt` por paso (5 alts).
- Imágenes: 5 fotos, una por paso, `aspect-[3/4]`, con `alt` propio.
- Conteo fijo: **5 pasos**, cada uno es un panel a pantalla completa que hace cross-fade por scroll (500vh de scroll repartidos en 5); agregar un paso implica recalcular esa coreografía.
- **Nota de duplicación:** esta sección y "La mirada ED" de Qué hacemos (§2.3) cuentan el mismo "cómo trabaja ED" con dos vocabularios distintos (5 verbos acá vs. 6 verbos allá) y datasets separados que comparten algunas fotos. Si se edita el método en una página, probablemente haya que revisar la otra.

### 1.4 Áreas de especialización — `LineasAccion`
- Archivos: `LineasAccion.tsx` + `lineas-accion/CartaArea.tsx`.
- Datos: `src/features/home/components/lineas-accion/data.ts` → `AREAS` (7 áreas).
- Textos: título de sección "Áreas de especialización" + bajada (1 frase) + CTA "Mirá los casos donde lo aplicamos" (hardcodeados en `LineasAccion.tsx`) + por área (×7): `titulo`, `frase` (verde, 4-8 palabras) y `detalle` partido en `{antes, clave, despues}` (la porción `clave` va en negrita — un fragmento textual exacto, no libre). Total 7×4 = 28 textos de área + 3 de cabecera.
- Imágenes: ninguna foto; cada carta lleva un ícono de set (`Icon`, componente SVG, no imagen editable como archivo).
- Conteo fijo: **7 cartas** en abanico (desktop) — la geometría del abanico se calcula a partir de `AREAS.length`, así que agregar una octava funciona, pero cambia el spread visual.
- **Nota de duplicación:** este archivo describe las mismas 7 áreas que `src/features/que-hacemos/data/areas.ts` (§2.2), con el mismo `titulo`/`frase`/`detalle`, pero **son dos archivos de datos independientes**: no hay una sola fuente. Editar el nombre o la frase de un área hay que hacerlo en los dos lugares o se desincroniza.

### 1.5 Biblioteca y Novedades — `BibliotecaNovedades`
- Archivo: `src/features/home/components/BibliotecaNovedades.tsx`. Sin datos propios: toma los 4 primeros `ITEMS_DESTACADOS` de Biblioteca (§5) y las 4 novedades más nuevas de Novedades (§6).
- Textos propios de esta sección: 2 títulos ("Biblioteca"/"Novedades") + 2 bajadas de una línea. Las filas (título, fuente/fecha o categoría/fecha) son 100% reflejo de los datos de las otras dos páginas — no se editan acá.
- Imágenes: miniaturas 64×64 reusadas de Biblioteca/Novedades, sin fotos propias.

### Total aproximado — Inicio
~78 textos editables distintos (sin contar lo que solo refleja Biblioteca/Novedades) y ~24 imágenes (19 fotos propias + 5 logos de aliados compartidos).

---

## 2. Qué hacemos — `/que-hacemos` (`src/app/(sitio)/que-hacemos/page.tsx`)

Orden de scroll: **Hero → Escena del faro → Cómo trabajamos (mirada ED) → Áreas → (víbora decorativa) → Niveles → Proyectos y aplicaciones → Cierre**.

### 2.1 Hero + escena del faro — `QueHacemosHero` + `QueHacemosHeroFaro`
- Archivos: `QueHacemosHero.tsx`, `que-hacemos-hero/TitularQH.tsx`, `que-hacemos-hero/CapsulaPortal.tsx`, `QueHacemosHeroFaro.tsx`, `FaroEscena.tsx` (decorativo, sin texto), `hero-faro/PreguntasFaro.tsx`, `hero-faro/CierreFaro.tsx`.
- Datos: `src/features/que-hacemos/data/areas.ts` → `AREAS` (para los 7 chips) + `src/features/que-hacemos/components/preguntas-faro.ts` → `PREGUNTAS` (hardcoded array, no en `data/`).
- Textos:
  - H1 en 2 líneas: "Generamos y" / "transformamos." — muy calibrado (el comentario del código detalla varias iteraciones de longitud para que el salto de línea caiga en un punto exacto en distintos anchos de pantalla).
  - Bajada: 1 párrafo (~125 caracteres, con historial de reescritura documentado palabra por palabra).
  - 7 chips (uno por área, usa `nombreCorto` si existe).
  - Cápsula/botón: "Entrá al recorrido" (letra por letra para animación).
  - Escena del faro, 4 "golpes" de texto (`S0` a `S4`):
    - S0: 1 frase ("Cada contexto educativo presenta...").
    - S1: frase del cartel oficial con una palabra resaltada ("aprendizaje matemático"), + hay un `<h2 className="sr-only">` con el mismo mensaje para accesibilidad.
    - S2: `PREGUNTAS` — **4 frases** tipo `{antes, clave, resto}`, la palabra `clave` se subraya con la luz. La primera es "más grande" (tesis); las otras 3 se desprenden de ella.
    - S4 (cierre): título "La transformación queda encendida en cada equipo." + botón "Ver las siete áreas".
- Imágenes: ninguna foto; todo es SVG/CSS generativo (cielo, faro, estrellas) salvo 1 logotipo PNG decorativo (`logotipo-principal-ed-negativo.png`) montado junto al mensaje S1.
- Conteo fijo: **4 frases del enfoque** (`PREGUNTAS`), con posiciones (`VERBO_POS`) y ángulos de luz (`HAZ_VERBO`) calculados a mano para cada una — agregar una quinta requiere agregar también su posición y su ángulo.

### 2.2 Áreas de especialización — `AreasQueHacemos`
- Archivos: `AreasQueHacemos.tsx` + `areas/IndiceAreas.tsx` + `areas/PanelArea.tsx`.
- Datos: `src/features/que-hacemos/data/areas.ts` → `AREAS` (7 áreas) + `AREAS_INTRO` + `BAJADA`.
- Textos por área (×7): `nombre`, `nombreCorto?` (para el índice), `idea` (frase verde), `queEs` (párrafo), `teLlevas` (**lista de 3 bullets exactos** — "qué te llevás"), `paraQuien` (1 frase), `hechos` (array de proyectos reales — **cargado pero no publicado**, ver nota abajo). Total ≈ 7×(1+1+1+1+3+1) = 63 textos + intro.
- Imágenes: 1 foto por área (7 fotos, `aspect-[16/9]`, con `alt`).
- Notas:
  - `hechos` (los "ejemplos de trabajo" con nombre y cifra) están en los datos pero el componente **no los renderiza**: el comentario dice que se sacaron el 2026-09-09 a pedido del cliente y quedan "para cuando se decida dónde van". Es contenido ya escrito y listo, pendiente de una decisión de diseño.
  - Esta es la versión "larga" de las mismas 7 áreas que aparecen resumidas en el Inicio (§1.4): mismo `nombre`/`idea`≈`frase`/`queEs`≈`detalle`, pero acá con 3 campos más (`teLlevas`, `paraQuien`, `hechos`) que no existen en la versión del home.
  - `teLlevas` es una lista de **exactamente 3** bullets por área — no hay lógica que soporte 2 o 4, es solo una convención de copy.

### 2.3 Cómo trabajamos («La mirada ED») — `MiradaPasos`
- Archivos: `MiradaPasos.tsx` + `mirada-pasos/PanelMirada.tsx` + `mirada-pasos/BandaAliados.tsx` + `mirada-pasos/IndicadorPasos.tsx`.
- Datos: `src/features/que-hacemos/data/areas.ts` → `MIRADA_INTRO` (1 título: "Cómo trabajamos") + `MIRADA` (6 verbos).
- Textos por verbo (×6: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar): `idea` (frase verde) + `texto` (párrafo) + `fotoAlt`. Total 18 textos.
- Imágenes: 6 fotos (una por verbo, algunas compartidas con el Inicio §1.3) + 5 logos de aliados (compartidos, banda "Nos acompañan" al cierre de la sección).
- Conteo fijo: **6 paneles apilados en 2 grupos de 3** (`POR_GRUPO = 3` en `mirada-pasos/grupos.ts`); el diseño (altos, solapas) está calculado para 6 exactos repartidos así — cambiar la cantidad requiere retocar `globals.css` además del dato.
- Ver nota de duplicación en §1.3: mismo concepto que "Cómo trabajamos" del Inicio, 6 verbos acá vs. 5 allá, datasets separados.

### 2.4 Niveles en los que intervenimos — `NivelesEscala`
- Archivos: `NivelesEscala.tsx` + `niveles-escala/NivelCard.tsx`.
- Datos: `src/features/que-hacemos/data/niveles.ts` → `NIVELES` (5 niveles).
- Textos: título de sección "Niveles en los que intervenimos" + frase grande "Del aula al sistema educativo." (hardcodeada en `NivelesEscala.tsx`) + por nivel (×5: Docentes, Estudiantes, Escuelas, Sistemas educativos, Redes en cinco países): `k` (nombre) + `d` (descripción, 1 frase). Total 10 textos + 2 de cabecera.
- Imágenes: ninguna (son tarjetas de texto).
- Conteo fijo: **5 niveles**, posicionados a mano en zig-zag (`niveles-escena.ts`, no leído en detalle pero referenciado por `POS[i]`) — agregar un sexto nivel implica agregar su posición.
- Nota: el comentario del archivo de datos dice que es "PENDIENTE de validación fina con el cliente".

### 2.5 Proyectos y aplicaciones — `ProyectosAplicaciones`
- Archivos: `ProyectosAplicaciones.tsx` + `proyectos-aplicaciones/FichaProyecto.tsx` + `proyectos-aplicaciones/Bajada.tsx` + `proyectos-aplicaciones/TituloPractica.tsx`.
- Datos: `src/features/que-hacemos/data/proyectos.ts` → `PROYECTOS_INTRO`, `CAPITULOS` (3), `FICHAS` (8, derivadas de los capítulos).
- Textos: intro (volanta + título con un fragmento resaltado) + por capítulo (×3): `titulo` + `bajada` (con un fragmento en negrita `resaltado`) + por ficha (×8): `paises` (banderas), `sello` (con quién/cuándo), `cifra` + `unidad` (el número protagonista), `nombre`, `texto` (frase de ≤20 palabras, límite explícito en el tipo). Total ≈ 8×4 + 3×2 + 2 = 40 textos.
- Imágenes: ninguna foto; cada ficha lleva un pictograma de set (`Pictograma`, SVG) y una bandera por país (`Bandera`, SVG), no archivos de imagen editables.
- Conteo fijo: **3 capítulos (4+3+1 fichas = 8 total)** — el comentario dice explícitamente que el reparto es a propósito ese: "el doblez es el de los capítulos (4 + 3 + 1)". Nombres propios de organizaciones están restringidos por autorización (comentario: "SEMS-SEP, OEI y el Ministerio de Educación de Argentina no se nombran: sin autorización").

### 2.6 Cierre — `CierreQueHacemos`
- Archivo: `CierreQueHacemos.tsx`. Todo hardcodeado, sin archivo de datos.
- Textos: título "Cada contexto merece su propia solución." + párrafo + 2 CTA ("Hablemos de tu contexto" / "Conocé la investigación detrás").
- Imágenes: ninguna (fondo generativo).

### Total aproximado — Qué hacemos
~200 textos editables distintos (la página con más volumen de texto del sitio, por las 7 áreas con ficha larga + las 8 fichas de proyectos) y ~14 imágenes (7 de áreas + 6 de mirada + 1 logo decorativo del hero).

---

## 3. Quiénes somos — `/quienes-somos` (`src/app/(sitio)/quienes-somos/page.tsx`)

Orden de scroll: **Hero → Origen, sentido y evolución → Nuestra mirada → Quiénes sostienen ED (equipo)**. El sitemap prevé además "Trayectoria y alianzas" y "Cierre", que hoy **no existen** (comentario en `page.tsx`).

### 3.1 Hero — `QuienesSomosHero`
- Archivo: `QuienesSomosHero.tsx`. Hardcodeado.
- Textos: H1 en 2 líneas ("No capacitamos." / "Transformamos.", cada línea con su propio color de relleno) + 1 bajada + botón "Quiénes sostienen ED" (ancla a la sección de equipo).
- Imágenes: ninguna foto (fondo `MathField`, generativo).

### 3.2 Origen, sentido y evolución — `OrigenEd`
- Archivos: `OrigenEd.tsx` + `origen/PilaresOrigen.tsx` + `origen/BeatRemate.tsx` + `origen/TrayectoriaHorizontal.tsx`/`TrayectoriaVertical.tsx` + `origen/PanelFotos.tsx`.
- Datos: `src/features/quienes-somos/components/origen/data.ts` → `HITOS` (5), `PREGUNTA` (1 frase), `PILARES` (3 etiquetas), `FOTOS` (3), `PALABRAS_REMATE` (4 palabras). Los **párrafos largos de los 3 "pilares" están hardcodeados** en `PilaresOrigen.tsx`, no en `data.ts` (el archivo de datos solo tiene las piezas cortas: pregunta, etiquetas, fotos, hitos).
- Textos, 5 "beats" narrados por scroll:
  1. "No nacimos de una teoría." (título) + 1 párrafo.
  2. Cita textual de una profesora, 3 líneas + atribución ("— Una profesora, al cerrar uno de los primeros encuentros..."). Marcada en el código como "dramatización del testimonio — VALIDAR con cliente".
  3. Pregunta que se tipea letra por letra (`PREGUNTA`) + 1 párrafo de respuesta.
  4. "Qué es Empoderamiento Docente" + título-definición con 1 fragmento resaltado + **5 hitos** de línea de tiempo (`HITOS`: Maestría, Doctorado, México, Argentina, Hoy — cada uno con `t` corto y `d` de 1 frase).
  5. Remate: "Vivir para hacer vivir." — 4 palabras (`PALABRAS_REMATE`), la 1ª y la 4ª en verde.
- Imágenes: 3 fotos (`FOTOS`, panel lateral que solo se ve en desktop) con `alt`.
- Conteo fijo: **5 beats** narrados con scroll-scrub de 560vh y **5 hitos** de línea de tiempo con coordenadas propias (`NODOS`, sobre un `viewBox` de 1000×220) — agregar un hito exige agregar también su coordenada.

### 3.3 Nuestra mirada — `MiradaEd`
- Archivos: `MiradaEd.tsx` + `mirada/DetallePerspectiva.tsx` + `mirada/FichasPerspectiva.tsx` + `mirada/SintesisMirada.tsx`.
- Datos: `src/features/quienes-somos/components/mirada/constelacion-mirada.ts` → `PERSPECTIVAS` (3).
- Textos: título de apertura "Una misma mirada, tres principios." + por perspectiva (×3: Pensamiento matemático / Empoderamiento desde el saber / Transformación educativa): `label`, `fraseAntes` + `tachado?` + `frasePunto` (una frase que se tacha en vivo), `afirmativaPre` + `afirmativaAccent` + `afirmativaPost` (la reformulación) y **`fichas`: exactamente 5 bullets cortos por perspectiva**. Total 3×(1+3+3+5) = 36 textos + síntesis final (1 frase + 1 párrafo puente).
- Imágenes: ninguna (constelación SVG generativa).
- Conteo fijo: **3 perspectivas × 5 fichas cada una** — el tipo `Perspectiva.fichas` no impone el número 5, pero las tres perspectivas lo respetan por convención de diseño (columnas parejas).

### 3.4 Quiénes sostienen ED (equipo) — `ImpulsanEd`
- Archivos: `ImpulsanEd.tsx` + `PersonCard.tsx` + `TeamProfileOverlay.tsx` + toda la carpeta `profile/inmersivo/` (perfil a pantalla completa de cada persona).
- Datos: `src/features/quienes-somos/data/equipo.ts` (**3089 líneas — el archivo de contenido más grande del sitio**). Título de sección + bajada están hardcodeados en `ImpulsanEd.tsx` ("La red tiene nombres." + 1 párrafo); todo lo demás sale de `equipo.ts`.
- Estructura: **15 personas** repartidas en 4 niveles (`tier`) —
  - Nivel 1, Dirección general: 1 persona (Daniela).
  - Nivel 2, Dirección: 2 personas (Karla, Raquel).
  - Nivel 3, Líderes de área y proyecto: 6 personas (Iván, Judith, Gabriela, Marcela, Luis López, Andrea).
  - Nivel 4, Facilitación y diseño: 6 personas (Wendolyne, Pedro, Paola, Darly, Luis Cabrera, Eduardo).
- Cada persona (tarjeta básica, siempre presente): `nombre`, `rol`, `pais`, `bio` (párrafo), `imagePosition`/`imageZoom` (encuadre de foto, no es "contenido" pero sí un valor por persona que un editor va a querer tocar), `linkedin?`, `pubs?` (lista de publicaciones con título/url opcional), `sinFoto?` (Andrea Vergara pidió no publicar foto; la tarjeta se resuelve tipográfica en vez de con imagen).
- **14 de las 15 personas** (todas salvo Marcela Cano) tienen además un `profile` — el "recorrido inmersivo" (perfil a pantalla completa, ruta con overlay): `fullName`, `role`, `location`, `headline` (1 frase-título), `intro` (párrafo), `formation` (lista de títulos académicos), `categories` (2-3 etiquetas con color), **`stages`** (entre 4 y 7 "etapas" de trayectoria por persona, cada una con `eyebrow`, `period?`, `title`, `body`, a veces `quote`, `milestones[]`, `branches[]`, `tags[]` o `publications[]`) y `closing` (título + 1-2 párrafos de cierre). Esto es contenido *extenso* — cada perfil completo son varios cientos de palabras repartidas en 4-7 bloques.
  - **Nota importante:** el comentario al inicio del archivo dice "`Persona.profile` es OPCIONAL: solo las personas con recorrido desarrollado lo tienen. Hoy únicamente Daniela (caso modelo)". Eso ya no es así: 14 de 15 personas tienen perfil completo. El comentario quedó desactualizado y conviene corregirlo o al menos saber que el perfil inmersivo es la norma, no la excepción.
- Imágenes: 1 foto por persona en `/equipo/{key}.jpg` (14 con foto real, 1 sin foto por decisión propia) + algunas personas con `profile.cutout` (imagen recortada o apaisada para el perfil inmersivo, puede repetir la misma foto con otro tratamiento).
- Conteo fijo: **4 niveles jerárquicos** con layouts de grilla distintos (1 / 2 / 2×3 / 2×3) — mover a una persona de nivel cambia su tamaño de tarjeta, no es un simple cambio de etiqueta.

### Total aproximado — Quiénes somos
Muy alto y desigual: ~90 textos "de página" (hero, origen, mirada, encabezados de equipo) + **las 14 fichas de equipo son, en conjunto, con diferencia el bloque de texto más grande del sitio** (cada perfil son varios formularios anidados: datos básicos + 4-7 etapas con sus propios campos). Imágenes: ~15 fotos de equipo + 3 de origen + recortes de perfil variables por persona.

---

## 4. Investigación — `/investigacion` (`src/app/(sitio)/investigacion/page.tsx`)

Orden de scroll: **Hero (archivo, hoja 01) → Líneas de investigación (hoja 02) → Ciclo de investigación aplicada (hoja 03) → Investigación en acción / casos (hoja 04) → Cierre**. Metáfora de "archivo" consistente: cada sección es una "hoja" numerada.

### 4.1 Hero — `InvestigacionHero`
- Archivos: `InvestigacionHero.tsx` + `hero/HojaHistoria.tsx`.
- Datos: `src/features/investigacion/components/constelacion.ts` → `FIGURAS` (4 figuras: Preguntar/Mirar de cerca/Relacionar/Transformar).
- Textos: H1 "Investigamos para transformar la matemática escolar." + 2 CTA ("Conocé qué investigamos" / "Ver los casos") + 4 "beats" narrados (`FIGURAS`, cada uno con `etiqueta` de 1-2 palabras y `frase` de una oración) que se pintan palabra por palabra con el scroll.
- Imágenes: ninguna (constelación de puntos SVG).
- Conteo fijo: **4 figuras**, cada una con **exactamente 13 puntos** en coordenadas propias (mismos 13 puntos reordenados en 4 dibujos distintos) — es geometría, no vale editar el texto sin tocar las coordenadas si se agrega una 5ª figura.

### 4.2 Líneas de investigación — `LineasInvestigacion`
- Archivo: `LineasInvestigacion.tsx`. **Sin archivo de datos**: el array `LINEAS` vive arriba del componente (marcado "VALIDAR con ED antes del lanzamiento").
- Textos: eyebrow "No son servicios. Son preguntas." + título de sección + 6 líneas, cada una con `nombre` (título largo del área de investigación) + `pregunta` (la pregunta de investigación completa, es el texto protagonista de la tarjeta) + `clave` (fragmento exacto de la pregunta que se subraya) + CTA final "Mirá la investigación en acción".
- Imágenes: ninguna foto (1 logotipo decorativo de marca al pie).
- Conteo fijo: **6 líneas de investigación**, cada `caso` (campo que cruza línea→caso de investigación, ver §4.4) apunta a uno de los 4 casos existentes; el comentario dice que ese cruce es "editorial" y falta validarlo con el cliente.

### 4.3 Ciclo de investigación aplicada — `EspiralInvestigacion`
- Archivos: `EspiralInvestigacion.tsx` + `EspiralLamina.tsx` (vivo) / `EspiralEstatica.tsx` (fallback).
- Datos: `src/features/investigacion/components/estaciones.ts` → `VUELTA_1` (4 estaciones) + `VUELTA_2` (4 estaciones) + `BISAGRA_TEXTO` + `REMATE_TEXTO`.
- Textos: 8 estaciones (Fase experiencial, Implementación en contexto, Práctica reflexiva, Resignificación del saber / Registrar evidencias, Analizar e interpretar, Sistematizar y producir conocimiento, Retroalimentar y ajustar), cada una con `nombre`, `texto` (versión larga, para el fallback estático), `breve` (versión corta para la animación — pedida explícitamente más corta por el cliente), `clave` (fragmento subrayado) y opcionalmente `destacado` (cita adicional, solo la 1ª estación la tiene). Más 1 frase-bisagra y 1 frase-remate.
- Imágenes: ninguna (lámina SVG).
- Conteo fijo: **8 estaciones en 2 vueltas de 4** — cada estación tiene 2 versiones del mismo texto (larga y corta) que hay que mantener sincronizadas si se edita el contenido.

### 4.4 Investigación en acción (casos) — `InvestigacionEnAccion`
- Archivos: `InvestigacionEnAccion.tsx` (wrapper) → `casos/CasosInvestigacion.tsx` + `casos/CarpetaCaso.tsx` + `casos/ExpedienteCaso.tsx` + subcarpetas `carpeta/` y `expediente/` (piezas visuales del expediente).
- Datos: `src/features/investigacion/data/casos.ts` → `CASOS` (**4 casos**). Título de sección "Casos de investigación" hardcodeado en `CasosInvestigacion.tsx`.
- Por caso (×4): `pregunta` (título-pregunta del caso), `eje` (línea de investigación a la que pertenece), `indicio` (frase-anzuelo corta), `ficha` (`periodo`, `ambito`, `estado`: EN CURSO/CERRADO), `contexto` (párrafo), `preguntaInvestigacion` (1 frase), `lamina` (imagen + `alt` + `rotulo`), **`evidencias`** (lista variable: caso 1 y 3 tienen 4-5, caso 2 tiene 5, caso 4 tiene 9 — cada evidencia con `rotulo`, `titulo`, `descripcion`), `analisis` (párrafo), `aprendizaje` (1 frase, se muestra como nota manuscrita), `queCambio` (párrafo), `produccionRelacionada` (lista de referencias con título+link) y `aclaracion?`.
- Imágenes: 1 lámina ilustrada por caso (4 en `/public/investigacion/`).
- **Notas importantes:**
  - Los casos 1 y 2 son reales (respaldados por publicaciones con arbitraje); los casos 3 y 4 son **provisionales** ("cubren las dos aplicaciones que todavía no tienen caso real"). Ya no muestran la etiqueta "DEMO" en pantalla (`esDemo: false`), pero el mecanismo para reactivarla sigue ahí, y el comentario dice explícitamente que las láminas de esos dos casos "siguen siendo las ilustraciones genéricas de los demos" — contenido visual pendiente de reemplazo real.
  - Total de evidencias: 5 + 5 + 4 + 9 = **23** fichas de evidencia repartidas de forma desigual entre los 4 casos.

### 4.5 Cierre — `CierreInvestigacion`
- Archivo: `CierreInvestigacion.tsx`. Hardcodeado.
- Textos: 2 bloques de invitación — "La investigación también se comparte." + botón "Explorá la Biblioteca"; y "Investigar permite hacer mejores preguntas." + botón "Conversemos".
- Imágenes: ninguna (cielo/faro generativo, reusa los 13 puntos de `constelacion.ts` como estrellas).

### Total aproximado — Investigación
~90 textos de página + **los 4 casos suman, entre todos, más de 60 textos** (evidencias incluidas) por su estructura anidada. Imágenes: 4 láminas de caso + 0 fotos propias en el resto de la página (todo es SVG/CSS generativo, salvo lo compartido).

---

## 5. Biblioteca — `/biblioteca` (`src/app/(sitio)/biblioteca/page.tsx`)

Orden de scroll: **Hero → Destacados → Listado/catálogo → Puente a Investigación → Cierre**.

### 5.1 Hero — `BibliotecaHero`
- Archivo: `BibliotecaHero.tsx` + `CategoriasRail.tsx` (usa `TIPOS` de materiales.ts como chips).
- Textos: H1 "Publicaciones y recursos" (2 líneas) + 1 bajada + buscador (placeholder "Buscá por título, tema o autora…").
- Imágenes: ninguna (puntos de faro generativos).

### 5.2 Destacados — `DestacadosBiblioteca`
- Archivos: `DestacadosBiblioteca.tsx` + `destacados/IntroDestacados.tsx` + `destacados/ArticuloDestacado.tsx` + `destacados/IndiceDestacados.tsx`.
- Datos: `src/features/biblioteca/data/materiales.ts` → `DESTACADOS` (4) combinados con `MATERIALES` vía `ITEMS_DESTACADOS`.
- Textos: eyebrow "Material destacado" + título "Cuatro materiales para entrar a la biblioteca" + 1 párrafo de intro + por destacado (×4): `rotulo` (etiqueta corta tipo "RELIME 2025"), `tagline` (1 frase) y `detalle` (párrafo adicional, se suma a la `descripcion` que ya trae el material del catálogo).
- Imágenes: 4 portadas (las mismas del material referenciado en el catálogo).
- Conteo fijo: **4 destacados** (`ITEMS_DESTACADOS` matchea por `titulo` exacto contra `MATERIALES`; si el título cambia en un lado y no en el otro, el destacado desaparece silenciosamente — está documentado como riesgo en el propio archivo de datos).

### 5.3 Catálogo de materiales — `MaterialesListado`
- Archivo: `MaterialesListado.tsx`.
- Datos: `src/features/biblioteca/data/materiales.ts` → `MATERIALES` (**61 publicaciones**), `TIPOS` (7 categorías), `TEMAS` (11), `PUBLICOS` (4).
- Textos por material (×61): `titulo`, `autores`, `descripcion` (párrafo), `tipo`, `tema`, `publico`, `fecha` (texto mostrado) + `anio` (para filtrar), `formato`, `paginas?`, `fuente` (para el label "Leer en X"). Es, junto con el equipo, el dataset más grande del sitio en cantidad de ítems (61 filas × ~6 campos de texto).
- Imágenes: 61 portadas en `/public/biblioteca/portadas/` — el comentario del archivo dice que son **tipográficas, generadas a partir de la ficha** de cada publicación (no son fotos ni tapas reales), "si el equipo consigue las tapas reales, se reemplazan por archivo".
- Textos de interfaz fijos (no por material): "Filtros", "Limpiar todo", 3 grupos de filtro ("Tipo de material", "Público", "Año"), contador de resultados, estado vacío ("No encontramos materiales con esa combinación de filtros...") y paginación "Ver N más" / "Ver menos" (de a 8 en 8).

### 5.4 Puente a Investigación — `PuenteInvestigacion`
- Archivo: `PuenteInvestigacion.tsx`. **Sin archivo de datos**: el array `CARDS` (4 tipos de recurso) vive arriba del componente.
- Textos: título "Detrás de cada recurso, una investigación." + 2 CTA + 4 tarjetas (Publicaciones/Materiales/Proyectos/Guías), cada una con `desc` (párrafo) y `linea` (a qué línea de investigación "nace" — el comentario marca este mapeo como "inferido del modelo conceptual — VALIDAR con cliente", no dato confirmado).
- Imágenes: 4 fotos (una por tarjeta, reusadas del pool general de `/fotos/`).
- Conteo fijo: **4 tarjetas** que se apilan como lomos de libro en el escenario animado — el ancho del "lomo" (`PASO`) y el desplazamiento están calculados para 4.

### 5.5 Cierre — `CierreBiblioteca`
- Archivo: `CierreBiblioteca.tsx`. Hardcodeado.
- Textos: título "Un faro para cada aula." + 1 párrafo + 2 CTA ("¿Buscás un material puntual?" / "Ver novedades").
- Imágenes: ninguna (puntos de faro generativos).

### Total aproximado — Biblioteca
~30 textos "de página" + **61 filas de catálogo** (el bloque de contenido más numeroso, aunque cada fila es corta) + 4 destacados. Imágenes: 61 portadas tipográficas (no fotográficas) + 4 fotos del puente.

---

## 6. Novedades — `/novedades` (`src/app/(sitio)/novedades/page.tsx`, + ficha `src/app/(sitio)/novedades/[slug]/page.tsx`)

Orden de scroll: **Hero → Destacadas → Filtros/Últimas → ED en movimiento → Lanzamientos recientes → Cierre**.

### 6.1 Hero — `NovedadesHero`
- Archivo: `NovedadesHero.tsx` + `RotadorPalabras.tsx` + `SplitFlap.tsx`.
- Datos: usa `NOVEDADES[0].fecha` para la "última actualización" (no es contenido editable de por sí, se deriva).
- Textos: H1 "Siempre hay [palabra]." donde la palabra gira en loop entre **5 opciones hardcodeadas** ("novedades.", "publicaciones.", "encuentros.", "convocatorias.", "prensa." — nótese: 4 de esas 5 coinciden con las categorías de datos, pero "encuentros." no matchea ninguna `CategoriaKey` real, que es "eventos"; posible inconsistencia de copy) + 1 bajada + etiqueta "Última actualización" con fecha automática.
- Imágenes: ninguna (puntos de faro).

### 6.2 Destacadas — `NovedadDestacada`
- Archivo: `NovedadDestacada.tsx`. Sin datos propios: toma la novedad `destacada: true` (o la primera) y la siguiente más nueva de `NOVEDADES` (§6.3).
- Textos propios de la sección: eyebrow "Novedades destacadas" + 2 CTA "Leer la nota" (uno por tarjeta). El resto (categoría, fecha, título, bajada) refleja los datos de Novedades.
- Imágenes: 2 fotos reflejadas de los datos.

### 6.3 Filtros / Últimas novedades — `FiltrosNovedades`
- Archivo: `FiltrosNovedades.tsx` + `NovedadCard.tsx`.
- Datos: `src/features/novedades/data/novedades.ts` → `NOVEDADES` (**9 items**) + `CATEGORIAS` (5).
- Textos por novedad (×9): `titulo`, `bajada` (párrafo), `categoria`, `fecha`, y opcionalmente **`cuerpo`**: solo **2 de las 9** novedades (`unesco-montevideo` y `relime-2025`) tienen cuerpo completo y por lo tanto ficha propia en `/novedades/[slug]` — las otras 7 son solo tarjeta, sin página de detalle. Cada `cuerpo` es una lista de secciones tituladas (2-3 secciones por nota, cada una con `titulo` + 1-2 `parrafos`).
- Textos de interfaz fijos: título "Lo que viene pasando.", chips de categoría ("Todas" + 5 categorías), contador de resultados, estado vacío ("Todavía no hay novedades en esta categoría." + "Pronto vamos a compartir nuevas acá." + botón "Ver todas") y paginación (6 por página).
- Imágenes: 9 fotos (una por novedad, reusadas de otras carpetas de `/fotos/` salvo la de UNESCO que tiene imagen propia del logo en `/novedades/alianza-unesco.webp`).
- Nota: el comentario en `novedades.ts` aclara que las categorías "eventos", "convocatorias" y "prensa" **están vacías hoy** — el filtro por esas categorías siempre da el estado vacío hasta que el cliente mande contenido real.

### 6.4 ED en movimiento — `EdEnMovimiento`
- Archivo: `EdEnMovimiento.tsx`. Sin texto de cabecera propio (título de sección = `aria-label`, no visible).
- Datos: `src/features/novedades/data/novedades.ts` → `MOVIMIENTO` (6 momentos).
- Textos por momento (×6: En las aulas / Con docentes / Investigación / Diseño / Congresos / Cinco países): `etiqueta` (mono, corta) + `frase` (título grande) + `acento` (substring exacto de `frase` que va en verde — si no matchea literal, la frase completa se muestra en blanco sin acento, es una regla frágil).
- Imágenes: 6 fotos (una por momento).
- Conteo fijo: **6 momentos** con posición y lado alternado (`LANES`) calculados a mano.

### 6.5 Lanzamientos recientes — `LanzamientosRecientes`
- Archivo: `LanzamientosRecientes.tsx`.
- Datos: `src/features/novedades/data/novedades.ts` → `LANZAMIENTOS` (5, los mismos destacados de Biblioteca con otro recorte).
- Textos: título "Recién salido, para el aula." + link "Ir a Biblioteca" + por lanzamiento (×5): `tipo` (p. ej. "Libro · Gedisa 2016") + `titulo`.
- Imágenes: 5 fotos.

### 6.6 Cierre — `CierreNovedades`
- Archivo: `CierreNovedades.tsx`. Hardcodeado.
- Textos: título "No te pierdas nada." + 1 párrafo (varía según si hay redes sociales cargadas o no, ver `siteConfig.redes`) + CTA "Hablemos".
- Imágenes: ninguna.

### 6.7 Ficha de novedad — `/novedades/[slug]` → `FichaNovedad`
- Archivo: `src/features/novedades/components/FichaNovedad.tsx`. Sin datos propios: renderiza el `cuerpo` de la novedad (§6.3).
- Textos fijos de interfaz: "Todas las novedades" / "Volver a novedades" (navegación), y si la novedad tiene `publicacion` asociada, un botón hacia esa ficha del catálogo de Biblioteca (`AccionPublicacion`, no leído en detalle).
- Imágenes: 1 foto grande (la misma `imagen` de la novedad, reusada en dos tamaños).

### Total aproximado — Novedades
~55 textos de página + **9 novedades** (con 2 de ellas llevando cuerpo extendido de 2-3 secciones cada una) + 6 momentos + 5 lanzamientos. Imágenes: ~9 fotos de novedades + 6 de "en movimiento" (con solape) + 5 de lanzamientos (con solape).

---

## 7. Contacto — `/contacto` (`src/app/(sitio)/contacto/page.tsx`)

**No es una página de scroll**: es una experiencia de una sola pantalla con 4 "vistas" que se transforman entre sí (`hero → apertura → formulario → cierre`), todo dentro de `ContactoExperiencia`.

- Archivos: `ContactoExperiencia.tsx` (orquesta las 4 vistas) + `experiencia/PanelHero.tsx` + `experiencia/ColumnaIdentidad.tsx` + `experiencia/IndiceTemas.tsx` + `experiencia/PanelFormulario.tsx` + `experiencia/CamposContacto.tsx` + `experiencia/RailTema.tsx` + `experiencia/PanelCierre.tsx` + `CanalDirecto.tsx` + `PaisDropdown.tsx`.
- Datos: `src/features/contacto/components/experiencia/data.ts` → `TITULO` ("Hablemos.", único titular de toda la experiencia), `TEMAS` (5 temas de consulta), `EQUIPO_FOTOS` (4 fotos de equipo reusadas) + `EQUIPO_RESTO` (8, el número del chip "+8"), `MAILTO_CV` (plantilla de asunto/cuerpo para "sumate al equipo", arma un `mailto:` con `siteConfig.contacto.email`).
- Vista 0, Hero: solo el titular "Hablemos." animado letra por letra.
- Vista 1, Apertura: rayita + titular (aterriza desde el hero) + frase-pilar "Comunidad docente en torno a la Matemática Educativa." (copy oficial verbatim) + foto de equipo con cartel "Del otro lado, personas" / "Investigan y enseñan matemáticas" + **índice de 5 temas** (`TEMAS`: Formación y acompañamiento / Investigación / Alianzas institucionales / Prensa y difusión / Otra consulta — cada uno `titulo` + `detalle`) + "¿Preferís escribir directo?" + canal directo (mail, y WhatsApp si hubiera número cargado).
- Vista 2, Formulario: breadcrumb "Volver a los temas" + rail con el tema elegido + campos: Nombre y apellido*, Email*, Institución u organización, País (dropdown con los 5 países de `siteConfig.paises` + "Otro"), Mensaje* (placeholder "Contanos qué tenés en mente…") + botón "Enviar consulta" + debajo, "¿Querés estar de este lado? Sumate al equipo" (mailto con CV).
- Vista 3, Cierre: eco del tema elegido + título "Cada propuesta empieza con una conversación." + 1 párrafo + canal directo (repetido, con el mensaje ya armado para copiar) + botón "Hacer otra consulta".
- Imágenes: 1 foto de equipo trabajando (`/fotos/docentes-mesa-redonda.webp`) + 4 fotos de rostros del equipo (avatares, reusadas de `/equipo/`).
- **Nota técnica relevante para el editor de contenido:** el formulario **no tiene backend**. Al enviar, arma un `mailto:` con asunto y cuerpo precargados (comentario explícito: "Envío sin backend todavía"). Si en algún momento se conecta a un servicio real, el copy de la vista de cierre ("Dejamos tu mensaje listo en tu correo...") va a quedar desactualizado.
- Conteo fijo: **5 temas de consulta**, cada uno con su propio ícono — el layout del índice está pensado para 5 filas cortas, entran sin scroll hasta cierto alto de pantalla (hay breakpoints de `max-height` específicos en el CSS para eso).

### Total aproximado — Contacto
~30 textos editables (menos que otras páginas porque gran parte es formulario, no contenido de lectura) y 5 imágenes (1 foto grande + 4 avatares).

---

## (a) Archivos de datos y qué entidad mapean

| Archivo | Entidad | Ítems | Usado en |
|---|---|---|---|
| `src/features/novedades/data/novedades.ts` | Novedades (noticias/notas) + "ED en movimiento" + Lanzamientos | 9 novedades, 6 momentos, 5 lanzamientos, 5 categorías | Novedades, Inicio (resumen) |
| `src/features/biblioteca/data/materiales.ts` | Catálogo de publicaciones/materiales + Destacados | 61 materiales, 4 destacados, 7 tipos, 11 temas, 4 públicos | Biblioteca, Inicio (resumen) |
| `src/features/investigacion/data/casos.ts` | Casos de investigación (archivo de expedientes) | 4 casos, 23 evidencias en total | Investigación |
| `src/features/quienes-somos/data/equipo.ts` | Equipo (personas, jerarquía, perfiles inmersivos) | 15 personas, 14 con perfil extendido | Quiénes somos, Contacto (4 avatares) |
| `src/features/que-hacemos/data/areas.ts` | Áreas de especialización (versión larga) + "La mirada ED" | 7 áreas, 6 verbos | Qué hacemos |
| `src/features/que-hacemos/data/niveles.ts` | Niveles de intervención | 5 niveles | Qué hacemos |
| `src/features/que-hacemos/data/proyectos.ts` | Proyectos y aplicaciones (casos de uso concretos) | 3 capítulos, 8 fichas | Qué hacemos |
| `src/features/home/components/lineas-accion/data.ts` | Áreas de especialización (versión corta, **duplicada** de arriba) | 7 áreas | Inicio |
| `src/features/home/components/como-trabajamos/data.ts` | Método de trabajo, 5 pasos (**variante** de "La mirada ED") | 5 pasos | Inicio |
| `src/features/quienes-somos/components/origen/data.ts` | Hitos de la trayectoria de Daniela/ED, pilares, fotos | 5 hitos, 3 pilares, 3 fotos | Quiénes somos |
| `src/features/quienes-somos/components/mirada/constelacion-mirada.ts` | Las 3 perspectivas de "Nuestra mirada" | 3 perspectivas, 5 fichas c/u | Quiénes somos |
| `src/features/que-hacemos/components/preguntas-faro.ts` | Las 4 frases del "enfoque" en el hero del faro | 4 frases | Qué hacemos |
| `src/features/investigacion/components/constelacion.ts` | Las 4 figuras/beats del hero de Investigación | 4 figuras × 13 puntos | Investigación |
| `src/features/investigacion/components/estaciones.ts` | Las 8 estaciones del ciclo de investigación aplicada | 8 estaciones | Investigación |
| `src/features/contacto/components/experiencia/data.ts` | Temas de consulta, config de la experiencia de contacto | 5 temas | Contacto |
| `src/config/site.ts` | Config institucional: nombre, contacto, países, dirección, redes, frases pilares | — | Todas (footer, metadata, home) |
| `src/config/aliados.ts` | Logos de aliados autorizados | 5 | Inicio, Qué hacemos, Footer |
| `src/config/nav.ts` | Navegación principal + submenús | 5 ítems + submenús | Header, Footer, 404 |
| `src/config/creditos.ts` | Crédito del estudio que hizo el sitio | 1 estudio + 2 colaboradores | Footer |

**Arrays "sueltos" sin archivo de datos** (hardcodeados arriba del componente, candidatos a mover a `data.ts` si se quiere un formulario de edición prolijo): `DATOS` en `home/components/DatosDuros.tsx` (4 métricas), `LINEAS` en `investigacion/components/LineasInvestigacion.tsx` (6 líneas), `CARDS` en `biblioteca/components/PuenteInvestigacion.tsx` (4 tarjetas).

---

## (b) Imágenes compartidas entre páginas

- **Logos de aliados** (`src/config/aliados.ts`, 5 archivos en `/public/aliados/`): aparecen en Inicio (`DatosDuros`), Qué hacemos (`BandaAliados`) y en el Footer de todas las páginas. Un solo lugar para editarlos.
- **Logotipo principal de ED** (`/public/brand/logotipo-principal-ed*.png`, positivo y negativo): navbar, footer (dos veces: chip + wordmark grande), sección S1 del hero de Qué hacemos, pie de página de Líneas de investigación.
- **Fotos de equipo** (`/public/equipo/*.jpg`, 15 archivos): página Quiénes somos (tarjetas + perfiles) y Contacto (4 avatares en la vista de apertura).
- **Pool general de fotos** (`/public/fotos/`, 37 archivos): se reusa mucho entre secciones y hasta entre páginas — por ejemplo `grupos-conversan.webp` aparece tanto en "Cómo trabajamos" del Inicio como en "La mirada ED" de Qué hacemos (mismo verbo "Escuchar/Dialogamos", distinta página); `cubos-mano.webp`/`cubos-dos-manos.webp` aparece en el hero del Inicio y en el área "Materiales" de Qué hacemos; varias fotos del hero del Inicio se repiten en "Lanzamientos recientes" y "Puente a Investigación" de Biblioteca.
- **Portadas de biblioteca** (`/public/biblioteca/portadas/`, 58 archivos): son tipográficas (generadas, no fotos), se ven en Biblioteca (catálogo + destacados) y en el resumen "Biblioteca" del Inicio.

---

## (c) Totales aproximados por página

| Página | Textos editables (aprox.) | Imágenes (aprox.) | Nota |
|---|---:|---:|---|
| Inicio | ~78 | ~24 (19 propias + 5 aliados) | incluye filas reflejadas de Biblioteca/Novedades, no contadas dos veces |
| Qué hacemos | ~200 | ~14 | la página con más volumen de texto (7 áreas con ficha larga + 8 fichas de proyecto) |
| Quiénes somos | ~90 de página + **14 perfiles completos de equipo** | ~15 fotos de equipo + 3 de origen + recortes de perfil | el equipo es, en conjunto, el bloque de contenido más grande del sitio |
| Investigación | ~90 + ~60 de los 4 casos (23 evidencias) | ~4 láminas de caso | casos 3 y 4 con contenido/ilustraciones marcadas como provisionales |
| Biblioteca | ~30 de página + **61 filas de catálogo** | 61 portadas + 4 fotos del puente | el dataset con más ítems (61) |
| Novedades | ~55 + 9 novedades (2 con cuerpo extendido) | ~9 fotos propias + reusadas | 3 de las 5 categorías están vacías hoy |
| Contacto | ~30 (mayormente formulario) | 5 | sin backend: el envío es un `mailto:` |

Todos los conteos son aproximados (algunas listas comparten strings entre variantes desktop/mobile, o entre fallback estático y versión animada, y se contaron una sola vez).

---

## Notas generales para quien diseñe los formularios de edición

1. **Contenido duplicado sin fuente única.** Las 7 áreas de especialización existen en dos archivos (`home/components/lineas-accion/data.ts` y `que-hacemos/data/areas.ts`) con el mismo copy base pero campos distintos. El método de trabajo existe en dos variantes (5 pasos en Inicio, 6 verbos en Qué hacemos) que comparten fotos pero no textos. Un formulario de edición ingenuo que edite solo uno de los dos lugares va a desincronizar el sitio.
2. **Tres niveles de "dato" distintos.** Antes de armar el formulario conviene decidir si se homogeneiza todo a `features/<pagina>/data/*.ts` — hoy coexisten datos en `data/`, datos en subcarpetas de `components/` y arrays sueltos dentro del `.tsx` (ver la lista de "arrays sueltos" en la sección (a)).
3. **Textos "hand-calibrados" a un largo específico.** Varios títulos (el H1 de Qué hacemos, la bajada del hero de Qué hacemos, el remate de Niveles) tienen comentarios extensos documentando por qué el texto mide lo que mide, para que el salto de línea caiga en un punto exacto. Un campo de texto libre sin aviso de longitud puede romper visualmente esas secciones.
4. **Textos partidos en fragmentos, no strings simples.** El "¿Quiénes somos?"/"Misión" del Inicio, la Misión, y las 3 perspectivas de "Nuestra mirada" no son un párrafo editable de una sola pieza: son arrays de fragmentos (`{t, accent}` o `{antes, clave, despues}`) donde una porción exacta del texto se resalta. El formulario tiene que soportar eso, no un textarea.
5. **Conteos fijos ligados a coreografía.** Varias listas no admiten agregar o quitar un ítem sin tocar código: las 11+8 tarjetas del hero del Inicio (posiciones a mano), las 4 frases del enfoque en Qué hacemos (posición + ángulo de luz por frase), los 5 niveles en zig-zag, los 6 paneles de "La mirada ED" (agrupados de a 3), las 4 figuras de 13 puntos del hero de Investigación, los 4 casos con su experiencia de "expediente". Están marcadas en cada sección de este documento.
6. **Contenido pendiente de validar o "no publicado" ya cargado.** Los `hechos` (ejemplos de trabajo con cifra) de cada área en Qué hacemos están escritos pero no se muestran. Los casos 3 y 4 de Investigación son provisionales con ilustraciones genéricas. El campo `titulo` de LinkedIn/redes sociales (LinkedIn) no tiene URL cargada y por eso no aparece en el sitio. Vale la pena que el formulario distinga "campo vacío" de "campo cargado pero oculto a propósito".
7. **El formulario de Contacto no tiene backend.** Envía por `mailto:`. Si se lo conecta a un servicio real, hay que revisar el copy de la vista de cierre, que asume que "se abrió el correo".
8. **El comentario de `equipo.ts` está desactualizado**: dice que solo Daniela tiene perfil inmersivo, pero hoy 14 de 15 personas lo tienen. No afecta el sitio, pero puede confundir a quien lea el archivo para entender el alcance del formulario de equipo.
