# Cambios que pidió Daniela el 30 de septiembre de 2026

Fuente: «26.09.30 PAGINA cambios.docx», que Raquel subió el 30/9 a Drive › PAGINA - COMENTARIOS
(id `1kXwJKU1fa475OCddsWGUzLd4hYxpeQpq`). Son 24 páginas: capturas del sitio con marcas en
fucsia y verde, y debajo de cada una lo que hay que cambiar. Daniela lo revisó en
`empoderamientodocente.org`, que todavía sirve el build viejo de Vercel; nada de lo que marca
cambió con el deploy al VPS, así que todo sigue vigente. Los textos van tal cual los escribió ella;
donde dejó una frase a medias, se anota.

Cada fila dice dónde vive el cambio y de qué tipo es: **texto** (copy en
`features/<página>/contenido/*.ts`, el `…Inicial` de cada sección), **foto**, **diseño** (hay que
decidir cómo), **bug** (algo que no anda) o **datos** (tablas de la base: `equipo`, `casos`,
`materiales`).

## Inicio

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 1 | Hero, tarjeta 1 («En el aula») | Queda debajo de la navbar en su pantalla (~1350×730) | «La parte de arriba a la izquierda, no hay manera de verla» | `home/components/hero/geometria-hero.ts` | bug de layout |
| 2 | Hero, tarjeta 3 («Investigación aplicada») | `exposicion-grafica.webp` (Daniela señalando una gráfica) | «cambiarla por alguna en la que aparezca Karla» | `home/contenido/hero.ts` + `public/fotos/` | foto (falta la foto) |
| 3 | Hero, collage | 11 fotos | «menos es más… no hace falta poner muchas fotos, sino algo que caracterice» | geometría del hero | diseño |
| 4 | Navbar | Se esconde en algún momento | «cuando apretás un botón se desaparece la guía de "qué hacemos, quiénes somos…". Esa guía debería permanecer siempre» | componente de navegación del sitio | bug |
| 5 | Hero, bajada | «Escuchamos cada realidad y diseñamos soluciones educativas a medida, con base en la investigación y más de 15 años de experiencia.» | «Consultora especializada en la transformación del aprendizaje matemático» | `home/contenido/hero.ts` › `bajada` | texto |
| 6 | Hero, botones «Qué hacemos» y «Contactanos» | Debajo de la bajada | «Aparece dos veces QUÉ HACEMOS Y CONTACTANOS en la misma imagen. Eliminar lo que está en rosa, pues lo importante es la frase del centro» | hero + esquema (`botonPrincipal`/`botonSecundario`) | diseño (sacar los botones) |
| 7 | Misión, párrafo 1 | «…una oportunidad para **comprender, decidir y transformar el mundo.**» («para» queda en verde) | «La palabra PARA que esté en negro, así se lee "para comprender"» | `home/contenido/mision.ts` | texto (marcado) |
| 8 | Misión, párrafo 2 | «Buscamos que las y los participantes de nuestros encuentros vivan un proceso de empoderamiento,» | «Proponemos escenarios en los que las y los participantes vivan procesos de empoderamiento,…» | `home/contenido/mision.ts` | texto |
| 9 | Misión, párrafo 2 | «cambio de relación con el saber matemático escolar» | «con la matemática escolar» | `home/contenido/mision.ts` | texto |
| 10 | Cómo trabajamos, paso 04 «Implementamos» | Foto `formadora-acompana-grupo.webp`; «…fortalecen el desarrollo profesional y generan nuevas formas…» | «Buscar una foto donde esté Karla dando sesión. Pedirle a ella una si es necesario, que le guste»; «generan» → «propician» | `home/contenido/como-trabajamos.ts` | foto (falta) + texto |
| 11 | Hero, tarjeta 6, cartel | «Formación docente / Trayectos para docentes de matemáticas» | «Desarrollo profesional docente». «NO hacemos "formación docente". La formación docente se hace en los profesorados» | `home/contenido/hero.ts` (cartel y texto alternativo de la foto) | texto |
| 12 | Hero, tarjeta 11, cartel | «Materiales propios / Recursos listos para llevar al aula» | «Mediadores didácticos / Materiales para llevar al aula» | `home/contenido/hero.ts` | texto |
| 13 | ¿Quiénes somos? (bloque del home) | «…desde la experiencia compartida, en **nuevos modos de comprender, enseñar y construir conocimiento.**»; foto `formadoras-pizarra-umce.webp` | A. «La palabra "en" no debe ir en verde». B. «enseñar» → «favorecer aprendizajes». C. «La foto debe ser OTRA. Fíjense que dice UNIVERSIDAD METROPOLITANA… y nosotras no somos de ahí. Ahí puede aparecer un batic de fotos donde estemos haciendo cosas» | `home/contenido/quienes-somos.ts` | texto + foto/diseño |

