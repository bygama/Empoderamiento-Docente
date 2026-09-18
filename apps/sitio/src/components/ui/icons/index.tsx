// Set de íconos lineales propios (sin lucide-react para no agregar dep).
// Estilo: stroke 1.5px, esquinas redondeadas, currentColor para tema.
// Tamaño base 24px; ajustar con className width/height.

export type IconProps = React.SVGProps<SVGSVGElement> & {
  /** Tamaño en px (genera width y height). Default 24. */
  size?: number;
};

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": "true" as const,
  focusable: "false" as const,
};

export function BookOpen({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z" />
      <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
    </svg>
  );
}

/**
 * Lámpara hand-drawn del manual de marca ED. Paths del SVG oficial
 * gemini-svg (rayos + filamento espiralado + cuerpo de bombilla con
 * rosca compleja). ViewBox 500x650, stroke width 16 para matchear el
 * peso visual del original.
 */
export function LampManual({ size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 500 650"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {/* Rayos */}
      <path d="M 100,230 L 145,260" />
      <path d="M 90,135 L 135,175" />
      <path d="M 155,60 L 195,115" />
      <path d="M 250,25 L 255,95" />
      <path d="M 355,50 L 330,115" />
      <path d="M 445,120 L 390,165" />
      <path d="M 480,235 L 405,255" />

      {/* Filamento espiralado interno */}
      <path d="M 245,400 Q 245,340 245,290 C 245,240 315,240 290,300 C 265,360 190,310 210,250 Q 220,200 235,190" />

      {/* Bombilla + rosca (path complejo del manual) */}
      <path d="M 190,420 C 170,300 110,210 180,130 C 250,50 370,90 380,180 C 390,270 330,360 320,420 C 320,440 230,450 185,435 C 150,450 250,480 305,470 C 340,490 230,510 185,500 C 150,520 250,540 290,530 C 330,550 230,570 195,560 C 160,580 265,580 255,620" />
    </svg>
  );
}

export function Users({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function Lightbulb({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export function School({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M12 2L3 7l9 5 9-5-9-5z" />
      <path d="M3 7v6c0 3 4 5 9 5s9-2 9-5V7" />
      <path d="M12 12v10" />
      <path d="M8 18v-4" />
      <path d="M16 18v-4" />
    </svg>
  );
}

export function TrendingUp({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function Target({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function Compass({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function ArrowRight({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/** Espejo de ArrowRight, para navegación prev/next. */
export function ArrowLeft({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 5 5 12 12 19" />
    </svg>
  );
}

/** Flecha diagonal ↗ (mismo trazo que la del Footer). */
export function ArrowUpRight({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

/** Lupa para buscadores (Biblioteca). */
export function Search({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16" y2="16" />
    </svg>
  );
}

/** Chevron ∨ para selects e indicadores de despliegue. */
export function ChevronDown({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Check ✓ para opción elegida en menús propios. */
export function Check({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Menu({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export function X({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

export function Instagram({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Linkedin({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Facebook({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/** Eslabón de cadena: «copiar link». */
export function Enlace({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function MailOutline({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
