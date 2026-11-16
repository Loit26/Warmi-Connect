import React from 'react';
import { ProjectDetails } from '../contracts/models';

interface ProjectDetailProps {
  project: ProjectDetails;
  onBack: () => void;
  onOpenCollaborationModal: () => void;
}

export default function ProjectDetail({ project, onBack, onOpenCollaborationModal }: ProjectDetailProps) {
  return (
    <div className="pagina">
      <button className="boton secundario" style={{ width: 'fit-content', marginBottom: '16px' }} onClick={onBack}>
        ← Volver al catálogo
      </button>

      <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <span className="etiqueta suave" style={{ marginBottom: '10px', display: 'inline-block' }}>
            {project.category}
          </span>
          <h1>{project.title}</h1>
          <p className="subtitulo" style={{ margin: '4px 0 0' }}>
            Liderado por <strong>{project.creator.displayName}</strong> — {project.creator.specialty}
          </p>
        </div>

        <dl className="ficha" style={{ margin: 0 }}>
          <div>
            <dt>Problema u oportunidad</dt>
            <dd>{project.problem}</dd>
          </div>
          <div>
            <dt>Necesidad de apoyo</dt>
            <dd>{project.supportNeed}</dd>
          </div>
          <div className="ancho">
            <dt>Descripción detallada</dt>
            <dd>{project.description}</dd>
          </div>
          <div className="ancho">
            <dt>Habilidades requeridas</dt>
            <dd>
              <div className="lista-etiquetas" style={{ marginTop: '6px' }}>
                {project.requiredSkills.map(skill => (
                  <span key={skill} className="etiqueta">{skill}</span>
                ))}
              </div>
            </dd>
          </div>
        </dl>

        <div className="acciones" style={{ justifyContent: 'flex-start' }}>
          <button className="boton primario" onClick={onOpenCollaborationModal}>
            Solicitar colaboración
          </button>
        </div>
      </div>
    </div>
  );
}