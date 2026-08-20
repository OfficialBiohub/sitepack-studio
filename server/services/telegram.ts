import { ENV } from "../_core/env";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export type TelegramBotIdentity = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
};

export type TelegramWebhookInfo = {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
};

export type TelegramWebhookUpdate = {
  message?: {
    chat?: { id?: number };
    text?: string;
  };
};

function getBotToken() {
  if (!ENV.telegramBotToken) {
    throw new Error("Telegram bot credentials have not been configured.");
  }
  return ENV.telegramBotToken;
}

export async function callTelegramApi<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${getBotToken()}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

  const payload = await response.json().catch(() => null) as TelegramResponse<T> | null;
  if (!response.ok || !payload?.ok || payload.result === undefined) {
    throw new Error(payload?.description || "Telegram rejected the bot request.");
  }

  return payload.result;
}

export function getTelegramBotIdentity() {
  return callTelegramApi<TelegramBotIdentity>("getMe");
}

export function getTelegramWebhookInfo() {
  return callTelegramApi<TelegramWebhookInfo>("getWebhookInfo");
}

export function sendTelegramMessage(chatId: number, text: string) {
  return callTelegramApi<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
}
