# Arquitectura editorial — Página «Qué hacemos»

> **Fuente de verdad de contenidos:** `ED_Contenido_Maestro_Que_Hacemos_Investigacion.md`
> (v1.0, 17-08-2026), Parte II. Este documento la convierte en arquitectura
> de interfaz: qué se ve, qué se abre bajo interacción, qué deriva a otra
> página. **No especifica animaciones** (fase posterior).
>
> **Estados heredados del doc maestro:** CONFIRMADO · VIDEOS · SÍNTESIS
> (recomendación editorial) · **VALIDAR** (no publicar sin confirmación de ED).

---

## 1. Objetivo de la página

Convertir una identidad compleja en una respuesta comprensible para alguien
que llega con una necesidad real. Al terminar el recorrido, la persona debe
poder responder: qué hace Empoderamiento Docente, por qué trabaja distinto,
cómo construye una propuesta, cuáles son sus líneas de acción, en qué
escalas interviene, qué aplicaciones reales tiene y cuál es el siguiente
paso para conversar.

**No debe sentirse como:** tienda de cursos · catálogo frío de servicios ·
crítica agresiva a otras capacitaciones · promesa de resultados
garantizados · página teórica que exige entender socioepistemología.

**Criterio de voz:** verbos de acción (escuchar, comprender, diseñar,
acompañar, implementar, analizar, evaluar, ajustar, transferir). El
conocimiento que sostiene todo esto vive en «Investigación».

### Metadata propuesta

- **Title:** `Qué hacemos`
- **Description (SÍNTESIS):** «Diseñamos y acompañamos intervenciones
  educativas situadas: desarrollo profesional docente, currículum,
  evaluación, materiales e investigación aplicada.»

---

## 2. Recorrido por secciones (orden del sitemap)

| # | Sección | Ancla | Función en una frase |
|---|---------|-------|----------------------|
| 1 | Hero | — | Qué hace ED, en una frase |
| 2 | Líneas de acción | `#lineas` | Siete especialidades dentro de una misma forma de intervenir |
| 3 | Del sistema al aula | `#escalas` | Cinco escalas de intervención |
| 4 | Nuestro enfoque | `#enfoque` | Por qué no es una capacitación tradicional |
| 5 | Cierre | — | Invitación a conversar |

> **Decisión tomada (usuario, 02-09-2026):** el orden publicado cambia
> respecto del sitemap original: las líneas de acción van inmediatamente
> después del hero, «Nuestro enfoque» pasa al final (justo antes del
> cierre) y «Cómo trabajamos» y «Proyectos y aplicaciones» se mudan a la
> página de Investigación (ver `arquitectura-investigacion.md`, secciones
> 4 y 6). Las secciones §5 y §8 de este doc quedan como referencia del
> contenido que se movió.

---

## 3. Sección 1 — Hero

### Copy visible

- **H1 (SÍNTESIS, 9 palabras):**
  > Diseñamos y acompañamos **procesos** que transforman la matemática escolar.

  Highlight verde en «procesos» (el diferencial: procesos, no cursos).
  *Alternativa fiel al doc maestro (10 palabras):* «Diseñamos y acompañamos
  procesos para transformar la matemática escolar.»

- **Bajada (CONFIRMADO, ~35 palabras):**
  > Empoderamiento Docente investiga, diseña e implementa intervenciones
  > educativas situadas: propuestas que articulan el saber docente, el
  > pensamiento matemático, el acompañamiento y la evidencia para que cada
  > transformación sea sostenible en su contexto.

- **Microcopy complementaria (CONFIRMADO):**
  > Trabajamos con docentes, equipos técnicos y directivos, instituciones,
  > fundaciones, ministerios, universidades y redes educativas.

### CTAs

| Ubicación | Texto propuesto (provisorio) | Destino | Prioridad |
|-----------|------------------------------|---------|-----------|
| Hero | «Conversemos» | `/contacto` | **Principal** (naranja) |
| Hero | «Ver líneas de acción» | `#lineas` | Secundaria (outline azul) |

### Evitar (doc maestro §7)

«Soluciones educativas» como única definición · «capacitamos docentes» como
verbo principal · promesas de rendimiento asegurado · frases abstractas.

