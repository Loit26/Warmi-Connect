// Pantalla "Explorar proyectos": cada proyecto se presenta como una convocatoria abierta.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, ProjectCard } from "../../contracts/models";
import { IconoExplorar } from "../../components/Iconos";
import { services } from "../../services";
import { CATEGORIAS } from "../publicar/validacion";
import { mensajeDeError } from "../publicar/PublicarProyecto";
import { DetalleProyecto } from "./DetalleProyecto";

interface Props {
  onPublicar: () => void;
  onSolicitudEnviada: () => void;
}

export function claseTema(cat: Category): string {
  return `tema-${cat.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`;
}

export function Explorar({ onPublicar, onSolicitudEnviada }: Props) {
  const [proyectos, setProyectos] = useState<ProjectCard[]>([]);
  const [categoria, setCategoria] = useState<Category | "todas">("todas");
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [yaPostuladas, setYaPostuladas] = useState<Set<string>>(new Set());
  const [miId, setMiId] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [lista, enviadas, sesion] = await Promise.all([
        services.listProjects(),
        services.listSentRequests(),
        services.getSession(),
      ]);
      setProyectos(lista);
      setYaPostuladas(new Set(enviadas.map((s) => s.projectId)));
      setMiId(sesion?.id ?? "");
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return proyectos
      .filter((p) => categoria === "todas" || p.category === categoria)
      .filter(
        (p) =>
          !q ||
          [p.title, p.problem, p.supportNeed, p.creator.displayName, ...p.requiredSkills]
            .join(" ")
            .toLowerCase()
            .includes(q),
      );
  }, [proyectos, categoria, texto]);

  return (
    <section className="pagina">
      <div className="portada">
        <p className="eyebrow">Convocatorias de colaboración</p>
        <h1>
          Proyectos de mujeres que buscan <em>aliadas</em>
        </h1>
        <p className="subtitulo">
          Cada proyecto es una convocatoria abierta: te cuenta qué problema atiende, qué apoyo necesita y
          qué perfiles busca. Elige uno, revisa el detalle y envía tu solicitud.
        </p>
        <div className="acciones">
          <button className="boton primario" onClick={onPublicar}>
            Publicar mi proyecto
          </button>
        </div>
      </div>

      <label className="buscador">
        <IconoExplorar />
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Busca por tema, perfil que se necesita o nombre de la creadora…"
          aria-label="Buscar proyectos"
        />
      </label>

      <div className="filtros-catalogo" role="group" aria-label="Filtrar por categoría">
        {(["todas", ...CATEGORIAS] as const).map((c) => (
          <button
            key={c}
            className={`opcion chip ${categoria === c ? "activa" : ""}`}
            aria-pressed={categoria === c}
            onClick={() => setCategoria(c)}
          >
            {c === "todas" ? "Todas" : c}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="tarjeta estado-centro" aria-busy="true">
          Cargando convocatorias…
        </div>
      ) : error ? (
        <div className="tarjeta estado-centro" role="alert">
          <p>{error}</p>
          <button className="boton secundario" onClick={cargar}>
            Reintentar
          </button>
        </div>
      ) : visibles.length === 0 ? (
        <div className="tarjeta estado-centro vacio">
          <h2>No encontramos convocatorias con esos filtros</h2>
          <p>Prueba con otra categoría o borra la búsqueda.</p>
          <button
            className="boton secundario"
            onClick={() => {
              setTexto("");
              setCategoria("todas");
            }}
          >
            Ver todas
          </button>
        </div>
      ) : (
        <>
          <p className="resumen-catalogo" aria-live="polite">
            {visibles.length} {visibles.length === 1 ? "convocatoria abierta" : "convocatorias abiertas"}
          </p>
          <ul className="rejilla">
            {visibles.map((p) => (
              <TarjetaConvocatoria
                key={p.id}
                proyecto={p}
                postulada={yaPostuladas.has(p.id)}
                esMia={p.ownerId === miId}
                onAbrir={() => setAbierto(p.id)}
              />
            ))}
          </ul>
        </>
      )}

      {abierto && (
        <DetalleProyecto
          proyectoId={abierto}
          postulada={yaPostuladas.has(abierto)}
          onCerrar={() => setAbierto(null)}
          onEnviada={() => {
            setYaPostuladas((prev) => new Set(prev).add(abierto));
            onSolicitudEnviada();
          }}
        />
      )}
    </section>
  );
}

function TarjetaConvocatoria({
  proyecto: p,
  postulada,
  esMia,
  onAbrir,
}: {
  proyecto: ProjectCard;
  postulada: boolean;
  esMia: boolean;
  onAbrir: () => void;
}) {
  return (
    <li className={`tarjeta convocatoria ${claseTema(p.category)}`}>
      <div className="convocatoria-cabecera">
        <div className="convocatoria-fila">
          <span className="sello-categoria">{p.category}</span>
          <span className="sello-abierta">{esMia ? "Tu proyecto" : postulada ? "Ya postulaste" : "Abierta"}</span>
        </div>
        <h3>{p.title}</h3>
      </div>

      <div className="convocatoria-cuerpo">
        <dl className="datos">
          <div>
            <dt>Qué problema atiende</dt>
            <dd>{p.problem}</dd>
          </div>
          <div>
            <dt>Qué apoyo se necesita</dt>
            <dd>{p.supportNeed}</dd>
          </div>
          <div>
            <dt>Perfiles que buscan</dt>
            <dd className="lista-etiquetas">
              {p.requiredSkills.map((s) => (
                <span key={s} className="etiqueta suave">
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="convocatoria-pie">
        <div className="creadora">
          <span className="avatar" aria-hidden="true">
            {p.creator.displayName
              .split(" ")
              .slice(0, 2)
              .map((x) => x[0])
              .join("")}
          </span>
          <div>
            <strong>{p.creator.displayName}</strong>
            <span>{p.creator.specialty}</span>
          </div>
        </div>
        <button className="boton primario boton-detalle" onClick={onAbrir}>
          {esMia ? "Ver detalle" : postulada ? "Ver mi solicitud" : "Ver y postular"}
        </button>
      </div>
    </li>
  );
}
