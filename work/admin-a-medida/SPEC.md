# SPEC — El admin a medida (Payload se va)

- **Fecha:** 2026-09-18
- **Estado:** pendiente de aprobación del owner
- **Decide:** Mateo (owner), diseñado en conversación
- **Tier:** L · worktree `ED-admin-a-medida`, rama `mateo/admin-a-medida`
- **Reemplaza:** el ADR-0003 (Neon + Payload) y
  `docs/architecture/specs/2026-09-15-panel-admin-diseno.md`

---

## 1. Qué se quiere

**Payload no se usa.** Sale del repo y el admin se construye a medida, de modo
que el kit resultante sirva también en proyectos futuros del owner.

Se conservan las tres piezas de infraestructura que ya estaban decididas y
funcionan: **Neon** (Postgres), **Vercel Blob** (fotos) y **Resend** (correos).
Lo que cambia es la capa de arriba.

## 2. Por qué ahora, y no después

Medido sobre `d452e61`: **fuera de `src/cms/` y `src/app/(payload)/`, un solo
archivo del repo toca Payload** (`app/(sitio)/vista-previa/route.ts`). Los 46
componentes siguen leyendo sus `data.ts`; la capa `src/contenido/` que la spec
vieja diseñaba nunca se escribió; no hay deploy ni datos de producción.

La escisión es limpia hoy. Cada fase que hubiera avanzado (novedades,
materiales, casos, equipo) la volvía más cara, porque recién ahí los
componentes cambiaban de fuente de datos.

## 3. El stack

| Capa | Qué | Nota |
| --- | --- | --- |
| Base | Neon (Postgres) | sin cambios |
| ORM | **Prisma 7.10.0** | versión exacta: `latest` hoy resuelve a `8.0.0-rc.15` |
| Sesión | **better-auth** + `prismaAdapter` | autohospedado en la misma base, sin proveedor nuevo |
| Mutaciones | **Server Actions + Zod** | libera el namespace `/api` |
| Fotos | `@vercel/blob` + `sharp` | SDK directo, sin adaptador |
| Correos | `resend` | SDK directo, sin adaptador |

Salen 7 dependencias (`payload`, 5× `@payloadcms/*`, `graphql`); entran 6
(`prisma`, `@prisma/client`, `@prisma/adapter-neon`, `better-auth`,
`@vercel/blob`, `resend` — `sharp` y `zod` ya están). El repo queda con una
dependencia menos que hoy.

**Vocabulario:** se abandona el de Payload a propósito. Es Postgres relacional,
no una base documental. No hay «colecciones», ni «globals», ni
`CollectionConfig`: hay tablas, columnas y un formulario escrito a mano por
entidad. **Sin meta-capa que traduzca un objeto de configuración a un
formulario** — ese es el modelo de Payload y del admin de Django, y es cómo se
termina reescribiendo Payload.

## 4. La forma del repo

Un solo deployable (`apps/sitio`), y `packages/` desde ahora:

```
packages/          LO REUSABLE — cero dominio de ED adentro
├── db/            cliente Prisma + Neon, slugs, redirecciones
├── auth/          better-auth configurado, permisos, guarda
└── kit-admin/     tabla, formulario, controles, imágenes, avisos

apps/sitio/
├── prisma/schema/     base · auth · contenido · sitio
├── prisma/migrations/ generadas, commiteadas, nunca a mano
└── src/
    ├── app/(sitio)/   el sitio público
    ├── app/(admin)/   SOLO rutas; la carne va en src/admin/
    ├── app/api/       LIBRE: contacto/ cv/
    ├── datos/         consultas/ (lee el sitio) · acciones/ (escribe el admin)
    ├── admin/         una carpeta por entidad + armazon/
    ├── features/      el sitio, INTACTO
    └── middleware.ts  sesión · cabeceras · rate limit
```

**Las cuatro fronteras** (son el criterio de review, no una sugerencia):

1. `packages/` no sabe nada de ED. Si aparece «novedad» en `kit-admin`, está mal.
2. `datos/` es la única puerta a la base. Ningún componente importa Prisma.
3. `app/` son rutas y nada más.
4. `features/` no se entera: los componentes reciben props. Cambia quién se las
   pasa, nunca su contrato.

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
  canónica en la revista que lo publicó; una ficha nuestra sería contenido
  delgado y duplicado. Casos y perfiles sí: son originales de ED.
