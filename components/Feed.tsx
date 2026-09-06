import type { PonsToken, FilterType, SortType } from "@/lib/types";
import TokenRow from "./TokenRow";
import { useState, useEffect } from "react";

interface FeedProps {
  tokens: PonsToken[];
  loading: boolean;
  filter: FilterType;
  sort: SortType;
  search: string;
  watchlist: Set<string>;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  onToggleWatchlist: (token: string) => void;
  health: any[];
}

export default function Feed({
  tokens,
  loading,
  filter,
  sort,
  search,
  watchlist,
  onFilterChange,
  onSortChange,
  onToggleWatchlist,
  health,
}: FeedProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 900);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  let filtered = tokens.filter((t) => {
    if (t.ageSec == null || t.ageSec >= 3600) return false;

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

    if (filter === "new" && (t.ageSec == null || t.ageSec > 600)) return false;
    if (filter === "bonding" && t.graduated) return false;
    if (filter === "almost-bonded" && (!t.curveFillPct || t.curveFillPct < 0.8 || t.graduated))
      return false;
    if (filter === "graduated" && !t.graduated) return false;
    if (filter === "heat200" && (!t.heat || t.heat < 320 || !t.mcapUsd || t.mcapUsd < 50000)) return false;

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
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex gap-2">
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
            SCAN:
          </span>
          {(["all", "new", "bonding", "almost-bonded", "graduated", "heat200"] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: filter === f ? "var(--gold-dim)" : "var(--bg-tertiary)",
                  color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)",
                }}
              >
                {f === "heat200" ? "Heat>200" : f.replace("-", " ")}
              </button>
            )
          )}
        </div>

        <div className="flex gap-2">
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
      </div>

      {health.length > 0 && (
        <div className="mb-4 p-2 border rounded" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs" style={{ color: "var(--text-dim)" }}>
            {health.map((h, i) => (
              <div key={i}>
                {h.name}: {h.ok ? "✓" : "✗"} {h.detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8" style={{ color: "var(--text-dim)" }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--text-dim)" }}>
          No Pons tokens under 1 hour
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
                isStarred={watchlist.has(token.token)}
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
              isStarred={watchlist.has(token.token)}
              onToggleStar={() => onToggleWatchlist(token.token)}
              variant="card"
            />
          ))}
        </div>
      )}
    </div>
  );
}
