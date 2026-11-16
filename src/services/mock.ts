// Servicio de prueba (mock) que cumple el contrato WarmiServices de B.
// Guarda todo en memoria: al recargar la página vuelve a los datos iniciales.
// Cuando el adaptador de Supabase esté listo, se cambia en src/services/index.ts.
import type {
  CollaborationRequest,
  Decision,
  ProjectCard,
  ProjectDetails,
  ProjectFilters,
  ProjectInput,
  PublicProfile,
  ReceivedRequest,
  RequestInput,
  SentRequest,
  SessionUser,
} from "../contracts/models";
import { WarmiError, type WarmiServices } from "../contracts/services";
import { validarProyecto } from "../features/publicar/validacion";

// Datos ficticios (no son personas reales).
const perfiles: PublicProfile[] = [
  {
    id: "u-valeria",
    displayName: "Valeria Mendoza",
    specialty: "Creadora y diseñadora",
    skills: ["Diseño gráfico", "Gestión de proyectos"],
    bio: "Diseñadora interesada en proyectos de impacto ambiental.",
  },
  {
    id: "u-sofia",
    displayName: "Sofía Carrión",
    specialty: "Diseñadora gráfica",
    skills: ["Diseño gráfico"],
    bio: "Diseño de etiquetas y packaging sostenible.",
  },
  {
    id: "u-marcela",
    displayName: "Marcela Vega",
    specialty: "Especialista en marketing digital",
    skills: ["Comunicación y difusión"],
    bio: "Planifico contenidos para proyectos sociales.",
  },
  {
    id: "u-camila",
    displayName: "Camila Torres",
    specialty: "Gestora social",
    skills: ["Gestión de proyectos", "Investigación"],
    bio: "Trabajo con cooperativas de mujeres en Lima.",
  },
  {
    id: "u-lucia",
    displayName: "Lucía Quispe",
    specialty: "Docente de tecnología",
    skills: ["Desarrollo web", "Educación y pedagogía"],
    bio: "Enseño programación a jóvenes en zonas rurales.",
  },
];

const sesion: SessionUser = { id: "u-valeria", email: "demo@warmiconnect.pe" };

const proyectos: ProjectDetails[] = [
  crearDetalle("p-biotintes", "u-valeria", "2026-11-10T15:00:00Z", {
    title: "BioTintes: Pigmentos naturales andinos",
    category: "Medioambiente",
    problem: "Los colorantes sintéticos contaminan fuentes de agua comunitarias.",
    description: "Producción de tintes orgánicos con plantas nativas cultivadas por mujeres campesinas.",
    requiredSkills: ["Diseño gráfico", "Comunicación y difusión"],
    supportNeed: "Diseñar etiquetas ecológicas y un manual de identidad básico.",
  }),
  crearDetalle("p-ecowarmi", "u-camila", "2026-11-12T10:00:00Z", {
    title: "EcoWarmi: Red de reciclaje textil",
    category: "Impacto social",
    problem: "Toneladas de retazos textiles terminan en vertederos cada año.",
    description: "Cadena circular que conecta retazos con talleres de artesanas.",
    requiredSkills: ["Desarrollo web"],
    supportNeed: "Crear el catálogo digital de retazos.",
  }),
  crearDetalle("p-mujerescode", "u-lucia", "2026-11-11T10:00:00Z", {
    title: "MujeresCode: Academia STEM rural",
    category: "Educación",
    problem: "Pocas jóvenes rurales acceden a cursos de programación.",
    description: "Cursos introductorios de programación y alfabetización digital.",
    requiredSkills: ["Desarrollo web", "Educación y pedagogía"],
    supportNeed: "Mentoría en Python y apoyo voluntario.",
  }),
];

const solicitudes: CollaborationRequest[] = [
  {
    id: "r-1",
    projectId: "p-biotintes",
    senderId: "u-sofia",
    message:
      "Hola Valeria, tengo experiencia diseñando etiquetas ecológicas. Me gustaría armar la línea gráfica de sus envases.",
    status: "pending",
    createdAt: "2026-11-15T10:45:00Z",
  },
  {
    id: "r-2",
    projectId: "p-biotintes",
    senderId: "u-marcela",
    message:
      "Tengo 4 horas semanales para planificar el calendario de contenidos en Instagram y TikTok.",
    status: "accepted",
    createdAt: "2026-11-14T16:20:00Z",
  },
  {
    id: "r-3",
    projectId: "p-ecowarmi",
    senderId: "u-valeria",
    message: "Puedo apoyar con el diseño del catálogo y la navegación.",
    status: "pending",
    createdAt: "2026-11-13T09:00:00Z",
  },
  {
    id: "r-4",
    projectId: "p-mujerescode",
    senderId: "u-valeria",
    message: "Me gustaría diseñar los materiales gráficos de los cursos.",
    status: "rejected",
    createdAt: "2026-11-12T18:30:00Z",
  },
];

