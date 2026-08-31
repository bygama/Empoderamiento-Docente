# Formulario de contacto

Registro de trabajo del formulario de `/contacto`: qué hay hecho, qué se
decidió y por qué, y qué falta. Se actualiza a medida que avanzamos.

- **Estado:** en progreso — endpoint escrito, falta cargar credenciales
- **Código:** `src/features/contacto/`, `src/app/api/contacto/`,
  `src/lib/mail.ts`
- **Última actualización:** 2026-08-31

---

## El problema que resuelve

Hasta ahora el formulario no tenía backend. Al enviar, armaba un enlace
`mailto:` y hacía `window.location.href`, o sea que delegaba el envío al
cliente de correo del visitante.

Eso tiene una falla que no se ve desde la computadora de quien lo
programó: en un celular sin app de correo configurada, o en una compu con
Gmail web y sin handler de `mailto:`, **no pasa nada**. La persona llenó
el formulario entero, apretó enviar, vio la pantalla de confirmación
animada, y del otro lado no llegó nunca nada. Consulta perdida y sin
rastro.

Para un sitio institucional que existe en buena medida para que te
escriban, ese era el agujero más caro del proyecto.

---

## Infraestructura real

Esto no estaba documentado en ningún lado del repo y costó reconstruirlo,
así que queda asentado acá. Los ADR-0001 y ADR-0002 registran las
decisiones de stack, pero no qué servicios se contrataron de verdad.

| Pieza                | Dónde vive | Cómo se verificó                  |
| -------------------- | ---------- | --------------------------------- |
| Dominio y DNS        | Hostinger  | NS: `*.dns-parking.com`           |
| Casillas de correo   | Hostinger  | MX: `mx1/mx2.hostinger.com`       |
| Sitio Next.js        | Vercel     | Header `Server: Vercel` (`gru1`)  |

El SPF del dominio ya autoriza a Hostinger a mandar correo:

```text
v=spf1 include:_spf.mail.hostinger.com ~all
```

El reparto es sano: Hostinger hace de registrador, DNS y correo; Vercel
sirve la aplicación. Lo único que faltaba era que alguien lo escribiera.

---

## Decisión: SMTP de Hostinger, no un servicio de mail aparte

Registrada en
[ADR-0003](../architecture/adrs/0003-correo-del-formulario-por-smtp-de-hostinger.md),
con las alternativas que se descartaron y por qué. El resumen:

Se evaluó sumar Resend (o similar) para el envío. Se descartó.

**Por qué Hostinger:**

- Ya está pagado con el dominio. Costo adicional cero.
- El correo sale desde `@empoderamientodocente.org`, no desde un
  remitente de terceros.
- El SPF del dominio ya apunta a Hostinger, así que la entregabilidad
  está resuelta sin tocar DNS.
- Un servicio menos que mantener, y una cuenta menos de la que depender.

**Qué resignamos:** SMTP desde una función serverless es más lento que
una API HTTP, porque hay que abrir y negociar la conexión. En el plan
free de Vercel la función corta a los 10 segundos. Para el volumen de un
formulario de contacto sobra, pero queda anotado como el punto a mirar si
alguna vez aparecen timeouts.

**Plan B si eso pasa:** migrar `src/lib/mail.ts` a la API de Resend. El
resto del código no se entera — el endpoint solo llama a
`enviarConsulta()` y le importa el `ok`, no cómo salió el mail.

---

## Cómo quedó armado

Tres piezas, cada una con una responsabilidad:

- **`src/features/contacto/schema.ts`** — el schema de Zod. Lo comparten
  el componente (valida antes de mandar) y el endpoint (valida al
  recibir, porque a la API se puede postear a mano sin pasar por el
  formulario).
- **`src/lib/mail.ts`** — arma y manda el correo por SMTP. Cachea el
  transporte entre pedidos y nunca deja escapar el detalle del error.
- **`src/app/api/contacto/route.ts`** — el endpoint. Valida, filtra bots
  y frena ráfagas.

### Defensas contra spam

- **Honeypot.** Un campo `website` oculto por CSS. Una persona no lo ve;
  un bot que completa todo lo que encuentra, sí. Si viene con algo, el
  endpoint responde `200 OK` sin mandar nada — así el bot no aprende que
  lo detectamos.
- **Freno por IP.** Cinco envíos cada diez minutos. Es un freno parcial a
  propósito: el contador vive en memoria y cada instancia serverless
  tiene el suyo, así que alguien insistente puede saltarlo. Alcanza para
  el bot que postea mil veces seguidas, que es el caso real.
- **Largo máximo por campo.** Corta el payload gigante antes de que
  llegue al servidor de correo.

### Respuestas del endpoint

| Código | Cuándo                                    |
| ------ | ----------------------------------------- |
| `200`  | Enviado (o honeypot, que finge éxito)     |
| `400`  | No pasó la validación                     |
| `429`  | Demasiados envíos desde la misma IP       |
| `502`  | El servidor de correo falló               |
| `503`  | Faltan las credenciales de SMTP           |

El `502` y el `503` se distinguen porque significan cosas distintas para
quien mantiene el sitio: uno es "se cayó Hostinger", el otro es "alguien
no cargó las variables en Vercel".

---

## Variables de entorno

