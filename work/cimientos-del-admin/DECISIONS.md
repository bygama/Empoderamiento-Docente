# DECISIONS — Fase 1: los cimientos del admin

Append-only: fecha — decisión — por qué.

---

**2026-09-18 — Esta lane corre en una rama del checkout principal, sin worktree.**
El criterio de aislamiento de AE pide worktree para tier L por horizonte, y el
primer intento de esta lane lo usó. **El worktree desapareció a mitad de
trabajo**: quedó reducido a una cáscara con solo `node_modules`, y con él se
fueron los cuatro archivos de la lane y `packages/db` entero, todo sin
commitear. El criterio asume que el worktree es estable y acá se probó que no
—hay otras sesiones operando sobre el mismo repo—, así que se corre sobre el
`.git` que sí sobrevivió intacto. No se perdió nada versionado: la fase 0 ya
estaba mergeada y pusheada.

**2026-09-18 — Se commitea cada paso apenas pasa su aceptación.**
Consecuencia directa de lo anterior: lo que se perdió, se perdió por estar sin
commitear, no por el borrado. Acumular nueve pasos de trabajo en el árbol es
apostar a que nada externo lo toque.

**2026-09-18 — Para JSON se edita a mano, no con `node`.**
Reescribir `apps/sitio/package.json` con `fs.writeFileSync` desde `node -e` lo
dejó ilegible en el primer intento, y el síntoma apareció recién dos comandos
después como «No package.json found». El repo ya tenía anotada la maña de CRLF
para `perl`/`node`; vale igual para JSON, y ahí no hay excusa porque el archivo
es chico.

**2026-09-18 — `prisma@7.10.0` exacta, revalidado el mismo día de instalarlo.**
La review de la fase 0 dejó anotado que la medición del ADR-0007 podía
envejecer. Chequeado contra el registry antes de abrir la lane: `latest` sigue
resolviendo a `8.0.0-rc.15` y el estable `7.10.0` sigue en el tag `prev`. La
decisión se mantiene sin cambios.

**2026-09-18 — `packages/kit-admin` NO nace en esta fase.**
El ADR-0006 lo lista entre los tres packages, pero diseñar primitivos de UI sin
una entidad real que los use es exactamente la abstracción especulativa que el
ADR-0004 quería evitar. Nace en la fase 2, contra novedades, que es la entidad
que más cambia. Esta fase entrega `db` y `auth`, que sí tienen consumidor
inmediato.

**2026-09-18 — `packages/db` no importa el cliente generado de Prisma.**
Ese cliente se genera del esquema de la app, y conocerlo sería saber del
dominio de ED: rompe la primera frontera. El paquete exporta la lógica de
conexión (pool contra directa), el adaptador de Neon y los helpers de slug; la
app construye su `PrismaClient` y le pasa el adaptador. De paso resuelve la
resolución del cliente generado entre paquetes de pnpm, que por el otro camino
obliga a rutas cruzadas feas.

**2026-09-18 — Se crea la base `ed` y NO se toca `ed_panel`.**
El `.env.example` y el README de la fase 0 apuntan a una base `ed` que no
existe: el contenedor tiene `ed_panel`, con las 9 tablas que dejó Payload.
Se reconcilia creando `ed`. `ed_panel` queda huérfana y se deja dicho en el
README: borrar una base es destructivo y es decisión del owner, no de esta lane.

---

## Rulings tomados durante la ejecución

**2026-09-18 — El adaptador es el de Postgres, no el de Neon.**
Estaba mal elegido de entrada. El driver serverless de Neon habla por WebSocket
y existe para runtimes Edge, donde no hay TCP; contra el Postgres de Docker
falla con un `ErrorEvent` **sin mensaje**, que no dice nada de lo que pasó. Neon
acepta el protocolo Postgres de siempre —es lo que usa `psql`— y el admin corre
en Node, así que `@prisma/adapter-pg` sirve igual de los dos lados y hace que lo
local ande. Cambia una dependencia de la lista que aprobó el owner: entra
`@prisma/adapter-pg` donde iba `@prisma/adapter-neon`.

**2026-09-18 — El hasheo queda en scrypt, no en Argon2id.**
El SPEC decía Argon2id. better-auth trae scrypt y pasar a Argon2id exige sumar
`@node-rs/argon2`, que no está en la lista aprobada. Scrypt está en la lista
aceptable de OWASP. Se implementó con el default y **se corrigió el SPEC** para
que no prometa lo que no entrega: el upgrade es un `password.hash` y una
dependencia, y queda a decisión del owner.

**2026-09-18 — El esquema de auth se escribió a mano y se probó contra la base.**
El CLI de better-auth quedó congelado en la 1.4.21 de marzo contra la 1.7.5
instalada, y ahí `Account` todavía no tenía `issuer`. Generar con él habría
metido un esquema de seis minors atrás. Se escribió desde la definición de la
versión instalada y se verificó de verdad: alta, login, rol por defecto, sesión
escrita, contraseña mala y usuario inexistente con el mismo 401.

**2026-09-18 — `issuer` lleva default en la base.**
better-auth **no lo escribe** en cuentas de credencial, comprobado: lo descarta
antes de llegar a Prisma aunque se lo pase explícito. Sin default, dar de alta a
alguien con contraseña revienta. Default en vez de nullable para no aflojar el
`@@unique`: en Postgres dos NULL no chocan.

**2026-09-18 — Los formularios van por HTTP, no por Server Actions.**
Descubierto al probar el rate limit: el límite vive en el handler HTTP de
better-auth, y las llamadas `auth.api.*` desde el servidor lo saltean por
diseño, porque para better-auth son código propio y confiable. Una Server Action
para el login hubiera dejado el límite sin efecto **sin que nada fallara**. Está
escrito en `packages/auth/src/cliente.ts` para que nadie lo "simplifique".

**2026-09-18 — El rate limit cubre IP, no cuenta.**
La regla de better-auth es por IP y por ruta: tres intentos por minuto en
sign-in. Eso cierra la enumeración de usuarios, que era el hallazgo. **No cubre**
un ataque repartido entre muchas IPs contra una sola cuenta: el bloqueo por
cuenta que traía Payload no está en better-auth y sería trabajo propio. Queda
dicho acá en vez de darse por cubierto.

**2026-09-18 — La guarda del middleware es un filtro, no la verificación.**
El middleware corre en Edge y no puede consultar la base, así que solo mira que
la cookie esté. La verificación de verdad la hace el layout de `(protegido)`
contra la base. Se nombró `hayCookieDeSesion` y no `haySesion` a propósito:
llamarla «la guarda» a secas sería mentir sobre lo que protege.

**2026-09-18 — El `volver` del login acepta solo rutas de `/admin`.**
Llega por la URL, así que no se confía en él: sin ese chequeo, un enlace a
`/admin/entrar?volver=https://malicioso.example` convierte el login en un
redirect abierto.

**2026-09-18 — La CSP del sitio lleva `'unsafe-inline'` en `script-src`.**
Lo estricto sería un nonce por respuesta, y un nonce distinto en cada request
obliga a renderizar dinámico, que es justo lo que el sitio público no es. El
sitio no renderiza input de nadie ni carga scripts de terceros. La función ya
está partida para darle nonce solo al admin cuando tenga pantallas con datos.
