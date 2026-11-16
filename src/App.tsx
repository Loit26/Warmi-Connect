import React, { useState } from 'react';
import ExploreProjects from './components/ExploreProjects';
import ProjectDetail from './components/ProjectDetail';
import CollaborationModal from './components/CollaborationModal';

// Importando los módulos creados por tus compañeros (Persona A)
import { PublicarProyecto } from './features/publicar/PublicarProyecto';
import { MisSolicitudes } from './features/solicitudes/MisSolicitudes';

import { ProjectCard, ProjectDetails, RequestInput } from './contracts/models';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'explore' | 'publicar' | 'solicitudes'>('explore');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos mock iniciales para el catálogo
  const mockProjects: ProjectCard[] = [
    {
      id: '1',
      ownerId: 'user-1',
      title: 'Detección temprana del cáncer mediante IA',
      category: 'Ciencia',
      problem: 'Modelo de IA para identificar signos tempranos de cáncer de mama en imágenes médicas.',
      requiredSkills: ['Análisis de datos', 'Investigación'],
      supportNeed: 'Financiamiento y validación clínica',
      creator: {
        id: 'user-1',
        displayName: 'Dra. Valeria Torres',
        specialty: 'Investigadora en Salud'
      }
    },
    {
      id: '2',
      ownerId: 'user-2',
      title: 'Bioplásticos a partir de residuos orgánicos',
      category: 'Medioambiente',
      problem: 'Desarrollo de un material biodegradable que reduce la contaminación por plásticos.',
      requiredSkills: ['Investigación', 'Medioambiente y sostenibilidad'],
      supportNeed: 'Aliados de laboratorio',
      creator: {
        id: 'user-2',
        displayName: 'Ing. Sofia Ramos',
        specialty: 'Ingeniera ambiental'
      }
    }
  ];

  const selectedProjectDetails: ProjectDetails | null = selectedProjectId 
    ? {
        ...mockProjects.find(p => p.id === selectedProjectId)!,
        description: 'Descripción detallada de la iniciativa, metodología aplicada y avance actual en el laboratorio o campo de estudio.',
        creator: {
          id: mockProjects.find(p => p.id === selectedProjectId)?.ownerId || '1',
          displayName: mockProjects.find(p => p.id === selectedProjectId)?.creator.displayName || '',
          specialty: mockProjects.find(p => p.id === selectedProjectId)?.creator.specialty || '',
          skills: ['Investigación', 'Análisis de datos'],
          bio: 'Especialista dedicada al desarrollo científico.'
        },
        createdAt: '2026-03-01'
      }
    : null;

  const handleSendRequest = async (input: RequestInput) => {
    console.log("Solicitud enviada:", input);
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  return (
    <div className="app">
      {/* Menú lateral oficial de Warmi Connect */}
      <aside className="menu">
        <div className="marca">
          <span className="marca-nombre">Warmi Connect</span>
          <span className="marca-lema">Conecta · Colabora · Impulsa</span>
        </div>
        <nav>
          <a 
            href="#explore" 
            className={currentTab === 'explore' && !selectedProjectId ? 'activo' : ''}
            onClick={(e) => { e.preventDefault(); setCurrentTab('explore'); setSelectedProjectId(null); }}
          >
            Explorar proyectos
          </a>
          <a 
            href="#publicar" 
            className={currentTab === 'publicar' ? 'activo' : ''}
            onClick={(e) => { e.preventDefault(); setCurrentTab('publicar'); setSelectedProjectId(null); }}
          >
            Publicar proyecto
          </a>
          <a 
            href="#solicitudes" 
            className={currentTab === 'solicitudes' ? 'activo' : ''}
            onClick={(e) => { e.preventDefault(); setCurrentTab('solicitudes'); setSelectedProjectId(null); }}
          >
            Mis solicitudes
          </a>
        </nav>
      </aside>

      {/* Contenido principal según la pestaña del menú */}
      <main className="contenido">
        {currentTab === 'explore' && !selectedProjectId && (
          <ExploreProjects 
            projects={mockProjects} 
            onSelectProject={(id) => setSelectedProjectId(id)} 
          />
        )}

        {selectedProjectId && selectedProjectDetails && (
          <ProjectDetail 
            project={selectedProjectDetails} 
            onBack={() => setSelectedProjectId(null)} 
            onOpenCollaborationModal={() => setIsModalOpen(true)} 
          />
        )}

        {currentTab === 'publicar' && (
          <PublicarProyecto />
        )}

        {currentTab === 'solicitudes' && (
          <MisSolicitudes />
        )}
      </main>

      {/* Modal flotante de colaboración */}
      {isModalOpen && selectedProjectDetails && (
        <CollaborationModal 
          project={selectedProjectDetails} 
          onClose={() => setIsModalOpen(false)} 
          onSubmitRequest={handleSendRequest} 
        />
      )}
    </div>
  );
}