> **Nota de duplicación:** el hero del home ya dice «Escuchamos cada realidad
> y diseñamos soluciones educativas a medida…». Este hero no repite esa
> fórmula: nombra el objeto (matemática escolar) y el modo (procesos).

---

## 4. Sección 2 — Nuestro enfoque (`#enfoque`)

### Copy visible

- **Volanta:** Nuestro enfoque
- **H2 (SÍNTESIS):**
  > Cada transformación empieza por **comprender** el contexto.

- **Apertura (CONFIRMADO, ~65 palabras):**
  > No partimos de una receta ni de una mirada centrada en lo que falta.
  > Cada proceso comienza escuchando a las personas involucradas,
  > comprendiendo qué se quiere transformar y reconociendo los saberes,
  > experiencias y posibilidades que ya existen. Desde allí construimos una
  > propuesta singular, con investigación, especialistas en red y
  > acompañamiento sostenido. Por eso ninguna intervención de
  > Empoderamiento Docente se parece a otra.

### Cuatro principios (cards, 25–55 palabras visibles cada una)

1. **Singularidad** — Cada contexto educativo presenta actores, objetivos,
   tensiones y posibilidades diferentes. La propuesta se diseña a partir de
   esa realidad, no de un formato previo.
2. **Saber profesional** — Las y los docentes no son receptores pasivos de
   instrucciones: son profesionales de la educación que conocen su aula,
   toman decisiones y participan en la construcción de las respuestas.
3. **Construcción colectiva** — Las transformaciones se fortalecen cuando se
   trabaja en comunidad, se intercambian experiencias y se articulan
   diferentes especialidades en red.
4. **Acompañamiento y continuidad** — Una experiencia inicial puede abrir
   preguntas. La transformación requiere implementación, reflexión,
   seguimiento, evidencia y ajustes sostenidos en el tiempo.

### Contenido ampliado (bajo interacción, ~70 palabras)

Panel colapsable único al pie, titulado «¿Por qué no prometemos recetas?»
(idea de los VIDEOS, redactada en positivo):

> Ninguna actividad funciona igual en todas las aulas, y no lo pretendemos.
> Lo que construimos son escenarios de aprendizaje, herramientas y
> acompañamiento para que cada profesional interprete, contextualice y tome
> decisiones con fundamento. Esa es la diferencia entre aplicar una fórmula
> y sostener una transformación.

(Usa la frase pilar «escenarios de aprendizaje» de forma literal.)

### Componente sugerido

Apertura + grid 2×2 de tarjetas (patrón tarjeta de `DESIGN.md §7`) +
panel colapsable. Sin CTA propio: el recorrido continúa hacia el método.

> **Nota:** el componente huérfano `DistintoEd.tsx` (comparativa
> «capacitación genérica vs. trabajar con ED», hoy fuera del render de
> Quiénes somos) cubre este mismo mensaje con otro patrón. Al revisar el
> trabajo previo, decidir si se recicla acá como variante visual del
> enfoque o se descarta. No convivir ambos con el mismo mensaje.

---

## 5. Sección 3 — Cómo trabajamos (`#metodo`)

### Copy visible

- **Volanta:** Cómo trabajamos
- **H2 (SÍNTESIS):**
  > De la conversación al **proceso**.

- **Apertura (CONFIRMADO, ~55 palabras):**
  > Siempre empezamos con una conversación. A partir de ella articulamos
  > diagnóstico, investigación, diseño, implementación y análisis para
  > construir un proceso situado, capaz de evolucionar junto con el
  > contexto. No son etapas rígidas: son cinco momentos que se alimentan
  > entre sí.

### Cinco pasos (decisión del usuario, 18-08-2026: alineados con el home)

Los mismos cinco verbos del home (Dialogamos · Investigamos · Diseñamos ·
Implementamos · Evaluamos); esta página los desarrolla con la profundidad
del doc maestro. Cada paso muestra su **pregunta guía como eyebrow** y un
texto breve; el detalle completo queda como contenido ampliado.

1. **Dialogamos** *(escuchar y comprender)*
   *¿Qué se quiere transformar y por qué?*
   > Conversamos con la institución o el equipo: reconocemos necesidades,
   > objetivos, experiencias previas y condiciones reales de
   > implementación. Sin respuestas prediseñadas.

