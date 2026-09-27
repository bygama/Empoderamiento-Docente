# El admin a medida — diseño

- **Fecha:** 2026-09-18
- **Estado:** aprobado por el owner; en ejecución por fases
- **Decide:** Mateo
- **Reemplaza:** `2026-09-15-panel-admin-diseno.md` (el panel con Payload)
- **Registra:** [ADR-0005](../adrs/0005-admin-a-medida.md) ·
  [ADR-0006](../adrs/0006-packages-reutilizables.md) ·
  [ADR-0007](../adrs/0007-prisma-como-orm.md) ·
  [ADR-0010](../adrs/0010-seguridad-del-acceso.md) (§7, desde el 2026-09-26)

---

## 1. Qué se quiere

Un admin para que ED cambie el contenido del sitio sin tocar código, **hecho a
medida**, de modo que el kit que salga sirva también en proyectos futuros.

Lo usan tres personas: una que administra y dos que editan. No hay paso de
aprobación: quien edita, publica.

**Regla de alcance: se edita todo menos la estructura.** Las escenas animadas
están armadas para una cantidad exacta de piezas y para textos calibrados a
mano. Esa estructura no se toca desde el admin: la cantidad de piezas es fija y
cada texto tiene un largo máximo. Lo que va adentro se edita libremente.

## 2. El stack

Se conserva la infraestructura del ADR-0003 que no estaba en discusión:
**Neon** (Postgres), **Vercel Blob** (fotos), **Resend** (correos). Cambia la
capa de arriba.

| Capa | Qué | Por qué |
| --- | --- | --- |
| ORM | **Prisma `7.10.0` exacta** con `@prisma/adapter-pg` | migraciones maduras; `latest` resuelve hoy a un RC (ADR-0007). El adaptador **no** es el de Neon: su driver habla por WebSocket y no llega a un Postgres común (ADR-0008) |
| Sesión | **better-auth** + `prismaAdapter` | autohospedado en la misma base, sin proveedor nuevo |
| Mutaciones | **Server Actions + Zod** | libera el namespace `/api` para los formularios públicos. **Excepción: los formularios de acceso van por HTTP a `/api/auth`** — el rate limit vive en ese handler y una Server Action lo saltearía |
| Fotos | `@vercel/blob` + `sharp` | SDK directo, sin adaptador |
| Correos | `resend` | SDK directo, sin adaptador |

**Dos reglas que el diseño lleva adentro:**

- **Sin meta-capa de configuración.** Nada de un objeto que un renderizador
  genérico traduce a formulario: ese es el modelo de Payload, de Strapi y del
  admin de Django, y es cómo se termina reescribiendo Payload. Cada entidad
  escribe su formulario con los primitivos del kit.
- **Sin el vocabulario de Payload.** No hay «colecciones», «globals» ni
  `CollectionConfig`. Es Postgres relacional: hay tablas, columnas y controles.

## 3. Cómo queda el repo

Un solo deployable, y `packages/` desde ahora (ADR-0006):

```
packages/                     LO REUSABLE — cero dominio de ED adentro
├── db/                       cliente Prisma + Neon, slugs, redirecciones
├── auth/                     better-auth configurado, permisos, guarda
└── kit-admin/                los controles de un formulario, el botón, el aviso

apps/sitio/
├── prisma/schema/            base · auth · contenido · sitio
├── prisma/migrations/        generadas, commiteadas, nunca a mano
└── src/
    ├── app/(sitio)/          el sitio público
    ├── app/(admin)/          SOLO rutas; la lógica va en src/admin/
    ├── app/api/              LIBRE: contacto/ cv/
    ├── datos/                consultas/ (lee el sitio) · acciones/ (escribe el admin)
    ├── admin/                una carpeta por entidad + armazon/
    ├── features/             el sitio, sin cambios de contrato
    └── proxy.ts              sesión · cabeceras (el middleware.ts de antes de Next 16)
```

**Las cuatro fronteras** — son el criterio de review, no una sugerencia:

1. **`packages/` no sabe nada de ED.** Si aparece «novedad» en `kit-admin`,
   está mal puesto. Es el test de si el package sirve en otro proyecto.
2. **`datos/` es la única puerta a la base.** Ningún componente importa Prisma.
3. **`app/` son rutas y nada más** — la regla que el repo ya tiene para el
   sitio, aplicada igual al admin.
