# ADR-0009: Medir el tráfico con la analítica de Vercel y guardar una copia diaria en Neon

- **Status:** Accepted
- **Date:** 2026-09-21
- **Decision-makers:** @bygama (Facundo), diseñado en conversación
- **Related:** [ADR-0004](0004-monorepo-apps.md) (un solo deployable),
  [ADR-0005](0005-admin-a-medida.md) (el admin a medida deja las analíticas
  fuera de alcance; este ADR las suma)

---

## Contexto

El admin tiene que ser una herramienta viva: además de editar el contenido,
ED quiere ver **cuánta gente entra al sitio y qué páginas mira**. Nada más
fino por ahora: ni qué descargan, ni hasta dónde scrollean, ni grabaciones.

Restricciones dichas por el owner el 2026-09-21:

1. **Gratis, sin pagos**, hasta que ED decida el plan de hosting.
2. **Sin cookies ni aviso de cookies**: el sitio no tiene banner y no queremos
   uno por una métrica de tráfico.
3. **Sin cuentas nuevas** para las editoras: las métricas se miran adentro del
   admin, con la misma sesión.
4. **Un solo deployable** (ADR-0004): nada de un segundo servicio que operar.

El sitio todavía no está publicado en Vercel, así que cualquier métrica
empieza a existir recién con el primer deploy.

## Decisión

**Se mide con Vercel Web Analytics, se guarda una copia diaria de los
agregados en nuestra base de Neon, y el admin muestra el panel leyendo esa
copia.**

- El sitio carga `<Analytics />` de `@vercel/analytics` en el layout público.
  Cuenta vistas de página y visitantes sin cookies; en desarrollo no manda
  nada.
- Un cron diario de Vercel (`/api/cron/metricas`, protegido con
  `CRON_SECRET`) consulta la API pública de Web Analytics y guarda, por día,
  los totales y los desgloses por página, país, referido y dispositivo en la
  tabla `metricas_diarias`. Es idempotente: la primera corrida trae los días
  que Vercel conserva y las siguientes solo lo nuevo.
- La portada del admin muestra últimos 7 y 30 días contra el período
  anterior, la curva diaria y las listas de páginas, referidos, países y
  dispositivos, leyendo solo de nuestra tabla.
- **Sin eventos propios**: el plan gratis no los tiene y la pregunta de hoy no
  los necesita. Si algún día hace falta «cuántos tocaron Contacto», se suma
  como evento cuando exista el plan que lo permita.

## Consecuencias

### Positivas

- Sin cookies, sin aviso, sin cuenta nueva, sin segundo deployable y sin
  costo en el plan gratis (50.000 vistas por mes, muy por encima del tráfico
  esperado).
- **La historia es nuestra.** Vercel conserva un mes en Hobby y doce en Pro;
  la copia diaria en Neon no vence y no depende del plan.
- Una dependencia (`@vercel/analytics`), tres tablas chicas y un cron.

### Negativas

- **Dependemos del hosting**: si el sitio se va de Vercel, la recolección se
  reemplaza. La copia diaria sigue sirviendo como historia.
- **El token de la API abre toda la cuenta de Vercel**, no solo la analítica.
  Es un secreto más que cuidar.
- El plan gratis es de uso no comercial según los términos de Vercel; ED es
  una consultora. Queda como riesgo aceptado hasta que ED decida el plan.
- El cron del plan gratis corre una vez por día con hasta una hora de
  imprecisión: los números del panel son «hasta ayer».
- Solo agregados: nunca vamos a saber qué hizo una persona en particular, y
  no queremos saberlo.

### Mitigaciones

- El token vive solo del lado del servidor, nunca con `NEXT_PUBLIC_`, y el
  único código que lo usa es la sincronización. El cron exige `CRON_SECRET`.
- El cliente de la API y la sincronización no saben nada de ED: cuando exista
  un segundo proyecto pasan a `packages/` sin cambios (ADR-0006).
- El botón «Actualizar ahora» del panel vuelve a pedir los últimos días, para
  el que no quiere esperar al cron.

## Alternativas consideradas

### Alternativa A: Umami hosteado por nosotros

- Qué hubiera implicado: un segundo proyecto en Vercel con Umami sobre la
  misma base de Neon; el admin lo embebe o lee su API. Gratis y sin tope.
- Por qué se descarta: un segundo deployable con su propio login y sus
  actualizaciones, justo lo que el ADR-0004 evita. Vuelve a la mesa si el
  sitio deja Vercel.

### Alternativa B: PostHog o Umami Cloud

- Qué hubiera implicado: una cuenta en un tercero. PostHog además mete
  cookies y pide aviso, y da grabaciones y embudos que nadie pidió.
- Por qué se descarta: cuenta nueva y, en PostHog, cookies. Es más de lo que
  la pregunta necesita.

### Alternativa C: Google Analytics

- Qué hubiera implicado: el estándar de facto, gratis.
- Por qué se descarta: cookies y aviso obligatorio, panel afuera del admin y
  con cuenta de Google por persona, y datos de las visitas en manos de un
  tercero sin necesidad.

## Referencias

- Spec de la lane: `work/metricas/SPEC.md`
- [Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api) ·
  [Límites y precios](https://vercel.com/docs/analytics/limits-and-pricing) ·
  [Cron jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [`@vercel/analytics`](https://vercel.com/docs/analytics/package)
