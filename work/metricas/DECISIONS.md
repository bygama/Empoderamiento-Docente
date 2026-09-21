# DECISIONS — Las métricas del admin

Append-only: fecha — decisión — por qué.

---

**2026-09-21 — Solo «cuánta gente entra y qué páginas mira».**
Facundo, al preguntarle qué quieren ver Raquel y Daniela: «lo primero, cuánta
gente entra y qué páginas mira». Lo fino (descargas, clics, scroll) queda
afuera, y con eso queda afuera cualquier herramienta con cookies.

**2026-09-21 — Gratis, sin pagos, por ahora.**
Facundo: «por ahora manejémonos en lo free sin pagos». El plan de Vercel queda
en Hobby, con su tope de 50.000 vistas por mes y su ventana de un mes. Riesgo
aceptado una sola vez y por escrito: los términos de Hobby son de uso no
comercial. Se revisa cuando ED decida el plan.

**2026-09-21 — Analítica de Vercel + copia diaria en Neon (ADR-0009).**
Contra Umami hosteado (segundo deployable), PostHog o Umami Cloud (cuenta
nueva; PostHog además cookies) y Google Analytics (cookies, panel afuera). La
copia diaria hace que la historia sea nuestra y no dependa de la ventana del
plan.

**2026-09-21 — Las métricas van en paralelo a la fase 2 de Mateo.**
Facundo: «con lo de Mateo no pasa nada, avancemos igual». No dependen del kit
de formularios ni de ninguna entidad; solo del primer deploy.

**2026-09-21 — El panel lee de nuestra tabla, nunca de la API en el render.**
Si Vercel está lento o caído, el admin sigue andando; y el token se usa en un
solo lugar. El precio es que los números son «hasta ayer».

**2026-09-21 — Sin librería de gráficos.**
Una curva y cuatro listas con barras no justifican una dependencia. SVG propio,
con una tabla oculta para lectores de pantalla.

**2026-09-21 — Pruebas con el runner de Node, sin dependencias nuevas.**
El repo no tiene test runner y no vale la pena sumar uno por tres archivos de
funciones puras: `node --test` corre por `tsx`, que ya está instalado.

**2026-09-21 — Primero el primer deploy, en su propia lane.**
Sin el sitio en Vercel no hay nada que contar, y publicar el sitio es un paso
con valor propio para todo el equipo. Va antes y aparte
(`work/primer-deploy/`).

**2026-09-21 — Los visitantes de una ventana se piden como rango, no se suman por día.**
De la revisión del spec: un visitante que entra tres días cuenta tres veces si
se suman las filas diarias, y las tarjetas de portada quedarían infladas y
nunca coincidirían con el dashboard de Vercel. Tabla aparte
(`metricas_ventanas`) con cuatro consultas de rango por corrida.

**2026-09-21 — Nueve consultas por corrida, no cinco por día.**
La API acepta dos dimensiones por consulta: `by=day` más la dimensión sobre el
rango entero trae todos los días de una vez. El backfill de 30 días baja de 150
llamadas a nueve.

**2026-09-21 — «Actualizar ahora» verifica la sesión adentro de la acción.**
Una Server Action corre antes de renderizar el layout protegido, así que el
layout no la cubre y el middleware solo mira que la cookie exista. La acción
llama a `auth.api.getSession()` y corta si no hay.

**2026-09-21 — La forma de `datos/` es la del spec del admin.**
`consultas/` lee, `acciones/` escribe, única puerta a la base. El cliente HTTP
de la API de Vercel no es una puerta a la base: va en `lib/metricas/`.

**2026-09-21 — Los mapeos se escriben contra respuestas reales grabadas.**
No hay proyecto en Vercel todavía, así que no se pueden grabar hoy: es la
primera tarea de la fase A, después del primer deploy. Si alguna dimensión no
trae `visitors`, el modelo se ajusta ahí y queda anotado acá.

**2026-09-21 — Los días son UTC.**
Es como agrupa la API. El panel lo dice en la cabecera; en un número mensual
no se nota.

**2026-09-21 — El panel es una sección de la portada, no la portada.**
La fase 2 de Mateo le cuelga a la portada la navegación de las entidades, y las
dos lanes van en paralelo por pedido del owner. `PanelMetricas` entra como
primera sección de `(protegido)/page.tsx`; la portada sigue siendo de todos.

**2026-09-21 — El botón «Actualizar ahora» tiene freno de diez minutos.**
Es el único disparador a mano de un token que abre toda la cuenta, y el rate
limit de better-auth no lo cubre. Si la última sincronización tiene menos de
diez minutos, la acción no llama a la API y lo dice.

**2026-09-21 — La fila «el resto» lleva `agrupado = true`, no un valor mágico.**
`valor = "otros"` podía chocar con un host real.

**2026-09-21 — El token lo crea Facundo, solo en Production.**
Vercel no da alcances más chicos que la cuenta. Un año de vencimiento, cargado
en Production; para probar en local, en `.env.local` y nada más.

**2026-09-21 — `_vercel` fuera del matcher del middleware.**
Cada beacon a `/_vercel/insights/view` pasaba por el middleware y gastaba una
invocación por vista. Es un cambio de una línea en el middleware de Mateo y
entra en la fase A.

**2026-09-21 — `agrupado` entra en la clave de `metricas_diarias`.**
La revisión de A6 encontró que el referido vacío (tráfico directo, muy común)
y la fila «el resto» compartían `valor = ""` en el mismo día: misma clave,
una pisaba a la otra. La clave pasa a `(fecha, dimension, valor, agrupado)`
con una segunda migración; el valor mágico se sigue descartando.

**2026-09-21 — `total` se guarda al final de cada corrida.**
Es la marca de agua de lo copiado: si se guardara primero y fallara otra
dimensión, la corrida siguiente daría esos días por hechos y los agujeros
quedarían para siempre. Al final, una corrida rota se repite entera al día
siguiente.

**2026-09-21 — Los upserts de una misma respuesta van en paralelo.**
El gate (react-doctor, `async-await-in-loop`) no admite el `await` fila por
fila del plan. Son claves distintas y el Pool de pg los acota a 10 a la vez;
la pausa entre llamadas a la API de Vercel se mantiene.

**2026-09-21 — El middleware no redirige las Server Actions; cada acción verifica la sesión.**
Una acción sin cookie redirigida a `/admin/entrar` no llega a la pantalla: el
cliente de Next rompe con «unexpected response». El middleware deja pasar
las peticiones con cabecera `Next-Action` y la acción contesta en llano
(«Hay que entrar al admin para actualizar.»). Regla que hereda la fase 2:
toda Server Action del admin verifica la sesión ella misma, porque el layout
protegido nunca las cubre.
