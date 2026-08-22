import { describe, expect, it } from "vitest";
import { ENV } from "../_core/env";
import { getTelegramBotIdentity, getTelegramWebhookInfo } from "./telegram";

describe("Telegram bot credentials", () => {
  it("authenticates the configured server-only token with Telegram getMe", async () => {
    const bot = await getTelegramBotIdentity();

    expect(bot.is_bot).toBe(true);
    expect(bot.id).toBeTypeOf("number");
    expect(bot.first_name.length).toBeGreaterThan(0);
  }, 15_000);

  it("loads the webhook verifier while reading the bot webhook status", async () => {
    expect(ENV.telegramWebhookSecret).toMatch(/^[a-f0-9]{64}$/);

    const webhook = await getTelegramWebhookInfo();
    expect(webhook.pending_update_count).toBeTypeOf("number");
  }, 15_000);
});
