import gsap from "gsap";

/** Catmull-Rom → cúbicas de Bézier: camino suave que pasa por cada punto. */
function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }
  return d.join(" ");
}

/**
 * Construye el trazo del camino: nace bajo el nombre, serpentea entre los
 * nodos de etapa (con puntos-guía que abrazan el lado del nodo hasta pasar
 * el bloque de contenido, para no atravesar texto) y converge al centro
 * hacia el nodo ED del cierre. Escribe el viewBox del svg y el `d` del path.
 */
export function construirCamino(track: HTMLElement, svg: SVGSVGElement, path: SVGPathElement) {
  const tr = track.getBoundingClientRect();
  const nodes = gsap.utils.toArray<HTMLElement>("[data-stage-node]", track);
  if (!nodes.length) return;
  const pts: Array<{ x: number; y: number }> = [];
  // Nace desde la zona donde aterrizó el nombre (izquierda, arriba).
  const firstRect = nodes[0].getBoundingClientRect();
  pts.push({
    x: Math.min(firstRect.left - tr.left + firstRect.width / 2, 120),
    y: firstRect.top - tr.top - 170,
  });
  nodes.forEach((n) => {
    const r = n.getBoundingClientRect();
    const li = n.closest("li");
    const nx = r.left - tr.left + r.width / 2;
    const ny = r.top - tr.top + r.height / 2;
    pts.push({ x: nx, y: ny });
    // Punto-guía de salida: abraza el lado del nodo hasta pasar el
    // bloque de contenido y recién ahí cruza (nunca atraviesa texto).
    if (li) {
      const lr = li.getBoundingClientRect();
      const inward = n.dataset.nodeSide === "right" ? -44 : 44;
      pts.push({ x: nx + inward, y: lr.bottom - tr.top + 46 });
    }
  });
  // Convergencia: el trazo confluye al centro, hacia el nodo ED del cierre.
  const cxTrack = tr.width / 2;
  const last = pts[pts.length - 1];
  pts.push({ x: cxTrack, y: last.y + 130 });
  pts.push({ x: cxTrack, y: tr.height - 6 });
  svg.setAttribute("viewBox", `0 0 ${tr.width.toFixed(1)} ${tr.height.toFixed(1)}`);
  path.setAttribute("d", smoothPath(pts));
}
