# SPEC — Las métricas del admin

- **Fecha:** 2026-09-21
- **Estado:** aprobado por el owner en conversación; revisado; plan escrito (PLAN.md); fase A implementada (A2–A8), A1 espera el token
- **Decide:** Facundo (owner), diseñado en conversación
- **Tier:** M · rama `feat/metricas`
- **Registra:** [ADR-0009](../../docs/architecture/adrs/0009-analitica-de-vercel-con-copia-diaria.md)
- **Depende de:** la lane [`primer-deploy`](../primer-deploy/SPEC.md): sin el
  sitio publicado en Vercel no hay nada que contar, y las respuestas reales de
  la API se graban recién con el proyecto creado

---

## 1. Qué se quiere

Que quien entra al admin vea, en la portada, **cuánta gente entra al sitio y
qué páginas mira**: visitantes y vistas de los últimos 7 y 30 días contra el
período anterior, la curva diaria, las páginas más vistas, de dónde llegan,
países y dispositivos. Sin cookies, sin aviso, sin cuenta nueva y en el plan
gratis.

Lo usan las mismas tres personas que el admin, con la misma sesión. Editoras y
administradora ven lo mismo.

## 2. Cómo funciona, de punta a punta

1. **El sitio cuenta.** `<Analytics />` de `@vercel/analytics` en el layout de
   `app/(sitio)/`. Solo el sitio: el admin vive en otro route group y no se
   mide, así que `/admin` nunca aparece en las listas. **Se renderiza solo en
   producción** (`NODE_ENV === "production"`): en desarrollo el componente
   cargaría un script de depuración desde `va.vercel-scripts.com`, que la CSP
   del middleware bloquea, y de todos modos no hay nada que medir. En
   producción el script y los envíos van al mismo origen
   (`/_vercel/insights/…`), así que la CSP actual (`default-src 'self'`,
   `connect-src 'self'`) no cambia.
2. **Vercel agrega.** Web Analytics guarda vistas y visitantes por día y por
   dimensión durante su ventana (un mes en Hobby).
3. **Nosotros copiamos.** Un cron diario pega en `/api/cron/metricas` con el
   `CRON_SECRET`; la sincronización pide a la API lo que falte y lo guarda en
   dos tablas.
4. **El admin muestra.** La portada lee solo de nuestras tablas. Nunca llama a
   la API en el render: si Vercel está lento o caído, el panel sigue.

## 3. El modelo

Tres tablas, en `apps/sitio/prisma/schema/metricas.prisma`:

```prisma
/// Una fila por día, dimensión y valor. `valor` es "" en la fila del total.
model MetricaDiaria {
  fecha      DateTime @db.Date
  dimension  String   // total | pagina | pais | referido | dispositivo
  valor      String   // "" · la ruta · el país (ISO-2) · el host · el tipo
  agrupado   Boolean  @default(false) // true en la fila «el resto» de la API
  vistas     Int
  visitantes Int      // visitantes únicos DE ESE DÍA: no se suman entre días

  @@id([fecha, dimension, valor, agrupado])
  @@map("metricas_diarias")
}

/// Visitantes únicos de una ventana entera, pedidos a la API como un rango:
/// una persona que entró tres días cuenta una vez. Es lo que muestran las
/// tarjetas; sumar los días daría un número inflado que nunca coincidiría
/// con el dashboard de Vercel.
model MetricaVentana {
  fechaFin   DateTime @db.Date  // el último día de la ventana (ayer)
  dias       Int               // 7 | 30
  vistas     Int
  visitantes Int

  @@id([fechaFin, dias])
  @@map("metricas_ventanas")
}

/// Qué pasó en cada sincronización: el panel muestra la última y sus errores.
model SincronizacionMetricas {
  id        Int      @id @default(autoincrement())
  corridaEn DateTime @default(now())
  desde     DateTime @db.Date
  hasta     DateTime @db.Date
  ok        Boolean
  detalle   String   // "3 días, 187 filas" o el error, en llano

  @@map("metricas_sincronizaciones")
}
```

- **Los días son UTC**, que es como los agrupa la API (`by=day`). Para ED,
  en Chile y Argentina, el corte cae entre las 20 y las 21; el panel lo dice
  en la cabecera («días en hora universal») y nadie lo va a notar en un
  número mensual.