La misma frase «saber matemático escolar» está en la bajada del hero de Quiénes somos y en su SEO
(`quienes-somos/contenido/hero.ts`, `seo.ts`). Daniela solo marcó la de Misión; conviene
preguntarle si va igual en las otras dos.

## Qué hacemos

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 14 | Hero, bajada | «…la relación cotidiana de docentes con la matemática escolar.» | «Eliminar la palabra "de docentes"» | `que-hacemos/contenido/hero.ts` | texto |
| 15 | Área 01, detalle | «…que fortalecen la práctica, promueven la reflexión y resignifican las matemáticas.» | «…que ponen la práctica en diálogo con la reflexión y favorecen procesos de resignificación de las matemáticas.» | `que-hacemos/contenido/areas.ts` | texto |
| 16 | Área 01, ficha | «Seguimiento en el aula»; para quién «Ministerios, empresas, fundaciones y redes que forman a escala» | «Acompañamiento en el aula»; «Escuelas, instituciones educativas, ministerios, fundaciones y redes que trabajan a escala» (entra justo en 90) | `areas.ts` | texto |
| 17 | Área 02, detalle | «…la relación entre docentes, matemáticas y aprendizaje…» | «entre docentes, estudiantes, matemáticas y aprendizaje…» | `areas.ts` | texto |
| 18 | Área 03, ficha | «Homologación entre sedes»; «Ministerios y redes que necesitan coherencia…» | «Fundamentos de la propuesta»; «Redes que buscan» | `areas.ts` | texto |
| 19 | Área 04, foto | `comparar-tareas-ronda.webp` (gente sentada mirando a cámara) | «Cambiar la foto, no sé si nos autorizan a aparecer» | `areas.ts` + `public/fotos/` | foto (elegir otra de las aprobadas) |
| 20 | Área 05, para quién | «Ministerios, universidades y redes que necesitan evidencia de sus aulas» | «Instituciones educativas que busquen el diálogo entre la teoría y la práctica» | `areas.ts` | texto |
| 21 | Área 07, foto | `salon-mesas-redondas.webp` | «usar alguna de las fotos que dice MINISTERIO DE EDUCACIÓN de fondo, donde di la charla el otro día. No mi cara, sino el fondo es lo importante» | `areas.ts` + `public/fotos/` | foto (falta la foto) |
| 22 | Hero, chips de las áreas | Al hacer clic en «Fortalecimiento» la pantalla queda en «Investigación en Matemática Educativa» (05) con 06 asomando abajo | «Cuando le das clic a los íconos, te aparece el anterior» | anclas de las áreas | bug |
| 23 | Proyecto 01 (Plan Nacional Aprender Matemática) | «Formación semipresencial de 500 formadoras y formadores, y coordinación de los diez cuadernillos del plan.» | «Desarrollo profesional semipresencial de …., diseño y coordinación de 10 materiales para el aula.» (los puntos suspensivos son de ella: se deja «500 formadoras y formadores») | `que-hacemos/contenido/proyectos.ts` | texto |
| 24 | Proyecto 04 (Líderes de Fortalecimiento), sello | «Pesquería · 2020» | «Monterrey» | `proyectos.ts` | texto |
| 25 | Proyecto 05 (EXANI) | «Marco de referencia, especificaciones y reactivos para básica, media superior y superior.» | «Diseño de marco de referencia, especificaciones y reactivos para educación media superior, superior y posgrados.» | `proyectos.ts` | texto |
| 26 | Proyecto 06 (Plan Buenos Aires Aprende) | Ficha 2 del segundo capítulo | «ELIMINAR ESTE.» | `proyectos.ts` + `components/proyectos-aplicaciones/fichas.ts` (ESTRUCTURA) | estructura |
| 27 | Proyecto 07 (Escuelas Techint) | «2 países, una currícula» (Argentina y México) | «TRES países (agregar Brasil)» | `proyectos.ts` + `fichas.ts` (banderas) | estructura + texto |
| 28 | Proyecto 08 (Techint Group) | «3 países» (Argentina, México y Brasil); «Currícula, evaluaciones, materiales, acompañamiento a líderes, becas al mérito y la estructura de un diplomado docente.» | «Argentina, Brasil, México, Colombia, Italia, Rumania, Uruguay (7 países)»; «Desarrollo profesional docentes, evaluaciones, materiales, acompañamiento a líderes, diseño instruccional de programas, estructura de diplomado docente, entre otras.» (164 letras: el tope de 140 sube; «docentes» parece un error de tipeo, va «docente» salvo que diga otra cosa) | `proyectos.ts` + `fichas.ts` (banderas de Colombia, Italia, Rumania y Uruguay) | estructura + texto |
| 29 | Cierre, botón «Hablemos de tu contexto» | Lleva a Contacto con el tema elegido | «Le di clic … y quise volver para atrás, NO VUELVE» | cierre + página de Contacto | bug |

