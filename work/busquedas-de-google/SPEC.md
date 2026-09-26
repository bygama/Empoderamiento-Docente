# SPEC — Búsquedas de Google

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con la opción A en §9.1 y
  una nota en §9.9 (DECISIONS.md)
- **Aprueba:** el padre (`work/mapa-del-admin/`), con tablas y migración
  incluidas: Mateo le delegó todo el 2026-09-26 (DECISIONS del padre). No suma
  dependencias.
- **Tier:** L · lane 5 del XL `work/mapa-del-admin/` (SPEC §5.7, §6, §7, §8,
  §9) · rama `mateo/busquedas-de-google` · dev server en el puerto 3015 · base
  propia `ed_busquedas` (esta lane migra).
- **Diseño:** el brief del padre, más dos entradas de su DECISIONS: «Un solo
  cron diario, con un registro de tareas» y «La lane 5 no toca el Inicio».
  Este SPEC lo formaliza y deja escritas, en §9, las lecturas que el brief no
  cerraba, para que el padre las vea antes del PLAN.

---

## 1. Qué se quiere

El objetivo número uno de ED es posicionarse en buscadores, y los datos de
Search Console se acumulan desde que se conecta: por eso esta lane va
temprano. Abre el módulo **Métricas** con sus pestañas, le suma la primera
pantalla nueva, **Búsquedas**, y deja la base de lo programado para todo el
admin: **un solo cron diario** que corre un registro de tareas, cada una
aislada, y deja cada corrida en una tabla común.

## 2. Lo que hay hoy (`main` en `8b53269`)

