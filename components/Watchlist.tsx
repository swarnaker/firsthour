import type { PonsToken, SortType } from "@/lib/types";
import TokenRow from "./TokenRow";
import { useState, useEffect } from "react";

interface WatchlistProps {
  tokens: PonsToken[];
  watchlist: Set<string>;
  sort: SortType;
  search: string;
  onSortChange: (sort: SortType) => void;
  onToggleWatchlist: (token: string) => void;
}

export default function Watchlist({
  tokens,
  watchlist,
  sort,
  search,
  onSortChange,
  onToggleWatchlist,
}: WatchlistProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 900);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  let filtered = tokens.filter((t) => {
    if (!watchlist.has(t.token)) return false;

    if (search) {
      const s = search.toLowerCase();
      if (
        !t.token.toLowerCase().includes(s) &&
        !t.symbol?.toLowerCase().includes(s) &&
        !t.name?.toLowerCase().includes(s)
      ) {
        return false;
      }
    }

    return true;
  });

  if (sort === "heat") {
    filtered.sort((a, b) => (b.heat || 0) - (a.heat || 0));
  } else if (sort === "newest") {
    filtered.sort((a, b) => (a.ageSec || 0) - (b.ageSec || 0));
  } else if (sort === "mcap") {
    filtered.sort((a, b) => (b.mcapUsd || 0) - (a.mcapUsd || 0));
  } else if (sort === "curve") {
    filtered.sort((a, b) => (b.curveFillPct || 0) - (a.curveFillPct || 0));
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
          SORT:
        </span>
        {(["heat", "newest", "mcap", "curve"] as SortType[]).map((s) => (
          <button
            key={s}
            onClick={() => onSortChange(s)}
            className="px-2 py-1 text-xs rounded"
            style={{
              backgroundColor: sort === s ? "var(--gold-dim)" : "var(--bg-tertiary)",
              color: sort === s ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
          >
            {s === "curve" ? "Curve %" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--text-dim)" }}>
          No tokens in watchlist
        </div>
      ) : isDesktop ? (
        <table
          className="w-full"
          style={{
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                ★
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Token
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Age
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Heat
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Mcap
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Liq/Curve%
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                5m%
              </th>
              <th className="px-2 py-1.5 text-left text-xs" style={{ color: "var(--text-dim)" }}>
                Links
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((token) => (
              <TokenRow
                key={token.token}
                token={token}
                isStarred={true}
                onToggleStar={() => onToggleWatchlist(token.token)}
                variant="table"
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="space-y-1">
          {filtered.map((token) => (
            <TokenRow
              key={token.token}
              token={token}
              isStarred={true}
              onToggleStar={() => onToggleWatchlist(token.token)}
              showAged={true}
              variant="card"
            />
          ))}
        </div>
      )}
    </div>
  );
}