## Quiénes somos

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 30 | Origen, 02 Sentido, quién dijo la cita | «…uno de los primeros encuentros de formación docente en México.» | «de "desarrollo profesional docente"» | `quienes-somos/contenido/origen.ts` | texto |
| 31 | Origen, hito «México» | «Parte de procesos de desarrollo profesional docente a nivel nacional.» | «Procesos de desarrollo… (quitar las palabras "Parte de")» | `origen.ts` | texto |
| 32 | Origen, remate | «Para transformar el aprendizaje, el cuerpo docente necesita primero vivir una nueva relación con la matemática.» | «Para transformar los escenarios de aprendizaje, proponemos al profesorado vivir primero una nueva relación con las matemáticas.» | `origen.ts` | texto |
| 33 | Mirada, principio 01 | «La matemática no es solo ~~resolver cuentas~~» (se tacha en vivo) | «No hace falta tachar la idea de RESOLVER CUENTAS porque está bien resolver cuentas, la idea es que NO SOLO sea eso» | `quienes-somos/contenido/mirada.ts` (sacar el marcado) | texto |
| 34 | Mirada, principio 02 | «El poder no es ~~sobre otras personas~~» | «De nuevo, no tachar sobre otras personas» | `mirada.ts` | texto |
| 35 | Mirada, principio 03 | La ficha «Perspectiva de género» pisa el título «Transformación educativa» | «Perspectiva de género queda sobre la palabra transformación educativa» | `components/mirada/` | bug de layout |
| 36 | Mirada, la sección | Coreografía con scroll y hover | «demasiado juego y apariciones. Es demasiada dependencia del rol del mouse y es tan sensible que se te pasa todo y tenés que volver. Recuerden: menos es más» | `components/mirada/` | diseño |
| 37 | Equipo («Quiénes sostienen ED») | Dirección general (1 tarjeta grande) + Dirección (2) + dos grupos en grilla de 2 columnas con fotos grandes | «Fotos más chicas. Es un montón ocupar toda la pantalla.» «En una mirada sola se vea mucha gente… disminuir en todo su sentido el escroleo.» «No distingamos entre áreas… filas de 4: 3 filas de 4 y la última con tres.» «¿No tienen fotos nuevas?» Orden y roles (abajo) | `components/equipo/` + tabla `equipo` (`nivel`, `orden`, `rol`) | diseño + datos + fotos |

Orden y roles que pide para el equipo (15 personas):

