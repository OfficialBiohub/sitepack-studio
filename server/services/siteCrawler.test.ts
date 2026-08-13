import { describe, expect, it } from "vitest";
import { isPublicIp, normalizePublicUrl } from "./siteCrawler";

describe("site crawler URL safeguards", () => {
  it("normalizes a public https URL and strips its fragment", () => {
    expect(normalizePublicUrl("https://example.com/docs#intro").toString()).toBe("https://example.com/docs");
  });

  it("rejects non-http protocols and credential-bearing targets", () => {
    expect(() => normalizePublicUrl("file:///etc/passwd")).toThrow(/public http or https/i);
    expect(() => normalizePublicUrl("https://name:password@example.com")).toThrow(/without credentials/i);
  });

  it("identifies private and public address ranges", () => {
    expect(isPublicIp("127.0.0.1")).toBe(false);
    expect(isPublicIp("10.0.0.8")).toBe(false);
    expect(isPublicIp("192.168.1.44")).toBe(false);
    expect(isPublicIp("8.8.8.8")).toBe(true);
    expect(isPublicIp("::1")).toBe(false);
  });
});
