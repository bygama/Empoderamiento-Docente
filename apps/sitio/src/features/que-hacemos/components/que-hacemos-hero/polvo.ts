// ── Polvo de estrellas del primer viewport ─────────────────────────────────
// El cielo real lo pinta el fondo compartido + la escena del faro (detrás);
// esta capa fina y tenue vive solo en el hero: densifica el arranque ahora
// que las fotos flotantes no están. LCG determinista (misma constelación en
// server y client — Math.random rompería la hidratación).
export const POLVO = (() => {
  let s = 20260828;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: 46 }, () => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.6 + rnd() * 1.1,
    o: 0.08 + rnd() * 0.22,
  }));
})();
