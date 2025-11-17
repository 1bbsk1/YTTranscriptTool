import { config, LogLevel } from "./config.js";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];

const shouldLog = (level: LogLevel): boolean => {
  return levels.indexOf(level) >= levels.indexOf(config.logLevel);
};

const stamp = (): string => new Date().toISOString();

const format = (level: LogLevel, message: string, meta?: unknown): string =>
  meta ? `[${stamp()}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}` : `[${stamp()}] [${level.toUpperCase()}] ${message}`;

export const logger = {
  debug: (message: string, meta?: unknown) => {
    if (shouldLog("debug")) console.debug(format("debug", message, meta));
  },
  info: (message: string, meta?: unknown) => {
    if (shouldLog("info")) console.log(format("info", message, meta));
  },
  warn: (message: string, meta?: unknown) => {
    if (shouldLog("warn")) console.warn(format("warn", message, meta));
  },
  error: (message: string, meta?: unknown) => {
    if (shouldLog("error")) console.error(format("error", message, meta));
  }
};
