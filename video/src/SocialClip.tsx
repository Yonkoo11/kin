import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./constants";
import { SERIF, MONO, INTER } from "./fonts";

// Watched muted, on a phone, while scrolling. One fact, one line, one address.
export const SocialClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const exit = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const step = (i: number) =>
    interpolate(frame, [26 + i * 14, 52 + i * 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.paper,
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
      }}
    >
      <div style={{ width: 860, opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [22, 0])}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 30, color: COLORS.accent, marginBottom: 28 }}>
          Kin
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 92,
            color: COLORS.ink,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          Someone has to tell everyone.
        </div>
        <div style={{ height: 1, background: COLORS.rule, margin: "44px 0 34px", opacity: step(0) }} />
        <div style={{ fontFamily: INTER, fontSize: 38, color: COLORS.ink2, lineHeight: 1.45, opacity: step(1) }}>
          Of seven organisations we read, exactly one accepts email.
        </div>
        <div style={{ fontFamily: INTER, fontSize: 38, color: COLORS.ink2, lineHeight: 1.45, marginTop: 20, opacity: step(2) }}>
          Kin finds out which, and writes to them the way they take.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: COLORS.ink, marginTop: 56, opacity: step(3) }}>
          acrobatic-condor-542.convex.site
        </div>
      </div>
    </AbsoluteFill>
  );
};
