export type Category =
  | "Ciencia"
  | "Tecnología"
  | "Innovación"
  | "Educación"
  | "Medioambiente"
  | "Impacto social";

export type Skill =
  | "Diseño gráfico"
  | "Desarrollo web"
  | "Desarrollo móvil"
  | "Análisis de datos"
  | "Investigación"
  | "Comunicación y difusión"
  | "Gestión de proyectos"
  | "Educación y pedagogía"
  | "Medioambiente y sostenibilidad"
  | "Escritura y edición";

export type RequestStatus = "pending" | "accepted" | "rejected";
export type Decision = "accepted" | "rejected";

export type WarmiErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "DUPLICATE_REQUEST"
  | "SELF_REQUEST"
  | "INVALID_TRANSITION"
  | "NETWORK"
  | "UNEXPECTED";

/** Datos de contacto que la persona decide mostrar (todos opcionales). */
export interface ContactInfo {
  email?: string;
  /** Dirección completa, por ejemplo https://www.linkedin.com/in/usuario */
  linkedin?: string;
  /** Usuario sin arroba, por ejemplo warmi.connect */
  instagram?: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  specialty: string;
  skills: Skill[];
  bio: string;
  contact?: ContactInfo;
}

export interface SessionUser {
  id: string;
  email: string;
}

export interface ProjectInput {
  title: string;
  category: Category;
  problem: string;
  description: string;
  requiredSkills: Skill[];
  supportNeed: string;
  /** Imagen de portada opcional (data URL en el mock; URL pública cuando exista Storage). */
  coverImage?: string;
}

export interface ProjectFilters {
  category?: Category;
  requiredSkills?: Skill[];
}

export interface RequestInput {
  projectId: string;
  message: string;
}

export interface ProjectCard {
  id: string;
  ownerId: string;
  title: string;
  category: Category;
  problem: string;
  requiredSkills: Skill[];
  supportNeed: string;
  coverImage?: string;
  creator: Pick<PublicProfile, "id" | "displayName" | "specialty">;
}

export interface ProjectDetails extends ProjectCard {
  description: string;
  creator: PublicProfile;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  projectId: string;
  senderId: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export interface SentRequest extends CollaborationRequest {
  project: Pick<ProjectCard, "id" | "title" | "category">;
  /** Quién publicó el proyecto al que postulaste (opcional hasta que B lo entregue). */
  creator?: Pick<PublicProfile, "id" | "displayName" | "specialty">;
  /** Qué apoyo pide el proyecto, para recordar a qué postulaste. */
  supportNeed?: string;
}

export interface ReceivedRequest extends CollaborationRequest {
  project: Pick<ProjectCard, "id" | "title">;
  sender: Pick<PublicProfile, "id" | "displayName" | "specialty"> &
    Partial<Pick<PublicProfile, "skills" | "bio" | "contact">>;
}
