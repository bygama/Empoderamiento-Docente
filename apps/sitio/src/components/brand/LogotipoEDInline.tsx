"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type Props = {
  /** principal = navy sobre claro · negativo = blanco sobre oscuro */
  variant?: "principal" | "negativo";
  className?: string;
  /** Si true, ejecuta la timeline de "construcción" al montar. Default true. */
  animate?: boolean;
  alt?: string;
};

/**
 * Logotipo de ED renderizado INLINE en JSX (no via next/image) para poder
 * manipular paths individuales con GSAP. Reproduce el timeline "se va
 * construyendo" del proyecto Vite anterior (IntroScreen) pero in-place
 * en el lugar donde se monte el componente.
 *
 * Secuencia: stroke-draw del border → fade-in del bg interior → fade+rise
 * de la silueta del faro → slide-in de la E → slide-in de la D.
 *
 * Para usos que NO necesitan animación (header sticky, footer compacto)
 * usar `LogotipoED.tsx` que sirve el SVG con next/image optimization.
 */
export function LogotipoEDInline({
  variant = "negativo",
  className = "",
  animate = true,
  alt = "Empoderamiento Docente",
}: Props) {
  const rootRef = useRef<SVGSVGElement>(null);
  const borderRef = useRef<SVGRectElement>(null);
  const reducedMotion = useReducedMotion();

  const isLight = variant === "negativo";
  // El SVG colorea con `currentColor`; el color real viene del token
  // del manual de marca via la prop `color` del <svg>.
  const colorVar = isLight ? "white" : "var(--color-azul-principal)";

  useEffect(() => {
    if (!animate || reducedMotion) return;
    const scope = rootRef.current;
    if (!scope) return;
    const border = borderRef.current;
    if (!border) return;

    const ctx = gsap.context(() => {
      const perimeter = 2 * (125.74 + 251.47);

      gsap.set(border, {
        strokeDasharray: perimeter,
        strokeDashoffset: perimeter,
      });
      gsap.set(
        ["#logo-bg-fill", "#logo-faro", "#logo-letter-e", "#logo-letter-d"],
        { opacity: 0 },
      );
      gsap.set("#logo-faro", { y: 16 });
      gsap.set("#logo-letter-e", { x: -18 });
      gsap.set("#logo-letter-d", { x: -18 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(border, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power2.inOut",
        })
        .to("#logo-bg-fill", { opacity: 1, duration: 0.3 }, "-=0.2")
        .to("#logo-faro", { opacity: 1, y: 0, duration: 0.55 }, "-=0.05")
        .to("#logo-letter-e", { opacity: 1, x: 0, duration: 0.4 }, "-=0.15")
        .to("#logo-letter-d", { opacity: 1, x: 0, duration: 0.4 }, "-=0.25")
        .to(scope, { scale: 1.02, duration: 0.4, ease: "power2.in" }, "+=0.2")
        .to(scope, { scale: 1, duration: 0.3, ease: "power2.out" });
    }, scope);

    return () => ctx.revert();
  }, [animate, reducedMotion]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 236.69 303.26"
      className={className}
      style={{ color: colorVar }}
      role="img"
      aria-label={alt}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="lt-clip-full">
          <rect x="109.78" y="13.63" width="125.74" height="251.47" />
        </clipPath>
        <clipPath id="lt-clip-top">
          <rect x="110.17" y="13.63" width="125.19" height="128.08" />
        </clipPath>
      </defs>

      {/* === BG fill interior de la caja (path con clip-full, simula la cara
            interna del cuerpo del faro). Aparece DESPUÉS del border draw. === */}
      <g id="logo-bg-fill" clipPath="url(#lt-clip-full)">
        <path
          d="M236.38,13.48v251.87c0,.39-.31.78-.78.78h-125.89c-.39,0-.78-.31-.78-.78V13.48c0-.39.31-.78.78-.78h125.89c.47,0,.78.31.78.78Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeMiterlimit="10"
        />
      </g>

      {/* === Border principal de la caja del faro — stroke-draw === */}
      <rect
        ref={borderRef}
        id="logo-border"
        x="109.78"
        y="13.63"
        width="125.74"
        height="251.47"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeMiterlimit="10"
      />

      {/* === Silueta del faro: cuerpo, polígonos, ventanas, light beam,
            extensiones laterales. Todo agrupado bajo #logo-faro para fade+rise. === */}
      <g id="logo-faro">
        {/* Base del faro (la barra inferior con dos "puertas") */}
        <path
          d="M129.57,142.09h42.09l1.88,34.1c0,.4.31.71.78.71h5.24l.94,17.33h-22.3v-14.16c0-4.27-3.44-7.75-7.67-7.75s-7.67,3.48-7.67,7.75v14.16h-22.3l.94-17.33h5.24c.39,0,.7-.32.78-.71l2.03-34.1Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.57"
          strokeMiterlimit="10"
        />
        {/* Polígono superior */}
        <polygon
          points="167.44 68.64 169.32 101.58 131.84 101.58 133.72 68.64 167.44 68.64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.56"
          strokeMiterlimit="10"
        />
        {/* Ventana redonda superior */}
        <circle cx="150.62" cy="85.07" r="5.95" fill="currentColor" />

        {/* Parte interna con clip-top */}
        <g clipPath="url(#lt-clip-top)">
          <path
            d="M131.23,101.72c-6.92-.05-13.83-.1-20.75-.14V14.18h124.41v24.8l-66.9,8.14v-8.84h4.15c.31,0,.63-.23.7-.55.08-.31,0-.63-.31-.86l-21.44-14.01c-.23-.16-.55-.16-.86,0l-21.44,14.01c-.31.16-.39.55-.31.86.08.31.39.55.7.55h4.15v24.33h-1.88c-1.74.42-2.95,1.73-2.97,2.97-.03,1.64,1.96,3.51,4.62,3.11-.62,11.01-1.24,22.02-1.86,33.03Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.35"
            strokeMiterlimit="10"
          />
          <path
            d="M167.99,62.61h1.88c1.64,0,2.97,1.33,2.97,2.97s-1.33,2.97-2.97,2.97l-2.15.27c.62,11.01,1.24,22.02,1.86,33.03,21.77-.12,43.53-.24,65.3-.35v-36.85l-66.9-8.14v6.1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.35"
            strokeMiterlimit="10"
          />
          <polygon
            points="169.4 103.07 171.59 141.17 129.65 141.17 131.84 103.07 169.4 103.07"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.56"
            strokeMiterlimit="10"
          />
          <circle cx="150.62" cy="124.66" r="5.95" fill="currentColor" />
        </g>

        {/* Extensiones laterales y base inferior */}
        <path
          d="M187.73,214.57c7.07-2.7,10.45-8.09,10.6-17.01h-17.9l-21.67,19.55s22.21,0,28.97-2.55Z"
          fill="currentColor"
        />
        <path
          d="M182.58,218.43c-5.69,1.05-12.45,1.12-19.98,1.12h-52.09v44.87h92.59l-20.51-46Z"
          fill="currentColor"
        />
        <path
          d="M201.04,199.15c-.46,8.84-4.15,14.31-11.53,17.08-1.31.52-2.77.9-4.23,1.27l20.59,46.3h26.28l-31.12-64.65Z"
          fill="currentColor"
        />

        {/* Light beam (rasgos finos del haz arriba del faro) */}
        <path
          d="M157.59,49.94c-.23,0-.39-.08-.63-.16-.16-.16-.23-.31-.23-.55,0-3.36-2.82-6.1-6.18-6.1s-6.18,2.74-6.18,6.18v14.01h12.28v-8.76c0-.23.08-.39.23-.55.16-.16.39-.23.63-.16l77.3,9.39v-22.69l-77.23,9.39Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.78"
          strokeMiterlimit="10"
        />

        {/* Centro de la pieza (algo así como el corazón del faro) */}
        <path
          d="M128.64,37.73c-.18-.48,1.01-1.32,1.6-1.73,3.44-2.39,14.11-9.06,17.31-11.05,1.02-.73,2.04-1.46,3.06-2.2,3.75,2.55,7.5,5.11,11.25,7.66,7.51,4,11.08,6.46,10.72,7.39-.21.54-1.77.57-4.66.07.02,3.6.04,7.19.07,10.79-3.66.38-7.32.75-10.99,1.13.02-.22.27-3.53-2.4-5.59-2.77-2.14-6.03-.89-6.26-.8-3.11,1.25-3.87,4.38-3.93,4.66-.48,3.56-.68,7.67-.27,12.19.1,1.13.24,2.22.4,3.26,4.06-.02,8.12-.04,12.19-.07.07-3.15.13-6.3.2-9.46l11.05,1.38c-.04,2.49-.09,4.98-.13,7.47,1.53-.57,3.18-.14,4.06,1,.68.88.97,2.26.4,3.2-.78,1.29-2.9,1.33-3.93,1.33-4.08.01-17.23-.05-35.09-.27-1.36.78-2.94.63-3.8-.27-.82-.85-.7-2.08-.67-2.33.01-.12.15-1.22,1.07-2,1.5-1.27,3.62-.59,3.8-.53.03-3.99.01-8.08-.07-12.25-.08-4.23-.22-8.36-.4-12.39-.63-.09-1.55-.19-2.66-.27-1.25-.08-1.83-.06-1.93-.33Z"
          fill="currentColor"
        />

        {/* Líneas decorativas */}
        <rect
          x="167.52"
          y="43.35"
          width="67.07"
          height="1.49"
          transform="translate(-3.88 24.85) rotate(-7.01)"
          fill="currentColor"
        />
        <rect
          x="167.59"
          y="59.06"
          width="67.07"
          height="1.49"
          transform="translate(7.85 -21.89) rotate(6.35)"
          fill="currentColor"
        />
      </g>

      {/* === Letras E y D — fade + slide-in desde la izquierda === */}
      <text
        id="logo-letter-e"
        transform="translate(0 128.53)"
        fill="currentColor"
        fontSize="149.45"
        fontWeight="700"
        letterSpacing="0.05em"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <tspan x="0" y="0">
          E
        </tspan>
      </text>
      <text
        id="logo-letter-d"
        transform="translate(0 256.18)"
        fill="currentColor"
        fontSize="149.45"
        fontWeight="700"
        letterSpacing="0.05em"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <tspan x="0" y="0">
          D
        </tspan>
      </text>
    </svg>
  );
}
