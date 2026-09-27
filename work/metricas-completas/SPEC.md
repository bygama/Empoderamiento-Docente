# SPEC — Métricas completas

- **Fecha:** 2026-09-27
- **Estado:** aprobado por el padre el 2026-09-27, con las siete
  recomendaciones de §12 (DECISIONS). Crea tablas: Mateo le delegó al padre esa
  aprobación (DECISIONS del padre, 2026-09-26, «procede en automatico»).
- **Decide:** el padre de `work/mapa-del-admin/`
- **Tier:** L · lane 11 del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/metricas-completas`, dev server en el 3029, base `ed_metricas`
- **Diseño:** el brief del padre (lane 11), sobre el SPEC padre §5.7, §6 y §9 y
  la decisión «Un solo cron diario». Esto lo formaliza; no lo vuelve a
  decidir. Lo que el brief deja abierto va marcado **Lectura** con la que
  tomé, y lo que cambia lo que se construye va en §12, las preguntas.
- **Se apoya en** lo que ya está en `main` (`782aeb2`): el módulo Métricas con
  sus cinco pestañas (`admin/metricas/pantallas.ts`), el Resumen con el panel
  mínimo (`PanelMetricas`), Búsquedas, la copia diaria de Vercel
  (`datos/tareas/metricas-de-vercel.ts`, `metricas_diarias`,
  `metricas_ventanas`), el cron diario con su registro (`TAREAS_DIARIAS`,
  `corridas_de_tareas`, ADR-0011), el tope por IP con HMAC
  (`limites_por_ip`, `lib/formularios/limite.ts`), la tabla `avisos` con su
  registro (`config/avisos.ts`), `actividad` con `QUIEN_VE` y `VA_AL_INICIO`,
  el registro «Esta semana» del Inicio (`datos/inicio/esta-semana.ts`, con
  «Materiales consultados» esperando a esta lane), `rutasDelSitio()`,
  `config/rutas.ts` y los patrones de `admin/armazon/` (pestañas, filtro,
  lista, tabla, cifra, estado vacío, confirmar, aviso).

---

## 1. Qué se quiere

Que ED sepa qué trae gente al sitio y qué hace esa gente, sin cookies, sin
cuentas nuevas y sin identificar nunca a una persona ni a una institución. El
módulo Métricas ya existe con dos pantallas de verdad (Resumen mínimo y
Búsquedas); esta lane completa el Resumen (la B1 de la lane de métricas) y
construye las otras tres —Origen, Qué hace la gente y Links para compartir—,
más el resumen semanal por correo.

**Todavía no hay producción:** la cuenta de Vercel, el token y Search Console
son de la lane 0. Todo se construye y se prueba con datos sembrados en
`ed_metricas` y con respuestas grabadas de la API, como hizo la lane de
métricas; los estados de «poco tráfico» importan tanto como los llenos.

## 2. Lo que dice la API de Vercel, verificado hoy

Contra `vercel.com/docs/rest-api/web-analytics/aggregates-page-views`
(actualizada el 2026-09-27) y `…/analytics/web-analytics-api` (2026-06-26),
no de memoria:

| Qué | La API |
| --- | --- |
| Agrupar (`by`) | hasta **dos** dimensiones, y como mucho una de tiempo |
| Tiempo | `hour`, `day`, `week`, `month`, `year` |
| Dimensiones | `country`, `deviceType`, `environment`, `requestPath`, `route`, `referrerHostname`, `osName`, `browserName`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `flags` |
| Filtro | OData sobre las mismas dimensiones: `eq`, `ne`, `in`, `and`, `or`, `not` |
| `limit` | de 1 a 100 (10 por defecto); lo que no entra va a la fila `Others` |
| Rango | `aggregate` consulta dentro de la ventana de reporte del plan (un mes en Hobby) |

**Consecuencias para Origen:**

- **No hay regiones ni ciudades.** La API da el país y nada más fino. La
  pantalla lo dice en llano («Vercel no da provincias, estados ni ciudades:
  solo el país») y no inventa el bloque.
- **Sí hay hora** (`by=hour`): «Mejor hora para publicar» sale de ahí.
- **Sí hay sistema y navegador** (`osName`, `browserName`).
- **El cruce página × país no entra en un `by`** junto con el día (serían
  tres). Se copia como la página por día **filtrada por país**: una consulta
  por cada uno de los tres países fijos y una para el resto (`not (country in
  ('CL','MX','AR'))`). Cuatro consultas por corrida, cualquiera sea el rango.
- **Nada de esto pide migración:** `metricas_diarias.dimension` es texto, así
  que las dimensiones nuevas son valores nuevos de esa columna (§4.1). La
  forma exacta de `by` repetido sigue pendiente de confirmar con la primera
  corrida real (A1, lane 0), como ya dice `lib/metricas/vercel.ts`.

## 3. Palabras que usa el módulo

Tres números distintos, dichos siempre igual, y explicados una vez debajo de
las cifras del Resumen:

| Palabra | Qué cuenta | De dónde |
| --- | --- | --- |
| **Visitantes** | personas distintas en el período | `metricas_ventanas` (una persona que entró tres días cuenta una) |
| **Visitas** | cada día que alguien entra | la suma de los visitantes de cada día |
| **Vistas** | cada página que se abre | la suma de las vistas de cada día |

Las cifras grandes del Resumen son visitantes y vistas; canales, países,
referidos, dispositivos y la mejor hora van en **visitas**; las páginas más
vistas, en **vistas**.

## 4. Datos

### 4.1. La copia diaria de Vercel crece, sin migración

`sincronizarMetricas` suma, a las cuatro dimensiones de hoy (página, país,
referido, dispositivo):

| `dimension` | `valor` | Consulta |
| --- | --- | --- |
| `sistema` | el `osName` | `by=day,osName`, límite 20 |
| `navegador` | el `browserName` | `by=day,browserName`, límite 20 |
| `campana` | el `utmCampaign` (el código de un link, §6.4) | `by=day,utmCampaign`, límite 100 — **solo si el plan da UTM** (Hobby no) |
| `hora` | la hora UTC, `00` a `23`; `fecha` es el día UTC de esa hora | `by=hour` |
| `pagina-cl` · `pagina-mx` · `pagina-ar` · `pagina-otros` | la ruta | `by=day,requestPath` con `filter` por país, límite 100 |

**El plan manda** (ronda de arreglos 1): `PLAN_DE_VERCEL` en
`config/metricas.ts` dice lo que da el plan de hoy, con su fuente (la página
de límites de Web Analytics de Vercel, actualizada el 2026-08-25): Hobby,
«Reporting Window: 1 Month» y sin UTM. Por eso:

- **Nunca se pide más atrás que la ventana del plan** (30 días): cada corrida
  copia como mucho 30 días, y `metricas_ventanas` guarda solo las ventanas
  que caben —la de 7, su anterior y la de 30—. La de 90 y la anterior a la de
  30 no se piden: empiezan antes de lo que Vercel contesta.
- **Cada ventana es independiente:** la que falla no frena a las otras ni a
  las filas del día, y el detalle de la corrida la nombra («No se pudo: la de
  30 días hasta el …»). La marca de agua sigue siendo la fila `total`, que
  corre última y **depende solo de las filas del día**.
- **Los 90 días del Resumen:** las vistas son la suma de las filas `total`
  de cada día, si la copia tiene el período entero (si no, «—» con «La copia
  todavía no tiene los 90 días enteros»); las personas distintas no se suman
  día por día, así que visitantes va «—» y la nota dice por qué. La
  comparación es solo contra un período anterior **entero**; si no, «sin
  datos previos».
- **Sin UTM**, la consulta `campana` no se hace y las visitas de un link van
  «—» (§6.4). Si el plan cambia, se cambia `PLAN_DE_VERCEL` y lo demás lo
  sigue.

Los países fijos (Chile, México, Argentina) viven en `config/metricas.ts`; el
cliente (`lib/metricas/vercel.ts`) solo aprende a pasar un `filter` y las
dimensiones nuevas, sin saber de ED.

### 4.2. Tablas nuevas (una migración)

**`contadores`** — lo que cuenta el sitio mismo: solo sumas por día.

| Columna | Tipo | Qué |
| --- | --- | --- |
| `fecha` | `date` | el día UTC |
| `evento` | `text` | de la lista cerrada de §5.1 (en código, no un enum) |
| `canal` | `text` | `buscador` · `redes` · `asistentes-ia` · `directo` · `otros-sitios`, o `""` donde no aplica |
| `clave` | `text`, `""` por defecto | el id del material, o el id del link que trajo a la persona |
| `cuenta` | `int` | cuántos ese día |

Clave primaria `(fecha, evento, canal, clave)`. Se suma con un solo `INSERT …
ON CONFLICT DO UPDATE SET cuenta = cuenta + 1`, atómico como
`sumarEnvio`. **Sin IP, sin navegador, sin hora, sin nada de la persona.** No
se poda: son sumas, como `metricas_diarias`.

**`enlaces`** — los links para compartir.

| Columna | Tipo | Qué |
| --- | --- | --- |
| `id` | `uuid` | |
| `codigo` | `text`, único | lo que va en `/l/<codigo>`: sale del nombre |
| `nombre` | `text` | «Taller en Monterrey» |
| `destino` | `text` | la ruta del sitio: `/que-hacemos` |
| `canal` | `text` | `linkedin` · `whatsapp` · `instagram` · `mail` · `otro` (lista en código) |
| `creado_en` | `timestamp` | |
| `creado_por` | `text` | quién, en llano, como `novedades.creada_por` |

**`marcas`** — las marcas que se agregan a mano en la curva.

| Columna | Tipo | Qué |
| --- | --- | --- |
| `id` | `uuid` | |
| `fecha` | `date` | el día que marca |
| `texto` | `text` | «Posteamos en LinkedIn», hasta 80 |
| `creada_en` | `timestamp` | |
| `creada_por` | `text` | quién, en llano |

Índice por `fecha`. **Las marcas automáticas no se guardan acá** (§12,
pregunta 3): salen de `actividad`, de los tipos `publico-una-pagina` y
`publico-una-novedad`, que ya se anotan al publicar.

`limites_por_ip` no cambia: la ruta que cuenta y `/l/` usan el mismo patrón
(HMAC de «uso:IP» con el secreto de better-auth) y la misma poda diaria.

## 5. Contar en el sitio

### 5.1. Los eventos, cerrados

| `evento` | Cuándo | Canal | Clave |
| --- | --- | --- | --- |
| `cv-vio` | se abre `/sumate-al-equipo` (una vez por carga) | sí | el link, si llegó por uno |
| `cv-empezo` | la primera vez que se toca un campo del formulario de CV | sí | el link |
| `cv-envio` | `/api/cv` contestó `{ ok: true }` | sí | el link |
| `contacto-envio` | `/api/contacto` contestó `{ ok: true }` | sí | — |
| `material-consultado` | se toca el link de un material de la Biblioteca | — | el id del material |
| `enlace-clic` | alguien abre `/l/<codigo>` (§6.4); **no** entra por la ruta pública | — | el id del link |

Lista en `config/metricas.ts`, con cómo se nombra cada uno en el admin. Son
eventos raros: **nunca cada visita** (eso ya lo cuenta Vercel).

### 5.2. La ruta — `POST /api/contar`

- `app/api/contar/route.ts` solo delega en `datos/contadores/recibir.ts`,
  como los formularios.
- El cuerpo, validado con Zod: `{ evento, clave?, referido?, enlace? }`.
  `evento` de la lista pública (sin `enlace-clic`); `referido`, un hostname
  (el del `document.referrer`, que el navegador manda solo si es de otro
  sitio); `enlace`, un código.
- **El canal se decide en el servidor** con `lib/metricas/canales.ts` (§6.1) y
  se guarda solo el canal: el hostname no se guarda nunca.
- `enlace` se busca en `enlaces`; uno que no existe se ignora. `clave` de un
  material se busca en `materiales` (lane 8a); una que no existe no cuenta.
- **Tope por IP en la base:** 60 eventos por hora por IP, con la clave HMAC de
  `lib/formularios/limite.ts` («contar:IP»). Pasado el tope no cuenta.
- **Contesta siempre `204` sin cuerpo**, cuente o no: no le dice a un script
  qué pasó. `Cache-Control: no-store`.
- Del lado del navegador, `lib/contadores/contar.ts`: un `fetch` con
  `keepalive`, sin esperar respuesta y sin romper nada si falla. Lee el
  `utm_campaign` de la URL solo si `utm_medium=link`. **No guarda nada en el
  navegador:** ni cookie, ni `localStorage`, ni `sessionStorage`.

### 5.3. Dónde se llama

- `cv-vio`: un componente cliente mínimo en la página del CV
  (`features/cv/`), una vez por carga.
- `cv-empezo` y `cv-envio`: `FormularioCV`. **`/api/cv` no recibe nada
  nuevo**: el origen nunca viaja con el CV ni se guarda en `mensajes`.
- `contacto-envio`: la coreografía de envío de Contacto, después del `ok`.
- `material-consultado`: el link de un material en la Biblioteca pública, que
  reescribe la lane 8a (§11).

**Lectura:** un CV cuenta para un link solo si se manda en la misma carga en
que se llegó por ese link (la URL todavía tiene el código). Si la persona
llega a Inicio y después navega hasta el CV, el CV cuenta en su canal pero no
en el link: saberlo pediría guardar algo en su navegador. Lo dice la pantalla
de links y el README.

## 6. Pantallas

Todas bajo `app/(admin)/admin/(protegido)/metricas/`, cuyo layout ya llama a
`<Guarda capacidad="verMetricas">`. **Cada `page.tsx` chequea `verMetricas`
ella misma antes de leer nada**, aunque hoy la tengan los tres roles: la
guarda del layout no protege datos. Los componentes, en
`apps/sitio/src/admin/metricas/`. Todas leen solo de nuestras tablas, nunca de
una API en el render.

**El período** de Resumen, Origen y Qué hace la gente es el `Filtro` del
armazón en la URL (`?periodo=7|30|90`, 30 por defecto): «7 días · 30 días ·
90 días». No es un patrón nuevo: es la misma pantalla recortada por un valor
del query.

**Poco tráfico:** cada bloque tiene su mínimo, y por debajo dice «Todavía no
hay datos suficientes» con el `EstadoVacio` y una frase de cuánto falta, **sin
dibujar el gráfico ni la lista**. Los mínimos viven juntos en
`config/metricas.ts`:

| Bloque | Se dibuja con |
| --- | --- |
| La curva | 3 días con datos en el período |
| Canales, países, referidos, dispositivos, páginas | 20 visitas (o vistas) en el período |
| Página por país | 20 vistas en el período |
| Mejor hora para publicar | 200 visitas en el período |
| El camino del CV | 10 «vio la página» en el período |

**Cifras menores a 3, ocultas** (**Lectura**, §12 pregunta 5): el brief lo pide
para las regiones, que no existen; se aplica a todo lo de Origen que podría
señalar a alguien. Un país, un referido, un sistema o un navegador con menos
de 3 visitas va a «Otros (menos de 3 cada uno)»; los tres países fijos, si
tienen menos de 3, dicen «menos de 3»; una celda del cruce, lo mismo.

### 6.1. Resumen — `/admin/metricas`

- **Encabezado** del módulo con sus pestañas; «Actualizar ahora» (secundario)
  y la línea de «Datos hasta el …», como hoy. Sin primario: nada es «la»
  acción de esta pantalla.
- **El período** (Filtro) y dos `Cifra`: visitantes y vistas del período,
  contra el anterior, de `metricas_ventanas` (7 y 30); en 90, lo que dice
  §4.1. Debajo, la línea que explica visitantes · visitas · vistas (§3).
- **La curva:** los visitantes de cada día del período, con sus **marcas**
  (§6.1.1). Es la `Curva` nueva del armazón (§7).
- **Canales:** Buscador · Redes · Asistentes IA · Directo · Otros sitios, en
  ese orden fijo, con sus visitas y su parte del total, en una `Lista`.
  Directo es el referido vacío. El dominio del propio sitio no es un canal:
  sus filas no cuentan. La fila «Others» de la API va a Otros sitios.
- **Páginas más vistas:** las 10 primeras del período, con el nombre de la
  página cuando es una del registro (`PAGINAS`) o el título de la novedad, y
  la ruta abajo.

`lib/metricas/canales.ts` tiene **la lista de dominios en un solo lugar**,
sin nada de ED: buscadores (Google en todos sus dominios, Bing, DuckDuckGo,
Yahoo, Ecosia, Brave, Yandex, Baidu), redes (Facebook, Instagram, LinkedIn,
X/Twitter y `t.co`, YouTube, WhatsApp, TikTok, Threads, Bluesky, Telegram,
Pinterest, Reddit) y asistentes de IA (ChatGPT, Claude, Perplexity, Gemini,
Copilot, DeepSeek, Meta AI, Grok, You.com, Phind, Poe). Un host que termina en
uno de esos dominios es de ese canal; los asistentes se miran antes que los
buscadores (`gemini.google.com` no es Google). La usan el Resumen, Origen y la
ruta que cuenta.

#### 6.1.1. Las marcas

- **Solas:** cada `publico-una-pagina` y `publico-una-novedad` de `actividad`
  en el período es una marca en su día («Se publicó Inicio», «Se publicó la
  novedad «…»»). Varias publicaciones de lo mismo el mismo día son una marca.
- **A mano:** «Agregar marca» (secundario) abre en el lugar un formulario
  chico —la fecha (hoy por defecto, no futura) y el texto, hasta 80— que
  guarda en `marcas` y anota `agrego-una-marca`.
- **La lista de marcas del período** va debajo de la curva, de la más nueva a
  la más vieja: la fecha, el texto y, en las de a mano, quién y «Borrar»
  (destructivo, con `Confirmacion`), que anota `borro-una-marca` (§12,
  pregunta 3). Las automáticas no se borran: se borran publicando menos.
- En la curva, cada día con marca lleva una línea vertical y un número que
  remite a la lista; el lector lee la lista, no la línea.

### 6.2. Origen — `/admin/metricas/origen`

El período arriba, y en este orden, cada bloque con su ancla (las de la guía
de hoy):

- **Países** (`#paises`): Chile, México y Argentina siempre arriba, aunque
  tengan cero, y después el resto de mayor a menor; los nombres con
  `Intl.DisplayNames` en español. Visitas y parte del total.
