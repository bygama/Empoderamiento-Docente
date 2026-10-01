# ADR-0019: Endurecer el acceso: cerrar el acceso entero, pedir la contraseña otra vez y topar sesiones y códigos

- **Status:** Accepted
- **Date:** 2026-09-30
- **Decision-makers:** Mateo (aprobó las correcciones el 2026-09-30, después
  de una revisión de solo lectura del acceso al admin)
- **Enmienda:** [ADR-0010](0010-seguridad-del-acceso.md), en la sesión (su
  §4), la IP de los cupos y lo que borra un reset;
  [ADR-0013](0013-segundo-factor-por-correo.md), en los intentos del código
  (su §1 y la consecuencia de que el bloqueo del plugin no aplica);
  [ADR-0018](0018-deploy-en-vercel-o-en-un-vps.md), en qué cabecera de IP lee
  la app (su §6)

---

## Contexto

Una revisión del acceso al admin del 2026-09-30 encontró lugares donde una
credencial que ya no debería servir seguía sirviendo, o donde un freno se
podía rodear:

1. Cambiar un correo, cerrar las sesiones de una cuenta, suspenderla o elegir
   una contraseña nueva borraban las sesiones, pero no lo que better-auth
   guarda de la cuenta en `verification`: los enlaces pendientes para elegir
   la contraseña y los dispositivos recordados del segundo factor.
2. Cambiar un correo, invitar a alguien como administra o subir una cuenta a
   ese rol se hacían con la sesión sola. Pasar la dirección ya pedía la
   contraseña; estas reparten o recuperan acceso igual.
3. Los cupos por IP tomaban la IP de más a la izquierda de
   `X-Forwarded-For`, que según quién esté delante escribe el cliente.
4. Cada código nuevo del segundo factor traía sus propios 5 intentos, y el
   bloqueo por cuenta del plugin no aplica (su tabla `twoFactor` está vacía,
   ADR-0013).
5. Una sesión se renovaba con el uso sin tope: usada seguido, no vencía nunca.
6. Se podía elegir una contraseña de las que circulan en filtraciones.

Pesan dos cosas: el repo es público, así que la regla tiene que estar escrita
sin receta; y el VPS va a tener Cloudflare delante, con Caddy pisando
`X-Real-IP` y `X-Forwarded-For` con la IP real del cliente.

## Decisión

**Siete reglas, cada una donde ya vivía la anterior, sin tablas ni paquetes
nuevos.**

1. **Cerrar el acceso de una cuenta es cerrarlo entero.** Cambiarle el correo,
   cerrarle las sesiones o suspenderla (`cerrarElAcceso`, sobre-cuentas.ts),
   y elegir o cambiar la contraseña (`borrarEnlaces`, una opción de
   `crearAuth`), borran sus sesiones —salvo la de quien cambia su propio
   correo— **y** todo lo suyo en `verification`: enlaces pendientes (también
   la invitación) y dispositivos recordados. Al cambiar la contraseña, esa
   limpieza va después del registro y del aviso «Tu contraseña cambió», y si
   la base falla ahí queda en el log: no frena el cierre de las sesiones que
   hace better-auth ni el aviso.
2. **Lo que reparte o recupera acceso pide otra vez la contraseña** de quien lo
   hace (`pedirTuContrasena`): cambiar cualquier correo, porque el correo es lo
   que recupera una cuenta (ADR-0013 §6); dar un rol que maneja las cuentas,
   al invitar o con el selector (`darloPideContrasena`, que pregunta por la
   capacidad `usarCuentas`), y pasar la dirección, como antes. Los intentos
   tienen **un freno propio por cuenta** (`claveDeConfirmacion`, un HMAC del
   id), con las reglas del de entrar pero aparte de él: el de entrar lo puede
   trabar desde afuera cualquiera que sepa el correo, y eso no tiene que
   trabar lo que la persona hace con su sesión. Un reset completo lo destraba.
