#!/usr/bin/env tsx
import { config } from "../config.js";
import { fetchSubsAndSave } from "../flows/fetchSingle.js";
import { logger } from "../logger.js";

const usage = "Usage: npm run fetch -- <VIDEO_ID> [lang] [channel]\n       tsx src/cli/fetchSubs.ts <VIDEO_ID> [lang] [channel]\n       Options: -h, --help";

export type FetchArgs =
  | { help: true }
  | { help: false; videoId: string; lang: string; channel: string };

export const parseFetchArgs = (argv: string[]): FetchArgs => {
  if (argv.includes("-h") || argv.includes("--help")) {
    return { help: true };
  }

  const [videoIdArg, langArg, channelArg] = argv;
  if (!videoIdArg) {
    throw new Error(usage);
  }

  return {
    help: false,
    videoId: videoIdArg,
    lang: langArg || config.defaultLang,
    channel: channelArg || "UnknownChannel"
  };
};

export const main = async () => {
  let parsed: FetchArgs;
  try {
    parsed = parseFetchArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error));
    process.exit(1);
    return;
  }

  if (parsed.help) {
    console.log(usage);
    process.exit(0);
    return;
  }

  const { videoId, lang, channel } = parsed;

  const outcome = await fetchSubsAndSave({ videoId, lang, channel });
  if (outcome.status === "no_subs") {
    logger.warn("Exiting with NO_SUBTITLES code");
    process.exit(100);
  }
  if (outcome.status === "error") {
    logger.error("Exiting with general error");
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
