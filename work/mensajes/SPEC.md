# SPEC — Mensajes

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y dependencias incluidas: DECISIONS del padre,
  2026-09-26)
- **Tier:** L · lane 7 del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/mensajes`, dev server en el 3019, base `ed_mensajes`
- **Diseño:** el brief del padre (lane 7), sobre el SPEC padre §5.6, §5.10,
  §6, §8 y §9. Esto lo formaliza; no lo vuelve a decidir. Lo que el brief deja
  abierto y acá se propone está marcado **[propuesta]**.

---

## 1. Qué se quiere

El segundo objetivo de ED es sumar docentes por CV, y hoy el formulario de
contacto del sitio no manda nada a ningún lado: arma un `mailto:`. Esta lane
hace que lo que llega por los formularios públicos **quede guardado, avisado y
contestable desde el admin**, con los CV tratados como lo más sensible del
sistema: sin URL pública, se bajan con sesión y `verCV`, se borran solos.

## 2. Lo que ya existe y se usa

| Pieza | Dónde | Qué se toma |
| --- | --- | --- |
| `verContacto` (los tres roles) y `verCV` (dirige y administra) | `packages/auth/src/permisos.ts` | tal cual; no se suma ninguna capacidad |
| Mensajes en la sidebar, con `verContacto` | `admin/armazon/barra-lateral/modulos.ts` | tal cual |
| La guarda, «Sin permiso» | `admin/armazon/Guarda.tsx` | el layout del módulo y la bandeja de CV |
| `registrarActividad`, tipos cerrados | `datos/actividad.ts` | se suman cinco tipos (§10) |
| El cron diario con registro de tareas | `datos/tareas/diarias.ts`, ADR-0011 | se suman tres tareas (§8) |
| Los correos por Resend, o por consola en local | `correos/mandar.ts`, `correos/plantilla.ts` | un correo nuevo (§9) |
| Encabezado, pestañas, lista, estado vacío, apartado, insignia, botones, aviso | `admin/armazon/`, DESIGN.md §11 | consumidos; los que se extienden, en §12 |
| El formulario de contacto con su coreografía | `features/contacto/` | cambia qué pasa al enviar, no el diseño |
| `@vercel/blob` 2.8.0 | `apps/sitio/package.json` | ya trae almacenamiento privado (§3): **ninguna dependencia nueva** |

## 3. Dónde viven los CV — la investigación

**Vercel Blob tiene almacenamiento privado, en GA desde el 30 de junio de
2026** ([changelog](https://vercel.com/changelog/vercel-private-blob-is-now-generally-available),
[docs](https://vercel.com/docs/vercel-blob/private-storage)). Pide
`@vercel/blob` ≥ 2.3; el repo tiene la 2.8.0, y lo verifiqué en
`node_modules`: `get(ruta, { access: "private" })` devuelve el `stream`, y
`put` y `del` aceptan `access: "private"`. Como la respuesta es sí, no hay
alternativa que construir ni que preguntar; los números, para el registro:

| | Blob privado (Hobby) | Postgres en Neon (gratis) |
| --- | --- | --- |
| Espacio | 1 GB, 10 GB de transferencia por mes | **0,5 GB por proyecto, para toda la base** |
| Un CV en PDF | 0,1 a 1 MB lo típico; tope nuestro 4 MB | igual |
| Cuántos entran | ~1000 a 1 MB, y la retención de 12 meses los acota | 100 a 250 de 2 a 5 MB llenan la base entera |
| Costo al pasarse | en Hobby, Blob se frena 30 días (no cobra) | se frena la escritura de todo el sitio |

**Decisión:** los archivos van a **un store de Blob privado, aparte del de las
fotos** (el acceso público o privado se elige al crear el store y no se
cambia, y el de las fotos es público). Su token es `CV_BLOB_READ_WRITE_TOKEN`
(el prefijo que se elige al conectar el segundo store al proyecto). Sin token
y fuera de producción, van a `apps/sitio/.cv/`, git-ignorada, como las fotos
van a `.fotos/`. **Sin token en producción, el CV no se recibe** (503 en
llano): nunca al disco de una función.

- **La única salida del archivo** es
  `GET /admin/mensajes/cv/[id]/archivo`: sesión, `puede(rol, "verCV")`, y
  recién ahí el `stream` de Blob (o del disco), con
  `Content-Disposition: attachment; filename="CV de <nombre>.pdf"`,
  `Content-Type: application/pdf`, `Cache-Control: private, no-store` y
  `X-Content-Type-Options: nosniff`. Sin sesión, 401; sin `verCV`, 403; el
  proxy ya le pone `noindex` y las cabeceras del admin.
- **Tope: 4 MB.** Vercel corta el cuerpo de una función en 4,5 MB (413
  `FUNCTION_PAYLOAD_TOO_LARGE`); 4 MB deja el margen del multipart y de los
  otros campos. Se chequea el `Content-Length` antes de leer el cuerpo, y el
  archivo por sus bytes: tiene que empezar por `%PDF-`, no alcanza la
  extensión.
- **El nombre del archivo en el store** es `cv/<id>.pdf`, con el id de la
  fila: ni el nombre de la persona ni el del archivo original.

## 4. Las tablas (la confirmación de AGENTS.md §12)

Tres tablas nuevas y dos campos de relación en `User` (solo de Prisma, sin
columna: como `actividad`). Migración generada con `pnpm migrate` contra
`ed_mensajes`, nunca a mano.

### `mensajes` — una fila por lo que llegó

| Columna | Tipo | Para qué |
| --- | --- | --- |
| `id` | `uuid` | también nombra el archivo del CV |
| `bandeja` | `text` | `contacto` · `cv`; lista cerrada en código, sin enum de Postgres (sumar una no pide migración, como `actividad.tipo`) |
| `estado` | `text`, default `nuevo` | `nuevo` · `en-curso` · `cerrado` · `spam` |
| `estado_en` | `timestamptz`, default `now()` | desde cuándo está en ese estado: el plazo del spam cuenta desde acá |
| `recibido_en` | `timestamptz`, default `now()` | el plazo de Contacto y de CV cuenta desde acá |
| `nombre` | `text` | la lista, la ficha, el buscador |
| `correo` | `text` | «Responder» |
| `pais` | `text`, null | la columna de la lista |
| `tema` | `text`, null | Contacto: el tema elegido, como se lee («Investigación»); CV: null |
| `mensaje` | `text`, null | las primeras palabras en la lista, entero en la ficha, y el buscador |
| `datos` | `jsonb`, default `[]` | **lo demás que pidió el formulario, en su orden**: `[{ etiqueta, valor }]` (Contacto: la institución; CV: nivel y área). Congela lo que se preguntó: si ED cambia la lista del CV, las fichas viejas se siguen leyendo igual |
| `tomado_por_id` | `text`, null, FK `user` `ON DELETE SET NULL` | «Tomado por Raquel» |
| `archivo` | `text`, null | CV: la clave del archivo (`cv/<id>.pdf`); Contacto: null |
| `archivo_bytes` | `int`, null | el peso, para mostrarlo |

Índices: `(bandeja, estado, recibido_en)` para cada pestaña y el número;
`(estado, estado_en)` para la retención del spam.

### `limites_por_ip` — el tope de envíos de los formularios

| Columna | Tipo | Para qué |
| --- | --- | --- |
| `clave` | `text`, PK | HMAC-SHA256 de `<formulario>:<IP>` con el secreto de better-auth, con su prefijo propio, como `bloqueos_de_acceso`: **nunca la IP en claro** |
| `envios` | `int` | cuántos en la ventana que corre |
| `desde` | `timestamptz` | cuándo empezó la ventana (fija, de una hora) |

En la base y no en memoria porque el sitio corre en varias instancias. Se
cuenta con **un solo `INSERT … ON CONFLICT DO UPDATE … RETURNING`**, así dos
envíos a la vez no leen el mismo número. Lo que quedó quieto hace más de un
día se borra en el cron (§8).

### `avisos` — quién quiere el correo de cada bandeja

| Columna | Tipo | Para qué |
| --- | --- | --- |
| `cuenta_id` | `text`, FK `user` `ON DELETE CASCADE` | |
| `aviso` | `text` | `contacto` · `cv`; lista cerrada en código (la lane 11 suma `resumen-semanal`) |
| `activo` | `boolean` | |

PK `(cuenta_id, aviso)`. **Sin fila, activado**: así viene de fábrica sin
sembrar nada, y una cuenta nueva ya recibe. Reciben las cuentas **cuyo rol
puede ver esa bandeja** (`puede`) y no lo apagaron. Ajustes › Avisos (lane 10)
lee y escribe esta misma tabla con `destinatariosDe(bandeja)` y
`guardarAviso(…)`, que quedan en `datos/` para eso.

## 5. Los formularios públicos

### 5.1. Contacto → `POST /api/contacto`

- **El diseño no cambia; cambia el envío.** `coreografia-envio.ts` deja el
  `mailto:` y manda el formulario por `fetch` (JSON). Con `{ ok: true }`
  sigue a la transición al cierre que ya existe, tal cual; con
  `{ ok: false, error }` se queda en el formulario, el botón vuelve a
  «Enviar consulta» y una línea en `rojo-error` (6,57:1) con `role="alert"`
  dice qué pasó. Mientras viaja, el botón dice «Enviando…» con `aria-busy`.
- **El cierre deja de decir** «Dejamos tu mensaje listo en tu correo»: pasa a
  «Recibimos tu mensaje: te vamos a responder por correo», y el canal directo
  queda con el mail y «Copiar mail», sin «Copiar mensaje» (existía por el
  `mailto:`). El titular pilar no se toca.
- **El borde (Zod):** `tema` de la lista de `TEMAS`; `nombre` 1–120;
  `correo` un correo, hasta 254; `institucion` hasta 200; `pais` de
  `siteConfig.paises` + «Otro», o vacío; `mensaje` 1–5000.
- **Campo trampa:** un input `web` fuera de la pantalla, `aria-hidden`,
  `tabIndex={-1}`, sin autocompletar. Si llega con algo, se contesta
  `{ ok: true }` y no se guarda ni se avisa nada: el bot no aprende nada.
- **Límite por IP en la base:** 5 envíos por hora → 429 con `Retry-After` y
  «Ya nos mandaste varios mensajes seguidos. Probá de nuevo en una hora, o
  escribinos a contacto@…».
- **Respuestas:** 200 `{ ok: true }` · 400 `{ ok: false, error }` (el primer
  problema, en llano) · 429 · 500 «No pudimos guardar tu mensaje. Probá de
  nuevo en un rato, o escribinos a …». Nunca un stack ni un detalle de la
  base.
- **La línea de privacidad**, debajo del botón, en `gris-texto` y al tamaño
  de «Sumate al equipo»: «Usamos tus datos solo para responderte, y los
  borramos a los 24 meses. Si querés que los borremos antes, escribinos a
  contacto@…». Los plazos salen de `config/privacidad.ts` (§8), no del JSX.
- **«Sumate al equipo»** sigue siendo el `mailto:` mientras el CV esté
  apagado; encendido, lleva a `/sumate-al-equipo`.

### 5.2. CV → `POST /api/cv`, con su entrada apagada

- **El ajuste que lo enciende:** la variable `CV_ABIERTO=si` **[propuesta]**.
  Apagado (de fábrica), `/sumate-al-equipo` da 404, `/api/cv` da 404 y el
  link de Contacto sigue en `mailto:`. Una variable y no una constante para
  poder probarlo sin tocar código; el día que exista Ajustes › Privacidad
  (lane 10) puede mudarse ahí.
- **Los campos, en un solo lugar:** `config/cv.ts`, marcado **PROVISORIO**
  hasta que ED defina qué pide (SPEC padre §8): nombre y apellido, correo,
  país, nivel en que enseña, área en que enseña, mensaje (opcional) y el PDF.
  Cada campo dice su clave, su etiqueta, su tipo (texto · correo · opción ·
  párrafo), si es obligatorio, su largo y sus opciones. De esa lista salen el
  formulario, el esquema Zod de `/api/cv` y lo que guarda `datos`; cambiarla
  no toca nada más. `nombre` y `correo` son fijos (sin ellos no hay a quién
  responder) y un test lo exige.
- **La página `/sumate-al-equipo`** **[propuesta]**: una pantalla simple del
  sitio con el mismo lenguaje del formulario de contacto (sus clases de
  campo, el naranja solo en «Enviar mi CV»), el formulario armado desde la
  lista, la línea de privacidad («Guardamos tu CV 12 meses y después lo
  borramos, con el archivo…») y, al enviar, la confirmación en el lugar. No
  entra al menú ni al sitemap mientras sea provisoria.
- **El borde:** lo mismo que Contacto (Zod, trampa, 3 envíos por hora por
  IP), más el archivo: obligatorio, PDF por sus bytes, hasta 4 MB (§3).
- **Orden al guardar:** primero el archivo, después la fila; si la fila
  falla, se borra el archivo (el patrón de `subirFoto`).

## 6. Las bandejas — `/admin/mensajes`

| Ruta | Rol | Qué es |
| --- | --- | --- |
| `/admin/mensajes` | D A E | redirige a la bandeja con más nuevos de las que su rol ve (empate: Contacto) |
| `/admin/mensajes/contacto` | D A E | la bandeja |
| `/admin/mensajes/contacto/[id]` | D A E | la ficha |
| `/admin/mensajes/cv` | D A | la bandeja, con `<Guarda capacidad="verCV">` |
| `/admin/mensajes/cv/[id]` | D A | la ficha, con el archivo |
| `/admin/mensajes/cv/[id]/archivo` | D A | la descarga (§3) |

- **El layout del módulo** pasa por `<Guarda capacidad="verContacto">`
  (`modulos.ts` ya lo dice); la bandeja de CV suma su propia guarda. La guía
  `mensajes` sale de `admin/por-hacer/guias.ts`.
- **El encabezado de la bandeja:** `h1` «Mensajes», el detalle («Lo que llega
  por los formularios del sitio») y las pestañas **Contacto · CV con su
  número**. Quien edita ve una sola bandeja, así que no lleva pestañas
  (DESIGN.md §11: «cuando tiene más de una»). Título de pestaña: «Contacto ·
  Admin ED», «CV · Admin ED».
- **Debajo, el estado y el buscador** **[propuesta, la primera pregunta al
  padre]**: los cuatro estados (Nuevo · En curso · Cerrado · Spam) como un
  **filtro** de la lista y no como una segunda fila de pestañas, porque no
  son pantallas del módulo sino la misma lista filtrada (`?estado=`, Nuevo por
  defecto). Nuevo lleva su número. A la derecha, el buscador (`?q=`: nombre,
  correo y texto del mensaje, sin distinguir mayúsculas).
- **La lista** (`Lista` / `Fila`): lo principal es el nombre; el detalle, las
  primeras palabras del mensaje (80 caracteres) · el país · cuándo llegó
  (`Momento`); a la derecha, «Tomado por Raquel» si alguien lo tomó, y «Abrir»
  (link secundario, «Abrir el mensaje de Ana Pérez» para el lector). Las 50
  más recientes por estado; si hay más, una línea lo dice y remite al
  buscador.
- **Vacía:** `EstadoVacio` por estado («No hay mensajes nuevos» · «Los que
  lleguen por el formulario de contacto del sitio aparecen acá»); con
  búsqueda, «Ningún mensaje coincide con «…»» y «Borrar la búsqueda».
- **La ficha:** «← Contacto» arriba; el `h1` es el nombre, con la insignia
  del estado (Nuevo fuerte · En curso normal · Cerrado y Spam apagadas); el
  detalle: «Llegó el 21/9 a las 14:05 · Se borra el 21/9/2028» y «Tomado por
  Raquel». Debajo, los datos en una lista de definición (correo, país, tema o
  nivel y área, y lo de `datos`) y el mensaje entero, con sus saltos de línea.
  En un CV, además: «CV.pdf · 1,2 MB» y «Descargar el CV».
- **Las acciones**, un solo primario:

  | Estado | Primario | Secundarios | Al final, texto |
  | --- | --- | --- | --- |
  | Nuevo | Lo tomo yo | Responder · Cerrar | Marcar como spam · Borrar ahora |
  | En curso | Responder | Cerrar · Lo tomo yo (si lo tiene otra persona) | Marcar como spam · Borrar ahora |
  | Cerrado | — | Lo tomo yo (lo reabre) · Responder | Marcar como spam · Borrar ahora |
  | Spam | — | Lo tomo yo (no era spam) | Borrar ahora |

  «Lo tomo yo» → En curso, tomado por quien lo tocó. «Responder» es un
  `mailto:` con la dirección y el asunto («Tu consulta sobre Investigación» ·
  «Tu CV en Empoderamiento Docente»); no se responde desde el admin. «Borrar
  ahora» pide confirmación en el lugar (no se deshace) y vuelve a la bandeja
  con un aviso. Cada cambio mueve `estado_en`.
- **Server Actions** en `datos/acciones/mensajes.ts` (`tomar`, `cerrar`,
  `marcarComoSpam`, `borrar`): sesión, después `puede(rol, capacidadDe(bandeja))`
  con la bandeja que llega de la pantalla, y la escritura filtra por `id` **y**
  `bandeja`: una bandeja mentida no encuentra la fila.
  `acciones-con-sesion.test.ts` las cubre sin cambios.

## 7. El número — los sin leer

- **Sin leer es Nuevo** **[propuesta, la segunda pregunta]**: lo que nadie
  tomó, cerró ni marcó. Abrir la ficha no lo baja: la bandeja es compartida,
  y «nuevo» dice que nadie se hizo cargo, no que nadie lo miró.
- **Cuenta solo lo que tu rol ve:** quien edita, los nuevos de Contacto; quien
  dirige o administra, los de las dos bandejas.
- **En la sidebar**, en la entrada de Mensajes: `ItemDeNavegacion` suma un
  `numero`. Lo calcula `BarraLateral` en el servidor, como el punto de
  Contenido; si la base no contesta, la sidebar se dibuja sin número.
- **En las pestañas:** `Pestana` suma `numero` (Contacto 3 · CV 1), y el
  filtro de estados lo usa en Nuevo.
- **Cómo se ve y se anuncia:** una pastilla `rounded-full` en meta medium,
  `azul-principal` con el número en `white` (el tono fuerte de las insignias,
  13,63:1; en el mixto y el oscuro se invierte con los tokens, con su
  contraste medido en §11), empujada a la derecha como el punto. El número
  va `aria-hidden` y al lado un `sr-only` «(3 sin leer)», como el punto dice
  «(cambios sin publicar)». Con 0 no se dibuja nada; con más de 99, «99+».

## 8. Retención — tareas del cron diario

Los plazos viven en **`config/privacidad.ts`**: CV 12 meses, Contacto 24,
Spam 30 días. De ahí leen las tareas, la fecha «Se borra el…» de la ficha y
las líneas de privacidad de los formularios. Ajustes › Privacidad (lane 10)
los hace editables desde ese mismo lugar.

| Tarea (`clave`) | Qué borra |
| --- | --- |
| `retencion-de-contacto` | Contacto recibido hace más de 24 meses, y el spam de Contacto marcado hace más de 30 días |
| `retencion-de-cv` | CV recibido hace más de 12 meses, y el spam de CV marcado hace más de 30 días, **cada uno con su archivo** |
| `poda-de-limites-por-ip` | las ventanas de `limites_por_ip` quietas hace más de un día |

- Se suman a `TAREAS_DIARIAS`; cada corrida queda en `corridas_de_tareas` con
  su detalle («Se borraron 2 CV con sus archivos (1 de spam).»).
- **Un CV se borra archivo primero, fila después.** Si el archivo no se pudo
  borrar, la fila queda y la corrida siguiente lo reintenta; un archivo que ya
  no está no es un error.
- **Lo que borra el cron no va a `actividad`**: la actividad es de una
  persona (`cuenta_id` obligatoria), y el registro de lo automático son las
  corridas.

## 9. Avisos por mail

- **Cada mensaje nuevo** (no el que cayó en la trampa) avisa por Resend, en
  segundo plano (`after()`), a los destinatarios de su bandeja (§4, `avisos`).
  Un correo por persona.
- **El correo no lleva nada de quien escribió** — ni nombre, ni correo, ni
  texto, **en ninguna de las dos bandejas** **[propuesta, la tercera
  pregunta]**: el brief lo pide para el CV, y en Contacto una copia en cada
  buzón haría falsa la línea que promete borrarlo a los 24 meses. Asunto
  «Llegó un mensaje nuevo a Contacto» o «Llegó un CV nuevo»; el botón «Ver el
  mensaje» lleva a su ficha; al pie, «Te llega porque tenés activado este
  aviso. Lo apagás en Mi cuenta › Avisos».
- **Mi cuenta › Avisos** (nace acá): un `Apartado` con una casilla por
  bandeja que tu rol ve, activadas de fábrica, y «Guardar los avisos»
  (secundario, como los otros de Mi cuenta). La acción `guardarMisAvisos` es
  de la cuenta propia: va a `SIN_CAPACIDAD` de `acciones-con-sesion.test.ts`
  con ese motivo, y adentro descarta la bandeja que el rol no ve. Si al
  rebasear `MiCuenta.tsx` choca con la sección de la lane 3b, quedan las dos.

## 10. Actividad

Cinco tipos nuevos en `TIPOS_DE_ACTIVIDAD`: `tomo-un-mensaje`,
`cerro-un-mensaje`, `marco-un-mensaje-como-spam`, `borro-un-mensaje` y
`borro-un-cv`.

- **Contacto:** los cuatro primeros, con `sobre` = el tema («Investigación»)
  y `sobreId` = el id mientras exista (no en el borrado). **Nunca el nombre
  ni el texto de quien escribió**: si esa persona pide que la borren, la
  actividad no puede quedarse con su nombre 12 meses más.
- **CV:** solo `borro-un-cv`, sin `sobre` ni `sobreId`. Es lo que
  `actividad.ts` ya fija («De un CV se registra solo que se borró») y el SPEC
  padre §5.6; tomar, cerrar o marcar un CV no se registra.

## 11. Las filas del Inicio

El registro de pendientes de la lane 3c (`inicio`) no está en `main`. Si al
rebasear ya está, se suman «CV nuevos» y «mensajes sin leer» (con la consulta
del número de §7) y «CV que se borran en 7 días» (una consulta más, que no se
escribe sin su consumidor); si no, queda anotado en PROGRESS para que el padre
se lo pida a quien llegue segundo.

## 12. Lo que cambia en DESIGN.md §11 (lo revisa Mateo en el PR)

Cada uno nace con su primer consumidor en esta lane:

- **El número** en la sidebar y en las pestañas (§7), con sus contrastes en
  los tres temas.
- **El filtro** de una lista (los estados), si el padre aprueba la propuesta
  de §6.
- **El buscador** de una lista (`admin/armazon/Buscador.tsx`): un `form`
  `role="search"` por GET, sin JavaScript. Si al rebasear la lane 3b ya dejó
  uno en `main`, se consume el suyo; si no, el que rebasea segundo concilia.
- **«← volver»** en la ficha: el mismo trato que el buscador con la lane 3b.
- **Confirmar lo que no se deshace** («Borrar ahora»): la confirmación en el
  lugar, sin diálogo del navegador.
- **La casilla** (los avisos de Mi cuenta), si no existe al construirla.

## 13. Documentación

- **ADR-0012** «Mensajes: los CV en Blob privado, la retención y la ley»: la
  investigación de §3, los plazos y por qué (Argentina 25.326, art. 4 inc. 7
  —se destruyen cuando dejan de ser necesarios— y art. 16 —supresión en 5
  días hábiles—; Chile 21.719, en vigor desde el 1 de diciembre de 2026;
  México, la LFPDPPP de 2025 y sus derechos ARCO), qué no se hace (exportar a
  planilla, responder desde el admin, el origen en el CV) y lo que queda
  abierto (la política de privacidad, los campos del CV).
- **README:** `CV_BLOB_READ_WRITE_TOKEN`, `CV_ABIERTO`, cómo crear el store
  privado y cómo se enciende el CV; `.env.example` igual.
- **Spec del admin:** §5 (`/sumate-al-equipo`, `/api/contacto` y `/api/cv`
  dejan de estar reservadas) y §7 (los CV privados, el límite por IP de los
  formularios).
- **AGENTS.md §3** (lo revisa Mateo en el PR): el árbol de `datos/` suma
  `mensajes`, `avisos`, `limites-por-ip` y la retención; `config/` suma
  `cv.ts` y `privacidad.ts`.

## 14. Fuera de esta lane

El texto de la política de privacidad (ED, con asesoría); el embudo del CV y
los contadores (lane 11); Ajustes › Avisos y Privacidad (lane 10); responder
desde el admin, exportar a planilla y adjuntos en Contacto (nunca, por el
SPEC padre §5.6).

## 15. Riesgos y lo que depende de afuera

- **El store privado** lo crea quien tenga la cuenta de Vercel (lane 0):
  `vercel blob create-store --access private` y conectarlo con el prefijo
  `CV_BLOB`. Sin él, en producción el CV no se recibe, pero está apagado.
- **Los correos reales** esperan el dominio en Resend, como los de las lanes
  2 y 3; en local salen por la consola.
- **Los campos del CV y la política** son de ED: por eso la entrada nace
  apagada.

## 16. Cómo se verifica

El gate entero (`pnpm typecheck`, `pnpm lint`,
`node scripts/verificar-react-doctor.mjs`, `pnpm test`, `pnpm build`), y de
punta a punta en el dev server del 3019: mandar un contacto desde el sitio y
verlo en la bandeja con el número en la sidebar y en la pestaña; la trampa y
el 429; tomar, cerrar, marcar y borrar, con sus filas en `actividad`; con
`CV_ABIERTO=si`, mandar un PDF y bajarlo desde la ficha (y el 401/403 sin
sesión o como edita); un no-PDF rechazado; las tareas de retención con fechas
viejas; el correo del aviso en la consola y apagado desde Mi cuenta; los tres
temas, 390 de ancho y el foco con teclado.
