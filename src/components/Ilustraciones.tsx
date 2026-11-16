// Ilustraciones originales en SVG (sin imágenes externas) para portadas, tarjetas y paneles.
// Cada categoría tiene su propio motivo. Si la creadora sube su propia imagen, se usa esa.
import type { ReactNode } from "react";
import type { Category } from "../contracts/models";

/** Fondo común: círculos luminosos y una rejilla suave. */
function Fondo({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <>
      <rect width="400" height="170" fill={c1} />
      <circle cx="330" cy="20" r="120" fill={c2} opacity=".55" />
      <circle cx="40" cy="170" r="90" fill={c2} opacity=".35" />
      <circle cx="330" cy="20" r="70" fill="none" stroke="#fff" strokeOpacity=".25" />
      <circle cx="330" cy="20" r="105" fill="none" stroke="#fff" strokeOpacity=".15" />
      <g stroke="#fff" strokeOpacity=".08">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="170" />
        ))}
        {[34, 68, 102, 136].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
    </>
  );
}

function Motivo({ categoria }: { categoria: Category }) {
  const blanco = "#fff";
  switch (categoria) {
    case "Ciencia":
      // Hélice de ADN
      return (
        <g transform="translate(250 8)" fill="none" strokeLinecap="round">
          <path d="M10 0 C70 40 70 80 10 120 S-10 160 10 160" stroke={blanco} strokeWidth="5" opacity=".9" />
          <path d="M70 0 C10 40 10 80 70 120 S90 160 70 160" stroke="#ff9ad5" strokeWidth="5" opacity=".95" />
          {[20, 45, 70, 95, 120, 145].map((y) => (
            <line key={y} x1="22" y1={y} x2="58" y2={y} stroke={blanco} strokeOpacity=".55" strokeWidth="3" />
          ))}
          <circle cx="110" cy="40" r="7" fill={blanco} opacity=".8" />
          <circle cx="130" cy="110" r="5" fill="#ff9ad5" />
        </g>
      );
    case "Tecnología":
      // Chip con circuitos
      return (
        <g transform="translate(240 20)" fill="none" stroke={blanco} strokeWidth="4" strokeLinecap="round">
          <rect x="30" y="30" width="80" height="80" rx="14" fill="#fff" fillOpacity=".15" />
          <rect x="52" y="52" width="36" height="36" rx="8" fill="#ff9ad5" stroke="none" />
          {[44, 70, 96].map((p) => (
            <g key={p}>
              <line x1={p} y1="30" x2={p} y2="8" />
              <line x1={p} y1="110" x2={p} y2="132" />
              <line x1="30" y1={p} x2="8" y2={p} />
              <line x1="110" y1={p} x2="132" y2={p} />
            </g>
          ))}
          <circle cx="8" cy="8" r="5" fill={blanco} stroke="none" />
          <circle cx="132" cy="132" r="5" fill="#ff9ad5" stroke="none" />
        </g>
      );
    case "Innovación":
      // Foco con destellos
      return (
        <g transform="translate(250 14)" fill="none" stroke={blanco} strokeWidth="4" strokeLinecap="round">
          <path
            d="M70 14 a40 40 0 0 1 22 74 v14 h-44 v-14 a40 40 0 0 1 22 -74z"
            fill="#ffe08a"
            fillOpacity=".9"
            stroke="none"
          />
          <line x1="52" y1="116" x2="88" y2="116" />
          <line x1="58" y1="130" x2="82" y2="130" />
          <line x1="70" y1="-6" x2="70" y2="-14" />
          <line x1="22" y1="14" x2="14" y2="6" />
          <line x1="118" y1="14" x2="126" y2="6" />
          <line x1="10" y1="62" x2="0" y2="62" />
          <line x1="130" y1="62" x2="140" y2="62" />
        </g>
      );
    case "Educación":
      // Birrete y libros
      return (
        <g transform="translate(236 20)" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 10 L136 42 L70 74 L4 42 Z" fill="#fff" fillOpacity=".92" />
          <path d="M34 58 v28 c0 12 72 12 72 0 v-28" fill="none" stroke={blanco} strokeWidth="5" />
          <line x1="132" y1="46" x2="132" y2="92" stroke="#ff9ad5" strokeWidth="5" />
          <circle cx="132" cy="96" r="6" fill="#ff9ad5" />
          <rect x="16" y="112" width="108" height="14" rx="4" fill="#ff9ad5" opacity=".95" />
          <rect x="26" y="128" width="88" height="14" rx="4" fill="#fff" opacity=".85" />
        </g>
      );
    case "Medioambiente":
      // Brote y hojas
      return (
        <g transform="translate(252 12)" fill="none" strokeLinecap="round">
          <path d="M70 150 C70 100 70 70 70 40" stroke={blanco} strokeWidth="6" />
          <path d="M70 80 C20 80 8 40 12 20 C58 20 74 50 70 80z" fill="#7dffc4" fillOpacity=".9" stroke="none" />
          <path d="M70 60 C120 60 132 20 128 0 C82 0 66 30 70 60z" fill="#d9ffee" fillOpacity=".95" stroke="none" />
          <ellipse cx="70" cy="152" rx="46" ry="8" fill="#fff" opacity=".3" stroke="none" />
          <circle cx="112" cy="110" r="7" fill="#ff9ad5" stroke="none" />
          <circle cx="24" cy="120" r="5" fill="#fff" opacity=".8" stroke="none" />
        </g>
      );
    case "Impacto social":
    default:
      // Personas conectadas
      return (
        <g transform="translate(236 14)" fill="none" stroke={blanco} strokeWidth="3" strokeLinecap="round">
          <line x1="70" y1="40" x2="22" y2="108" strokeOpacity=".7" />
          <line x1="70" y1="40" x2="118" y2="108" strokeOpacity=".7" />
          <line x1="22" y1="108" x2="118" y2="108" strokeOpacity=".7" />
          {[
            [70, 40, "#fff"],
            [22, 108, "#ff9ad5"],
            [118, 108, "#ffe08a"],
          ].map(([x, y, color]) => (
            <g key={`${x}-${y}`}>
              <circle cx={Number(x)} cy={Number(y) - 12} r="11" fill={String(color)} stroke="none" />
              <path
                d={`M${Number(x) - 20} ${Number(y) + 22} a20 20 0 0 1 40 0z`}
                fill={String(color)}
                stroke="none"
              />
            </g>
          ))}
          <path d="M70 6 c-6 -8 -18 -2 -12 8 l12 12 l12 -12 c6 -10 -6 -16 -12 -8z" fill="#ff5fae" stroke="none" />
        </g>
      );
  }
}

