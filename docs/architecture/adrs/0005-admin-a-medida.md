# ADR-0005: Construir el admin a medida y sacar Payload (reemplaza Payload)

- **Status:** Accepted
- **Date:** 2026-09-18
- **Decision-makers:** @mateo
- **Supersedes:** ADR-0003 (Payload como panel de contenido)

---

## Contexto

El [ADR-0003](0003-adoptar-neon-y-payload.md) adoptó **Payload 3** montado en
`/admin`, sobre Neon, y la fase 0 se implementó: dos colecciones (`usuarios` y
`fotos`), login, roles y las integraciones con Blob y Resend.

El owner decide no seguir con Payload. La razón no es un defecto técnico que
haya aparecido: es que quiere un admin propio, cuyo kit sirva también en sus
proyectos futuros.

**La medición que habilita la decisión** (sobre `d452e61`):

- Fuera de `src/cms/` y `src/app/(payload)/`, **un solo archivo** del repo
  importa Payload: `app/(sitio)/vista-previa/route.ts`.
- La capa de lectura `src/contenido/` que el ADR-0003 dejaba como salida
  («si algún día Payload se va, cambia esa capa y no los componentes»)
  **nunca se escribió**: los 46 componentes siguen leyendo sus `data.ts`.
- No hay deploy ni datos de producción: las 10 tablas viven solo en el
  Postgres local de cada desarrollador.

Sacarlo hoy es una escisión limpia. Cada fase que avanzara —novedades,
materiales, casos, equipo— la encarecía, porque recién ahí los componentes
cambiaban de fuente de datos.

La fuerza en contra, dicha entera: el propio ADR-0003 descartó el panel a
medida por costar cinco a ocho semanas contra dos o tres. Esa estimación sigue
siendo razonable, y el alcance se recorta a propósito para acercarla (ver
«Negativas»).

## Decisión

**El admin se construye a medida, en `/admin`, sobre Prisma y better-auth.**
Payload y sus cinco adaptadores salen del repo.

Se conserva la infraestructura que el ADR-0003 eligió bien y que no estaba en
discusión: **Neon** (Postgres), **Vercel Blob** (fotos) y **Resend** (correos).

| Capa | Qué |
| --- | --- |
| ORM | Prisma (ver [ADR-0007](0007-prisma-como-orm.md)) |
| Sesión | better-auth con `prismaAdapter`, autohospedado en la misma base |
| Mutaciones | Server Actions validadas con Zod |
| Fotos | `@vercel/blob` + `sharp`, por SDK directo |
| Correos | `resend`, por SDK directo |

Dos reglas de diseño que la decisión lleva adentro:

- **Sin meta-capa de configuración.** Nada de un objeto que un renderizador
  genérico traduce a formulario: ese es el modelo de Payload, de Strapi y del
  admin de Django, y es exactamente cómo se termina reescribiendo Payload.
  Cada entidad escribe su formulario con los primitivos de
  `packages/kit-admin` (ver [ADR-0006](0006-packages-reutilizables.md)).
- **Se abandona el vocabulario de Payload.** No hay «colecciones», «globals»
  ni `CollectionConfig`. Es Postgres relacional, no una base documental: hay
  tablas, columnas y controles.

El alcance se recorta respecto de lo que prometía la spec del panel: **quedan
afuera el historial de versiones con restaurar, el autoguardado y el bloqueo
de documento concurrente.** Son cerca de un tercio del trabajo y, con tres
editoras y los backups de Neon, no compran lo que cuestan. Se pueden sumar
después.

## Consecuencias

### Positivas

- **Menos dependencias que antes.** Salen 7 (`payload`, los cinco
  `@payloadcms/*` y `graphql`), entran 5. `pnpm install` sacó 226 paquetes.
- **Cero código generado dentro de `src/`.** Se van las 702 líneas generadas
  —`payload-types.ts`, el route group `(payload)` y la migración— y con ellas
  los tres `globalIgnores` de ESLint que existían para esconderlas.
- **El namespace `/api` queda libre.** Lo tenía tomado entero un catch-all de
  Payload; ahora puede recibir los formularios de contacto y de CV, que son la
  meta 2 del proyecto.
- **Desaparece una superficie enumerable**: `GET /api/fotos` era público y
  devolvía la biblioteca de medios completa sin sesión.
- El kit resultante viaja a otros proyectos del owner.

### Negativas

- **Hay que construir lo que Payload daba hecho**: listas con filtros,
  formularios, subida de imágenes, borrador y publicación. La estimación de
  cinco a ocho semanas del ADR-0003 sigue en pie, recortada por el alcance.
- **Se pierde el historial de versiones con restaurar**, que era lo que más
  tranquilidad le daba a alguien no técnico frente al miedo de romper algo.
- **La autenticación pasa a ser responsabilidad nuestra**, aunque se apoye en
  una librería auditada: es el único lugar donde un bug propio es una brecha y
  no un bug.
- El trabajo ya hecho en la fase 0 del panel se descarta.

### Mitigaciones

- La sesión no se escribe a mano: better-auth cubre hashing con Argon2id,
  rotación de sesión y tokens de reset de un solo uso. La línea es la que traza
  cualquier empresa grande: la capa de identidad se adopta, la autorización de
  negocio y la UI se construyen.
- El admin se construye por fases, cada una mergeable sola, y la fase 2 prueba
  el enfoque completo contra una sola entidad antes de replicarlo.
- La base tiene los backups de Neon; el historial de versiones puede sumarse
  después sin rehacer nada.

## Alternativas consideradas

### Alternativa A: seguir con Payload

- Qué hubiera implicado: ejecutar las fases 1 a 4 de la spec del panel.
- Por qué se descarta: decisión del owner, que quiere un admin propio y
  reutilizable. La medición mostró que el costo de salir crece con cada fase,
  así que postergarlo era la opción cara.

### Alternativa B: otro CMS (Strapi, Directus, Sanity)

- Qué hubiera implicado: cambiar una dependencia pesada por otra.
- Por qué se descarta: no resuelve lo que motivó el cambio —tener algo propio
  y reutilizable— y repite el defecto que el ADR-0003 ya se había anotado.

### Alternativa C: proveedor de identidad externo (Clerk, Auth0, WorkOS)

- Qué hubiera implicado: delegar la sesión a un servicio.
- Por qué se descarta: suma una cuenta y un proveedor más, que es justo una de
  las consecuencias negativas que el ADR-0003 se anotó. better-auth se
  autohospeda sobre la misma base y no agrega ninguno.

## Referencias

- Spec del admin: `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
- [ADR-0003](0003-adoptar-neon-y-payload.md), que este reemplaza.
- [ADR-0006](0006-packages-reutilizables.md) · [ADR-0007](0007-prisma-como-orm.md)
- [better-auth](https://better-auth.com) · [Neon](https://neon.com/docs)
  · [Vercel Blob](https://vercel.com/docs/vercel-blob) · [Resend](https://resend.com/docs)
