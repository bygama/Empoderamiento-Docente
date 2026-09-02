# Arquitectura editorial — Página «Investigación»

> **Fuente de verdad de contenidos:** `ED_Contenido_Maestro_Que_Hacemos_Investigacion.md`
> (v1.0, 17-08-2026), Parte III. Este documento la convierte en arquitectura
> de interfaz. **No especifica animaciones** (fase posterior).
>
> **Nota sobre la página ya construida:** existe una implementación previa
> de `/investigacion` (8 componentes en `src/features/investigacion/`).
> Esta arquitectura se diseña **desde el doc maestro, no desde esa
> implementación**; la auditoría de qué componente existente se reutiliza
> como esqueleto se hace en la fase siguiente.
>
> **Estados heredados del doc maestro:** CONFIRMADO · VIDEOS · SÍNTESIS ·
> **VALIDAR**.

---

## 1. Objetivo de la página

Mostrar que la investigación no es una actividad paralela ni una credencial
académica: es el motor que permite formular mejores preguntas, comprender
qué se quiere transformar, fundamentar decisiones, diseñar experiencias,
interpretar lo que ocurre y producir evidencia y conocimiento que vuelven a
alimentar la acción.

Una persona **no especialista** (ministerio, dirección escolar, fundación,
docente, investigadora o investigador) debe poder comprender: por qué
Empoderamiento Docente investiga, qué temas estudia, qué significa
problematizar la matemática escolar, cómo se relacionan socioepistemología,
pensamiento matemático y empoderamiento, cómo pasa la investigación a la
práctica, por qué el proceso vuelve a empezar y dónde consultar las
publicaciones.

**No debe sentirse como:** un currículum de Daniela · una lista de papers ·
una página solo para especialistas · una repetición de las líneas de acción ·
un catálogo de proyectos · una Biblioteca duplicada.

**Criterio de voz:** preguntas y relaciones de conocimiento (comprender,
problematizar, interpretar, resignificar, producir evidencia, sistematizar).

### Metadata propuesta

- **Title:** `Investigación`
- **Description (SÍNTESIS):** «Investigamos para transformar la matemática
  escolar: socioepistemología, problematización, empoderamiento docente y
  evidencia que vuelve al aula.»

---

## 2. Recorrido por secciones (orden del sitemap)

| # | Sección | Ancla | Función en una frase |
|---|---------|-------|----------------------|
| 1 | Hero | — | Investigar para transformar |
| 2 | Por qué investigamos | `#sentido` | Origen, sentido y los cuatro fundamentos |
| 3 | Líneas de investigación | `#lineas` | Los seis grandes temas que estudia ED |
| 4 | Ciclo de investigación aplicada | `#ciclo` | De la investigación a la acción (ciclo pedagógico) |
| 5 | Volvemos a investigar | `#evidencia` | Evidencia, análisis y producción de conocimiento |
| 6 | Investigación en acción | `#en-accion` | Preguntas aplicadas en proyectos reales |
| 7 | Conexión con Biblioteca | `#biblioteca` | Dónde vive la producción académica |
| 8 | Cierre | — | Acción clara hacia Contacto |

---

## 3. Sección 1 — Hero

### Copy visible

- **H1 (definido en doc maestro, 7 palabras):**
  > **Investigamos** para transformar la matemática escolar.

  Highlight verde en «Investigamos»: esta página es dueña de ese verbo
  («Transformamos» ya está resaltado en el hero de Quiénes somos).

- **Bajada (SÍNTESIS, ~48 palabras — incluye la segunda frase opcional):**
  > Investigar significa comprender problemas reales, construir preguntas
  > junto con quienes habitan los contextos educativos y producir
  > conocimiento capaz de orientar el diseño, la acción y la mejora. La
  > investigación no ocurre antes o después de la práctica: la atraviesa,
  > la interpreta y vuelve sobre ella.

### CTAs

| Ubicación | Texto propuesto (provisorio) | Destino | Prioridad |
|-----------|------------------------------|---------|-----------|
| Hero | «Conocé qué investigamos» | `#lineas` | **Principal** (naranja) |
| Hero | «Explorá la Biblioteca» | `/biblioteca` | Secundaria (outline azul) |