const COLORES: Record<Category, [string, string]> = {
  Ciencia: ["#3b0a6b", "#d41483"],
  Tecnología: ["#1b1561", "#6a3bff"],
  Innovación: ["#4e085d", "#ff5fae"],
  Educación: ["#2b1370", "#8b3dff"],
  Medioambiente: ["#0f4a52", "#7d3df0"],
  "Impacto social": ["#5a0e55", "#ff6f91"],
};

/** Ilustración de portada según la categoría (400 × 170). */
export function IlustracionCategoria({ categoria, clase }: { categoria: Category; clase?: string }) {
  const [c1, c2] = COLORES[categoria];
  return (
    <svg
      className={clase}
      viewBox="0 0 400 170"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Ilustración de ${categoria}`}
    >
      <Fondo c1={c1} c2={c2} />
      <Motivo categoria={categoria} />
    </svg>
  );
}

/** Ilustración grande para la portada de cada pantalla: globo con órbitas y símbolos. */
export function IlustracionHero({ clase }: { clase?: string }) {
  return (
    <svg className={clase} viewBox="0 0 360 260" aria-hidden="true">
      <circle cx="190" cy="130" r="96" fill="#8b3dff" opacity=".35" />
      <circle cx="190" cy="130" r="76" fill="#d41483" opacity=".35" />
      <g fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5">
        <circle cx="190" cy="130" r="96" />
        <ellipse cx="190" cy="130" rx="96" ry="34" />
        <ellipse cx="190" cy="130" rx="40" ry="96" />
        <ellipse cx="190" cy="130" rx="150" ry="52" strokeOpacity=".3" transform="rotate(-18 190 130)" />
      </g>
      {/* Símbolos flotantes: ciencia, hoja, corazón, chip */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#fff" strokeWidth="3">
        <g transform="translate(40 40)">
          <rect width="52" height="52" rx="14" fill="#fff" fillOpacity=".14" stroke="#fff" strokeOpacity=".5" />
          <path d="M18 12 h16 M22 12 v12 l-8 14 a4 4 0 0 0 4 6 h16 a4 4 0 0 0 4-6 l-8-14 v-12" />
        </g>
        <g transform="translate(288 30)">
          <rect width="52" height="52" rx="14" fill="#fff" fillOpacity=".14" stroke="#fff" strokeOpacity=".5" />
          <path d="M14 38 C14 20 26 12 40 12 C40 28 32 40 14 38z" />
          <path d="M14 38 L28 24" />
        </g>
        <g transform="translate(296 166)">
          <rect width="52" height="52" rx="14" fill="#fff" fillOpacity=".14" stroke="#fff" strokeOpacity=".5" />
          <path d="M26 40 C10 28 12 14 22 14 C26 14 26 18 26 20 C26 18 26 14 30 14 C40 14 42 28 26 40z" />
        </g>
        <g transform="translate(30 168)">
          <rect width="52" height="52" rx="14" fill="#fff" fillOpacity=".14" stroke="#fff" strokeOpacity=".5" />
          <rect x="16" y="16" width="20" height="20" rx="4" />
          <path d="M22 10 v6 M30 10 v6 M22 36 v6 M30 36 v6 M10 22 h6 M10 30 h6 M36 22 h6 M36 30 h6" />
        </g>
      </g>
      {/* Puntos brillantes */}
      <g fill="#fff">
        <circle cx="140" cy="60" r="3" opacity=".9" />
        <circle cx="250" cy="80" r="2.5" opacity=".8" />
        <circle cx="150" cy="200" r="2.5" opacity=".7" />
        <circle cx="236" cy="206" r="3" opacity=".9" />
      </g>
    </svg>
  );
}

/** Iconos de contacto y redes (mismo estilo de línea que el resto). */
function Base({ clase, children }: { clase?: string; children: ReactNode }) {
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

export const IconoCorreo = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);

export const IconoInstagram = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r=".8" fill="currentColor" />
  </Base>
);

export const IconoLinkedin = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M8 10.5V16M8 7.8v.1M12 16v-5.5M12 13c0-1.6 1-2.6 2.4-2.6S16.5 11.4 16.5 13V16" />
  </Base>
);

export const IconoFrasco = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
  </Base>
);

export const IconoPersonas = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16 14.2c3 .2 5 2.3 5 5.2" />
  </Base>
);

export const IconoEdificio = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <path d="M3 9 12 4l9 5M5 9v9M19 9v9M9 9v9M15 9v9M3 20h18" />
  </Base>
);

export const IconoImagen = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
    <circle cx="9" cy="10" r="1.7" />
    <path d="m4 17 5-4 4 3 3-2 4 3" />
  </Base>
);

export const IconoEstrella = ({ clase }: { clase?: string }) => (
  <Base clase={clase}>
    <path d="M12 3.5 14.4 9l5.9.6-4.4 4 1.3 5.8L12 16.3 6.8 19.4l1.3-5.8-4.4-4L9.6 9z" />
  </Base>
);
