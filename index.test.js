import request from "supertest";
import { jest } from "@jest/globals";

const mockFetch = jest.fn();

jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch,
}));

const { default: app } = await import("./index.js");

describe("GET /repo-size/:owner/:repo", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("returns 401 when Authorization header is missing", async () => {
    const response = await request(app).get("/repo-size/octocat/hello-world");

    expect(response.status).toBe(401);
    expect(response.text).toBe("Missing Authorization header");
  });

  test("returns an SVG badge with repo size", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ size: 2048 }),
    });

    const response = await request(app)
      .get("/repo-size/octocat/hello-world")
      .set("Authorization", "Bearer test-token");
    const svg = response.text ?? response.body?.toString("utf8");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/image\/svg\+xml/);
    expect(svg).toContain("REPO SIZE");
    expect(svg).toContain("2.00 MB");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/octocat/hello-world",
      { headers: { Authorization: "Bearer test-token" } },
    );
  });
});
