import { describe, expect, it } from "vitest";
import { haversineKm, roundDistanceKm } from "../src/distance";

describe("distance helpers", () => {
  it("rounds public distances to one decimal place", () => {
    expect(roundDistanceKm(0.64)).toBe(0.6);
    expect(roundDistanceKm(1.26)).toBe(1.3);
  });

  it("calculates a positive distance between nearby coordinates", () => {
    expect(haversineKm(21.0285, 105.8048, 21.03, 105.81)).toBeGreaterThan(0);
  });
});