- **Regiones** (`#regiones`): el `EstadoVacio` con «Vercel no da provincias,
  estados ni ciudades: solo el país. Por eso acá no hay regiones.» Sin
  gráfico, sin inventar.
- **De dónde llegan** (`#referidos`): los sitios que traen gente, con su
  canal al lado en meta. Sin el propio dominio.
- **Dispositivo, sistema y navegador** (`#dispositivos`): tres listas cortas,
  una al lado de la otra desde `lg`.
- **Página por país** (`#pagina-por-pais`): una `Tabla` con las 10 páginas
  más vistas del período en las filas y Chile · México · Argentina · Otros
  países en las columnas, en vistas.
- **Mejor hora para publicar** (`#mejor-hora`): una grilla de 7 días × 24
  horas, **en hora de Chile** (§12, pregunta 7), con las visitas del período
  sumadas por día de la semana y hora. Arriba, la respuesta en una frase:
  «Cuando más gente entra: los martes de 10 a 11, los miércoles de 10 a 11 y
  los lunes de 18 a 19.» La grilla es una tabla de verdad, con el número de
  cada celda para el lector.

### 6.3. Qué hace la gente — `/admin/metricas/acciones`

El período arriba, y una línea que dice cómo se cuenta: «Solo sumas por día:
sin cookies, sin IP y sin saber quién.»

