# ADR-0003: Adoptar Neon y Payload para el panel de contenido (reemplaza Supabase)

- **Status:** Accepted
- **Date:** 2026-09-15
- **Decision-makers:** @bygama (Facundo), con Gastón y Mateo
- **Supersedes:** ADR-0002 (Supabase como backend y persistencia)

---

## Contexto

ED necesita cambiar el contenido del sitio sin tocar código: textos, títulos,
fotos, publicaciones, novedades, casos, equipo, aliados y datos de contacto.
Hoy todo eso está escrito en archivos TypeScript y en los componentes, el
sitio corre 100% frontend y no tiene deploy configurado. Lo van a usar tres
personas no técnicas o casi (Gastón, Raquel, Daniela), sin paso de
aprobación: quien edita, publica.

El ADR-0002 había elegido Supabase (Postgres + Auth + Storage) para cuando
apareciera persistencia. El 2026-09-15 Facundo decidió no usar Supabase y
usar Neon. Con eso, auth y almacenamiento de archivos ya no vienen con la
base y hay que resolverlos aparte. El diseño completo del panel está en
`docs/architecture/specs/2026-09-15-panel-admin-diseno.md`.

## Decisión

**Neon** (Postgres serverless, integración nativa de Vercel con una rama de
base por cada preview) es la base de datos. **Payload 3** es el panel de
administración y la capa de acceso al contenido: corre adentro de la misma
app Next en `/admin`, con su propia autenticación (mail y contraseña, dos
roles), borradores, versiones y vista previa. Las fotos van a **Vercel
Blob** y los correos del panel salen por **Resend**. El sitio se despliega
en **Vercel**.

La regla de alcance del panel: se edita todo menos la estructura de las
escenas animadas (cantidad fija de piezas, largo máximo por texto).

## Consecuencias

### Positivas

- Panel completo sin construirlo: listas, formularios, borradores con
  autoguardado, historial con restaurar, vista previa, biblioteca de
  imágenes, roles, interfaz en español.
- Todo en el repo, con el mismo flujo de PR y los mismos gates. El contenido
  vive en una base que es Postgres estándar.
- Una rama de base por preview: se prueba con datos reales sin tocar
  producción. Neon no pausa el proyecto por inactividad.

### Negativas

- Dependencia pesada (Payload y sus adaptadores) que publica versiones cada
  semana.
- Archivos generados en `src/app/(payload)/` que no son nuestros.
- Cuatro proveedores (Vercel, Neon, Blob, Resend) en lugar de uno.
- Payload tiene un issue abierto con builds de producción bajo Turbopack
  (`payloadcms/payload#15429`).

### Mitigaciones

- Versiones fijadas en el lockfile; todos los `@payloadcms/*` se actualizan
  juntos y a propósito.
- Lo generado queda fuera del lint y de la regla de 200 líneas; react-doctor
  lo mide igual y tiene que seguir en 100.
- Las cuatro piezas se instalan desde el Marketplace de Vercel, con las
  variables provisionadas solas y una sola factura.
- Probado el 2026-09-15 con Payload 3.89.0 y Next 16.3.4: el build de
  producción con Turbopack pasó y `/admin` respondió bien con `next start`.
  El fallback a webpack (`next build --webpack`) queda como plan B si el
  issue vuelve a morder.
- El sitio lee el contenido por una capa propia (`src/contenido/`) que
  traduce a los tipos que ya existen: si algún día Payload se va, cambia esa
  capa y no los componentes.

## Alternativas consideradas

### Alternativa A: Supabase (ADR-0002)

- Qué hubiera implicado: Postgres + Auth + Storage en un solo proveedor, con
  el panel construido a medida sobre su SDK.
- Por qué se descarta: decisión de Facundo del 2026-09-15 («no vamos a usar
  Supabase y vamos a usar Neon»). Además, el plan gratis pausa el proyecto
  tras una semana sin actividad.

### Alternativa B: Panel a medida sobre Neon (Drizzle + Clerk + Blob)

- Qué hubiera implicado: construir listas, formularios de unas quince
  entidades, borradores, versiones, vista previa y subida de imágenes.
- Por qué se descarta: cinco a ocho semanas contra dos o tres para el mismo
  alcance, y todos los bugs propios.

### Alternativa C: CMS alojado afuera (Sanity, Contentful)

- Qué hubiera implicado: el contenido en la nube del proveedor, con el
  studio embebido en la app.
- Por qué se descarta: contradice la decisión de tener la base en Neon y
  suma cuentas.

## Referencias

- Spec del panel: `docs/architecture/specs/2026-09-15-panel-admin-diseno.md`
- [ADR-0002](0002-adoptar-supabase-persistencia.md), que este reemplaza.
- [Payload docs](https://payloadcms.com/docs) · [Neon + Vercel](https://neon.com/docs/guides/vercel-overview) · [Vercel Blob](https://vercel.com/docs/vercel-blob) · [Resend](https://resend.com/docs)
- Issue de Turbopack: https://github.com/payloadcms/payload/issues/15429
