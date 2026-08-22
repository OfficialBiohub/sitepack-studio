import { timingSafeEqual } from "node:crypto";
import type { Express, Request } from "express";
import { ENV } from "./_core/env";
import { sendTelegramMessage, type TelegramWebhookUpdate } from "./services/telegram";

const STUDIO_URL = ENV.publicAppUrl;

export function hasValidWebhookSecret(supplied: string, expected = ENV.telegramWebhookSecret) {
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function replyFor(text: string) {
  const command = text.trim().split(/\s+/)[0]?.split("@")[0].toLowerCase();
  if (command === "/start") {
    return `Welcome to SitePack Studio. Send /help to learn how the public-site archiver works, or open ${STUDIO_URL} to pack an authorized public page into an offline ZIP.`;
  }
  if (command === "/help") {
    return `SitePack Studio saves publicly accessible frontend files for pages you are authorized to archive. It packages HTML, CSS, JavaScript, fonts, images, media, and static imports. Server code, databases, login sessions, private APIs, and protected content cannot be copied. Start at ${STUDIO_URL}.`;
  }
  return "Use /start for the SitePack Studio welcome message or /help for archive limitations and the website link.";
}

async function respondToUpdate(update: TelegramWebhookUpdate) {
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (!chatId || !text) return;
  await sendTelegramMessage(chatId, replyFor(text));
}

export function registerTelegramWebhook(app: Express) {
  app.post("/api/telegram/webhook", (request, response) => {
    const supplied = request.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
    if (!hasValidWebhookSecret(supplied)) {
      response.status(401).json({ ok: false });
      return;
    }

    response.status(200).json({ ok: true });
    void respondToUpdate(request.body as TelegramWebhookUpdate).catch((error) => {
      const message = error instanceof Error ? error.message : "Unknown Telegram delivery error";
      console.error(`[Telegram] Could not respond to update: ${message}`);
    });
  });
}
