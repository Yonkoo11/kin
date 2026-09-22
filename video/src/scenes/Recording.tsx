import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { COLORS, PLAYBACK_RATE } from "../constants";

// Mode B: the capture is silent and narration is a separate track, so the video
// is muted here. Adding audio to both is the usual way this scene ends up doubled.
export const Recording: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
    <OffthreadVideo
      src={staticFile(src)}
      muted
      playbackRate={PLAYBACK_RATE}
      style={{ width: 1920, height: 1080, objectFit: "cover" }}
    />
  </AbsoluteFill>
);
