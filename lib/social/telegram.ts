/** Publicação em canal do Telegram via Bot API (Fase 2). */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
}

export async function publishToTelegram(input: { caption: string; imageUrl?: string }): Promise<{ id: number }> {
  if (!isTelegramConfigured()) throw new Error("Telegram não configurado.");
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHANNEL_ID!;
  const base = `https://api.telegram.org/bot${token}`;

  const endpoint = input.imageUrl ? `${base}/sendPhoto` : `${base}/sendMessage`;
  const body = input.imageUrl
    ? { chat_id: chatId, photo: input.imageUrl, caption: input.caption, parse_mode: "HTML" }
    : { chat_id: chatId, text: input.caption, parse_mode: "HTML" };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Telegram: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { result: { message_id: number } };
  return { id: data.result.message_id };
}
