export type Chain = "robinhood" | "base" | "solana";
export type Pad = "PONS" | "PUMP" | "O1" | "LONG";

export interface PonsToken {
  token: string;
  name?: string;
  symbol?: string;
  deployer: string;
  factory: string;
  blockNumber: number;
  txHash: string;
  timestampMs: number | null;
  chain: Chain;
  pad: Pad;
  mcapUsd?: number;
  liqUsd?: number;
  vol1hUsd?: number;
  buyPct?: number;
  logo?: string;
  graduated: boolean;
  curveFillPct?: number;
  ageSec?: number;
  heat?: number;
  moving?: boolean;
  pool?: string;
}

export interface HeatInput {
  ageSec?: number;
  buyPct?: number;
  vol1hUsd?: number;
  mcapUsd?: number;
  liqUsd?: number;
  moving?: boolean;
  pad?: Pad;
  curveFillPct?: number;
  inTaxWindow?: boolean;
  sameNameCopies?: number;
  bundlePct?: number;
  sniperPct?: number;
  riskLevel?: "GREEN" | "YELLOW" | "RED";
}

export interface HealthSource {
  name: string;
  ok: boolean;
  hits: number;
  attempts: number;
  ms: number;
  detail: string;
}

export interface DataResponse {
  tokens: PonsToken[];
  health: HealthSource[];
  timestamp: number;
}

export type FilterType = "all" | "new" | "bonding" | "almost-bonded" | "graduated" | "heat200";
export type SortType = "heat" | "newest" | "mcap" | "curve";
