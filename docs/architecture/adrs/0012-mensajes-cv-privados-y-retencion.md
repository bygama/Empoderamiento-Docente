# ADR-0012: Guardar los CV en un store privado de Vercel Blob, borrar lo que llega por los formularios a plazo fijo y avisar sin datos

- **Status:** Accepted
- **Date:** 2026-09-26
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en `work/mensajes/`
- **Related:** [ADR-0005](0005-admin-a-medida.md) (el admin a medida; las
  fotos en Blob), [ADR-0011](0011-search-console-y-un-solo-cron.md) (un solo
  cron con tareas registradas, donde entra la retención)

---

## Contexto

El segundo objetivo de ED es sumar docentes por CV, y hasta ahora el
formulario de contacto del sitio armaba un `mailto:` y el de CV no existía.
Lo que llega por esos formularios son **datos personales de terceros**, y un
CV es lo más sensible que va a guardar el sistema: trayectoria, lugar de
trabajo, a veces una foto o un documento de identidad.

Cuatro fuerzas:

1. **La ley de los tres países.** Argentina, Ley 25.326: los datos se
   destruyen cuando dejan de ser necesarios para lo que se recogieron (art.
   4 inc. 7), y quien los dio puede pedir que se supriman, con respuesta en 5
   días hábiles (art. 16). Chile, Ley 21.719, en vigor desde el 1 de
   diciembre de 2026: derechos de acceso, rectificación, supresión, oposición
   y portabilidad, con una agencia que sanciona. México, la LFPDPPP de 2025,
   vigente desde el 21 de marzo de 2025: derechos ARCO, entre ellos la
   cancelación.
2. **Un archivo de CV no puede tener URL pública.** Las fotos del admin van a
   un store de Blob público: cualquiera con la URL las ve. Para un CV eso es
   inaceptable, aunque la URL sea difícil de adivinar.
3. **El plan gratis.** Neon da 0,5 GB por proyecto, para toda la base; Vercel
   Blob en Hobby da 1 GB y 10 GB de transferencia por mes. Una función de
   Vercel corta el cuerpo de un pedido en 4,5 MB.
4. **La política de privacidad y los campos del CV son de ED**, con asesoría,
   y todavía no están (SPEC padre §8). El código no puede esperarlos, pero la
   entrada pública sí.

## Decisión

**Los CV van a un store de Vercel Blob privado, aparte del de las fotos.**
`@vercel/blob` ≥ 2.3 lo soporta (GA desde el 30 de junio de 2026) y el repo
ya tiene la 2.8.0: `put` y `del` con `access: "private"`, y `get` devuelve el
archivo como stream a quien tiene el token. El acceso se elige al crear el
store y no se cambia, por eso es un store aparte, con su token
`CV_BLOB_READ_WRITE_TOKEN`. En local, sin token, van a `apps/sitio/.cv/`
(git-ignorada); en Vercel sin token el CV no se recibe (503), porque el disco
de una función se pierde.

- **La única salida del archivo** es `/admin/mensajes/cv/[id]/archivo`: pide
  sesión y `verCV` (dirige y administra), y lo manda como adjunto, sin caché y
  con `nosniff`. El nombre en el store es `cv/<id>.pdf`: ni el de la persona
  ni el del archivo original.
- **Un PDF de hasta 4 MB**, reconocido por sus bytes (`%PDF-`), no por su
  extensión: el margen hasta los 4,5 MB es el del multipart.

**Lo que llega se borra solo, a plazo fijo**, como tareas del cron diario
(ADR-0011), con los plazos en un solo lugar (`config/privacidad.ts`):

| Qué | Cuándo se borra | Contado desde |
| --- | --- | --- |
| Un CV, con su archivo | 12 meses | que llegó |
| Un mensaje de Contacto | 24 meses | que llegó |
| Lo marcado como spam | 30 días | que se marcó |

«Borrar ahora», en la ficha, atiende el pedido de quien quiere que borren sus
datos antes. De un CV, la actividad del admin registra solo que se borró; de
un contacto, el tema, **nunca el nombre ni el texto**: si esa persona pide que
la borren, la actividad no puede quedarse con su nombre un año más. Lo que
borra el cron no va a la actividad (ahí todo es de una persona): queda en el
detalle de su corrida, que dice cuántos borró y nada más.

**El correo de aviso no lleva ningún dato de quien escribió**, en ninguna de
las dos bandejas: ni el nombre, ni el correo, ni el texto; solo la bandeja y
el link a la ficha. La razón es la misma promesa: el formulario dice «los
borramos a los 24 meses», y una copia en el buzón de cada persona del equipo
la haría falsa, porque ese buzón no lo borra nadie. Por eso la función que
arma el correo ni siquiera recibe esos datos.

