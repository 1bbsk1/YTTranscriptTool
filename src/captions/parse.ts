import { fetch } from "undici";
import he from "he";

export class NoSubtitlesError extends Error {
  code = "NO_SUBTITLES";
  constructor(message = "No subtitles available") {
    super(message);
    this.name = "NoSubtitlesError";
  }
}

const hasAsrKind = (kind?: string): boolean => Boolean(kind && kind.includes("asr"));

type PlayerCaptions = {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        baseUrl: string;
        languageCode?: string;
        kind?: string;
      }>;
    };
  };
};

export const extractCaptionUrl = (data: PlayerCaptions, lang: string): string => {
  const tracks =
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  for (const track of tracks) {
    if (track.languageCode === lang && hasAsrKind(track.kind)) {
      return track.baseUrl;
    }
  }

  throw new NoSubtitlesError();
};

export const parseSrv3XmlToText = (xml: string): string => {
  const paragraphs: string[] = [];

  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
  let paragraphMatch: RegExpExecArray | null;

  while ((paragraphMatch = paragraphRegex.exec(xml)) !== null) {
    const content = paragraphMatch[1];
    const words: string[] = [];

    const wordRegex = /<s[^>]*>([\s\S]*?)<\/s>/g;
    let wordMatch: RegExpExecArray | null;

    while ((wordMatch = wordRegex.exec(content)) !== null) {
      const text = he.decode(wordMatch[1].trim());
      if (text) {
        words.push(text);
      }
    }

    if (words.length > 0) {
      paragraphs.push(words.join(" "));
    }
  }

  return paragraphs.join(" ");
};

export const downloadSubsText = async (url: string): Promise<string> => {
  const finalUrl = `${url}&fmt=srv3`;
  const response = await fetch(finalUrl);

  if (!response.ok) {
    throw new Error(`Failed to download captions: HTTP ${response.status}`);
  }

  const xml = await response.text();
  return parseSrv3XmlToText(xml);
};
