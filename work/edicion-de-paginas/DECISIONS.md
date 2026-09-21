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
