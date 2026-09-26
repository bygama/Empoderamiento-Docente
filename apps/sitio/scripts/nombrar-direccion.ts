import { config as cargarEntorno } from "dotenv";
cargarEntorno({ path: [".env.local", ".env"], quiet: true });

/**
 * Nombra a la primera persona que dirige, cuando ya tiene cuenta.
 *
 *   pnpm --filter sitio nombrar-direccion <correo>
 *
 * Es el caso de producción: la persona de ED que va a dirigir ya entraba al
 * admin con otro rol, y `crear-cuenta` solo da de alta. Se niega si el correo
 * no tiene cuenta o si ya hay quien dirige: de ahí en más, la dirección se
 * pasa desde Cuentas, y eso lo hace quien dirige.
 */
const [correo] = process.argv.slice(2);

if (!correo) {
  console.error("Uso: pnpm --filter sitio nombrar-direccion <correo>");
  process.exit(2);
}

const { base } = await import("../src/datos/cliente");
const { nombrarDireccion } = await import("../src/datos/direccion");

const resultado = await nombrarDireccion(correo);
await base.$disconnect();

if (!resultado.ok) {
  console.error(resultado.motivo);
  process.exit(1);
}
console.log(`${resultado.nombre} (${correo}) dirige desde ahora.`);