2. **Investigamos**
   *¿Qué sabemos de este problema y qué necesitamos comprender mejor?*
   > Estudiamos el problema en su contexto: qué dice la evidencia, qué
   > muestra la experiencia previa y qué preguntas hay que responder para
   > fundamentar el diseño. La investigación no termina acá: vuelve en cada
   > etapa.

3. **Diseñamos** *(una propuesta situada)*
   *¿Qué experiencia puede producir un cambio significativo en este contexto?*
   > Definimos la intervención y convocamos las especialidades necesarias:
   > currículum, evaluación, materiales o tecnología, según el problema.
   > Diseño artesanal, interdisciplinario y con fundamento.

4. **Implementamos** *(y acompañamos)*
   *¿Qué está ocurriendo en la experiencia real y qué necesitan quienes la sostienen?*
   > La propuesta se lleva a la práctica con encuentros, talleres,
   > materiales, trabajo con liderazgos y análisis de aula. Estamos
   > presentes mientras sucede, no solo al inicio.

5. **Evaluamos** *(ajustamos y dejamos capacidad instalada)*
   *¿Qué aprendimos, qué debe cambiar y qué puede sostener el equipo hacia adelante?*
   > Observamos evidencias, interpretamos resultados y ajustamos junto con
   > los equipos. El aprendizaje queda en la institución: autonomía,
   > liderazgo y continuidad.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de sección | «Conocé nuestra investigación» | `/investigacion` | Secundaria |

### Componente sugerido

Stepper vertical numerado (01–04) con la pregunta guía como eyebrow;
mobile: la misma lista, con el ampliado como acordeón. **Deliberadamente
distinto** del scroll-telling sticky del home: el home muestra el ritmo,
esta página es la versión consultable y detallada.

> **Decisión tomada (usuario, 18-08-2026):** el método es de **5 pasos**,
> los mismos verbos del home. El doc maestro proponía 4 + investigación
> transversal; se resolvió no simplificar y mantener «Investigamos» como
> paso propio, con la aclaración de que la investigación vuelve en cada
> etapa (para no duplicar el ciclo científico de la página Investigación).

---

## 6. Sección 4 — Líneas de acción (`#lineas`)

### Copy visible

- **Volanta:** Líneas de acción
- **H2 (SÍNTESIS):**
  > Siete líneas, una misma forma de **intervenir**.

- **Apertura (SÍNTESIS, ~60 palabras):**
  > Los talleres, cursos, seminarios o diplomaturas son formatos; lo que
  > define nuestro trabajo son las especialidades que ponemos en juego.
  > Estas siete líneas no son compartimentos: se combinan según lo que cada
  > desafío requiere. Y hay una que atraviesa y sostiene a las demás: el
  > desarrollo profesional docente con acompañamiento.

### Línea 1 — destacada (card grande, jerarquía mayor)

**Desarrollo Profesional Docente con Acompañamiento**
> Procesos sostenidos con docentes, liderazgos pedagógicos y comunidades
> profesionales para problematizar la matemática escolar, fortalecer la
> toma de decisiones y transformar prácticas desde el saber y la reflexión
> colectiva.

*Ampliado (chips):* talleres presenciales · sesiones virtuales · trayectos ·
acompañamiento a líderes · comunidades de aprendizaje · análisis de aula ·
diplomaturas · formación de facilitadores.
*Guardarraíl (no visible):* no reducir a cursos aislados ni transmisión de técnicas.

### Líneas 2–7 (grid de cards: nombre + 25–55 palabras + chips ampliado)

2. **Diseño Curricular y Arquitectura Pedagógica** — Diseño, revisión y
   articulación de currículas, progresiones, programas, trayectorias y
   marcos conceptuales que conectan los contenidos escolares con el
   desarrollo del pensamiento matemático.
   *Chips:* currícula homologada · programas · mapas de progresión ·
   trayectorias formativas · marcos de fundamentación · revisión curricular.
   **VALIDAR:** ¿«arquitectura pedagógica» es vocabulario oficial o se
   prefiere «diseño curricular»?