---

## 4. Sección 2 — Por qué investigamos (`#sentido`)

### Copy visible

- **Volanta:** Por qué investigamos
- **H2 (SÍNTESIS):**
  > Nacimos de una **pregunta**.

  (Eco deliberado del «No nacimos de una teoría» de Quiénes somos, sin
  repetir la historia: acá solo la alusión mínima que permite el doc
  maestro §26.)

- **Apertura (SÍNTESIS, ~62 palabras):**
  > Empoderamiento Docente nació de una pregunta: ¿qué sucede cuando las y
  > los docentes transforman su relación con el saber matemático escolar y
  > reconocen su capacidad de intervenir en la realidad? Esa pregunta
  > creció mediante investigación, trabajo con comunidades docentes e
  > intervenciones sostenidas. Hoy sigue orientando una forma de actuar en
  > la que conocer y transformar son parte del mismo proceso.

- **Idea central (cita destacada):**
  > No investigamos para observar la escuela desde afuera. Investigamos con
  > los contextos educativos para comprender lo que ocurre, construir
  > alternativas y aprender de su implementación.

### Cuatro fundamentos (cards: definición visible 25–55 + ampliado)

Las definiciones «web recomendadas» del doc maestro §17 son el **texto
canónico** de estos conceptos en todo el sitio.

**A. Socioepistemología**
> Una mirada que comprende el conocimiento matemático como una construcción
> social: estudia cómo adquiere sentido en contextos, usos, decisiones e
> interacciones concretas, en lugar de separarlo de las personas y de sus
> prácticas.

*Guardarraíl:* nunca «teoría compleja que demuestra que toda matemática es
relativa» (incorrecto y simplificador).

**B. Problematización de la matemática escolar**
> Revisar lo que suele darse por sentado: por qué se enseña un contenido de
> determinada manera, qué sentido tiene una tarea, qué estrategias
> habilita, qué argumentos produce y cómo se relaciona con la vida de
> quienes aprenden.

*Ampliado (VIDEOS, ejemplo concreto que pide el doc maestro §34):*
> Antes de llevar una actividad al aula, la o el docente la vive: explora
> caminos posibles, confronta ideas con colegas, anticipa errores y analiza
> qué intención tiene la tarea. Recién entonces decide cómo llevarla a sus
> estudiantes.

**C. Empoderamiento docente desde el saber**
> Un proceso progresivo y colectivo: las y los docentes fortalecen su
> autonomía, cuestionan prácticas naturalizadas, toman decisiones con
> fundamento y reconocen su capacidad de transformar desde el conocimiento.

*Aclaración obligatoria (visible, no escondida en el ampliado):*
> No es poder sobre estudiantes ni sobre otras personas: es poder sobre la
> propia práctica.

**D. Desarrollo del pensamiento matemático**
> Construir una forma de analizar y actuar: buscar estrategias, formular
> hipótesis, argumentar, anticipar, decidir y comprender información. Los
> contenidos escolares funcionan como herramientas, no como un fin aislado.

### Perspectivas transversales (banda integrada al pie, no quinta card)

> Género, inclusión, derechos humanos, ciudadanía y justicia social
> atraviesan nuestras preguntas, nuestros materiales y nuestras relaciones
> educativas. No son un capítulo aparte: son criterios con los que
> investigamos.

### Componente sugerido

Apertura + cita destacada + grid 2×2 de cards expandibles + banda
transversal. Sin CTA propio: conduce naturalmente a las líneas.

> **Nota de duplicación:** `MiradaEd.tsx` (Quiénes somos) ya presenta
> pensamiento matemático y empoderamiento como **principios de identidad**
> (formato negación/afirmación). Acá son **fundamentos de investigación**
> con definiciones. Mantener formatos distintos y no copiar frases entre
> ambas; si un texto debe vivir en un solo lugar, la definición vive acá.

---

## 5. Sección 3 — Líneas de investigación (`#lineas`)

