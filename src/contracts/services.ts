import type {
  CollaborationRequest,
  Decision,
  ProjectDetails,
  ProjectFilters,
  ProjectInput,
  RequestInput,
  ReceivedRequest,
  SentRequest,
  SessionUser,
  WarmiErrorCode,
  ProjectCard,
} from "./models";

export class WarmiError extends Error {
  readonly code: WarmiErrorCode;

  constructor(code: WarmiErrorCode, message: string) {
    super(message);
    this.name = "WarmiError";
    this.code = code;
  }
}

export interface WarmiServices {
  signIn(email: string, password: string): Promise<SessionUser>;
  getSession(): Promise<SessionUser | null>;
  subscribeToSession(
    listener: (session: SessionUser | null) => void,
  ): () => void;
  signOut(): Promise<void>;

  createProject(input: ProjectInput): Promise<ProjectDetails>;
  updateProject(
    projectId: string,
    input: ProjectInput,
  ): Promise<ProjectDetails>;
  listProjects(filters?: ProjectFilters): Promise<ProjectCard[]>;
  getProject(projectId: string): Promise<ProjectDetails>;

  createRequest(input: RequestInput): Promise<CollaborationRequest>;
  listSentRequests(): Promise<SentRequest[]>;
  listReceivedRequests(): Promise<ReceivedRequest[]>;
  respondToRequest(
    requestId: string,
    decision: Decision,
  ): Promise<CollaborationRequest>;
}