- Fila 1, direcciones: Daniela Reyes Gasperini · Directora General — Karla Gómez · Directora Académica — Wendolyne Ríos · Directora de Gestión Educativa — Raquel Ayala · Directora de Gestión Institucional.
- Fila 2: Iván Pérez · Modelación y tecnologías — Gabriela Buendía · Visualización y construcción social del conocimiento matemático — Andrea Vergara · Pensamiento estocástico — Luis López · Pensamiento aritmético y algebraico.
- Fila 3: Marcela Cano · Evaluación — Judith Hernández · Currículo — Paola Balda · Pensamiento proporcional — Pedro Vidal-Szabó · Pensamiento estocástico.
- Fila 4: Luis Cabrera · Pensamiento variacional — Darly Ku-Euan · Pensamiento aritmético — Eduardo Briseño · Pensamiento variacional.

Contra la tabla de hoy: Wendolyne sube de «Facilitadora y diseñadora de material didáctico» (nivel 4)
a dirección; Raquel pasa de «Gestión institucional» a «Directora de Gestión Institucional»; cambian
los roles de casi todo el resto (hoy dicen «Líder de…», «Facilitador…», «Diseñadora de material
didáctico»). El apellido en la base es «Briceño» (así firma sus publicaciones); ella escribió
«Briseño»: se deja «Briceño».

## Novedades

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 38 | «Lo que viene pasando» (y Biblioteca) | Ninguna publicación de Iván Pérez cargada (0 en `materiales`) | «Hay un montón de publicaciones de IVÁN sobre modelación. Súbanlas, porfa» | `materiales` + perfil de Iván (`equipo.etapas`) | datos (contenido nuevo) |
| 39 | «ED en movimiento», momento «CINCO PAÍSES» | `grupo-al-aire-libre.webp` (grupo posando) | «Cambiar esa foto, no confío en que ellos quieran aparecer. Poner alguna de Brasil si quieren o de México» | `novedades/contenido/movimiento.ts` | foto (elegir otra) |
| 40 | «Recién salido», tarjeta «Oaxaca: una transformación colectiva» | `cierre-encuentro-grupo.webp` | «colocar esta foto (no la tengo en mejor resolución)»: viene en el docx (1350×1007, foto grupal del taller de Oaxaca) | `novedades/contenido/lanzamientos.ts` + `public/fotos/` | foto (la tenemos) |
| 41 | «Recién salido», tarjetas | Se arrastran, no llevan al artículo | «No entiendo, no se puede entrar a los artículos, sólo es para verlos?» | `novedades/components/` (lanzamientos) | diseño/bug |
| 42 | Cierre | «No te pierdas nada.» / «Escribinos y contamos lo que estamos haciendo, o seguinos en redes para enterarte de cada novedad apenas sale.» / botón «Hablemos» | «Enterate de todo» / «Seguinos en redes para conocer cada novedad apenas sale.» / «El "hablemos" no sé cómo iría ahí… raro. Los estamos invitando a que nos sigan en redes» | `novedades/contenido/cierre.ts` | texto + diseño (qué hacer con el botón) |

Sobre 38: las diez publicaciones de Iván (2024–2026: modelación, cálculo, derivada, género) ya
estaban en la Biblioteca desde la migración `20260927030549_biblioteca`, firmadas por él, y siete
en su perfil; lo que faltaba era que se vieran en Novedades, el destacado y las tres del perfil.

## Investigación

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 43 | Ficha técnica de cada caso | «PERÍODO 2025 · … · 05 EVIDENCIAS · ESTADO: EN CURSO» | «Qué significa ESTADO EN CURSO? 5 EVIDENCIAS» (no se entiende) | `investigacion/components/` | diseño (sacar esos dos datos de la ficha) |
| 44 | Casos 02 y 03 | «¿Cómo cambia la relación de una docente con el saber que enseña…» (02) y «¿Qué nos dice una evaluación más allá del puntaje?» (03) | «Eliminar y el otro caso también. Vayamos cerrando chicos.» | tabla `casos` | datos (despublicar) |

