// Los íconos que usan los controles, con los trazos del set de la app
// (lineales, 1,5 px, esquinas redondas, `currentColor`). El kit trae los
// suyos porque el set de la app es de la app: un package no la importa.

type Props = React.SVGProps<SVGSVGElement> & {
  /** Tamaño en px (ancho y alto). Por defecto 24. */
  size?: number;
};

const BASE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": "true" as const,
  focusable: "false" as const,
};

export function Alerta({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" />
      <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
    </svg>
  );
}

export function Check({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function X({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

export function Subir({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <path d="M12 15V4" />
      <polyline points="7 9 12 4 17 9" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