4. **`features/` no se entera.** Los componentes reciben props; cambia quién se
   las pasa, nunca su contrato. Por eso los `data.ts` se borran de a uno,
   cuando le toca a su sección, y nunca hay dos fuentes de verdad.

**El kit, tal como quedó** (2026-09-26, `work/novedades-y-kit/`,
[ADR-0014](../adrs/0014-kit-admin-y-modelo-de-entidad.md)): los controles
que eran de `admin/campos/` —`TextoCorto`, `Parrafo`, `Seleccion`,
`CampoFoto`, `ListaFija`— más `Casilla`, `Fecha` y `ListaVariable`, que
nacieron con Novedades, y `Boton`, `claseDeBoton` y `Aviso`, porque
`CampoFoto` los usa. Los tokens son de la app: su `README.md` dice cuáles
espera. El generador de formularios de las páginas (`admin/campos/Campo.tsx`)
y `admin/armazon/` se quedan en la app; el armazón se muda al kit en un
cambio mecánico aparte. La tabla vive con la de permisos de Cuentas hasta que
la use una segunda pantalla (DESIGN.md §11, «Tabla»).

## 4. Cómo lee el sitio

Las páginas siguen siendo **estáticas**. En el build leen por `datos/consultas/`
con Prisma, **directo, sin HTTP**. Al publicar, un hook regenera solo las rutas
afectadas con `revalidatePath`. Que sea un solo deployable es lo que permite
esto; partirlo en dos apps obligaría a una API entre las dos.

## 5. El mapa de URLs

```
/                                      /admin                (entrar)
/que-hacemos                           /admin/novedades/[id]
/quienes-somos                         /admin/biblioteca/[id]
/quienes-somos/equipo/<persona>   <-   /admin/casos/[id]
/investigacion                         /admin/equipo/[id]
/investigacion/casos/<caso>       <-   /admin/aliados/[id]
/biblioteca                            /admin/fotos
/biblioteca/<tipo>                <-   /admin/paginas/[pagina]
/novedades                             /admin/ajustes
/novedades/<novedad>                   /admin/cuentas/[id]
/contacto                               /api/contacto · /api/cv
/sumate-al-equipo  (apagada)           /admin/mensajes/cv/[id]/archivo
/sitemap.xml                      <-   /vista-previa · /vista-previa/salir
/robots.txt
```

`/api/contacto` y `/api/cv` reciben los formularios públicos desde el
2026-09-26 (`work/mensajes/`, [ADR-0012](../adrs/0012-mensajes-cv-privados-y-retencion.md)).
`/sumate-al-equipo`, el formulario de CV, da 404 hasta `CV_ABIERTO=si`, y
mientras tanto no va al sitemap.

`<-` = ruta nueva. Son **26**: 15 perfiles, 4 casos, 7 landings de tipo.

**Tres decisiones:**

- **Los 63 materiales no llevan ficha propia.** Cada uno ya tiene su URL
  canónica en la revista o editorial que lo publicó. Una ficha nuestra sería
  contenido delgado y duplicado. Los 4 casos y los 15 perfiles sí la llevan:
  son originales de ED y no existen en ningún otro lado.
- **Los filtros de biblioteca se parten en dos niveles.** El tipo va en el path
  (`/biblioteca/libros`), porque es una lista cerrada de siete y merece
  rankear; `tema`, `publico` y `anio` van en query, con canonical al path.
- **Nada anida más de tres niveles**, y las rutas intermedias no dan 404 cuando
  alguien trunca la URL: `/investigacion/casos` → `/investigacion#casos` (308).

**Dos reglas de slug que son arquitectura, no estilo:**

- **El slug es una columna, no se deriva del título.** Corregir un título no
  mueve una URL.
- **Tabla de redirecciones.** Si un slug cambia, el admin escribe el 308 del
  viejo al nuevo. Sin eso, cada cambio es un link muerto. Ajustes › SEO suma
  las que se agregan a mano (`a_mano`), validadas: «hacia» es una ruta del
  sitemap y «desde» no, así no hay cadenas ni ciclos. El sitio las sigue en la
  ruta atrapa-todo, antes del 404 (`work/ajustes/`).

## 6. Modelo de contenido

Siete entidades, más las páginas y los ajustes:

