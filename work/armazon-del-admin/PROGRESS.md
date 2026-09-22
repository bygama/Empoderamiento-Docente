# PROGRESS — El armazón del admin

- **Rama:** `mateo/armazon-del-admin`
- **Base:** `7ee66e5` (= `origin/main` al 2026-09-22)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `7ee66e5` el 2026-09-22 (verificación del PR #172, mismo árbol):
`pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 · `pnpm test` 69
tests, 68 pasan, 0 fallan, 1 salteado · `pnpm build` 0 (21/21).

**El script de contraste** (fórmula WCAG 2.x; se le pasan pares
`"#texto:#fondo"` en hex y devuelve la razón):

```
node -e "const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};for(const p of process.argv.slice(1)){const[a,b]=p.split(':');const x=L(a),y=L(b);console.log(p,((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2))}" "#1f2d4d:#e07a2f" "#ffffff:#1f2d4d"
```

Medido el 2026-09-22: blanco sobre `naranja-accion` 3,00 · `azul-principal`
sobre `naranja-accion` 4,54 · blanco sobre `azul-principal` 13,63 ·
`azul-claro` sobre `azul-principal` 7,68.

## Done

- 2026-09-22 — SPEC aprobado por el owner (design-first).

- 2026-09-22 — PLAN y lista de commits aprobados por el owner.

## In progress

- Paso 1.

## Tried and failed

## Next

- Paso 1.

## Verification
