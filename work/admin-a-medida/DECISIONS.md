# DECISIONS — El admin a medida

Append-only: fecha — decisión — por qué.

---

**2026-09-18 — Payload sale; el admin se hace a medida.**
Decisión del owner. El ADR-0003 y la spec del panel dejan de describir el plan.
Se conservan Neon, Vercel Blob y Resend: lo que cambia es la capa de arriba.
Se registra en el ADR-0005.

**2026-09-18 — Se hace ahora y no después.**
Medido sobre `d452e61`: un solo archivo fuera de `cms/` y `(payload)/` importa
Payload, `src/contenido/` nunca se escribió y no hay datos de producción. Cada
fase que avanzara (novedades, materiales, casos, equipo) encarecía la escisión,
porque recién ahí los componentes cambiaban de fuente de datos.

**2026-09-18 — Prisma 7.10.0 exacta, no `^`.**
El tag `latest` de npm resuelve hoy a `8.0.0-rc.15`: pusieron un release
candidate en `latest`, y el último estable (`7.10.0`, del 2026-08-25) está en el
tag `prev`. Sin la versión exacta, un `pnpm install` limpio trae un RC.

**2026-09-18 — better-auth para la sesión, el resto a mano.**
La línea es la que traza cualquier empresa grande: la capa de identidad se
adopta, la autorización de negocio y la UI del admin se construyen. Hashing,
rotación de sesión y tokens de reset son el único lugar donde un bug propio es
una brecha y no un bug. better-auth se autohospeda sobre la misma base, así que
no suma un proveedor. Su telemetría viene apagada por defecto
(`telemetry.enabled` → `false`); igual se fija explícita.

**2026-09-18 — Sin meta-capa de configuración para los formularios.**
Nada de un objeto que un renderizador genérico traduce a formulario: ese es el
modelo de Payload, de Strapi y del admin de Django, y es exactamente cómo se
termina reescribiendo Payload. Cada entidad escribe su formulario usando los
primitivos de `packages/kit-admin`.

**2026-09-18 — Se abandona el vocabulario de Payload.**
No hay «colecciones», «globals» ni `CollectionConfig`. Es Postgres relacional,
no una base documental: hay tablas, columnas y controles. `cms/` pasa a
`datos/`, `acceso.ts` a `permisos.ts`.

**2026-09-18 — `packages/` desde ahora, contra la letra del ADR-0004.**
El ADR-0004 dice que `packages/` aparece recién con un segundo consumidor. El
requisito del owner —que el kit sirva en sus proyectos futuros— cambia esa
premisa. Se registra en el ADR-0006 en vez de dejarlo implícito. El deployable
sigue siendo uno solo: partir la app no agrega reutilización.

**2026-09-18 — La vista previa se borra en la fase 0 y renace en la fase 2.**
Su validación anti-open-redirect está bien hecha (cubre el caso `//evil`), pero
dejarla en el árbol sin sesión que la respalde sería un stopgap. Se borra, y el
punto de partida para reescribirla es `rutaDelSitio()` en
`apps/sitio/src/app/(sitio)/vista-previa/route.ts` **en el commit `d452e61`**.

**2026-09-18 — El secreto de la vista previa deja de viajar en el query string.**
Hoy va en la URL, así que queda en los logs de Vercel y en el `Referer`, y no
expira. Pasa a cookie firmada de un solo uso con expiración.

**2026-09-18 — Los 63 materiales no llevan ficha propia.**
Cada uno ya tiene su URL canónica en la revista o editorial que lo publicó
(`accionDe()` lo dice: «Leer en {fuente}»). Una ficha nuestra sería contenido
delgado y duplicado. Los 4 casos y los 15 perfiles sí la llevan: son originales
de ED y no existen en ningún otro lado.

**2026-09-18 — El slug es una columna, no se deriva del título.**
Y cuando cambia, una tabla de redirecciones escribe el 308 del viejo al nuevo.
Sin eso, corregir una coma en un título rompe un link en LinkedIn o en un paper.

**2026-09-18 — Afuera: versiones, autoguardado y bloqueo concurrente.**
Son cerca de un tercio del trabajo. Con tres editoras y los backups de Neon no
compran lo que cuestan. Se pueden sumar después; el owner lo revisó y lo
confirmó.

**2026-09-18 — Esta lane es la fase 0 sola.**
Las cinco fases del SPEC mergean por separado, y un PR que abre a mitad de lane
significa que la lane termina ahí. Las fases 1 a 4 abren su propia lane contra
este mismo SPEC.

**2026-09-18 — Se copia la guarda de `prisma db push`.**
`push` crea tablas sin generar el archivo de migración, y el síntoma aparece
recién en producción como «la tabla no existe». `scripts/guarda-prisma.mjs`
la bloquea con exit 1, en la fase 1.

---

## Rulings tomados durante la ejecución de la fase 0

**2026-09-18 — `[...resto]/page.tsx` se queda; su comentario cambia.**
El archivo existía porque Payload creaba un segundo layout raíz. El admin de la
fase 1 vuelve a crear uno, así que borrarlo y reponerlo sería churn. Pero su
comentario nombraba «el panel», que ya no está en el repo: se reescribe para
que sea verdadero en los dos estados. El motivo real es que la 404 vive dentro
del route group `(sitio)`, no en la raíz de `app/`.

