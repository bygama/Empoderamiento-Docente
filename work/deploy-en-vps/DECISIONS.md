# DECISIONS — deploy-en-vps

- 2026-09-27 — **El build se hace adentro del compose (opción A).** El padre,
  por `orca orchestration ask`: «A, aprobada. Mantiene `db` y `analitica` sin
  puertos, anda igual en Docker Desktop que en el VPS, y el tag por commit te
  da la vuelta atrás. Lo de `B` ata la verificación local al networking de
  host, que en Docker Desktop no es confiable.»
  - **Por qué el build necesita la base:** el sitio público se prerenderiza en
    `next build` leyendo el contenido publicado (`leerSinRomper`). Sin
    `DATABASE_URL` hornea el contenido inicial —novedades, materiales, equipo,
    casos y aliados salen vacíos, porque sus filas entraron por migración— hasta
    el próximo publicar; con la URL pero sin conexión, el build falla a
    propósito. En Vercel el `buildCommand` tenía la base a mano.
  - **Por qué no un `docker build` común:** probado el 2026-09-27 con Docker
    29.6.2 / buildx 0.35: `docker build --network <red>` → «network mode … not
    supported by buildkit»; un builder `docker-container` con `--driver-opt
    network=<red>` corre, pero el `RUN` no resuelve el nombre del servicio.
  - **Descartadas:** B (publicar `db` en 127.0.0.1 y construir con `network:
    host`: rompe «db sin puertos» y el networking de host no es confiable en
    Docker Desktop), C (construir sin base y revalidar al arrancar: depende de
    la semántica de ISR y deja el contenido inicial visible después de cada
    deploy), D (`next build` al arrancar `app`: minutos de corte por deploy e
    imagen con dependencias de desarrollo).
  - **Condiciones del padre:** (1) `scripts/desplegar.sh` es la única entrada,
    con `set -euo pipefail`, idempotente, y frena en el primer paso que falla
    sin tocar el `app` que corre; el runbook y el README dicen que `docker
    compose up` a secas no arranca desde cero y por qué. (2) Las últimas N
    imágenes de `app` con su tag de commit y `scripts/volver.sh <tag>`; el
    runbook explica que una migración aplicada no se revierte. (3) Ningún
    secreto en la imagen ni en `.compilado/`, verificado con `grep` y con la
    salida en PROGRESS; `.compilado` en `.gitignore` y en el `.dockerignore` de
    la imagen fuente. (4) Los segundos de corte de un deploy, medidos en local,
    en PROGRESS. (5) Esto, en este archivo y en el ADR nuevo.
- 2026-09-27 — **«Código para los dos».** El padre aprobó el SPEC con un cambio
  de alcance que decidió Mateo: «el código queda listo para los dos hosts,
  Vercel y el VPS, y se elige por variables de entorno. Todavía no está
  decidido dónde se publica primero, y mudarse después tiene que ser solo mover
  datos, sin tocar código.» Por eso `vercel.json` y `@vercel/analytics` se
  quedan; el layout carga un solo script de analítica (Vercel en Vercel, Umami
  fuera de Vercel con su variable, ninguno si no), con un test de las
  combinaciones; la copia elige su cliente por variables; fotos y CV siguen
  «Blob si hay token, disco si no»; el ADR pasa a llamarse «Deploy en Vercel o
  en un VPS: el código no depende del host»; README y runbook cuentan los dos
  caminos y la mudanza. El filtro de tipo propio, aprobado.
- 2026-09-27 — **El script de mudanza de archivos queda afuera.** Copiar fotos
  entre Blob y disco cambia su URL (hay que reescribir cada uso con el registro
  de `datos/fotos/`) y los CV se copian con la misma clave. No hay token de
  Blob en este worktree, así que no se puede probar: se escribe el
  procedimiento y se anota el script como seguimiento (el padre lo dejó a
  criterio: «si no entra en la lane, anotalo»).
- 2026-09-27 — **N = 5 imágenes de `app` guardadas.** Una imagen standalone pesa
  del orden de 200-300 MB; cinco entran holgadas en el disco de un VPS chico y
  cubren una semana de deploys diarios.
- 2026-09-27 — **Umami se sirve a medias desde el dominio.** Caddy publica solo
  `/umami/script.js` y `/umami/api/send`; el panel, el login y la API de Umami
  no salen a internet y se usan por un túnel SSH. La app habla con la API por la
  red interna (`http://analitica:3000`) con una API key.
- 2026-09-27 — **El filtro de la copia deja de ser OData.** `porDia` recibía un
  string con sintaxis de Vercel (`country eq 'CL'`); pasa a `FiltroDePais` y
  cada cliente lo traduce. Los dos métodos de `ClienteDeAnaliticas` no cambian.
- 2026-09-27 — **La tarea `metricas-de-vercel` pasa a `copia-de-visitas`.** No
  hay producción con historial en `corridas_de_tareas`, y el nombre deja de
  depender de la fuente.
- 2026-09-27 — **Retención de respaldos: 14 días**, en una carpeta del host.
