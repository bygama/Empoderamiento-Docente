import { config as cargarEntorno } from "dotenv";
cargarEntorno({ path: [".env.local", ".env"], quiet: true });

/**
 * Da de alta una cuenta del admin.
 *
 *   pnpm --filter sitio crear-cuenta <correo> "<nombre>" [administra|edita]
 *
 * Existe porque **no hay registro público**: `disableSignUp` está prendido a
 * propósito, así que la primera cuenta —la de quien administra— tiene que
 * entrar por algún lado, y ese lado es un comando con acceso a la base y no
 * una pantalla abierta en internet.
 *
 * No pide contraseña: crea la cuenta y la persona elige la suya por «olvidé
 * mi contraseña». Así la contraseña no viaja por el historial del shell ni la
 * conoce quien da el alta.
 */
const [correo, nombre, rolPedido = "edita"] = process.argv.slice(2);

if (!correo || !nombre) {
  console.error('Uso: pnpm --filter sitio crear-cuenta <correo> "<nombre>" [administra|edita]');
  process.exit(2);
}

const { auth } = await import("../src/datos/auth");
const { base } = await import("../src/datos/cliente");
const { esRol } = await import("@ed/auth");

if (!esRol(rolPedido)) {
  console.error(`Rol inválido: ${rolPedido}. Tiene que ser "administra" o "edita".`);
  process.exit(2);
}

const ya = await base.user.findUnique({ where: { email: correo } });
if (ya) {
  console.error(`Ya existe una cuenta con ${correo}.`);
  process.exit(1);
}

const ctx = await auth.$context;
await ctx.internalAdapter.createUser(
  { email: correo, name: nombre, emailVerified: false, rol: rolPedido },
  // El segundo argumento dice de dónde salió la cuenta. No es un OAuth ni un
  // SSO: la crea alguien con acceso a la base, desde una terminal.
  { method: "admin" },
);

console.log(`Cuenta creada: ${correo} (${rolPedido})`);
console.log("Ahora entrá a /admin/olvide-mi-contrasena con ese correo para elegir la contraseña.");
await base.$disconnect();
