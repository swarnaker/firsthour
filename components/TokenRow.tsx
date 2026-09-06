import type { PonsToken } from "@/lib/types";

interface TokenRowProps {
  token: PonsToken;
  isStarred: boolean;
  onToggleStar: () => void;
  showAged?: boolean;
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

export default function TokenRow({ token, isStarred, onToggleStar, showAged }: TokenRowProps) {
  const isAged = token.ageSec != null && token.ageSec >= 3600;
  const displayName = token.name || "Unknown";
  const displaySymbol = token.symbol || "???";

  return (
    <div
      className="p-3 border rounded flex items-center gap-4 hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={onToggleStar}
        className="text-lg"
        style={{ color: isStarred ? "var(--gold)" : "var(--text-dim)" }}
      >
        {isStarred ? "★" : "☆"}
      </button>

      <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm">
        <div className="col-span-3">
          <div className="font-bold" style={{ color: "var(--text-primary)" }}>
            {displayName}
          </div>
          <div style={{ color: "var(--text-secondary)" }}>{displaySymbol}</div>
          <button
            onClick={() => copyToClipboard(token.token)}
            className="text-xs hover:underline"
            style={{ color: "var(--text-dim)" }}
          >
            {token.token.slice(0, 6)}...{token.token.slice(-4)}
          </button>
        </div>

        <div className="col-span-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {formatAge(token.ageSec)}
        </div>

        <div className="col-span-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          ${formatNumber(token.mcapUsd)}
        </div>

        <div className="col-span-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {token.graduated
            ? `$${formatNumber(token.liqUsd)}`
            : formatPercent(token.curveFillPct)}
        </div>

        <div className="col-span-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          —
        </div>

        <div className="col-span-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          —
        </div>

        <div className="col-span-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
            style={{
              backgroundColor:
                (token.heat || 0) >= 200 ? "var(--gold-dim)" : "var(--bg-tertiary)",
              color: (token.heat || 0) >= 200 ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
          >
            {token.heat || 0}
          </div>
        </div>

        <div className="col-span-3 flex gap-2 text-xs">
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

      {showAged && isAged && (
        <span
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: "var(--gold-dim)", color: "var(--bg-primary)" }}
        >
          AGED
        </span>
      )}
    </div>
  );
}
