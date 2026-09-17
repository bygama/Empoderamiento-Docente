import { TAMBORES } from "../../data";
import {
  ALINEA,
  ARRANQUE,
  CHIP_ANGS,
  GIRO_SALIDA,
  GIRO_TOTAL,
  SALIDA,
  SUBIDA_SALIDA,
  type Geo,
} from "./geometria-torre";
import { DEG, ESCALA_LINEA, pintarLetras } from "./enrollado-torre";
import { cruzarApoyo, pintarCapas } from "./capas-torre";
import type { RefsTorre } from "./refs-torre";

/** Estado que comparten el pintor y el armado (mutable, sin renders). */
export type EstadoTorre = {
  build: { velo: number; linea: number; apoyo: number; rollo: number; foto: number; chips: number };
  avance: { p: number };
};

/**
 * El pintor: dueño de `ocultos` (qué tambores están fuera de cuadro),
 * `activo` (la estación en curso) y `fijado` (qué tambor ya escribió su
 * transform final). Escribe estilos a mano — nada de tweens por frame.
 */
export function crearPintor(refs: RefsTorre, geo: Geo) {
  const n = TAMBORES.length;
  const ocultos: boolean[] = TAMBORES.map(() => false);
  let activo = 0;
  const estado: EstadoTorre = {
    build: { velo: 1, linea: 0, apoyo: 0, rollo: 0, foto: 0, chips: 0 },
    avance: { p: 0 },
  };
  const { build, avance } = estado;
  // Transform final de cada tambor escrito UNA vez (i>0: al primer frame;
  // i=0: al cerrar el rollo). Se limpia al rearmar.
  const fijado: boolean[] = TAMBORES.map(() => false);

  // FASE por tambor: al llegar a la estación i (p = i/(n-1)) la primera
  // letra del nombre cae en ALINEA. Reemplaza al desfase arbitrario de
  // antes (i·47), que te dejaba leyendo desde la mitad.
  // El giro por scroll va con signo NEGATIVO: bajando, las letras del
  // frente corren hacia la izquierda, que es el sentido en que se lee.
  // Antes iba al revés y el nombre te escapaba; se leía mejor subiendo.
  const fase = TAMBORES.map((_, i) => ALINEA - geo.drums[i].angs[0] + (i / (n - 1)) * GIRO_TOTAL);
  // Sin deriva no hace falta asentado: en cada estación el nombre queda
  // alineado por construcción.
  const rotDe = (i: number, pv: number, salida: number) =>
    fase[i] - pv * GIRO_TOTAL - salida * GIRO_SALIDA;

  // Geometría del ENROLLADO del primer tambor. En la línea, el nombre
  // (primera copia, sin separador) queda centrado al frente; las demás
  // copias y los "•" se encienden recién cuando el arco cierra.
  const g0 = geo.drums[0];
  const nombreLen = Array.from(TAMBORES[0].tambor).length;
  const rotLinea = -(g0.angs[0] + g0.angs[nombreLen - 1]) / 2;

  const pintar = () => {
    // Viaje de la torre: el avance de la zona menos el arranque (ver
    // ARRANQUE_SVH).
    const pv = Math.min(1, Math.max(0, (avance.p - ARRANQUE) / (1 - ARRANQUE - SALIDA)));
    // Cola de salida (0→1 en el último tramo de la zona, ver SALIDA_SVH).
    const salida = Math.min(1, Math.max(0, (avance.p - (1 - SALIDA)) / SALIDA));
    // Tarjeta y rieles se apagan en la primera mitad de la cola: el tubo
    // se va solo, sin UI colgada.
    const uiSalida = 1 - Math.min(1, salida / 0.55);

    pintarCapas(refs, estado, salida, uiSalida);
    // En la cola la torre sigue subiendo: el 07 sale por arriba.
    const y = -(pv * (n - 1) + salida * SUBIDA_SALIDA) * geo.sp;
    if (refs.tower.current) refs.tower.current.style.transform = `translateY(${y}px)`;
    for (let i = 0; i < n; i++) {
      const drum = refs.drums.current[i];
      const foto = refs.fotos.current[i];
      if (!drum) continue;
      const wy = i * geo.sp + y; // 0 = centro de cámara
      const visible = Math.abs(wy) < geo.alto * 1.05;
      if (!visible) {
        if (!ocultos[i]) {
          drum.style.visibility = "hidden";
          if (foto) foto.style.visibility = "hidden";
          ocultos[i] = true;
        }
        continue;
      }
      if (ocultos[i]) {
        drum.style.visibility = "";
        if (foto) foto.style.visibility = "";
        ocultos[i] = false;
      }
      // Giro: fase del tambor + scroll (en sentido de lectura).
      const rot = rotDe(i, pv, salida);
      // Solo el PRIMER tambor se arma: es el que recibe el deslumbre. Los
      // demás ya llegan montados desde arriba, como siempre.
      const rollo = i === 0 ? build.rollo : 1;
      const enRollo = rollo < 1;
      // Durante el rollo el tambor NO gira como div: cada letra lleva su
      // ángulo efectivo (ver `pintarLetras`), porque la línea tiene que
      // mirar a cámara sea cual sea la fase. Crece de ESCALA_LINEA a 1.
      if (enRollo) {
        const esc = ESCALA_LINEA + (1 - ESCALA_LINEA) * rollo;
        drum.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp}px) scale(${esc})`;
      } else {
        drum.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp}px) rotateY(${rot}deg)`;
      }
      // La foto viaja CON la torre, un toque más lenta (parallax): sube
      // pegada a su tambor en vez de encenderse quieta en el centro. Las
      // fotos apiladas en el eje de cámara se leían como un parpadeo — un
      // cambio de imagen sin recorrido, justo lo contrario del viaje que
      // cuenta la sección. La 01 sí nace con el armado: crece desde el eje
      // cuando el tubo ya cerró y hay un "adentro" donde ponerla.
      if (foto) {
        const nac = i === 0 ? build.foto : 1;
        foto.style.opacity = String(nac);
        foto.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp - wy * 0.1}px) scale(${0.4 + 0.6 * nac})`;
      }
      const copiaFade = pintarLetras({
        spans: refs.spans.current[i] ?? [],
        g: geo.drums[i],
        geo,
        rot,
        rollo,
        rotNow: enRollo ? rotLinea + (rot - rotLinea) * rollo : rot,
        enRollo,
        linea: build.linea,
        fijar: !fijado[i],
        acento: TAMBORES[i].acento,
        nombreLen,
      });
      if (!enRollo) fijado[i] = true;

      // Aros del cilindro: alrededor de una línea recta no tienen sentido;
      // entran con el arco.
      const aros = refs.aros.current[i] ?? [];
      for (let k = 0; k < aros.length; k++) {
        const aro = aros[k];
        if (aro) aro.style.opacity = String(copiaFade);
      }

      // Chips de frase: legibles solo del lado de adelante. Entran recién
      // con el rollo CERRADO (si aparecen con las letras, el momento se
      // ensucia: son dos lecturas compitiendo; y durante el rollo el div
      // no gira, así que quedarían desfasados de las letras).
      const chipArm = i === 0 ? build.chips : 1;
      const chips = refs.chips.current[i] ?? [];
      for (let k = 0; k < chips.length; k++) {
        const chip = chips[k];
        if (!chip) continue;
        const a = (((CHIP_ANGS[k] + rot) % 360) + 360) % 360;
        const c = Math.cos(a * DEG);
        chip.style.opacity = c > 0.12 ? String((0.2 + 0.8 * c) * chipArm) : "0";
      }

    }

    // El apoyo YA NO se apaga durante el viaje: tiene contenedor propio, así
    // que el tambor que llega le pasa por detrás sin ensuciarlo. Antes se
    // desvanecía para no pisarse con la foto y quedaba ilegible justo en el
    // tramo en que uno lee.
    const pos = pv * (n - 1);

    // Riel derecho: barra y porcentaje del recorrido.
    if (refs.fill.current) refs.fill.current.style.transform = `scaleY(${pv})`;
    const pct = `${Math.round(pv * 100)}%`;
    if (refs.pct.current && refs.pct.current.textContent !== pct) {
      refs.pct.current.textContent = pct;
    }

    // Estación activa → cruzar los textos de apoyo (sin re-render React).
    const act = Math.min(n - 1, Math.max(0, Math.round(pos)));
    if (act !== activo) {
      activo = act;
      cruzarApoyo(refs, act);
    }
  };

  /** Vuelve el armado a cero (lo llama `rebobinar`). */
  const resetBuild = () => {
    build.velo = 1;
    build.linea = build.apoyo = build.rollo = build.foto = build.chips = 0;
    fijado[0] = false;
  };

  return { pintar, estado, resetBuild };
}
