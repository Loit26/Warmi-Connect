# Contratos compartidos de Warmi Connect

Este documento define la frontera entre las pantallas de A/C y los servicios de datos de B. Los tipos fuente están en `src/contracts/models.ts`; las firmas de servicios y `WarmiError` están en `src/contracts/services.ts`. Los adaptadores mock y Supabase deben implementar la misma interfaz `WarmiServices`.

## Sesión y datos privados

Cada instancia de `WarmiServices` opera con la sesión autenticada que mantiene su adaptador. Las operaciones no reciben `ownerId` ni `senderId`: se derivan de esa sesión y la base de datos vuelve a comprobar los permisos. En particular, el ejemplo de publicación y solicitud usa una sesión de creadora y otra sesión independiente de colaboradora.

`SessionUser` contiene `id` y `email` para la sesión de la propia usuaria. No se debe usar `SessionUser` como perfil público.

## Tipos de datos

| Tipo | Campos |
| --- | --- |
| `Category` | Uno de `Ciencia`, `Tecnología`, `Innovación`, `Educación`, `Medioambiente`, `Impacto social`. |
| `Skill` | Uno de `Diseño gráfico`, `Desarrollo web`, `Desarrollo móvil`, `Análisis de datos`, `Investigación`, `Comunicación y difusión`, `Gestión de proyectos`, `Educación y pedagogía`, `Medioambiente y sostenibilidad`, `Escritura y edición`. |
| `PublicProfile` | `id: string` (identificador técnico), `displayName: string`, `specialty: string`, `skills: Skill[]`, `bio: string`. Los cuatro campos de contenido son nombre de presentación, especialidad, habilidades y descripción breve. No incluye correo ni credenciales. |
| `SessionUser` | `id: string`, `email: string`; solo para la sesión autenticada de esa usuaria. |
| `ProjectInput` | `title: string`, `category: Category`, `problem: string`, `description: string`, `requiredSkills: Skill[]`, `supportNeed: string`; no contiene propietario. |
| `ProjectFilters` | `category?: Category`, `requiredSkills?: Skill[]`. Si no hay habilidades seleccionadas, no se filtra por habilidades. |
| `RequestInput` | `projectId: string`, `message: string`; no contiene remitente ni estado. |
| `ProjectCard` | `id: string`, `ownerId: string`, `title: string`, `category: Category`, `problem: string`, `requiredSkills: Skill[]`, `supportNeed: string`, `creator: Pick<PublicProfile, "id" \| "displayName" \| "specialty">`. `ownerId` es el ID Auth de la creadora. |
| `ProjectDetails` | Todos los campos de `ProjectCard`, más `description: string`, `creator: PublicProfile` y `createdAt: string`. `creator.id` coincide con `ownerId`. |
| `CollaborationRequest` | `id: string`, `projectId: string`, `senderId: string`, `message: string`, `status: RequestStatus`, `createdAt: string`. |
| `SentRequest` | Todos los campos de `CollaborationRequest`, más `project: Pick<ProjectCard, "id" \| "title" \| "category">`. |
| `ReceivedRequest` | Todos los campos de `CollaborationRequest`, más `project: Pick<ProjectCard, "id" \| "title">` y `sender: Pick<PublicProfile, "id" \| "displayName" \| "specialty">`. |
| `RequestStatus` | `"pending" \| "accepted" \| "rejected"`. |
| `Decision` | `"accepted" \| "rejected"`. |

Los límites de longitud y los valores del catálogo se definen en la spec y se validan en el formulario y en la base. El adaptador debe reportar un error de validación en vez de aceptar datos inválidos.

## Servicios

Todos los métodos, excepto `subscribeToSession`, devuelven una promesa. Ante un fallo, la promesa se rechaza con `WarmiError`; no debe devolver datos vacíos como una operación exitosa. `subscribeToSession` devuelve una función que cancela la suscripción.