### Copy visible

- **Volanta:** Líneas de investigación
- **H2 (SÍNTESIS):**
  > Qué **estudiamos** y qué buscamos comprender.

- **Apertura (SÍNTESIS, ~30 palabras):**
  > Estas líneas no describen servicios: describen preguntas. Son los
  > grandes temas que investigamos y los que sostienen, por debajo, cada
  > intervención que diseñamos y acompañamos.

### Seis líneas (fila expandible: nombre + pregunta central visibles; «incluye» como chips al expandir)

1. **Empoderamiento y desarrollo profesional docente**
   *¿Cómo se transforma la relación de las y los docentes con el saber y
   qué condiciones fortalecen su autonomía y capacidad de acción?*
   Chips: liderazgo · comunidades de aprendizaje · reflexión sobre la
   práctica · desarrollo profesional sostenido · toma de decisiones ·
   adaptación de situaciones.

2. **Socioepistemología y construcción social del conocimiento matemático**
   *¿Cómo se construye, usa y resignifica el conocimiento matemático en
   prácticas sociales y contextos educativos?*
   Chips: prácticas sociales · contextos de significación · matemática y
   realidad · construcción social del conocimiento · exclusión y
   participación.

3. **Discurso y problematización de la matemática escolar**
   *¿Qué formas de presentar la matemática se han naturalizado y cómo
   pueden revisarse para ampliar sentidos, estrategias y posibilidades de
   aprendizaje?*
   Chips: discurso matemático escolar · libros de texto · tareas ·
   proporcionalidad · lenguaje simbólico · errores · argumentación ·
   resignificación del saber.

4. **Desarrollo y funcionalidad del pensamiento matemático**
   *¿Cómo pueden los contenidos escolares convertirse en herramientas para
   decidir, argumentar, interpretar información y actuar en el mundo?*
   Chips: estrategias · algoritmos · razonamiento · toma de decisiones ·
   inferencia · medición · visualización · predicción · ciudadanía.

5. **Escenarios, currículum y recursos para el aprendizaje**
   *¿Qué condiciones, tareas, currículas y materiales habilitan
   participación, múltiples estrategias, debate y construcción de sentido?*
   Chips: situaciones de aprendizaje · diseño curricular · materiales ·
   tareas disruptivas · voz estudiantil · diálogo · tecnología pertinente.

6. **Evidencia, evaluación y mejora educativa**
   *¿Qué evidencias permiten comprender una intervención, interpretar sus
   efectos y tomar mejores decisiones sin reducir el aprendizaje a una
   cifra?*
   Chips: diseño de instrumentos · análisis de resultados · evaluación
   educativa · estudios de impacto · sistematización · mejora continua.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de sección | «Mirá la investigación en acción» | `#en-accion` | Secundaria |

### Componente sugerido

Lista vertical de 6 filas expandibles (nombre + pregunta siempre visibles).
Patrón **distinto** del abanico de cartas del home y de las cards de
«Qué hacemos»: acá la protagonista es la pregunta.

> **VALIDAR (crítico):** taxonomía en estado SÍNTESIS — ED debe confirmar
> los nombres antes de publicarlos como «líneas oficiales». Además,
> **Biblioteca ya publica 4 nombres de línea distintos** en su puente
> («Resignificación del conocimiento matemático escolar», «Tareas
> disruptivas y matemática funcional», «Desarrollo profesional docente
> sostenido», «Desarrollo del pensamiento matemático» — marcados como
> inferidos en el código). Tras la validación, **reconciliar el puente de
> Biblioteca con la taxonomía canónica de 6**.

---

## 6. Sección 4 — Ciclo de investigación aplicada (`#ciclo`)

Foco: el **ciclo pedagógico** (cómo una experiencia se convierte en
comprensión y transformación). El ciclo de evidencia va en la sección 5 —
no mezclarlos.

### Copy visible

- **Volanta:** Ciclo de investigación aplicada
- **H2 (SÍNTESIS):**
  > Cómo una **experiencia** se convierte en transformación.

### Cuatro etapas (25–55 palabras visibles cada una)

