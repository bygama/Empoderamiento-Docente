import { BlockList, isIP } from "node:net";

// Las direcciones a las que el servidor no le pide nada cuando el destino lo
// eligió una persona (un link pegado, el link de un material): la red interna,
// la máquina misma, la metadata de la nube y todo lo que no es internet
// pública (SPEC §11 de `work/biblioteca/`, ADR-0016). Sin ED.

const NO_SE_PIDEN = new BlockList();

// IPv4: RFC 6890 y sus vecinos. `BlockList` también compara contra estas las
// IPv4 escritas como IPv6 (`::ffff:127.0.0.1`).
for (const [red, prefijo] of [
  ["0.0.0.0", 8], // «esta red»
  ["10.0.0.0", 8], // privada
  ["100.64.0.0", 10], // compartida (CGNAT)
  ["127.0.0.0", 8], // la máquina misma
  ["169.254.0.0", 16], // enlace local, y la metadata de la nube (169.254.169.254)
  ["172.16.0.0", 12], // privada
  ["192.0.0.0", 24], // asignaciones del IETF
  ["192.0.2.0", 24], // documentación
  ["192.88.99.0", 24], // relé 6to4
  ["192.168.0.0", 16], // privada
  ["198.18.0.0", 15], // pruebas de rendimiento
  ["198.51.100.0", 24], // documentación
  ["203.0.113.0", 24], // documentación
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reservada, y el broadcast
] as const) {
  NO_SE_PIDEN.addSubnet(red, prefijo, "ipv4");
}

// IPv6: solo la unicast global (2000::/3) es internet pública; adentro de
// ella, lo que no se pide: los túneles que esconden una IPv4 (Teredo, 6to4),
// lo de documentación y los rangos de protocolo del IETF.
const GLOBAL = new BlockList();
GLOBAL.addSubnet("2000::", 3, "ipv6");
for (const [red, prefijo] of [
  ["2001::", 23], // asignaciones del IETF, con Teredo (2001::/32) y ORCHID
  ["2001:db8::", 32], // documentación
  ["2002::", 16], // 6to4: esconde una IPv4
  ["3fff::", 20], // documentación
] as const) {
  NO_SE_PIDEN.addSubnet(red, prefijo, "ipv6");
}

/**
 * ¿Es una dirección a la que no se le pide nada? Lo que no es una IP también
 * da `true`: ante la duda, no se pide.
 */
export function ipQueNoSePide(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return NO_SE_PIDEN.check(ip, "ipv4");
  if (version !== 6) return true;
  // Una IPv4 escrita como IPv6 se juzga como IPv4.
  if (/^::ffff:/i.test(ip)) return NO_SE_PIDEN.check(ip, "ipv6");
  return !GLOBAL.check(ip, "ipv6") || NO_SE_PIDEN.check(ip, "ipv6");
}