| Firma en `WarmiServices` | Resultado | Errores esperados |
| --- | --- | --- |
| `signIn(email: string, password: string)` | `Promise<SessionUser>` | `VALIDATION`, `UNAUTHENTICATED`, `NETWORK` |
| `getSession()` | `Promise<SessionUser \| null>` | `NETWORK` |
| `subscribeToSession(listener: (session: SessionUser \| null) => void)` | `() => void` | `UNEXPECTED` |
| `signOut()` | `Promise<void>` | `NETWORK` |
| `createProject(input: ProjectInput)` | `Promise<ProjectDetails>`; propietario derivado de la sesión | `UNAUTHENTICATED`, `VALIDATION`, `NETWORK` |
| `updateProject(projectId: string, input: ProjectInput)` | `Promise<ProjectDetails>` | `UNAUTHENTICATED`, `VALIDATION`, `FORBIDDEN`, `NOT_FOUND`, `NETWORK` |
| `listProjects(filters?: ProjectFilters)` | `Promise<ProjectCard[]>`; sin filtros devuelve el catálogo publicado | `NETWORK` |
| `getProject(projectId: string)` | `Promise<ProjectDetails>` | `NOT_FOUND`, `NETWORK` |
| `createRequest(input: RequestInput)` | `Promise<CollaborationRequest>`; remitente de la sesión, estado inicial pendiente | `UNAUTHENTICATED`, `VALIDATION`, `SELF_REQUEST`, `DUPLICATE_REQUEST`, `NOT_FOUND`, `NETWORK` |
| `listSentRequests()` | `Promise<SentRequest[]>` | `UNAUTHENTICATED`, `NETWORK` |
| `listReceivedRequests()` | `Promise<ReceivedRequest[]>` | `UNAUTHENTICATED`, `NETWORK` |
| `respondToRequest(requestId: string, decision: Decision)` | `Promise<CollaborationRequest>` | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_TRANSITION`, `NETWORK` |

`listSentRequests` deriva la remitente de la sesión; `listReceivedRequests` devuelve las solicitudes de proyectos cuya creadora es la sesión. Una consulta sin filas visibles devuelve `[]`. No se ofrece una función de eliminación o edición de solicitudes.

## Errores

`WarmiError` extiende `Error` y expone `code: WarmiErrorCode`. Los códigos compartidos son:

| Código | Uso |
| --- | --- |
| `VALIDATION` | Entrada que no cumple los límites o formatos acordados. |
| `UNAUTHENTICATED` | No hay sesión válida o el inicio de sesión falla; no se revela si la cuenta existe. |
| `FORBIDDEN` | La usuaria está autenticada, pero no puede realizar la operación. |
| `NOT_FOUND` | No existe el recurso solicitado o no está disponible para esa operación. |
| `DUPLICATE_REQUEST` | Ya existe una solicitud de esa remitente para ese proyecto. |
| `SELF_REQUEST` | La creadora intenta solicitar su propio proyecto. |
| `INVALID_TRANSITION` | La solicitud ya no está pendiente o la decisión no es válida. |
| `NETWORK` | Fallo de comunicación con el servicio. |
| `UNEXPECTED` | Fallo no clasificado, por ejemplo al establecer una suscripción. |

Los adaptadores deben conservar el código al traducir errores de Supabase o de mocks. No deben incluir contraseñas, tokens ni claves en el mensaje.

## Ejemplo: dos sesiones distintas

Los nombres `creatorServices` y `collaboratorServices` representan instancias independientes de `WarmiServices`, cada una asociada a su propia sesión Auth. La colaboradora obtiene el ID del proyecto publicado desde el catálogo público.

```ts
import { WarmiError } from "../src/contracts/services";

const project = await creatorServices.createProject({
  title: "Huerto urbano en campus",
  category: "Medioambiente",
  problem: "El campus tiene pocos espacios verdes para su comunidad.",
  description: "Propuesta piloto de cultivo comunitario y aprendizaje.",
  requiredSkills: ["Diseño gráfico", "Gestión de proyectos"],
  supportNeed: "Buscamos apoyo de diseño para materiales del piloto.",
});

const catalog = await collaboratorServices.listProjects();
const selectedProject = catalog.find(
  (item) => item.title === "Huerto urbano en campus",
);
if (!selectedProject) {
  throw new WarmiError("NOT_FOUND", "El proyecto no está disponible en el catálogo.");
}

const request = await collaboratorServices.createRequest({
  projectId: selectedProject.id,
  message: "Puedo apoyar con diseño de materiales y difusión.",
});
```

La creadora publica con `creatorServices`; su `project.ownerId` coincide con `project.creator.id` y con el ID de su sesión. La colaboradora consulta el catálogo con `collaboratorServices` y envía la solicitud usando el `id` del `ProjectCard` seleccionado. Así, `request.senderId` proviene de la sesión independiente de la colaboradora y `request.status` es `"pending"`; no es una solicitud al propio proyecto. Si no encuentra el proyecto, el ejemplo lanza `WarmiError` con `NOT_FOUND`; si intenta solicitarlo otra vez, el servicio rechaza con `DUPLICATE_REQUEST`.

## Consumidoras

- **A:** usa `createProject`, `updateProject`, `listSentRequests`, `listReceivedRequests` y `respondToRequest`.
- **C:** usa `listProjects`, `getProject` y `createRequest`.
- Ambas pueden importar los modelos directamente desde `src/contracts/models.ts`; las firmas están agrupadas en `WarmiServices` en `src/contracts/services.ts`.

La aplicación y T1 todavía no están creadas, por lo que este contrato independiente aún no puede validarse mediante build o pruebas automatizadas. Esa comprobación se ejecutará cuando exista la infraestructura del proyecto; esta limitación no significa que el build haya pasado.