Van en `.env.local` para desarrollo y en el panel de Vercel para
producción. Nunca al repo: `.env.local` está en `.gitignore`.

| Variable            | Obligatoria | Valor                                   |
| ------------------- | ----------- | --------------------------------------- |
| `SMTP_HOST`         | Sí          | `smtp.hostinger.com`                    |
| `SMTP_PORT`         | No          | `465` (por defecto)                     |
| `SMTP_USER`         | Sí          | La casilla completa, con el `@`         |
| `SMTP_PASS`         | Sí          | Contraseña de la casilla                |
| `CONTACTO_DESTINO`  | No          | A dónde llegan; por defecto `SMTP_USER` |

`CONTACTO_DESTINO` existe para el día que las consultas tengan que ir a
una persona distinta de la casilla que las manda, sin tocar código.

---

## Bitácora

### 2026-08-31

- Se relevó la infraestructura real por DNS y se descubrió que el correo
  está en Hostinger. No figuraba en ningún documento del repo.
- Se decidió usar el SMTP de Hostinger en lugar de contratar Resend.
- Se escribieron el schema, `src/lib/mail.ts` y el endpoint.
- Se sumó `nodemailer` a las dependencias.
- Se reemplazó el `mailto:` del componente por un `fetch` al endpoint,
  con botón deshabilitado mientras envía y mensaje de error que deja el
  formulario en pantalla con los datos puestos.
- **Bug encontrado y corregido en el honeypot.** El schema lo declaraba
  como `z.string().max(0)`, así que Zod rechazaba el envío con un `400`
  cuyo cuerpo decía `{"website": "Too big: expected string to have <=0
  characters"}`. Es decir: le informaba al bot exactamente qué campo lo
  había delatado, que es justo lo que un honeypot no tiene que hacer.
  Además dejaba muerto el chequeo silencioso del endpoint, que nunca se
  alcanzaba. Ahora el schema acepta el campo con cualquier valor y la
  decisión la toma el endpoint, respondiendo `200` sin mandar nada.
  Quedó un comentario en `schema.ts` avisando que ponerle `.max(0)`
  parece un arreglo pero rompe la trampa.
- Se probaron los cinco caminos del endpoint contra el servidor de
  desarrollo: válido, inválido, honeypot, JSON roto y ráfaga. Todos
  responden lo esperado.
- Se escribió el [ADR-0003](../architecture/adrs/0003-correo-del-formulario-por-smtp-de-hostinger.md),
  que además deja asentado el reparto Hostinger / Vercel: era la razón de
  fondo por la que nadie recordaba qué servicios estaban pagados.

---

## Cómo probarlo

Con el sitio levantado (`pnpm dev`), contra `http://localhost:3000`:

```bash
# Consulta válida. Sin credenciales cargadas responde 503; con
# credenciales, 200 y el correo llega a la casilla.
curl -X POST http://localhost:3000/api/contacto   -H "Content-Type: application/json"   -d '{"nombre":"Prueba","email":"prueba@ejemplo.com","mensaje":"Consulta de prueba del formulario."}'

# Datos inválidos: 400 con el detalle por campo.
curl -X POST http://localhost:3000/api/contacto   -H "Content-Type: application/json"   -d '{"nombre":"A","email":"roto","mensaje":"hola"}'

# Honeypot: 200 en silencio, sin mandar nada.
curl -X POST http://localhost:3000/api/contacto   -H "Content-Type: application/json"   -d '{"nombre":"Bot","email":"bot@spam.ru","mensaje":"mensaje largo de spam","website":"http://spam.ru"}'
```

Para probar el freno de ráfagas sin esperar diez minutos, se puede
falsear la IP con el header `x-forwarded-for`, que es de donde el
endpoint la lee.

---

## Pendientes

- [ ] Conseguir las credenciales de la casilla en el panel de Hostinger
      y cargarlas en `.env.local`.
- [x] Reemplazar el `mailto:` del componente por un `fetch` al endpoint,
      con estados de enviando / enviado / error.
- [x] Dejar el `mailto:` como salida de emergencia: si el POST falla, que
      la persona igual pueda escribir, en vez de quedarse sin camino.
- [ ] Probar el envío de punta a punta con la casilla real.
- [ ] Cargar las variables en el panel de Vercel para producción.
- [x] Escribir el ADR que asiente el reparto Hostinger / Vercel
      ([ADR-0003](../architecture/adrs/0003-correo-del-formulario-por-smtp-de-hostinger.md)).

### Más adelante

- Guardar las consultas en Supabase además de mandarlas por correo
  (ADR-0002). Hoy, si el correo se pierde, la consulta no queda en ningún
  lado.
- Aviso automático a quien escribe ("recibimos tu consulta").
- **La segunda puerta ("Sumate al equipo") sigue con `mailto:`.** Es el
  mismo patrón que acabamos de sacar del formulario, pero acá el caso es
  distinto y por eso se dejó: es un enlace `<a href="mailto:">` explícito,
  no un formulario que promete "enviado". Si no abre el cliente de correo,
  la persona lo ve y puede copiar la dirección; nadie se va creyendo que
  mandó algo. Resolverlo de verdad implica subida de archivos para el CV
  (storage), que es un trabajo aparte y más grande. Queda anotado para que
  la próxima persona sepa que fue una decisión y no un olvido.
