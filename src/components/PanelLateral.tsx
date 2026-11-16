// Columna derecha: llena el espacio con información útil según la pantalla.
import { useEffect, useState } from "react";
import { IconoEdificio, IconoFrasco, IconoPersonas } from "./Ilustraciones";
import { services } from "../services";

export type RutaPanel = "explorar" | "publicar" | "publicado" | "solicitudes";

export interface Conteos {
  enviadas: number;
  recibidas: number;
  pendientesPorResponder: number;
}

interface Props {
  ruta: RutaPanel;
  conteos: Conteos;
  onIr: (ruta: "explorar" | "publicar" | "solicitudes") => void;
}

export function PanelLateral({ ruta, conteos, onIr }: Props) {
  const [totales, setTotales] = useState({ proyectos: 0, creadoras: 0 });

  useEffect(() => {
    services
      .listProjects()
      .then((lista) =>
        setTotales({
          proyectos: lista.length,
          creadoras: new Set(lista.map((p) => p.creator.id)).size,
        }),
      )
      .catch(() => {});
  }, [ruta]);

  return (
    <aside className="lateral" aria-label="Panel de ayuda y resumen">
      <section className="panel">
        <h2>Warmi en números</h2>
        <div className="metricas">
          <div className="metrica">
            <IconoFrasco clase="metrica-icono" />
            <strong>{totales.proyectos}</strong>
            <span>Proyectos</span>
          </div>
          <div className="metrica">
            <IconoPersonas clase="metrica-icono" />
            <strong>{totales.creadoras}</strong>
            <span>Creadoras</span>
          </div>
          <div className="metrica">
            <IconoEdificio clase="metrica-icono" />
            <strong>{conteos.enviadas}</strong>
            <span>Tus postulaciones</span>
          </div>
        </div>
      </section>

      {ruta === "publicar" || ruta === "publicado" ? (
        <section className="panel">
          <h2>Para destacar tu proyecto</h2>
          <ul className="pasos-panel">
            <li>Usa un nombre que diga qué haces y para quién.</li>
            <li>Cuenta el problema con un dato o un caso real.</li>
            <li>Pide un apoyo concreto: así te responden más rápido.</li>
          </ul>
        </section>
      ) : (
        <section className="panel">
          <h2>Cómo funciona</h2>
          <ul className="pasos-panel">
            <li>Explora proyectos como si fueran convocatorias abiertas.</li>
            <li>Lee qué apoyo necesitan y qué perfiles buscan.</li>
            <li>Envía tu solicitud con un mensaje breve y concreto.</li>
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Tu actividad</h2>
        <ul className="lista-panel">
          <li>
            <b>{conteos.pendientesPorResponder} por responder</b>
            <span>Solicitudes pendientes en tus proyectos.</span>
          </li>
          <li>
            <b>{conteos.enviadas} enviadas</b>
            <span>Postulaciones que hiciste a otros proyectos.</span>
          </li>
        </ul>
      </section>

      <section className="panel panel-oscuro">
        <h2>Lleva tu proyecto más lejos</h2>
        <p>Conecta con mujeres de distintas disciplinas que quieran sumarse.</p>
        <button
          className="boton primario"
          onClick={() => onIr(ruta === "publicar" ? "explorar" : "publicar")}
        >
          {ruta === "publicar" ? "Ver otros proyectos" : "Publicar mi proyecto"}
        </button>
      </section>
    </aside>
  );
}