Queda sin decir qué pasa con el caso 04 («¿Cómo puede un contenido curricular convertirse en una
herramienta de pensamiento?», también «en curso»): no aparece en el docx. Conviene preguntarle si
queda solo Oaxaca.

## Biblioteca

| # | Dónde | Hoy | Pide | Vive en | Tipo |
|---|-------|-----|------|---------|------|
| 45 | Destacados (los cuatro) | El cuarto es «¿Qué significados de la derivada favorece un profesor en su planeación de clase?» (Briceño, Hernández y Morales) | «Quitar la última publicación y colocar una de Iván» | `materiales` (destacado) | datos (depende de 38) |
| 46 | Puente, recurso 04 «Guías» | «Orientaciones paso a paso para llevar las ideas al aula sin perderse en el camino.» | «Intencionalidades que hacen visible los fundamentos de los diseños para entrar en diálogo con la implementación.» | `biblioteca/contenido/puente.ts` | texto |
| 47 | Cierre «Un faro para cada aula.» | «…abierto y listo para usar. La / biblioteca sigue creciendo…» («La» queda sola al final del renglón) | «"La" que aparezca en el renglón de abajo» | `biblioteca/contenido/cierre.ts` | texto (espacio duro entre «La» y «biblioteca») |

## Lo que hace falta pedirle a ED

- Foto de Karla dando una sesión (2 y 10). Daniela dice que se la pidan a ella si hace falta.
- Fotos de la charla con el fondo «Ministerio de Educación» (21).
- Fotos nuevas del equipo (37): pregunta por qué siguen «las mismas fotos viejas».
- Si el libro/las publicaciones de Iván van con qué descripción (38): tenemos títulos, autores, revistas y DOI; el texto de cada ficha lo escribimos nosotros salvo que manden uno.
- Qué pasa con el caso 04 (44) y con «saber matemático escolar» en Quiénes somos (9).

## Lo que hay que decidir de nuestro lado

- Sacar los botones del hero (6) y la cantidad de fotos del collage (3).
- Cómo queda el equipo en una sola grilla de 4 columnas (37).
- Qué hacer con el botón «Hablemos» del cierre de Novedades (42).
- Cuánto simplificar la coreografía de Nuestra mirada (36).
- Si las tarjetas de «Recién salido» llevan a la ficha del material o a la Biblioteca (41).

## Causas de los bugs (medidas en Chromium contra el dev server, 1440×900)

**22 y 29 tienen la misma causa.** Los chips del hero de Qué hacemos son anclas nativas `#area-…`
sin `onClick` (`features/que-hacemos/components/QueHacemosHero.tsx:180`; Lenis se crea sin
`anchors`), y los artículos de las áreas viven adentro de la columna que se pinnea mientras aterriza
el título (`components/areas/coreografia-titulo.ts:99-117`, `pinSpacing: true`). Cuando ese pin
termina, GSAP deja la columna corrida 630 px (0,7 pantallas); el navegador mide el destino antes
del corrimiento, así que el área pedida queda asomando abajo y en pantalla se ve la anterior. Desde
el índice de la izquierda cae bien porque ahí la columna ya está corrida: un `scroll-margin` o sumar
la navbar no lo arregla. Y cada clic en un chip agrega al historial una entrada sin estado de Next;
al volver desde Contacto, Next ignora esa entrada (`app-router.js:285`, `if (!event.state) return`):
la URL cambia pero la pantalla sigue en Contacto, y el segundo «atrás» vuelve arriba de todo.

Arreglo (uno solo): que el chip del hero y el índice (`components/areas/IndiceAreas.tsx:79`)
corten con `irASeccion(idDeArea(i), { corte: true })` como hace el índice del borde
(`components/layout/IndicePagina.tsx:45`), que re-mide a los 2 frames, 400 y 1200 ms. Emulado en
la página: el área 06 quedó a 112 px del borde y el historial no creció, así que el «atrás» desde
Contacto vuelve cerca del cierre. Sin escribir el hash en la URL (si se escribe,
`AterrizajePorLink` salta a esa área al volver).

