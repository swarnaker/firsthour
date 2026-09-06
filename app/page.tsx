"use client";

import { useState, useEffect } from "react";
import type { PonsToken, DataResponse, FilterType, SortType } from "@/lib/types";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import Feed from "@/components/Feed";
import Watchlist from "@/components/Watchlist";
import Alerts from "@/components/Alerts";
import Settings from "@/components/Settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "watchlist" | "alerts" | "settings">("feed");
  const [tokens, setTokens] = useState<PonsToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("heat");
  const [search, setSearch] = useState("");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("watchlist");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWatchlist(new Set(parsed));
      } catch (e) {
        console.error("Failed to parse watchlist:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(Array.from(watchlist)));
  }, [watchlist]);

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/tokens");
      if (res.ok) {
        const data: DataResponse = await res.json();
        
        const processedTokens = deduplicateTickers(data.tokens);
        setTokens(processedTokens);
        setHealth(data.health);
        setLastUpdate(data.timestamp);
      }
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  const deduplicateTickers = (tokens: PonsToken[]): PonsToken[] => {
    const symbolMap = new Map<string, PonsToken[]>();
    
    for (const token of tokens) {
      const sym = (token.symbol || "").toLowerCase().trim();
      if (!sym) continue;
      
      if (!symbolMap.has(sym)) {
        symbolMap.set(sym, []);
      }
      symbolMap.get(sym)!.push(token);
    }
    
    const result: PonsToken[] = [];
    const processed = new Set<string>();
    
    for (const token of tokens) {
      if (processed.has(token.token)) continue;
      
      const sym = (token.symbol || "").toLowerCase().trim();
      if (!sym) {
        result.push(token);
        processed.add(token.token);
        continue;
      }
      
      const duplicates = symbolMap.get(sym) || [];
      if (duplicates.length <= 1) {
        result.push(token);
        processed.add(token.token);
        continue;
      }
      
      duplicates.sort((a, b) => (b.heat || 0) - (a.heat || 0));
      
      const topToken = duplicates[0];
      if (token.token === topToken.token) {
        result.push(token);
        processed.add(token.token);
      } else if (token.token === duplicates[1]?.token) {
        result.push({
          ...token,
          symbol: token.symbol + " COPY",
        });
        processed.add(token.token);
      }
      
      for (let i = 2; i < duplicates.length; i++) {
        processed.add(duplicates[i].token);
      }
    }
    
    return result;
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (token: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(token)) {
        next.delete(token);
      } else {
        next.add(token);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header search={search} onSearchChange={setSearch} />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="container mx-auto px-4 py-4">
        {activeTab === "feed" && (
          <Feed
            tokens={tokens}
            loading={loading}
            filter={filter}
            sort={sort}
            search={search}
            watchlist={watchlist}
            onFilterChange={setFilter}
            onSortChange={setSort}
            onToggleWatchlist={toggleWatchlist}
            health={health}
          />
        )}

        {activeTab === "watchlist" && (
          <Watchlist
            tokens={tokens}
            watchlist={watchlist}
            sort={sort}
            search={search}
            onSortChange={setSort}
            onToggleWatchlist={toggleWatchlist}
          />
        )}

        {activeTab === "alerts" && <Alerts />}

        {activeTab === "settings" && <Settings health={health} />}
      </div>
    </div>
  );
}
