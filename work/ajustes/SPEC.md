# SPEC — Ajustes

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con las cuatro
  recomendaciones de §12 (DECISIONS). Crea tablas y cambia AGENTS.md §5.3:
  Mateo le delegó al padre las dos aprobaciones (DECISIONS del padre,
  2026-09-26, «procede en automatico»). Rebasado sobre `main` en `293e7ba`.
- **Decide:** el padre de `work/mapa-del-admin/`
- **Tier:** L · lane 10 del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/ajustes`, dev server en el 3025, base `ed_ajustes`
- **Diseño:** el brief del padre (lane 10), sobre el SPEC padre §3, §5.9, §6 y
  §9. Esto lo formaliza; no lo vuelve a decidir. Lo que el brief deja abierto
  va marcado **Lectura** con la que tomé, y lo que cambia lo que se construye
  va en §12, las preguntas.
- **Se apoya en** lo que ya está en `main` (`15def2c`): las capacidades y la
  guarda (`usarAjustes`, `configurarConexiones`), `actividad` con `QUIEN_VE` y
  `VA_AL_INICIO`, los patrones de `admin/armazon/` (índice de tarjetas,
  apartado, volver, lista, casilla, confirmar, aviso, estado vacío), el cron
  diario con `corridas_de_tareas`, la tabla `redirecciones`, la tabla `avisos`
  y `datos/avisos.ts` (lane 7), `config/privacidad.ts` (lane 7), el cliente
  de Search Console con su token (lane 5) y la `Tabla` de Cuentas (lane 3b),
  que vive con su único consumidor hasta que llegue un segundo: redirecciones
  e indexación lo son, así que sube a `admin/armazon/Tabla.tsx` (DECISIONS).

---

## 1. Qué se quiere

Lo que se configura una vez y hoy vive en el código pasa a editarse desde el
admin, solo para quien dirige y quien administra (`usarAjustes`): los datos
institucionales del sitio, las redirecciones, quién recibe cada aviso, los
plazos de retención, y el estado de cada conexión externa, para ver por qué
algo dejó de actualizarse sin llamar a quien desarrolla.

## 2. Pantallas

Todas bajo `app/(admin)/admin/(protegido)/ajustes/`, cuyo `layout.tsx` llama a
`<Guarda capacidad="usarAjustes">` (`guarda.test.ts` lo exige). **Cada
`page.tsx` chequea `usarAjustes` ella misma antes de leer nada** (la guarda
del layout no protege datos: el segmento de la página viaja en el payload RSC
aunque el layout dibuje «Sin permiso»; el test de `work/cuentas/` lo va a
exigir sin tocarlo). Los componentes, en `apps/sitio/src/admin/ajustes/`. La
guía de Ajustes sale de `admin/por-hacer/guias.ts`.

Sin pestañas (SPEC padre §6: Ajustes abre con un índice); cada pantalla vuelve
con «← Ajustes» (`Volver`, en el slot del encabezado). Títulos de pestaña del
navegador: «Ajustes», «Datos del sitio», «SEO · Ajustes» (el editor de páginas
ya tiene una pestaña «SEO»), «Avisos», «Privacidad», «Conexiones».

### 2.1. El índice — `/admin/ajustes`

`h1` «Ajustes», detalle «Lo que se configura una vez. Solo para quien dirige y
quien administra.», y el `IndiceDeTarjetas` de la lane 1 con cinco tarjetas,
cada una con su estado real, leído aislado (si una lectura tira, esa tarjeta
dice «No se pudo leer» y las otras siguen, como el Inicio):

| Tarjeta | Qué es | Estado |
| --- | --- | --- |
| Datos del sitio | Correo, WhatsApp, dirección, países y redes. | «Cambiados el 26 sep por Ana» · «Como se cargaron al empezar» |
| SEO | Redirecciones, indexación en Google y el sitemap. | «3 redirecciones · 7 de 8 páginas en Google» · «… · Search Console sin conectar» |
| Avisos | Quién recibe el correo de cada mensaje y de cada CV. | «Contacto: 3 personas · CV: 2» · insignia fuerte «Nadie recibe los CV» si una bandeja queda sin nadie |
| Privacidad | Cuánto se guarda lo que llega por los formularios. | «CV 12 meses · Contacto 24 · Spam 30 días» |
| Conexiones | Vercel Analytics, Search Console, Resend y Blob. | «4 de 5 configuradas» · insignia fuerte «1 con error» |

Las cinco pantallas, en ese orden, en una sola lista
(`admin/ajustes/pantallas.ts`), como `contenido/pantallas.ts`.

### 2.2. Datos del sitio — `/admin/ajustes/sitio`

Lo que hoy vive en `config/site.ts` y cambia sin tocar código: **el correo, el
WhatsApp, la dirección, los países y las redes**. Las personas de referencia
no se mudan: nada del sitio las lee, y su bloque muerto sale de
`config/site.ts`, anotado en el spec del admin para el JSON-LD de la fase 4
(§12, pregunta 2). Lo que es de la marca y no de un dato de contacto —el
nombre, la URL, la descripción, las frases pilares— se queda en
`config/site.ts`.

- **Encabezado** fijo: `h1` «Datos del sitio», «← Ajustes», detalle «Se ven en
  el pie de todas las páginas, el menú del celular, Contacto y los formularios.
  Se publican al guardar.», y el primario **«Guardar y publicar»**. Con
  cambios sin guardar, el modo navy y el aviso al salir, como el editor de
  páginas (SPEC padre §6, «Cambios sin guardar»).
- **Un formulario partido en `Apartado`s**, cada uno diciendo dónde se ve:

| Apartado | Campos | Se ve en |
| --- | --- | --- |
| Contacto | Correo (obligatorio) · WhatsApp (opcional: el número con el código de país, solo dígitos; vacío, no hay botón) | Contacto, el menú del celular y los errores de los formularios |
| Dirección | Calle y número · Piso u oficina (opcional) · Ciudad · Región (opcional) · País | Contacto |
| Países | Los países donde trabaja ED, separados por coma, en su orden (de 1 a 10) | el pie y el campo «País» de los formularios de Contacto y de CV |
| Redes | Instagram · Facebook · LinkedIn (cada una opcional; una URL `https` de su red) | el pie, el menú del celular y el cierre de Novedades |

- **Validación con Zod en el borde** (el esquema vive en
  `config/datos-del-sitio.ts` y lo usan la acción y la lectura): el correo es un
  correo; el WhatsApp, 8 a 15 dígitos; cada red, `https://` con el dominio de
  esa red (`instagram.com`, `facebook.com`, `linkedin.com`); los países, sin
  repetir. El error va en el campo mismo (DESIGN.md §11).
