const alertCache = new Map<string, number>();
const DEDUPE_MS = 30 * 60 * 1000;

export async function sendTelegramAlert(
  token: string,
  heat: number,
  name?: string,
  symbol?: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  const cacheKey = token.toLowerCase();
  const lastSent = alertCache.get(cacheKey);

  if (lastSent && Date.now() - lastSent < DEDUPE_MS) {
    return false;
  }

  try {
    const message = `🔥 FIRSTHOUR Alert\n\n${name || "Unknown"} (${symbol || "???"})\nHeat: ${heat}\nCA: ${token}\n\nhttps://dexscreener.com/robinhood/${token}`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (res.ok) {
      alertCache.set(cacheKey, Date.now());
      return true;
    }

    return false;
  } catch (err) {
    console.error("Telegram alert error:", err);
    return false;
  }
}
