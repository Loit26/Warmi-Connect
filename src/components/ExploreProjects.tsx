import React, { useState } from 'react';
import { ProjectCard, Category } from '../contracts/models';

interface ExploreProjectsProps {
  projects: ProjectCard[];
  onSelectProject: (id: string) => void;
}

const CATEGORIES: Category[] = ["Ciencia", "Tecnología", "Innovación", "Educación", "Medioambiente", "Impacto social"];

export default function ExploreProjects({ projects, onSelectProject }: ExploreProjectsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todas'>('Todas');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.creator.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pagina">
      <p className="eyebrow">Exploración y Visibilidad</p>
      <h1>Catálogo de proyectos</h1>
      <p className="subtitulo">Descubre iniciativas de investigación, tecnología e impacto social lideradas por mujeres.</p>

      {/* Buscador */}
      <div className="campo" style={{ marginBottom: '16px' }}>
        <input
          type="text"
          className="entrada"
          placeholder="Buscar por título, problema o creadora..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filtros de Categoría */}
      <div className="filtros" style={{ marginBottom: '24px' }}>
        <button
          className={`filtro ${selectedCategory === 'Todas' ? 'activo' : ''}`}
          onClick={() => setSelectedCategory('Todas')}
        >
          Todas
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filtro ${selectedCategory === cat ? 'activo' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listado de Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredProjects.length === 0 ? (
          <div className="tarjeta estado-centro">
            <p>No se encontraron proyectos con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="tarjeta" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="etiqueta suave" style={{ marginBottom: '10px', display: 'inline-block' }}>
                  {project.category}
                </span>
                <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>{project.title}</h2>
                <p style={{ color: 'var(--texto-suave)', fontSize: '14px', marginBottom: '14px' }}>
                  {project.problem}
                </p>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--neutro)', marginBottom: '14px' }}>
                  Por: <strong>{project.creator.displayName}</strong> ({project.creator.specialty})
                </div>
                <button
                  className="boton secundario"
                  style={{ width: '100%' }}
                  onClick={() => onSelectProject(project.id)}
                >
                  Ver detalle y colaborar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}