- **Guardar es publicar**, en un paso: escribe la fila, revalida el sitio
  entero (`revalidatePath("/(sitio)", "layout")`: el pie está en todas) y anota
  `cambio-los-datos-del-sitio` en la actividad. El aviso dice «Listo: el sitio
  ya muestra los datos nuevos.»

### 2.3. SEO — `/admin/ajustes/seo`

Tres `Apartado`s independientes (sin primario, como Mi cuenta):

- **Redirecciones.** Una `Tabla` con todas: desde (el encabezado de la fila),
  hacia, la insignia «Automática» (la escribió Novedades al cambiar una URL) o
  «A mano», y cuándo se creó. Las a mano se borran (con `Confirmacion`: «¿Borrar la redirección
  desde /viejo? Quien entre por ese link va a ver la página de error.»); las
  automáticas no se tocan desde acá, porque borrarlas rompe los links viejos.
  Debajo, **«Agregar una redirección»**: desde y hacia, validados (§5).
  Vacía: «Todavía no hay redirecciones. Se escriben solas cuando cambia la URL
  de una novedad, y acá se agregan las de un link viejo.»
- **Indexación en Google.** Una `Tabla` con una fila por URL del sitemap: la
  ruta, la insignia («En Google», normal · «Fuera de Google», fuerte · «Sin revisar»,
  apagada), lo que dice Google en castellano («Rastreada, todavía sin
  indexar») y el último rastreo; arriba, cuándo corrió la revisión y si salió
  bien. Sin Search Console conectado: el estado vacío «Search Console no está
  conectado», con un link a Conexiones.
- **Sitemap.** El link a `/sitemap.xml`, cuántas URLs tiene y qué deja afuera
  a propósito, en llano: el admin y las páginas apagadas (hoy «Sumate al
  equipo», mientras el formulario de CV no esté abierto).

### 2.4. Avisos — `/admin/ajustes/avisos`

Quién recibe el correo de cada mensaje nuevo, **la misma preferencia que Mi
cuenta › Avisos vista desde las cuentas** (lee y escribe la tabla `avisos` con
las funciones de `datos/avisos.ts`; sin fila, activado, como hoy).

