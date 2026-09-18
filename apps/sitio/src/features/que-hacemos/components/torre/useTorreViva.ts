import { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TAMBORES } from "../../data";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ARRANQUE, SALIDA, calcularGeo, limpiarCacheAnchos, type Geo } from "./geometria-torre";
import { crearPintor } from "./pintar-torre";
import { crearArmado } from "./armado-torre";
import type { RefsTorre } from "./refs-torre";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La torre viva: el gate por viewport, la geometría medida y la coreografía
 * (pintor + armado + los dos ScrollTriggers de la zona). Devuelve lo que el
 * markup necesita: si la torre corre, su geometría y el salto por riel.
 */
export function useTorreViva(refs: RefsTorre) {
  const { zone: zoneRef, stage: stageRef, tower: towerRef } = refs;
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);
  const [geo, setGeo] = useState<Geo | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // 1024, no 768: el tambor necesita ancho para que el título envuelto se
    // lea. En tablet salía cortado contra los bordes, el rótulo se montaba
    // sobre la foto y la escena quedaba ilegible. Abajo de eso va la lista.
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const medir = () => setGeo(calcularGeo(window.innerWidth, window.innerHeight));
    medir();
    // Los anchos se miden con canvas: si Manrope todavía no cargó, la primera
    // pasada usa la fuente de fallback y los ángulos quedan mal repartidos.
    // Al resolverse fonts.ready se limpia el cache y se recalcula.
    let vivo = true;
    document.fonts?.ready.then(() => {
      if (!vivo) return;
      limpiarCacheAnchos();
      medir();
    });
    window.addEventListener("resize", medir);
    return () => {
      vivo = false;
      window.removeEventListener("resize", medir);
    };
  }, [live]);

  useIsomorphicLayoutEffect(() => {
    if (!live || !geo) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage || !towerRef.current) return;

    const { pintar, estado, resetBuild } = crearPintor(refs, geo);
    const { armar, rebobinar, completar, matar } = crearArmado(zone, estado, pintar, resetBuild);

    // Nace APAGADO. La torre pinta por encima del faro (z-20), así que con la
    // opacidad por defecto (1) se vería montada sobre la escena nocturna y
    // taparía el flash. Se prende de golpe con la zona y se apaga solo al
    // salir por ARRIBA (ver `mostrar`): en ese borde el corte es INMEDIATO,
    // no un fundido — pasado el borde el escenario deja de estar pineado y se
    // DESLIZA con la página; desvanecerlo hacía que se lo viera resbalar. Y
    // ahí el faro está en blanco pleno, igual que el velo: el relevo no se ve.
    stage.style.opacity = "0";

    // Sin repintado por frame: nada se mueve solo. La torre la pinta el
    // scrub (onUpdate) y el armado su propia línea de tiempo. Acá corría un
    // ticker para el latido y la deriva en reposo, que ya no existen — y
    // repintar siete tambores a 60 fps con el scroll quieto era CPU tirada.
    const ctx = gsap.context(() => {
      // Quince capas con fotos de 30vmin: el hint entra con la escena (solo
      // con `live`) y se va con el contexto. En la clase promovía la torre
      // entera aunque la sección estuviera a tres pantallas de distancia.
      gsap.set(
        [towerRef.current, ...refs.drums.current, ...refs.fotos.current].filter(Boolean),
        { willChange: "transform" },
      );
      // El escenario se prende con la zona y se apaga SOLO al salir por
      // ARRIBA (progreso 0), donde el flash del faro tiene que quedar
      // despejado. Por ABAJO se queda prendido: al terminar la zona el
      // sticky se suelta y el escenario sube con la página, con el último
      // tambor y su apoyo a la vista. Antes se apagaba en los dos bordes y
      // al final del recorrido quedaba una pantalla gris vacía (el fondo del
      // body) que había que scrollear a ciegas hasta que entraba «Cómo
      // trabajamos». onRefresh cubre cargar la página ya scrolleada.
      // Va en los CUATRO callbacks de borde y no en onToggle: si el scroll
      // salta la zona entera en un solo update (tecla Inicio desde «Cómo
      // trabajamos», por ejemplo) ScrollTrigger pasa de "afuera por abajo" a
      // "afuera por arriba" sin toggle, pero sí dispara onEnterBack y
      // onLeaveBack — y el escenario tiene que apagarse igual.
      const mostrar = (self: ScrollTrigger) => {
        stage.style.opacity = self.isActive || self.progress >= 1 ? "1" : "0";
      };
      gsap.to(estado.avance, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onEnter: mostrar,
          onEnterBack: mostrar,
          onLeave: mostrar,
          onLeaveBack: mostrar,
          onRefresh: mostrar,
        },
        onUpdate: pintar,
      });

      // Armado / rebobinado: trigger PROPIO sin scrub, en el mismo punto
      // donde arranca la zona (= el faro terminó en blanco, por el solape).
      // Desde ABAJO no se rearma: se completa de golpe. Rearmar volvía a
      // poner el velo en 1 y el escenario, ya a la vista, se iba a blanco y
      // volvía en 1,2 s — un flash cada vez que subías desde «Cómo
      // trabajamos». onRefresh cubre cargar la página ya scrolleada: arriba
      // de la zona rebobina, abajo completa.
      ScrollTrigger.create({
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => armar(true),
        onEnterBack: completar,
        onLeaveBack: rebobinar,
        onRefresh: (self) => {
          if (self.isActive) return;
          if (self.progress >= 1) completar();
          else rebobinar();
        },
      });

      // (La aparición del bloque de apoyo la maneja pintar(): opacidad por
      // cercanía a la estación — un tween acá pelearía con esa escritura.)
    }, stage);

    pintar();

    return () => {
      matar();
      ctx.revert();
    };
  }, [live, geo]);

  // Riel izquierdo: saltar a la estación i (misma cuenta que hace pintar
  // al revés: posición de scroll donde el viaje pv = i/(n-1), contando el
  // arranque).
  const saltarA = (i: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const top = zone.getBoundingClientRect().top + window.scrollY;
    const pv = i / (TAMBORES.length - 1);
    const destino =
      top +
      (zone.offsetHeight - window.innerHeight) * (ARRANQUE + (1 - ARRANQUE - SALIDA) * pv);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(destino, { duration: 1.4 });
    else window.scrollTo({ top: destino, behavior: "smooth" });
  };

  return { live, geo, saltarA };
}