1. **Fase experiencial**
   > Las y los participantes viven situaciones que permiten cuestionar
   > sentidos, explorar estrategias y problematizar la matemática escolar
   > desde su propia experiencia.

   *Destacado (frase pilar, literal):* **«Vivir para hacer vivir»** — para
   diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra
   relación con la matemática.

2. **Implementación en contexto**
   > Las propuestas se interpretan y se llevan a aulas, instituciones o
   > programas reales. No se reproducen mecánicamente: se contextualizan
   > desde el conocimiento profesional de quienes las implementan.

3. **Práctica reflexiva**
   > Se analiza lo ocurrido, se intercambian experiencias, se confrontan
   > decisiones y se observan las respuestas, estrategias y argumentos que
   > produjo la situación.

4. **Resignificación del conocimiento matemático escolar**
   > La experiencia permite revisar sentidos, usos y formas de
   > participación. El conocimiento deja de ser solo un contenido a
   > transmitir: se convierte en una herramienta para comprender y actuar.

### Cierre del bloque (puente a la sección siguiente)

> La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso
> volvemos a investigar.

### Componente sugerido

Secuencia numerada 01–04 con sensación circular: la etapa 4 conecta
visualmente con la 1 y desemboca en la sección «Volvemos a investigar».
Mobile: lista vertical numerada. Sin CTA.

> **Nota:** la implementación previa tiene un scroll-story para este ciclo
> (`CicloInvestigacion.tsx`). Evaluar en la fase siguiente si ese esqueleto
> sirve para estas 4 etapas; el contenido manda, no el componente.

---

## 7. Sección 5 — Volvemos a investigar (`#evidencia`)

Foco: cómo se construye **evidencia** y se retroalimenta la intervención.

### Copy visible

- **Volanta:** Volvemos a investigar
- **H2 (SÍNTESIS):**
  > Implementar no es **terminar**.

- **Texto base (CONFIRMADO, ~28 palabras):**
  > Implementar es generar una nueva oportunidad para observar, comprender
  > y decidir. La evidencia vuelve al proceso: mejora la intervención y
  > fortalece la capacidad de los equipos.

### Cuatro pasos (25–55 palabras cada uno)

1. **Registrar evidencias** — Recuperamos producciones, decisiones,
   interacciones, resultados y testimonios, siempre con resguardo ético de
   docentes, estudiantes e instituciones.
2. **Analizar e interpretar** — Leemos las evidencias en relación con las
   preguntas, el contexto y los objetivos. Una cifra aislada no explica por
   sí sola qué ocurrió ni por qué.
3. **Sistematizar y producir conocimiento** — Organizamos aprendizajes,
   reconocemos patrones y elaboramos explicaciones: la experiencia se
   convierte en conocimiento que puede comunicarse, discutirse y
   transferirse.
4. **Retroalimentar y ajustar** — Volvemos sobre el diseño, acompañamos
   nuevas decisiones y abrimos otro ciclo de investigación y acción.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de sección | «Conocé lo que publicamos» | `/biblioteca` | Secundaria |

### Componente sugerido

Flujo de 4 pasos (horizontal en desktop, vertical en mobile) conectado
visualmente con el ciclo anterior: es el bucle de retroalimentación que lo
reabre.

---

## 8. Sección 6 — Investigación en acción (`#en-accion`)

### Criterio (doc maestro §21)

Sin repetir los casos comerciales de «Qué hacemos». Acá el foco no es el
cliente: es **qué pregunta se investiga, qué evidencia se genera y qué
decisión cambia**. La pregunta es el titular de cada panel.

### Copy visible

- **Volanta:** Investigación en acción
- **H2 (SÍNTESIS):**
  > Preguntas que cambian **decisiones**.

### Cuatro aplicaciones (panel: pregunta como titular + etiquetas + 1 línea de aprendizaje)