- Un `Apartado` por aviso del registro (§6): «Contacto» y «CV». Adentro, las
  casillas de las cuentas cuyo rol puede recibirlo (nombre y correo en cada
  fila), y su botón secundario «Guardar quién recibe los de Contacto». **CV
  solo lista a quien dirige y a quien administra**: quien edita no ve los CV y
  no aparece ahí (`puede(rol, "verCV")`, nunca el string del rol).
- Si nadie queda marcado, se guarda igual y el aviso lo dice: «Nadie va a
  recibir un correo por los CV nuevos: los vas a ver solo al entrar al admin.»
- Cada guardado que cambia algo anota `cambio-quien-recibe-un-aviso` (sobre:
  «Contacto» o «CV»); guardar lo mismo no se anota.
- **El resumen semanal no está en la pantalla:** lo suma la lane 11 en el
  registro de avisos, y la pantalla lo dibuja sola (§6).

### 2.5. Privacidad — `/admin/ajustes/privacidad`

Los plazos de retención pasan de `config/privacidad.ts` a la base, editables:

| Plazo | Hoy | Tope (Lectura, §12 pregunta 4) | Contado desde |
| --- | --- | --- | --- |
| CV, con su archivo | 12 meses | de 1 a 24 meses | que llegó |
| Contacto | 24 meses | de 1 a 36 meses | que llegó |
| Spam | 30 días | de 1 a 90 días | que se marcó |

- Un formulario, primario **«Guardar los plazos»**. Arriba, en llano, qué
  promete cada uno al público y la regla de §4 (**alargar vale para lo que
  llegue desde ahora; acortar vale para todo**, §12 pregunta 1).
- **Acortar pide confirmación** si borra algo: antes de guardar, la acción
  cuenta cuánto se borraría en la próxima corrida («Con el plazo nuevo,
  mañana se borran 14 mensajes de Contacto y 3 CV. No se puede deshacer.»,
  con `Confirmacion`). Sin nada que borrar, guarda directo.
- **Las tareas de retención, la ficha («Se borra el…»), el pendiente de los CV
  que se borran en 7 días, los estados vacíos de las bandejas y la línea de
  privacidad de los dos formularios públicos leen de ahí**, nunca de una
  constante. Guardar revalida `/contacto` y `/sumate-al-equipo` (sus líneas
  dicen el plazo) y anota `cambio-los-plazos-de-guarda`.
- **La política de privacidad:** el sitio no tiene una publicada. La pantalla
  lo dice en llano: «El sitio todavía no tiene una política de privacidad
  publicada. El texto es de ED, con asesoría: cuando exista, va a estar
  linkeada acá.» (SPEC padre §8). No se inventa una ruta.

### 2.6. Conexiones — `/admin/ajustes/conexiones`

Una `Lista` con una fila por conexión, sin acciones (se configuran en Vercel,
no acá). Cada una: qué hace, **si está configurada** (por la presencia de sus
variables, nunca su valor: «Faltan VERCEL_TOKEN y VERCEL_ANALYTICS_PROJECT_ID»
nombra las que faltan) y, si tiene tareas del cron, **la última corrida de cada
una** de `corridas_de_tareas`: cuándo, si salió bien y su detalle en llano; si
la última falló, además cuándo fue la última correcta («Nunca salió bien» si
no hubo).

| Conexión | Variables | Tareas | Sin configurar |
| --- | --- | --- | --- |
| Vercel Analytics | `VERCEL_TOKEN`, `VERCEL_ANALYTICS_PROJECT_ID` | `metricas-de-vercel` | Métricas no se actualiza |
| Search Console | `SEARCH_CONSOLE_CLIENT_EMAIL`, `SEARCH_CONSOLE_PRIVATE_KEY`, `SEARCH_CONSOLE_SITE_URL` | `busquedas-de-google`, `indexacion-de-google` | Búsquedas y la indexación no se actualizan |
| Resend | `RESEND_API_KEY`, `CORREO_REMITENTE` | — (sale con cada correo) | los correos no salen |
| Blob de fotos | `BLOB_READ_WRITE_TOKEN` | — | las fotos van al disco: solo sirve en local |
| Blob de CV (privado) | `CV_BLOB_READ_WRITE_TOKEN` | `retencion-de-cv` | los CV no se reciben en Vercel |
| Cron diario (Vercel) — §12 pregunta 3 | `CRON_SECRET` | la última corrida de cualquier tarea | nada programado corre |