- `requestPath` llega **sin query string** (lo dice la API): `/biblioteca?tema=x`
  y cualquier `utm_*` de una campaña cuentan en `/biblioteca`, que es lo que
  ED quiere ver. Se confirma sobre las respuestas grabadas; si no fuera así,
  se corta en `?` al mapear.
- Las dimensiones son las cinco que devuelve la API para la pregunta de hoy:
  `total` (`by=day`), `pagina` (`requestPath`), `pais` (`country`), `referido`
  (`referrerHostname`; vacío = «directo») y `dispositivo` (`deviceType`).
- Cuando la API agrupa el resto en «Others», se guarda con `valor = ""` y
  `agrupado = true`. El referido vacío (tráfico directo) también lleva
  `valor = ""`, con `agrupado = false`: por eso `agrupado` entra en la clave,
  si no una fila pisaba a la otra. Nada de valores mágicos que puedan chocar
  con un host real.
- **Los campos exactos de cada respuesta se graban de la API real** (con el
  proyecto ya creado) antes de escribir los mapeos: si alguna dimensión no
  trae `visitors`, el modelo se ajusta en ese momento y queda anotado en
  `DECISIONS.md`.
- Las migraciones se generan con Prisma y se commitean, como manda la spec del
  admin §8. `prisma db push` sigue bloqueado.

## 4. La sincronización

`apps/sitio/src/datos/acciones/sincronizar-metricas.ts`, con el cliente HTTP
en `apps/sitio/src/lib/metricas/vercel.ts` y las fechas en
`apps/sitio/src/lib/metricas/periodos.ts`:

- **Qué días:** desde el día siguiente al último guardado (o hace 30 días si
  la tabla está vacía) hasta **ayer** (UTC). Hoy no se guarda: el día está
  incompleto. Nunca más de 31 días por corrida.
- **Nueve consultas por corrida, sobre el rango entero**, no por día. La API
  acepta dos dimensiones por consulta, así que cinco llamadas a
  `visits/aggregate` con `since`/`until` del rango y `by=day` más la
  dimensión (`requestPath` con `limit=100`, `country` 30, `referrerHostname`
  30, `deviceType` 10; el total solo con `by=day`) traen todos los días de
  una vez. Más cuatro consultas de rango sin agrupar para las ventanas: 7 y
  30 días terminando ayer, y 7 y 30 días terminando hace 7 y 30 días (el
  período anterior). Un backfill de 30 días son nueve llamadas, no ciento
  cincuenta. Secuenciales, con una pausa corta entre llamadas, y la función
  del cron declara `maxDuration`.
- **Guardado idempotente:** `upsert` sobre las claves `(fecha, dimension,
  valor)` y `(fechaFin, dias)`. Correr dos veces deja lo mismo.
- **Registro:** cada corrida escribe una fila en `metricas_sincronizaciones`,
  también cuando falla, con el motivo en llano («Vercel respondió 401: el
  token no sirve»).
- **Dos puertas a la misma función:** el cron (`GET /api/cron/metricas`,
  exige `Authorization: Bearer <CRON_SECRET>`, que Vercel manda solo; sin él
  responde 401 y no toca nada) y el botón «Actualizar ahora» del panel, que
  es una Server Action. **La acción verifica la sesión por su cuenta** con
  `auth.api.getSession()` y corta si no hay: una Server Action corre antes
  de que se renderice el layout protegido, así que el layout no la cubre, y
  el middleware solo mira que la cookie exista. Sin parámetros: siempre los
  últimos 3 días más las cuatro ventanas. **Con freno:** si la última fila de
  `metricas_sincronizaciones` tiene menos de diez minutos, la acción no llama
  a la API y responde «se actualizó hace N minutos»; es el único disparador
  a mano del token y no puede ser un botón sin límite.
- Si faltan `VERCEL_TOKEN` o `VERCEL_ANALYTICS_PROJECT_ID`, la sincronización
  no arranca: registra «faltan variables» y el panel lo muestra.

## 5. El panel