- **El camino del CV** (`#cv`): una `Tabla` con los cinco canales y el total
  en las filas y «Vio la página · Empezó el formulario · Lo envió» en las
  columnas. Con el formulario cerrado (`CV_ABIERTO` apagado) y sin datos, el
  estado vacío lo dice: «El formulario de CV está cerrado» y «Cuando se abra,
  acá se ve cuántas veces se abre la página, se empieza el formulario y se
  manda, y por dónde llegó la gente.» `cv-vio` cuenta cargas: con poco dato,
  se dice en **vistas de la página** (§3), no en personas.
- **Contactos enviados** (`#contactos`): una `Cifra` del período contra el
  anterior y, debajo, por canal.
- **Materiales más consultados** (`#materiales`): los 10 más consultados del
  período, con su título y cuántas veces. Depende de la lane 8a (§11).

### 6.4. Links para compartir — `/admin/metricas/enlaces` y `/l/[codigo]`

**Crear un link** (`#crear`), arriba: tres campos y el primario de la
pantalla, **«Crear link»**.

- **Página:** una `Seleccion` con `rutasDelSitio()` —las siete páginas, las
  fichas de novedad publicadas y el CV si está abierto—, cada una por su
  nombre. El servidor vuelve a validar que la ruta esté en esa lista.