3. **Evaluación Educativa y Análisis de Evidencias** — Diseño de
   instrumentos, análisis académico y psicométrico, lectura de resultados y
   estudios que convierten la evaluación en una herramienta para
   comprender, decidir y mejorar, no solamente para calificar.
   *Chips:* marcos de evaluación · instrumentos · análisis comparativos ·
   análisis de ganancia · monitoreo · estudios de impacto.
   *Guardarraíl:* sin cifras ni resultados de instituciones sin autorización.

4. **Materiales y Recursos para el Pensamiento Matemático** — Diseño y
   producción de situaciones de aprendizaje, guías, fichas, colecciones y
   recursos digitales que habilitan estrategias, argumentación,
   participación y usos significativos de la matemática.
   *Chips:* materiales para docentes y estudiantes · guías de ingreso ·
   actividades · colecciones · cápsulas visuales · propuestas para familias.

5. **Asesoría Educativa y Consultoría Estratégica** — Acompañamiento
   especializado a ministerios, fundaciones, instituciones, empresas y
   redes para definir políticas, programas, modelos de intervención y
   decisiones pedagógicas con una mirada situada.
   *Chips:* asesoría general · diseño de programas · revisión de propuestas ·
   apoyo a equipos técnicos · acompañamiento a políticas.

6. **Investigación Aplicada y Sistematización** — Investigación conectada
   con problemas reales: implementación en contexto, análisis de evidencias
   y producción de conocimiento para fundamentar, comprender y mejorar las
   intervenciones educativas.
   *Chips:* estudios · sistematización de experiencias · análisis de
   prácticas · producción académica · transferencia de conocimiento.
   **Conexión obligatoria:** esta card deriva a `/investigacion`
   («Ver cómo investigamos →»).

7. **Soluciones Institucionales Integrales** — Procesos que articulan
   diagnóstico, desarrollo profesional, currículum, materiales, evaluación,
   implementación y seguimiento cuando el desafío requiere una intervención
   completa y coordinada.
   *Función editorial:* muestra que las líneas se combinan.
   **VALIDAR:** ¿línea pública o modalidad transversal («Proyectos integrales»)?

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de sección | «Contanos tu desafío» | `/contacto` | **Principal** (naranja) |

### Componente sugerido

Card destacada (línea 1) + grid 3×2 (líneas 2–7). Chips «puede incluir»
bajo interacción (tap/click expande; sin depender de hover). Patrón
**distinto** del abanico de cartas del home.

> **Decisión tomada (usuario, 18-08-2026):** la taxonomía canónica es la
> del **doc maestro** (las 7 líneas de esta sección). El home, que hoy
> publica otra lista de 7 «áreas de especialización», se alinea después a
> esta taxonomía (mapeo en §10). Los nombres definitivos siguen en VALIDAR
> con ED antes del lanzamiento.

---

## 7. Sección 5 — Del sistema al aula (`#escalas`)

### Copy visible

- **Volanta:** Niveles en los que intervenimos
- **H2 (SÍNTESIS):**
  > Del sistema al **aula**.

- Cinco escalas (1–2 líneas cada una, orden descendente):

1. **Sistemas, políticas y programas** — Ministerios, gobiernos,
   fundaciones, empresas y redes que impulsan políticas, programas o
   iniciativas educativas de alcance amplio.
2. **Instituciones y proyectos** — Escuelas, redes institucionales,
   programas técnicos y organizaciones que requieren una intervención
   propia y sostenida.
3. **Equipos técnicos, directivos y liderazgos** — Personas responsables de
   diseñar, coordinar, acompañar y sostener decisiones pedagógicas.
4. **Docentes y comunidades profesionales** — Profesionales en servicio o
   en formación que analizan, discuten y transforman su relación con el
   saber y sus prácticas.
5. **Aula y experiencia estudiantil** — Escenarios de aprendizaje, tareas,
   materiales e interacciones para que las y los estudiantes argumenten,
   construyan estrategias, tomen decisiones y desarrollen pensamiento
   matemático.

- **Texto de unión (SÍNTESIS):**
  > Podemos intervenir en una escala específica o articular varias dentro
  > de un mismo proyecto. En todos los casos, el objetivo es conectar las
  > decisiones del sistema con lo que finalmente viven docentes y
  > estudiantes.

### Componente sugerido

