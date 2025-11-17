import assert from "node:assert/strict";
import { parseFetchArgs } from "../src/cli/fetchSubs.js";
import { parseExportArgs } from "../src/cli/exportCombined.js";
import { config } from "../src/config.js";

export const runCliTests = () => {
  // fetch args
  const parsed = parseFetchArgs(["abc123", "en", "ChannelX"]);
  if (parsed.help) throw new Error("Expected fetch args to not be help");
  assert.equal(parsed.videoId, "abc123");
  assert.equal(parsed.lang, "en");
  assert.equal(parsed.channel, "ChannelX");

  const defaultChannel = parseFetchArgs(["abc123"]);
  if (defaultChannel.help) throw new Error("Expected fetch args to not be help");
  assert.equal(defaultChannel.lang, config.defaultLang, "Should default to config.defaultLang");
  assert.equal(defaultChannel.channel, "UnknownChannel");

  assert.throws(
    () => parseFetchArgs([]),
    /Usage/,
    "Should throw usage when video id missing"
  );

  const help = parseFetchArgs(["--help"]);
  assert.equal(help.help, true);

  // export args
  const expHelp = parseExportArgs(["-h"]);
  assert.equal(expHelp.help, true);

  const channels = parseExportArgs(["C1", "C2"]);
  assert.equal(channels.help, false);
  assert.deepEqual(channels.channels, ["C1", "C2"]);
};
