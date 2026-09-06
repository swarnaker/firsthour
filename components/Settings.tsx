"use client";

import { useState, useEffect } from "react";

interface SettingsProps {
  health: any[];
}

export default function Settings({ health }: SettingsProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [chatId, setChatId] = useState("");
  const [telegramStatus, setTelegramStatus] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/settings/chat-id");
      if (res.ok) {
        setIsLoggedIn(true);
        const data = await res.json();
        setTelegramStatus(data);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsLoggedIn(true);
        setPassword("");
        checkAuth();
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (err) {
      setLoginError("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      setTelegramStatus(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gold)" }}>
          Admin Login
        </h2>

        <form
          onSubmit={handleLogin}
          className="p-4 border rounded space-y-4"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {loginError && (
            <div
              className="p-2 rounded text-sm"
              style={{ backgroundColor: "var(--red)", color: "var(--bg-primary)" }}
            >
              {loginError}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded font-medium"
            style={{ backgroundColor: "var(--gold)", color: "var(--bg-primary)" }}
          >
            Login
          </button>

          <p className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>
            Configure ADMIN_USER and ADMIN_PASSWORD environment variables
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: "var(--gold)" }}>
          Settings
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded text-sm"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          Logout
        </button>
      </div>

      <div
        className="p-4 border rounded"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          System Health
        </h3>
        <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
          {health.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: h.ok ? "var(--green)" : "var(--red)" }}>
                {h.ok ? "✓" : "✗"}
              </span>
              <span>
                {h.name}: {h.detail} ({h.ms}ms)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 border rounded"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Telegram Configuration
        </h3>

        {telegramStatus && (
          <div className="mb-4 text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: telegramStatus.hasBotToken ? "var(--green)" : "var(--red)" }}>
                {telegramStatus.hasBotToken ? "✓" : "✗"}
              </span>
              <span>Bot Token {telegramStatus.hasBotToken ? "configured" : "missing"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: telegramStatus.hasChatId ? "var(--green)" : "var(--red)" }}>
                {telegramStatus.hasChatId ? "✓" : "✗"}
              </span>
              <span>Chat ID {telegramStatus.hasChatId ? "configured" : "missing"}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm" style={{ color: "var(--text-secondary)" }}>
            Chat ID
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter Telegram Chat ID"
            className="w-full px-3 py-2 border rounded"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Note: Chat ID and Bot Token should be set as environment variables (TELEGRAM_CHAT_ID,
            TELEGRAM_BOT_TOKEN). This form is for reference only.
          </p>
        </div>
      </div>

      <div
        className="p-4 border rounded"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Environment Variables
        </h3>
        <ul className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
          <li>• ROBINHOOD_RPC_URL - Optional RPC endpoint</li>
          <li>• ADMIN_USER - Admin username (default: admin)</li>
          <li>• ADMIN_PASSWORD - Admin password (default: admin)</li>
          <li>• TELEGRAM_BOT_TOKEN - Telegram bot token</li>
          <li>• TELEGRAM_CHAT_ID - Telegram chat ID for alerts</li>
          <li>• CRON_SECRET - Optional secret for cron endpoint protection</li>
        </ul>
      </div>
    </div>
  );
}
