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

export function ChevronArriba({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

export function ChevronAbajo({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function Mas({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

export function FlechaIzquierda({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 5 5 12 12 19" />
    </svg>
  );
}

/** Sale hacia arriba a la derecha: lo que se abre en otra pestaña. */
export function FlechaAfuera({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function Ojo({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function OjoTachado({ size = 24, ...rest }: Props) {
  return (
    <svg width={size} height={size} {...BASE} {...rest}>
      <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-2.9 3.9" />
      <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}
