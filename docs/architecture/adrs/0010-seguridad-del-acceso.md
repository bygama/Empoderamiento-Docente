# ADR-0010: Seguridad del acceso al admin

- **Status:** Accepted
- **Date:** 2026-09-26
- **Decision-makers:** Mateo (diseño aprobado en conversación el 2026-09-22)
- **Related:** [ADR-0005](0005-admin-a-medida.md) (el admin a medida),
  [ADR-0008](0008-correcciones-de-la-fase-1.md) (su §2, «el hasheo es scrypt»,
  queda reemplazado por este ADR)
- **Lane:** `work/seguridad-del-acceso/` (lane 2 del mapa del admin)

---

## Contexto

Un inventario del 2026-09-22 encontró seis agujeros en el acceso al admin:

1. **El reset de contraseña no mandaba correo.** El enlace salía por la consola
   del servidor; en producción habría terminado en los logs, que lee más gente
   que el buzón.
2. **El rate limit vivía en memoria.** En Vercel cada instancia lleva su propia
   cuenta: con diez instancias vivas, el tope de 3 intentos por minuto era de 30.
3. **No había bloqueo por cuenta.** El rate limit es por IP; un ataque
   repartido entre muchas IP contra una sola cuenta no chocaba con nada.
4. **Los tokens de los enlaces se guardaban en claro** en `verification`:
   quien leyera la tabla (un backup, un log de consultas) se llevaba enlaces
   que servían.
5. **La cookie de la vista previa no vencía** y viajaba con `SameSite=None`.
6. **El admin tenía `'unsafe-inline'` en `script-src`**, la misma CSP que el
   sitio estático.

Mateo pidió «las mejores prácticas de las mejores prácticas y lo más
escalable». Pesan también dos cosas del mapa del admin: invitar cuentas y el
segundo factor (lane 3) y los avisos de los formularios (lane 7) necesitan
correos, así que el cliente de correo nace acá.

## Decisión

**Se cierran los seis agujeros con piezas propias chicas sobre better-auth,
sin paquetes nuevos salvo `@node-rs/argon2`.**

1. **Correos por Resend, con `fetch` y sin su SDK**
   (`apps/sitio/src/lib/correo/resend.ts`): `Idempotency-Key`, 10 s por
   intento y un solo reintento con la misma clave, solo sin respuesta o con un
   5xx. Plantillas «Elegí tu contraseña» y «Tu contraseña cambió» en
   `apps/sitio/src/correos/`. **Salen en segundo plano** (`after()` de Next como
   `advanced.backgroundTasks.handler` de better-auth): si la respuesta esperara
   al envío, tardaría más cuando el correo existe y el tiempo lo delataría. Sin
   `RESEND_API_KEY`, en local el correo sale entero por la consola; en
   producción no sale, y el log lo dice **sin el enlace ni el destinatario**.
2. **El rate limit por IP, en la base** (`rateLimit.storage: "database"`, tabla
   `rateLimit`), con los topes de antes. Sale la regla de `/forget-password`,
   una ruta que better-auth 1.7 ya no tiene.
3. **Bloqueo por cuenta** (`packages/auth/src/bloqueo.ts`, tabla
   `bloqueos_de_acceso`): 5 fallos en 15 minutos frenan la cuenta 15 minutos,
   y el freno se duplica hasta 1 hora. Contesta **el mismo 429** que el rate
   limit, cuenta también los correos que no existen (si no, el freno diría
   cuáles existen), se destraba con un reset completo y se limpia al entrar
   bien. La fila guarda un **HMAC del correo** con el secreto de better-auth,
   nunca el correo; cada fallo se cuenta con la fila bloqueada
   (`SELECT … FOR UPDATE`) para que dos intentos simultáneos no se pisen. Tras
   un día sin fallos la escalera vuelve a empezar.
4. **Sesión y cookies:** 12 h sin uso, renovada cada hora de uso,
   `freshAge` de 10 minutos para lo delicado; elegir una contraseña nueva
   cierra todas las sesiones de la cuenta. **Las cookies son `SameSite=Strict`**:
   no viajan en nada que empiece en otro sitio, que es la defensa de CSRF que no
   depende de validar bien el origen. Como un link de un correo tampoco las
   lleva, **el proxy rebota esa navegación**: un `GET` de documento a una
   pantalla protegida, sin la cookie y con `Sec-Fetch-Site: cross-site`,
   recibe una página mínima con `<meta http-equiv="refresh">` a la misma URL
   (relativa, sacada del propio pedido y escapada) y un link «Seguir»; la
   segunda navegación ya es del mismo origen y lleva la cookie. `__Host-` no
   se puede: better-auth 1.7 siempre antepone `__Secure-`.
5. **Tokens hasheados:** `verification.storeIdentifier: "hashed"`.
6. **Argon2id** con los parámetros de OWASP (19 MiB, t=2, p=1), por
   `@node-rs/argon2`. Los hashes scrypt que dejó better-auth siguen
   verificando, y **el login los reemplaza** la primera vez que la persona
   entra, que es el único momento en que la contraseña llega en claro. Un
   Argon2id con otros parámetros también se rehashea, así que un cambio futuro
   de parámetros migra solo.