**41.** Cada tarjeta de «Recién salido» es un `<article>` sin link
(`features/novedades/components/lanzamientos/Lanzamiento.tsx:10`) y el modelo solo guarda tipo,
título y foto. Además el riel captura el puntero en el `pointerdown` (`lanzamientos/useRiel.ts:90`)
y Chrome le entrega el clic al riel: por eso tampoco anda con mouse la tarjeta final «Toda la
biblioteca». La Biblioteca no tiene ficha por material: el artículo es la `url` del material. Los
cinco están cargados con destino (Google Books, RELIME, Bolema, Redalyc, IE REDIECH). Arreglo en
tres partes: un campo `enlace` en `lanzamientos.ts` con esas URLs; la tarjeta como `<a>` con
`target="_blank"` y `draggable={false}`; y que el riel capture el puntero recién después de 5 px de
arrastre y anule el clic solo si hubo arrastre.

**4 (navbar).** Es un auto-hide por dirección de scroll (`components/layout/header/auto-hide.ts:66-67`):
cualquier scroll hacia abajo pasados los 120 px esconde la píldora, y solo vuelve si el scroll sube.
Los botones y submenús que llevan a una sección bajan la página por código (`lib/indice.ts:128-148`),
y el auto-hide no distingue ese salto de un scroll de la persona: «Nuestra mirada» la esconde y no
vuelve; «Origen» y «Quiénes sostienen ED» la esconden y reaparece al segundo solo por la corrección
del aterrizaje. Arreglo mínimo: borrar el efecto de `components/layout/Header.tsx:98-104` (y su
import). Con la píldora siempre visible, el expediente de Investigación necesita `lg:pt-28` en vez
de `lg:pt-16` (`investigacion/casos/ExpedienteCaso.tsx:114`), y conviene revisar las escenas
pinneadas con contenido en los primeros 90 px.

**1 (tarjeta 1 del hero).** `geometria-hero.ts:27` la pone en `cy: 7.1 %` de un hero de 93.75vw de
alto: a 1350 px la foto ocupa y −8 a 187 y la píldora fija y 16 a 86, así que tapa la mitad de
arriba, y ni el scroll ni el parallax la destapan. `z-index` no sirve (hero y envoltorio son
`isolate`, y taparía el menú); bajar todo el collage pisa el titular. Arreglo verificado en cinco
tamaños (1280×720 a 1920×960): la línea 27 pasa a `{ w: 13, ar: "300 / 250", cx: 9, cy: 8, par:
1.027 }` (más chica, en la esquina, al costado de la píldora, con 8 px de aire). Entre 1024 y 1279
de ancho la píldora cubre casi toda la franja: ese rango pediría una regla por breakpoint.

**6 (botones del hero).** Se dibujan en `HeroCopy.tsx:68-76` y el esquema los exige
(`home/contenido/hero.ts:39-40`). Opción limpia: sacarlos de `HeroCopy`, de las coreografías
(`coreografia-hero.ts:41`, `entrada-hero.ts:84-88`) y del esquema (`hero.ts:11-12, 39-40, 59-61`).
Es compatible con lo guardado: el esquema no es estricto, un hero guardado con botones pasa y las
claves se descartan; `hero.test.ts` sigue verde. Sin botones el titular baja 40 px a 730 de alto.

**35 (ficha sobre el título en Mirada).** Las fichas se ubican una sola vez al montar, 28 px a la
derecha y 54 px debajo de donde la cámara deja el nodo (`mirada/setup-estados.ts:120-121`); el
título es el rótulo del nodo y lo mueve la cámara en cada refresh. El 03 es el nodo más bajo: la
cámara lo trae desde abajo y el rótulo atraviesa la columna de fichas, que además arrancan antes de
que la cámara pare (`E0 = 0.4` en `timeline-fases.ts:116` contra el fin de cámara en S+0.55). Si el
alto de la ventana cambia después de cargar, las fichas conservan los píxeles del montaje y la
cámara no: cargando a 670 y pasando a 730, la ficha queda encima del título. Arreglo: `E0` de 0.4 a
0.6 y volver a correr el `gsap.set` de `setup-estados.ts:113-122` en el `onRefresh` del timeline.
A 730 de alto la quinta ficha del 03 se corta abajo.

