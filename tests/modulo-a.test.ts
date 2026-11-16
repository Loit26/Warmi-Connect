// Pruebas del módulo A: validaciones de publicación y gestión de solicitudes.
import { describe, expect, it } from "vitest";
import { validarProyecto, type BorradorProyecto } from "../src/features/publicar/validacion";
import { mockServices } from "../src/services/mock";
import { WarmiError } from "../src/contracts/services";

const valido: BorradorProyecto = {
  title: "Huerto urbano en campus",
  category: "Medioambiente",
  problem: "El campus tiene pocos espacios verdes para su comunidad.",
  description: "Propuesta piloto de cultivo comunitario y aprendizaje.",
  requiredSkills: ["Diseño gráfico"],
  supportNeed: "Diseñar los materiales del piloto.",
};

describe("validarProyecto (A-2)", () => {
  it("acepta un proyecto completo", () => {
    expect(validarProyecto(valido)).toEqual({});
  });

  it("no permite publicar un formulario vacío", () => {
    const errores = validarProyecto({
      title: "",
      category: "",
      problem: "",
      description: "",
      requiredSkills: [],
      supportNeed: "",
    });
    expect(Object.keys(errores).sort()).toEqual(
      ["category", "description", "problem", "requiredSkills", "supportNeed", "title"].sort(),
    );
  });

  it("no acepta textos de solo espacios", () => {
    expect(validarProyecto({ ...valido, title: "     " }).title).toBeDefined();
  });

  it("rechaza textos demasiado largos", () => {
    expect(validarProyecto({ ...valido, title: "a".repeat(81) }).title).toMatch(/Máximo/);
  });
});

describe("createProject con mock (A-3)", () => {
  it("guarda el proyecto y lo devuelve con su creadora", async () => {
    const p = await mockServices.createProject({ ...valido, category: "Medioambiente" });
    expect(p.title).toBe(valido.title);
    expect(p.ownerId).toBe(p.creator.id);
  });

  it("rechaza datos inválidos con VALIDATION", async () => {
    await expect(
      mockServices.createProject({ ...valido, category: "Medioambiente", title: "" }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});

describe("Mis solicitudes (A-5, A-6)", () => {
  it("lista recibidas y enviadas con sus estados", async () => {
    const recibidas = await mockServices.listReceivedRequests();
    const enviadas = await mockServices.listSentRequests();
    expect(recibidas.length).toBeGreaterThan(0);
    expect(enviadas.length).toBeGreaterThan(0);
    for (const s of [...recibidas, ...enviadas]) {
      expect(["pending", "accepted", "rejected"]).toContain(s.status);
    }
  });

  it("acepta una solicitud pendiente y no deja responderla dos veces", async () => {
    const pendiente = (await mockServices.listReceivedRequests()).find(
      (s) => s.status === "pending",
    )!;
    const r = await mockServices.respondToRequest(pendiente.id, "accepted");
    expect(r.status).toBe("accepted");

    const segunda = mockServices.respondToRequest(pendiente.id, "rejected");
    await expect(segunda).rejects.toBeInstanceOf(WarmiError);
    await expect(segunda).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
  });
});
