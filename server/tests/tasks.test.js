import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { clearTestDb, startTestDb, stopTestDb } from "./testDb.js";

const app = createApp();

async function createAccount() {
  const res = await request(app).post("/api/accounts").send({
    name: "Task Co",
    owner: "Ana Ruiz",
    arr: 30000,
    healthScore: 60,
    renewalDate: "2027-02-01",
  });
  return res.body._id;
}

describe("tasks API", () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  beforeEach(clearTestDb);

  it("adds a task to an account", async () => {
    const accountId = await createAccount();
    const res = await request(app)
      .post(`/api/accounts/${accountId}/tasks`)
      .send({ title: "Kickoff call", dueDate: "2026-12-01" });
    expect(res.status).toBe(201);
    expect(res.body.done).toBe(false);
  });

  it("lists open tasks before finished ones", async () => {
    const accountId = await createAccount();
    const first = await request(app)
      .post(`/api/accounts/${accountId}/tasks`)
      .send({ title: "Already done", dueDate: "2026-11-01" });
    await request(app).post(`/api/accounts/${accountId}/tasks`).send({ title: "Still open", dueDate: "2026-12-01" });
    await request(app).patch(`/api/tasks/${first.body._id}`).send({ done: true });

    const res = await request(app).get(`/api/accounts/${accountId}/tasks`);
    expect(res.body.map((t) => t.title)).toEqual(["Still open", "Already done"]);
  });

  it("marks a task done", async () => {
    const accountId = await createAccount();
    const created = await request(app)
      .post(`/api/accounts/${accountId}/tasks`)
      .send({ title: "Send quote", dueDate: "2026-12-01" });

    const patch = await request(app).patch(`/api/tasks/${created.body._id}`).send({ done: true });
    expect(patch.status).toBe(200);

    const list = await request(app).get(`/api/accounts/${accountId}/tasks`);
    expect(list.body[0].done).toBe(true);
    expect(list.body[0].completedAt).not.toBeNull();
  });

  it("rejects a done value that is not a boolean", async () => {
    const accountId = await createAccount();
    const created = await request(app)
      .post(`/api/accounts/${accountId}/tasks`)
      .send({ title: "Send quote", dueDate: "2026-12-01" });
    const res = await request(app).patch(`/api/tasks/${created.body._id}`).send({ done: "yes" });
    expect(res.status).toBe(400);
  });
});
