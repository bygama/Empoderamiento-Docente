# El admin a medida — diseño

- **Fecha:** 2026-09-18
- **Estado:** aprobado por el owner; en ejecución por fases
- **Decide:** Mateo
- **Reemplaza:** `2026-09-15-panel-admin-diseno.md` (el panel con Payload)
- **Registra:** [ADR-0005](../adrs/0005-admin-a-medida.md) ·
  [ADR-0006](../adrs/0006-packages-reutilizables.md) ·
  [ADR-0007](../adrs/0007-prisma-como-orm.md)

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
└── kit-admin/                tabla, formulario, controles, imágenes, avisos

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
    └── middleware.ts         sesión · cabeceras · rate limit
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
/contacto
/sitemap.xml                      <-   /api/contacto · /api/cv  (reservado)
/robots.txt                            /vista-previa · /vista-previa/salir
```

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
  viejo al nuevo. Sin eso, cada cambio es un link muerto.

## 6. Modelo de contenido

Siete entidades, más las páginas y los ajustes:

| Tabla | Qué guarda | Origen hoy |
| --- | --- | --- |
| `fotos` | imagen, alt obligatorio, punto focal | `public/**` |
| `novedades` | fecha, categoría, título, bajada, imagen, destacada, cuerpo | `features/novedades/data/novedades.ts` |
| `materiales` | título, autores, tipo, tema, público, año, formato, portada, URL | `features/biblioteca/data/materiales.ts` |
| `casos` | número, pregunta, eje, indicio, ficha, contexto, evidencias, análisis | `features/investigacion/data/casos.ts` |
| `equipo` | perfil: nombre, rol, lugar, etapas con hitos y publicaciones | `features/quienes-somos/data/equipo.ts` |
| `aliados` | nombre, logo, URL, **autorizado** (sin marcar no se publica: §5.4) | `config/aliados.ts` |
| `cuentas` | mail, nombre, rol | no existe |
| `paginas` | una fila por página, con su pestaña de SEO | los componentes y sus `data.ts` |
| `ajustes` | contacto, dirección, países, redes, personas de referencia | `config/site.ts` |

**Estructura fija, en el modelo.** Las listas coreografiadas llevan cantidad
exacta; los textos, `maxLength` con contador y un aviso que explica el límite
(«un renglón en pantalla»). El límite sale del contenido actual o de la
calibración existente. Las opciones de cada `select` son cerradas: agregar una
es un cambio de código, porque el diseño las conoce.

**Regla de inventario:** todo texto o imagen visible que hoy está en un
componente o en un `data.ts` pasa a una columna con el mismo nombre en español.
No se crean columnas que no existan hoy.

## 7. Acceso y seguridad

**Dos roles:** `administrador` (todo, incluidas las cuentas) y `editor` (crea,
edita, publica y borra contenido; de las cuentas solo la propia). Los dos
publican. No hay registro público. «Olvidé mi contraseña» manda un correo por
Resend.

Lo que cierra respecto del estado anterior:

| Hallazgo | Cómo queda |
| --- | --- |
| Cero cabeceras de seguridad | `middleware.ts` + `headers()`: CSP, HSTS, `frame-ancestors` en `none` para `/admin`, `Referrer-Policy`, `Permissions-Policy` |
| `GET /api/fotos` público y enumerable | desaparece: sin REST autogenerada no hay qué enumerar |
| `/api` tomado por un catch-all | liberado para `/api/contacto` y `/api/cv` |
| El secreto de la vista previa en el query string (queda en logs y en el `Referer`) | cookie firmada de un solo uso, con expiración |
| Rate limit solo por cuenta | **por IP**, en la config de better-auth: 3 intentos por minuto en sign-in |
| `/admin` dependía de `robots.txt` | `X-Robots-Tag: noindex` real en la respuesta |

Y lo que trae la capa nueva: **scrypt** para el hasheo (el default de
better-auth; Argon2id quedó afuera por pedir una dependencia sin aprobar, ver
[ADR-0008](../adrs/0008-correcciones-de-la-fase-1.md)), tokens de reset de un
solo uso con expiración, errores genéricos para no permitir enumerar usuarios, y
protección CSRF por validación de origen.

**La sesión se corta en el middleware y se verifica en el layout del admin.**
El middleware corre en Edge y no puede consultar la base, así que ahí solo se
mira que la cookie esté; la comprobación de verdad —firma, expiración, que la
sesión exista— la hace el layout de `(protegido)` antes de renderizar. Ningún
componente pregunta por su cuenta.

**Lo que el rate limit NO cubre:** es por IP, y eso cierra la enumeración de
usuarios. Un ataque repartido entre muchas IPs contra una sola cuenta queda
afuera: el bloqueo por cuenta no está en better-auth y sería trabajo propio.

**Secretos solo del lado del servidor**: `DATABASE_URL`, el secreto de
better-auth, `BLOB_READ_WRITE_TOKEN` y `RESEND_API_KEY` nunca llevan
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
| **2** | **El kit y una entidad entera.** `packages/kit-admin` + novedades de punta a punta, con el sitio leyéndola por `datos/consultas/`. | sí |
| **3** | **El resto del contenido.** Materiales, casos, equipo, aliados, páginas, ajustes. | por entidad |
| **4** | **Las URLs y el SEO.** Las 26 rutas nuevas, `sitemap.xml`, canonicals, redirecciones, JSON-LD. | sí |

**Sección por sección:** cada sección cambia su lectura a `datos/consultas/` en
su propio PR, y en ese mismo PR se borra su `data.ts`. Nunca hay dos fuentes de
verdad a la vez.

## 10. Calidad

- Los gates de siempre en cada PR: `pnpm typecheck`, `pnpm lint`, react-doctor
  **100/100** y `pnpm build`. Los `packages/` con React se suman a las dos
  listas del gate (AGENTS.md §5.8).
- Un recorrido de punta a punta: entrar al admin, editar una novedad,
  publicarla y verificar que el sitio la muestra.
- Los estándares de contenido de AGENTS.md §6 valen también para las etiquetas
  y las ayudas del admin: lenguaje inclusivo, nunca «alumnos».

## 11. Fuera de alcance

- **Historial de versiones con restaurar, autoguardado y bloqueo de documento
  concurrente.** Son cerca de un tercio del trabajo y, con tres editoras y los
  backups de Neon, no compran lo que cuestan. Se pueden sumar después.
- Editor de texto enriquecido, más de un idioma, comentarios, analíticas.
- Cambios de diseño del sitio, de geometría o de animaciones.
- Aprobación previa a publicar.
- Fichas propias para los 63 materiales (ver §5).
