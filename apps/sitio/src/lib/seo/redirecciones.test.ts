import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarRuta, rutaDeSegmentos, validarRedireccion, type Contexto } from "./redirecciones";

// Cuándo se guarda una redirección escrita a mano: rutas relativas, «hacia»
// una página que existe, «desde» una que no, y sin cadenas ni ciclos.

const CONTEXTO: Contexto = {
  rutas: ["/", "/contacto", "/novedades", "/novedades/nueva"],
  existentes: [{ desde: "/novedades/vieja", hacia: "/novedades/nueva" }],
  reservadas: ["/admin", "/api"],
};
const validar = (desde: string, hacia: string, contexto = CONTEXTO) => validarRedireccion({ desde, hacia }, contexto);
const error = (resultado: ReturnType<typeof validar>) => (resultado.ok ? null : `${resultado.campo}: ${resultado.detalle}`);

test("una redirección válida se guarda normalizada", () => {
  assert.deepEqual(validar("  /taller-2025/ ", "/contacto/"), { ok: true, redireccion: { desde: "/taller-2025", hacia: "/contacto" } });
  assert.deepEqual(validar("/viejo", "/"), { ok: true, redireccion: { desde: "/viejo", hacia: "/" } });
});

test("solo rutas relativas del sitio: nada de otro dominio, espacios, ? ni #", () => {
  for (const mala of ["viejo", "//ejemplo.org/x", "https://ejemplo.org", "/con espacio", "/a?b=1", "/a#b", "/a\\b", `/${"x".repeat(200)}`]) {
    assert.equal(normalizarRuta(mala), null, mala);
  }
  assert.match(error(validar("//otro.org", "/contacto")) ?? "", /^desde: .*una sola \//);
  assert.match(error(validar("/viejo", "https://otro.org")) ?? "", /^hacia: /);
});

test("desde no puede ser una página que existe, una reservada ni una que ya redirige", () => {
  assert.match(error(validar("/contacto", "/")) ?? "", /es una página que existe/);
  assert.match(error(validar("/admin/cuentas", "/")) ?? "", /reservada/);
  assert.match(error(validar("/api", "/")) ?? "", /reservada/);
  assert.equal(validar("/administracion", "/").ok, true);
  assert.match(error(validar("/novedades/vieja", "/contacto")) ?? "", /Ya hay una redirección desde/);
});

test("hacia tiene que ser una página que existe, y nunca la misma ruta", () => {
  assert.match(error(validar("/viejo", "/no-existe")) ?? "", /^hacia: .*no es una página del sitio/);
  assert.match(error(validar("/viejo", "/viejo")) ?? "", /misma ruta/);
});

test("la ruta de una atrapa-todo, con sus segmentos decodificados", () => {
  assert.equal(rutaDeSegmentos(["novedades", "a%C3%B1o-2025"]), "/novedades/año-2025");
  assert.equal(rutaDeSegmentos(["mal%E0"]), "/mal%E0");
});

test("sin cadenas ni ciclos, aunque las rutas del sitio cambien", () => {
  // Una ruta que dejó de existir y ya redirige: no se puede apuntar ahí.
  const contexto = { ...CONTEXTO, rutas: [...CONTEXTO.rutas, "/novedades/vieja"] };
  assert.match(error(validar("/otra", "/novedades/vieja", contexto)) ?? "", /ya redirige a «\/novedades\/nueva»/);
  // Algo ya lleva a «desde»: sumar una desde ahí haría una cadena.
  const hacia = { ...CONTEXTO, existentes: [{ desde: "/a", hacia: "/b" }] };
  assert.match(error(validar("/b", "/contacto", hacia)) ?? "", /lleva a «\/b»/);
});
