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

**2026-09-18 — Las clases del admin se filtran al CSS del sitio público, y se
deja anotado en vez de taparlo.**
`comparar-render.mjs` lo detectó en su primer uso real: cada página pública pesa
**+4103 bytes**, que son +2880 de CSS (contado dos veces, como preload y como
hoja) y +1223 de JS del runtime, por el segundo layout raíz. El CSS creció
porque Tailwind arma **una sola hoja para los dos route groups**, así que
`min-h-dvh`, `max-w-md`, `max-w-prose` y compañía —que solo usa el admin— viajan
a `/`. Hoy es 1,4 KB sobre 174 KB: menos del 1%, no vale partir la hoja por eso.
**Pero crece con cada pantalla del admin**, y las fases 2 y 3 traen muchas. El
umbral para actuar: si el CSS del sitio sube más de un 5% respecto de `6d72bc0`,
se parte la hoja por route group. Se mide con este mismo script, que ahora
informa bytes justamente para esto.

**2026-09-18 — `comparar-render.mjs` ya no falla porque aparezca una página.**
Frenaba ante cualquier diferencia de lista, y eso lo volvía inservible como gate
en toda fase que sume pantallas — o sea todas. Ahora una página que DESAPARECE
sigue siendo una regresión y frena; una que aparece se informa y no frena.

---

## Rulings del fix loop (review de cierre, ronda 1)

**2026-09-18 — La guarda de `db push` se colaba, y era la falla que existe para
impedir.** Lo encontró el seat de silent failures: filtrar los tokens que
empiezan con `-` y mirar los dos primeros no alcanza, porque un flag con valor
separado deja su valor en la lista. `--schema ./x db push` hacía que el primer
«verbo» fuera `./x` y **el comando corría**. No era el `--no-verify` aceptado:
era el script envuelto fallando en silencio ante una invocación normal. Ahora se
busca `db` y `push` como tokens sueltos en ese orden, en cualquier posición.
Bloquea de más en un caso imaginable, y ante un comando que cambia la base sin
dejar migración el error que conviene es el que frena.

**2026-09-18 — El comparador sí medía el CSS; el nombre mentía.**
El seat de correctness concluyó que `comparar-render.mjs` no medía CSS y que por
lo tanto el umbral del 5% no se podía verificar. Media razón: la función se
llamaba `js()` y rotulaba «js chunks», pero su regex cubre todo lo que cuelga de
`static/chunks/`, **CSS incluido** —por eso el +4103 incluía los +2880 de CSS—.
El defecto era el nombre, y alcanzó para que un lector cuidadoso concluyera que
la herramienta no existía. Renombrado a `activos`, y el rótulo dice «js+css».

**2026-09-18 — El SPEC había dejado caer dos promesas de seguridad en silencio,
y eso se corrige diciéndolas.** El seat de correctness verificó que la enmienda
anterior de este archivo borró «rotación de sesión al login» y «tokens de reset
hasheados en reposo» sin mencionarlo, y que **ninguna de las dos está
entregada**: no hay código de rotación, y `verification.identifier` guarda el
token en claro (comprobado contra la base; el replay devuelve `INVALID_TOKEN`,
así que el uso único sí está). Ahora el SPEC §4 lista las tres cosas que
prometía y no entrega, con lo que acota cada una. Enmendar un SPEC para reportar
es correcto; enmendarlo para que deje de pedir lo que no se hizo, no.

**2026-09-18 — `RESEND_API_KEY` y `BLOB_READ_WRITE_TOKEN` están declaradas pero
no conectadas.** El seat de documentación notó que el README implicaba
comportamiento condicional —«sin clave sale por consola»— cuando el código no
lee esas variables en ningún lado: el enlace sale por consola **siempre**.
Corregido en el README y en `.env.example`; ponerlas hoy no cambia nada.

