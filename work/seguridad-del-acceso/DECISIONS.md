# DECISIONS — Seguridad del acceso

- 2026-09-22 — **El diseño**, aprobado por Mateo en conversación (shaping,
  secciones 3 a 6): Resend por `fetch`, rate limit en la base, bloqueo por
  cuenta con HMAC, sesión de 12 h con `SameSite=Strict`, Argon2id, nonce y
  `proxy.ts`. Llega por el brief del padre; el SPEC lo formaliza.
- 2026-09-26 — **SPEC aprobado** por el padre, con los cinco puntos de su §8:
  1. **Las columnas de `bloqueos_de_acceso`** (`clave`, `fallos`, `desde`,
     `bloqueos`, `hasta`) quedan tal cual el §6.1. **Mateo, en sus palabras:
     «Sí, las dos».**
  2. **`'unsafe-eval'`** solo en la CSP nueva del admin y solo en desarrollo;
     la CSP del sitio queda como está.
  3. **`tsx` como devDependency de `packages/auth`**, la misma versión que
     `apps/sitio`, con su script `test`; el `pnpm test` de la raíz lo toma
     solo (`-r --if-present`). **Mateo, en sus palabras: «Sí, las dos».**
  4. **Un reintento en el cliente de Resend:** uno solo, con la misma
     `Idempotency-Key`, únicamente ante timeout, error de red o 5xx. Un 4xx no
     se reintenta.
  5. **`FormularioEntrar` consulta la sesión también al cargar.** Mientras
     consulta, el formulario no parpadea (se muestra entero y usable desde el
     principio), y si la consulta falla, el formulario queda usable igual.
