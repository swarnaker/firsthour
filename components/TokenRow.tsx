import type { PonsToken } from "@/lib/types";

interface TokenRowProps {
  token: PonsToken;
  isStarred: boolean;
  onToggleStar: () => void;
  showAged?: boolean;
  variant?: "table" | "card";
}

function formatAge(ageSec?: number): string {
  if (ageSec == null) return "—";
  const min = Math.floor(ageSec / 60);
  const sec = ageSec % 60;
  return `${min}m${sec}s`;
}

function formatNumber(n?: number): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

function formatPercent(p?: number): string {
  if (p == null) return "—";
  return (p * 100).toFixed(1) + "%";
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function TokenRow({ token, isStarred, onToggleStar, showAged, variant = "card" }: TokenRowProps) {
  const isAged = token.ageSec != null && token.ageSec >= 3600;
  const displayName = token.name || "Unknown";
  const displaySymbol = token.symbol || "???";
  const isHot = (token.heat || 0) >= 320;

  if (variant === "table") {
    return (
      <tr
        className="border-b hover:opacity-80 transition-opacity"
        style={{
          borderColor: "var(--border)",
          height: "44px",
        }}
      >
        <td className="px-2 py-1.5">
          <button
            onClick={onToggleStar}
            style={{ color: isStarred ? "var(--gold)" : "var(--text-dim)" }}
          >
            {isStarred ? "★" : "☆"}
          </button>
        </td>

        <td className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div>
              <div style={{ color: "var(--text-primary)" }}>
                {displayName}
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {displaySymbol}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(token.token)}
              className="text-[9px] px-1 py-0.5 border rounded hover:opacity-70"
              style={{ 
                color: "var(--text-dim)",
                borderColor: "var(--border)",
                whiteSpace: "nowrap"
              }}
            >
              COPY
            </button>
          </div>
        </td>

        <td className="px-2 py-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {formatAge(token.ageSec)}
        </td>

        <td className="px-2 py-1.5">
          <div
            className="flex items-center justify-center font-bold text-[11px]"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: isHot ? "var(--gold)" : "var(--bg-tertiary)",
              color: isHot ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
          >
            {token.heat || 0}
          </div>
        </td>

        <td className="px-2 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          ${formatNumber(token.mcapUsd)}
        </td>

        <td className="px-2 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          {token.graduated
            ? `$${formatNumber(token.liqUsd)}`
            : formatPercent(token.curveFillPct)}
        </td>

        <td className="px-2 py-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
          —
        </td>

        <td className="px-2 py-1.5">
          <div className="flex gap-2 text-xs">
            <a
              href={`https://www.ponsfamily.com/tokens/${token.token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--gold-dim)" }}
            >
              Pons
            </a>
            <a
              href={`https://dexscreener.com/robinhood/${token.token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--gold-dim)" }}
            >
              Dex
            </a>
            <a
              href={`https://robinhoodchain.blockscout.com/token/${token.token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--gold-dim)" }}
            >
              Scan
            </a>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div
      className="px-2 py-1.5 border rounded hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onToggleStar}
          style={{ color: isStarred ? "var(--gold)" : "var(--text-dim)" }}
        >
          {isStarred ? "★" : "☆"}
        </button>
        <span style={{ color: "var(--text-primary)" }}>{displayName}</span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{displaySymbol}</span>
        <div
          className="ml-auto flex items-center justify-center font-bold text-[11px]"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: isHot ? "var(--gold)" : "var(--bg-tertiary)",
            color: isHot ? "var(--bg-primary)" : "var(--text-secondary)",
          }}
        >
          {token.heat || 0}
        </div>
      </div>

      <div className="text-[11px] mb-1" style={{ color: "var(--text-secondary)" }}>
        {formatAge(token.ageSec)} · ${formatNumber(token.mcapUsd)} · {token.graduated
          ? `$${formatNumber(token.liqUsd)}`
          : formatPercent(token.curveFillPct)}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => copyToClipboard(token.token)}
          className="hover:underline"
          style={{ color: "var(--text-dim)" }}
        >
          {token.token.slice(0, 6)}...{token.token.slice(-4)}
        </button>
        <span style={{ color: "var(--text-dim)" }}>·</span>
        <a
          href={`https://www.ponsfamily.com/tokens/${token.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--gold-dim)" }}
        >
          Pons
        </a>
        <a
          href={`https://dexscreener.com/robinhood/${token.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--gold-dim)" }}
        >
          Dex
        </a>
        <a
          href={`https://robinhoodchain.blockscout.com/token/${token.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--gold-dim)" }}
        >
          Scan
        </a>
      </div>
    </div>
  );
}
