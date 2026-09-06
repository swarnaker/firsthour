import {
  isProtocol,
  isQuoteAddr,
  PONS_GRADUATED_CATALOG_URL,
  PONS_FACTORY_V2,
  POOL_GRADUATED_TOPIC0,
  LAUNCH_SWEPT_TOPIC0,
  TOKEN_LAUNCHED_TOPIC0,
  MAX_AGE_SEC,
} from "./constants";
import type { PonsToken, HealthSource } from "./types";
import { heatScore, isMoving } from "./heat";

const TIMEOUT_MS = 4000;
const CACHE_MS = 5 * 60 * 1000;

type CatalogRow = {
  factory?: string;
  token?: string;
  deployer?: string;
  transactionHash?: string;
  blockNumber?: number;
  launchedAt?: string;
  graduatedAt?: string;
  name?: string;
  symbol?: string;
  logo?: string;
  marketCapUsd?: number | null;
  realMcapUsd?: number | null;
  liquidityUsd?: number | null;
  graduated?: boolean;
};

type RpcLog = {
  address?: string;
  topics?: string[];
  data?: string;
  blockNumber?: string;
  transactionHash?: string;
};

let catalogCache: { tokens: PonsToken[]; at: number } | null = null;
let rpcCache: { tokens: PonsToken[]; at: number } | null = null;

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function topicToAddress(topic: string | undefined): string | null {
  if (!topic || topic.length < 66) return null;
  const addr = "0x" + topic.slice(-40);
  return /^0x[a-fA-F0-9]{40}$/.test(addr) ? addr : null;
}

async function fetchCatalog(): Promise<{ tokens: PonsToken[]; health: HealthSource }> {
  const name = "Pons catalog";
  const t0 = Date.now();

  if (catalogCache && Date.now() - catalogCache.at < CACHE_MS) {
    return {
      tokens: catalogCache.tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail: `${catalogCache.tokens.length} graduated (cached)`,
      },
    };
  }

  try {
    const res = await fetch(PONS_GRADUATED_CATALOG_URL, {
      headers: { accept: "application/json", "user-agent": "firsthour/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    const raw = (await res.json()) as unknown;
    const rows = Array.isArray(raw) ? raw : Array.isArray((raw as any).data) ? (raw as any).data : [];

    const tokens: PonsToken[] = [];
    const seen = new Set<string>();
    const now = Date.now();

    for (const row of rows as CatalogRow[]) {
      const token = (row.token || "").trim();
      if (!token || !/^0x[a-fA-F0-9]{40}$/i.test(token)) continue;
      if (row.graduated !== true) continue;
      if (isProtocol(token) || isQuoteAddr(token, row.symbol)) continue;

      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const launched = row.launchedAt ? Date.parse(row.launchedAt) : NaN;
      const graduatedAt = row.graduatedAt ? Date.parse(row.graduatedAt) : NaN;
      const ts = Number.isFinite(launched) ? launched : Number.isFinite(graduatedAt) ? graduatedAt : now;
      const ageSec = Math.floor((now - ts) / 1000);

      if (ageSec >= MAX_AGE_SEC) continue;

      const mcap = num(row.realMcapUsd) ?? num(row.marketCapUsd);
      const liq = num(row.liquidityUsd);

      tokens.push({
        token,
        deployer: row.deployer || "0x0000000000000000000000000000000000000000",
        factory: row.factory || PONS_FACTORY_V2,
        blockNumber: typeof row.blockNumber === "number" ? row.blockNumber : 0,
        txHash: row.transactionHash || "",
        timestampMs: ts,
        name: row.name,
        symbol: row.symbol,
        chain: "robinhood",
        pad: "PONS",
        mcapUsd: mcap,
        liqUsd: liq,
        logo: row.logo,
        graduated: true,
        ageSec,
      });
    }

    catalogCache = { tokens, at: Date.now() };

    return {
      tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail: `${tokens.length} graduated`,
      },
    };
  } catch (err) {
    if (catalogCache) {
      return {
        tokens: catalogCache.tokens,
        health: {
          name,
          ok: true,
          hits: 1,
          attempts: 1,
          ms: Date.now() - t0,
          detail: `${catalogCache.tokens.length} graduated (last good)`,
        },
      };
    }

    return {
      tokens: [],
      health: {
        name,
        ok: false,
        hits: 0,
        attempts: 1,
        ms: Date.now() - t0,
        detail: err instanceof Error ? err.message : "unknown error",
      },
    };
  }
}

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: { message?: string } };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || "HTTP " + res.status);
  }
  return json.result as T;
}

