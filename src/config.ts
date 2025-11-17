import dotenv from "dotenv";

dotenv.config();

type CooldownWindow = { minSeconds: number; maxSeconds: number };

export type LogLevel = "debug" | "info" | "warn" | "error";

export type AppConfig = {
  apiKeys: string[];
  clientVersions: string[];
  userAgents: string[];
  defaultLang: string;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  shortCooldown: CooldownWindow;
  longCooldown: CooldownWindow;
  softErrorLimit: number;
  hardErrorLimit: number;
  logLevel: LogLevel;
};

const DEFAULT_CLIENT_VERSIONS = [
  "2.20210721.00.00",
  "2.20210812.07.00",
  "2.20210909.07.00",
  "2.20211012.00.00"
];

const DEFAULT_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)"
];

const parseList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const firstNonEmpty = (preferred: string[], fallback: string[]): string[] =>
  preferred.length > 0 ? preferred : fallback;

const parseLogLevel = (value: string | undefined): LogLevel => {
  if (!value) return "info";
  const normalized = value.toLowerCase();
  if (["debug", "info", "warn", "error"].includes(normalized)) {
    return normalized as LogLevel;
  }
  return "info";
};

export const config: AppConfig = {
  apiKeys: parseList(process.env.API_KEYS),
  clientVersions: firstNonEmpty(parseList(process.env.CLIENT_VERSIONS), DEFAULT_CLIENT_VERSIONS),
  userAgents: firstNonEmpty(parseList(process.env.USER_AGENTS), DEFAULT_USER_AGENTS),
  defaultLang: process.env.LANG || "ru",
  minDelaySeconds: Number(process.env.MIN_DELAY ?? 1.5),
  maxDelaySeconds: Number(process.env.MAX_DELAY ?? 3.5),
  shortCooldown: { minSeconds: 60, maxSeconds: 90 },
  longCooldown: { minSeconds: 300, maxSeconds: 420 },
  softErrorLimit: 2,
  hardErrorLimit: 3,
  logLevel: parseLogLevel(process.env.LOG_LEVEL)
};

export const requireApiKeys = (): string[] => {
  if (config.apiKeys.length === 0) {
    throw new Error("API_KEYS is empty. Set API_KEYS in .env (comma-separated).");
  }
  return config.apiKeys;
};
