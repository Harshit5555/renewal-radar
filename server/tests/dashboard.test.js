import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { clearTestDb, startTestDb, stopTestDb } from "./testDb.js";

const app = createApp();

async function addAccount(name, healthScore, arr) {
  await request(app).post("/api/accounts").send({
    name,
    owner: "Ana Ruiz",
    arr,
    healthScore,
    renewalDate: "2027-01-01",
  });
}

describe("dashboard API", () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  beforeEach(clearTestDb);

  it("summarizes accounts, total ARR and at-risk count", async () => {
    await addAccount("Healthy", 80, 100000);
    await addAccount("Shaky", 35, 50000);
    await addAccount("Critical", 10, 25000);

    const res = await request(app).get("/api/dashboard/summary");
    expect(res.body).toEqual({ accounts: 3, totalArr: 175000, atRisk: 2 });
  });

  it("lists at-risk accounts, lowest health first", async () => {
    await addAccount("Healthy", 80, 100000);
    await addAccount("Shaky", 35, 50000);
    await addAccount("Critical", 10, 25000);
    await addAccount("Borderline", 40, 30000);

    const res = await request(app).get("/api/dashboard/at-risk");
    expect(res.body.map((a) => a.name)).toEqual(["Critical", "Shaky"]);
  });

  it("returns an empty summary when there are no accounts", async () => {
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.body).toEqual({ accounts: 0, totalArr: 0, atRisk: 0 });
  });

  it("lists distinct owners", async () => {
    await addAccount("One", 80, 1000);
    await addAccount("Two", 70, 1000);
    const res = await request(app).get("/api/dashboard/owners");
    expect(res.body).toEqual(["Ana Ruiz"]);
  });
});