La insignia: «Configurada» (normal), «Sin configurar» (apagada) o «Con error»
(fuerte, si la última corrida de alguna de sus tareas falló). El registro de
conexiones (`datos/conexiones.ts`) es una lista: sumar una conexión es sumar
una línea.

## 3. Datos del sitio: de `config/site.ts` a la base

- **La tabla `datos_del_sitio`** (§8) tiene una fila sola, que carga **la
  migración** con los valores de hoy: producción la tiene en el primer deploy.
- **El sitio la lee por `datos/consultas/sitio.ts`** (`datosDelSitio()`, con
  `cache` de React), con las reglas de `contenidoDe`: sin `DATABASE_URL` o si
  la consulta tira en una visita, **los valores iniciales** (el sitio sigue
  compilando y sirviendo sin base); si tira durante `next build` con base
  configurada, el build falla, para no hornear datos viejos. Los valores
  iniciales quedan en `config/datos-del-sitio.ts`, con el tipo y el esquema,
  marcados como respaldo: nada del sitio los importa directo.
- **Quién lo recibe, por props** (`features/` y `components/` reciben props):
  el layout del sitio (el pie y el menú del celular), la página de Contacto
  (`CanalDirecto`, `CamposContacto`, `RailTema`, el `mailto` del CV y el error
  de envío), `/sumate-al-equipo` (el formulario de CV y su error) y
  `/novedades` (las redes del cierre). **Del lado del servidor**, los
  formularios públicos validan el país contra los países de la base
  (`datos/formularios/contacto.ts`, y `config/cv.ts` pasa de la constante
  `CAMPOS_DEL_CV` a `camposDelCV(paises)`) y el «escribinos a …» de sus
  errores sale del correo de la base.
- **AGENTS.md §5.3 cambia** (va en el PR, para que Mateo lo vea antes del
  merge): «Email, dirección, teléfono, URLs de redes → la tabla
  `datos_del_sitio`, editable en Ajustes › Datos del sitio; el sitio los lee
  por `datos/consultas/sitio.ts` y los pasa por props. `config/site.ts` guarda
  lo de la marca (nombre, URL, descripción, frases pilares). Nunca hardcodear
  datos institucionales en JSX.»

## 4. Privacidad: los plazos en la base

- **La tabla `plazos_de_retencion`** (§8) guarda cada plazo con **desde
  cuándo rige**: una fila por cambio, nunca se edita una. La migración carga
  los tres de hoy (CV 12, Contacto 24, Spam 30) como vigentes desde siempre.
- **La regla** (§12 pregunta 1, aprobada): a un mensaje de Contacto o
  a un CV se le aplica **el menor entre el plazo que regía cuando llegó y
  cualquiera posterior**. Así, alargar no guarda lo ya recibido más de lo que
  se le prometió a quien lo mandó (ADR-0012: «lo que se promete en el
  formulario es verdad»), y acortar vale para todo. El spam no es una promesa
  a nadie: su plazo vigente vale para todo lo marcado, y nunca pasa el de su
  bandeja (como hoy, `seBorraEl`).
- **Las funciones puras siguen en `config/privacidad.ts`** (sin base, con sus
  tests): reciben los plazos y el historial en vez de leer una constante —
  `tramosDeGuarda`, `seBorraEl`, y los bordes que usan la retención y el
  Inicio—. La lectura va por `datos/privacidad.ts` (`plazosDeGuarda()`), con
  los de hoy como respaldo sin base, como los datos del sitio.

## 5. SEO: redirecciones, sitemap e indexación

### 5.1. Redirecciones

- **La tabla `redirecciones` ya existe** y hoy nadie la lee ni la escribe en
  `main`. La lane 6 (`novedades-y-kit`, en vuelo) escribe las automáticas al
  cambiar el slug de una novedad y las lee en su ficha. Esta lane:
  - suma la columna **`a_mano`** (§8), falsa por defecto: lo que escribe
    Novedades queda «automática» sin cambiar su código;
  - **las aplica en todo el sitio**: la ruta atrapa-todo `(sitio)/[...resto]`,
    que hoy da 404 directo, busca antes la redirección de esa ruta
    (`datos/consultas/redirecciones.ts`, `redireccionDe(ruta)`) y contesta
    `permanentRedirect` (308). Si al rebasear la lane 6 ya dejó su
    `redireccionDe`, queda una sola.