**2026-09-18 — `DATABASE_URL_UNPOOLED` se queda en `.env.example`.**
Su comentario decía «la usa `payload migrate`». La conexión directa la necesita
cualquier herramienta de migración, Prisma incluida, porque el pooler corta las
transacciones largas. Se reescribe el comentario y se conserva la variable.

**2026-09-18 — `.env.example` conserva las variables de Neon, Blob y Resend.**
Hoy el sitio no necesita ninguna, pero su infraestructura sigue decidida
(ADR-0003 en lo que no fue reemplazado). Se marcan como «la infraestructura del
admin, que llega en la fase 1» en vez de borrarlas y reponerlas.

**2026-09-18 — `robots.txt` no se toca.**
Sigue con `disallow` de `/admin`, `/api/` y `/vista-previa` aunque las tres
rutas ya no existan: las tres vuelven en las fases 1 y 2.

**2026-09-18 — La aceptación del paso 5 estaba escrita demasiado literal.**
Pedía que `grep -ril payload` sobre `AGENTS.md`, `README.md` y `docs/` devolviera
solo los ADRs 0002 y 0003. Quedan cinco menciones en `AGENTS.md` y son
deliberadas: explican por qué ya no hay código generado en `src/` (§5.8), la
regla de no reconstruir Payload con una meta-capa (§12) y el estado de la fase 0
(§13). El criterio real es **que nada describa a Payload como el plan vigente**,
y eso se cumple. Borrar prosa útil para satisfacer un grep habría sido peor.

**2026-09-18 — Borrar la spec vieja dejó cinco links colgados, y se reparan.**
En el ADR-0003 (×2), el ADR-0004 (×2) y la spec del monorepo (×1). Los ADRs son
inmutables **en su decisión**; reparar una referencia muerta no cambia ninguna.
Se deja dicho en cada lugar que el archivo se borró, quién lo borró y dónde está
lo que lo reemplaza; el original vive en el historial de git. Dejar los links
rotos habría contradicho al commit `d452e61`, que es justamente «que ningún
comentario apunte a algo que ya no está».

**2026-09-18 — El árbol de `AGENTS.md` §3 muestra el destino, marcado por fase.**
Un contrato que describe solo el presente no sirve para contestar «dónde va este
archivo», y uno que describe solo el futuro miente. Las marcas «fase N»
distinguen lo que existe de lo que está planificado.

---

## Rulings del fix loop (review de cierre, ronda 1)

**2026-09-18 — El barrido de staleness miró markdown y se olvidó del código y
de la config.** Lo levantó el seat de documentation impact, y tenía razón dos
veces: `apps/sitio/src/app/robots.ts:3` citaba «spec §6» de la spec borrada, y
`.gitattributes` fijaba en LF `apps/sitio/src/payload-types.ts`, un archivo que
ya no existe, con cuatro líneas explicando un problema imposible. Los dos
arreglados. El método falló, no la ejecución: el grep de verificación recorría
`*.md` y la config de la app, y ninguno de los dos archivos entraba.

**2026-09-18 — La spec del monorepo se marca, no se borra.**
El seat señaló que borré la spec del panel por quedar falsa y no apliqué el
mismo criterio a su hermana. La diferencia que justifica el trato distinto: la
del panel describía una decisión **revertida**; la del monorepo describe una
decisión **vigente** (ADR-0004, una sola app, el gate multi-proyecto) cuyo árbol
ilustrativo quedó viejo. Borrarla perdería el razonamiento de una decisión que
sigue en pie. Lleva ahora un recuadro que dice qué sigue valiendo y qué está
superado, y su §1 pasa a pasado con una nota de tiempo verbal.

**2026-09-18 — `AGENTS.md` §12 estaba en presente para cosas que no existen.**
El §3 marcaba «(fase N)» en cada path y el §12, cuarenta líneas después, hablaba
de `datos/`, del middleware y de la guarda de Prisma como si estuvieran. Ahora
lleva el mismo aviso: son el contrato al que tiene que ajustarse quien lo
construya, no una descripción de lo que hay.

**2026-09-18 — Eran 11 páginas prerenderizadas, no 10.**
La que faltaba es `_global-error.html`, y el seat la detectó por la deriva entre
el «9 rutas» del PLAN y el «10 páginas» de PROGRESS. Comparada: idéntica salvo
los IDs de módulo del payload de React, que cambian entre builds igual que el
`BUILD_ID`. El número correcto es 11 y así queda en `AGENTS.md` §13.

**2026-09-18 — «Entran 5» era «entran 6».**
Se enumeraban seis paquetes y se decía cinco, en el SPEC y en el ADR-0005.
Corregido en los dos. La afirmación de fondo cambia: **salen 7 y entran 6**, así
que el repo queda con **una** dependencia menos, no dos.

**2026-09-18 — Los 10 archivos del grep, juzgados uno por uno.**
El seat objetó que `DECISIONS.md` justificaba solo el subconjunto de
`AGENTS.md`. Los diez: `docs/AI_GUIDELINES.md:171` es un **falso positivo**
(«payloads de API», la palabra inglesa para el cuerpo de un request); los ADRs
0002, 0003 y 0004 son historia y su contexto no se reescribe; los ADRs 0005 y
0007 y el índice nombran a Payload porque documentan su salida; la spec del
monorepo es legítima recién ahora que lleva el recuadro; la spec del admin
nombra lo que reemplaza. Ninguno describe a Payload como el plan vigente.