3. **La IP de un cupo sale solo de `X-Real-IP`**, en los formularios, en
   `/api/contar`, en los clics de `/l/` (`ipDelPedido`) y en better-auth
   (`ipAddressHeaders`). El proxy de delante la pisa siempre: el borde de
   Vercel (la documenta idéntica a `X-Forwarded-For`, que reescribe) y Caddy.
   `X-Forwarded-For` no se lee. Sin una IP válida, todos comparten un cupo.
   Una IPv6 cuenta por su /64.
4. **Los códigos fallidos del segundo factor se cuentan por cuenta**, en
   `bloqueos_de_acceso` con las reglas del ADR-0010 (5 fallos en 15 minutos
   frenan de 15 minutos a 1 hora) y una clave propia (`claveDeCodigos`, un
   HMAC del id de la cuenta). La contraseña buena no los borra; el código
   bueno y un reset completo, sí. Una cuenta frenada contesta el mismo 429.
   Acá y en la confirmación de la regla 2, **cada intento se cuenta antes de
   probarlo**, como fallo pendiente, en la misma escritura atómica que mira
   si la cuenta está frenada (la fila bloqueada con `FOR UPDATE`): una ráfaga
   de intentos a la vez no pasa de 5. El intento bueno borra lo contado.
   Lo mismo en el bloqueo de entrar del ADR-0010, también para correos que no existen.
5. **Una sesión no pasa de 7 días desde que se abrió**, se use o no. Lo pone
   el gancho de la base que renueva el vencimiento (`toparLaRenovacion`), así
   que lo cumple todo lo que lee la sesión sin mirarlo aparte. Volver a poner
   la contraseña (cambiarla, prender o apagar el segundo factor) abre una
   sesión nueva, que cuenta desde ahí.
6. **No se elige una contraseña filtrada.** Un gancho de antes de
   `/reset-password` (el enlace de «olvidé» y la invitación) y de
   `/change-password` (filtradas.ts) le pregunta a Have I Been Pwned por
   rango: viajan los 5 primeros caracteres del SHA-1 en mayúsculas, con
   `Add-Padding: true`, y el relleno (las que aparecen 0 veces) no cuenta.
   - **Filtrada:** 400 `PASSWORD_COMPROMISED` (`CONTRASENA_FILTRADA`); el
     formulario marca el campo y pide otra.
   - **Sin respuesta en 3 segundos, o con error:** 503 `CONTRASENA_SIN_REVISAR`
     y **no se guarda** (falla cerrado); el formulario pide probar en un rato.
   - **En los dos casos el enlace sigue sirviendo**: el gancho corre antes de
     la ruta, y better-auth recién gasta el enlace adentro de ella. Por eso no
     se usa el plugin haveIBeenPwned de better-auth, que mira adentro del
     hasheo, cuando el enlace ya se gastó. Desde Mi cuenta, lo mismo: la
     contraseña no cambia y se puede volver a probar.

   Entrar no la mira: nadie se queda afuera con la que ya tiene.
7. **Un GET del admin no cambia nada.** El rebote de las cookies `Strict`
   (ADR-0010 §4) convierte un link de otro sitio en un GET con sesión: todo lo
   que escribe va por POST (Server Actions y la API de better-auth).

Van además, sin regla nueva: el secreto del cron se compara en tiempo
constante; las imágenes de Blob se muestran solo del store del sitio y su
carpeta `fotos/` (el host sale del token, en next/image y en la CSP), y el
admin guarda solo esas (`validarAlGuardar`); al leer lo guardado, una foto de
Blob de otro store en `fotos/` sigue pasando el esquema, para que un cambio de
token no esconda lo publicado ni vuelva una sección a su contenido inicial;
`X-Powered-By` no se manda; better-auth pasa a 1.7.7.

## Consecuencias

### Positivas

- Una credencial que se da de baja deja de servir toda junta, y una sesión
  robada sola no alcanza para cambiar correos ni repartir administra.