Diagrama vertical descendente (sistema arriba → aula abajo) con un **hilo
lateral «investigación y evidencia»** que atraviesa las cinco escalas: la
investigación no es una sexta escala, es transversal (corrección del doc
maestro §11 a la clasificación anterior). Mobile: la misma lista vertical,
sin reordenamientos. Sin CTA: prepara la entrada a proyectos.

---

## 8. Sección 6 — Proyectos y aplicaciones (`#proyectos`)

### Decisión editorial (doc maestro §12)

Mientras no estén todas las autorizaciones, se publican **tres tipos de
aplicación sin nombres propios**. Cada caso muestra: contexto o desafío ·
escalas involucradas (etiquetas) · líneas articuladas (etiquetas) · qué
construyó o acompañó ED (70–120 palabras). Nombres y logos se agregan solo
con confirmación explícita.

### Copy visible

- **Volanta:** Proyectos y aplicaciones
- **H2 (SÍNTESIS):**
  > Así se ve en la **práctica**.

#### Caso tipo 1 — Desarrollo profesional y acompañamiento

> Instituciones y redes que buscan fortalecer a sus equipos docentes
> inician procesos sostenidos: experiencias formativas, comunidades de
> aprendizaje, trabajo con liderazgos y análisis de lo que ocurre en el
> aula. El acompañamiento continúa durante la implementación, y el proceso
> deja capacidad instalada: criterios, herramientas y decisiones que el
> equipo sostiene por sí mismo.

*Etiquetas:* Escalas 2–4 · Líneas 1 y 6.

#### Caso tipo 2 — Currículum, evaluación y materiales

> Cuando el desafío pasa por qué se enseña y cómo se evalúa, diseñamos y
> revisamos currículas, progresiones y programas, construimos instrumentos
> de evaluación y producimos materiales que habilitan estrategias,
> argumentación y participación. Cada pieza se fundamenta en investigación
> y se ajusta con la evidencia de su uso real.

*Etiquetas:* Escalas 1–3 y 5 · Líneas 2, 3 y 4.

#### Caso tipo 3 — Asesoría y proyectos institucionales integrales

> Ministerios, fundaciones y organizaciones nos convocan para definir
> políticas, programas y modelos de intervención, o para articular una
> transformación completa: diagnóstico, desarrollo profesional, currículum,
> materiales, evaluación y seguimiento coordinados en un mismo proceso, con
> mirada situada y horizonte de sostenibilidad.

*Etiquetas:* Escalas 1–2 · Líneas 5 y 7.

### Casos con nombre propio — todos VALIDAR antes de publicar

| Caso | Confirmado | Pendiente de validar |
|------|------------|----------------------|
| Techint Group | Vínculo desde 2020; asesoría global; AR/MX/BR | Nombres de programas, sedes, fechas, resultados, logo, alcance describible |
| MinEduc CABA / Buenos Aires Aprende | Asesoría en Matemáticas; currícula, materiales | Fecha de inicio, nombre institucional vigente, alcance, logo, proyectos publicables |
| BLOOM | Asesoría DPD 2025–2026 (presentación institucional) | Denominación exacta, descripción, vigencia, permiso de nombre y logo |

> **Alerta de consistencia:** el home (`DatosDuros.tsx`) **ya muestra logos**
> de Techint, Roberto Rocca, Buenos Aires Ciudad y Science Up. Aplicar la
> misma validación: si un logo no está autorizado para esta página, tampoco
> debería estar en el home. Las 4 métricas del home además están marcadas
> como placeholder en el código (misma lista VALIDAR del doc maestro §29).

### No publicar nunca (doc maestro §12)

Responsables internos · tareas pendientes de planificación · contraseñas ·
teléfonos personales · resultados no autorizados · métricas sin metodología ·
datos sensibles de docentes, estudiantes o instituciones.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre de casos | «Conversemos sobre tu contexto» | `/contacto` | **Principal** (naranja) |

### Componente sugerido

Tres cards horizontales apiladas con fila de etiquetas (escala / línea).
La estructura debe soportar sin rediseño el paso de «caso tipo» a «caso con
nombre» cuando lleguen las autorizaciones.

---

## 9. Sección 7 — Cierre

### Copy visible

- **H2 (SÍNTESIS):**
  > Cada proyecto empieza con una **conversación**.

