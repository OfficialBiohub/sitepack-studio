import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { hasValidWebhookSecret, replyFor } from "./telegramWebhook";

describe("Telegram webhook controls", () => {
  it("accepts only the configured Telegram secret header", () => {
    expect(hasValidWebhookSecret(ENV.telegramWebhookSecret)).toBe(true);
    expect(hasValidWebhookSecret(`${ENV.telegramWebhookSecret}x`)).toBe(false);
    expect(hasValidWebhookSecret("")).toBe(false);
  });

  it("returns useful bot responses without exposing secrets", () => {
    expect(replyFor("/start")).toContain("Welcome to SitePack Studio");
    expect(replyFor("/help")).toContain("Server code");
    expect(replyFor("hello")).toContain("/start");
  });
});
