import { config as cargarEntorno } from "dotenv";
cargarEntorno({ path: [".env.local", ".env"], quiet: true });

/**
 * Da de alta una cuenta del admin.
 *
 *   pnpm --filter sitio crear-cuenta <correo> "<nombre>" [dirige|administra|edita]
 *
 * Existe porque **no hay registro público**: `disableSignUp` está prendido a
 * propósito, así que la primera cuenta —la de quien dirige— tiene que entrar
 * por algún lado, y ese lado es un comando con acceso a la base y no una
 * pantalla abierta en internet.
 *
 * Dirige es una sola: si ya hay quien dirige, se niega (la dirección se pasa
 * desde Cuentas). Para nombrar a alguien que ya tiene cuenta,
 * `nombrar-direccion`.
 *
 * No pide contraseña: crea la cuenta y la persona elige la suya por «olvidé
 * mi contraseña». Así la contraseña no viaja por el historial del shell ni la
 * conoce quien da el alta.
 */
const { ROLES, ROL_POR_DEFECTO, esRol, esUnaSola } = await import("@ed/auth");
const [correo, nombre, rolPedido = ROL_POR_DEFECTO] = process.argv.slice(2);
const USO = `Uso: pnpm --filter sitio crear-cuenta <correo> "<nombre>" [${ROLES.join("|")}]`;

if (!correo || !nombre) {
  console.error(USO);
  process.exit(2);
}

if (!esRol(rolPedido)) {
  console.error(`Rol inválido: ${rolPedido}. Tiene que ser ${ROLES.slice(0, -1).join(", ")} o ${ROLES[ROLES.length - 1]}.`);
  process.exit(2);
}

const { auth } = await import("../src/datos/auth");
const { base } = await import("../src/datos/cliente");
const { quienDirige } = await import("../src/datos/direccion");

const ya = await base.user.findUnique({ where: { email: correo } });
if (ya) {
  console.error(`Ya existe una cuenta con ${correo}.`);
  process.exit(1);
}

const direccion = esUnaSola(rolPedido) ? await quienDirige() : null;
if (direccion) {
  console.error(`Ya dirige ${direccion.nombre} (${direccion.correo}): dirige es una sola. La dirección se pasa desde Cuentas.`);
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