- **Validación de una a mano** (función pura, con su test):
  - las dos son **rutas relativas del sitio**: empiezan con una sola `/`
    (`//` sería una redirección abierta a otro dominio), sin `\`, espacios,
    `?` ni `#`, hasta 200 caracteres; la barra final se saca;
  - **desde** no es una ruta que el sitio contesta por su cuenta, porque ahí
    una redirección no se aplicaría nunca: ni una página del sitemap, ni nada
    de lo declarado en `config/rutas.ts` (`RUTAS_DE_LA_APP`: cada ruta de
    `app/`, el admin, la API, lo de Next y los archivos de `public/`), y no
    tiene ya una redirección. Solo se aplica donde el sitio busca una: la
    atrapa-todo y la ficha de una novedad que no existe.
    `config/rutas.test.ts` recorre `app/` y `public/` y falla si algo no está
    declarado, o si algo declarado ya no está. *(Cambió en la ronda de
    arreglos: decía «no es una ruta que existe» y se chequeaba solo contra el
    sitemap, así que `/sumate-al-equipo` con el CV cerrado, `/sitemap.xml`,
    `/robots.txt` y el RSS se guardaban y nunca se aplicaban. DECISIONS,
    2026-09-27.)*
  - **hacia** es una ruta que existe: una de las del sitemap (§5.2);
  - **sin cadenas ni ciclos:** hacia no es el «desde» de otra redirección y
    desde no es el «hacia» de otra; desde ≠ hacia. Con las dos reglas de
    arriba ya no pueden darse, y se chequean igual, con su mensaje.
- Agregar revalida la ruta de desde (por si su 404 quedó en caché) y anota
  `agrego-una-redireccion`; borrar anota `borro-una-redireccion` (sobre: «/viejo
  → /nuevo») y dice qué pasa con la ruta: vuelve a la página de error, o no
  cambia nada si el sitio ya la contesta (una novedad publicada después con
  ese slug).

### 5.2. Sitemap

- **`app/sitemap.ts`** (Next lo sirve en `/sitemap.xml`), de
  `datos/consultas/rutas-del-sitio.ts` (`rutasDelSitio()`), la misma lista que
  revisa la indexación y valida el «hacia»: las siete páginas del registro
  (`contenido/paginas.ts`), las fichas de novedad que existen y
  `/sumate-al-equipo` **solo con `CV_ABIERTO=si`**. Nunca el admin ni la API.
  URLs absolutas con `siteConfig.url`. Sin `lastmod`: no hay una fecha
  confiable para todas y Google ignora las que no lo son.
- **`robots.ts`** suma la línea `Sitemap:` en producción (en un preview sigue
  cerrado entero).
- Cuando la lane 6 mude las novedades a la base, sus fichas salen de su
  consulta: lo concilia quien rebasea segundo.

### 5.3. Indexación

- **Una tarea del cron diario, `indexacion-de-google`** (ADR-0011: nunca en
  el render), con la cuenta de servicio y las tres variables de Search
  Console. Para cada ruta de `rutasDelSitio()` pide la **API de inspección de
  URL** (`POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`,
  alcance `webmasters.readonly`, verificada el 2026-09-26) y guarda el
  veredicto, lo que dice Google y el último rastreo en `indexacion_de_urls`
  (§8). Borra las filas de rutas que ya no están.
- **La cuota:** Google da 2000 inspecciones por día y 600 por minuto por
  propiedad. La tarea revisa **como mucho 20 por corrida**, las nunca
  revisadas primero y después las de revisión más vieja, **todas a la vez y
  aisladas** (cada pedido tiene su tiempo máximo de 20 s, así la corrida entra
  en sus 50). Hoy son 9 URLs: todas, todos los días. Una que falla sale en el
  detalle de la corrida con su explicación en llano, y las demás quedan
  guardadas. *(Cambió en la ejecución: decía «de a una, con un freno a los 35
  segundos»; react-doctor pide no esperar en un loop, y 20 pedidos juntos
  están lejos de los 600 por minuto. DECISIONS, 2026-09-27.)*
- **El cliente** (`lib/busquedas/inspeccion.ts`) no sabe de ED: recibe la
  cuenta, la propiedad y una URL, y devuelve el resultado; usa el token de
  `lib/busquedas/token.ts`. Sin las variables, la corrida sale fallida con la
  frase de siempre (`SIN_CONEXION`) y no toca la API.

