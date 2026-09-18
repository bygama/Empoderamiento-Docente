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