- **Dónde lo compartís:** LinkedIn · WhatsApp · Instagram · Mail · Otro.
- **Nombre:** de 3 a 60 caracteres; sale el código (`taller-en-monterrey`),
  en minúsculas y sin tildes, hasta 40, con `-2`, `-3` si ya existe. Se ve
  debajo mientras se escribe: «Va a quedar …/l/taller-en-monterrey».
- Creado, un aviso de confirmación con el link entero y «Copiar», y la fila
  nueva arriba de la lista. Anota `creo-un-enlace`.

**Tus links** (`#links`): una `Lista`, del más nuevo al más viejo. Cada fila:
el nombre y el canal como insignia normal; el detalle con el link corto, a qué
página lleva, quién lo creó y cuándo; las cifras de todo el tiempo —**clics**
(los de `/l/`), **visitas** (las de Vercel con ese `utm_campaign`) y **CV** (los
`cv-envio` con ese link)—; y a la derecha **«Copiar»** (secundario, con aviso
«Copiado» para el lector) y **«Borrar»** (destructivo, con `Confirmacion`: «¿Borrar el
link? Si ya lo compartiste, deja de andar.»), que anota `borro-un-enlace`. Sin
datos de Vercel, o sin UTM en el plan (§4.1), las visitas van «—», y la
explicación del bloque lo dice. Vacía: «Todavía no hay links» y qué son.
Debajo de la lista, la línea de §5.3: cuándo un CV cuenta para un link.

