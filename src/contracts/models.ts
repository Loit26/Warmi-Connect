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

export interface PublicProfile {
  id: string;
  displayName: string;
  specialty: string;
  skills: Skill[];
  bio: string;
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
}

export interface ReceivedRequest extends CollaborationRequest {
  project: Pick<ProjectCard, "id" | "title">;
  sender: Pick<PublicProfile, "id" | "displayName" | "specialty">;
}