## 6. Avisos: un registro

Hoy un aviso es una bandeja (`CLAVES_DE_BANDEJA`). Pasa a haber un **registro
de avisos** (`config/avisos.ts`): una entrada por aviso, con su clave (la de
la columna `avisos.aviso`), cómo se nombra y la capacidad que hace falta para
recibirlo. Hoy son dos, salidos de `BANDEJAS` (contacto · `verContacto`, cv ·
`verCV`). **La lane 11 suma ahí el resumen semanal**, y Ajustes › Avisos y Mi
cuenta › Avisos lo muestran sin tocar sus pantallas. `datos/avisos.ts` pasa a
recorrer el registro (`destinatariosDe(aviso)`, `avisosDe(cuenta, rol)`) y suma
`avisosDeTodas()` para la pantalla de Ajustes. Sin fila, activado, como hoy.

## 7. Permisos y actividad

- **`usarAjustes`** (dirige y administra) en el layout del módulo, en cada
  `page.tsx` antes de leer, y en cada Server Action justo después de la sesión
  (`acciones-con-sesion.test.ts` lo exige). Las consultas de `datos/` que
  devuelven cuentas (la de Avisos, con nombres y correos) piden la capacidad
  también. Probado con `next start`, logueada con edita, buscando los datos en
  el HTML entero.
- **Cinco tipos de actividad nuevos**, todos con `QUIEN_VE: "usarAjustes"` y
  `VA_AL_INICIO: true` (cambian algo del sitio o del admin), con su frase:

| Tipo | Frase | `sobre` |
| --- | --- | --- |
| `cambio-los-datos-del-sitio` | «Ana cambió los datos del sitio» | — |
| `agrego-una-redireccion` | «Ana agregó una redirección desde /viejo» | «/viejo → /nuevo» |
| `borro-una-redireccion` | «Ana borró la redirección desde /viejo» | «/viejo → /nuevo» |
| `cambio-quien-recibe-un-aviso` | «Ana cambió quién recibe los avisos de CV» | «Contacto» · «CV» |
| `cambio-los-plazos-de-guarda` | «Ana cambió los plazos de privacidad» | — |

## 8. Tablas y columnas

Cuatro migraciones, generadas con `pnpm migrate --create-only`; las que cargan
datos o un `CHECK` llevan ese SQL, comentado, **antes de su primera
aplicación** (AGENTS.md §12, ADR-0011).

**`datos_del_sitio`** — una fila sola.

| Columna | Tipo | Nota |
| --- | --- | --- |
| `id` | `int` PK, default 1 | `CHECK (id = 1)`: una fila, siempre |
| `correo` | `text` | |
| `whatsapp` | `text` null | solo dígitos, con el código de país |
| `calle` · `ciudad` · `pais` | `text` | |
| `complemento` · `region` | `text` null | |
| `paises` | `text[]` | en su orden |
| `instagram` · `facebook` · `linkedin` | `text` null | la URL |
| `cambiado_en` | `timestamptz` null | null: como la cargó la migración |
| `cambiado_por` | `text` null | el nombre, en llano, como `paginas.publicado_por` |

**`plazos_de_retencion`** — una fila por cambio.

| Columna | Tipo | Nota |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `que` | `text` | `cv` \| `contacto` (meses) · `spam` (días): lista cerrada en código |
| `valor` | `int` | |
| `desde` | `timestamptz` | desde cuándo rige; los tres iniciales, desde siempre |
| `puesto_por` | `text` null | el nombre; null en los iniciales |

Índice `(que, desde)`.

**`indexacion_de_urls`** — una fila por ruta del sitemap.

| Columna | Tipo | Nota |
| --- | --- | --- |
| `ruta` | `text` PK | «/que-hacemos» |
| `veredicto` | `text` | el de Google: `PASS`, `PARTIAL`, `FAIL`, `NEUTRAL`… |
| `cobertura` | `text` | el `coverageState` de Google, tal cual; la pantalla lo traduce |
| `ultimo_rastreo` | `timestamptz` null | |
| `revisada_en` | `timestamptz` | |

**`redirecciones`** — suma una columna.

| Columna | Tipo | Nota |
| --- | --- | --- |
| `a_mano` | `boolean`, default `false` | la agregó una persona en Ajustes › SEO |

Nada más: ni tablas ni columnas que no estén acá.

## 9. Lo que no es de esta lane