**`/l/[codigo]`** (`app/(sitio)/l/[codigo]/page.tsx`, declarada en
`config/rutas.ts`). Es una página y no un `route.ts` porque ahí `notFound()`
contesta un 404 vacío; una página no ve el método, así que el proxy le pasa el
real en `x-ed-metodo` y pisa el que venga de afuera (DECISIONS, ronda 1):

- Busca el código; si no existe, el 404 del sitio.
- Redirige con **307** (temporal, nunca 308) y `Cache-Control: no-store` a
  `destino?utm_source=<canal>&utm_medium=link&utm_campaign=<codigo>`. Así
  Vercel cuenta las visitas del link sin nada propio.
- **Cuenta el clic en el servidor**, sin cookies, aunque la persona bloquee la
  analítica: `enlace-clic` con el id del link. Solo un `GET` —un `HEAD`, o un
  pedido sin la cabecera del proxy, no cuenta—, y no cuentan las
  vistas previas de las redes ni los robots (un `User-Agent` de la lista de
  `lib/metricas/robots.ts`: se lee, no se guarda). Tope: 3 clics por hora por
  IP y link (HMAC «enlace:<id>:IP»); pasado, redirige igual y no cuenta.

## 7. Diseño

DESIGN.md §11 manda; la UI se hace con `designing-consistently` (leer §11
entero antes de tocar, registrar lo nuevo en el mismo PR) y
`frontend-design`. Solo tokens, los cuatro tamaños de tipo, un primario por
pantalla (solo Links lo tiene), sin verde ni naranja fuera de su regla,
contrastes medidos y escritos. Se prueba en claro, mixto y oscuro, a 390 de
ancho y con teclado.