**36 (Mirada, «demasiado juego»).** No hay hover ni mouse: todo va con la rueda en una escena
pinneada de 910svh (unas 8 pantallas), 7 etapas, una muesca por ficha y dos por cambio de cámara.
La versión simple ya existe: bajo 1024 px, sin hover o con movimiento reducido, `MiradaEd.tsx:75-79`
sirve un layout apilado estático con la frase y las fichas como chips en un tercio del alto.
Forzarlo en computadora es tocar la condición de `MiradaEd.tsx:77` y agregar el nombre de cada
principio arriba de su bloque (hoy solo vive en el nodo del mapa).

## Qué quedó hecho (PR de textos y fotos, 30/9)

Textos, todos en los `…Inicial` del código: 5, 7, 8, 9, 10 (solo «propician»), 11, 12, 13 A y B, 14,
15, 16, 17, 18, 20, 23, 24, 25, 28 (solo el texto; los 7 países van con la lane de Proyectos), 30, 31,
32, 33, 34, 42 (título y texto; el botón «Hablemos» queda hasta decidir), 46 y 47. El tope del texto
de las fichas de Proyectos subió de 140 a 170. «Enterate de todo» lleva punto final como los otros
cierres. Los textos alternativos que decían «formación docente» pasaron a «desarrollo profesional
docente» (hero y Origen).

Fotos: 40 (la de Oaxaca que mandó Daniela, `public/fotos/oaxaca-taller-grupo.webp`, registrada en
`fotos` por la migración `20260930203000_foto_del_taller_de_oaxaca`); 13 C con
`formadora-recorre-aula.webp` (una foto; el collage queda para diseño); 19 con
`producciones-geometricas.webp` (producciones de estudiantes, sin caras); 39 con
`aula-consigna-proyectada.webp` (una sesión en un aula de México, de espaldas).

Queda para las otras lanes: 1, 2, 3, 4, 6, 10 (foto), 21, 22, 26, 27, 28 (países), 29, 35, 36, 37,
38, 41, 43, 44, 45. La foto `pizarra-umce.webp` de «ED en movimiento» (Novedades) tiene el mismo
banner de la UMCE que la que Daniela sacó del Inicio; ella no la marcó, así que sigue.

## Qué quedó hecho (PR de las publicaciones de Iván, 30/9)

38 y 45, por la migración `20260930233000_publicaciones_de_ivan`: el cuarto destacado de la
Biblioteca pasa a «Modelación matemática escolar de la elipse en contexto astronómico» (RECHIEM
2026, la que su perfil marca como destacada) y el de la derivada suelta el lugar; su perfil suma
las tres que firmaba y no mostraba (UCMaule 2025, Paradigma 2025, ALME 2024), en orden
cronológico; y entran tres novedades de «Publicaciones» por sus artículos de 2026 (RECHIEM,
Cuadernos de Investigación, IIME), cada una abriendo su material. Las bajadas y los textos del
destacado los escribimos nosotros a partir de los resúmenes de cada artículo.

## Qué quedó hecho (PR de los bugs, 1/10)

1 (tarjeta del hero, más un bug previo de GSAP que corría tarjetas media caja según el ancho),
4 (la píldora ya no se esconde; el expediente de Investigación baja su cabecera), 22 y 29 (los
chips cortan hasta su área con `irASeccion`, que ahora cuenta el pin del título; el «atrás» desde
Contacto vuelve al cierre; en tablet el chip abre el área; el foco de teclado sigue hacia abajo),
35 (las fichas de Mirada entran con la cámara quieta y se reubican al refrescar; la quinta del 03
entra a 730 de alto) y 41 (las tarjetas de «Recién salido» abren su artículo en otra pestaña y el
riel deja pasar el clic; «Toda la biblioteca» vuelve a andar con mouse). Queda anotado: entre 1024
y 1279 de ancho la tarjeta 1 del hero sigue bajo la píldora, y «Por qué investigamos» desde abajo
cae al final de su historia (ya pasaba).