1. **Desarrollo profesional docente**
   *¿Qué cambia cuando una comunidad docente problematiza la matemática
   escolar y revisa colectivamente sus tareas y decisiones?*
   Etiquetas: experiencias formativas · acompañamiento · análisis de aula ·
   liderazgos · comunidades de aprendizaje.
   Aprendizaje buscado: comprender procesos de empoderamiento, autonomía y
   transformación profesional.

2. **Evaluaciones y análisis de resultados**
   *¿Qué información permite comprender el aprendizaje y orientar
   decisiones más allá de un puntaje?*
   Etiquetas: marcos · instrumentos · análisis académico y psicométrico ·
   comparaciones · lectura contextualizada de resultados.
   Aprendizaje buscado: convertir la evaluación en conocimiento para la
   mejora.

3. **Currículum y materiales**
   *¿Cómo se organiza una progresión y qué situaciones permiten que los
   contenidos funcionen como herramientas de pensamiento?*
   Etiquetas: marcos conceptuales · programas · currícula · colecciones ·
   guías · situaciones de aprendizaje.
   Aprendizaje buscado: conectar contenidos, prácticas y formas de actuar
   matemáticamente.

4. **Proyectos institucionales integrales**
   *¿Cómo se articulan política, currículum, desarrollo profesional,
   materiales y evaluación para sostener una transformación a escala?*
   Etiquetas: diagnóstico · diseño · implementación · acompañamiento ·
   monitoreo · ajuste.
   Aprendizaje buscado: comprender condiciones de sostenibilidad y
   capacidad instalada.

### Casos con nombre propio

Techint Group, MinEduc CABA/Buenos Aires Aprende y BLOOM pueden aparecer
como **menciones breves** únicamente después de validar autorización,
fechas, alcance y resultados; el detalle de proyecto deriva a Novedades o a
una futura ficha de caso. **VALIDAR** — mientras tanto, las cuatro
aplicaciones se publican sin nombres.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de sección | «Conversemos sobre tu desafío» | `/contacto` | **Principal** (naranja) |

### Componente sugerido

**Actualización (18-08-2026, implementado):** la sección se construyó como
**archivo de expedientes** (referencia de interacción: Mosby's Files,
adaptada por completo a la identidad ED): índice de tres carpetas
superpuestas con pestañas → al elegir una, la carpeta se expande con
continuidad espacial y se convierte en el expediente (pregunta como
protagonista, contexto, pregunta de investigación, evidencias —algunas
arrastrables en desktop—, análisis, aprendizaje, qué cambió, producción
relacionada) → navegación persistente «Volver a los casos» / «Siguiente
caso», pestañas laterales, Escape, foco gestionado y reduced-motion.
Contenido actual: **3 casos demo marcados «CASO DEMO — CONTENIDO
PROVISIONAL»** en `src/features/investigacion/casos/data.ts`, reemplazables
por casos reales sin tocar diseño ni animaciones.

---

## 9. Sección 7 — Conexión con Biblioteca (`#biblioteca`)

### Copy visible

- **Volanta:** Producción académica
- **H2 (SÍNTESIS):**
  > La investigación también se **comparte**.

- **Texto (SÍNTESIS):**
  > Libros, artículos, capítulos, recursos pedagógicos y materiales
  > producidos o coordinados por el equipo se reúnen en la Biblioteca para
  > poner el conocimiento en circulación. Allí pueden explorarse los
  > fundamentos, desarrollos y recursos que dialogan con las líneas
  > presentadas en esta página.

### Tres referencias representativas (SÍNTESIS — selección a VALIDAR)

Elegidas para cubrir los tres ejes de la página; el catálogo completo vive
en Biblioteca (doc maestro §27):

1. Reyes-Gasperini (2016), *Empoderamiento docente y Socioepistemología. Un
   estudio sobre la transformación educativa en Matemáticas* — libro; eje
   empoderamiento + marco.
2. Báez, Flores y Reyes-Gasperini (2025), «Problematizar la matemática
   escolar: ¿cómo contribuye al desarrollo profesional docente?» — eje
   problematización; producción reciente.
3. Cantoral, Montiel y Reyes-Gasperini (2014), «Hacia una educación que
   promueva el desarrollo del pensamiento matemático» — eje pensamiento
   matemático.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Bloque de conexión | «Explorá la Biblioteca» | `/biblioteca` | **Principal del bloque** |