async function fetchRpcGraduations(
  rpcUrl: string
): Promise<{ tokens: PonsToken[]; health: HealthSource }> {
  const name = "RPC graduations";
  const t0 = Date.now();

  if (rpcCache && Date.now() - rpcCache.at < CACHE_MS) {
    return {
      tokens: rpcCache.tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail: `${rpcCache.tokens.length} RPC grads (cached)`,
      },
    };
  }

  try {
    const headHex = await rpc<string>(rpcUrl, "eth_blockNumber", []);
    const head = Number.parseInt(headHex, 16);
    const from = Math.max(0, head - 80_000);

    const [poolGradLogs, sweptLogs] = await Promise.all([
      rpc<RpcLog[]>(rpcUrl, "eth_getLogs", [
        {
          address: PONS_FACTORY_V2,
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + head.toString(16),
          topics: [POOL_GRADUATED_TOPIC0],
        },
      ]),
      rpc<RpcLog[]>(rpcUrl, "eth_getLogs", [
        {
          address: PONS_FACTORY_V2,
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + head.toString(16),
          topics: [LAUNCH_SWEPT_TOPIC0],
        },
      ]),
    ]);

    const seen = new Set<string>();
    const tokens: PonsToken[] = [];
    const now = Date.now();

    for (const log of [...poolGradLogs, ...sweptLogs]) {
      const topics = log.topics || [];
      const topic0 = topics[0]?.toLowerCase();
      if (topic0 !== POOL_GRADUATED_TOPIC0 && topic0 !== LAUNCH_SWEPT_TOPIC0) continue;

      const token = topicToAddress(topics[1]);
      if (!token || isProtocol(token)) continue;

      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const blockNumber = log.blockNumber ? Number.parseInt(log.blockNumber, 16) : 0;
      const estimatedTs = now - ((head - blockNumber) / 10) * 1000;
      const ageSec = Math.floor((now - estimatedTs) / 1000);

      if (ageSec >= MAX_AGE_SEC) continue;

      tokens.push({
        token,
        deployer: "0x0000000000000000000000000000000000000000",
        factory: PONS_FACTORY_V2,
        blockNumber,
        txHash: log.transactionHash || "",
        timestampMs: estimatedTs,
        chain: "robinhood",
        pad: "PONS",
        graduated: true,
        ageSec,
        pool: "0x0",
      });
    }

    rpcCache = { tokens, at: Date.now() };

    return {
      tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail: `${tokens.length} RPC grads`,
      },
    };
  } catch (err) {
    if (rpcCache) {
      return {
        tokens: rpcCache.tokens,
        health: {
          name,
          ok: true,
          hits: 1,
          attempts: 1,
          ms: Date.now() - t0,
          detail: `${rpcCache.tokens.length} RPC grads (last good)`,
        },
      };
    }

    return {
      tokens: [],
      health: {
        name,
        ok: false,
        hits: 0,
        attempts: 1,
        ms: Date.now() - t0,
        detail: err instanceof Error ? err.message : "unknown error",
      },
    };
  }
}

let bondingCache: { tokens: PonsToken[]; at: number } | null = null;