**2026-09-18 — El doble cast de `ROLES` era un bug con dos síntomas.**
`ROLES as unknown as string[]` apagaba toda la verificación, y por eso el layout
necesitaba su propio cast para leer `rol`. `[...ROLES]` satisface el
`DBFieldType` de better-auth sin aserción, y con eso el tipo llega hasta
`sesion.user.rol` — comprobado con un probe: pasa de «no existe» a
`string | null | undefined`. Los dos casts se fueron.

**2026-09-18 — El largo mínimo de contraseña vive en `@ed/auth`.**
Estaba duplicado a mano entre la config y el formulario. Peor que la
duplicación: si la política subía, el formulario habría seguido validando con el
número viejo y su error genérico habría reportado «ese enlace ya no sirve» ante
un rechazo por largo. Ahora se exporta y se importa.

**2026-09-18 — `ClienteDeBase` no restringe nada, y queda dicho.**
Se deriva de `Parameters<typeof prismaAdapter>[0]`, que en better-auth es
`interface PrismaClient {}` — una interfaz vacía que acepta cualquier valor no
nulo. El comentario decía que era el contrato de la frontera y no lo es. Es una
debilidad de tipado de la librería, no de esta lane, pero el comentario se
corrige para no prometer una verificación que no ocurre.

## Ronda 2 del fix loop

**2026-09-18 — La guarda se colaba OTRA VEZ, por un agujero distinto.**
El re-review encontró que `node scripts/guarda-prisma.mjs "db push"` —un solo
argumento con un espacio adentro— pasaba. El chequeo veía un token; después
`spawnSync` con `shell: true` en Windows pega los argumentos con espacios y
`cmd.exe` los vuelve a separar, así que Prisma recibía `db push` y lo ejecutaba,
con exit 0 y sin aviso. Reproducido también desde PowerShell.

La lección, escrita en el archivo: **el chequeo tiene que mirar los mismos
tokens que va a ver Prisma.** Ahora se parte todo por espacios antes de buscar,
que es lo que hace el shell. Dos versiones de esta función se colaron por
romper esa regla.

**2026-09-18 — `db pull` también se bloquea, y el motivo lo encontré
rompiéndolo.** Corrí `db pull` como prueba de que la guarda no bloqueaba de más.
Introspecciona la base y **sobrescribe el esquema**: se llevó puestos todos los
comentarios `//` de los tres archivos —conserva los `///` de doc, no los que
explican por qué—. Se recuperó de git, que es la única razón por la que no costó
nada. En un repo donde el esquema es la fuente de verdad, `db pull` va en la
dirección contraria, así que queda bloqueado con su propio mensaje.

## Ronda 3 del fix loop

**2026-09-18 — La causa raíz era `shell: true`, y estuve tres versiones
parcheando el síntoma.** El re-review rompió la versión 3 por cuatro caminos, y
el cuarto no era sobre `db push`: `generate & echo INYECTADO` ejecutaba **un
comando arbitrario**. Con `shell: true` en Windows, Node pega los argumentos en
una línea y `cmd.exe` la vuelve a partir; eso expande `%VAR%` del entorno, se
come los `^` de escape y trata `&` como separador. Ningún chequeo de tokens
podía ganarle: el chequeo miraba una lista y el shell armaba otra.

**Se invoca a Prisma sin shell**, con `process.execPath` contra su entry de
JavaScript. Node pasa el arreglo al proceso hijo tal cual y la guarda ve
exactamente lo que ve Prisma. Los cuatro bypasses mueren juntos, y el de
inyección se verificó: el comando inyectado se ejecutó **0 veces**.

La lección, que vale más que el archivo: **cuando tres arreglos seguidos fallan
por razones distintas, el problema no es el chequeo.**

**2026-09-18 — El aviso de `format` dice lo que medí, no lo que me contaron.**
El seat reportó que `prisma format` borra comentarios sueltos. Lo corrí contra
este esquema con Prisma 7.10 y **no los borró**: git quedó limpio y las
cabeceras siguen. Así que el aviso no afirma que los borre; avisa que reimprime
los archivos enteros y que conviene mirar el diff. Repetir la observación de
otro como hecho propio es la misma falla que esta review vino encontrando.
