// Iconos simples en SVG (sin librerías). Heredan el color del texto.
import type { ReactNode } from "react";

function Icono({ children, clase }: { children: ReactNode; clase?: string }) {
  return (
    <svg
      className={clase}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconoExplorar = ({ clase }: { clase?: string }) => (
  <Icono clase={clase}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icono>
);

export const IconoPublicar = ({ clase }: { clase?: string }) => (
  <Icono clase={clase}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </Icono>
);

export const IconoSolicitudes = ({ clase }: { clase?: string }) => (
  <Icono clase={clase}>
    <path d="M4 5h16v11H9l-5 4z" />
  </Icono>
);