async function fetchRpcBonding(
  rpcUrl: string
): Promise<{ tokens: PonsToken[]; health: HealthSource }> {
  const name = "RPC bonding";
  const t0 = Date.now();

  if (bondingCache && Date.now() - bondingCache.at < CACHE_MS) {
    return {
      tokens: bondingCache.tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail: `${bondingCache.tokens.length} bonding (cached)`,
      },
    };
  }

  try {
    const headHex = await rpc<string>(rpcUrl, "eth_blockNumber", []);
    const head = Number.parseInt(headHex, 16);
    const from = Math.max(0, head - 80_000);

    const launchLogs = await rpc<RpcLog[]>(rpcUrl, "eth_getLogs", [
      {
        address: PONS_FACTORY_V2,
        fromBlock: "0x" + from.toString(16),
        toBlock: "0x" + head.toString(16),
        topics: [TOKEN_LAUNCHED_TOPIC0],
      },
    ]);

    const seen = new Set<string>();
    const tokens: PonsToken[] = [];
    const now = Date.now();

    for (const log of launchLogs) {
      const topics = log.topics || [];
      const topic0 = topics[0]?.toLowerCase();
      if (topic0 !== TOKEN_LAUNCHED_TOPIC0) continue;

      const token = topicToAddress(topics[1]);
      if (!token || isProtocol(token)) continue;

      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const blockNumber = log.blockNumber ? Number.parseInt(log.blockNumber, 16) : 0;
      const estimatedTs = now - ((head - blockNumber) / 10) * 1000;
      const ageSec = Math.floor((now - estimatedTs) / 1000);

      if (ageSec >= MAX_AGE_SEC) continue;

      tokens.push({
        token,
        deployer: "0x0000000000000000000000000000000000000000",
        factory: PONS_FACTORY_V2,
        blockNumber,
        txHash: log.transactionHash || "",
        timestampMs: estimatedTs,
        chain: "robinhood",
        pad: "PONS",
        graduated: false,
        ageSec,
      });
    }

    bondingCache = { tokens, at: Date.now() };

    let detail = `${tokens.length} bonding`;
    if (tokens.length === 0) {
      if (launchLogs.length === 0) {
        detail = "0 bonding (no logs in block window)";
      } else {
        detail = "0 bonding (all filtered or parse miss)";
      }
    }

    return {
      tokens,
      health: {
        name,
        ok: true,
        hits: 1,
        attempts: 1,
        ms: Date.now() - t0,
        detail,
      },
    };
  } catch (err) {
    if (bondingCache) {
      return {
        tokens: bondingCache.tokens,
        health: {
          name,
          ok: true,
          hits: 1,
          attempts: 1,
          ms: Date.now() - t0,
          detail: `${bondingCache.tokens.length} bonding (last good)`,
        },
      };
    }

    return {
      tokens: [],
      health: {
        name,
        ok: false,
        hits: 0,
        attempts: 1,
        ms: Date.now() - t0,
        detail: err instanceof Error ? err.message : "unknown error",
      },
    };
  }
}

export async function fetchPonsTokens(): Promise<{
  tokens: PonsToken[];
  health: HealthSource[];
}> {
  const rpcUrl = process.env.ROBINHOOD_RPC_URL;
  const health: HealthSource[] = [];

  const catalogResult = await fetchCatalog();
  health.push(catalogResult.health);

  let rpcGradTokens: PonsToken[] = [];
  let rpcBondingTokens: PonsToken[] = [];
  
  if (rpcUrl) {
    const [rpcGradResult, rpcBondingResult] = await Promise.all([
      fetchRpcGraduations(rpcUrl),
      fetchRpcBonding(rpcUrl),
    ]);
    health.push(rpcGradResult.health);
    health.push(rpcBondingResult.health);
    rpcGradTokens = rpcGradResult.tokens;
    rpcBondingTokens = rpcBondingResult.tokens;
  } else {
    health.push({
      name: "RPC graduations",
      ok: false,
      hits: 0,
      attempts: 0,
      ms: 0,
      detail: "rpc not wired",
    });
    health.push({
      name: "RPC bonding",
      ok: false,
      hits: 0,
      attempts: 0,
      ms: 0,
      detail: "rpc not wired",
    });
  }

  const tokenMap = new Map<string, PonsToken>();

  for (const token of [...catalogResult.tokens, ...rpcGradTokens, ...rpcBondingTokens]) {
    const key = token.token.toLowerCase();
    const existing = tokenMap.get(key);

    if (!existing) {
      tokenMap.set(key, token);
    } else if (token.graduated && !existing.graduated) {
      tokenMap.set(key, token);
    } else if (token.name && !existing.name) {
      tokenMap.set(key, { ...existing, name: token.name, symbol: token.symbol, logo: token.logo });
    }
  }

  const tokens = Array.from(tokenMap.values());

  for (const token of tokens) {
    if (token.ageSec == null && token.timestampMs) {
      token.ageSec = Math.floor((Date.now() - token.timestampMs) / 1000);
    }

    const moving = isMoving(token.vol1hUsd, token.buyPct, token.liqUsd, token.ageSec);
    token.moving = moving;

    token.heat = heatScore({
      ageSec: token.ageSec,
      buyPct: token.buyPct,
      vol1hUsd: token.vol1hUsd,
      mcapUsd: token.mcapUsd,
      liqUsd: token.liqUsd,
      moving,
      pad: token.pad,
      curveFillPct: token.curveFillPct,
    });
  }

  return { tokens, health };
}