**Nace un patrón: los gráficos** (§11, «Gráficos»), con dos piezas:

- **`Curva`** (`admin/armazon/Curva.tsx`, sin ED): un SVG dibujado en el
  servidor, sin dependencias. La línea en `azul-medio` (5,11:1 contra blanco,
  más de 3:1 como objeto gráfico), el área debajo en `azul-claro/30`, los ejes
  y la grilla en `azul-claro/60` decorativos, las etiquetas en meta
  `gris-texto`, las marcas en `gris-texto` punteadas con su número. Tiene un
  `role="img"` con una frase que la resume («Visitantes por día del 1 al 30
  de septiembre: entre 3 y 41, con el pico el 12») y, plegada debajo, la tabla
  con los números. Sus estados: sin datos, pocos datos (§6) y con datos.
- **La grilla de la mejor hora** (`admin/metricas/MejorHora.tsx`): celdas en
  cinco pasos de `azul-medio` sobre blanco, con el número adentro solo para el
  lector, y la frase de arriba como respuesta.

Los tonos se validan con la skill `dataviz` y se escriben en §11 con sus
contrastes en los tres temas.

## 8. El resumen semanal por correo

- **El aviso:** `resumen-semanal` entra al registro `config/avisos.ts`
  (capacidad `verMetricas`, «Resumen semanal», «resumen de métricas de los
  lunes»), y aparece solo en Mi cuenta › Avisos y en Ajustes › Avisos.
- **Apagado de fábrica** (§12, pregunta 2): el brief dice «para quien lo
  active». El registro gana `deFabrica` (Contacto y CV siguen en `true`) y
  `datos/avisos.ts` lo respeta en sus cuatro funciones: sin fila, vale
  `deFabrica`.
- **La tarea** `resumen-semanal` en `TAREAS_DIARIAS`: corre todos los días y
  actúa solo cuando en Chile es lunes (el cron corre a las 4 UTC: la
  madrugada del lunes en Chile). Los demás días, «Hoy no es lunes».
