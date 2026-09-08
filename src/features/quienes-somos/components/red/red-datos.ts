// ── Geometría orgánica de la red (viewBox 1200×700) y quiénes la sostienen ──
export const CX = 560;
export const CY = 330;

export const R = { specHalo: 22, specDot: 12, paisHalo: 13, paisDot: 7, edHalo: 52, edDot: 36 } as const;

export const SPECS = [
  { key: "curriculum", label: "Currículum", x: 655, y: 100, d: "Diseños curriculares y su homologación." },
  { key: "evaluacion", label: "Evaluación", x: 880, y: 245, d: "Instrumentos, psicometría e impacto." },
  { key: "materiales", label: "Materiales", x: 815, y: 480, d: "Fichas, libros y guías para el aula." },
  { key: "tecnologia", label: "Tecnología", x: 560, y: 575, d: "Recursos y plataformas digitales." },
  { key: "modelacion", label: "Modelación", x: 315, y: 480, d: "La matemática de los contextos reales." },
  { key: "ia", label: "Inteligencia artificial", x: 285, y: 195, d: "Nuevas herramientas para enseñar y aprender." },
] as const;

export type SpecKey = (typeof SPECS)[number]["key"];

export const PAISES = [
  { label: "México", x: 430, y: 62 },
  { label: "Chile", x: 905, y: 92 },
  { label: "Argentina", x: 1058, y: 400 },
  { label: "Brasil", x: 705, y: 655 },
  { label: "Colombia", x: 128, y: 350 },
] as const;

// Quiénes se convocan por área (inferido de Equipo ED.docx — validar).
export const AREA_PERSONAS: Record<SpecKey, Array<{ key: string; nombre: string }>> = {
  curriculum: [{ key: "judith-hernandez", nombre: "Judith Hernández" }],
  evaluacion: [
    { key: "marcela-cano", nombre: "Marcela Cano" },
    { key: "luis-cabrera", nombre: "Luis Cabrera" },
  ],
  materiales: [
    { key: "gabriela-buendia", nombre: "Gabriela Buendía" },
    { key: "wendolyne-rios", nombre: "Wendolyne Ríos" },
    { key: "darly-ku-euan", nombre: "Darly Ku-Euan" },
  ],
  tecnologia: [
    { key: "ivan-perez", nombre: "Iván Pérez" },
    { key: "eduardo-briceno", nombre: "Eduardo Briceño" },
  ],
  modelacion: [
    { key: "ivan-perez", nombre: "Iván Pérez" },
    { key: "pedro-vidal-szabo", nombre: "Pedro Vidal-Szabo" },
  ],
  ia: [],
};

// Curva con comba perpendicular (trazo orgánico, no regla)
export const curve = (x1: number, y1: number, x2: number, y2: number, bow: number) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${x1} ${y1} Q ${(mx + nx * bow).toFixed(1)} ${(my + ny * bow).toFixed(1)} ${x2} ${y2}`;
};

export const pct = (x: number, y: number) => ({
  left: `${(x / 1200) * 100}%`,
  top: `${(y / 700) * 100}%`,
});
