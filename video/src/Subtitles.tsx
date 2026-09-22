import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { INTER } from "./fonts";
import { SUBTITLES, SCENE_ORDER, SCENE_DURATIONS, CROSSFADE } from "./constants";

type SubtitleEntry = { text: string; start: number; end: number };
type GlobalEntry = { text: string; startFrame: number; endFrame: number };

function buildGlobalEntries(): GlobalEntry[] {
  const entries: GlobalEntry[] = [];
  let globalOffset = 0;
  SCENE_ORDER.forEach((key, i) => {
    const dur = SCENE_DURATIONS[key as keyof typeof SCENE_DURATIONS];
    if (key in SUBTITLES) {
      const scenes = SUBTITLES[key as keyof typeof SUBTITLES] as readonly SubtitleEntry[];
      for (const s of scenes) {
        entries.push({
          text: s.text,
          startFrame: globalOffset + s.start,
          endFrame: globalOffset + s.end,
        });
      }
    }
    globalOffset += dur - (i < SCENE_ORDER.length - 1 ? CROSSFADE : 0);
  });
  return entries;
}

const GLOBAL_ENTRIES = buildGlobalEntries();

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const active = GLOBAL_ENTRIES.find((e) => frame >= e.startFrame && frame < e.endFrame);
  if (!active) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", zIndex: 50 }}>
      <div
        style={{
          background: "rgba(14, 13, 9, 0.82)",
          backdropFilter: "blur(8px)",
          borderRadius: 10,
          padding: "12px 28px",
          marginBottom: 52,
          maxWidth: 1600,
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 36,
            fontWeight: 600,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
