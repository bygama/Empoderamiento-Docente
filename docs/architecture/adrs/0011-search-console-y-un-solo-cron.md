# ADR-0011: Copiar Search Console cada día con una cuenta de servicio, y correr todo lo programado desde un solo cron

- **Status:** Accepted, ampliado por el ADR-0018
- **Amended by:** [ADR-0018](0018-deploy-en-vercel-o-en-un-vps.md) — en un VPS,
  el cron de `vercel.json` lo hace el servicio `cron` del compose; sigue
  siendo uno solo.
- **Date:** 2026-09-26
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en
  `work/busquedas-de-google/`
- **Related:** [ADR-0009](0009-analitica-de-vercel-con-copia-diaria.md) (la
  copia diaria de Vercel, que este ADR muda al cron único),
  [ADR-0006](0006-packages-reutilizables.md) (lo que no sabe de ED incuba en
  `lib/`), [ADR-0007](0007-prisma-como-orm.md) (las migraciones)

---

## Contexto

El objetivo número uno de ED es posicionarse en buscadores, y el admin no
sabía nada de Google: la analítica de Vercel cuenta visitas, no qué buscó la
gente para llegar. Search Console sí lo sabe, y lo da por una API gratuita.
Sus datos se acumulan desde que la propiedad está verificada: cuanto antes se
conecte, más historia hay.

Tres fuerzas:

1. **El admin nunca lee una API en el render** (ADR-0009): lee de nuestra
   base, que una tarea diaria mantiene al día. Search Console además llega con
   2 o 3 días de atraso y corta a los 16 meses.
2. **Sin dependencias nuevas** si se puede (SPEC padre §9): lo externo va por
   `fetch`.
3. **Esta es la primera lane que necesita una segunda tarea diaria**, y el
   mapa del admin ya anuncia más (chequeo de links, retención, resumen
   semanal). Vercel Hobby corre los crons una vez por día y en cantidad
   limitada.

## Decisión

**Copiamos Search Console a Neon una vez por día con una cuenta de servicio
de Google, y todo lo programado corre desde un solo cron que recorre un
registro de tareas.**

- **La cuenta de servicio, sin dependencias.** Un JWT RS256 firmado con
  `node:crypto` y canjeado en `https://oauth2.googleapis.com/token`, con el
  alcance `webmasters.readonly`. La cuenta se agrega como usuaria
  **Restringida** de la propiedad: solo lee. Tres variables del servidor:
  `SEARCH_CONSOLE_CLIENT_EMAIL`, `SEARCH_CONSOLE_PRIVATE_KEY` y
  `SEARCH_CONSOLE_SITE_URL`.
- **La copia** pide `searchAnalytics/query` por día y por dimensión (total,
  búsqueda, página y país), con `dataState: "final"`: del día siguiente al
  último guardado hasta ayer, 90 días la primera vez. Va en
  `busquedas_diarias`, una fila por día, dimensión y valor.
- **La posición se guarda re-promediable.** Google la da como el promedio,
  por impresión, del puesto más alto del sitio; se guarda
  `sumaDePosiciones = position × impressions`, y todo agregado se lee
  `Σ sumaDePosiciones / Σ impresiones`. Nunca un promedio de promedios.
- **Un solo cron, `/api/cron/diario`**, con el `CRON_SECRET` de siempre. Corre
  cada tarea registrada **a la vez y aislada**: una que tira o que pasa sus
  50 segundos queda fallida y las otras siguen. Cada corrida (tarea, cuándo,
  ok, detalle en llano), también las de «Actualizar ahora», va a una tabla
  común, `corridas_de_tareas`, que va a leer Ajustes › Conexiones.
- **El registro y el corredor viven en `lib/tareas/`** y no saben de ED; las
  tareas, en `datos/tareas/`. La copia de Vercel pasa a ser una tarea más, y
  su historial de `metricas_sincronizaciones` se mueve a la tabla común en la
  misma migración. Un módulo que necesite algo programado suma una tarea a esa
  lista, no un cron.

### La migración con datos

