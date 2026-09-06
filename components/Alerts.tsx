export default function Alerts() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gold)" }}>
        Telegram Alerts
      </h2>

      <div
        className="p-4 border rounded mb-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          How it works
        </h3>
        <ul className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
          <li>• Alerts trigger when heat crosses 200 while age {"<"} 1 hour</li>
          <li>• 30-minute dedupe per CA to avoid spam</li>
          <li>• Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables</li>
          <li>
            • Set up a cron job to hit{" "}
            <code
              className="px-1 py-0.5 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              /api/cron/notify
            </code>
          </li>
          <li>
            • Optional: Protect with CRON_SECRET and pass as{" "}
            <code
              className="px-1 py-0.5 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              Authorization: Bearer {"{CRON_SECRET}"}
            </code>
          </li>
        </ul>
      </div>

      <div
        className="p-4 border rounded"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Setup Instructions
        </h3>
        <ol className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
          <li>1. Create a Telegram bot via @BotFather</li>
          <li>2. Get your Chat ID (use @userinfobot or similar)</li>
          <li>3. Add TELEGRAM_BOT_TOKEN to environment variables</li>
          <li>4. Add TELEGRAM_CHAT_ID to environment variables (can be set in Settings)</li>
          <li>5. Set up a cron job (every 5-10 minutes recommended)</li>
        </ol>
      </div>
    </div>
  );
}
