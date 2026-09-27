# ADR-0013: Segundo factor por correo, obligatorio para quien dirige y administra

- **Status:** Accepted
- **Date:** 2026-09-26
- **Decision-makers:** el padre de `work/mapa-del-admin/`, por delegación de
  Mateo (DECISIONS del padre, 2026-09-26)
- **Related:** [ADR-0010](0010-seguridad-del-acceso.md) (la seguridad del
  acceso, que no decidió el segundo factor)
- **Lane:** `work/cuentas/` (lane 3b del mapa del admin)

---

## Contexto

El mapa del admin (SPEC padre §5.1 y §5.10) pide un segundo factor por correo
para quien ve los CV: **obligatorio para dirige y administra, opcional para
edita**, con «Recordar este dispositivo 30 días». El ADR-0010 cerró los
agujeros del acceso pero no decidió cómo es ese segundo factor, ni qué pasa
con quien ya tiene una sesión abierta el día que se vuelve obligatorio, ni
cómo se recupera quien pierde su buzón.

Pesan tres cosas: lo usan tres personas unas pocas veces por mes, así que una
app de autenticación es una fricción que no se paga; better-auth ya trae un
plugin de dos factores, así que no hace falta una dependencia; y los correos
del admin salen por Resend, que en producción todavía espera el dominio de ED
(SPEC padre §8).

## Decisión

**Un código de 6 dígitos por correo, con el plugin de dos factores de
better-auth 1.7.5, obligatorio para dirige y administra por una regla de la
base.**

1. **Solo el código por correo.** Sin app de autenticación (TOTP apagado) ni
   códigos de respaldo. El código vence a los **10 minutos**, se guarda
   **hasheado** (como los tokens del ADR-0010) y admite **5 intentos**. El
   paso entre la contraseña y el código dura 30 minutos, para que «Mandar
   otro» sirva después de uno vencido. «Recordar este dispositivo» dura **30
   días** y se renueva al entrar. Rate limit propio: pedir un código, 5 cada
   10 minutos; probarlo, 10 cada 5; prenderlo o apagarlo, 5 cada 5 (piden la
   contraseña).
2. **Obligatorio por rol, y lo garantiza la base:** el CHECK
   `user_segundo_factor_obligatorio` no deja que haya quien dirija o
   administre sin él, y `segundoFactorObligatorio(rol)` (`permisos.ts`) es su
   espejo en el código. Cada camino que da uno de esos roles lo prende en la
   misma escritura (`ponerRol`), y un gancho de `@ed/auth` frena apagarlo.
3. **Quien ya tiene sesión el día que se vuelve obligatorio, la pierde:**
   la migración que lo introduce lo prende para quienes ya dirigen o
   administran y borra sus sesiones; y cuando alguien sube a uno de esos
   roles con el segundo factor apagado, se prende y se le cierran las
   sesiones. Una sesión abierta sin código no sobrevive al cambio de regla.
4. **El código se espera; los otros correos, no.** El ADR-0010 manda los
   correos en segundo plano para que el tiempo no delate si un correo
   existe. Quien pide un código ya puso bien la contraseña, así que esa
   razón no aplica, y esperar el envío es lo único que deja saber si salió:
   si no salió, la API contesta `CODIGO_NO_SALIO` y **la pantalla del código
   no finge** que lo mandó; dice que no se pudo y a quién avisar.
5. **«Entró» se anota cuando la sesión existe de verdad**, después del
   código o del dispositivo recordado, con un plugin propio que corre
   después del de better-auth. La contraseña buena sola no es una entrada.
6. **La recuperación es cambiar el correo:** quien pierde su buzón le pide a
   quien dirige o administra que le cambie el correo desde Cuentas, que le
   cierra las sesiones y avisa a las dos direcciones.

## Consecuencias

### Positivas

- Quien ve los CV y las cuentas no entra solo con una contraseña robada.
- Sin dependencias nuevas y sin nada que instalar para las tres personas.
- Ni un código ni un enlace en la base que sirva si alguien la lee.
- La regla vive en la base: un camino nuevo que se olvide de ella choca.

### Negativas

- **Dirige y administra dependen de que salga un correo para entrar.** Sin
  `RESEND_API_KEY` en producción, o con Resend caído, no entran.
- El bloqueo por cuenta del plugin cuelga de una fila de la tabla
  `twoFactor`, que con el código por correo queda vacía: no aplica.
- Un correo es un factor más débil que una app: quien tenga el buzón y la
  contraseña, entra.
- El día del deploy, quienes dirigen y administran pierden la sesión.

### Mitigaciones

- **Condición del primer deploy de esta lane: Resend configurado y probado**
  (README, «Correos»). Mientras tanto la pantalla del código lo dice en vez
  de fingir; en desarrollo, sin clave, el código sale por la consola.
- Contra la fuerza bruta sobre el código: 5 intentos por código, 30 minutos
  de paso pendiente y el rate limit por IP. Contra la de la contraseña, el
  bloqueo por cuenta del ADR-0010, que corre antes.
- Con acceso a la base se puede sacar a alguien de apuro (pasarle el rol a
  edita y apagarle el segundo factor): el CHECK lo permite, porque edita no
  lo exige.

## Alternativas consideradas

### Una app de autenticación (TOTP), con códigos de respaldo

- Qué hubiera implicado: instalar una app, escanear un QR y guardar códigos.
- Por qué se descarta: para tres personas que entran pocas veces por mes, la
  fricción y el riesgo de perder los códigos pesan más que la diferencia de
  seguridad; el mapa pide el código por correo.

### Obligatorio solo en el código, sin CHECK

- Qué hubiera implicado: confiar en que cada camino que da un rol se acuerde.
- Por qué se descarta: la dirección ya se garantiza en la base
  (`user_una_sola_dirige`); esta regla merece lo mismo.

### Mantener las sesiones abiertas y pedir el código a mitad de la sesión

- Qué hubiera implicado: una pantalla de «confirmá que sos vos» dentro del
  admin, con su estado en la sesión.
- Por qué se descarta: cerrar la sesión y volver a entrar hace lo mismo con
  la pantalla que ya existe, y pasa una vez.

## Referencias

- better-auth 1.7.5, plugin `two-factor` (`otpOptions`, `trustDevice`,
  `twoFactorCookieMaxAge`), verificado contra su código instalado.
- `work/cuentas/` (SPEC §5, DECISIONS, PROGRESS).
