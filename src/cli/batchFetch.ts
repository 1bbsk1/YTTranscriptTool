#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { fetchSubsAndSave } from "../flows/fetchSingle.js";
import { logger } from "../logger.js";
import { randomBetween } from "../utils/random.js";
import { sleep } from "../utils/sleep.js";

const usage = "Usage: npm run batch\n       tsx src/cli/batchFetch.ts\n       Options: -h, --help";

type DbEntry = {
  channel: string;
  video_id: string;
  status: "pending" | "success" | "error" | "no_subs";
  tries: number;
  last_attempt: string | null;
  error: string | null;
  captions_lang?: string | null;
};

const DB_PATH = "video_db.json";

const loadDb = async (): Promise<DbEntry[]> => {
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
};

const saveDb = async (data: DbEntry[]): Promise<void> => {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(DB_PATH, json, { encoding: "utf8" });
};

const isValid = async (entry: DbEntry): Promise<boolean> => {
  const channel = entry.channel || "UnknownChannel";
  const filePath = path.join("video_data", channel, `${entry.video_id}.json`);
  try {
    await fs.access(filePath);
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    return Boolean(
      data.title &&
        data.text &&
        Number.isInteger(data.views) &&
        typeof data.duration === "number" &&
        data.views > 0
    );
  } catch {
    return false;
  }
};

const applyCooldown = async (errorStreak: number): Promise<number> => {
  if (errorStreak === config.softErrorLimit) {
    const cooldown = randomBetween(
      config.shortCooldown.minSeconds,
      config.shortCooldown.maxSeconds
    );
    logger.warn(`Errors in a row — short pause ${cooldown.toFixed(1)}s`, { errorStreak });
    await sleep(cooldown * 1000);
  } else if (errorStreak >= config.hardErrorLimit) {
    const cooldown = randomBetween(config.longCooldown.minSeconds, config.longCooldown.maxSeconds);
    logger.warn(`Errors in a row — long pause ${cooldown.toFixed(1)}s`, { errorStreak });
    await sleep(cooldown * 1000);
    return 0; // reset streak after long cooldown
  }
  return errorStreak;
};

export const main = async () => {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    console.log(usage);
    process.exit(0);
    return;
  }

  const db = await loadDb();
  let errorStreak = 0;

  for (const entry of db) {
    if (entry.status === "success" && (await isValid(entry))) {
      logger.info(`Already have file`, { channel: entry.channel, videoId: entry.video_id });
      continue;
    }

    const channel = entry.channel || "UnknownChannel";
    const videoId = entry.video_id;
    const lang = config.defaultLang;

    logger.info(`Starting fetch`, { channel, videoId, lang });

    entry.tries += 1;
    entry.last_attempt = new Date().toISOString();

    const outcome = await fetchSubsAndSave({ videoId, lang, channel });

    if (outcome.status === "success" && (await isValid(entry))) {
      logger.info(`Success`, { channel, videoId });
      entry.status = "success";
      entry.error = null;
      entry.captions_lang = outcome.lang;
      errorStreak = 0;
    } else if (outcome.status === "no_subs") {
      logger.warn(`No subtitles`, { channel, videoId });
      entry.status = "no_subs";
      entry.error = "NO_SUBTITLES";
      errorStreak = 0;
    } else {
      const errorMsg = outcome.status === "error" ? outcome.error : "Unknown error";
      logger.error(`Error fetching`, { channel, videoId, error: errorMsg });
      entry.status = "error";
      entry.error = errorMsg;
      errorStreak += 1;
    }

    await saveDb(db);
    errorStreak = await applyCooldown(errorStreak);

    const delay = randomBetween(config.minDelaySeconds, config.maxDelaySeconds);
    logger.info(`Pause before next`, { delaySeconds: Number(delay.toFixed(2)) });
    await sleep(delay * 1000);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error("Fatal error in batch runner", { error: String(error) });
    process.exit(1);
  });
}
