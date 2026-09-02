import { describe, expect, it } from "vitest";
import { app } from "../src/index";

describe("daydanhvan API", () => {
  it("returns health metadata", async () => {
    const response = await app.request("/api/v1/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, service: "daydanhvan-api", version: "0.1.0" });
  });

  it("returns privacy-safe teacher discovery records", async () => {
    const response = await app.request("/api/v1/teachers?verified=true&maxDistanceKm=2");
    expect(response.status).toBe(200);
    const body = await response.json() as { teachers: Array<Record<string, unknown>>; meta: { approximateLocation: boolean } };
    expect(body.meta.approximateLocation).toBe(true);
    expect(body.teachers.length).toBeGreaterThan(0);
    expect(body.teachers.every((teacher) => !("serviceLat" in teacher) && !("serviceLng" in teacher))).toBe(true);
  });

  it("fails closed for admin endpoints when no secret is configured", async () => {
    const response = await app.request("/api/v1/admin/teachers");
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "forbidden" });
  });
});