| Tabla | Qué guarda | Origen hoy |
| --- | --- | --- |
| `fotos` | imagen, alt obligatorio, punto focal | `public/**` |
| `novedades` | slug, fecha, categoría, título, bajada, imagen, destacada, cuerpo, publicación, imagen para redes | la migración `novedades` (era `features/novedades/data/novedades.ts`, borrado) |
| `materiales` | título, autores, tipo, tema, público, año, formato, portada, URL | `features/biblioteca/data/materiales.ts` |
| `casos` | número, pregunta, eje, indicio, ficha, contexto, evidencias, análisis | `features/investigacion/data/casos.ts` |
| `equipo` | perfil: nombre, rol, lugar, etapas con hitos y publicaciones | `features/quienes-somos/data/equipo.ts` |
| `aliados` | nombre, logo, URL, **autorizado** (sin marcar no se publica: §5.4) | `config/aliados.ts` |
| `cuentas` | mail, nombre, rol | no existe |
| `paginas` | una fila por página, con su pestaña de SEO | los componentes y sus `data.ts` |
| `versiones_de_paginas` | cada publicación de una página: el documento, quién y cuándo; las últimas 10 | no existe |
| `datos_del_sitio` | una fila: correo, WhatsApp, dirección, países, redes | `config/site.ts` (la migración la cargó con lo de ahí) |
| `plazos_de_retencion` | cada plazo de retención con desde cuándo rige: una fila por cambio | `config/privacidad.ts` |
| `indexacion_de_urls` | si cada ruta del sitemap está en Google, según Search Console | no existe |

**Ajustes** (`work/ajustes/`, [ADR-0015](../adrs/0015-ajustes-en-la-base.md))
no es una tabla genérica de claves: cada cosa que se configura tiene la suya,
con sus columnas. Los plazos guardan historial porque son una promesa: a lo
que llegó se le aplica **el menor entre el plazo de cuando llegó y cualquiera
posterior** —alargar no toca lo ya recibido, acortar vale para todo—. Las
**personas de referencia** (la fundadora y la referente) no se mudaron: nada
del sitio las leía. Vuelven con la fase 4, en el JSON-LD de la organización.

**Estructura fija, en el modelo.** Las listas coreografiadas llevan cantidad
exacta; los textos, `maxLength` con contador y un aviso que explica el límite
(«un renglón en pantalla»). El límite sale del contenido actual o de la
calibración existente. Las opciones de cada `select` son cerradas: agregar una
es un cambio de código, porque el diseño las conoce.

**Regla de inventario:** todo texto o imagen visible que hoy está en un
componente o en un `data.ts` pasa a una columna con el mismo nombre en español.
No se crean columnas que no existan hoy.

**Las páginas son la excepción, y solo ellas** (2026-09-21,
`work/edicion-de-paginas/`): cada página es una fila con dos documentos JSON,
el publicado y el borrador, y cada sección del documento se valida con su
esquema Zod al guardar y otra vez al publicar. Sus textos no pasan a columnas
sino a campos del esquema, con el mismo nombre en español. Las entidades
(novedades, materiales, casos, equipo, aliados) siguen con una
columna por texto.

**Versiones de las páginas** (2026-09-26, `work/paginas-inicio/`): cada
publicación guarda el documento que dejó, con quién y cuándo, en
`versiones_de_paginas`, en la misma transacción que publica; quedan las
últimas 10 por página. «Restaurar como borrador» vuelve a poner una versión
en el borrador, validada contra los esquemas de hoy, y dice qué no entró; no
publica. Antes de publicar, «Qué cambió» compara el borrador con lo publicado
campo por campo. El SEO de cada página vive en el mismo documento, bajo la
clave `seo`, así tiene borrador, versiones y «qué cambió» como las secciones.
Toda escritura del borrador trae lo que vio la pantalla y, si otra persona
guardó mientras tanto, no pisa: avisa y ofrece recargar.

**Las entidades: lo publicado en columnas, el borrador en un documento**
(2026-09-26, `work/novedades-y-kit/`,
[ADR-0014](../adrs/0014-kit-admin-y-modelo-de-entidad.md)). Cada fila tiene
lo publicado en sus columnas —lo que lee el sitio, y sobre lo que la base
garantiza la URL única y, en `novedades`, la destacada única con un índice
parcial— y el borrador en un `jsonb` que puede estar incompleto. Dos esquemas
Zod con los mismos campos: uno para publicar (completo, y otra vez al leer) y
uno para guardar (todo puede estar vacío). Las acciones son seis: crear (el
primer guardado), guardar borrador, publicar, despublicar (conserva las
columnas), descartar cambios y borrar. Publicar con otra URL deja el 308 de
la vieja en `redirecciones`, sin cadenas, y el sitio lo lee antes del 404.
Novedades es la primera; materiales, casos, equipo y aliados copian el molde
con sus columnas.