- **Un mes de datos:** si la fila `total` más vieja de `metricas_diarias` no
  tiene 28 días, no manda y lo dice: en el detalle de la corrida («Todavía no
  hay un mes de datos: hay 12 días») y en Mi cuenta › Avisos, debajo de la
  casilla («Empieza cuando haya un mes de datos: faltan 16 días.»).
- **Qué trae**, la semana de lunes a domingo contra la anterior, **según el
  rol de quien lo recibe**: visitantes, vistas, clics desde Google (si Search
  Console está conectado), contactos enviados, CV recibidos (solo con
  `verCV`, como el Inicio) y materiales consultados (cuando cuenten); la
  página más vista; y «Ver las métricas». Sin nada de ninguna persona.
- **Una sola semana para todo** (ronda de arreglos 1): la de los siete días
  antes del lunes de Chile en que sale (`semanaAntesDe`), y cada número la
  cuenta en días UTC, como se guardan las sumas: visitantes y vistas, de la
  ventana de 7 días que termina el domingo; contactos, materiales y la página
  más vista, de lunes a domingo; los CV, del lunes a las 0 al lunes siguiente
  a las 0 (UTC). Los clics de Google, solo si Search Console ya llegó al
  domingo; si no, «—» con el porqué (Google los da con 2 o 3 días de atraso,
  así que el lunes a la madrugada casi siempre falta). La tarea espera a la
  copia de Vercel de la misma corrida (`despuesDe`), que es la que escribe
  la ventana del domingo.
- **Sale por Resend** con `mandarCorreo`, que gana un `idempotencia` opcional:
  la clave es `resumen-semanal:<lunes>:<cuenta>`, así una segunda corrida el
  mismo lunes no lo manda dos veces. Un correo que no sale no frena a los
  demás; la corrida dice cuántos salieron.
- **Ajustes › Conexiones:** Resend suma `resumen-semanal` a sus tareas.

## 9. Permisos y actividad

- Cada página de Métricas y cada acción nueva (`agregarMarca`, `borrarMarca`,
  `crearEnlace`, `borrarEnlace`) empiezan por `auth.api.getSession` y
  `puede(rol, "verMetricas")` (los tres roles). `acciones-con-sesion.test.ts` lo
  exige.
- Cuatro tipos nuevos en `actividad`, con su frase, su módulo «Métricas» en
  Cuentas › Actividad, `QUIEN_VE = verMetricas` y `VA_AL_INICIO = true`:

| Tipo | `sobre` | Frase |
| --- | --- | --- |
| `creo-un-enlace` | el nombre del link | «Ana creó el link «Taller en Monterrey»» |
| `borro-un-enlace` | el nombre | «Ana borró el link «…»» |
| `agrego-una-marca` | el texto | «Ana agregó la marca «Posteamos en LinkedIn»» |
| `borro-una-marca` | el texto | «Ana borró la marca «…»» |

Ninguno lleva a una pantalla (`pantallaDe`): un link o una marca se borran.

## 10. Lo que se va y lo que se toca

- **Se borran las guías de Métricas:** `admin/por-hacer/guias-de-metricas.ts`,
  `GuiaDeMetricas.tsx` y `metricas/[pantalla]/page.tsx`. Las cinco pestañas
  quedan con sus pantallas de verdad.
- **El Inicio:** «Materiales consultados» de «Esta semana» deja de ser
  `todaviaNo` y lee `contadores` (los últimos 7 días contra los 7 anteriores),
  cuando el evento exista (§11).
- **La Biblioteca del admin** (`/admin/biblioteca`, lane 8a): la columna
  «consultado N veces este mes» (§11).
- **Docs:** un ADR nuevo, **ADR-0017** (el 0016 es de la Biblioteca, en su PR):
  contadores propios y links cortos, con el porqué de privacidad; el README
  (qué ve ED en Métricas, de dónde sale y cuándo llega); AGENTS.md §3 (el
  árbol: `contadores`, `lib/metricas/canales.ts`, `/api/contar`, `/l/`); el
  spec del admin (las tablas y las pantallas de Métricas); DESIGN.md §11
  («Gráficos»). Los cambios a AGENTS.md y DESIGN.md los revisa Mateo en el PR
  (DECISIONS del padre).

## 11. Lo que depende de la lane 8a (Biblioteca)

