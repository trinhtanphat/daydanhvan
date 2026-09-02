import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      teachers: [{ id: "mai-anh", name: "Mai Anh", age: 24, distanceKm: 0.6, verified: true, specialty: "Đánh vần nền tảng", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.9 }],
      meta: { approximateLocation: true, count: 1 }
    })
  }));
});

describe("App", () => {
  it("renders the brand, discovery content and primary navigation", async () => {
    render(<App />);
    expect(screen.getByText("Dạy đánh vần")).toBeInTheDocument();
    expect(screen.getByText("Tìm cô giáo gần bạn")).toBeInTheDocument();
    expect(await screen.findByText("Mai Anh")).toBeInTheDocument();
    for (const label of ["Trang chủ", "Tìm kiếm", "Tin nhắn", "Yêu thích", "Tài khoản"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
