import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarRuta, rutaDeSegmentos, validarRedireccion, type Contexto } from "./redirecciones";

// Cuándo se guarda una redirección escrita a mano: rutas relativas, «hacia»
// una página que existe, «desde» una que el sitio no contesta, y sin cadenas
// ni ciclos.

const CONTEXTO: Contexto = {
  rutas: ["/", "/contacto", "/novedades", "/novedades/nueva"],
  existentes: [{ desde: "/novedades/vieja", hacia: "/novedades/nueva" }],
  declaradas: [
    { ruta: "/admin/[[...todo]]", contesta: "sola" },
    { ruta: "/api/[[...todo]]", contesta: "sola" },
    { ruta: "/robots.txt", contesta: "sola" },
    { ruta: "/equipo", contesta: "archivos" },
    { ruta: "/novedades/[slug]", contesta: "o-redirige" },
    { ruta: "/[...resto]", contesta: "o-redirige" },
  ],
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

test("desde no puede ser una ruta que el sitio contesta, ni una que ya redirige", () => {
  const yaExiste = /^desde: «.+» ya existe en el sitio: una redirección ahí nunca se aplicaría\.$/;
  assert.match(error(validar("/contacto", "/")) ?? "", yaExiste);
  assert.match(error(validar("/admin/cuentas", "/")) ?? "", yaExiste);
  assert.match(error(validar("/api", "/")) ?? "", yaExiste);
  assert.match(error(validar("/robots.txt", "/")) ?? "", yaExiste);
  assert.match(error(validar("/equipo/foto.jpg", "/")) ?? "", /^desde: «\/equipo\/foto\.jpg» es la ruta de un archivo de \/equipo/);
  assert.equal(validar("/administracion", "/").ok, true);
  assert.equal(validar("/equipo", "/").ok, true);
  // La ficha de una novedad que no existe busca la redirección: ahí sí se aplica.
  assert.equal(validar("/novedades/otra-vieja", "/").ok, true);
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