## 7. Acceso y seguridad

**Tres roles, fijos:** `dirige` (todo, incluidas las cuentas y los CV; es una
sola persona, la única que pasa la dirección a otra, y su cuenta no la toca
nadie más), `administra` (todo lo de quien dirige, menos tocar esa cuenta o
pasarse la dirección) y `edita` (edita y publica el contenido, las novedades y
la Biblioteca, contesta los contactos y ve las métricas; no ve CV, Cuentas ni
Ajustes). Todos publican. La tabla, capacidad por capacidad, vive en
`packages/auth/src/permisos.ts`, el único archivo que compara contra el string
de un rol: el resto pregunta `puede(rol, "usarCuentas")`. Que dirige sea una
sola lo garantiza la base, con el índice único parcial `user_una_sola_dirige`.
La primera se nombra con `crear-cuenta … dirige`, o con `nombrar-direccion` si
ya tiene cuenta (README). No hay registro público.

**Lo que un rol no usa no aparece**, y el servidor lo verifica igual: la
sidebar muestra los módulos de sus capacidades; cada módulo pasa por su guarda
(`admin/armazon/Guarda.tsx`), que a quien entra por URL le muestra «Esta
sección es de quien dirige o administra»; y cada Server Action chequea su
capacidad después de la sesión. `guarda.test.ts` y
`acciones-con-sesion.test.ts` fallan si un módulo o una acción se olvida.

**La actividad** (tabla `actividad`: quién, qué, sobre qué, cuándo) se anota
desde `datos/actividad.ts`, con una lista cerrada de tipos; se guarda 12 meses
y de un CV registra solo que se borró. Entrar, salir y cambiar la contraseña
los anotan los ganchos de `@ed/auth`. «Olvidé mi contraseña» manda un correo por
Resend, en segundo plano, y elegir una contraseña nueva avisa con otro («Tu
contraseña cambió»); sin `RESEND_API_KEY`, en local salen por la consola y en
producción no salen, sin loguear nunca el enlace.

**Las cuentas se manejan desde Cuentas**, que usan dirige y administra
(`work/cuentas/`): se invita con correo, nombre y rol (administra o edita;
dirige no se invita, se pasa), y llega «Elegí tu contraseña» con un enlace
que vence a las 72 h. Una cuenta se **suspende en vez de borrarse**: ya no
abre sesión (lo mira `@ed/auth` donde nace toda sesión) y su nombre queda en
la historia; se borra solo si nunca hizo nada, y eso lo decide la clave
foránea de `actividad`. Qué puede hacer cada rol sobre cada cuenta vive en un
solo lugar, `packages/auth/src/cuentas.ts` (`queSePuede`): la cuenta de quien
dirige no la suspende, borra ni degrada nadie, quien administra no la toca, y
sobre la propia solo se cambia el correo. Pasar la dirección pide otra vez la
contraseña, que cuenta en el bloqueo por cuenta.

**El segundo factor es un código de 6 dígitos por correo**, obligatorio para
dirige y administra y opcional para edita (Mi cuenta › Seguridad). Lo
garantiza la base (el CHECK `user_segundo_factor_obligatorio`); quien pasa a
uno de esos roles sin él lo recibe prendido y pierde sus sesiones, que se
abrieron sin código. El código vence a los 10 minutos, se guarda hasheado y
admite 5 intentos; «Recordar este dispositivo» dura 30 días. Si el correo no
sale, la pantalla del código lo dice en vez de fingir: desde esta fase, entrar
con esos roles depende de Resend.

Todo lo de esta sección que cambió el 2026-09-26 está decidido en el
[ADR-0010](../adrs/0010-seguridad-del-acceso.md) y, el segundo factor, en el
[ADR-0013](../adrs/0013-segundo-factor-por-correo.md).

Lo que cierra respecto del estado anterior:

| Hallazgo | Cómo queda |
| --- | --- |
| Cero cabeceras de seguridad | `proxy.ts`: CSP, HSTS, `frame-ancestors` en `none`, `Referrer-Policy`, `Permissions-Policy`. En `/admin`, la CSP lleva **un nonce por respuesta con `'strict-dynamic'`** (sin `'unsafe-inline'` en los scripts; `'unsafe-eval'` solo en desarrollo), y además COOP y CORP `same-origin` y `X-Frame-Options: DENY`. El sitio público sigue con `'unsafe-inline'`: es estático a propósito |
| `GET /api/fotos` público y enumerable | desaparece: sin REST autogenerada no hay qué enumerar |
| `/api` tomado por un catch-all | liberado para `/api/contacto` y `/api/cv` |
| El secreto de la vista previa en el query string (queda en logs y en el `Referer`) | el Draft Mode de Next: la cookie la pone una Server Action con sesión, `httpOnly` y `secure`, y **vence en una hora**, con `SameSite=Lax` (se reescribe después de `enable()`). No es de un solo uso (vale lo mismo para todos hasta el próximo deploy), así que también se apaga con «Volver al sitio publicado» y al salir del admin |
| Rate limit solo por cuenta | **por IP**, en la tabla `rateLimit` (una cuenta para todas las instancias): 3 intentos por minuto en sign-in. Y **por cuenta**: 5 fallos en 15 minutos frenan la cuenta 15 minutos, el doble cada vez hasta 1 hora, con el mismo 429 |
| `/admin` dependía de `robots.txt` | `X-Robots-Tag: noindex` real en la respuesta |

Y lo que trae la capa nueva: **Argon2id** para el hasheo (19 MiB, t=2, p=1; los
hashes scrypt de antes se reemplazan solos al entrar), tokens de reset de un
solo uso, con expiración y **guardados hasheados**, errores genéricos para no
permitir enumerar usuarios, y protección CSRF por validación de origen y por
cookies `SameSite=Strict`.

**La sesión dura 12 horas sin uso** y se renueva cada hora de uso; las rutas
que better-auth marca como frescas piden haber entrado hace menos de 10
minutos (`freshAge`). Elegir una contraseña nueva cierra todas las sesiones de
la cuenta, y cambiarla desde Mi cuenta (pidiendo la actual, 5 intentos cada 5
minutos) cierra las demás y manda el mismo aviso. Cada sesión guarda la ciudad
y el país de las cabeceras de Vercel, para reconocerla en Mi cuenta.

**La sesión se corta en el proxy y se verifica en el layout del admin.** El
proxy solo mira que la cookie esté, sin ir a la base; la comprobación de
verdad —firma, expiración, que la sesión exista— la hace el layout de
`(protegido)` antes de renderizar. Ningún componente pregunta por su cuenta.
Como la cookie es `Strict`, un link al admin desde un correo llega sin ella:
el proxy rebota esa navegación (`Sec-Fetch-Site: cross-site`, sin cookie) a la
misma URL con un `<meta http-equiv="refresh">`, y la segunda vuelta ya la
lleva.

**Las Server Actions son la excepción:** el proxy las deja pasar sin
cookie, porque un redirect no es una respuesta válida para una acción, y el
layout no las cubre. Por eso toda acción empieza por `auth.api.getSession` y
contesta en llano si no hay sesión, sigue con `puede(rol, capacidad)`, y
`apps/sitio/src/datos/acciones/acciones-con-sesion.test.ts` falla si una no
empieza por esas dos cosas.

**Lo que cubre cada freno:** el rate limit es por IP, y eso cierra la
enumeración de usuarios; el bloqueo por cuenta cierra el ataque repartido entre
muchas IP contra una sola cuenta. Cuenta también los correos que no existen,
guarda un HMAC del correo y nunca el correo, y se destraba con un reset
completo. Lo que queda abierto, y está escrito en el ADR-0010: quien conozca un
correo puede frenar esa cuenta hasta una hora.

**Lo que llega por los formularios del sitio** (Mensajes,
[ADR-0012](../adrs/0012-mensajes-cv-privados-y-retencion.md)): los dos
validan con Zod en el borde, llevan un campo trampa y un tope por IP en la
base (tabla `limites_por_ip`, la IP como HMAC): 5 contactos o 3 CV por hora.
**El archivo de un CV no tiene URL pública**: va a un store de Blob privado,
otro que el de las fotos, y sale solo por
`/admin/mensajes/cv/[id]/archivo`, que pide sesión y `verCV`. Se borra solo
a los 12 meses (Contacto a los 24, el spam a los 30 días) en el cron diario, y
el correo que avisa de un mensaje nuevo no lleva nada de quien escribió.

