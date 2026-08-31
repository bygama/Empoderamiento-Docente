# ADR-0003: Enviar el correo del formulario por el SMTP de Hostinger

- **Status:** Accepted
- **Date:** 2026-08-31
- **Decision-makers:** @querques20
- **Relacionado:** ADR-0002 (Supabase sigue siendo la dirección para
  persistencia; este ADR resuelve el envío, no el guardado)

---

## Contexto

El formulario de `/contacto` no tenía backend. Al enviar, armaba un enlace
`mailto:` y hacía `window.location.href`, delegando el envío al cliente de
correo del visitante.

Eso falla de una manera que no se ve desde la computadora de quien lo
programó: en un celular sin app de correo configurada, o en una compu con
Gmail web y sin handler de `mailto:`, no pasa nada. La persona completó el
formulario, apretó enviar, vio la confirmación animada, y del otro lado no
llegó nunca nada. Para un sitio institucional que existe en buena medida
para que te escriban, era el agujero más caro del proyecto.

Al ir a resolverlo apareció una segunda cuestión: **nadie sabía qué
servicios tenía contratados el proyecto**. Los ADR-0001 y 0002 registran
las decisiones de stack, pero no qué se pagó. Hubo que reconstruirlo
consultando el DNS del dominio:

| Pieza                | Dónde vive | Cómo se verificó              |
| -------------------- | ---------- | ----------------------------- |
| Dominio y DNS        | Hostinger  | NS: `*.dns-parking.com`       |
| Casillas de correo   | Hostinger  | MX: `mx1/mx2.hostinger.com`   |
| Sitio Next.js        | Vercel     | Header `Server: Vercel`       |

Es decir: **ya había un servidor de correo pagado**, con casillas propias
del dominio y el SPF configurado, que el proyecto no estaba usando.

Fuerzas en juego:

1. **Hay que dejar de perder consultas.** Es lo que motiva todo esto y no
   admite una solución a medias.
2. **Equipo chico.** Cada servicio nuevo es una cuenta más que alguien
   tiene que administrar, pagar y recordar que existe.
3. **Ya está pagado.** Sumar un servicio de correo transaccional sería
   pagar dos veces por la misma capacidad.
4. **Entregabilidad.** El SPF del dominio ya autoriza a Hostinger. Un
   remitente externo exige tocar DNS y esperar propagación para no caer
   en spam.

## Decisión

**El formulario de contacto manda el correo por el SMTP de Hostinger**,
usando las casillas del dominio que ya vienen con el hosting contratado.

La implementación queda aislada en `src/lib/mail.ts`, detrás de una
función `enviarConsulta()`. El endpoint que la usa no sabe cómo sale el
correo: le importa si salió o no.

Las credenciales viajan por variables de entorno (`SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACTO_DESTINO`), nunca al
repo.

Este ADR además **deja asentado el reparto de infraestructura**
Hostinger / Vercel de la tabla de arriba, que hasta ahora no figuraba en
ningún documento.

## Consecuencias

### Positivas

- **Costo adicional cero.** Se usa capacidad ya contratada.
- **El correo sale del propio dominio**, no de un remitente de terceros.
- **Entregabilidad resuelta sin tocar DNS**: el SPF ya apunta a
  Hostinger.
- **Un servicio menos** que administrar, pagar y del que depender.
- **Queda documentado qué se pagó**, que era el problema de fondo detrás
  de esta decisión.

### Negativas

- **SMTP es más lento que una API HTTP.** Hay que abrir la conexión y
  negociar TLS en cada arranque en frío. En el plan free de Vercel la
  función corta a los 10 segundos.
- **Acopla el envío al hosting del dominio.** Si algún día se migra de
  Hostinger, el formulario se muda con él.
- **Sin panel de observabilidad.** Un servicio transaccional muestra
  entregas, rebotes y aperturas; el SMTP no da nada de eso. Si un correo
  no llega, hay que buscarlo en los logs de Vercel.
- **La consulta existe solo como correo.** Si el envío falla, no queda
  registrada en ningún lado.

### Mitigaciones

- El envío está aislado en `src/lib/mail.ts`. Cambiar de proveedor es
  reescribir ese archivo, sin tocar el endpoint ni el componente.
- El transporte se cachea entre invocaciones, así que las llamadas
  seguidas no repiten el costo del handshake.
- Si el envío falla, el formulario se queda en pantalla con los datos
  puestos y ofrece escribir directo a la casilla: que se rompa algo de
  nuestro lado no puede dejar a la persona sin manera de contactarnos.
- Guardar además las consultas en Supabase (ADR-0002) resuelve el último
  punto. Queda anotado como paso siguiente en
  `docs/features/contacto.md`.

## Alternativas consideradas

### Alternativa A: Resend (u otro servicio transaccional)

- **Qué hubiera implicado:** una API HTTP en lugar de SMTP —más rápida y
  más simple de llamar—, con panel de entregas, rebotes y reintentos.
  Plan gratuito de 3000 correos por mes, de sobra para el volumen.
- **Por qué se descarta:** duplica una capacidad ya pagada y suma una
  cuenta más al inventario de un equipo de tres personas. Además exige
  tocar el DNS del dominio (SPF y DKIM) para que los correos no caigan en
  spam, trabajo que con Hostinger ya está hecho.
- **Sigue siendo el plan B.** Si aparecen timeouts en producción, la
  migración es reescribir `src/lib/mail.ts` y nada más.

### Alternativa B: Formspree o similar (backend de formularios)

- **Qué hubiera implicado:** cero código de servidor; el formulario
  postea a un tercero que reenvía por correo.
- **Por qué se descarta:** los datos de contacto de docentes e
  instituciones pasarían por un intermediario sobre el que no tenemos
  control ni acuerdo de tratamiento. Para un proyecto educativo con
  presencia en cinco países, no vale la pena por ahorrar un endpoint.

### Alternativa C: esperar a Supabase e implementar todo junto

- **Qué hubiera implicado:** hacer una sola vez el trabajo de guardar la
  consulta y notificarla.
- **Por qué se descarta:** el formulario está publicado y perdiendo
  consultas hoy. Supabase no tiene fecha (ADR-0002 lo deja explícitamente
  como dirección, no como plan). Frenar el arreglo hasta que llegue es
  elegir seguir perdiendo consultas por prolijidad.

### Alternativa D: dejar el `mailto:`

- **Qué hubiera implicado:** nada.
- **Por qué se descarta:** es el problema.

## Referencias

- [`docs/features/contacto.md`](../../features/contacto.md) — registro de
  trabajo del formulario: implementación, pruebas, variables de entorno y
  pendientes.
- [ADR-0002](0002-adoptar-supabase-persistencia.md) — Supabase como
  dirección para persistencia.
- [Documentación de SMTP de Hostinger](https://support.hostinger.com/en/articles/4305847-how-to-set-up-email-on-third-party-applications)
- [Nodemailer](https://nodemailer.com/)