Es un componente (`PanelMetricas`, Server Component) que la portada del admin
(`app/(admin)/admin/(protegido)/page.tsx`) renderiza como su primera sección.
**No reemplaza la portada:** la fase 2 de Mateo le va a colgar ahí la
navegación de las entidades, y las dos lanes van en paralelo. El texto
«Todavía no hay nada que editar» se va cuando entre la primera entidad, no
con esta lane. Lee por `datos/consultas/metricas.ts`; las piezas viven en
`apps/sitio/src/admin/metricas/`:

- **Cabecera:** «Datos hasta el <día> (días en hora universal). Actualizado
  <hace tanto>» y el botón «Actualizar ahora».
- **Cuatro tarjetas**, de `metricas_ventanas`: visitantes y vistas, últimos 7
  y últimos 30 días, cada una con la diferencia contra la ventana anterior
  («+12 %», «−3 %», «sin datos previos»).
- **La curva**, de `metricas_diarias`: visitantes de cada día, últimos 30
  días, en SVG propio (sin librería de gráficos). Eje con los días, punto y
  valor al pasar el mouse, y una tabla oculta con los mismos números para
  lectores de pantalla.
- **Cuatro listas**, de `metricas_diarias` sumando **vistas** de los últimos
  30 días (las vistas sí se suman; los visitantes por fila se muestran como
  «por día» o no se muestran): páginas (10), de dónde llegan (10, con
  «directo» cuando no hay referido), países (10, con el nombre en español
  vía `Intl.DisplayNames`) y dispositivos (celular, computadora, tablet).
  Cada fila con una barra proporcional.
- **Estados vacíos, en llano:** sin variables configuradas («Faltan las
  variables de Vercel: ver README»); sin datos todavía («El sitio empieza a
  contar cuando se publica»); última sincronización fallida (el detalle).

Los textos siguen las reglas de contenido de AGENTS.md §6: lenguaje
inclusivo, sin tecnicismos, sin marketing. Colores y tipos, del tema.

## 6. Dónde vive el código

Sigue la forma que la spec del admin §3 fija para `datos/`: `consultas/` lee,
`acciones/` escribe, y es la única puerta a la base. El cliente HTTP saliente
no es una puerta a la base, así que va en `lib/`.

```
apps/sitio/
├── prisma/schema/metricas.prisma
├── prisma/migrations/<marca>_metricas/
├── src/lib/metricas/
│   ├── vercel.ts          cliente HTTP de la API: arma la URL, firma, mapea filas
│   ├── periodos.ts        ventanas de fechas (UTC), comparación de períodos
│   └── __fixtures__/      respuestas reales grabadas de la API
├── src/datos/consultas/metricas.ts        lo que lee el panel: tarjetas, curva, listas
├── src/datos/acciones/sincronizar-metricas.ts   qué falta, nueve consultas, upsert, registro
├── src/admin/metricas/
│   ├── PanelMetricas.tsx  compone las piezas
│   ├── Tarjeta.tsx · Curva.tsx · Lista.tsx · Estado.tsx
│   └── ActualizarAhora.tsx  el botón (cliente) y su acción, que verifica la sesión
├── src/app/(admin)/admin/(protegido)/page.tsx   → renderiza <PanelMetricas /> como sección
├── src/app/(sitio)/layout.tsx                   → <Analytics /> solo en producción
├── src/middleware.ts                            → `_vercel` sumado a la negación del
│                                                   matcher: cada beacon a
│                                                   /_vercel/insights/view no tiene
│                                                   por qué pasar por el middleware
├── src/app/api/cron/metricas/route.ts           → GET con CRON_SECRET, maxDuration
└── vercel.json                                  → el cron (Vercel lee vercel.json
                                                    desde el Root Directory, apps/sitio;
                                                    el archivo lo crea primer-deploy con
                                                    el Build Command y acá se le suma
                                                    la entrada `crons`)
```

`lib/metricas/` no sabe nada de ED: recibe proyecto, token y fechas, devuelve
filas. Cuando haya un segundo proyecto pasa a `packages/metricas` sin cambios
(ADR-0006).

## 7. Variables

Todas del lado del servidor, documentadas en `apps/sitio/.env.example`:

| Variable | Qué es |
| --- | --- |
| `VERCEL_TOKEN` | token de acceso de la cuenta de Vercel. **Abre toda la cuenta**: nunca `NEXT_PUBLIC_`, nunca en el navegador. Lo crea Facundo en Vercel → Account Settings → Tokens, con vencimiento de un año y alcance de la cuenta donde vive el proyecto (Vercel no da alcances más chicos), y lo carga **solo en Production**; para probar en local va en `.env.local` y no en ningún otro lado |
| `VERCEL_ANALYTICS_PROJECT_ID` | el `prj_…` del proyecto del sitio |
| `VERCEL_TEAM_ID` | vacío en una cuenta personal (Hobby); el `team_…` si el proyecto vive en un equipo |
| `CRON_SECRET` | lo que el cron manda en `Authorization`; Vercel lo inyecta si existe en el proyecto |

En local sin token el sitio y el admin andan; el panel dice qué falta. Para
probar la sincronización en local se cargan el token y el ID del proyecto en
`.env.local` y se llama al cron con `curl` y el secreto, o se toca «Actualizar
ahora»; los datos vienen del proyecto real.

## 8. Seguridad

- El token de Vercel es el secreto más sensible del proyecto: solo lo lee
  `lib/metricas/vercel.ts`, solo del lado del servidor, solo llamado desde la
  acción de sincronizar.
- `/api/cron/metricas` sin el secreto correcto responde 401 y no toca nada.
  El middleware no lo redirige (no está bajo `/admin`) y el rate limit de
  better-auth solo mira el login.
- El botón «Actualizar ahora» verifica la sesión adentro de la acción (ver
  §4) y no acepta parámetros.
- Lo que viaja y se guarda son agregados. No hay datos de personas.

## 9. Pruebas

- **Puras, con el runner de Node** (`node --test` vía `tsx`, sin dependencias
  nuevas): el mapeo de respuestas grabadas de la API a filas
  (`vercel.test.ts`), las ventanas y comparaciones de fechas
  (`periodos.test.ts`) y el cálculo de las tarjetas y listas
  (`consultas.test.ts`). Las respuestas grabadas viven en
  `src/lib/metricas/__fixtures__/` y se graban de la API real como primera
  tarea de la fase A.
- **La sincronización contra la base local** con un cliente falso de la API
  (inyectado): corre dos veces y deja las mismas filas; con el cliente
  fallando, deja la fila de error y nada más; con una corrida de hace menos
  de diez minutos, el botón no llama.
- **El cron:** en local, `curl -H "Authorization: Bearer <CRON_SECRET>"
  http://localhost:3000/api/cron/metricas` (y sin cabecera, 401); contra el
  deploy, `vercel crons run /api/cron/metricas` desde la CLI, y la fila que
  deja en `metricas_sincronizaciones`.
- **En producción, después del deploy:** activar Web Analytics, esperar un
  día, ver que el cron corrió (fila en `metricas_sincronizaciones`) y que el
  panel muestra números que coinciden con el dashboard de Vercel. Ese es el
  criterio de cierre de la lane.
- Gates de siempre en cada PR: `pnpm typecheck`, `pnpm lint`, react-doctor
  100/100, `pnpm build`.

## 10. Fases

| | Qué | Sale sola |
| --- | --- | --- |
| **A** | Grabar las respuestas reales de la API; `<Analytics />` y `_vercel` fuera del matcher; las tres tablas y su migración; el cliente, las fechas y la sincronización con sus pruebas; el cron y el botón con su freno; un panel mínimo con las cuatro tarjetas y los estados vacíos, como sección de la portada. | sí |
| **B** | La curva y las cuatro listas. | sí |
| **C** | Verificación en producción: analítica activada, variables cargadas, cron corrido, números en el panel que coinciden con Vercel. Cierre de docs: `src/admin/metricas/` y `lib/metricas/` en el árbol de AGENTS.md §3, las variables y el panel en el README. | sí, cierra la lane |

## 11. Fuera de alcance

Eventos propios (clics, descargas), hasta dónde scrollean, grabaciones,
embudos, Speed Insights, exportar a CSV, métricas por persona editora, y
cualquier dato que identifique a una persona.
