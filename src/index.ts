import { config, requireApiKeys } from "./config.js";
import { logger } from "./logger.js";

const bootstrap = (): void => {
  try {
    const keys = requireApiKeys();
    logger.info(`Loaded API keys`, { count: keys.length, lang: config.defaultLang });
    logger.info(`Ready to port`, {
      clientVersions: config.clientVersions.length,
      userAgents: config.userAgents.length,
      logLevel: config.logLevel
    });
  } catch (error) {
    logger.error("Missing required configuration", { error: String(error) });
    process.exit(1);
  }
};

const main = async (): Promise<void> => {
  bootstrap();
  logger.info("TS scaffold is ready. Next steps: port single-video fetch + batch + export.");
};

main().catch((error) => {
  logger.error("Fatal error during bootstrap", { error: String(error) });
  process.exit(1);
});
