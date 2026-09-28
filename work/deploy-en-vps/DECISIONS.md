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
- 2026-09-27 — **El segundo factor se prueba con un Resend falso (opción 1).**
  En producción `mandar.ts` nunca manda un correo a la consola (a propósito), y
  el standalone fuerza `NODE_ENV=production`: sin Resend, dirige y administra
  no entran. El padre: «La 1, aprobada. Es la única forma de probar la imagen
  de producción de punta a punta, con el segundo factor incluido, antes del
  VPS real.» Condiciones: `RESEND_API_URL` es opcional y **no** va en el
  `.env.example` de producción, solo en `compose.prueba.yaml` («solo para la
  prueba local; en producción no se define»); si está definida y no es la de
  Resend, Ajustes › Conexiones lo dice en la fila de Resend («los correos van a
  <url>, no a Resend») y la app lo advierte en el log al arrancar, con su test;
  el servicio `correo` de prueba imprime el cuerpo y contesta como Resend; en
  el runbook, el primer paso con Resend real es mandar un correo de prueba
  antes de nombrar a quien dirige. Descartada: una variable que deje salir el
  correo por la consola en producción.
- 2026-09-27 — **El build no pasa por `.compilado/`: viaja como un tar.** En
  Docker Desktop, los symlinks de pnpm que escribe un contenedor Linux en una
  carpeta compartida con Windows no se pueden leer después («The file cannot be
  accessed by the system»), y el `docker build` de la imagen `app` falló. El
  servicio `construir` saca por stdout un tar con el Dockerfile y el
  standalone, y `desplegar.sh` lo pasa directo a `docker build -`. Cumple mejor
  la condición 3 del padre: no queda ninguna copia del build en el disco del
  host. Lo que se revisa por secretos es la imagen `app`.
- 2026-09-27 — **Una sola red en el compose.** El SPEC decía dos (`borde` e
  `interna`), pero `app` necesita salir a internet (Resend, Search Console,
  Crossref) y `proxy` también (ACME): una red `internal` no sirve para ninguna.
  Lo que protege es que solo `proxy` publica puertos.
- 2026-09-27 — **En el VPS se usa todo lo del VPS.** El padre, con la
  precisión de Mateo: «La base, las fotos y los CV en el disco del VPS y los
  backups ahí, sin servicios de afuera, salvo Resend para los mails.» Suma al
  runbook: tres capas de backup (el dump diario, los de Hostinger, una copia
  fuera del VPS: «Un backup que vive en el mismo disco que los datos no es un
  backup»), la memoria medida y el plan mínimo con su swap, y el disco estimado
  con qué hacer si se llena.
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
- 2026-09-27 — **Ronda de arreglos 1 (revisor r1, FAIL por dos Important y uno
  plausible).** Lo que se decidió al arreglar:
  - **El bit de ejecución lo cuida el `pre-push`.** Los siete `.sh` de
    `scripts/` y `deploy/` pasan a `100755`, y el hook frena si uno queda sin
    él: en Windows `core.fileMode=false` y un `.sh` nuevo entra con `100644`.
    Va en el hook y no en `pnpm test` porque es del repo, no de una app, y el
    hook es el gate que ya corre en cada push (AGENTS.md §5.8 sigue nombrando
    las tres de siempre: sumarle esta es un meta-doc, lo decide el padre).
  - **`restaurar.sh` termina con `desplegar.sh`, siempre.** Levantar `db` antes
    era el arreglo pedido; al probarlo apareció el resto: el sitio se
    prerenderiza leyendo la base, así que después de restaurar las páginas
    seguían mostrando lo de antes, y en un VPS nuevo no hay imagen que levantar.
    El deploy migra (si el respaldo es de antes de una migración), arma las
    páginas con la base restaurada y, en un VPS nuevo, es el primero. Si ya
    había imagen, el sitio vuelve con ella mientras se construye la nueva.
  - **Una sola regla para la fuente de visitas** (el padre: «Umami si están sus
    variables; si no, Vercel si corre en Vercel con sus variables; si no,
    ninguna»), en `fuenteDeVisitas`, y la usan el script, la copia y
    Conexiones. Consecuencias: las de Vercel fuera de Vercel ya no arman la
    copia (antes sí, con el token en un `.env.local`), y en Vercel con las de
    Umami el script es el de Umami, que ahí da 404. Eso último no se tapa con
    un rewrite (sin cuenta de Vercel no se puede probar, y la IP de las visitas
    llegaría de Vercel): Conexiones lo avisa en la fila de Umami y la guía de
    Vercel dice que ahí no van.
  - **Los nombres de imagen salen del proyecto del compose**
    (`<proyecto>-fuente`, `<proyecto>-sitio`; `ed` por defecto o
    `COMPOSE_PROJECT_NAME`). Los scripts leen el nombre con `docker compose
    config --no-interpolate`, que no imprime secretos ni pide las variables.
  - **SSH: un `sshd_config.d/00-ed.conf`** en lugar de editar solo
    `sshd_config`. En SSH gana el primer valor leído y el `Include` de
    `sshd_config.d/` está arriba, así que un `50-cloud-init.conf` con
    `PasswordAuthentication yes` le ganaba (probado en `ubuntu:24.04`); un
    archivo que se lee antes que todos lo arregla aunque cloud-init vuelva.
  - **`output: "standalone"` solo fuera de Vercel** (`next.config.ts`): Vercel
    arma su propia salida y no lo necesita, y así su build queda como estaba.
    Anotado también en el ADR-0018.
  - **La base `postgres` es solo del superusuario**: `crear-bases.sh` revoca el
    CONNECT de PUBLIC. Los respaldos (`dropdb`/`createdb` como `postgres`) la
    siguen usando.
  - **Quedan como están:** la imagen colgada si se redeploya el mismo commit (el
    runbook dice cómo podarla) y la entrada del VPS en el DECISIONS del padre
    (la sube el padre).
- 2026-09-27 — **Ronda de cierre (r2 en PASS): el script de Vercel no exige el
  token.** El padre: «El token y el proyecto sirven solo para la copia; Vercel
  cuenta las visitas sin ellos. Con la regla de hoy, si ED sale en Vercel antes
  de cargar el token, o en un Preview, no se cuenta ninguna visita, y eso no se
  recupera.» La regla queda en dos partes: **la copia y Conexiones**
  (`fuenteDeVisitas`), Umami con sus variables, si no Vercel en Vercel con el
  token y el proyecto, si no ninguna; **el script** (`scriptDeAnalitica`),
  Umami si la copia es de Umami, si no el de Vercel en Vercel sin exigir nada
  más, si no ninguno. En Vercel sin el token, la fila de Vercel Analytics de
  Conexiones dice que falta la copia pero que las visitas se están contando.