### Qué no hacer aquí (doc maestro §22)

No colocar el currículum de Daniela · no listar decenas de referencias · no
duplicar buscador ni filtros de Biblioteca · no alojar descargas sin ficha.

### Componente sugerido

Banda-puente con las 3 fichas mini de referencia. **Coordinar con el puente
inverso ya construido en Biblioteca** (`PuenteInvestigacion.tsx`, pila de
lomos): ambos puentes deben espejarse — Biblioteca dice «detrás de cada
recurso, una investigación»; esta página dice «la investigación también se
comparte» — sin repetir estructura ni copy.

---

## 10. Sección 8 — Cierre

### Copy visible

- **H2 (SÍNTESIS):**
  > Investigar permite hacer mejores **preguntas**.

- **Texto (SÍNTESIS, ~38 palabras):**
  > Investigar permite hacer mejores preguntas, diseñar con fundamento y
  > aprender de cada experiencia. Si tu institución, red o equipo necesita
  > comprender y transformar un desafío educativo, podemos construir el
  > proceso de manera situada y colaborativa.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre final | «Conversemos» | `/contacto` | **Principal** (naranja) |

---

## 11. Revisión de duplicaciones y ajustes recomendados

| Conflicto | Dónde | Recomendación |
|-----------|-------|---------------|
| Pensamiento matemático y empoderamiento como «principios» | Quiénes somos, `MiradaEd.tsx` | Formatos distintos: identidad allá, definiciones canónicas acá. No copiar frases |
| Historia institucional (maestría → doctorado → países) | Quiénes somos, `OrigenEd.tsx` | Acá solo la alusión de la apertura §4; no repetir hitos ni la cita de la profesora |
| «La práctica (también) produce conocimiento» | Home: paso 02 del método y área 05 | Frase ya usada dos veces; esta página no la repite |
| 4 nombres de líneas «inferidos» | Biblioteca, `PuenteInvestigacion.tsx` | Baja prioridad: el contenido de Biblioteca es **simbólico** (el cliente cargará el real al finalizar la web). Alinear los lomos a la taxonomía de 6 recién en esa etapa |
| Puentes Biblioteca ↔ Investigación | Ambas páginas | Espejarse sin repetir estructura ni copy |
| Implementación previa de `/investigacion` | `src/features/investigacion/` (8 componentes) | Auditar contra esta arquitectura en la fase siguiente: qué esqueleto se reutiliza (los 8 componentes mapean 1:1 a estas 8 secciones), qué copy se reemplaza |

---

## 12. Mobile — fase posterior

**Decisión del usuario (18-08-2026):** por ahora se trabaja contenido y
diseño **desktop**. Mobile no recibe identidad propia todavía; solo evitar
decisiones que lo bloqueen (expandibles por click/tap, nunca solo hover;
jerarquía que funcione apilada).

## 13. Accesibilidad conceptual (doc maestro §34)

- Socioepistemología, problematización y empoderamiento se definen en
  lenguaje claro **la primera vez** que aparecen (sección 2).
- Problematización lleva ejemplo concreto (el ampliado de la card B).
- Nunca cuatro términos académicos en una misma oración.
- No simplificar al punto de perder el papel del saber matemático.

## 14. Pendientes de validación (consolidado)

1. Nombres definitivos de las 6 líneas de investigación («líneas oficiales»).
2. Reconciliación de los 4 nombres del puente de Biblioteca — diferida: ese
   contenido es simbólico hasta que el cliente cargue el real.
3. Selección de las 3 referencias representativas (y datos bibliográficos).
4. Menciones breves de Techint / CABA / BLOOM en «Investigación en acción».
5. Texto definitivo de cada botón CTA (esta fase fija ubicación, destino y
   prioridad).
6. La implementación previa menciona «RELIME 2025, Bolema 2025» como
   producción real: verificar esas referencias con ED antes de reutilizarlas
   (no figuran en el doc maestro).