function crearDetalle(
  id: string,
  ownerId: string,
  createdAt: string,
  input: ProjectInput,
): ProjectDetails {
  return { id, ownerId, createdAt, ...input, creator: perfil(ownerId) };
}

function perfil(id: string): PublicProfile {
  const encontrado = perfiles.find((p) => p.id === id);
  if (!encontrado) throw new WarmiError("NOT_FOUND", "Perfil no encontrado.");
  return encontrado;
}

function aTarjeta(p: ProjectDetails): ProjectCard {
  const { description: _d, createdAt: _c, creator, ...resto } = p;
  return {
    ...resto,
    creator: { id: creator.id, displayName: creator.displayName, specialty: creator.specialty },
  };
}

// Simula la demora de la red para poder ver los estados de "cargando".
const esperar = () => new Promise((r) => setTimeout(r, 400));
const copia = <T,>(dato: T): T => structuredClone(dato);

export const mockServices: WarmiServices = {
  async signIn() {
    await esperar();
    return copia(sesion);
  },
  async getSession() {
    return copia(sesion);
  },
  subscribeToSession(listener) {
    listener(copia(sesion));
    return () => {};
  },
  async signOut() {},

  async createProject(input) {
    await esperar();
    const errores = validarProyecto(input);
    if (Object.keys(errores).length > 0) {
      throw new WarmiError("VALIDATION", "El proyecto tiene campos incompletos o inválidos.");
    }
    const nuevo = crearDetalle(`p-${Date.now()}`, sesion.id, new Date().toISOString(), input);
    proyectos.unshift(nuevo);
    return copia(nuevo);
  },

  async updateProject(projectId, input) {
    await esperar();
    const i = proyectos.findIndex((p) => p.id === projectId);
    if (i < 0) throw new WarmiError("NOT_FOUND", "El proyecto no existe.");
    if (proyectos[i].ownerId !== sesion.id) {
      throw new WarmiError("FORBIDDEN", "Solo la creadora puede editar este proyecto.");
    }
    proyectos[i] = { ...proyectos[i], ...input };
    return copia(proyectos[i]);
  },

  async listProjects(filters?: ProjectFilters) {
    await esperar();
    return proyectos
      .filter((p) => !filters?.category || p.category === filters.category)
      .filter(
        (p) =>
          !filters?.requiredSkills?.length ||
          filters.requiredSkills.some((s) => p.requiredSkills.includes(s)),
      )
      .map((p) => copia(aTarjeta(p)));
  },

  async getProject(projectId) {
    await esperar();
    const p = proyectos.find((x) => x.id === projectId);
    if (!p) throw new WarmiError("NOT_FOUND", "El proyecto no existe.");
    return copia(p);
  },

  async createRequest(input: RequestInput) {
    await esperar();
    const p = proyectos.find((x) => x.id === input.projectId);
    if (!p) throw new WarmiError("NOT_FOUND", "El proyecto no existe.");
    if (p.ownerId === sesion.id) {
      throw new WarmiError("SELF_REQUEST", "No puedes postular a tu propio proyecto.");
    }
    if (solicitudes.some((s) => s.projectId === p.id && s.senderId === sesion.id)) {
      throw new WarmiError("DUPLICATE_REQUEST", "Ya enviaste una solicitud a este proyecto.");
    }
    const nueva: CollaborationRequest = {
      id: `r-${Date.now()}`,
      projectId: p.id,
      senderId: sesion.id,
      message: input.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    solicitudes.unshift(nueva);
    return copia(nueva);
  },

  async listSentRequests(): Promise<SentRequest[]> {
    await esperar();
    return solicitudes
      .filter((s) => s.senderId === sesion.id)
      .map((s) => {
        const p = proyectos.find((x) => x.id === s.projectId)!;
        return copia({ ...s, project: { id: p.id, title: p.title, category: p.category } });
      });
  },

  async listReceivedRequests(): Promise<ReceivedRequest[]> {
    await esperar();
    const mios = new Set(proyectos.filter((p) => p.ownerId === sesion.id).map((p) => p.id));
    return solicitudes
      .filter((s) => mios.has(s.projectId))
      .map((s) => {
        const p = proyectos.find((x) => x.id === s.projectId)!;
        const r = perfil(s.senderId);
        return copia({
          ...s,
          project: { id: p.id, title: p.title },
          sender: { id: r.id, displayName: r.displayName, specialty: r.specialty },
        });
      });
  },

  async respondToRequest(requestId: string, decision: Decision) {
    await esperar();
    const s = solicitudes.find((x) => x.id === requestId);
    if (!s) throw new WarmiError("NOT_FOUND", "La solicitud no existe.");
    const p = proyectos.find((x) => x.id === s.projectId);
    if (p?.ownerId !== sesion.id) {
      throw new WarmiError("FORBIDDEN", "Solo la creadora del proyecto puede responder.");
    }
    if (s.status !== "pending") {
      throw new WarmiError("INVALID_TRANSITION", "Esta solicitud ya fue respondida.");
    }
    s.status = decision;
    return copia(s);
  },
};