**Secretos solo del lado del servidor**: `DATABASE_URL`, el secreto de
better-auth, `BLOB_READ_WRITE_TOKEN`, `CV_BLOB_READ_WRITE_TOKEN` y `RESEND_API_KEY` nunca llevan
`NEXT_PUBLIC_` ni llegan al navegador.

## 8. Migraciones

Las migraciones se generan con Prisma, **se commitean** y se aplican con
`migrate deploy` en el build. Nunca a mano contra la base.

**`scripts/guarda-prisma.mjs` bloquea `prisma db push` con exit 1.** `push`
crea tablas sin generar el archivo de migración, y el síntoma aparece recién en
producción como «la tabla no existe».

## 9. Fases

| | Qué | Sale sola |
| --- | --- | --- |
| **0** | **Escisión.** Payload afuera, repo en verde, sitio idéntico, ADRs y docs al día. | sí, y es reversible |
| **1** | **Cimientos.** `packages/db` + `packages/auth`, middleware (cabeceras, rate limit), login en `/admin`. Sin contenido. | sí |
| **2** | **El kit y una entidad entera.** `packages/kit-admin` + novedades de punta a punta, con el sitio leyéndola por `datos/consultas/`. **Hecha** (2026-09-26). | sí |
| **3** | **El resto del contenido.** Materiales, casos, equipo, aliados, páginas, ajustes. | por entidad |
| **4** | **Las URLs y el SEO.** Las 26 rutas nuevas, canonicals y JSON-LD (con las personas de referencia de la organización). El `sitemap.xml` de las rutas de hoy y las redirecciones ya los hizo Ajustes (`work/ajustes/`): las rutas nuevas se suman a `rutasDelSitio()`. | sí |

**Sección por sección:** cada sección cambia su lectura a `datos/consultas/` en
su propio PR, y en ese mismo PR se borra su `data.ts`. Nunca hay dos fuentes de
verdad a la vez.

**Las páginas se adelantaron** (2026-09-21): la fase A de
`work/edicion-de-paginas/` las hizo antes que el kit y las novedades, con sus
controles en `apps/sitio/src/admin/campos/`. Esos controles reciben
props planas y no conocen el generador de formularios de las páginas
(`Campo.tsx`), así que en la fase 2 se mudan a `packages/kit-admin` y el
generador se queda en la app.

**La fase 2, hecha** (2026-09-26, `work/novedades-y-kit/`): el kit (§3) y
Novedades de punta a punta —la tabla con las nueve de hoy cargadas por la
migración, el módulo en `/admin/novedades` con su lista, su ficha y la vista
previa, y el sitio leyendo de la base en `/novedades`, cada ficha, el Inicio
y `/novedades/rss.xml`—. Los textos de la página Novedades pasaron a sus
secciones, con su pestaña SEO, como las demás páginas.

## 10. Calidad

- Los gates de siempre en cada PR: `pnpm typecheck`, `pnpm lint`, react-doctor
  **100/100** y `pnpm build`. Los `packages/` con React se suman a las dos
  listas del gate (AGENTS.md §5.8).
- Un recorrido de punta a punta: entrar al admin, editar una novedad,
  publicarla y verificar que el sitio la muestra.
- Los estándares de contenido de AGENTS.md §6 valen también para las etiquetas
  y las ayudas del admin: lenguaje inclusivo, nunca «alumnos».

## 11. Fuera de alcance

- **Autoguardado y bloqueo de documento concurrente.** Con tres editoras, el
  aviso de choque alcanza: nadie pisa lo que otra guardó sin verlo. El
  historial de versiones con restaurar, que estaba acá, entró para las
  páginas el 2026-09-26 (§6).
- Editor de texto enriquecido, más de un idioma, comentarios.
- Analíticas: quedaron afuera de este diseño y entran aparte, como módulo que
  no depende del kit, por el [ADR-0009](../adrs/0009-analitica-de-vercel-con-copia-diaria.md)
  y la lane `work/metricas/` (2026-09-21).
- Cambios de diseño del sitio, de geometría o de animaciones.
- Aprobación previa a publicar.
- Fichas propias para los 63 materiales (ver §5).