- El cupo por IP no se elige desde el cliente con ninguno de los dos hosts.
- Probar códigos tiene techo por cuenta, no por código.
- Una cookie robada sirve a lo sumo 7 días.

### Negativas

- **Cambiar un correo o dar administra piden un paso más**, y quien cambia su
  propio correo pierde sus dispositivos recordados.
- **Cambiarle el correo a una cuenta pendiente anula su invitación**: hay que
  reenviarla (el aviso lo dice).
- **Cerrarle las sesiones a alguien le pide el código otra vez**, aunque haya
  recordado el dispositivo.
- **Sin `X-Real-IP`, todos comparten un cupo**: un host nuevo que no la ponga
  frena a todos juntos.
- **Una semana después de entrar hay que volver a entrar**, aunque se use todos
  los días.
- **Elegir una contraseña depende de un servicio de afuera** (Have I Been
  Pwned): si no contesta en 3 segundos, hay que probar más tarde, con el mismo
  enlace.
- Quien prueba códigos puede frenar una cuenta hasta una hora, como con la
  contraseña (la molestia del ADR-0010).

### Mitigaciones

- Los mensajes de la pantalla dicen qué pasó y qué hacer (reenviar la
  invitación, elegir otra contraseña, probar en un rato).
- Un host nuevo se suma sabiendo esto: `X-Real-IP` es la única cabecera que se
  lee, y el comentario de `ipDelPedido` lo dice.
- El freno de los códigos y el de la confirmación los destraba un reset
  completo, al instante.
- Un rechazo por filtrada o por el servicio caído no gasta la invitación ni el
  enlace de «olvidé»: se vuelve a probar con el mismo.

## Alternativas consideradas

### Pedir la contraseña solo para cambiar el correo propio

- Qué hubiera implicado: menos fricción para quien administra.
- Por qué se descarta: cambiar el correo de otra cuenta es poder entrar a
  ella; es lo mismo que se quiere frenar.

### Seguir leyendo `X-Forwarded-For` si trae una sola IP

- Qué hubiera implicado: un cupo por IP también en un host que no ponga
  `X-Real-IP`.
- Por qué se descarta: los dos hosts la ponen, y una segunda cabecera es una
  segunda forma de equivocarse al configurar un proxy.

### El tope de la sesión en cada lector (`sesionActual` y cada acción)

- Qué hubiera implicado: mirar `createdAt` en unas ochenta llamadas.
- Por qué se descarta: todas terminan en el vencimiento de better-auth; topar
  ese vencimiento lo cumple en todas, también en su middleware.

### Una tabla nueva para los códigos fallidos

- Por qué se descarta: `bloqueos_de_acceso` ya guarda un estado por clave con
  las reglas que hacían falta; otra clave alcanza.

### El plugin haveIBeenPwned de better-auth

- Qué hubiera implicado: nada que escribir.
- Por qué se descarta: mira adentro del hasheo de la contraseña nueva, y en
  `/reset-password` better-auth gasta el enlace antes de hashear; un rechazo
  dejaba la invitación usada. Tampoco pone tiempo límite al pedido.

### La confirmación de la contraseña en el freno de entrar

- Por qué se descarta: ese freno va por el correo y lo traba desde afuera
  cualquiera que lo sepa; con la sesión abierta, la cuenta ya se conoce.

## Referencias

- Vercel, *Request headers* (`x-real-ip` idéntica a `x-forwarded-for`, que
  Vercel reescribe).
- Have I Been Pwned, *Pwned Passwords* (consulta por rango, k-anonimato,
  `Add-Padding`).
- OWASP, *Session Management Cheat Sheet* (vencimiento absoluto) y
  *Authentication Cheat Sheet* (volver a pedir la contraseña).
- better-auth 1.7.7: `advanced.ipAddress`, `databaseHooks.session.update`,
  `resetPassword` (gasta el enlace antes de hashear), plugins `two-factor` y
  `haveibeenpwned`, verificado contra su código instalado.