**Los formularios públicos** (`/api/contacto`, `/api/cv`) validan con Zod en
el borde, llevan un campo trampa (si llega con algo se contesta que salió
bien y no se guarda nada) y un tope por IP **en la base**, porque el sitio
corre en varias instancias: 5 contactos o 3 CV por hora, con la IP guardada
como HMAC y nunca en claro.

**Lo que no se hace**, a propósito (SPEC padre §5.6 y §5.7):

- **Exportar a planilla.** Ni los CV ni los contactos se bajan en lote: una
  planilla con cien nombres y correos sale del sistema y no la alcanzan ni la
  retención ni «Borrar ahora». Lo que hay se lee en el admin, de a uno, y un
  CV se baja de a uno, con sesión y `verCV`.
- **Responder desde el admin.** «Responder» abre el programa de correo con la
  dirección y el asunto. Un envío desde acá guardaría la conversación en la
  base, con los datos de quien escribió, y pediría otra retención, otro
  remitente y otro aviso de privacidad.
- **Guardar el origen en un CV.** El embudo del CV (lane 11) cuenta por día y
  por canal, sin IP, sin navegador y sin cookies; nunca se anota en la ficha
  de una persona por qué link llegó.

**La entrada pública del CV nace apagada** (`CV_ABIERTO=si` la enciende):
apagada, `/sumate-al-equipo` y `/api/cv` dan 404 y ningún link del sitio
lleva ahí. Los campos viven en `config/cv.ts`, marcados como provisorios,
para cambiarlos sin tocar nada más.

## Consecuencias

### Positivas

- Un CV no tiene URL pública en ningún momento: ni en el store, ni en el
  admin, ni en un correo.
- Lo que se promete en el formulario («los borramos a los 24 meses») es
  verdad sin que nadie se acuerde de hacerlo.
- Sin dependencias nuevas y dentro del plan gratis: con 1 MB por CV entran
  unos mil, y la retención de 12 meses los acota.

### Negativas

- **Un store más que crear y conectar** en Vercel, con su variable.
- **El aviso obliga a entrar al admin** para saber de qué se trata un mensaje.
- **Los plazos son fijos** hasta que Ajustes › Privacidad los haga editables.
- **La política de privacidad no está**: la línea de cada formulario dice qué
  se hace y cuándo se borra, pero no reemplaza el texto que ED tiene que
  publicar con asesoría.

### Mitigaciones

- El README dice cómo crear el store (`vercel blob create-store --access
  private`) y conectarlo con el prefijo `CV_BLOB`.
- El asunto del aviso dice la bandeja, y el link lleva directo a la ficha.
- Los plazos viven en un solo archivo, que es lo que Ajustes › Privacidad va
  a leer y escribir.
- La entrada del CV no se enciende hasta que la política y los campos estén.

## Alternativas consideradas

### Alternativa A: el archivo en Postgres (`bytea`)

- Qué hubiera implicado: una tabla con el PDF, con tope de tamaño.
- Por qué se descarta: el plan gratis de Neon da 0,5 GB para toda la base; de
  100 a 250 CV de 2 a 5 MB la llenan, y al pasarse se frena la escritura de
  todo el sitio, no solo de los CV.

### Alternativa B: el store público de las fotos con una URL difícil de adivinar

- Qué hubiera implicado: reusar el store y el token que ya existen.
- Por qué se descarta: una URL difícil de adivinar sigue siendo pública; se
  copia, se reenvía y queda en historiales.

### Alternativa C: el correo de aviso con el mensaje entero

- Qué hubiera implicado: poder leer un contacto sin entrar al admin.
- Por qué se descarta: la copia en cada buzón sobrevive a la retención y a
  «Borrar ahora», y la promesa del formulario dejaría de ser cierta.

## Referencias

- [Vercel Blob: private storage](https://vercel.com/docs/vercel-blob/private-storage)
  y [el changelog del GA](https://vercel.com/changelog/vercel-private-blob-is-now-generally-available)
- [Límites de Vercel Functions](https://vercel.com/docs/functions/limitations) (4,5 MB por pedido)
- [Planes de Neon](https://neon.com/docs/introduction/plans)
- [Ley 25.326, texto actualizado](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion)
- [Ley 21.719 (Chile)](https://www.bcn.cl/leychile/navegar?idNorma=1209272)
- `work/mensajes/SPEC.md` §3, §4, §8 y §9; SPEC padre §5.6 y §8
