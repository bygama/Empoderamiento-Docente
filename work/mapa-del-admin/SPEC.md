# SPEC — El mapa entero del admin

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del owner (design-first)
- **Decide:** Mateo
- **Tier:** XL · lane padre · cada módulo es una lane hija con su worktree
- **Diseño:** aprobado en conversación el 2026-09-23 (shaping, cinco informes
  de research). Este SPEC lo trae entero porque su fuente
  (`%TEMP%\ed-admin-research\mapa-del-admin.html`) se pierde si se limpia
  TEMP; los PDF están en `~/Downloads/mapa-del-admin-ED*.pdf`.
- **Reabre:** el spec del admin
  (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`) en §7 (tres
  roles, no dos) y §11 (versiones de páginas); cada lane que lo reabre lo
  actualiza en su PR.

---

## 1. Qué se quiere

El admin pasa de ser un editor de páginas a **una consola con ocho módulos**,
donde el CMS es uno más: Contenido, Novedades y Biblioteca conviven con
Mensajes, Métricas, Cuentas y Ajustes. Mateo pidió que se sienta «como una
empresa gigante»; lo usan tres personas unas pocas veces por mes.

Las ideas que lo ordenan:

- **El Inicio responde «¿qué me necesita hoy?».** No es un tablero de gráficos.
- **Tres roles fijos, explicados en una frase.** No hay roles a medida.
- **Lo que tu rol no usa, no aparece.** Y el servidor lo verifica igual.
- **Todo dato gratis y legal entra a Métricas.** Nunca se identifica a una
  persona ni a una institución.
- **Dos niveles de menú como máximo.** El tercero va en pestañas.

## 2. Lo que ya existe (2026-09-26, `main` en `078b75d`)

| Parte | Estado |
| --- | --- |
| Entrar, olvidé y nueva contraseña | hechos (#173); lo visual del login quedó con críticas: el panel azul con mucho vacío, «Admin del sitio» chico |
| Sidebar en tres grupos, cuenta abajo, temas claro · mixto · oscuro | hecha (#176), DESIGN.md §11 |
| Inicio | las tarjetas de métricas y un link a Páginas: sin jerarquía ni orden de lectura |
| Páginas: lista y editor | hechos (#171, #174); solo se edita Inicio → Hero |
| Los otros módulos y Mi cuenta | una guía «por hacer» cada uno (`apps/sitio/src/admin/por-hacer/`) |
| Métricas | la copia diaria de Vercel Analytics y el panel mínimo (#168); A1 y C1 esperan el token y el deploy |
| Deploy | Tasks 3, 5 y 6 de la lane del primer deploy, abiertas (§8) |

**La sidebar ya pisó al mapa en un punto, y queda así:** el mapa decía «ocho
entradas sin grupos»; Mateo eligió en #176 tres grupos (Inicio · Mensajes ·
Métricas / Contenido · Novedades · Biblioteca / pegado abajo Cuentas ·
Ajustes). Mi cuenta va en el menú de la cuenta, no en la sidebar.

## 3. Roles y permisos

La jerarquía es un triángulo. Los roles son verbos para que el nombre no tenga
género.

| Rol | Cuántas | Qué puede, en una frase |
| --- | --- | --- |
| **Dirige** | una, siempre | Todo, incluidas las cuentas y los CV. Es la única que puede pasar la dirección a otra persona, y nadie la puede borrar, suspender ni degradar. Es alguien de ED, no del desarrollo. |
| **Administra** | las que haga falta | Todo lo de quien dirige, menos tocar la cuenta de quien dirige o pasarse la dirección. |
| **Edita** | las que haga falta | Edita y publica el contenido, las novedades y la Biblioteca, contesta los mensajes de contacto y ve las métricas. No ve CV, Cuentas ni Ajustes. |

| Módulo | Dirige | Administra | Edita |
| --- | --- | --- | --- |
| Inicio | ✓ | ✓ | ✓ sin filas de CV ni de ajustes |
| Contenido (Páginas, Casos, Equipo, Fotos) | ✓ | ✓ | ✓ |
| Aliados: editar | ✓ | ✓ | ✓ |
| Aliados: marcar «Autorizado» | ✓ | ✓ | — |
| Novedades · Biblioteca | ✓ | ✓ | ✓ |
| Mensajes › Contacto | ✓ | ✓ | ✓ |
| Mensajes › CV | ✓ | ✓ | — |
| Métricas | ✓ | ✓ | ✓ |
| Cuentas y Actividad | ✓ | ✓ menos a quien dirige | — |
| Ajustes | ✓ | ✓ | — |
| Mi cuenta | ✓ | ✓ | ✓ |

**Ocultar no es seguridad.** Lo que un rol no puede usar no aparece en el
menú; si alguien entra por URL, ve «Esta sección es de quien dirige o
administra» con un link al Inicio. Aparte, cada layout de módulo y cada Server
Action verifican el permiso, como hoy verifican la sesión. Los permisos se
nombran en `packages/auth/src/permisos.ts` (`PUEDE`), que ya prevé que un
tercer rol cambie ese archivo y nada más.

## 4. El mapa de URLs

El primer segmento después de `/admin` es la entrada del menú: la URL cuenta
dónde estás y el menú se ilumina solo. D = dirige · A = administra · E = edita.

```
ACCESO, sin menú
/admin/entrar                              entrar
/admin/entrar/codigo                       segundo factor (D A)                  nueva
/admin/olvide-mi-contrasena                pedir el enlace
/admin/nueva-contrasena                    elegir contraseña (también invitación)

/admin                                     D A E   Inicio
/admin/contenido                           D A E   índice de 5 tarjetas
   /paginas  ·  /paginas/[pagina]                  7 páginas → editor por secciones
   /casos    ·  /casos/[id]                        4 casos fijos
   /equipo   ·  /equipo/[id]                       15 perfiles
   /aliados  ·  /aliados/[id]                      logos (autorizar: D A)
   /fotos    ·  /fotos/[id]                        biblioteca de fotos
/admin/novedades  ·  /nueva  ·  /[id]      D A E   borradores · publicadas
/admin/biblioteca ·  /nuevo  ·  /[id]      D A E   +DOI o link · salud · clics
/admin/mensajes                            D A E   → la bandeja con más sin leer
   /contacto  ·  /contacto/[id]            D A E   Nuevo · En curso · Cerrado · Spam
   /cv        ·  /cv/[id]                  D A     igual, con el archivo privado
/admin/metricas                            D A E   Resumen
   /busquedas · /origen · /acciones · /enlaces
/admin/cuentas  ·  /invitar  ·  /[id]      D A     personas y roles
   /actividad                              D A     quién hizo qué
/admin/ajustes                             D A     índice de 5 tarjetas
   /sitio · /seo · /avisos · /privacidad · /conexiones
/admin/mi-cuenta                           D A E   perfil, contraseña, sesiones, avisos

EN EL SITIO PÚBLICO, nuevo
/novedades/rss.xml                         el feed de novedades
/l/[codigo]                                link corto: cuenta el clic y redirige
/.well-known/change-password               308 → /admin/mi-cuenta#contrasena (W3C)
```

`/admin/paginas` pasa a `/admin/contenido/paginas` con un 308 desde la vieja.
El panel de métricas deja el Inicio y va a Métricas › Resumen.

## 5. Pantalla por pantalla

Cada ficha dice para qué sirve, qué muestra, qué se puede hacer, cómo se ve
vacía o con error, de dónde salen los datos y adónde lleva.

### 5.1. Acceso, sin menú y con la marca

- **`/admin/entrar`** — la única puerta; no hay registro público. Correo,
  contraseña con «mostrar», «Olvidé mi contraseña». Error genérico que no dice
  si el correo existe; tras 5 intentos fallidos en 15 minutos la cuenta queda
  frenada, con el mismo aviso que el límite por IP. Lleva a `volver` o al
  Inicio; si el rol es D o A y tiene el segundo factor, pasa antes por
  `/entrar/codigo`.
- **`/admin/entrar/codigo`** (nueva, D A) — un código de 6 dígitos por mail,
  sin app. «Te mandamos un código a d•••@…», el campo, «Mandar otro» y
  «Recordar este dispositivo 30 días». Estados: vencido (10 min), incorrecto,
  demasiados intentos. Plugin de dos factores de better-auth, sin
  dependencias nuevas; mails por Resend.
- **`/admin/olvide-mi-contrasena` · `/admin/nueva-contrasena`** — pedir el
  enlace y elegir la contraseña; la invitación usa la misma pantalla con el
  título «Elegí tu contraseña». La respuesta es la misma exista o no el
  correo; el enlace vence en 1 h (72 h si es una invitación). Al cambiarla se
  cierran las demás sesiones y llega «Tu contraseña cambió».

### 5.2. Inicio — `/admin` (D A E)

Responde «¿qué tengo que hacer?» y «¿cómo va el sitio?» de un vistazo.

- **Saludo y «desde tu última visita»:** CV y mensajes nuevos, y lo que se
  publicó desde que esa persona entró por última vez.
- **Pendientes**, solo las filas con algo pendiente, en orden de urgencia:
  CV nuevos (D A) y mensajes sin leer · CV que se borran en 7 días (D A) ·
  páginas con cambios sin publicar y novedades en borrador hace más de 7 días
  · materiales con el link roto y fotos sin texto alternativo · aliados sin
  autorizar (D A) · «Conectá Search Console» mientras no esté (D A).
- **Esta semana:** visitas, clics desde Google, CV recibidos y materiales
  consultados, contra la semana anterior.
- **Actividad reciente:** los últimos 8 eventos que tu rol puede ver.
- **Accesos rápidos:** «Nueva novedad» y «Agregar material».
- Sin pendientes: «Todo al día». Sin datos de métricas: «—» con «Todavía no
  hay datos».
- Datos: consultas que cuentan en cada módulo, sin tabla nueva; la última
  visita sale de las sesiones de better-auth. Cada fila lleva a la pantalla
  que la resuelve; «Ver métricas» y «Ver toda la actividad» (D A).

### 5.3. Contenido — lo que no se publica por fecha

- **`/admin/contenido`** — cinco tarjetas con su estado: Páginas (7 · 2 con
  cambios sin publicar), Casos (4), Equipo (15), Aliados (5 · 1 sin
  autorizar), Fotos (n · 4 sin texto alternativo). Las mismas cinco van como
  pestañas arriba de cada pantalla del módulo.
- **`/admin/contenido/paginas`** — las siete páginas en el orden del menú del
  sitio, cada una con su insignia (Sin editar · Borrador sin publicar ·
  Publicada), quién la tocó por última vez y cuándo, y sus secciones
  desplegables. La que no tiene secciones editables va atenuada, con
  «Todavía no se edita desde acá». Lleva al editor o directo a una sección
  (`#seccion-hero`).
- **`/admin/contenido/paginas/[pagina]`** — editar los textos y las fotos de
  las secciones sin tocar la estructura. Migas: Contenido › Páginas › Inicio.
  Encabezado con estado, «Guardar borrador», «Vista previa» (celular o
  escritorio), «Publicar» y «Descartar borrador». Una tarjeta por sección, con
  contadores y la ayuda de cada campo. Una pestaña **SEO** por página:
  título, descripción e imagen para redes. **Nuevo:** «Ver qué cambió» (el
  borrador contra lo publicado, campo por campo, antes de publicar) y
  **Versiones** (las últimas 10 publicaciones, con quién y cuándo, y
  «Restaurar como borrador»). Estados: error en el campo mismo; aviso de
  choque si otra persona guardó mientras tanto; cambios sin guardar al salir.
  Datos: la tabla `paginas`; versiones en una tabla nueva,
  `versiones_de_paginas` (reabre el §11 del spec).
- **`/admin/contenido/casos` · `/casos/[id]`** — lista de los 4 casos con
  número, pregunta, eje y estado; ficha con número, pregunta, eje, indicio,
  ficha técnica, contexto, evidencias, análisis y la URL (slug). Son siempre
  cuatro: se editan, no se crean ni se borran. Si la URL cambia, se escribe
  sola la redirección 308. Mismo flujo que las páginas: borrador, vista
  previa, ver qué cambió, publicar.
- **`/admin/contenido/equipo` · `/equipo/[id]`** — 15 perfiles con foto,
  nombre, rol y orden (se reordena arrastrando); ficha con nombre, rol,
  lugar, etapas con sus hitos y la URL del perfil. **Publicaciones:** salen de
  la Biblioteca (los materiales donde la persona es autora) y ya no se
  tipean dos veces: hoy 33 de 36 están repetidas. Un botón lleva a «Agregar en
  Biblioteca».
- **`/admin/contenido/aliados` · `/aliados/[id]`** — lista con logo, nombre,
  «Autorizado ✓ / —» y si está publicado; ficha con nombre, logo (de Fotos),
  URL y Autorizado, con una nota de dónde consta la autorización. Solo D y A
  marcan «Autorizado»; sin esa marca el logo no se publica nunca
  (AGENTS.md §5.4). Quien edita ve el campo bloqueado, con la explicación.
- **`/admin/contenido/fotos` · `/fotos/[id]`** (nueva) — grilla con filtros
  Todas · Sin texto alternativo · Sin usar; ficha con la foto, su texto
  alternativo (obligatorio), tamaño y peso, quién la subió y «Se usa en», con
  links. Subir, editar el alternativo, reemplazar el archivo, borrar (solo si
  no se usa). En cualquier formulario, el campo de foto deja elegir una ya
  subida además de subir una nueva. Datos: la tabla `fotos`, que ya existe, y
  Vercel Blob.

### 5.4. Novedades — lo que se publica con fecha

- **`/admin/novedades`** — pestañas Borradores · Publicadas y un buscador;
  columnas título, categoría, fecha, quién y ★ si es la destacada. Vacía:
  «Todavía no hay novedades» con «Nueva novedad». `/nueva` crea el borrador y
  abre su ficha.
- **`/admin/novedades/[id]`** — título, bajada, fecha, categoría (lista
  cerrada), imagen (de Fotos), cuerpo, «Destacada», materiales relacionados
  (de la Biblioteca) y la URL. **Panel lateral:** vista previa en Google y en
  redes; la imagen para redes se genera sola y se puede reemplazar; «Se ve en:
  /novedades · Inicio (si es la destacada)» y «Ver en el sitio». Acciones:
  borrador, vista previa, ver qué cambió, publicar, despublicar, borrar.
  Destacada hay una sola: marcar otra desmarca la anterior y lo avisa. Si
  cambia la URL, se escribe sola la redirección 308. Al publicar queda una
  marca en la curva de Métricas. En el sitio: `/novedades/rss.xml`.

### 5.5. Biblioteca — los 63 materiales, que llevan a la revista o editorial

- **`/admin/biblioteca`** — buscador, filtro por tipo (los 7) y por estado
  (Publicado · Oculto); columnas portada, título, autores, tipo, año,
  consultado N veces este mes e insignias de salud (link roto · sin portada ·
  datos incompletos). El número del menú cuenta los links rotos.
- **`/admin/biblioteca/nuevo`** (nueva) — paso 1: se pega un DOI, un ISBN o un
  link y «Buscar datos»; si no aparece nada, «Cargar a mano». Paso 2: el
  formulario viene completo, marcando de dónde salió cada dato («de
  Crossref»); tema y público se eligen a mano; los autores se vinculan a
  Equipo o, si son de afuera, van como texto. El DOI no se repite; un título
  parecido avisa con link al existente; nada se guarda sin que una persona
  confirme. Fuentes, en orden: Crossref, OpenAlex, las etiquetas `citation_*`
  de la página, Open Graph. Todas gratis y sin cuenta.
- **`/admin/biblioteca/[id]`** — título, autores, tipo, tema, público, año,
  formato, portada (la tipográfica generada o una subida), URL o DOI, cita APA
  (generada, editable) y estado Publicado · Oculto. **Salud:** el link se
  chequea una vez por semana; los DOI se verifican en doi.org para no dar
  falsos rotos. Clics de este mes. En la tarjeta pública se suma «Copiar cita
  APA».

### 5.6. Mensajes — lo que llega por los formularios del sitio

- **`/admin/mensajes`** lleva a la bandeja con más sin leer.
- **`/admin/mensajes/contacto` · `/contacto/[id]`** (D A E) — pestañas por
  estado: Nuevo · En curso · Cerrado · Spam; columnas nombre, primeras
  palabras, país, fecha y «tomado por»; buscador. Ficha: los datos, el
  mensaje, el estado y la fecha en que se borra. Acciones: «Lo tomo yo» (pasa
  a En curso: «Tomado por Raquel»), «Responder» (abre el programa de mail con
  la dirección y el asunto; no se responde desde el admin), «Cerrar», «Marcar
  como spam», «Borrar ahora». Se borra solo a los 24 meses, el spam a los 30
  días. Campo trampa contra bots y el límite por IP. Aviso por mail de cada
  mensaje nuevo a quien esté en Ajustes › Avisos.
- **`/admin/mensajes/cv` · `/cv/[id]`** (D A) — lo mismo que Contacto, más el
  archivo del CV y los datos que pida el formulario público. **Privacidad:** el
  archivo no tiene URL pública, se baja por una ruta que pide sesión y rol; se
  borra solo a los 12 meses junto con el archivo, con aviso en Pendientes 7
  días antes; «Borrar ahora» atiende el pedido de quien quiere que eliminen sus
  datos; no se exporta a planilla; en Actividad queda que se borró un CV,
  nunca su contenido. Ley: Argentina 25.326 (art. 4.7 y 16), Chile 21.719 (en
  vigor desde diciembre de 2026), México LFPDPPP.

### 5.7. Métricas — todo dato gratis y legal, sin cookies

- **`/admin/metricas` — Resumen** — 7, 30 o 90 días contra el período
  anterior; la curva diaria con marcas (se agregan solas al publicar y a mano:
  «Posteamos en LinkedIn»); canales Buscador · Redes · Asistentes IA ·
  Directo · Otros sitios; páginas más vistas. «Agregar marca» y «Actualizar
  ahora». Datos: la copia diaria de Vercel Web Analytics (ADR-0009); es la B1
  de la lane de métricas.
- **`/admin/metricas/busquedas`** (nueva) — qué buscó la gente para llegar:
  clics, impresiones y posición, por página y por país. «Casi nos
  encuentran»: búsquedas con ED entre los puestos 8 y 20, o con muchas
  impresiones y pocos clics. Sin conectar: «Conectá Search Console» (D A) o
  «Todavía no está conectado» (E). Siempre avisa que los datos llegan con 2 o
  3 días de atraso. Datos: copia diaria de la API de Search Console.
- **`/admin/metricas/origen`** (nueva) — países, con Chile, México y Argentina
  fijos arriba; regiones, nunca ciudades, con las cifras menores a 3
  ocultas; referidos, dispositivo, sistema y navegador; el cruce página ×
  país; «Mejor hora para publicar», una grilla día × hora. Con poco tráfico,
  cada bloque dice «Todavía no hay datos suficientes» en vez de un gráfico
  engañoso.
- **`/admin/metricas/acciones`** (nueva) — materiales más consultados; embudo
  del CV (vio la página, empezó el formulario, lo envió) por canal; contactos
  enviados. Datos: contadores propios, solo sumas por día, sin IP, sin
  navegador y sin cookies; nunca se guarda el origen en el CV de una persona;
  se cuentan solo eventos raros, nunca cada visita.
- **`/admin/metricas/enlaces`** (nueva) — links cortos propios para saber qué
  posteo trajo gente: se elige la página, dónde se comparte (LinkedIn ·
  WhatsApp · Instagram · Mail · Otro) y un nombre, y da `…/l/taller-mty`. Cada
  link con sus clics, visitas y CV que trajo, y «Copiar». El link cuenta el
  clic en el servidor, sin cookies.
- **Resumen semanal por mail:** los lunes, unos 6 números, para quien lo active
  en Mi cuenta; por Resend; empieza cuando haya un mes de datos.

### 5.8. Cuentas — solo D y A

- **`/admin/cuentas` — Personas** — arriba «Qué puede cada rol» (una frase por
  rol y la tabla de permisos); debajo la lista con nombre, correo, rol,
  último acceso y estado (Activa · Invitación pendiente · Suspendida).
  Pestañas Personas · Actividad.
- **`/admin/cuentas/invitar`** (nueva) — correo, nombre y rol (administra o
  edita; dirige no se invita, se transfiere). Llega «Elegí tu contraseña» por
  Resend; vence a las 72 h y se puede reenviar o cancelar.
- **`/admin/cuentas/[id]`** — datos, rol, estado, último acceso y sesiones
  abiertas. Cambiar el rol; cerrar sus sesiones; suspender en vez de borrar
  (ya no entra, pero «publicado por Ana» queda en la historia); borrar, solo
  si nunca hizo nada. «Pasarle la dirección», solo para quien dirige y
  pidiendo otra vez la contraseña. La cuenta de quien dirige no se puede
  suspender, borrar ni degradar.
- **`/admin/cuentas/actividad`** (nueva) — quién entró, publicó, descartó,
  restauró, borró, invitó, cambió un rol o cerró un mensaje, y cuándo. Filtros
  por persona, módulo y fecha. Se guarda 12 meses; de un CV registra solo que
  se borró. **La tabla `actividad` se crea primero**, para que cada módulo
  registre desde el día uno.

### 5.9. Ajustes — solo D y A, un índice de tarjetas

- **`/admin/ajustes/sitio`** — correo y teléfono, dirección, países, redes y
  personas de referencia: lo que hoy vive en `config/site.ts`. Se guarda y se
  publica en un paso. «Se ve en: el pie de todas las páginas · Contacto».
  Queda en Actividad.
- **`/admin/ajustes/seo`** — redirecciones (las automáticas y las que se
  agregan a mano; la tabla ya existe); indexación de cada URL según Search
  Console; link al `sitemap.xml`, que se genera solo. El SEO de cada página y
  de cada novedad está en su editor, no acá.
- **`/admin/ajustes/avisos`** — quién recibe el mail de cada Contacto y de
  cada CV (solo D o A), y quién recibe el resumen semanal por defecto.
- **`/admin/ajustes/privacidad`** — los plazos de retención (CV 12 meses ·
  Contacto 24 · Spam 30 días), editables, con link a la política de
  privacidad del sitio.
- **`/admin/ajustes/conexiones`** — el estado de Vercel Analytics, Search
  Console, Resend y Blob: última sincronización correcta o con error, y por
  qué.

### 5.10. Mi cuenta — desde el pie del menú

- **`/admin/mi-cuenta`** — **Perfil:** nombre y correo; la contraseña se
  cambia pidiendo la actual. **Tu rol:** en una frase. **Sesiones:**
  dispositivo, ciudad aproximada y última actividad, con «Cerrar las demás»
  (los datos ya están en la tabla `session`). **Avisos:** mail por mensaje
  nuevo, por bandeja que tu rol ve, y resumen semanal; cada uno se activa o
  no. **Seguridad:** segundo factor por mail, obligatorio para D y A,
  opcional para E. `/.well-known/change-password` redirige a la sección de
  contraseña.

## 6. Cómo se navega

| Regla | Detalle |
| --- | --- |
| Sidebar | La de #176: tres grupos, ícono y nombre, la activa sale del primer segmento de la URL |
| Tres marcas y nada más | Número en Mensajes (sin leer, contando lo que tu rol ve), número en Biblioteca (links rotos) y un punto en Contenido (cambios sin publicar). No hay campanita |
| Pestañas adentro | Contenido, Mensajes, Métricas y Cuentas tienen pestañas que son links. El menú nunca pasa de un nivel |
| Volver y migas | «← Novedades» en cada detalle. Migas solo en el editor de páginas, lo único con tres niveles |
| Índices de tarjetas | Contenido y Ajustes abren con un índice; cada pantalla de Ajustes vuelve con «← Ajustes» |
| Buscar | Una caja en las listas largas: Biblioteca, Novedades, Mensajes, Actividad. Sin buscador global (⌘K) |
| Sin permiso | No aparece. Por URL: «Esta sección es de quien dirige o administra». El servidor lo verifica siempre |
| Cambios sin guardar | El aviso al salir del editor de páginas se usa en todos los formularios |
| Listas vacías | Siempre con su acción principal: «Todavía no hay novedades. [Nueva novedad]» |
| Título de pestaña | «Novedades · Admin ED» |
| Celular | El panel lateral que ya existe |
| Rutas en español | La única en inglés es `/.well-known/change-password` |

## 7. Lanes y orden

Cada fila es una lane hija: su worktree, su rama `mateo/<lane>`, su
`work/<lane>/SPEC.md` y `PLAN.md` escritos adentro, en design-first, y un PR
propio. El orden sale del §7 del mapa («en qué orden construirlo»), con dos
cambios: los patrones compartidos del admin van primero, para que ningún
módulo invente su propia pestaña o su propia lista, y las páginas se
adelantan porque no dependen de nada.

| # | Lane | Qué entrega | Depende de | Espera algo de afuera |
| --- | --- | --- | --- | --- |
| 0 | `deploy-al-dia` | Tasks 3, 5 y 6 del primer deploy; A1 y C1 de métricas | — | **sí:** la cuenta de Vercel, el token y el `prj_…` (Mateo o Gastón) |
| 1 | `patrones-del-admin` | Los patrones que se repiten entre módulos, cada uno con su primer consumidor: título de pestaña, pestañas, índice de tarjetas, «← volver», lista, estado vacío y la marca de la sidebar, estrenados en el índice de Contenido, en Páginas mudada a `/admin/contenido/paginas` (308) con su lista nueva y en el punto de Contenido; lo visual del login; todo en DESIGN.md §11 | — | no |
| 2 | `seguridad-del-acceso` | El diseño aprobado el 2026-09-22: Resend por `fetch`, bloqueo por cuenta, cookies, Argon2id, nonce, `proxy.ts` | — | el dominio en Resend (no frena el código) |
| 3 | `roles-y-cuentas` | Tres roles y permisos por módulo, la guarda, la tabla `actividad`, el Inicio nuevo, Mi cuenta, Cuentas, invitar, segundo factor | 1, 2 | no |
| 4 | `paginas-completas` | Todas las secciones de las siete páginas, SEO por página, ver qué cambió, versiones | 1 | no |
| 5 | `busquedas-de-google` | El módulo Métricas con pestañas, el Resumen de hoy mudado, Búsquedas con Search Console | 1 | **sí:** la cuenta de Google y el DNS; el código se hace con respuestas grabadas |
| 6 | `novedades-y-kit` | `packages/kit-admin` y Novedades de punta a punta, con RSS | 3 | las categorías (ED); mientras, las de `novedades.ts` |
| 7 | `mensajes` | Los formularios públicos de contacto y de CV, las dos bandejas, CV privados, retención, avisos por mail | 2, 3 | **sí:** los campos del CV y la política de privacidad (ED); dónde se guardan los CV |
| 8 | `biblioteca-y-equipo` | Materiales con «agregar por DOI», salud de links, Equipo con publicaciones vinculadas | 6 | no |
| 9 | `casos-aliados-fotos` | Casos, Aliados con «Autorizado», la biblioteca de Fotos | 4, 6 | no |
| 10 | `ajustes` | Sitio, SEO (redirecciones, indexación, `sitemap.xml`), Avisos, Privacidad, Conexiones | 3, 5, 7 | no |
| 11 | `metricas-completas` | Resumen con marcas (B1), Origen, Acciones, Enlaces `/l/`, resumen semanal | 0, 7, 8 | un mes de datos |

**Un patrón nace con su primer consumidor**, nunca antes: un componente sin
quien lo use es código muerto. Por eso la lane 1 estrena los suyos en
Contenido y Páginas, «Sin permiso» nace en la lane 3 con la guarda, y el
buscador en la lane 6 con la lista de novedades. Cada uno se escribe en
DESIGN.md §11 en el PR que lo estrena, y los módulos siguientes lo consumen.

Olas, si nada de afuera se demora: **1 · 2 · 0** → **3 · 4 · 5** → **6 · 7** →
**8 · 9 · 10** → **11**. La lane 0 es del lado de Mateo o Gastón; las demás
corren en paralelo cuando su dependencia está mergeada.

## 8. Lo que tiene que venir de afuera

| Qué | Quién | Frena |
| --- | --- | --- |
| Las cuatro preguntas del deploy (cuenta y proyecto de Vercel, cómo se deployó, nombres de las variables, base conectada) | Mateo o Gastón | 0 y, por la producción, 5 y 11 |
| El token de Vercel y el `prj_…` | Mateo o Gastón | 0, 11 |
| Con la cuenta de Google de quién se verifica Search Console (hace falta el DNS) | ED o desarrollo | los datos reales de 5 |
| El dominio de envío en Resend (SPF, DKIM, DMARC) y apagar el click tracking | ED | los mails reales de 2, 3 y 7 |
| Qué datos pide el formulario de CV | ED | 7 |
| El texto de la política de privacidad | ED, con asesoría | 7 |
| Si Vercel Blob permite archivos privados, o dónde van los CV | desarrollo (se resuelve en la lane 7) | 7 |
| Quién recibe el mail de cada bandeja y el resumen semanal | quien dirige | 10 (se carga desde el admin) |
| Las categorías de Novedades | ED | 6 (arranca con las de hoy) |

## 9. Reglas que valen para todas las lanes

- **Las tablas se confirman antes de crearse** (AGENTS.md §12): el SPEC de
  cada lane nombra sus tablas y columnas, y aprobar ese SPEC es la
  confirmación. Nada de tablas ni columnas que no estén ahí.
- **Dependencias nuevas, con OK del owner** (AGENTS.md §5.6). Solo
  `@node-rs/argon2` lo tiene. Lo externo va por `fetch` (Resend, Crossref,
  OpenAlex, Search Console) cuando se pueda.
- **Permisos y actividad desde que existen:** a partir de la lane 3, cada
  layout de módulo y cada Server Action chequean `PUEDE` y registran en
  `actividad` lo que el §5.8 lista.
- **Diseño:** DESIGN.md §11 manda. Lo que se repite entre módulos se
  construye una vez en `admin/armazon/`, en la lane que lo usa primero (§7), y
  las siguientes lo consumen; un patrón nuevo se escribe en §11 en el mismo PR
  que lo estrena. El admin es una
  herramienta sobria: la marca en el color y el tipo, sin decoración.
- **Cada módulo borra su guía** de `admin/por-hacer/guias.ts` cuando se
  construye; la última lane borra la carpeta.
- **Copy:** lenguaje inclusivo, voseo, nunca «alumnos» (AGENTS.md §5.1).
- **Las cuatro fronteras** del spec del admin §3, y el gate de siempre en cada
  PR: typecheck, lint, react-doctor 100/100, tests y build.
- **Commits, push y PRs** siguen pidiendo confirmación (AGENTS.md §5.6);
  merge solo por PR con *Rebase and merge* (§5.7).

## 10. Fuera de este XL

- **La fase 4 del spec del admin:** las 26 rutas públicas nuevas (15 perfiles,
  4 casos, 7 landings de tipo), canonicals y JSON-LD. Casos y Equipo guardan
  su slug y escriben su 308, pero su «Se ve en» lista solo las páginas que
  existen hasta que esa fase las cree. El `sitemap.xml` de las rutas actuales
  sí entra, con Ajustes › SEO.
- Todo lo del §6 del mapa: saber qué instituciones visitan, contar personas
  únicas, roles a medida, Inicio con widgets, ⌘K, publicación programada,
  newsletter, importar CSV/BibTeX/RIS y taxonomías editables, aprobar antes de
  publicar, uptime y Core Web Vitals en el admin.
- Del §11 del spec, sigue afuera: autoguardado, bloqueo de documento
  concurrente (el aviso de choque sí entra), texto enriquecido, más de un
  idioma, comentarios.

## 11. Criterio de cierre

El XL cierra cuando las doce lanes están mergeadas en `main`, la carpeta
`admin/por-hacer/` no existe, AGENTS.md §13 marca las fases 2 y 3 del admin
como hechas, el spec del admin quedó al día en §7 y §11, y un recorrido de
punta a punta en producción (entrar con segundo factor, publicar una novedad,
recibir un contacto, verla en el Inicio) pasa.