La 8a pasa los materiales a la base (`materiales`, id `uuid`) y reescribe la
Biblioteca pública y su admin; está en revisión y no en `main`. De ella
dependen tres cosas de esta lane, que van **al final del PLAN**:

1. contar `material-consultado` en el link de un material de la Biblioteca
   pública (con el id de la base);
2. «Materiales más consultados» en Qué hace la gente y «Materiales
   consultados» en el Inicio y en el resumen semanal;
3. la columna «consultado N veces este mes» en `/admin/biblioteca`.

Si al llegar ahí la 8a está en `main`, rebaseo y las sumo; si no, pregunto por
`ask` y sigo con lo demás, como dice el brief. La ruta que cuenta ya acepta el
evento desde el principio, validando contra `materiales` recién cuando exista.

## 12. Preguntas para el padre

Cada una con su recomendación; construyo con la recomendada salvo que digas
otra cosa.

1. **Sin migración para la copia de Vercel.** Las dimensiones nuevas son
   valores de `metricas_diarias.dimension` (texto), y el cruce página × país
   se copia filtrado por los tres países fijos y el resto (4 consultas por
   corrida) en vez de un día a la vez (hasta 31). El brief anticipaba una
   migración para sumar dimensiones; no hace falta. **Recomiendo así.**
2. **El resumen semanal viene apagado** (`deFabrica: false` en el registro) y
   lo prende cada persona en Mi cuenta o quien administra en Ajustes › Avisos.
   Contacto y CV siguen prendidos de fábrica. **Recomiendo así.**
3. **Las marcas automáticas salen de `actividad`**, sin tocar las acciones de
   publicar de Novedades ni de Páginas (que otras lanes están tocando), y
   `marcas` guarda solo las de a mano. Y **una marca a mano se puede borrar**
   (con su tipo `borro-una-marca`): el brief pide solo agregar, pero una marca
   con un error de tipeo que no se puede sacar ensucia la curva para siempre.
   **Recomiendo las dos cosas.**
4. **Las visitas de un link salen de Vercel** con el `utm_campaign` que agrega
   la redirección; los clics, de `/l/`; los CV, del evento con el código del
   link en la URL (§5.3, sin guardar nada en el navegador). **Recomiendo así.**
5. **«Menos de 3, oculto» en todo Origen**, no solo en las regiones (que no
   existen): países, referidos, dispositivos, sistemas, navegadores y el
   cruce. **Recomiendo así.**
6. **La 8a:** ¿va a estar en `main` antes de que llegue al final del PLAN? Si
   ya sabés que no, construyo lo que depende de ella contra su rama y lo dejo
   para un PR chico después del merge.
7. **La hora de Chile** para «Mejor hora para publicar» y para decidir que es
   lunes: ED tiene su dirección en Santiago (Ajustes › Datos del sitio), y la
   zona va en `config/metricas.ts`. **Recomiendo así.**

## 13. Fuera de esta lane

- La conexión real con Vercel y con Search Console, y la primera corrida que
  confirma la forma de `by` (lane 0, deploy).
- Saber qué instituciones visitan, contar personas únicas más allá de lo que
  da Vercel, y cualquier dato de una persona (SPEC padre §10).
- La publicación programada, embudos a medida y eventos que no estén en §5.1.
- Borrar la carpeta `admin/por-hacer/` (la última lane del XL).

## 14. Criterio de cierre

- Las cinco pestañas de Métricas son pantallas de verdad y no queda ninguna
  guía de Métricas.
- Con `ed_metricas` sembrada con poco tráfico y con mucho, cada bloque de
  Resumen, Origen y Qué hace la gente muestra su estado correcto (sin datos,
  pocos, llenos), probado en el navegador en los tres temas, a 390 y con
  teclado.
- `/l/<codigo>` redirige con 307, `no-store` y los UTM, y cuenta un clic que
  se ve en Links; un robot no cuenta; un código que no existe da 404.
- `POST /api/contar` cuenta los eventos de la lista, contesta 204 siempre, no
  guarda nada de la persona y respeta el tope; el CV y el contacto cuentan su
  envío desde el sitio.
- El resumen semanal sale el lunes a quien lo activó, no antes del mes de
  datos, sin CV para quien edita, y no sale dos veces.
- Quien edita ve y usa todo Métricas; las cuatro acciones quedan en
  `actividad` con su frase.
- El gate entero en verde: typecheck, lint, react-doctor 100/100 sin
  diagnósticos, test y build.