## Decisiones de Facundo (1/10)

- **6, botones del hero:** se quedan los dos, pero el naranja deja de ir a Contacto (ya está en la barra): pasa a
  «Conocé al equipo» → Quiénes somos.
- **42, botón del cierre de Novedades:** pasa a «Seguinos en Instagram» y lleva a la primera red cargada en Datos
  del sitio; sin redes, a Contacto.
- **36, Nuestra mirada:** se probó en local la versión apilada y quieta (la de celular) también en computadora,
  y Facundo la rechazó al verla (1/10): «quedó horrible». La escena queda como estaba, con los arreglos del
  PR #229. Qué bajarle a la Mirada para Daniela se decide aparte, mirándolo.
- **3, collage del hero:** queda como está.
- **37, equipo:** se probó una sola grilla de cuatro sin grupos y Facundo la rechazó al verla (1/10): la sección
  queda como estaba (el masthead y las dos grillas con sus títulos), solo más chica, en filas de cuatro, con el
  orden, los roles y los nombres que mandó Daniela; Wendolyne sube a la Dirección.
- **44, casos:** se eliminan el 02 y el 03; el 04 queda y pasa a ser el Nº 02.
- **Fotos del cliente (2, 10, 21, 37):** al final de todas las correcciones.

## Qué quedó hecho (PR de Proyectos, casos y equipo, 1/10)

6 (el naranja del hero pasa a «Conocé al equipo» → Quiénes somos; «Qué hacemos» queda), 42 (el
botón del cierre de Novedades pasa a «Seguinos en Instagram» y abre, en otra pestaña, la primera
red cargada en Datos del sitio; sin redes, Contacto), 26, 27 y 28 (la ficha de Buenos Aires Aprende
se va; Escuelas Techint queda con tres países, Argentina, Brasil y México; Techint Group con los
siete, cada uno con su bandera dibujada: entran Colombia, Italia, Rumania y Uruguay, y el
encabezado de siete banderas va en una fila más chica con el nombre de los países debajo; el
archivo tiene siete fichas y el contador y la víbora lo siguen solos), 43 (la ficha del expediente
queda con período y ámbito; el estado se sigue cargando en el admin y la ayuda del campo lo dice),
44 (el 02 y el 03 se borran con la migración `20261001213000_casos_que_quedan`, con sus
redirecciones automáticas; el 04 pasa a ser el Nº 02 y su lámina dice «LÁMINA 02»; el sitio y el
admin muestran solo los casos de `CASOS_FIJOS`; Socioepistemología y Evidencia pasan a «Ver en
acción» del 01; la pila ya no mide una ventana como mínimo, así con dos carpetas no queda media
pantalla vacía antes del cierre) y 37 (el equipo más chico, con la sección como
estaba: el masthead en una fila, Daniela primero y más grande, con el único rótulo, y a su lado las tres
direcciones con su rol y nada más (Facundo, 2/10), así entra entero en la primera pantalla; las dos grillas con su raíl y su título, con la
tarjeta compacta en filas de cuatro; el orden, los roles y los nombres de Daniela por la migración
`20261001134000_equipo_en_una_grilla`; Wendolyne pasa a la Dirección, que ahora tiene tres lugares;
el tope del rol sube de 60 a 70 por el de Gabriela, de 63).

Queda anotado: la lámina del caso Nº 02 es la misma ilustración del 01 y trae «CASO 01» dibujado
(ya pasaba; hace falta una lámina propia, que se carga desde el admin); los nombres quedaron como
los escribió Daniela («Daniela Reyes Gasperini», «Luis Cabrera»), salvo Eduardo, que sigue «Briceño»
porque así firma (ella puso «Briseño»); AGENTS.md §13 y dos specs siguen diciendo «4 casos».

Queda 36 (la Mirada: se probó quieta y no fue) y, para el final, como se decidió, las fotos del
cliente (2, 10, 21 y las del equipo).
