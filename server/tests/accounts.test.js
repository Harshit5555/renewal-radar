import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { clearTestDb, startTestDb, stopTestDb } from "./testDb.js";

const app = createApp();

const sample = (overrides = {}) => ({
  name: "Test Co",
  owner: "Ana Ruiz",
  segment: "SMB",
  arr: 50000,
  healthScore: 70,
  renewalDate: "2027-01-15",
  ...overrides,
});

describe("accounts API", () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  beforeEach(clearTestDb);

  it("creates an account", async () => {
    const res = await request(app).post("/api/accounts").send(sample());
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Co");
    expect(res.body.source).toBe("manual");
  });

  it("rejects a health score above 100", async () => {
    const res = await request(app).post("/api/accounts").send(sample({ healthScore: 140 }));
    expect(res.status).toBe(400);
  });

  it("lists accounts by name and filters by owner", async () => {
    await request(app).post("/api/accounts").send(sample({ name: "Zeta", owner: "Ben Carter" }));
    await request(app).post("/api/accounts").send(sample({ name: "Alpha" }));

    const all = await request(app).get("/api/accounts");
    expect(all.body.map((a) => a.name)).toEqual(["Alpha", "Zeta"]);

    const bens = await request(app).get("/api/accounts?owner=Ben%20Carter");
    expect(bens.body.map((a) => a.name)).toEqual(["Zeta"]);
  });

  it("updates an account and returns the new values", async () => {
    const created = await request(app).post("/api/accounts").send(sample());
    const res = await request(app)
      .put(`/api/accounts/${created.body._id}`)
      .send({ owner: "Dee Patel", healthScore: 45 });
    expect(res.status).toBe(200);
    expect(res.body.owner).toBe("Dee Patel");
    expect(res.body.healthScore).toBe(45);
  });

  it("returns 400 for a malformed id and 404 for an unknown one", async () => {
    expect((await request(app).get("/api/accounts/not-an-id")).status).toBe(400);
    expect((await request(app).get("/api/accounts/64b7f0c2a1b2c3d4e5f60718")).status).toBe(404);
  });

  it("imports rows from a spreadsheet", async () => {
    const res = await request(app)
      .post("/api/accounts/import")
      .send({
        rows: [
          { name: "Row One", owner: "Chen Li", arr: "40000", healthScore: "75", renewalDate: "2027-03-01" },
          { name: "Row Two", owner: "Chen Li", arr: "22000", healthScore: "60", renewalDate: "2027-04-01" },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.insertedCount).toBe(2);

    const list = await request(app).get("/api/accounts");
    expect(list.body).toHaveLength(2);
    expect(list.body.every((a) => a.source === "import")).toBe(true);
  });

  it("rejects an import row with a missing field", async () => {
    const res = await request(app)
      .post("/api/accounts/import")
      .send({ rows: [{ name: "No Owner", arr: "1000", healthScore: "50", renewalDate: "2027-01-01" }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Row 1 is missing owner");
  });
});