| Parte | Estado |
| --- | --- |
| Métricas en la sidebar | lleva a la guía «por hacer» del módulo (`admin/por-hacer/guias.ts`, clave `metricas`), por la ruta `[modulo]` |
| El panel de Vercel | `admin/metricas/PanelMetricas.tsx`, en el Inicio: cuatro tarjetas, «Actualizar ahora», tres estados vacíos |
| La copia de Vercel | `datos/acciones/sincronizar-metricas.ts`; la registra ella misma en `metricas_sincronizaciones` (`desde`, `hasta`, `ok`, `detalle`) |
| El cron | `/api/cron/metricas`, con `CRON_SECRET`; `vercel.json` con ese único cron a las 4 UTC |
| «Actualizar ahora» | `datos/acciones/actualizar-metricas.ts`: sesión, freno de 10 minutos leyendo `metricas_sincronizaciones`, `minimoDias: 3` |
| Permisos | `packages/auth/src/permisos.ts`: `PUEDE.tocarContenido` y `PUEDE.tocarCuentas`; roles `administra` y `edita` |
| Patrones | Pestañas, índice, lista y estado vacío en `admin/armazon/` (lane 1, #178); Contenido los consume con `pantallas.ts`, `EncabezadoDeContenido` y las guías de `por-hacer/guias-de-contenido.ts` |

## 3. El módulo Métricas con pestañas

- **Rutas** (SPEC padre §4): `/admin/metricas` (Resumen),
  `/admin/metricas/busquedas`, `/admin/metricas/origen`,
  `/admin/metricas/acciones`, `/admin/metricas/enlaces`.
- **Pestañas:** Resumen · Búsquedas · Origen · Qué hace la gente · Links para
  compartir, en las cinco pantallas. El `h1` es «Métricas», la pestaña
  encendida dice la pantalla y el título del navegador también («Búsquedas ·
  Admin ED»; el Resumen, «Métricas · Admin ED»).
- **Una sola lista** (`admin/metricas/pantallas.ts`) para las pestañas y las
  guías, como `admin/contenido/pantallas.ts`: una pestaña y su guía no pueden
  decir cosas distintas. Un `EncabezadoDeMetricas`, hermano de
  `EncabezadoDeContenido`.
- **Resumen** es el encabezado del módulo y `PanelMetricas` tal cual. La curva
  con marcas, los canales y las páginas más vistas son de la lane 11.
- **Origen, Qué hace la gente y Links para compartir** muestran la guía de su
  pantalla con el encabezado del módulo, como las pestañas de Contenido: un
  `guias-de-metricas.ts` y un `GuiaDeMetricas.tsx` en `admin/por-hacer/`,
  hermanos de los de Contenido. Cada guía lista los bloques de su pantalla
  (SPEC padre §5.7) con un ancla, como la de Mi cuenta:
  - Origen: Países (Chile, México y Argentina arriba) · Regiones · De dónde
    llegan · Dispositivo, sistema y navegador · Página por país · Mejor hora
    para publicar.
  - Qué hace la gente: Materiales más consultados · El camino del CV ·
    Contactos enviados.
  - Links para compartir: Crear un link · Tus links (clics, visitas y CV que
    trajo) · El link corto en el sitio (`/l/[codigo]`).
- **La entrada `metricas` sale de `guias.ts`**: el módulo ya existe (SPEC
  padre §9, «cada módulo borra su guía»).
- **El Inicio no se toca** (DECISIONS del padre): sigue mostrando
  `PanelMetricas` hasta que la lane 3 lo rehaga. El panel cambia por dentro
  (lee la última corrida de la tabla común) y por fuera se ve igual.
- Un `error.tsx` en `metricas/`, como el de Contenido.

## 4. Búsquedas — `/admin/metricas/busquedas` (D A E)

Qué buscó la gente en Google para llegar al sitio. Lee solo de la base.

### 4.1. Qué muestra, con datos

- **El período:** los últimos **28 días con datos** (cuatro semanas enteras,
  así los días de la semana se compensan), que terminan en el último día
  copiado. La cabecera lo dice: «Del 26 de agosto al 22 de septiembre».
- **El aviso de atraso, siempre**, en cualquier estado: «Google manda los
  datos con 2 o 3 días de atraso» (y los días son los de Google, en hora del
  Pacífico).
- **Tres tarjetas** (`admin/metricas/Tarjeta`): Clics e Impresiones, cada una
  contra los 28 días anteriores; y Posición promedio, sin variación (un
  porcentaje de posición se lee al revés).
- **Casi nos encuentran:** hasta 10 búsquedas que cumplen una de dos reglas,
  cada una con su motivo en llano:
  - aparece entre los puestos 8 y 20 («Aparece en el puesto 12: un empujón y
    entra a la primera página»);
  - o muchas impresiones y pocos clics: 50 o más impresiones y menos del 2 %
    de clics («Se vio 340 veces y la tocaron 2: el título o la descripción no
    convencen»).
  - Con menos de 10 impresiones no entra a ninguna regla: es ruido.
- **Tres listas** con el patrón Lista (hasta 10 filas cada una, por clics y
  después por impresiones): **Búsquedas** (lo que escribió la gente),
  **Páginas** (la ruta, sin el dominio) y **Países** (el nombre en español).
  Cada fila: lo principal y una línea «12 clics · 340 impresiones · puesto
  9,4».
- **Google oculta las búsquedas poco frecuentes** para cuidar la privacidad:
  la lista de Búsquedas lo dice, porque su suma puede ser menor que el total.
- **Actualizar ahora** (el mismo componente del Resumen, con su propia
  acción): pide otra vez los últimos 5 días, con el mismo freno de 10 minutos.
- **Sin gráficos:** números y listas. Nada que pueda leerse mal con poco
  tráfico.

### 4.2. Estados

| Estado | Quién | Qué se ve |
| --- | --- | --- |
| Sin conectar (faltan las variables) | quien puede `configurarConexiones` (hoy `administra`) | «Conectá Search Console»: el estado vacío con los pasos, cada uno diciendo quién lo hace (§6.3) |
| Sin conectar | quien edita | «Todavía no está conectado»: «Quien administra el sitio lo conecta desde acá. Mientras, el Resumen muestra las visitas.» |
| Conectado, sin días copiados | todos | «Los datos llegan con la primera copia»: la próxima corrida, o «Actualizar ahora» |
| Con días, sin impresiones en el período | todos | «Todavía no aparecemos en Google en estos 28 días» |
| Una lista sin filas | todos | el estado vacío de esa lista, nunca una lista vacía muda |
| La última corrida falló | todos | el Aviso de error con el motivo en llano, arriba, sin esconder lo que ya hay |

### 4.3. La capacidad nueva

`packages/auth/src/permisos.ts` suma **`PUEDE.configurarConexiones`**, hoy solo
`administra`; la lane 3 la extiende a `dirige`. Es el único cambio en
`packages/auth/`.

## 5. Un solo cron diario con un registro de tareas

- **`/api/cron/diario`** con el mismo chequeo de `CRON_SECRET` que hoy: sin el
  secreto, 401 y no se toca nada. `/api/cron/metricas` se borra y
  `vercel.json` queda con un solo cron, `/api/cron/diario` a las 4 UTC.
- **El registro y el corredor, en `lib/tareas/`, sin nada de ED:** una
  `Tarea` es `{ clave, nombre, correr(): Promise<{ ok, detalle }> }`; el
  corredor corre todas **a la vez y aisladas** —una que tira o que no termina
  a tiempo (50 s) queda como fallida y las otras siguen— y le pasa cada
  corrida a un `registrar` que recibe de afuera. Rechaza dos tareas con la
  misma clave.
- **Las tareas, en `datos/tareas/`:** la copia de Vercel Analytics
  (`metricas-de-vercel`) y la de Search Console (`busquedas-de-google`). El
  registro de ED es la lista de esas dos, y `registrar` escribe en la tabla
  común. Cada módulo que después necesite algo programado (chequeo de links,
  retención, resumen semanal) suma una tarea a esa lista, no un cron.
- **La copia de Vercel se muda:** `datos/acciones/sincronizar-metricas.ts` (que
  no es una Server Action) pasa a `datos/tareas/metricas-de-vercel.ts` y deja
  de registrarse sola; la registra quien la corre. Su comportamiento no
  cambia: mismo rango, misma marca de agua, mismo detalle, al que se suma el
  rango de días.
- **«Actualizar ahora» sigue andando, uno por pantalla:** las dos acciones
  (`actualizar-metricas.ts` y una nueva `actualizar-busquedas.ts`) empiezan
  por `auth.api.getSession` y llaman a un solo ayudante de `datos/tareas/` que
  aplica el freno de 10 minutos leyendo la última corrida **de esa tarea** en
  la tabla común, corre la tarea y la registra. Un botón no frena al otro.
- `revalidatePath` de `/admin` y `/admin/metricas` en el de Vercel; de
  `/admin/metricas/busquedas` en el de Google.

## 6. La copia diaria de Search Console

### 6.1. El cliente, en `lib/busquedas/`, sin nada de ED

- **La cuenta de servicio, sin dependencias.** Un JWT RS256 firmado con
  `node:crypto` (encabezado `{"alg":"RS256","typ":"JWT"}`; `iss` = el correo
  de la cuenta; `scope` = `https://www.googleapis.com/auth/webmasters.readonly`;
  `aud` = `https://oauth2.googleapis.com/token`; `iat` y `exp` a una hora),
  canjeado por un `access_token` con un POST
  `application/x-www-form-urlencoded` a `https://oauth2.googleapis.com/token`
  (`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`, `assertion`).
  Verificado contra la documentación oficial de Google el 2026-09-26
  («Using OAuth 2.0 for Server to Server Applications»).
- **La consulta:** `POST
  https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`
  con `startDate`, `endDate`, `dimensions: ["date", <dimensión>]`,
  `type: "web"`, `dataState: "final"`, `rowLimit: 25000` y `startRow`,
  paginando mientras llegue una página llena. La respuesta trae `rows[]` con
  `keys`, `clicks`, `impressions`, `ctr` y `position`. El `siteUrl` va
  codificado (`sc-domain:…` o `https://…/`). Verificado contra la referencia
  de `searchanalytics.query` el mismo día.
- **Cuatro dimensiones:** `total` (solo `date`), `consulta` (`query`),
  `pagina` (`page`) y `pais` (`country`, ISO 3166-1 alfa-3 en minúscula).
- **Errores en llano**, como el de Vercel: un 403 dice que la cuenta de
  servicio no es usuaria de la propiedad y dónde agregarla; un `invalid_grant`,
  que la clave no sirve; un 429, que hay que esperar; una clave que no se
  puede leer, qué variable revisar. Cada pedido con un tiempo máximo.
- **Probado sin credenciales reales:** respuestas grabadas con la forma de la
  documentación (`__fixtures__`) y una clave RSA generada en el test para
  firmar y verificar el JWT.

### 6.2. La sincronización, en `datos/tareas/busquedas-de-google.ts`

- **Qué días:** del siguiente al último guardado hasta ayer; la primera vez,
  los últimos **90 días** (Google guarda 16 meses; 90 alcanza para el período
  y su anterior). Nunca más de 90 por corrida. Los días que Google todavía no
  cerró no vuelven (`dataState: "final"`) y se piden otra vez en la corrida
  siguiente.
- **Idempotente:** cada fila es un upsert por su clave.
- **`total` va último**, como en la copia de Vercel: es la marca de agua, y
  si una dimensión falla la marca no avanza sin que el rango haya entrado
  entero.
- **La posición se guarda re-promediable:** Google la da como el promedio,
  por impresión, del puesto más alto del sitio. Se guarda
  `sumaDePosiciones = position × impressions`, y cualquier agregado se lee como
  `Σ sumaDePosiciones / Σ impresiones`: nunca un promedio de promedios.
- Sin las variables, la tarea devuelve `ok: false` con «Search Console no está
  conectado: faltan las variables (README)» y no toca la API.

### 6.3. Las variables y lo que hace ED

Solo del servidor, nunca `NEXT_PUBLIC_`, con placeholder en
`apps/sitio/.env.example` y explicadas en el README:

| Variable | Qué es |
| --- | --- |
| `SEARCH_CONSOLE_CLIENT_EMAIL` | el `client_email` del JSON de la cuenta de servicio |
| `SEARCH_CONSOLE_PRIVATE_KEY` | el `private_key` de ese JSON (acepta los `\n` escritos) |
| `SEARCH_CONSOLE_SITE_URL` | la propiedad: `sc-domain:empoderamientodocente.org` o `https://empoderamientodocente.org/` |

Los pasos, en el README y en «Conectá Search Console», cada uno con quién lo
hace:

1. **ED:** verificar el dominio en Search Console con su cuenta de Google (un
   registro TXT en el DNS).
2. **Desarrollo:** crear un proyecto en Google Cloud, habilitar la «Google
   Search Console API», crear una cuenta de servicio y bajar su clave JSON.
3. **ED:** en Search Console › Configuración › Usuarios y permisos, agregar el
   correo de la cuenta de servicio como usuario con permiso **Restringido**
   (solo lectura).
4. **Desarrollo:** cargar las tres variables en Vercel (Production).

## 7. Tablas y migración

Una migración, `busquedas_y_tareas`, generada por Prisma sobre la base
`ed_busquedas`. Los modelos van en `prisma/schema/tareas.prisma` y
`prisma/schema/busquedas.prisma`; `metricas.prisma` pierde
`SincronizacionMetricas`.

**`corridas_de_tareas`** (modelo `CorridaDeTarea`), la tabla común que
Ajustes › Conexiones va a leer:

| Columna | Tipo | |
| --- | --- | --- |
| `id` | `SERIAL` | clave |
| `tarea` | `TEXT` | la clave de la tarea: `metricas-de-vercel`, `busquedas-de-google` |
| `corridaEn` | `TIMESTAMP(3)` | cuándo, `DEFAULT CURRENT_TIMESTAMP` |
| `ok` | `BOOLEAN` | |
| `detalle` | `TEXT` | qué pasó, en llano: «Del 2026-09-20 al 2026-09-22: 3 días, 187 filas» o el error |

Con un índice en `(tarea, corridaEn)` para «la última corrida de esta tarea».

**`busquedas_diarias`** (modelo `BusquedaDiaria`):

| Columna | Tipo | |
| --- | --- | --- |
| `fecha` | `DATE` | el día de Google (hora del Pacífico) |
| `dimension` | `TEXT` | `total` · `consulta` · `pagina` · `pais` |
| `valor` | `TEXT` | `""` en el total · lo que se buscó · la URL · el país (alfa-3) |
| `clics` | `INTEGER` | |
| `impresiones` | `INTEGER` | |
| `sumaDePosiciones` | `DOUBLE PRECISION` | `position × impressions` (§6.2) |

Clave `(fecha, dimension, valor)`.

**El historial de `metricas_sincronizaciones` pasa a la tabla común en la
misma migración, y nada se pierde:** cada fila entra como una corrida de
`metricas-de-vercel` con su `corridaEn`, su `ok` y su `detalle`, y su rango
(`desde`, `hasta`) se suma al final del detalle —«(del 2026-09-20 al
2026-09-22)»—, porque la tabla común no tiene columnas de rango. Recién
después se borra `metricas_sincronizaciones`. Ver §9.1.

## 8. Docs

- **ADR-0011** (el 0010 lo toma `seguridad-del-acceso`, en vuelo; si al
  rebasear otro tomó el 0011, pasa al siguiente libre): «Search Console con
  copia diaria y un solo cron con registro de tareas», con las alternativas
  (`googleapis` o `google-auth-library`, OAuth de una persona con refresh
  token, un cron por tarea, leer la API en el render). Y su fila en
  `docs/architecture/adrs/README.md`.
- **README:** las tres variables, los cuatro pasos y «Las métricas» con el
  cron diario y sus tareas.
- **DESIGN.md §11:** Pestañas (la que es la puerta del módulo se enciende solo
  en su ruta exacta) y Estado vacío (puede llevar pasos). Van nombrados acá
  porque AGENTS.md §5.6 pide confirmación para tocar DESIGN.md; los revisa
  Mateo en el PR (DECISIONS del padre).
- **AGENTS.md §12**, una sola línea, precisada y no borrada (el padre, §9.1):
  una migración aplicada no se edita nunca; una nueva se puede completar con
  SQL de datos antes de su primera aplicación (`--create-only`).

## 9. Lecturas que el brief no cerraba

1. **La migración lleva SQL que Prisma no escribe.** Mover el historial pide
   un `INSERT … SELECT` antes del `DROP`, y Prisma no genera movimientos de
   datos. La forma que documenta Prisma es `prisma migrate dev --create-only`
   (la guarda lo deja pasar), sumar el SQL al archivo generado **antes de
   aplicarlo por primera vez**, y recién ahí `pnpm migrate`. Choca con la
   letra de AGENTS.md §12 («nunca se editan a mano»), cuyo propósito es que
   ninguna migración aplicada cambie y que el esquema no se desfase: esto no
   toca una migración aplicada, y `migrate dev` verifica después que el
   esquema y la base coinciden. La alternativa es perder el historial (Prisma
   lo borra con la tabla) o moverlo con un script aparte, que es justo lo que
   el brief pidió evitar. **Regla del padre: esta vía (opción A)**, con la
   línea de AGENTS.md §12 precisada en el mismo PR (DECISIONS.md).
2. **El rango al detalle.** `desde` y `hasta` hoy nadie los lee (el panel usa
   `corridaEn`, `ok` y `detalle`); van al texto en vez de a columnas que las
   tareas sin rango (chequeo de links, retención) no usarían.
3. **«Por página y por país» son tres listas** (Búsquedas, Páginas, Países),
   como las pestañas del informe de Google; no el cruce búsqueda × página.
4. **Un período fijo de 28 días** con la comparación en clics e impresiones.
   El selector de 7, 30 y 90 días es del Resumen de la lane 11; si llega,
   Búsquedas lo adopta.
5. **Los umbrales de «Casi nos encuentran»** (puestos 8 a 20; 50 impresiones y
   menos del 2 % de clics; mínimo 10 impresiones) son constantes con nombre,
   en un solo lugar, para ajustarlas cuando haya datos reales.
6. **Pestañas se extiende en su archivo:** Resumen es `/admin/metricas`, que
   es prefijo de las otras cuatro, así que con la regla de hoy quedaría
   encendida siempre. ~~Una pestaña puede pedir `exacta`.~~ **Regla del padre
   (DECISIONS.md): gana la pestaña más específica**, la de prefijo más largo
   cortando en segmento, sin prop nueva. Va a §11.
7. **Estado vacío se extiende en su archivo:** puede llevar pasos debajo del
   texto (una lista ordenada en meta), para «Conectá Search Console». Va a
   §11.
8. **`ActualizarAhora` recibe su acción por prop** (una Server Action pasada
   desde el servidor), para servir al Resumen y a Búsquedas sin duplicarse.
9. **Los nombres de los países** salen de `Intl.DisplayNames` en español, que
   pide el código alfa-2: una tabla alfa-3 → alfa-2 generada de los datos de
   CLDR, en `lib/busquedas/`. `zzz` (sin país) se lee «Sin identificar».
10. **Las dos tareas corren a la vez**, con 50 s cada una dentro de los 60 de
    la función: una que se cuelga queda registrada como fallida y no se lleva
    a la otra.
11. **La copia de Vercel se muda de carpeta** (`datos/acciones/` →
    `datos/tareas/`) con su test: `datos/acciones/` es de las Server Actions
    (AGENTS.md §12) y esa copia nunca lo fue.

## 10. No es de esta lane

Origen, Qué hace la gente, Links para compartir y el resumen semanal (lane
11); la pantalla de Conexiones (lane 10); el Inicio y su pendiente «Conectá
Search Console» (lane 3); la indexación por URL de Ajustes › SEO (lane 10).
Tampoco se tocan `packages/auth/` (salvo la capacidad), `middleware.ts`,
`proxy.ts`, `datos/auth.ts`, `prisma/schema/auth.prisma`, los `Formulario*.tsx`
de acceso, `admin/paginas/`, `admin/campos/`, `contenido/`, `features/`,
`lib/contenido/`, `datos/**/paginas*`, `prisma/schema/paginas.prisma` ni
`scripts/comparar-render.mjs`.

## 11. Criterio de cierre

- Las cinco rutas de Métricas responden con sesión, con sus pestañas y la
  activa correcta; Búsquedas en sus seis estados (§4.2), con datos sembrados
  en la base de la lane, en los tres temas, a 390 de ancho y con teclado.
- `/api/cron/diario`: 401 sin el secreto; con el secreto, una fila por tarea
  en `corridas_de_tareas`, también cuando una falla.
- La migración aplicada sobre una base con filas en
  `metricas_sincronizaciones` deja las mismas filas en `corridas_de_tareas`.
- Los dos «Actualizar ahora» andan y se frenan cada uno por su tarea.
- El gate: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100), `pnpm test` y
  `pnpm build`, con la salida en PROGRESS.
