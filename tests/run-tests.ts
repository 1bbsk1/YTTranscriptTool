import { runCaptionsTests } from "./captions.test.js";
import { runYoutubeTests } from "./youtube.test.js";
import { runCliTests } from "./cli.test.js";
import { runE2eTests } from "./e2e.test.js";

const main = async () => {
  runCaptionsTests();
  console.log("✅ captions tests passed");
  await runYoutubeTests();
  console.log("✅ youtube client tests passed");
  runCliTests();
  console.log("✅ cli tests passed");
  await runE2eTests();
  console.log("✅ e2e regression tests passed");
};

main().catch((error) => {
  console.error("❌ Tests failed:", error);
  process.exit(1);
});