- **Los filtros se parten en dos niveles.** El tipo va en el path
  (`/biblioteca/libros`), porque es una lista cerrada de 7 y merece rankear;
  `tema`, `publico` y `anio` van en query con canonical al path.
- **Nada anida más de tres niveles**, y las rutas intermedias no dan 404:
  `/investigacion/casos` → `/investigacion#casos` (308).

**Dos reglas de slug que son arquitectura:**

- El slug es una **columna**, no se deriva del título. Corregir un título no
  mueve una URL.
- **Tabla de redirecciones**: si un slug cambia, el admin escribe el 308 del
  viejo al nuevo. Sin eso, cada cambio es un link muerto.

## 6. Seguridad

| # | Hoy | Cómo queda |
| --- | --- | --- |
| 1 | Cero cabeceras | `middleware.ts` + `headers()`: CSP, HSTS, `frame-ancestors` en `none` para `/admin`, `Referrer-Policy`, `Permissions-Policy` |
| 2 | `GET /api/fotos` público y enumerable | desaparece: sin REST autogenerada no hay qué enumerar |
| 3 | `/api` tomado por el catch-all | liberado para `/api/contacto` y `/api/cv` |
| 4 | Secreto de vista previa en el query string | cookie firmada de un solo uso con expiración |
| 5 | Rate limit solo por cuenta | por IP **y** por cuenta, en el middleware |
| 6 | `/admin` depende de `robots.txt` | `X-Robots-Tag: noindex` real en la respuesta |

Y lo que trae la capa nueva: Argon2id, rotación de sesión al login, tokens de
reset de un solo uso hasheados en reposo, errores genéricos para no permitir
enumerar usuarios. **La sesión se verifica en el middleware, antes de
renderizar**, nunca dentro del componente.

Se copia la guarda de `prisma db push` (`scripts/guarda-prisma.mjs`): `push`
crea tablas sin generar migración, y el síntoma aparece en producción.

## 7. Las fases

| | Qué | Sale sola |
| --- | --- | --- |
| **0** | **Escisión.** Payload afuera, repo en verde, sitio intacto, ADRs y docs al día. | sí, y es reversible |
| **1** | **Cimientos.** `packages/db` + `packages/auth`, middleware (cabeceras, rate limit), login en `/admin`. Sin contenido. | sí |
| **2** | **El kit y una entidad entera.** `packages/kit-admin` + novedades de punta a punta, con el sitio leyéndola por `datos/consultas/`. | sí |
| **3** | **El resto del contenido.** Materiales, casos, equipo, aliados, páginas, ajustes. | por entidad |
| **4** | **Las URLs y el SEO.** Las 26 rutas nuevas, `sitemap.xml`, canonicals, redirecciones, JSON-LD. | sí |

## 8. Documentación

| Archivo | Qué le pasa |
| --- | --- |
| ADR-0003 (Neon + Payload) | `Superseded by ADR-0005`. **No se borra**: los ADRs de este repo son inmutables. |
| ADR-0004 (monorepo `apps/`) | sigue `Accepted`, enmendado por el 0006 |
| **ADR-0005** | admin a medida, reemplaza Payload |
| **ADR-0006** | `packages/` desde ahora: la reutilización como requisito |
| **ADR-0007** | Prisma como ORM |
| Spec del panel (2026-09-15) | **se borra**; la reemplaza esta lane y su spec |
| `AGENTS.md` §2 §3 §12 §13 · `README.md` · `docs/README.md` · `docs/AI_GUIDELINES.md` §12 | se rescriben |

## 9. Qué NO entra

- Historial de versiones con restaurar, autoguardado, bloqueo de documento
  concurrente. Con tres editoras y los backups de Neon, no compran lo que
  cuestan. Se pueden sumar después.
- Editor de texto enriquecido, más de un idioma, comentarios, analíticas.
- Cambios de diseño del sitio, de geometría o de animaciones.
- Fichas propias para los 63 materiales (ver §5).

## 10. Criterios de aceptación

- `pnpm typecheck`, `pnpm lint` y `pnpm build` en verde.
- `node scripts/verificar-react-doctor.mjs` en **100/100 sin diagnósticos**,
  con los `packages/` sumados a las dos listas del gate (AGENTS.md §5.8).
- Cero apariciones de `payload` en `apps/sitio/src`, en la config y en los
  `package.json`.
- El sitio renderiza exactamente igual que en `d452e61` al terminar la fase 0.
- Los estándares de contenido de AGENTS.md §6 valen también para las etiquetas
  y las ayudas del admin: lenguaje inclusivo, nunca «alumnos».