7. **CSP del admin con nonce y `'strict-dynamic'`**: un nonce nuevo por
   respuesta, que Next les pone a sus scripts; `'unsafe-eval'` solo en
   `next dev`; los estilos siguen con `'unsafe-inline'`. Todo el admin se
   renderiza por pedido (`connection()` en su layout raíz). En `/admin`,
   además, COOP y CORP `same-origin` y `X-Frame-Options: DENY`.
   `middleware.ts` pasa a `proxy.ts`, la convención de Next 16. **El sitio
   público sigue con su CSP estática**: un nonce lo obligaría a renderizar por
   pedido y le costaría el LCP.
8. **La cookie de la vista previa vence en una hora** y pasa a `SameSite=Lax`:
   se reescribe con el mismo valor después de `draftMode().enable()`.

## Consecuencias

### Positivas

- En producción ningún enlace ni token toca un log, y la tabla `verification`
  no guarda nada que sirva.
- El freno por IP es uno solo para todas las instancias, y un ataque repartido
  contra una cuenta choca con el bloqueo.
- Las contraseñas pasan a Argon2id sin pedirle a nadie que elija otra.
- Un script inyectado en el admin no corre, y el admin no se deja abrir en un
  iframe ni tocar desde una ventana de otro sitio.
- Las lanes que siguen reusan el cliente de correo y la forma de las
  plantillas; la invitación es «Elegí tu contraseña» con 72 h de vigencia.

### Negativas

- **El bloqueo se puede usar para molestar:** quien conozca un correo puede
  frenar esa cuenta hasta una hora fallando cinco veces.
- **Los enlaces de reset pedidos antes del deploy dejan de servir** (el token
  guardado pasa a ser un hash). Duran una hora.
- **Rotar `BETTER_AUTH_SECRET` borra, en la práctica, todos los bloqueos**: el
  HMAC cambia y las filas viejas no se vuelven a encontrar.
- **Una vuelta más** para quien abre el admin desde otro sitio sin cookie.
- **Todo el admin se renderiza por pedido**, también «entrar», que antes se
  podía prerenderizar.
- **Resend es un servicio externo** y los correos reales dependen de que ED
  configure su dominio.
- **Argon2 es un módulo nativo**, con un binario por plataforma; por eso
  `crearAuth` vive en `@ed/auth/servidor`, lejos de lo que importan el
  navegador y el proxy.
- Con COOP `same-origin`, la pestaña de la vista previa queda desconectada del
  admin al navegar al sitio: se abre igual, pero el admin ya no la puede
  tocar.

### Mitigaciones

- El freno de molestia tiene techo (1 hora), el rate limit por IP lo hace
  lento de sostener, y el reset de contraseña lo destraba al instante.
- La poda borra las filas quietas de `bloqueos_de_acceso`, así que un barrido
  de correos inventados no la hace crecer sin fin.
- **Lo que hace ED en Resend** (README, «Correos»): verificar el dominio con
  SPF, DKIM y DMARC, y **apagar el click tracking**, que reescribiría el enlace
  de la contraseña y lo pasaría por un tercero.

## Alternativas consideradas

### El SDK de Resend

- Qué hubiera implicado: una dependencia más por una sola llamada HTTP.
- Por qué se descarta: `fetch` hace lo mismo, se testea inyectándolo y no trae
  nada que actualizar.

### El rate limit en Redis (Upstash) o en el almacenamiento secundario de better-auth

- Qué hubiera implicado: un servicio más que operar y pagar.
- Por qué se descarta: tres personas usan el admin; Postgres alcanza con
  holgura y ya está.

### Mantener `SameSite=Lax`

- Qué hubiera implicado: nada que rebotar.
- Por qué se descarta: `Strict` suma una defensa de CSRF que no depende de que
  la validación de origen esté bien; el costo es la vuelta del rebote.

### Recuperar la sesión desde «entrar», con un `fetch` al cargar

- Qué hubiera implicado: que el formulario preguntara por la sesión y siguiera
  a `volver`.
- Por qué se descarta: react-doctor frena las dos formas de redirigir desde el
  cliente (`router.replace` en un efecto; un estado que no se muestra para
  hacer `redirect()` en el render), y el rebote en el proxy es mejor: cubre
  cualquier link al admin, no muestra el formulario ni un instante y no
  necesita JS.

### `crypto.argon2` de Node, o bcrypt

- Qué hubiera implicado: cero dependencias (Node) o una más conocida (bcrypt).
- Por qué se descartan: `crypto.argon2` es experimental desde Node 24.7 y
  `engines` admite Node 22, que no lo tiene; tampoco arma ni lee el formato
  PHC. bcrypt no es la primera opción de OWASP y corta la contraseña a 72
  bytes.

### Hashes en la CSP en vez de un nonce, o un nonce también en el sitio

- Qué hubiera implicado: listar el hash de cada script en línea, o renderizar
  el sitio por pedido.
- Por qué se descartan: los scripts en línea de Next cambian con cada
  respuesta, así que no hay hashes fijos que listar; y el sitio es estático a
  propósito.

## Referencias

- OWASP, *Password Storage Cheat Sheet* (Argon2id, m=19 MiB, t=2, p=1).
- OWASP, *Authentication Cheat Sheet* (bloqueo de cuenta y respuestas
  genéricas).
- Next.js 16, *Content Security Policy* (nonce desde el proxy) y la
  convención `proxy`.
- W3C, *Fetch Metadata Request Headers* (`Sec-Fetch-Site`).
- better-auth 1.7.5: `rateLimit.storage`, `verification.storeIdentifier`,
  `advanced.backgroundTasks`, `advanced.defaultCookieAttributes`.
- `work/seguridad-del-acceso/` (SPEC, DECISIONS, PROGRESS).