El SEO de cada página y de cada novedad (su editor), el resumen semanal (lane
11), el texto de la política de privacidad (ED), escribir las redirecciones
automáticas (lane 6), `lastmod` en el sitemap y la fase 4 (las 26 rutas
nuevas y el JSON-LD). Sin dependencias nuevas.

## 10. Docs

- **AGENTS.md** §5.3 (§3 de este SPEC), §3 (el árbol: `admin/ajustes/`,
  `datos/consultas/sitio.ts`, `rutas-del-sitio.ts`, `redirecciones.ts`,
  `datos/privacidad.ts`, `datos/conexiones.ts`, `config/avisos.ts`,
  `config/datos-del-sitio.ts`, `app/sitemap.ts`) y §12 si hace falta.
- **Spec del admin** (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`):
  Ajustes, las cuatro tablas, la regla de los plazos y, en la fase 4, las
  personas de referencia para el JSON-LD.
- **ADR-0015** (nuevo, enmienda al 0012; era el 0014 hasta que Novedades
  llegó antes con ese número): lo que Ajustes edita pasa a la base
  —los datos del sitio y los plazos—, y el plazo prometido al llegar es el
  techo de lo que se guarda. El índice de `adrs/` lo anota en la fila del 0012.
- **README**: Ajustes, el sitemap, la indexación (las mismas variables de
  Search Console) y que los datos institucionales ya no se cambian en el
  código.
- **DESIGN.md §11**: no nace ningún patrón —índice de tarjetas, apartado,
  casilla, lista, volver y confirmar alcanzan—, pero `Tabla` sube al armazón
  con su segundo consumidor y su entrada lo dice; §11 anota a Ajustes como
  consumidor donde el registro lo pide («Lo reusa Ajustes» pasa a decir qué
  usa).

## 11. Cómo se verifica

- El gate entero: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100 sin diagnósticos),
  `pnpm test` y `pnpm build`. Componentes ≤ 200 líneas, utilidades ≤ 100.
- Un test por comportamiento: el esquema de los datos del sitio, la
  validación de las redirecciones (cadenas y ciclos incluidos), los plazos con
  historial (alargar no toca lo viejo, acortar sí), las rutas del sitemap (sin
  `/sumate-al-equipo` apagado), el mapeo de la inspección, la tarea de
  indexación con un cliente falso, el estado de las conexiones y el registro
  de avisos; los de actividad, guarda y sesión cubren solos lo nuevo.
- En el navegador de Orca, en el 3025: las seis pantallas en los tres temas,
  a 390 de ancho y con teclado; cambiar el correo y verlo en el pie y en
  Contacto sin redeploy; agregar una redirección y seguirla (308); un CV que
  se borra al acortar el plazo, con su confirmación.
- `next start` logueada con edita: `/admin/ajustes/*` dice «Sin permiso» y el
  HTML no trae ni un dato de Ajustes.

## 12. Preguntas para el padre

**Respondidas el 2026-09-26: las cuatro, como recomiendo** (DECISIONS).

1. **Alargar un plazo, ¿vale para lo que ya llegó?** Recomiendo que **no**:
   el plazo que rige es el menor entre el prometido al llegar y cualquiera
   posterior (§4), con el historial en `plazos_de_retencion`. La alternativa
   simple —el plazo nuevo vale para todo, con un aviso al alargar— guarda
   datos más de lo que se le dijo a quien los mandó.
2. **Las personas de referencia** (fundadora y referente, en
   `siteConfig.direccion`) **no las lee nada** del sitio hoy. Recomiendo no
   mudarlas: un campo editable que no se ve en ninguna parte confunde, y el
   bloque muerto sale de `config/site.ts`, con una línea en el spec del admin
   para la fase 4 (el JSON-LD de la organización). La alternativa es mudarlas
   como dice el brief, con «Se ve en: todavía en ninguna página».
3. **Una fila más en Conexiones, el cron diario** (`CRON_SECRET` y la última
   corrida de cualquier tarea): sin ella, «última corrida hace 5 días» no
   dice si falló la conexión o si el cron no corre. Recomiendo sumarla.
4. **Los topes** (§2.5): CV de 1 a 24 meses, Contacto de 1 a 36, Spam de 1 a
   90 días. La ley no fija un número (ADR-0012: se borra cuando deja de ser
   necesario); el mínimo evita borrar todo por un cero, el máximo, guardar
   para siempre.