- **Texto (SÍNTESIS, ~40 palabras):**
  > Cada proyecto comienza con una necesidad, un contexto y una
  > conversación. Articulamos investigación, diseño y acompañamiento para
  > construir, junto con cada equipo, una propuesta posible, situada y
  > transformadora. El primer paso es contarnos qué querés transformar.

### CTA

| Ubicación | Texto propuesto | Destino | Prioridad |
|-----------|-----------------|---------|-----------|
| Cierre final | «Conversemos» | `/contacto` | **Principal** (naranja) |

### Componente sugerido

El componente huérfano `FormaParteED.tsx` («Cada propuesta empieza con una
conversación…», CTA «Conversemos» → `/contacto`) es prácticamente este
cierre ya construido. Candidato directo a reutilizar con el copy ajustado.

---

## 10. Revisión de duplicaciones y ajustes recomendados en otras páginas

| Conflicto | Dónde | Recomendación |
|-----------|-------|---------------|
| Método 5 pasos vs 4 pasos | Home `ComoTrabajamos.tsx` | **Resuelto:** 5 pasos en ambas páginas; el home muestra el ritmo, esta página el detalle |
| Dos taxonomías de 7 líneas/áreas | Home `LineasAccion.tsx` | **Resuelto:** canónica = doc maestro; alinear el home a ella (nombres finales en VALIDAR con ED) |
| «La práctica produce conocimiento» repetida | Home paso 02 y área 05 | Esa frase ya aparece 2 veces; esta página no la reutiliza |
| Comparativa «genérico vs ED» | `DistintoEd.tsx` (huérfano) | Mismo mensaje que §Enfoque; decidir reciclaje o descarte al revisar el trabajo previo |
| Red de especialistas (6 especialidades, 5 países) | `RedEd.tsx` (huérfano) | El mensaje «convocamos especialistas» vive en el paso 2 del método; la ficha de la red pertenece a Quiénes somos. No duplicar la red completa acá |
| Cierre conversacional | `FormaParteED.tsx` (huérfano) | Reutilizar como cierre de esta página |
| Logos de aliados ya publicados | Home `DatosDuros.tsx` | Someter a la misma validación que los casos (§8) |
| Historia institucional | Quiénes somos (`OrigenEd`) | Esta página no cuenta el origen; solo verbos de acción |

### Mapeo tentativo entre taxonomías (para la conversación con ED)

| Doc maestro (esta página) | Home actual |
|---------------------------|-------------|
| 1. Desarrollo Profesional Docente con Acompañamiento | 01 Desarrollo profesional docente |
| 2. Diseño Curricular y Arquitectura Pedagógica | 03 Currículo y arquitectura pedagógica |
| 3. Evaluación Educativa y Análisis de Evidencias | 04 Evaluación para la mejora educativa |
| 4. Materiales y Recursos para el Pensamiento Matemático | 02 Materiales para la resignificación de las matemáticas |
| 5. Asesoría Educativa y Consultoría Estratégica | — (sin equivalente) |
| 6. Investigación Aplicada y Sistematización | 05 Investigación en Matemática Educativa |
| 7. Soluciones Institucionales Integrales | 06 Fortalecimiento institucional + 07 Transformación de sistemas educativos |

---

## 11. Mobile — fase posterior

**Decisión del usuario (18-08-2026):** por ahora se trabaja contenido y
diseño **desktop**. Mobile no recibe identidad propia todavía; solo evitar
decisiones que lo bloqueen (chips y ampliados accionables por click/tap,
nunca solo hover; jerarquía que funcione apilada).

## 12. Pendientes de validación (consolidado)

1. Nombres definitivos de las 7 líneas de acción (y unificación con el home).
2. «Arquitectura pedagógica»: ¿vocabulario oficial?
3. «Soluciones Institucionales Integrales»: ¿línea o modalidad?
4. Casos: Techint (programas, sedes, fechas, logo), CABA (fecha de inicio,
   nombre vigente, alcance, logo), BLOOM (denominación, descripción, logo).
5. Logos y métricas del home: **por ahora quedan como placeholders** — el
   objetivo actual es mostrar la idea de la web al cliente; se completan y
   validan bien antes del lanzamiento (decisión del usuario, 18-08-2026).
6. Texto definitivo de cada botón CTA (esta fase solo fija ubicación,
   destino y prioridad).