Mover el historial pide un `INSERT … SELECT` antes del `DROP`, y Prisma no
genera movimientos de datos. La migración `busquedas_y_tareas` se generó con
`prisma migrate dev --create-only`, se le sumó ese SQL (comentado en el mismo
archivo: qué mueve y por qué) **antes de su primera aplicación**, y recién ahí
se aplicó. Es la vía que documenta Prisma para migrar datos, y no toca ninguna
migración aplicada, que es lo que protege la regla de AGENTS.md §12; esa
línea se precisó en el mismo PR para que la regla y la práctica digan lo
mismo. Se probó sobre una base con filas en `metricas_sincronizaciones`: las
mismas filas quedaron en `corridas_de_tareas`, con su rango sumado al detalle.

## Consecuencias

### Positivas

- El admin muestra qué busca la gente, «Casi nos encuentran» y en qué puesto
  aparece cada página, sin cookies, sin cuenta nueva para las editoras y sin
  depender del plan de Vercel.
- La historia es nuestra: Google corta a los 16 meses; la copia no.
- Sin dependencias: el JWT son 60 líneas con `node:crypto`, probadas con una
  clave generada en el test.
- Lo programado crece sin tocar `vercel.json`: una tarea más en una lista.

### Negativas

- **Una clave privada más que cuidar.** Solo lee Search Console, pero es un
  secreto.
- **Los números llegan con 2 o 3 días de atraso**, en hora del Pacífico, y
  Google oculta las búsquedas que hace muy poca gente: la lista de búsquedas
  suma menos que el total. La pantalla lo dice.
- **Conectar pide pasos afuera del código:** verificar el dominio (DNS),
  crear la cuenta de servicio y agregarla a la propiedad.
- **Todas las tareas comparten los 60 segundos de una función.** Con muchas
  tareas pesadas, habría que repartirlas.

### Mitigaciones

- La clave vive solo del lado del servidor; el único código que la usa es la
  copia. Sin las tres variables, la tarea sale fallida en llano y no toca la
  API, y la pantalla le muestra los pasos a quien puede configurar las
  conexiones (`PUEDE.configurarConexiones`).
- Cada corrida queda escrita, con el error en llano (un 403 dice dónde
  agregar la cuenta); «Actualizar ahora» tiene un freno de diez minutos por
  tarea.
- El cliente, el JWT y el corredor no importan nada de la app: pasan a
  `packages/` sin cambios cuando los use un segundo proyecto.

## Alternativas consideradas

### Alternativa A: `googleapis` o `google-auth-library`

- Qué hubiera implicado: el cliente oficial, que firma y renueva el token solo.
- Por qué se descarta: una dependencia grande para un POST firmado y una
  consulta. El JWT de una cuenta de servicio está documentado y cabe en un
  archivo.

### Alternativa B: OAuth con la cuenta de Google de una persona

- Qué hubiera implicado: un botón «Conectar con Google» y un refresh token
  guardado en la base.
- Por qué se descarta: el acceso queda atado a una persona (si se va de ED o
  revoca, se corta), y guardar un refresh token con permisos de su cuenta es
  peor que una cuenta de servicio que solo lee una propiedad.

### Alternativa C: un cron por tarea

- Qué hubiera implicado: `/api/cron/busquedas` al lado de `/api/cron/metricas`.
- Por qué se descarta: Hobby limita la cantidad de crons, cada tarea nueva
  tocaría `vercel.json`, y no habría un lugar común donde ver si todo corrió.

### Alternativa D: leer la API en el render

- Qué hubiera implicado: sin tablas ni cron.
- Por qué se descarta: la misma razón que en el ADR-0009 (cuota, lentitud,
  pantallas que dependen de un tercero) y además la historia se perdería a
  los 16 meses.

## Referencias

- Spec de la lane: `work/busquedas-de-google/SPEC.md` (§5 el cron, §6 la
  copia, §7 las tablas) y su `DECISIONS.md`.
- [Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
  · [Obtener todos los datos](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data)
  · [Cómo se calcula la posición](https://support.google.com/webmasters/answer/7042828)
- [OAuth 2.0 para aplicaciones de servidor a servidor](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Prisma 7: personalizar migraciones](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/customizing-migrations)
  (`--create-only`, editar el SQL y recién ahí aplicar; la página sin
  versión ya describe el flujo de la 8)
- [Cron jobs de Vercel: uso y precios](https://vercel.com/docs/cron-jobs/usage-and-pricing)
