import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AUDIO_DURATIONS,
  AUDIO_FILES,
  COLORS,
  CROSSFADE,
  FPS,
  SCENE_DURATIONS,
  VIDEO_FILES,
} from "./constants";
import { Open } from "./scenes/Open";
import { Close } from "./scenes/Close";
import { Recording } from "./scenes/Recording";
import { Subtitles } from "./Subtitles";

// The envelope fades against the AUDIO length, not the scene length. In gap mode the
// scene outlasts its narration, so keying the fade to the scene would cut the last
// sentence off mid-word.
const SceneAudio: React.FC<{ src: string; audioDuration: number }> = ({ src, audioDuration }) => (
  <Audio
    src={staticFile(src)}
    volume={(f) => {
      const fadeIn = interpolate(f, [0, Math.round(FPS * 0.3)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const fadeOut = interpolate(f, [audioDuration - FPS, audioDuration], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return Math.min(fadeIn, fadeOut);
    }}
  />
);

// Order here must match SCENE_ORDER in constants.ts, which Subtitles.tsx walks.
const scenes = [
  { id: "open", dur: SCENE_DURATIONS.open, node: <Open /> },
  {
    id: "landing",
    dur: SCENE_DURATIONS.landing,
    node: <Recording src={VIDEO_FILES.landing} />,
    audio: { src: AUDIO_FILES.landing, dur: AUDIO_DURATIONS.landing },
  },
  {
    id: "judge",
    dur: SCENE_DURATIONS.judge,
    node: <Recording src={VIDEO_FILES.judge} />,
    audio: { src: AUDIO_FILES.judge, dur: AUDIO_DURATIONS.judge },
  },
  {
    id: "close",
    dur: SCENE_DURATIONS.close,
    node: <Close />,
    audio: { src: AUDIO_FILES.close, dur: AUDIO_DURATIONS.close },
  },
] as const;

export const MainVideo: React.FC = () => {
  const timing = linearTiming({ durationInFrames: CROSSFADE });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <TransitionSeries>
        {scenes.flatMap((scene, i) => {
          const els: React.ReactNode[] = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.dur}>
              {scene.node}
              {"audio" in scene && scene.audio ? (
                <SceneAudio src={scene.audio.src} audioDuration={scene.audio.dur} />
              ) : null}
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1) {
            els.push(
              <TransitionSeries.Transition
                key={`t-${scene.id}`}
                presentation={fade()}
                timing={timing}
              />,
            );
          }
          return els;
        })}
      </TransitionSeries>
      <Subtitles />
    </AbsoluteFill>
  );
};
