# DECISIONS — La edición de las páginas

Append-only: fecha — decisión — por qué.

---

**2026-09-21 — Formulario por sección, no edición encima del sitio.**
Facundo: «formulario por sección, como decís vos». El sitio está lleno de
coreografía; editar encima de las escenas es frágil y confuso. El formulario
se lee como el sitio: misma jerarquía y mismo orden de scroll.

**2026-09-21 — Borrador, vista previa y «Publicar» aparte.**
Facundo: «dale, borrador con vista previa y publicar aparte». Guardar no
publica; cada página tiene dos versiones y nada más (sin historial, que el
spec del admin dejó afuera). Sin aprobación de otra persona.

**2026-09-21 — Las decisiones del admin se toman entre los tres.**
Facundo: «las demás decisiones las vamos a tomar entre los 3, no Mateo solo».
Lo que este spec cambia respecto del spec del admin queda listado en su §12
para hablarlo con Gastón y Mateo.

**2026-09-21 — Lo primero que se ve: Inicio → Hero de punta a punta.**
Facundo quiere «meter mano en lo visual». Una sección real editable (con
borrador, foto, vista previa y publicar) vale más que un modelo completo sin
pantalla; las demás secciones se suman escribiendo su esquema.

**2026-09-21 — Un documento por página validado por esquema, no una columna por texto.**
El spec del admin (§6) pide una columna por texto. Son cientos de columnas y
una migración por campo nuevo; la estructura ya vive en el esquema Zod de cada
sección. Es la divergencia más grande con el spec del admin: se acuerda entre
los tres antes o durante la fase A.

**2026-09-21 — Las fotos van a Blob en Vercel y al disco en local.**
No tenemos la cuenta de Vercel a mano (la administran Mateo y Gastón) y lo
visual no puede esperarla. Un mismo `almacen.ts` con dos implementaciones;
`next/image` sigue haciendo recorte, compresión y tamaños.

**2026-09-21 — Tres OK del owner para arrancar la fase A.**
Facundo: «dale, sí a las tres, mandale»: subir plan y spec enmendado, agregar
`@vercel/blob`, y la excepción acotada en AGENTS.md §12 (el formulario de cada
página sale de su esquema; las entidades siguen a mano).

**2026-09-21 — Enmiendas al SPEC tras la revisión del plan.**
La foto es un valor `{ src, alt, foco }` en su lugar (no un id): sin join al
renderizar y con alt también para las fotos de `public/`; `Foto` pierde
`focoX`/`focoY` y usa `uuid()`. Fotos hasta 4 MB (Vercel corta el cuerpo en
4,5 MB). La franja de borrador va abajo (el header es una píldora flotante).
La miniatura del foco es 4:3, no el recorte de cada marco.

**2026-09-21 — `datos/cliente.ts` lee `DATABASE_URL` en la primera consulta, no al importar.**
`next build` importa cada ruta para leer su configuración, sin base: el
adaptador armado al cargar el módulo hacía fallar el build en
`/api/cron/metricas` desde la fase A de métricas. Ahora el adaptador posterga
la lectura de la URL hasta `connect()`, que Prisma llama en la primera
consulta, con el mismo error en llano. No es un Proxy sobre el cliente porque
better-auth lee `_runtimeDataModel` al construirse y ese acceso tiraría
adentro de su arranque asíncrono (rechazo sin manejar que mata al build);
comprobado con un script antes de decidirlo.
